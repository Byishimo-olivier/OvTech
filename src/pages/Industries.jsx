import React from "react";
import PageHero from "../components/PageHero.jsx";
import { industries } from "../data/siteData.js";

function Industries() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Industries"
        text="We serve organizations that need dependable software for daily operations, service delivery, and growth."
      />
      <section className="section">
        <div className="container">
          <div className="grid cols-3">
            {industries.map((industry) => (
              <article className="card" key={industry}>
                <h3>{industry}</h3>
                <p>Digital platforms, integrations, dashboards, and workflow automation tailored for {industry.toLowerCase()} teams.</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Industries;
