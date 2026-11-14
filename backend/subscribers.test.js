import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ovtech-subs-"));
process.env.SUBSCRIBERS_FILE = path.join(tempDir, "subscribers.json");
process.env.UNSUBSCRIBE_SECRET = "test-secret";
delete process.env.BREVO_API_KEY;
delete process.env.BREVO_LIST_ID;

const subs = await import("./subscribers.js");

test.after(() => fs.rm(tempDir, { recursive: true, force: true }));

test("uses the JSON file store when Brevo is not configured", () => {
  assert.equal(subs.subscriberStore(), "file");
});

test("validates email addresses", () => {
  assert.equal(subs.isValidEmail("someone@example.com"), true);
  assert.equal(subs.isValidEmail("not-an-email"), false);
  assert.equal(subs.isValidEmail("a@b"), false);
  assert.equal(subs.isValidEmail("has space@example.com"), false);
});

test("adds, de-duplicates (case-insensitive), lists and removes subscribers", async () => {
  assert.deepEqual(await subs.addSubscriber("Reader@Example.com"), { added: true });
  assert.deepEqual(await subs.addSubscriber("reader@example.com"), { added: false });
  assert.deepEqual(await subs.listSubscribers(), ["reader@example.com"]);

  assert.equal(await subs.removeSubscriber("READER@example.com"), true);
  assert.equal(await subs.removeSubscriber("reader@example.com"), false);
  assert.deepEqual(await subs.listSubscribers(), []);
});

test("concurrent sign-ups are all saved", async () => {
  const emails = Array.from({ length: 10 }, (_, i) => `user${i}@example.com`);
  await Promise.all(emails.map((email) => subs.addSubscriber(email)));
  assert.equal((await subs.listSubscribers()).length, 10);
});

test("unsubscribe tokens verify only for the matching email", () => {
  const token = subs.unsubscribeToken("reader@example.com");
  assert.equal(subs.verifyUnsubscribeToken("Reader@Example.com", token), true);
  assert.equal(subs.verifyUnsubscribeToken("other@example.com", token), false);
  assert.equal(subs.verifyUnsubscribeToken("reader@example.com", "wrong"), false);
  assert.equal(subs.verifyUnsubscribeToken("reader@example.com", undefined), false);
});
