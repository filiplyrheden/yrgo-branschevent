import React from "react";
import "../../styles/Global.css";
import styled from "styled-components";
import Button from "../ui/Button";

const RegisterPopupContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const RegisterPopupContent = styled.div`
  background-color: white;
  padding: 2rem;
  width: 90%;
  max-width: 58rem;
  text-align: center;
  position: relative;
  border-radius: 8px;
`;

const RegisterPopupTitle = styled.h2`
  color: #e51236;
  font-family: var(--Font-IBM-Plex-Mono);
  text-align: left;
`;

const RegisterPopupText = styled.p`
  margin-bottom: 1rem;
  text-align: left;
`;

const RegisterPopup = ({ onClose }) => {
  return (
    <RegisterPopupContainer>
      <RegisterPopupContent>
        <RegisterPopupTitle>Varför registrera sig?</RegisterPopupTitle>
        <RegisterPopupText>
          För att se tillgängliga LIA-annonser och hitta rätt matchning behöver
          du skapa ett konto.
        </RegisterPopupText>
        <RegisterPopupText>
          • Företag – Skapa ett konto för att lägga upp annonser och hitta
          praktikanter.
        </RegisterPopupText>
        <RegisterPopupText>
          • Studenter – Registrera dig för att se och ansöka till
          praktikannonser.
        </RegisterPopupText>
        <RegisterPopupText>
          Registreringen är enkel – och öppnar dörren till din nästa möjlighet!
        </RegisterPopupText>
        <Button onClick={onClose} text="Stäng" />
      </RegisterPopupContent>
    </RegisterPopupContainer>
  );
};

export default RegisterPopup;
