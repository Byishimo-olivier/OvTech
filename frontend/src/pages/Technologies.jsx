import React from "react";
import PageHero from "../components/PageHero.jsx";
import { TechStack } from "../components/sections.jsx";

function Technologies({ language = "EN" }) {
  return (
    <>
      <PageHero eyebrow="Technologies" title="Technologies" text="A focused stack for modern frontend, backend, database, cloud, and delivery workflows." />
      <TechStack language={language} />
    </>
  );
}

export default Technologies;
