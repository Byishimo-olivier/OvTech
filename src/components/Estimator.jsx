import React, { useMemo, useState } from "react";

function Estimator() {
  const [scope, setScope] = useState("business");
  const [platforms, setPlatforms] = useState(2);
  const [support, setSupport] = useState(true);

  const estimate = useMemo(() => {
    const base = scope === "starter" ? 1500 : scope === "business" ? 4500 : 12000;
    return base + platforms * 850 + (support ? 900 : 0);
  }, [scope, platforms, support]);

  return (
    <section className="section estimator-section">
      <div className="container estimator">
        <div>
          <p className="eyebrow">Project Cost Estimator</p>
          <h2>Plan your investment before the first meeting</h2>
          <p>Use a quick estimate to understand budget direction. Final pricing depends on discovery, integrations, timelines, and support needs.</p>
        </div>
        <div className="estimator-panel">
          <label>
            Package
            <select value={scope} onChange={(event) => setScope(event.target.value)}>
              <option value="starter">Starter</option>
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </label>
          <label>
            Platforms
            <input type="range" min="1" max="5" value={platforms} onChange={(event) => setPlatforms(Number(event.target.value))} />
            <span>{platforms} platform{platforms > 1 ? "s" : ""}</span>
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={support} onChange={(event) => setSupport(event.target.checked)} />
            Include launch support
          </label>
          <div className="estimate">${estimate.toLocaleString()}+</div>
        </div>
      </div>
    </section>
  );
}

export default Estimator;
