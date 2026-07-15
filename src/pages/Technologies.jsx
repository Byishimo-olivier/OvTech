import React from "react";
import PageHero from "../components/PageHero.jsx";
import { TechStack } from "../components/sections.jsx";

function Technologies() {
  return (
    <>
      <PageHero title="Technologies" text="A focused stack for modern frontend, backend, database, cloud, and delivery workflows." />
      <TechStack />
    </>
  );
}

export default Technologies;
