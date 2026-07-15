import React, { useState } from "react";
import PageHero from "../components/PageHero.jsx";
import { postJson } from "../lib/api.js";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    service: "Custom Software Development",
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
        service: "Custom Software Development",
        message: "",
      });
      setStatus({ type: "success", message: "Message sent. We will contact you shortly." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHero title="Contact OVTECH" text="Tell us what you want to build, improve, secure, or automate." />
      <section className="section">
        <div className="container contact-grid">
          <form className="contact-form" onSubmit={submitContact}>
            <label>
              Full name
              <input name="name" type="text" placeholder="Your name" value={form.name} onChange={updateField} required />
            </label>
            <label>
              Email
              <input name="email" type="email" placeholder="you@company.com" value={form.email} onChange={updateField} required />
            </label>
            <label>
              Service needed
              <select name="service" value={form.service} onChange={updateField}>
                <option>Custom Software Development</option>
                <option>Website Development</option>
                <option>Mobile Application Development</option>
                <option>IT Consulting</option>
                <option>Maintenance & Support</option>
              </select>
            </label>
            <label>
              Message
              <textarea
                name="message"
                rows="5"
                placeholder="Briefly describe your project"
                value={form.message}
                onChange={updateField}
                required
              />
            </label>
            {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}
            <button className="primary" type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
          <aside className="contact-card">
            <h3>Contact details</h3>
            <p><strong>Phone:</strong> +250 783227490</p>
            
            <p><a href="mailto:olibyishi@gmail.com"><strong>Email:</strong> olibyishi@gmail.com</a></p>
            <p><a href="https://wa.me/2783227490" target="_blank" rel="noopener noreferrer"><strong>WhatsApp:</strong> +250 783227490</a></p>
            <p><strong>Location:</strong> KN 84 St, Kigali</p>
            <div className="map-box">
              <iframe
                title="OVTECH location on Google Maps"
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
