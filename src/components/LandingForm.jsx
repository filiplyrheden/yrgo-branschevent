import React from "react";
import "./LandingForm.css";
import Input from "./Input";
import Button from "./Button";

const LandingForm = () => {
  return (
    <div className="landing-form">
      <div className="landing-form-content">
        <h1>
          <span>&lt;h1&gt;</span>Mingel för framtidens digitala stjärnor!
          <span>&lt;/h1&gt;</span>
        </h1>
        <p>
          <span>&lt;p&gt;</span>Letar ni efter nästa webbutvecklare eller
          digital designer till ert team? Eller bara nyfikna på framtidens
          talanger? Kom och mingla med studenter från Yrgo, se deras projekt och
          kanske hitta en perfekt match – för jobb, samarbete eller LIA!
          <span>&lt;/p&gt;</span>
        </p>
        <p>
          <span>&lt;p&gt;</span>Ta gärna med något som visar vilket företag ni
          representerar. Det blir stationer för möten, men framför allt en
          avslappnad chans att snacka och nätverka.<span>&lt;/p&gt;</span>
        </p>
        <p>
          <span>&lt;p&gt;</span>Välkomna önskar Webbutvecklare & Digital
          Designers på Yrgo!<span>&lt;/p&gt;</span>
        </p>
        <div className="input-container">
          <Input />
          <Input label="Lösenord" placeholder="Lösenord..." />
        </div>
        <div className="checkbox-container">
          <input type="checkbox" id="consent" name="consent" />
          <label for="consent" id="consent-label">
            Jag accepterar Villkor och Sekretesspolicy
          </label>
        </div>
        <div className="button-container">
          <Button />
          <Button text="Student" />
        </div>
      </div>
    </div>
  );
};

export default LandingForm;
