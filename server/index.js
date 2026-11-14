import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { emailProvider, getAdminAddress, sendEmail } from "./email.js";
import {
  MAX_MESSAGE_LENGTH,
  addMessage,
  chatReplyAddress,
  conversationLabel,
  getMessages,
  isConversationId,
  newConversationId,
} from "./chat.js";
import { CHAT_NOTIFICATION_HEADER, chatInboxEnabled, startChatInbox } from "./chat-inbox.js";
import {
  addSubscriber,
  isValidEmail,
  listSubscribers,
  normalizeEmail,
  removeSubscriber,
  subscriberStore,
  unsubscribeToken,
  verifyUnsubscribeToken,
} from "./subscribers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env"), override: true });
const app = express();
const port = process.env.PORT || 5000;

// Render (and most hosts) sit behind one proxy; this makes req.ip and req.protocol correct.
app.set("trust proxy", 1);
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));

function clean(value) {
  return String(value || "").trim();
}

function validate(fields) {
  return Object.entries(fields)
    .filter(([, value]) => clean(value).length === 0)
    .map(([key]) => key);
}

function formatText(title, fields) {
  const body = Object.entries(fields)
    .map(([label, value]) => `${label}: ${clean(value)}`)
    .join("\n");

  return `${title}\n\n${body}`;
}

/** Simple in-memory limiter per IP, so the forms cannot be used to spam inboxes. */
function rateLimit({ windowMs, max }) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    if (hits.size > 5000) {
      for (const [key, entry] of hits) {
        if (now - entry.start > windowMs) hits.delete(key);
      }
    }

    const entry = hits.get(req.ip);
    if (!entry || now - entry.start > windowMs) {
      hits.set(req.ip, { start: now, count: 1 });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ error: "Too many requests. Please try again in a few minutes." });
    }
    return next();
  };
}

const formLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 8 });

function publicBaseUrl(req) {
  const configured = process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL;
  return (configured || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
}

function unsubscribeLink(req, email) {
  const params = new URLSearchParams({ email, token: unsubscribeToken(email) });
  return `${publicBaseUrl(req)}/api/unsubscribe?${params}`;
}

function requireAdmin(req, res, next) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return res.status(503).json({ error: "ADMIN_TOKEN is not configured on the server." });
  }
  if (req.get("authorization") !== `Bearer ${token}`) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  return next();
}

function simplePage(title, message) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | Over Rentals</title></head>
<body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#f7f8fa;color:#111827">
<main style="max-width:520px;margin:80px auto;padding:32px;background:#fff;border:1px solid #e5e7eb;border-radius:12px">
<h1 style="margin:0 0 12px;font-size:24px">${title}</h1><p style="margin:0 0 24px;color:#374151;line-height:1.6">${message}</p>
<a href="/" style="color:#2f56d6;font-weight:600">Back to Over Rentals</a></main></body></html>`;
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, emailProvider: emailProvider(), subscriberStore: subscriberStore() });
});

app.post("/api/contact", formLimiter, async (req, res) => {
  const name = clean(req.body.name);
  const email = clean(req.body.email);
  const service = clean(req.body.service);
  const message = clean(req.body.message);
  const missing = validate({ name, email, service, message });

  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
  }

  if (!isValidEmail(normalizeEmail(email))) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  try {
    await sendEmail({
      subject: `New Over Rentals contact request from ${name}`,
      replyTo: email,
      text: formatText("New contact form submission", {
        Name: name,
        Email: email,
        Service: service,
        Message: message,
      }),
    });

    res.json({ ok: true, message: "Message sent successfully." });
  } catch (error) {
    console.error("Contact email failed:", error.message);
    res.status(500).json({ error: "Could not send your message. Please try again." });
  }
});

/* ----- Live chat: visitor messages go to email, email replies come back into the chat ----- */

const chatSendLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 30 });
const chatPollLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

app.post("/api/chat/messages", chatSendLimiter, async (req, res) => {
  const name = clean(req.body.name).slice(0, 80) || "Website visitor";
  const rawEmail = normalizeEmail(req.body.email);
  const email = isValidEmail(rawEmail) ? rawEmail : "";
  const message = clean(req.body.message);

  if (!message) {
    return res.status(400).json({ error: "Please type a message first." });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `Please keep messages under ${MAX_MESSAGE_LENGTH} characters.` });
  }

  const conversationId = isConversationId(req.body.conversationId) ? req.body.conversationId : newConversationId();
  const replyAddress = chatInboxEnabled() ? chatReplyAddress(conversationId) : null;
  const admin = getAdminAddress();

  try {
    await sendEmail({
      // Sent to the chat's own reply address, so pressing "Reply" in Gmail always lands there.
      to: replyAddress || admin,
      cc: replyAddress && normalizeEmail(admin) !== normalizeEmail(process.env.EMAIL_USER) ? admin : undefined,
      replyTo: replyAddress || email || undefined,
      headers: { [CHAT_NOTIFICATION_HEADER]: "visitor" },
      subject: `Live chat: ${name} [#${conversationLabel(conversationId)}]`,
      text:
        `${name} wrote in the website live chat:

${message}

` +
        `Name: ${name}
Email: ${email || "Not provided"}

---
` +
        (replyAddress
          ? "Reply to this email to answer. Your reply appears in the visitor's chat window within a few seconds."
          : "Chat replies are off (CHAT_INBOX=off), so reply to the visitor by email."),
    });
  } catch (error) {
    console.error("Live chat email failed:", error.message);
    return res.status(500).json({ error: "Could not send your message. Please try again." });
  }

  try {
    const stored = await addMessage(conversationId, { from: "visitor", text: message, name, email });
    return res.json({ ok: true, conversationId, message: stored });
  } catch (error) {
    // The team already has the email; only the server-side copy is missing.
    console.error("Live chat store failed:", error.message);
    return res.json({
      ok: true,
      conversationId,
      message: { id: `local-${Date.now()}`, from: "visitor", text: message, at: new Date().toISOString() },
    });
  }
});

