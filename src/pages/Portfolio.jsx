import React from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import { projects } from "../data/siteData.js";

function Portfolio() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Portfolio"
          title="Completed projects across practical business domains"
          text="Each solution includes useful images, technologies, descriptions, demo actions, and optional GitHub links."
        />
        <div className="project-grid">
          {projects.map((project) => (
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

export default Portfolio;
