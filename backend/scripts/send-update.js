// Send an update email to every newsletter subscriber through the running server.
//
//   npm run newsletter -- --subject "Our new product is live" --file update.txt
//   npm run newsletter -- --subject "..." --message "Short text" --url https://your-site.onrender.com
//   npm run newsletter -- --list            (just print the subscriber list)
//
// Needs ADMIN_TOKEN (same value as on the server) in .env or the environment.
// --url defaults to SITE_URL from .env, then http://localhost:5000.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

const baseUrl = (arg("url") || process.env.SITE_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, "");
const token = process.env.ADMIN_TOKEN;

if (!token) {
  console.error("ADMIN_TOKEN is missing. Add it to .env (it must match the server's ADMIN_TOKEN).");
  process.exit(1);
}

const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };

if (process.argv.includes("--list")) {
  const response = await fetch(`${baseUrl}/api/subscribers`, { headers });
  const body = await response.json();
  if (!response.ok) {
    console.error(`Failed (${response.status}):`, body.error || body);
    process.exit(1);
  }
  console.log(`${body.count} subscriber(s):`);
  body.subscribers.forEach((email) => console.log(`  ${email}`));
  process.exit(0);
}

const subject = arg("subject");
const file = arg("file");
const message = file ? await fs.readFile(path.resolve(file), "utf8") : arg("message");

if (!subject || !message) {
  console.error('Usage: npm run newsletter -- --subject "Subject" (--file update.txt | --message "Text") [--url https://site]');
  process.exit(1);
}

console.log(`Sending "${subject}" via ${baseUrl} ...`);
const response = await fetch(`${baseUrl}/api/newsletter`, {
  method: "POST",
  headers,
  body: JSON.stringify({ subject, message }),
});
const body = await response.json();

if (!response.ok && !("sent" in body)) {
  console.error(`Failed (${response.status}):`, body.error || body);
  process.exit(1);
}

console.log(`Sent to ${body.sent} of ${body.total} subscriber(s).`);
if (body.failed?.length) {
  console.log("Failed:", body.failed.join(", "));
  process.exit(1);
}
