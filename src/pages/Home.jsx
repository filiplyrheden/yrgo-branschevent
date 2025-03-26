import Hero from "../components/Hero";
import LandingForm from "../components/LandingForm";
import LandingInfo from "../components/LandingInfo";
import { useRef } from "react";

export default function Home() {
  const landingRef = useRef(null);

  const scrollToLanding = () => {
    landingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Hero onArrowClick={scrollToLanding} />
      <div ref={landingRef} className="landing-section">
        <LandingForm />
      </div>
      <LandingInfo />
    </>
  );
}
