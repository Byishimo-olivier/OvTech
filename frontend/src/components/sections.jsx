import React from "react";
import SectionHeader from "./SectionHeader.jsx";
import Icon from "./Icon.jsx";
import { projects, technologies } from "../data/siteData.js";
import { getTranslation } from "../data/translations.js";

export function Trusted({ language = "EN" }) {
  const t = getTranslation(language);

  return (
    <section className="trusted">
      <div className="container trusted-inner">
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
    <section className="section alt">
      <div className="container split">
        <div>
          <p className="eyebrow">{t.sections.aboutEyebrow}</p>
          <h2 className="split-title">{t.sections.aboutTitle}</h2>
        </div>
        <div>
          <p className="split-text">{t.sections.aboutText}</p>
          <ul className="check-list">
            {t.sections.whyItems.slice(0, 3).map(([title]) => (
              <li key={title}>
                <Icon name="check" size={18} strokeWidth={2.2} />
                {title}
              </li>
            ))}
          </ul>
          <button className="secondary" onClick={() => navigate("About")}>
            {t.sections.aboutButton}
            <Icon name="arrow" size={16} />
          </button>
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
        <ol className="steps">
          {t.sections.processSteps.map((step, index) => (
            <li className="step" key={step}>
              <span className="step-num">{index + 1}</span>
              <h3>{step}</h3>
              <p>{t.sections.processDetails[index]}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const whyIcons = ["compass", "layers", "chat", "wrench"];

export function WhyChoose({ language = "EN" }) {
  const t = getTranslation(language);

  return (
    <section className="section alt">
      <div className="container">
        <SectionHeader eyebrow={t.sections.whyEyebrow} title={t.sections.whyTitle} />
        <div className="grid cols-4">
          {t.sections.whyItems.map(([title, text], index) => (
            <article className="card" key={title}>
              <span className="icon-tile">
                <Icon name={whyIcons[index]} size={20} />
              </span>
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
    <section className="section">
      <div className="container">
        <SectionHeader eyebrow={t.sections.techEyebrow} title={t.sections.techTitle} text={t.sections.techText} />
        <div className="tech-grid">
          {Object.entries(technologies).map(([group, items]) => (
            <article className="card" key={group}>
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
        <div className="grid cols-3">
          {t.sections.testimonials.map(([quote, role]) => (
            <figure className="card testimonial" key={quote}>
              <blockquote>“{quote}”</blockquote>
              <figcaption>{role}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQ({ language = "EN" }) {
  const t = getTranslation(language);

  return (
    <section className="section alt">
      <div className="container faq-layout">
        <SectionHeader align="left" eyebrow={t.sections.faqEyebrow} title={t.sections.faqTitle} text={t.sections.faqText} />
        <div className="faq-list">
          {t.sections.faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <Icon name="plus" size={18} className="faq-icon" />
              </summary>
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
    <section className="cta-section">
      <div className="container">
        <div className="cta-panel">
          <div>
            <h2>{t.sections.ctaTitle}</h2>
            <p className="cta-text">{t.sections.ctaText}</p>
          </div>
          <button className="primary" onClick={() => navigate("Contact")}>
            {t.sections.ctaButton}
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

export function ProjectCard({ project }) {
  return (
    <article className="card project-card">
      <div className="project-media">
        <img
          src={project.image}
          alt={project.link ? `${project.name} website screenshot` : `${project.name} interface concept`}
          loading="lazy"
        />
      </div>
      <div className="project-body">
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        {project.tech.length > 0 && (
          <div className="tag-row">
            {project.tech.map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
        )}
        {project.link && (
          <a className="text-link project-link" href={project.link} target="_blank" rel="noreferrer">
            Visit {project.linkLabel}
            <Icon name="external" size={15} />
          </a>
        )}
      </div>
    </article>
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
        <div className="grid cols-3">
          {projects.slice(0, 3).map((project) => (
            <ProjectCard project={project} key={project.name} />
          ))}
        </div>
      </div>
    </section>
  );
}
