import React from "react";
import Estimator from "../components/Estimator.jsx";
import Icon from "../components/Icon.jsx";
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
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{t.home.eyebrow}</p>
            <h1>
              {t.home.title} {t.home.titleAccent}
            </h1>
            <p className="hero-lead">{t.home.copy}</p>
            <div className="button-row">
              <button className="primary" onClick={() => navigate("Contact")}>
                {t.home.schedule}
                <Icon name="arrow" size={16} />
              </button>
              <button className="secondary" onClick={() => navigate("Portfolio")}>
                {t.home.portfolio}
              </button>
            </div>
          </div>
          <figure className="hero-photo">
            <img src="/hero.jpeg" alt={t.sections.founderAlt} />
            <figcaption>{t.sections.founderLabel}</figcaption>
          </figure>
        </div>

        <div className="container stats-bar">
          <Stat value="40+" label={t.home.stats[0]} />
          <Stat value="12" label={t.home.stats[1]} />
          <Stat value="98%" label={t.home.stats[2]} />
          <Stat value="24/7" label={t.home.stats[3]} />
        </div>
      </section>
      <Trusted language={language} />
      <Services featured language={language} navigate={navigate} />
      <AboutPreview navigate={navigate} language={language} />
      <FeaturedProjects language={language} />
      <Process language={language} />
      <Products featured language={language} />
      <WhyChoose language={language} />
      <TechStack language={language} />
      <Testimonials language={language} />
      <Estimator language={language} />
      <FAQ language={language} />
      <CTA navigate={navigate} language={language} />
    </>
  );
}

export default Home;
