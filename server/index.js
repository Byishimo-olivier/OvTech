import "dotenv/config";
import cors from "cors";
import express from "express";
import nodemailer from "nodemailer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));

const requiredEmailConfig = ["EMAIL_USER", "EMAIL_PASS", "MAIL_TO"];

function assertEmailConfig() {
  const missing = requiredEmailConfig.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing email configuration: ${missing.join(", ")}`);
  }
}

function createTransporter() {
  assertEmailConfig();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s/g, ""),
    },
  });
}

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

async function sendEmail({ subject, replyTo, text }) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"OVTECH Website" <${process.env.EMAIL_USER}>`,
    to: process.env.MAIL_TO,
    replyTo: replyTo || process.env.EMAIL_USER,
    subject,
    text,
  });
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
