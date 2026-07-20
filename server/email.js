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

  return smtpHost.includes("gmail") ? 465 : 587;
}

function getSmtpSecure(port, smtpHost) {
  if (process.env.SMTP_SECURE === "true") {
    return true;
  }

  if (process.env.SMTP_SECURE === "false") {
    return false;
  }

  if (smtpHost.includes("gmail")) {
    return true;
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
  const smtpPort = Number(process.env.SMTP_PORT || 465);

  const config = {
    host: smtpHost,
    port: smtpPort,
    secure: true,
    family: 4,
    auth: {
      user: process.env.EMAIL_USER,
      pass: String(process.env.EMAIL_PASS || "").replace(/\s/g, ""),
    },
    logger: true,
    debug: true,
  };

  console.log("[SMTP] Creating transporter with config:", {
    host: config.host,
    port: config.port,
    secure: config.secure,
    family: config.family,
    user: config.auth.user,
  });

  return nodemailer.createTransport(config);
}

export async function sendEmail({ subject, replyTo, text }) {
  console.log("[SMTP] Sending email with subject:", subject);
  
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transporter = createTransporter();
      const result = await transporter.sendMail({
        from: `"OVTECH Website" <${process.env.EMAIL_USER}>`,
        to: process.env.MAIL_TO,
        replyTo: replyTo || process.env.EMAIL_USER,
        subject,
        text,
      });
      console.log("[SMTP] Email sent successfully:", result.messageId);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`[SMTP] Attempt ${attempt}/${maxRetries} failed:`, {
        code: error.code,
        message: error.message,
        command: error.command,
      });

      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.log(`[SMTP] Retrying in ${backoffMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  console.error("[SMTP] All retry attempts failed. Final error details:", {
    code: lastError.code,
    message: lastError.message,
    command: lastError.command,
    address: lastError.address,
    port: lastError.port,
  });
  
  throw lastError;
}
