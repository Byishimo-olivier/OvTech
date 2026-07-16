import test from "node:test";
import assert from "node:assert/strict";
import { createTransporter } from "./email.js";

test("smtp transporter lookup uses IPv4-only resolution", () => {
  const transporter = createTransporter();
  assert.match(transporter.options.lookup.toString(), /family:\s*4/);
});
