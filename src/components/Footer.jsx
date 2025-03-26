import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="footer-content">
        <div className="upper-section"></div>
        <div className="bottom-section">
          <div className="red-line"></div>
          <p>© 2025 Yrgo, högre yrkesutbildning Göteborg</p>
          <div className="gbg-logo">
            <img src="public/gbg-logo.png" alt="" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
