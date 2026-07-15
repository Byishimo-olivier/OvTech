import React from "react";
import PageHero from "../components/PageHero.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Estimator from "../components/Estimator.jsx";
import { pricingPlans } from "../data/siteData.js";

function Pricing() {
  return (
    <>
      <PageHero title="Pricing" text="Choose a starting package or request a custom quote for complex systems and long-term support." />
      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="Packages" title="Simple starting points for different project sizes" />
          <div className="card-grid four">
            {pricingPlans.map(([name, price, text]) => (
              <article className="product-card" key={name}>
                <h3>{name}</h3>
                <div className="estimate mini">{price}</div>
                <p>{text}</p>
                <button className="text-link">Request Quote</button>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Estimator />
    </>
  );
}

export default Pricing;
