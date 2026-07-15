import React from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import { getTranslation } from "../data/translations.js";

function Products({ featured = false, language = "EN" }) {
  const t = getTranslation(language);
  const visible = featured ? t.products.items.slice(0, 3) : t.products.items;

  return (
    <section className="section alt">
      <div className="container">
        <SectionHeader
          eyebrow={t.products.eyebrow}
          title={t.products.title}
          text={t.products.text}
        />
        <div className="card-grid">
          {visible.map(([title, text, link]) => (
            <article className="product-card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
              {link ? (
                <a className="text-link" href={link} target="_blank" rel="noreferrer">
                  {t.products.request}
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Products;
