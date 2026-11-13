import React, { useState } from "react";
import Icon from "./Icon.jsx";
import { postJson } from "../lib/api.js";
import { getTranslation } from "../data/translations.js";

function LiveChat({ open, setOpen, language = "EN" }) {
  const t = getTranslation(language).chat;
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [sending, setSending] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submitChat = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus({ type: "", message: "" });

    try {
      await postJson("/api/live-chat", form);

      setForm({ name: "", email: "", message: "" });
      setStatus({ type: "success", message: t.sent });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <form className="chat-panel" onSubmit={submitChat} aria-label={t.title}>
          <div className="chat-head">
            <img src="/logo-mark.png" alt="" width="30" height="18" />
            <strong>{t.title}</strong>
          </div>
          <p>{t.text}</p>
          <input name="name" placeholder={t.name} aria-label={t.name} value={form.name} onChange={updateField} />
          <input name="email" type="email" placeholder={t.email} aria-label={t.email} value={form.email} onChange={updateField} />
          <textarea
            name="message"
            rows="3"
            placeholder={t.message}
            aria-label={t.message}
            value={form.message}
            onChange={updateField}
            required
          />
          {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}
          <button className="primary small" type="submit" disabled={sending}>
            {sending ? t.sending : t.send}
          </button>
        </form>
      )}
      <button className="chat-button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <Icon name={open ? "close" : "chat"} size={18} />
        {open ? t.close : t.open}
      </button>
    </div>
  );
}

export default LiveChat;
