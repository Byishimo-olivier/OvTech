import React from "react";
import SectionHeader from "./SectionHeader.jsx";
import { projects, technologies } from "../data/siteData.js";
import { getTranslation } from "../data/translations.js";

export function Trusted({ language = "EN" }) {
  const t = getTranslation(language);

  return (
    <section className="trusted">
      <div className="container">
        <p>{t.trusted.text}</p>
        <div className="logo-row">
          {["Kigali Estates", "Prime Health", "EduCore", "BuildLine", "RetailPro"].map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutPreview({ navigate, language = "EN" }) {
  const t = getTranslation(language);

  return (
    <section className="split-section">
      <div className="container split">
        <div>
          <p className="eyebrow">{t.sections.aboutEyebrow}</p>
          <h2>{t.sections.aboutTitle}</h2>
          <p>{t.sections.aboutText}</p>
          <button className="primary" onClick={() => navigate("About")}>
            {t.sections.aboutButton}
          </button>
        </div>
        <div className="image-panel about-image">
          <div className="floating-note">
            <strong>{t.sections.deliveryTitle}</strong>
            <span>{t.sections.deliveryText}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Process({ language = "EN" }) {
  const t = getTranslation(language);

  return (
    <section className="section alt">
      <div className="container">
        <SectionHeader
          eyebrow={t.sections.processEyebrow}
          title={t.sections.processTitle}
          text={t.sections.processText}
        />
        <div className="timeline compact">
          {t.sections.processSteps.map((step, index) => (
            <div className="timeline-item" key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyChoose({ language = "EN" }) {
  const t = getTranslation(language);

  return (
    <section className="section">
      <div className="container">
        <SectionHeader eyebrow={t.sections.whyEyebrow} title={t.sections.whyTitle} />
        <div className="feature-grid">
          {t.sections.whyItems.map(([title, text]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TechStack({ language = "EN" }) {
  const t = getTranslation(language);

  return (
    <section className="section tech-section">
      <div className="container">
        <SectionHeader eyebrow={t.sections.techEyebrow} title={t.sections.techTitle} />
        <div className="tech-grid">
          {Object.entries(technologies).map(([group, items]) => (
            <article className="tech-card" key={group}>
              <h3>{group}</h3>
              <div className="tag-row">
                {items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ language = "EN" }) {
  const t = getTranslation(language);

  return (
    <section className="section alt">
      <div className="container">
        <SectionHeader eyebrow={t.sections.testimonialsEyebrow} title={t.sections.testimonialsTitle} />
        <div className="card-grid">
          {t.sections.testimonials.map(([quote, role]) => (
            <article className="testimonial" key={quote}>
              <p>"{quote}"</p>
              <strong>{role}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQ({ language = "EN" }) {
  const t = getTranslation(language);

  return (
    <section className="section">
      <div className="container narrow">
        <SectionHeader eyebrow={t.sections.faqEyebrow} title={t.sections.faqTitle} />
        <div className="faq-list">
          {t.sections.faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTA({ navigate, language = "EN" }) {
  const t = getTranslation(language);

  return (
    <section className="cta">
      <div className="container cta-inner">
        <div>
          <p className="eyebrow">{t.sections.ctaEyebrow}</p>
          <h2>{t.sections.ctaTitle}</h2>
        </div>
        <button className="primary light" onClick={() => navigate("Contact")}>
          {t.sections.ctaButton}
        </button>
      </div>
    </section>
  );
}

export function FeaturedProjects({ language = "EN" }) {
  const t = getTranslation(language);

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow={t.sections.projectsEyebrow}
          title={t.sections.projectsTitle}
          text={t.sections.projectsText}
        />
        <div className="project-grid">
          {projects.slice(0, 3).map((project) => (
            <article className="project-card" key={project.name}>
              <img src={project.image} alt={`${project.name} interface concept`} />
              <div>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="tag-row">
                  {project.tech.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
