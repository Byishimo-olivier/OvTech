import React from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import { getTranslation } from "../data/translations.js";

function Services({ featured = false, language = "EN" }) {
  const t = getTranslation(language);
  const visible = featured ? t.services.items.slice(0, 6) : t.services.items;

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          text={t.services.text}
        />
        <div className="card-grid three">
          {visible.map(([title, text], index) => (
            <article className="service-card" key={title}>
              <span className="card-icon">{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
