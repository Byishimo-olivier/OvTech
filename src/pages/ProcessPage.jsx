import React from "react";
import PageHero from "../components/PageHero.jsx";
import { Process } from "../components/sections.jsx";

function ProcessPage() {
  return (
    <>
      <PageHero title="Process" text="A practical delivery workflow from discovery through planning, design, development, testing, deployment, and maintenance." />
      <Process />
    </>
  );
}

export default ProcessPage;
