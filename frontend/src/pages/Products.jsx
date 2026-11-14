import React from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import PageHero from "../components/PageHero.jsx";
import Icon from "../components/Icon.jsx";
import { getTranslation } from "../data/translations.js";

function ProductGrid({ items, t }) {
  return (
    <div className="grid cols-3">
      {items.map(([title, text, link]) => (
        <article className="card product-card" key={title}>
          <div className="card-top">
            <span className="product-mark" aria-hidden="true">
              {title
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
            {link && <span className="badge-live">{t.products.live}</span>}
          </div>
          <h3>{title}</h3>
          <p>{text}</p>
          {link && (
            <a className="text-link card-link" href={link} target="_blank" rel="noreferrer">
              {t.products.request}
              <Icon name="external" size={15} />
            </a>
          )}
        </article>
      ))}
    </div>
  );
}

function Products({ featured = false, language = "EN" }) {
  const t = getTranslation(language);

  if (featured) {
    return (
      <section className="section">
        <div className="container">
          <SectionHeader eyebrow={t.products.eyebrow} title={t.products.title} text={t.products.text} />
          <ProductGrid items={t.products.items.slice(0, 3)} t={t} />
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero eyebrow={t.products.eyebrow} title={t.products.title} text={t.products.text} />
      <section className="section">
        <div className="container">
          <ProductGrid items={t.products.items} t={t} />
        </div>
      </section>
    </>
  );
}

export default Products;
