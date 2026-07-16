import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { sendEmail } from "./email.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const app = express();
const port = process.env.PORT || 5000;

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

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/contact", async (req, res) => {
  const name = clean(req.body.name);
  const email = clean(req.body.email);
  const service = clean(req.body.service);
  const message = clean(req.body.message);
  const missing = validate({ name, email, service, message });

  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
  }

  try {
    await sendEmail({
      subject: `New OVTECH contact request from ${name}`,
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
    console.error("Contact email failed:", error);
    res.status(500).json({ error: "Could not send your message. Please try again." });
  }
});

app.post("/api/live-chat", async (req, res) => {
  const name = clean(req.body.name) || "Website visitor";
  const email = clean(req.body.email);
  const message = clean(req.body.message);
  const missing = validate({ message });

  if (missing.length > 0) {
    return res.status(400).json({ error: "Please type a message first." });
  }

  try {
    await sendEmail({
      subject: `New OVTECH live chat message from ${name}`,
      replyTo: email,
      text: formatText("New live chat message", {
        Name: name,
        Email: email || "Not provided",
        Message: message,
      }),
    });

    res.json({ ok: true, message: "Chat message sent successfully." });
  } catch (error) {
    console.error("Live chat email failed:", error);
    res.status(500).json({ error: "Could not send your chat message. Please try again." });
  }
});

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`OVTECH server running on http://localhost:${port}`);
});
