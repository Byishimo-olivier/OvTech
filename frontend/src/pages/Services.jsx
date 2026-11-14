import React from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import PageHero from "../components/PageHero.jsx";
import Icon, { serviceIcons } from "../components/Icon.jsx";
import { getTranslation } from "../data/translations.js";

function ServiceGrid({ items }) {
  return (
    <div className="grid cols-3">
      {items.map(([title, text], index) => (
        <article className="card service-card" key={title}>
          <span className="icon-tile">
            <Icon name={serviceIcons[index]} size={20} />
          </span>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}

function Services({ featured = false, language = "EN", navigate }) {
  const t = getTranslation(language);

  if (featured) {
    return (
      <section className="section">
        <div className="container">
          <div className="section-head-row">
            <SectionHeader align="left" eyebrow={t.services.eyebrow} title={t.services.title} text={t.services.text} />
            {navigate && (
              <button className="secondary" onClick={() => navigate("Services")}>
                {t.home.viewAll}
                <Icon name="arrow" size={16} />
              </button>
            )}
          </div>
          <ServiceGrid items={t.services.items.slice(0, 6)} />
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero eyebrow={t.services.eyebrow} title={t.services.title} text={t.services.text} />
      <section className="section">
        <div className="container">
          <ServiceGrid items={t.services.items} />
        </div>
      </section>
    </>
  );
}

export default Services;
