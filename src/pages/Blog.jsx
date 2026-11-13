import React from "react";
import PageHero from "../components/PageHero.jsx";
import Icon from "../components/Icon.jsx";
import { posts } from "../data/siteData.js";

function Blog() {
  return (
    <>
      <PageHero eyebrow="Blog" title="Blog" text="Insights on software development, AI, cloud computing, cybersecurity, and business technology." />
      <section className="section">
        <div className="container">
          <div className="grid cols-3">
            {posts.map(([category, title]) => (
              <article className="card blog-card" key={title}>
                <span className="blog-tag">{category}</span>
                <h3>{title}</h3>
                <p>Practical guidance from the Over Rentals team for leaders planning stronger digital systems.</p>
                <button className="text-link card-link">
                  Read Article
                  <Icon name="arrow" size={15} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Blog;
