import React from "react";
import "./LandingInfo.css";

const LandingInfo = () => {
  return (
    <div className="landing-info">
      <div className="landing-info-content">
        <div className="landing-info-info">
          <h4 className="info-heading">Tid:</h4>
          <p className="info-text">13:00 - 15:00</p>
          <h4 className="info-heading">Plats:</h4>
          <p className="info-text">Visual Arena</p>
          <h4 className="info-heading">Adress:</h4>
          <p className="info-text" id="adress">
            Lindholmspiren 3
          </p>
          <p className="info-text">417 55 Göteborg</p>
        </div>

        <div className="landing-info-grid">
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
        </div>
      </div>
    </div>
  );
};

export default LandingInfo;
