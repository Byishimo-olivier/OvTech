import React, { useState } from "react";
import { Brand } from "./Navbar.jsx";
import { postJson } from "../lib/api.js";
import { getTranslation } from "../data/translations.js";

function Footer({ navigate, language = "EN" }) {
  const t = getTranslation(language);
  const f = t.footer;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [sending, setSending] = useState(false);

  const subscribe = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus({ type: "", message: "" });

    try {
      const result = await postJson("/api/subscribe", { email });
      setEmail("");
      setStatus({ type: "success", message: result.alreadySubscribed ? f.alreadySubscribed : f.subscribed });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSending(false);
    }
  };

  const columns = [
    [f.company, ["About", "Services", "Products", "Portfolio", "Careers"].map((item) => [t.nav[item], item])],
    [f.engineering, ["Process", "Technologies", "Industries", "Pricing"].map((item) => [t.nav[item], item])],
    [
      f.resources,
      [
        [t.nav.Blog, "Blog"],
        [f.knowledge, "Contact"],
        [f.portal, "Contact"],
        [t.nav.Contact, "Contact"],
      ],
    ],
  ];

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand onClick={() => navigate("Home")} label={t.nav.ariaHome} />
          <p className="footer-tagline">{f.tagline}</p>
          <p>{f.text}</p>
        </div>
        {columns.map(([heading, links]) => (
          <div key={heading}>
            <h3>{heading}</h3>
            <div className="footer-links">
              {links.map(([label, target]) => (
                <button key={label} onClick={() => navigate(target)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="footer-newsletter">
          <h3>{f.newsletter}</h3>
          <p>{f.newsletterText}</p>
          <form className="newsletter" onSubmit={subscribe}>
            <input
              type="email"
              name="email"
              placeholder={f.emailPlaceholder}
              aria-label={f.emailPlaceholder}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button className="primary small" type="submit" disabled={sending}>
              {sending ? f.subscribing : f.subscribe}
            </button>
          </form>
          {status.message && (
            <p className={`form-status newsletter-status ${status.type}`} role="status">
              {status.message}
            </p>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>{f.copyright}</span>
          <span>{f.built}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
