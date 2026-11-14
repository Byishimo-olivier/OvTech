import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/*
 * Newsletter subscriber storage.
 *  - Brevo contact list (when BREVO_API_KEY and BREVO_LIST_ID are set): survives restarts and
 *    redeploys, and you can also send campaigns from the Brevo dashboard.
 *  - JSON file (fallback): fine locally or on a server with a persistent disk. On Render's free
 *    plan the filesystem is wiped on every redeploy/restart, so use Brevo there.
 */

const BREVO_API = "https://api.brevo.com/v3";

function subscribersFile() {
  return process.env.SUBSCRIBERS_FILE || path.join(__dirname, "data", "subscribers.json");
}

function brevoListId() {
  const id = Number(process.env.BREVO_LIST_ID);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function subscriberStore() {
  return process.env.BREVO_API_KEY && brevoListId() ? "brevo" : "file";
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/* ---------- unsubscribe tokens ---------- */

function tokenSecret() {
  const secret = process.env.UNSUBSCRIBE_SECRET || process.env.EMAIL_PASS || process.env.BREVO_API_KEY;
  if (!secret) {
    throw new Error("Set UNSUBSCRIBE_SECRET so unsubscribe links can be signed.");
  }
  return secret;
}

export function unsubscribeToken(email) {
  return crypto.createHmac("sha256", tokenSecret()).update(normalizeEmail(email)).digest("hex").slice(0, 32);
}

export function verifyUnsubscribeToken(email, token) {
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(String(token || ""));
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

/* ---------- JSON file store ---------- */

// Serialise file writes so two sign-ups at the same moment cannot overwrite each other.
let fileQueue = Promise.resolve();
function withFileLock(task) {
  const run = fileQueue.then(task, task);
  fileQueue = run.catch(() => {});
  return run;
}

async function readFileStore() {
  try {
    return JSON.parse(await fs.readFile(subscribersFile(), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeFileStore(list) {
  const file = subscribersFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  await fs.writeFile(temp, JSON.stringify(list, null, 2));
  await fs.rename(temp, file);
}

/* ---------- Brevo store ---------- */

async function brevo(pathname, options = {}) {
  const response = await fetch(`${BREVO_API}${pathname}`, {
    ...options,
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
      ...options.headers,
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, ok: response.ok, body };
}

function brevoError(action, result) {
  return new Error(`Brevo ${action} failed (${result.status}): ${JSON.stringify(result.body)}`);
}

/* ---------- public API ---------- */

/** Returns { added: true } for a new subscriber, { added: false } if already subscribed. */
export async function addSubscriber(rawEmail) {
  const email = normalizeEmail(rawEmail);

  if (subscriberStore() === "brevo") {
    const listId = brevoListId();
    const existing = await brevo(`/contacts/${encodeURIComponent(email)}`);
    if (existing.ok && existing.body?.listIds?.includes(listId)) {
      return { added: false };
    }
    const created = await brevo("/contacts", {
      method: "POST",
      body: JSON.stringify({ email, listIds: [listId], updateEnabled: true, emailBlacklisted: false }),
    });
    if (!created.ok) throw brevoError("add contact", created);
    return { added: true };
  }

  return withFileLock(async () => {
    const list = await readFileStore();
    if (list.some((entry) => entry.email === email)) {
      return { added: false };
    }
    list.push({ email, subscribedAt: new Date().toISOString() });
    await writeFileStore(list);
    return { added: true };
  });
}

/** Returns true if the address was on the list. */
export async function removeSubscriber(rawEmail) {
  const email = normalizeEmail(rawEmail);

  if (subscriberStore() === "brevo") {
    const result = await brevo(`/contacts/lists/${brevoListId()}/contacts/remove`, {
      method: "POST",
      body: JSON.stringify({ emails: [email] }),
    });
    // Brevo answers 400/404 when the contact is not in the list: treat as "already removed".
    if (!result.ok && result.status !== 400 && result.status !== 404) {
      throw brevoError("remove contact", result);
    }
    return result.ok;
  }

  return withFileLock(async () => {
    const list = await readFileStore();
    const remaining = list.filter((entry) => entry.email !== email);
    if (remaining.length === list.length) return false;
    await writeFileStore(remaining);
    return true;
  });
}

/** All current subscriber email addresses. */
export async function listSubscribers() {
  if (subscriberStore() === "brevo") {
    const emails = [];
    const limit = 500;
    for (let offset = 0; ; offset += limit) {
      const page = await brevo(`/contacts/lists/${brevoListId()}/contacts?limit=${limit}&offset=${offset}`);
      if (!page.ok) throw brevoError("list contacts", page);
      const contacts = page.body?.contacts || [];
      emails.push(...contacts.filter((contact) => !contact.emailBlacklisted).map((contact) => contact.email));
      if (contacts.length < limit) break;
    }
    return emails;
  }

  return (await readFileStore()).map((entry) => entry.email);
}
