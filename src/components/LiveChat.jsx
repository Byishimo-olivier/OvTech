import React, { useState } from "react";
import { postJson } from "../lib/api.js";

function LiveChat({ open, setOpen }) {
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
      setStatus({ type: "success", message: "Sent. We will respond shortly." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <form className="chat-panel" onSubmit={submitChat}>
          <strong>OVTECH Live Chat</strong>
          <p>Hello. Share your project idea and our team will respond shortly.</p>
          <input name="name" placeholder="Your name" value={form.name} onChange={updateField} />
          <input name="email" type="email" placeholder="Your email" value={form.email} onChange={updateField} />
          <textarea
            name="message"
            rows="3"
            placeholder="Type your message"
            value={form.message}
            onChange={updateField}
            required
          />
          {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}
          <button className="primary small" type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      )}
      <button className="chat-button" onClick={() => setOpen(!open)}>
        {open ? "Close" : "Live Chat"}
      </button>
    </div>
  );
}

export default LiveChat;
