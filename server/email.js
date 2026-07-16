import dns from "node:dns";
import nodemailer from "nodemailer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const requiredEmailConfig = ["EMAIL_USER", "EMAIL_PASS", "MAIL_TO"];

function assertEmailConfig() {
  const missing = requiredEmailConfig.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing email configuration: ${missing.join(", ")}`);
  }
}

function getSmtpPort(smtpHost) {
  const configuredPort = Number(process.env.SMTP_PORT || "");

  if (Number.isFinite(configuredPort) && configuredPort > 0) {
    return configuredPort;
  }

  return smtpHost.includes("gmail") ? 587 : 587;
}

function getSmtpSecure(port, smtpHost) {
  if (process.env.SMTP_SECURE === "true") {
    return true;
  }

  if (process.env.SMTP_SECURE === "false") {
    return false;
  }

  if (smtpHost.includes("gmail")) {
    return false;
  }

  return port === 465;
}

function getSmtpTlsOptions() {
  return {
    minVersion: "TLSv1.2",
    rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
  };
}

export function createTransporter() {
  assertEmailConfig();

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = getSmtpPort(smtpHost);
  const useSecure = getSmtpSecure(smtpPort, smtpHost);

  return nodemailer.createTransport({
    host: smtpHost,
    servername: process.env.SMTP_SERVERNAME || smtpHost,
    port: smtpPort,
    secure: useSecure,
    requireTLS: !useSecure,
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 15000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 15000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
    logger: process.env.NODE_ENV === "development",
    debug: process.env.NODE_ENV === "development",
    lookup(hostname, options, callback) {
      dns.lookup(hostname, { family: 4, all: false }, callback);
    },
    tls: getSmtpTlsOptions(),
    auth: {
      user: process.env.EMAIL_USER,
      pass: String(process.env.EMAIL_PASS || "").replace(/\s/g, ""),
    },
  });
}

export async function sendEmail({ subject, replyTo, text }) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"OVTECH Website" <${process.env.EMAIL_USER}>`,
    to: process.env.MAIL_TO,
    replyTo: replyTo || process.env.EMAIL_USER,
    subject,
    text,
  });
}
