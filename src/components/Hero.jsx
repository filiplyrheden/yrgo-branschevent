import React from "react";
import "./Hero.css";

const Hero = ({ onArrowClick }) => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text-container">
          <div className="hero-text">
            <h2 className="hero-title">Dev & Designer Mingel</h2>
            <div className="date-and-arrow">
              <p className="hero-date">23.04.25</p>

              <div className="arrow-wrapper" onClick={onArrowClick}>
                <svg
                  className="hero-arrow"
                  xmlns="http://www.w3.org/2000/svg"
                  width="77"
                  height="77"
                  viewBox="0 0 77 77"
                  fill="none"
                >
                  <path
                    d="M28.6378 51.5442H50.9117V29.2703"
                    stroke="white"
                    stroke-width="7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M50.9117 51.5442L25.4559 26.0883"
                    stroke="white"
                    stroke-width="7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-icons">
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
