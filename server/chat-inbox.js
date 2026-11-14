import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { addMessage, conversationIdFromAddress, extractReplyText } from "./chat.js";
import { getAdminAddress, resolveIPv4 } from "./email.js";

/*
 * Watches the Gmail mailbox (EMAIL_USER / EMAIL_PASS over IMAP) for replies to live chat
 * emails and adds them to the matching conversation.
 *
 * A reply counts when it is sent TO a chat reply address (you+chat-<id>@gmail.com) and FROM
 * one of the team addresses (MAIL_TO, EMAIL_USER, CHAT_AGENT_EMAILS). The visitor notification
 * itself is also sent to that address, so it is marked with a header and skipped.
 */

export const CHAT_NOTIFICATION_HEADER = "X-Over-Rentals-Chat";
const BACKFILL_DAYS = 3;
const POLL_MS = 10 * 1000;
const MAX_RETRY_MS = 5 * 60 * 1000;

let started = false;

export function chatInboxEnabled() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS) && process.env.CHAT_INBOX !== "off";
}

function agentAddresses() {
  return new Set(
    [getAdminAddress(), process.env.EMAIL_USER, ...String(process.env.CHAT_AGENT_EMAILS || "").split(",")]
      .map((address) => String(address || "").trim().toLowerCase())
      .filter(Boolean),
  );
}

export function startChatInbox() {
  if (started || !chatInboxEnabled()) return;
  started = true;
  runForever();
}

async function runForever() {
  let retryMs = 5000;
  for (;;) {
    try {
      await watchSession();
      retryMs = 5000;
    } catch (error) {
      console.error("[chat-inbox] connection failed:", error.code || "", error.message);
    }
    await new Promise((resolve) => setTimeout(resolve, retryMs));
    retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
  }
}

async function pickMailbox(client) {
  if (process.env.CHAT_IMAP_MAILBOX) return process.env.CHAT_IMAP_MAILBOX;
  // Gmail's "All Mail" holds every message whatever its labels; its name depends on the language.
  const mailboxes = await client.list();
  return mailboxes.find((box) => box.specialUse === "\\All")?.path || "INBOX";
}

/** One IMAP connection: re-read recent replies, then react to new mail until the connection drops. */
async function watchSession() {
  const host = process.env.IMAP_HOST || "imap.gmail.com";
  const client = new ImapFlow({
    host: await resolveIPv4(host),
    servername: host,
    port: Number(process.env.IMAP_PORT || 993),
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS.replace(/\s/g, "") },
    logger: false,
  });
  client.on("error", (error) => console.error("[chat-inbox] error:", error.message));

  await client.connect();
  let timer;
  try {
    const mailbox = await pickMailbox(client);
    await client.mailboxOpen(mailbox, { readOnly: true });

    const since = new Date(Date.now() - BACKFILL_DAYS * 24 * 60 * 60 * 1000);
    let lastUid = await processUids(client, await client.search({ since }, { uid: true }), 0);
    console.log(`[chat-inbox] watching "${mailbox}" for live chat replies`);

    await new Promise((resolve) => {
      let busy = false;
      let again = false;

      const check = async () => {
        if (busy) {
          again = true;
          return;
        }
        busy = true;
        try {
          do {
            again = false;
            const uids = await client.search({ uid: `${lastUid + 1}:*` }, { uid: true });
            lastUid = await processUids(client, uids, lastUid);
          } while (again);
        } catch (error) {
          console.error("[chat-inbox] check failed:", error.message);
          client.close();
        } finally {
          busy = false;
        }
      };

      client.on("exists", check); // new mail (pushed via IMAP IDLE)
      timer = setInterval(check, POLL_MS); // safety net if a push is missed
      client.on("close", resolve);
    });
  } finally {
    clearInterval(timer);
    try {
      await client.logout();
    } catch {
      // already closed
    }
  }
}

async function processUids(client, uids, lastUid) {
  const fresh = (uids || []).filter((uid) => uid > lastUid).sort((a, b) => a - b);
  if (fresh.length === 0) return lastUid;

  const agents = agentAddresses();
  const replies = [];

  for await (const message of client.fetch(
    fresh.join(","),
    { uid: true, envelope: true, headers: [CHAT_NOTIFICATION_HEADER] },
    { uid: true },
  )) {
    const envelope = message.envelope || {};
    const isNotification = message.headers?.toString().toLowerCase().includes(CHAT_NOTIFICATION_HEADER.toLowerCase());
    const from = envelope.from?.[0]?.address?.toLowerCase();
    if (isNotification || !from || !agents.has(from)) continue;

    const recipients = [...(envelope.to || []), ...(envelope.cc || [])];
    const conversationId = recipients.map((r) => conversationIdFromAddress(r.address)).find(Boolean);
    if (conversationId) {
      replies.push({ uid: message.uid, conversationId, messageId: envelope.messageId || `uid-${message.uid}` });
    }
  }

  for (const reply of replies) {
    try {
      const { source } = await client.fetchOne(reply.uid, { source: true }, { uid: true });
      const parsed = await simpleParser(source);
      const text = extractReplyText(parsed.text || "");
      if (!text) continue;

      const stored = await addMessage(reply.conversationId, {
        from: "agent",
        text,
        at: parsed.date,
        emailMessageId: reply.messageId,
      });
      if (stored) console.log(`[chat-inbox] reply added to chat ${reply.conversationId.slice(0, 6)}`);
    } catch (error) {
      console.error("[chat-inbox] could not read reply:", error.message);
    }
  }

  return fresh[fresh.length - 1];
}
