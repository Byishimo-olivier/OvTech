import React from "react";
import Icon from "./Icon.jsx";
import { getTranslation } from "../data/translations.js";

const headerItems = ["Services", "Products", "Portfolio", "About", "Blog", "Careers"];

export function Brand({ onClick, label }) {
  return (
    <button className="brand" onClick={onClick} aria-label={label}>
      <img src="/logo-mark.png" alt="" width="40" height="24" />
      <span className="brand-word">Over Rentals</span>
    </button>
  );
}

function Navbar({ page, dark, language, menuOpen, setDark, setLanguage, setMenuOpen, navigate }) {
  const t = getTranslation(language);

  return (
    <header className="nav-shell">
      <nav className="nav">
        <Brand onClick={() => navigate("Home")} label={t.nav.ariaHome} />
        <div id="primary-nav" className={menuOpen ? "nav-links open" : "nav-links"}>
          {headerItems.map((item) => (
            <button
              key={item}
              className={page === item ? "active" : ""}
              aria-current={page === item ? "page" : undefined}
              onClick={() => navigate(item)}
            >
              {t.nav[item]}
            </button>
          ))}
          <button className="primary nav-cta-mobile" onClick={() => navigate("Contact")}>
            {t.nav.cta}
            <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="nav-actions">
          <button
            className="icon-button"
            onClick={() => setLanguage(language === "EN" ? "FR" : "EN")}
            aria-label={t.nav.language}
            title={t.nav.language}
          >
            {language}
          </button>
          <button
            className="icon-button"
            onClick={() => setDark(!dark)}
            aria-label={dark ? t.nav.light : t.nav.dark}
            title={dark ? t.nav.light : t.nav.dark}
          >
            <Icon name={dark ? "sun" : "moon"} size={17} />
          </button>
          <button className="primary small nav-cta" onClick={() => navigate("Contact")}>
            {t.nav.cta}
            <Icon name="arrow" size={15} />
          </button>
          <button
            className="icon-button mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t.nav.ariaMenu}
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
          >
            <Icon name={menuOpen ? "close" : "menu"} size={19} />
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
