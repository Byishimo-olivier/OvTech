import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "chat-test-"));
process.env.CHATS_FILE = path.join(tempDir, "chats.json");

const {
  addMessage,
  chatReplyAddress,
  conversationIdFromAddress,
  extractReplyText,
  getMessages,
  isConversationId,
  newConversationId,
  resetChatCache,
} = await import("./chat.js");

test("conversation ids round-trip through the plus reply address", () => {
  const id = newConversationId();
  assert.equal(isConversationId(id), true);
  const address = chatReplyAddress(id, "team@gmail.com");
  assert.equal(address, `team+chat-${id}@gmail.com`);
  assert.equal(conversationIdFromAddress(address), id);
  assert.equal(conversationIdFromAddress(address.toUpperCase()), id);
  assert.equal(conversationIdFromAddress("team@gmail.com"), null);
  assert.equal(conversationIdFromAddress("team+chat-123@gmail.com"), null);
});

test("extractReplyText keeps only the new reply from a Gmail answer", () => {
  const gmail = [
    "Hi Alice, yes the car is available on Saturday.",
    "",
    "On Fri, Nov 14, 2026 at 10:02 AM Over Rentals <",
    "team@gmail.com> wrote:",
    "",
    "> Alice wrote in the website live chat:",
    "> Is the car free on Saturday?",
  ].join("\r\n");
  assert.equal(extractReplyText(gmail), "Hi Alice, yes the car is available on Saturday.");
});

test("extractReplyText handles French Gmail, Outlook and signatures", () => {
  assert.equal(extractReplyText("Oui, bien sûr.\n\nLe ven. 14 nov. 2026 à 10:02, Over Rentals a écrit :\n> question"), "Oui, bien sûr.");
  assert.equal(extractReplyText("Sure thing.\n\n________________________________\nFrom: Over Rentals\nSent: today"), "Sure thing.");
  assert.equal(extractReplyText("Two lines\nof answer\n-- \nJohn, Over Rentals"), "Two lines\nof answer");
  assert.equal(extractReplyText("> only quoted text"), "");
});

test("messages are stored, persisted, and reply emails are never duplicated", async () => {
  const id = newConversationId();
  await addMessage(id, { from: "visitor", text: "Hello", name: "Alice" });
  const first = await addMessage(id, { from: "agent", text: "Hi!", emailMessageId: "<abc@mail.gmail.com>" });
  const again = await addMessage(id, { from: "agent", text: "Hi!", emailMessageId: "<abc@mail.gmail.com>" });
  assert.ok(first);
  assert.equal(again, null);

  // Simulate a server restart: re-read from disk, then re-read the same reply email.
  resetChatCache();
  const afterRestart = await addMessage(id, { from: "agent", text: "Hi!", emailMessageId: "<abc@mail.gmail.com>" });
  assert.equal(afterRestart, null);

  const messages = await getMessages(id);
  assert.deepEqual(
    messages.map((m) => [m.from, m.text]),
    [
      ["visitor", "Hello"],
      ["agent", "Hi!"],
    ],
  );
  assert.equal(messages[1].id, first.id);
});

test("unknown or malformed conversations return no messages", async () => {
  assert.deepEqual(await getMessages(newConversationId()), []);
  assert.deepEqual(await getMessages("../../etc/passwd"), []);
});
