import React from "react";
import logo from "../../logo.png";
import { getTranslation } from "../data/translations.js";

const headerItems = ["Services", "Products", "Portfolio", "About", "Blog", "Careers"];

function Navbar({ page, dark, language, menuOpen, setDark, setLanguage, setMenuOpen, navigate }) {
  const t = getTranslation(language);

  return (
    <header className="nav-shell">
      <nav className="nav">
        <button className="brand" onClick={() => navigate("Home")} aria-label={t.nav.ariaHome}>
          <img src={logo} alt="OVTECH" />
        </button>
        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={t.nav.ariaMenu}>
          <span />
          <span />
          <span />
        </button>
        <div className={menuOpen ? "nav-links open" : "nav-links"}>
          {headerItems.map((item) => (
            <button key={item} className={page === item ? "active" : ""} onClick={() => navigate(item)}>
              {t.nav[item]}
            </button>
          ))}
        </div>
        <div className="nav-actions">
          <button className="chip-button" onClick={() => setLanguage(language === "EN" ? "FR" : "EN")}>
            {language}
          </button>
          <button className="chip-button" onClick={() => setDark(!dark)}>
            {dark ? t.nav.light : t.nav.dark}
          </button>
          <button className="primary small nav-cta" onClick={() => navigate("Contact")}>
            {t.nav.cta}
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
