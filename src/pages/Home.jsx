import Hero from "../components/sections/Hero";
import LandingForm from "../components/sections/LandingForm";
import LandingInfo from "../components/sections/LandingInfo";
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
