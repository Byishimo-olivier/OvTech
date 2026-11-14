import React from "react";

function PageHero({ eyebrow, title, text }) {
  return (
    <section className="page-hero">
      <div className="container">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {text && <p className="page-hero-text">{text}</p>}
      </div>
    </section>
  );
}

export default PageHero;
