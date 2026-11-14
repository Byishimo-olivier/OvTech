import React from "react";

function SectionHeader({ eyebrow, title, text, align = "center" }) {
  return (
    <div className={align === "left" ? "section-header left" : "section-header"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export default SectionHeader;
