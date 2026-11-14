import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { createTransporter, resolveIPv4 } from "./email.js";

test("smtp transporter uses the requested Gmail config", () => {
  const transporter = createTransporter();
  assert.equal(transporter.options.host, "smtp.gmail.com");
  assert.equal(transporter.options.servername, "smtp.gmail.com");
  assert.equal(transporter.options.port, 465);
  assert.equal(transporter.options.secure, true);
  assert.equal(transporter.options.requireTLS, undefined);
});

test("smtp transporter connects to a given IPv4 address but verifies TLS against the hostname", () => {
  const transporter = createTransporter({ ip: "203.0.113.10" });
  assert.equal(transporter.options.host, "203.0.113.10");
  assert.equal(transporter.options.servername, "smtp.gmail.com");
});

test("resolveIPv4 returns an IPv4 address, never IPv6", async () => {
  assert.equal(await resolveIPv4("203.0.113.10"), "203.0.113.10");
  const address = await resolveIPv4("localhost");
  assert.equal(net.isIPv4(address), true);
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
