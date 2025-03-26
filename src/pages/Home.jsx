import Hero from "../components/Hero";
import LandingForm from "../components/LandingForm";
import LandingInfo from "../components/LandingInfo";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const arrow = document.querySelector(".arrow-wrapper");

    const handleClick = () => {
      document.querySelector(".landing-section")?.scrollIntoView({
        behavior: "smooth",
      });
    };

    arrow?.addEventListener("click", handleClick);

    return () => {
      arrow?.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <>
      <Hero />
      <>
        <LandingForm />
      </>
      <>
        <LandingInfo />
      </>
    </>
  );
}