app.get("/api/chat/:id/messages", chatPollLimiter, async (req, res) => {
  if (!isConversationId(req.params.id)) {
    return res.status(400).json({ error: "Invalid conversation." });
  }
  res.set("Cache-Control", "no-store");
  res.json({ messages: await getMessages(req.params.id) });
});

app.post("/api/subscribe", formLimiter, async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  let result;
  try {
    result = await addSubscriber(email);
  } catch (error) {
    console.error("Subscribe failed:", error.message);
    return res.status(500).json({ error: "Could not subscribe you right now. Please try again." });
  }

  if (!result.added) {
    return res.json({ ok: true, alreadySubscribed: true, message: "You are already subscribed." });
  }

  // The subscription is saved; email problems are logged but do not undo it.
  const emails = [
    sendEmail({
      to: email,
      subject: "Welcome to Over Rentals",
      text:
        "Hello,\n\n" +
        "Thank you for subscribing to Over Rentals. You will now receive our latest news, product updates, and offers.\n\n" +
        "We only send emails when we have something useful to share.\n\n" +
        "Best regards,\n" +
        "The Over Rentals Team\n" +
        "Kigali, Rwanda\n\n" +
        `---\nTo stop receiving these emails, unsubscribe here:\n${unsubscribeLink(req, email)}`,
    }),
    sendEmail({
      subject: `New subscriber: ${email}`,
      text:
        "A new person has subscribed to Over Rentals updates.\n\n" +
        `Email: ${email}\n` +
        `Date: ${new Date().toLocaleString("en-GB", { timeZone: "Africa/Kigali" })} (Kigali time)`,
    }),
  ];
  const outcomes = await Promise.allSettled(emails);
  outcomes
    .filter((outcome) => outcome.status === "rejected")
    .forEach((outcome) => console.error("Subscription email failed:", outcome.reason?.message));

  return res.json({ ok: true, message: "Subscribed. Check your inbox for a welcome email." });
});

app.get("/api/unsubscribe", async (req, res) => {
  const email = normalizeEmail(req.query.email);

  if (!isValidEmail(email) || !verifyUnsubscribeToken(email, req.query.token)) {
    return res.status(400).send(simplePage("Invalid link", "This unsubscribe link is not valid. Please use the link from your email."));
  }

  try {
    await removeSubscriber(email);
    const safeEmail = email.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
    return res.send(simplePage("You are unsubscribed", `${safeEmail} will no longer receive Over Rentals updates.`));
  } catch (error) {
    console.error("Unsubscribe failed:", error.message);
    return res.status(500).send(simplePage("Something went wrong", "We could not unsubscribe you. Please try again later."));
  }
});

// ----- Admin: export subscribers and send an update to all of them -----

app.get("/api/subscribers", requireAdmin, async (req, res) => {
  try {
    const subscribers = await listSubscribers();
    res.json({ count: subscribers.length, subscribers });
  } catch (error) {
    console.error("List subscribers failed:", error.message);
    res.status(500).json({ error: "Could not load subscribers." });
  }
});

app.post("/api/newsletter", requireAdmin, async (req, res) => {
  const subject = clean(req.body.subject);
  const message = clean(req.body.message);

  if (!subject || !message) {
    return res.status(400).json({ error: "Both subject and message are required." });
  }

  let subscribers;
  try {
    subscribers = await listSubscribers();
  } catch (error) {
    console.error("Newsletter: list subscribers failed:", error.message);
    return res.status(500).json({ error: "Could not load subscribers." });
  }

  const failed = [];
  // One email per subscriber so each gets a personal unsubscribe link and addresses stay private.
  for (const email of subscribers) {
    try {
      await sendEmail({
        to: email,
        subject,
        replyTo: getAdminAddress(),
        text: `${message}\n\n---\nYou receive this because you subscribed to Over Rentals updates.\nUnsubscribe: ${unsubscribeLink(req, email)}`,
      });
    } catch (error) {
      failed.push(email);
      console.error(`Newsletter to ${email} failed:`, error.message);
    }
  }

  res.json({ ok: failed.length === 0, total: subscribers.length, sent: subscribers.length - failed.length, failed });
});

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Over Rentals server running on http://localhost:${port} (email: ${emailProvider()}, subscribers: ${subscriberStore()})`);
  startChatInbox();
});
