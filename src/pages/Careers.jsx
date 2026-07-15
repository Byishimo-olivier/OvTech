import React from "react";
import PageHero from "../components/PageHero.jsx";

function Careers() {
  return (
    <>
      <PageHero title="Careers" text="Join a team that values learning, ownership, thoughtful engineering, and useful technology." />
      {/* <section className="section">
        <div className="container split">
          <div>
            <p className="eyebrow">Openings</p>
            <h2>Current opportunities</h2>
            <div className="opening-list">
              {["Frontend Developer", "Backend Developer", "UI/UX Design Intern", "Cloud Support Intern"].map((role) => (
                <article key={role}>
                  <strong>{role}</strong>
                  <span>Kigali / Hybrid</span>
                  <button className="text-link">Apply</button>
                </article>
              ))}
            </div>
          </div>
          <div className="culture-panel">
            <h3>Company culture</h3>
            <p>
              We encourage practical curiosity, clear communication, mentorship, code quality, and client empathy. Internship
              opportunities are available for people ready to learn through real product work.
            </p>
          </div>
        </div>
      </section> */}
    </>
  );
}

export default Careers;
