import React from "react";
import PageHero from "../components/PageHero.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { team, values } from "../data/siteData.js";

function About() {
  return (
    <>
      <PageHero
        title="About OVTECH"
        text="We are a software development and IT consulting company focused on practical innovation, dependable delivery, and long-term client value."
      />
      <section className="section">
        <div className="container split">
          <div>
            <p className="eyebrow">Company Story</p>
            <h2>Built to help organizations move from manual work to intelligent systems.</h2>
            <p>
              OVTECH was created for companies that need more than code. We help leaders clarify requirements, modernize
              operations, launch digital products, and support systems after release.
            </p>
          </div>
          <div className="mission-grid">
            <article>
              <h3>Mission</h3>
              <p>To empower businesses through secure, scalable, and user-friendly technology solutions.</p>
            </article>
            <article>
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
              <span key={value}>{value}</span>
            ))}
          </div>
        </div>
      </section>
      {/* <section className="section">
        <div className="container">
          <SectionHeader eyebrow="Team" title="Meet the team" />
          <div className="card-grid four">
            {team.map(([name, role]) => (
              <article className="team-card" key={name}>
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
              ["2021", "OVTECH begins consulting and web development engagements."],
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
