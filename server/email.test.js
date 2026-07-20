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
