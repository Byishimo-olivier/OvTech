import React from "react";
import PageHero from "../components/PageHero.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Estimator from "../components/Estimator.jsx";
import Icon from "../components/Icon.jsx";
import { pricingPlans } from "../data/siteData.js";

function Pricing({ navigate, language = "EN" }) {
  return (
    <>
      <PageHero eyebrow="Pricing" title="Pricing" text="Choose a starting package or request a custom quote for complex systems and long-term support." />
      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="Packages" title="Simple starting points for different project sizes" />
          <div className="grid cols-4">
            {pricingPlans.map(([name, price, text]) => (
              <article className="card plan-card" key={name}>
                <h3>{name}</h3>
                <div className="plan-price">{price}</div>
                <p>{text}</p>
                <button className="text-link card-link" onClick={() => navigate && navigate("Contact")}>
                  Request Quote
                  <Icon name="arrow" size={15} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Estimator language={language} />
    </>
  );
}

export default Pricing;
