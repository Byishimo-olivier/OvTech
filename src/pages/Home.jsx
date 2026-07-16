import React from "react";
import Estimator from "../components/Estimator.jsx";
import Services from "./Services.jsx";
import Products from "./Products.jsx";
import { AboutPreview, CTA, FAQ, FeaturedProjects, Process, TechStack, Testimonials, Trusted, WhyChoose } from "../components/sections.jsx";
import { getTranslation } from "../data/translations.js";

function Stat({ value, label }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Home({ navigate, language = "EN" }) {
  const t = getTranslation(language);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-copy-block">
            <p className="eyebrow">{t.home.eyebrow}</p>
            <h1>
              {t.home.title} <span>{t.home.titleAccent}</span>
            </h1>
            <p className="hero-subtitle">{t.home.subtitle}</p>
            <p className="hero-copy">{t.home.copy}</p>
            <div className="button-row">
              <button className="primary" onClick={() => navigate("Contact")}>
                {t.home.schedule}
              </button>
              <button className="secondary" onClick={() => navigate("Portfolio")}>
                {t.home.portfolio}
              </button>
            </div>
            <div className="stats">
              <Stat value="40+" label={t.home.stats[0]} />
              <Stat value="12" label={t.home.stats[1]} />
              <Stat value="98%" label={t.home.stats[2]} />
              <Stat value="24/7" label={t.home.stats[3]} />
            </div>
          </div>
          <div className="hero-visual" style={{ "--hero-image": "url(/hero.jpeg)" }} aria-label="OVTECH founder portrait">
            <div className="talent-pill pill-one">{t.home.pills[0]}</div>
            <div className="talent-pill pill-two">{t.home.pills[1]}</div>
            <div className="talent-pill pill-three">{t.home.pills[2]}</div>
          </div>
        </div>
      </section>
      <Trusted language={language} />
      <Services featured language={language} />
      <AboutPreview navigate={navigate} language={language} />
      <Products featured language={language} />
      <FeaturedProjects language={language} />
      <Process language={language} />
      <WhyChoose language={language} />
      <TechStack language={language} />
      <Testimonials language={language} />
      <FAQ language={language} />
      <Estimator language={language} />
      <CTA navigate={navigate} language={language} />
    </>
  );
}

export default Home;
