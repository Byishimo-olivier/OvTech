import React from "react";

function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <button className="brand footer-brand" onClick={() => navigate("Home")}>
            <span className="brand-mark">OV</span>
            <span>
              <strong>OVTECH</strong>
              <small>Innovating Today. Empowering Tomorrow.</small>
            </span>
          </button>
          <p>Software development, IT consulting, cloud solutions, cybersecurity, AI, and long-term support.</p>
        </div>
        <div>
          <h3>Company</h3>
          {["About", "Services", "Portfolio", "Products", "Careers"].map((item) => (
            <button key={item} onClick={() => navigate(item)}>
              {item}
            </button>
          ))}
        </div>
        <div>
          <h3>Resources</h3>
          {["Blog", "Knowledge Base", "Customer Portal", "Newsletter"].map((item) => (
            <button key={item} onClick={() => (item === "Blog" ? navigate("Blog") : navigate("Contact"))}>
              {item}
            </button>
          ))}
        </div>
        <div>
          <h3>Newsletter</h3>
          <p>Get business technology insights and OVTECH updates.</p>
          <div className="newsletter">
            <input placeholder="Email address" />
            <button className="primary small">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">© 2026 OVTECH. All rights reserved.</div>
    </footer>
  );
}

export default Footer;
