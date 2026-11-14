import React, { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { getJson, postJson } from "../lib/api.js";
import { getTranslation } from "../data/translations.js";

const STORAGE_KEY = "over-rentals-chat";
const POLL_OPEN_MS = 4000;
const POLL_CLOSED_MS = 20000;

const emptyChat = { id: null, name: "", email: "", messages: [], seenAgentCount: 0 };

function loadChat() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.messages)) return { ...emptyChat, ...saved };
  } catch {
    // Private mode or bad data: start fresh.
  }
  return emptyChat;
}

function saveChat(chat) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chat));
  } catch {
    // Storage unavailable: the chat still works for this visit.
  }
}

/** Merge server messages into the local list (dedupe by id, keep time order). */
function mergeMessages(local, incoming) {
  const byId = new Map(local.map((message) => [message.id, message]));
  incoming.forEach((message) => byId.set(message.id, message));
  return [...byId.values()].sort((a, b) => a.at.localeCompare(b.at));
}

function formatTime(iso, language) {
  try {
    return new Date(iso).toLocaleTimeString(language === "FR" ? "fr-FR" : "en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function LiveChat({ open, setOpen, language = "EN" }) {
  const t = getTranslation(language).chat;
  const [chat, setChat] = useState(loadChat);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  const started = Boolean(chat.id);
  const agentCount = chat.messages.filter((message) => message.from === "agent").length;
  const unread = open ? 0 : Math.max(0, agentCount - chat.seenAgentCount);

  useEffect(() => saveChat(chat), [chat]);

  // Opening the panel marks every reply as read.
  useEffect(() => {
    if (open && chat.seenAgentCount !== agentCount) {
      setChat((current) => ({ ...current, seenAgentCount: agentCount }));
    }
  }, [open, agentCount, chat.seenAgentCount]);

  // Keep the newest message in view.
  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, chat.messages.length]);

  const fetchReplies = useCallback(async () => {
    if (!chat.id) return;
    try {
      const { messages } = await getJson(`/api/chat/${chat.id}/messages`);
      if (Array.isArray(messages) && messages.length) {
        setChat((current) =>
          current.id === chat.id ? { ...current, messages: mergeMessages(current.messages, messages) } : current,
        );
      }
    } catch {
      // Offline or server waking up: try again on the next tick.
    }
  }, [chat.id]);

  // Poll for replies: often while the panel is open, slowly in the background for the badge.
  useEffect(() => {
    if (!chat.id) return undefined;
    fetchReplies();
    const timer = setInterval(fetchReplies, open ? POLL_OPEN_MS : POLL_CLOSED_MS);
    return () => clearInterval(timer);
  }, [chat.id, open, fetchReplies]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setChat((current) => ({ ...current, [name]: value }));
  };

  const sendMessage = async (event) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setError("");
    try {
      const result = await postJson("/api/chat/messages", {
        conversationId: chat.id,
        name: chat.name,
        email: chat.email,
        message: text,
      });
      setChat((current) => ({
        ...current,
        id: result.conversationId,
        messages: mergeMessages(current.messages, [result.message]),
      }));
      setDraft("");
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setChat({ ...emptyChat, name: chat.name, email: chat.email });
    setDraft("");
    setError("");
  };

  const lastIsVisitor = chat.messages.length > 0 && chat.messages[chat.messages.length - 1].from === "visitor";

  return (
    <div className="chat-widget">
      {open && (
        <section className="chat-panel" aria-label={t.title}>
          <div className="chat-head">
            <img src="/logo-mark.png" alt="" width="30" height="18" />
            <div className="chat-head-text">
              <strong>{t.title}</strong>
              <span>{t.status}</span>
            </div>
            {started && (
              <button type="button" className="chat-new" onClick={startNewChat}>
                {t.newChat}
              </button>
            )}
          </div>

          <div className="chat-messages" ref={listRef} aria-live="polite">
            <div className="chat-bubble agent">
              <p>{t.text}</p>
            </div>
            {chat.messages.map((message) => (
              <div key={message.id} className={`chat-bubble ${message.from === "agent" ? "agent" : "visitor"}`}>
                <p>{message.text}</p>
                <time dateTime={message.at}>
                  {message.from === "agent" ? `${t.team} · ` : ""}
                  {formatTime(message.at, language)}
                </time>
              </div>
            ))}
            {lastIsVisitor && <p className="chat-note">{t.waiting}</p>}
          </div>

          <form className="chat-compose" onSubmit={sendMessage}>
            {!started && (
              <div className="chat-details">
                <input name="name" placeholder={t.name} aria-label={t.name} value={chat.name} onChange={updateField} />
                <input
                  name="email"
                  type="email"
                  placeholder={t.email}
                  aria-label={t.email}
                  value={chat.email}
                  onChange={updateField}
                />
              </div>
            )}
            {error && <p className="form-status error">{error}</p>}
            <div className="chat-input-row">
              <textarea
                rows="2"
                placeholder={t.message}
                aria-label={t.message}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                maxLength={2000}
              />
              <button className="chat-send" type="submit" disabled={sending || !draft.trim()} aria-label={t.send}>
                {sending ? <span className="chat-spinner" aria-hidden="true" /> : <Icon name="arrow" size={18} />}
              </button>
            </div>
          </form>
        </section>
      )}
      <button className="chat-button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <Icon name={open ? "close" : "chat"} size={18} />
        {open ? t.close : t.open}
        {unread > 0 && (
          <span className="chat-badge" aria-label={`${unread} ${t.unread}`}>
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}

export default LiveChat;
