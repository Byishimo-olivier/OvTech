import React from "react";
import PageHero from "../components/PageHero.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Icon from "../components/Icon.jsx";
import { team, values } from "../data/siteData.js";

function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="About Over Rentals"
        text="We are a software engineering and IT consulting company focused on practical innovation, dependable delivery, and long-term client value."
      />
      <section className="section">
        <div className="container split">
          <div>
            <p className="eyebrow">Company Story</p>
            <h2 className="split-title">Built to help organizations move from manual work to intelligent systems.</h2>
            <p className="split-text">
              Over Rentals was created for companies that need more than code. We help leaders clarify requirements, modernize
              operations, launch digital products, and support systems after release.
            </p>
          </div>
          <div className="mission-grid">
            <article className="card">
              <span className="icon-tile">
                <Icon name="compass" size={20} />
              </span>
              <h3>Mission</h3>
              <p>To empower businesses through secure, scalable, and user-friendly technology solutions.</p>
            </article>
            <article className="card">
              <span className="icon-tile">
                <Icon name="layers" size={20} />
              </span>
              <h3>Vision</h3>
              <p>To become a trusted technology partner for organizations building the future of digital operations.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="section alt">
        <div className="container">
          <SectionHeader eyebrow="Core Values" title="The principles behind our work" />
          <div className="value-grid">
            {values.map((value) => (
              <span className="value-item" key={value}>
                <Icon name="check" size={18} strokeWidth={2.2} />
                {value}
              </span>
            ))}
          </div>
        </div>
      </section>
      {/* <section className="section">
        <div className="container">
          <SectionHeader eyebrow="Team" title="Meet the team" />
          <div className="grid cols-4">
            {team.map(([name, role]) => (
              <article className="card team-card" key={name}>
                <div className="avatar">{name.split(" ").map((part) => part[0]).join("")}</div>
                <h3>{name}</h3>
                <p>{role}</p>
              </article>
            ))}
          </div>
        </div>
      </section> */}
      {/* <section className="section alt">
        <div className="container">
          <SectionHeader eyebrow="Timeline" title="Company milestones" />
          <div className="timeline">
            {[
              ["2021", "Over Rentals begins consulting and web development engagements."],
              ["2022", "Expanded into custom business systems and mobile applications."],
              ["2023", "Launched maintenance and property management product initiatives."],
              ["2024", "Added cloud, cybersecurity, and AI consulting capabilities."],
              ["2025", "Scaled delivery process for multi-industry digital platforms."],
            ].map(([year, text]) => (
              <div className="timeline-row" key={year}>
                <strong>{year}</strong>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </>
  );
}

export default About;
