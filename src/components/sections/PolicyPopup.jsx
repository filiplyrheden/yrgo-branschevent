import React from "react";
import "../../styles/Global.css";
import styled from "styled-components";
import Button from "../ui/Button";

const PolicyPopupContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 90vw;
  max-height: 90vh;
  width: 100%;
  overflow: auto;
  padding: 2rem;
  background-color: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  z-index: 1000;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
`;

const PolicyPopupContent = styled.div`
  background-color: white;
  padding: 2rem;
  width: 90%;
  height: 90%;
  max-width: 67.125rem;
  text-align: center;
  position: relative;
  border-radius: 8px;
`;

const PolicyPopupTitle = styled.h2`
  color: #e51236;
  font-family: var(--Font-IBM-Plex-Mono);
  text-align: left;
  font-size: 2rem;
`;

const PolicyPopupBold = styled.p`
  font-family: var(--Font-Inter);
  color: var(--Primary-Navy);
  text-align: left;
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 0;
`;

const PolicyPopupText = styled.p`
  margin-bottom: 1rem;
  text-align: left;
  font-family: var(--Font-Inter);
  color: var(--Primary-Navy);
  font-size: 1.5rem;
  font-weight: 400;
`;

const PolicyPopupLink = styled.a`
  font-family: var(--Font-Inter);
  color: var(--Primary-Navy);
  text-align: left;
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 0;
  text-decoration: underline;
`;

const PolicyPopup = ({ onClose }) => {
  return (
    <PolicyPopupContainer>
      <PolicyPopupContent>
        <PolicyPopupTitle>Villkor och säkerhetspolicy</PolicyPopupTitle>
        <PolicyPopupBold>
          1. Insamling och användning av personuppgifter
        </PolicyPopupBold>
        <PolicyPopupText>
          När du registrerar dig för vårt event samlar vi in din e-postadress
          och ditt lösenord. Dessa uppgifter används enbart för att hantera din
          anmälan, ge dig tillgång till eventet och skicka viktig information
          relaterad till eventet. Vi kommer inte att använda dina uppgifter för
          marknadsföring utan ditt samtycke.
        </PolicyPopupText>
        <PolicyPopupBold>
          2. Lagring och skydd av dina uppgifter
        </PolicyPopupBold>
        <PolicyPopupText>
          Dina uppgifter lagras på en säker server och skyddas med kryptering
          och andra säkerhetsåtgärder för att förhindra obehörig åtkomst. Ditt
          lösenord lagras i krypterad form och vi har ingen möjlighet att se det
          i klartext.
        </PolicyPopupText>
        <PolicyPopupBold>3. Delning av uppgifter </PolicyPopupBold>
        <PolicyPopupText>
          Vi delar inte dina uppgifter med tredje part, förutom om det krävs
          enligt lag eller om det är nödvändigt för att genomföra eventet (t.ex.
          samarbete med en betrodd tjänsteleverantör för eventhantering).
        </PolicyPopupText>
        <PolicyPopupBold>4. Dina rättigheter </PolicyPopupBold>
        <PolicyPopupText>
          Du har rätt att: Begära tillgång till de uppgifter vi har om dig,
          rätta felaktiga uppgifter, begära radering av dina uppgifter efter
          eventet, om det inte strider mot lagliga krav. För att utöva dessa
          rättigheter, kontakta oss{" "}
          <PolicyPopupLink href="mailto:filip.lyrheden@gmail.com">
            via mejl
          </PolicyPopupLink>
          .
        </PolicyPopupText>
        <PolicyPopupBold>5. Lösenord och kontosäkerhet </PolicyPopupBold>
        <PolicyPopupText>
          För att skydda ditt konto rekommenderar vi att du väljer ett starkt
          lösenord och inte delar det med någon. Om du misstänker obehörig
          åtkomst till ditt konto, kontakta oss omedelbart.
        </PolicyPopupText>
        <PolicyPopupBold>6. Ändringar i policyn </PolicyPopupBold>
        <PolicyPopupText>
          Vi kan komma att uppdatera denna policy vid behov. Den senaste
          versionen kommer alltid att finnas tillgänglig på vår webbplats. Om du
          har frågor om vår policy eller hantering av dina uppgifter, kontakta
          oss kontakta oss{" "}
          <PolicyPopupLink href="mailto:filip.lyrheden@gmail.com">
            via mejl
          </PolicyPopupLink>
          .
        </PolicyPopupText>
        <Button onClick={onClose} text="Stäng" />
      </PolicyPopupContent>
    </PolicyPopupContainer>
  );
};

export default PolicyPopup;
