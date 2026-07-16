import test from "node:test";
import assert from "node:assert/strict";
import { createTransporter } from "./email.js";

test("smtp transporter lookup uses IPv4-only resolution", () => {
  const transporter = createTransporter();
  assert.match(transporter.options.lookup.toString(), /family:\s*4/);
});

test("gmail transporter defaults to STARTTLS on port 587", () => {
  const previous = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
  };

  process.env.SMTP_HOST = "smtp.gmail.com";
  process.env.SMTP_PORT = "";
  process.env.SMTP_SECURE = "";

  try {
    const transporter = createTransporter();
    assert.equal(transporter.options.port, 587);
    assert.equal(transporter.options.secure, false);
    assert.equal(transporter.options.requireTLS, true);
  } finally {
    Object.entries(previous).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  }
});
