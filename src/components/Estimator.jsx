import React, { useMemo, useState } from "react";
import { getTranslation } from "../data/translations.js";

const packages = [
  ["starter", "Starter", 1500],
  ["business", "Business", 4500],
  ["enterprise", "Enterprise", 12000],
];

function Estimator({ language = "EN" }) {
  const t = getTranslation(language).estimator;
  const [scope, setScope] = useState("business");
  const [platforms, setPlatforms] = useState(2);
  const [support, setSupport] = useState(true);

  const estimate = useMemo(() => {
    const base = packages.find(([id]) => id === scope)[2];
    return base + platforms * 850 + (support ? 900 : 0);
  }, [scope, platforms, support]);

  return (
    <section className="section">
      <div className="container estimator">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2>{t.title}</h2>
          <p className="estimator-text">{t.text}</p>
        </div>
        <div className="card estimator-panel">
          <div className="panel-body">
            <div>
              <span className="field-label" id="package-label">
                {t.package}
              </span>
              <div className="segmented" role="radiogroup" aria-labelledby="package-label">
                {packages.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={scope === id}
                    onClick={() => setScope(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <label className="range-field">
              <span className="field-top">
                <span className="field-label">{t.platforms}</span>
                <span className="field-value">
                  {platforms} {platforms > 1 ? t.platformsPlural : t.platform}
                </span>
              </span>
              <input type="range" min="1" max="5" value={platforms} onChange={(event) => setPlatforms(Number(event.target.value))} />
            </label>
            <label className="check-row">
              <input type="checkbox" checked={support} onChange={(event) => setSupport(event.target.checked)} />
              {t.support}
            </label>
            <div className="estimate-output" aria-live="polite">
              <span>{t.result}</span>
              <strong>${estimate.toLocaleString()}+</strong>
              <small>{t.note}</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Estimator;
