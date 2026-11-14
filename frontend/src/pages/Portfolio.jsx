import React from "react";
import PageHero from "../components/PageHero.jsx";
import { ProjectCard } from "../components/sections.jsx";
import { projects } from "../data/siteData.js";

function Portfolio() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Completed projects across practical business domains"
        text="Each solution is built with clear workflows, secure data handling, responsive interfaces, and maintainable architecture."
      />
      <section className="section">
        <div className="container">
          <div className="grid cols-3">
            {projects.map((project) => (
              <ProjectCard project={project} key={project.name} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Portfolio;
