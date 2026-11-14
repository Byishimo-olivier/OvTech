import "./env.js";
import dns from "node:dns";
import net from "node:net";
import nodemailer from "nodemailer";

/*
 * Two ways to send mail:
 *  - Brevo HTTP API (used when BREVO_API_KEY is set). Works on hosts that block SMTP ports,
 *    such as Render's free plan (ports 25/465/587 are blocked there since September 2025).
 *  - SMTP via nodemailer (Gmail by default). Works locally and on hosts that allow SMTP.
 */

export function emailProvider() {
  return process.env.BREVO_API_KEY ? "brevo" : "smtp";
}

/** Where contact / chat / new-subscriber notifications are delivered. */
export function getAdminAddress() {
  return process.env.MAIL_TO || process.env.EMAIL_USER;
}

function getSender() {
  return {
    name: process.env.MAIL_FROM_NAME || "Over Rentals",
    email: process.env.MAIL_FROM || process.env.EMAIL_USER,
  };
}

function assertEmailConfig() {
  const required = emailProvider() === "brevo" ? ["BREVO_API_KEY"] : ["EMAIL_USER", "EMAIL_PASS"];
  const missing = required.filter((key) => !process.env[key]);

  if (!getSender().email) {
    missing.push("MAIL_FROM or EMAIL_USER");
  }

  if (missing.length > 0) {
    throw new Error(`Missing email configuration: ${missing.join(", ")}`);
  }
}

function smtpHostname() {
  return process.env.SMTP_HOST || "smtp.gmail.com";
}

/**
 * Nodemailer ignores `family`/`lookup` options and tries IPv6 addresses too, which fails with
 * ENETUNREACH on servers without IPv6 routing. So we resolve an IPv4 address ourselves.
 */
export async function resolveIPv4(hostname = smtpHostname()) {
  if (net.isIP(hostname)) return hostname;
  try {
    const [address] = await dns.promises.resolve4(hostname);
    if (address) return address;
  } catch {
    // Fall back to the OS resolver below (e.g. hosts file, local DNS quirks).
  }
  const { address } = await dns.promises.lookup(hostname, { family: 4 });
  return address;
}

/**
 * @param {object} [options]
 * @param {string} [options.ip] IPv4 address to connect to. TLS is still verified against the hostname.
 */
export function createTransporter({ ip } = {}) {
  assertEmailConfig();

  const hostname = smtpHostname();
  const port = Number(process.env.SMTP_PORT || 465);
  // Port 465 uses implicit TLS; 587/25 start plain and upgrade with STARTTLS.
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  const verbose = process.env.SMTP_DEBUG === "true";

  const config = {
    host: ip || hostname,
    // Certificate check and SNI use the real hostname even when connecting by IP.
    servername: hostname,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      // Google shows App Passwords as "abcd efgh ijkl mnop"; the spaces are not part of it.
      pass: process.env.EMAIL_PASS.replace(/\s/g, ""),
    },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 15000),
    logger: verbose,
    debug: verbose,
  };

  return nodemailer.createTransport(config);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Minimal HTML version of a plain-text email: escaped, links clickable, line breaks kept. */
export function textToHtml(text) {
  const body = escapeHtml(text)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    .replace(/\n/g, "<br>");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#111827">${body}</div>`;
}

async function sendWithBrevo({ to, cc, subject, text, html, replyTo, headers }) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: getSender(),
      to: [{ email: to }],
      ...(cc ? { cc: [{ email: cc }] } : {}),
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
      ...(headers ? { headers } : {}),
      subject,
      textContent: text,
      htmlContent: html || textToHtml(text),
    }),
  });

  if (!response.ok) {
    const error = new Error(`Brevo API error ${response.status}: ${await response.text()}`);
    // 4xx means bad key / unverified sender / bad input: retrying will not help.
    error.retryable = response.status >= 500 || response.status === 429;
    throw error;
  }

  return response.json();
}

async function sendWithSmtp({ to, cc, subject, text, html, replyTo, headers }) {
  const sender = getSender();
  const ip = await resolveIPv4();
  return createTransporter({ ip }).sendMail({
    from: `"${sender.name}" <${sender.email}>`,
    to,
    cc,
    replyTo: replyTo || sender.email,
    subject,
    text,
    html: html || textToHtml(text),
    headers,
  });
}

/**
 * Send one email. `to` defaults to the admin inbox (MAIL_TO), so contact and chat
 * notifications can call sendEmail({ subject, text, replyTo }).
 */
export async function sendEmail({ to = getAdminAddress(), cc, subject, text, html, replyTo, headers }) {
  assertEmailConfig();

  const provider = emailProvider();
  const send = provider === "brevo" ? sendWithBrevo : sendWithSmtp;
  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await send({ to, cc, subject, text, html, replyTo, headers });
      console.log(`[email] sent via ${provider}: "${subject}"`);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`[email] ${provider} attempt ${attempt}/${maxAttempts} failed:`, {
        code: error.code,
        message: error.message,
        command: error.command,
      });

      // Wrong credentials will not fix themselves on retry.
      if (error.retryable === false || error.code === "EAUTH" || attempt === maxAttempts) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
    }
  }

  throw lastError;
}
