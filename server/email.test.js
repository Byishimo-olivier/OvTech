import test from "node:test";
import assert from "node:assert/strict";
import { createTransporter } from "./email.js";

test("smtp transporter uses the requested Gmail config", () => {
  const transporter = createTransporter();
  assert.equal(transporter.options.host, "smtp.gmail.com");
  assert.equal(transporter.options.port, 465);
  assert.equal(transporter.options.secure, true);
  assert.equal(transporter.options.family, 4);
  assert.equal(transporter.options.requireTLS, undefined);
});

test("smtp transporter lookup uses IPv4-only resolution", () => {
  const transporter = createTransporter();
  assert.match(transporter.options.lookup.toString(), /family:\s*4/);
});

test("smtp transporter accepts EMAIL_USER as the fallback recipient when MAIL_TO is missing", () => {
  const previous = {
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    MAIL_TO: process.env.MAIL_TO,
  };

  process.env.EMAIL_USER = "sender@example.com";
  process.env.EMAIL_PASS = "app-password";
  delete process.env.MAIL_TO;

  try {
    const transporter = createTransporter();
    assert.equal(transporter.options.auth.user, "sender@example.com");
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
