import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/*
 * Live chat conversations.
 *
 * Visitor messages are emailed to the team. Each conversation gets its own reply address
 * (e.g. you+chat-<id>@gmail.com); the inbox watcher (chat-inbox.js) turns replies sent to
 * that address into chat messages, which the website widget polls for.
 *
 * Storage is a JSON file. On hosts with a wiped disk (Render free plan) that is fine: the
 * visitor's browser keeps its own copy of the chat, and the inbox watcher re-reads the last
 * few days of replies on startup.
 */

export const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES_PER_CONVERSATION = 300;
const CONVERSATION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function chatsFile() {
  return process.env.CHATS_FILE || path.join(__dirname, "data", "chats.json");
}

/* ---------- ids and reply addresses ---------- */

export function newConversationId() {
  return crypto.randomBytes(12).toString("hex");
}

export function isConversationId(id) {
  return typeof id === "string" && /^[a-f0-9]{24}$/.test(id);
}

/** Short label shown in email subjects so Gmail keeps one thread per conversation. */
export function conversationLabel(id) {
  return id.slice(0, 6).toUpperCase();
}

/** Plus-address on the watched mailbox, e.g. name+chat-<id>@gmail.com (still delivered to name@gmail.com). */
export function chatReplyAddress(id, mailbox = process.env.EMAIL_USER) {
  const [local, domain] = String(mailbox || "").split("@");
  if (!local || !domain) return null;
  return `${local.split("+")[0]}+chat-${id}@${domain}`;
}

export function conversationIdFromAddress(address) {
  const match = /^[^@\s]+\+chat-([a-f0-9]{24})@/i.exec(String(address || ""));
  return match ? match[1].toLowerCase() : null;
}

/** Stable id for a reply email, so re-reading the inbox after a restart never duplicates it. */
export function agentMessageId(emailMessageId) {
  return `e-${crypto.createHash("sha256").update(String(emailMessageId)).digest("hex").slice(0, 20)}`;
}

/* ---------- reply text extraction ---------- */

/** Keep only what the person typed in their email reply: drop quoted history and signatures. */
export function extractReplyText(text) {
  const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
  const kept = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^>/.test(trimmed)) break; // quoted original
    if (/^-{2,}\s*(Original Message|Message d'origine)\s*-{2,}$/i.test(trimmed)) break;
    if (/^_{8,}$/.test(trimmed)) break; // Outlook separator
    if (/^(From|De)\s*:\s/.test(trimmed) && kept.some((l) => l.trim())) break; // Outlook header block
    if (line === "-- " || trimmed === "--") break; // signature delimiter
    kept.push(line);
  }

  return kept
    .join("\n")
    // "On Fri, 14 Nov 2026 at 10:00, Over Rentals <x@gmail.com> wrote:" (often wrapped over 2-3 lines)
    .replace(/(^|\n)[ \t]*(On|Le)\s[\s\S]{0,400}?(wrote|a écrit)\s*:\s*$/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}

/* ---------- storage ---------- */

let state = null;
let loading = null;
let writeChain = Promise.resolve();

async function load() {
  if (state) return state;
  if (!loading) {
    loading = (async () => {
      try {
        const parsed = JSON.parse(await fs.readFile(chatsFile(), "utf8"));
        state = { conversations: parsed.conversations || {} };
      } catch (error) {
        if (error.code !== "ENOENT") console.error("[chat] could not read chats file:", error.message);
        state = { conversations: {} };
      }
      return state;
    })();
  }
  return loading;
}

function save() {
  const file = chatsFile();
  const snapshot = JSON.stringify(state, null, 2);
  writeChain = writeChain
    .then(async () => {
      await fs.mkdir(path.dirname(file), { recursive: true });
      const temp = `${file}.${process.pid}.tmp`;
      await fs.writeFile(temp, snapshot);
      await fs.rename(temp, file);
    })
    .catch((error) => console.error("[chat] could not save chats file:", error.message));
  return writeChain;
}

function prune(conversations) {
  const cutoff = Date.now() - CONVERSATION_TTL_MS;
  for (const [id, conversation] of Object.entries(conversations)) {
    if (new Date(conversation.updatedAt).getTime() < cutoff) delete conversations[id];
  }
}

function publicMessage({ id, from, text, at }) {
  return { id, from, text, at };
}

/**
 * Add a message to a conversation (created on first use).
 * Returns the stored message, or null if it was a duplicate reply email.
 */
export async function addMessage(conversationId, { from, text, name, email, at, emailMessageId }) {
  if (!isConversationId(conversationId)) throw new Error("Invalid conversation id");
  const { conversations } = await load();
  const now = new Date().toISOString();

  const conversation = (conversations[conversationId] ||= {
    id: conversationId,
    name: "",
    email: "",
    createdAt: now,
    updatedAt: now,
    messages: [],
  });
  if (name) conversation.name = name;
  if (email) conversation.email = email;

  const id = emailMessageId ? agentMessageId(emailMessageId) : crypto.randomUUID();
  if (conversation.messages.some((message) => message.id === id)) return null;

  const timestamp = at && !Number.isNaN(new Date(at).getTime()) ? new Date(at).toISOString() : now;
  const message = { id, from, text: String(text).slice(0, MAX_MESSAGE_LENGTH), at: timestamp };

  conversation.messages.push(message);
  conversation.messages.sort((a, b) => a.at.localeCompare(b.at));
  conversation.messages = conversation.messages.slice(-MAX_MESSAGES_PER_CONVERSATION);
  conversation.updatedAt = now;

  prune(conversations);
  await save();
  return publicMessage(message);
}

export async function getMessages(conversationId) {
  if (!isConversationId(conversationId)) return [];
  const { conversations } = await load();
  return (conversations[conversationId]?.messages || []).map(publicMessage);
}

export async function getConversation(conversationId) {
  if (!isConversationId(conversationId)) return null;
  const { conversations } = await load();
  return conversations[conversationId] || null;
}

/** For tests: forget the in-memory copy so the next call re-reads the file. */
export function resetChatCache() {
  state = null;
  loading = null;
}
