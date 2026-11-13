import React, { useState } from "react";
import PageHero from "../components/PageHero.jsx";
import Icon from "../components/Icon.jsx";
import { postJson } from "../lib/api.js";
import { getTranslation, translations } from "../data/translations.js";

// Option values stay in English so enquiry emails are consistent; labels follow the selected language.
const serviceValues = translations.EN.services.items.map(([title]) => title);

function Contact({ language = "EN" }) {
  const t = getTranslation(language);
  const c = t.contact;
  const [form, setForm] = useState({
    name: "",
    email: "",
    service: serviceValues[0],
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [sending, setSending] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submitContact = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus({ type: "", message: "" });

    try {
      await postJson("/api/contact", form);

      setForm({
        name: "",
        email: "",
        service: serviceValues[0],
        message: "",
      });
      setStatus({ type: "success", message: c.sent });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHero eyebrow={c.heroEyebrow} title={c.heroTitle} text={c.heroText} />
      <section className="section">
        <div className="container contact-grid">
          <form className="card form-card" onSubmit={submitContact}>
            <div className="form-row">
              <label className="field">
                {c.fullName}
                <input name="name" type="text" placeholder={c.namePlaceholder} value={form.name} onChange={updateField} required />
              </label>
              <label className="field">
                {c.emailLabel}
                <input name="email" type="email" placeholder={c.emailPlaceholder} value={form.email} onChange={updateField} required />
              </label>
            </div>
            <label className="field">
              {c.service}
              <select name="service" value={form.service} onChange={updateField}>
                {serviceValues.map((value, index) => (
                  <option key={value} value={value}>
                    {t.services.items[index][0]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              {c.message}
              <textarea
                name="message"
                rows="6"
                placeholder={c.messagePlaceholder}
                value={form.message}
                onChange={updateField}
                required
              />
            </label>
            {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}
            <button className="primary" type="submit" disabled={sending}>
              {sending ? c.sending : c.send}
              {!sending && <Icon name="arrow" size={16} />}
            </button>
          </form>

          <aside className="card contact-card">
            <h3>{c.details}</h3>
            <ul className="contact-list">
              <li>
                <span className="icon-tile small">
                  <Icon name="phone" size={17} />
                </span>
                <span>
                  <small>{c.phone}</small>
                  <a href="tel:+250783227490">+250 783227490</a>
                </span>
              </li>
              <li>
                <span className="icon-tile small">
                  <Icon name="mail" size={17} />
                </span>
                <span>
                  <small>{c.email}</small>
                  <a href="mailto:olibyishi@gmail.com">olibyishi@gmail.com</a>
                </span>
              </li>
              <li>
                <span className="icon-tile small">
                  <Icon name="chat" size={17} />
                </span>
                <span>
                  <small>{c.whatsapp}</small>
                  <a href="https://wa.me/2783227490" target="_blank" rel="noopener noreferrer">
                    +250 783227490
                  </a>
                </span>
              </li>
              <li>
                <span className="icon-tile small">
                  <Icon name="pin" size={17} />
                </span>
                <span>
                  <small>{c.location}</small>
                  KN 84 St, Kigali
                </span>
              </li>
            </ul>
            <div className="map-box">
              <iframe
                title={c.mapTitle}
                src="https://www.google.com/maps?q=KN%2084%20St%2C%20Kigali&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="social-row">
              <a href="#">LinkedIn</a>
              <a href="#">X</a>
              <a href="#">GitHub</a>
              <a href="#">Facebook</a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export default Contact;
