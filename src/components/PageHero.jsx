import React from "react";

function PageHero({ title, text }) {
  return (
    <section className="page-hero">
      <div className="container">
        <p className="eyebrow">OVTECH</p>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );
}

export default PageHero;
