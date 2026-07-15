import React from "react";
import PageHero from "../components/PageHero.jsx";
import { posts } from "../data/siteData.js";

function Blog() {
  return (
    <>
      <PageHero title="Blog" text="Insights on software development, AI, cloud computing, cybersecurity, and business technology." />
      <section className="section">
        <div className="container">
          <div className="card-grid three">
            {posts.map(([category, title]) => (
              <article className="blog-card" key={title}>
                <span>{category}</span>
                <h3>{title}</h3>
                <p>Practical guidance from the OVTECH team for leaders planning stronger digital systems.</p>
                <button className="text-link">Read Article</button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Blog;
