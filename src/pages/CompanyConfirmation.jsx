import React from "react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import "./CompanyConfirmation.css";
import { AddToCalendarButton } from "add-to-calendar-button-react";

const CompanyConfirmation = () => {
  return (
    <>
      <Header />
      <main className="company-confirmation">
        <div className="company-confirmation-content">
          <div className="company-confirmation-info">
            <h1 className="confirmation-info-heading">
              Tack för att du registrerade dig!
            </h1>
            <p className="confirmation-info-text">
              Varmt välkommen den 24 april på Dev & Designer Mingel hos Yrgo.
            </p>

            <p className="time-text">
              <b>Tid:</b> 13:00 - 15:00
            </p>
            <p className="time-text">
              <b>Plats:</b> Visual Arena
            </p>
            <p className="time-text">
              <b>Adress:</b> Lindholmspiren 3 417 55 Göteborg
            </p>

            <div className="calendar-button-container">
              <AddToCalendarButton
                name="Dev & Designer Mingel hos Yrgo"
                startDate="2025-04-24"
                startTime="13:00"
                endTime="15:00"
                options={["Apple", "Google"]}
                timeZone="Europe/Stockholm"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CompanyConfirmation;
