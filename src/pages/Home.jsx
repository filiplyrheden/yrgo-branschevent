import Hero from "../components/Hero";
import LandingForm from "../components/LandingForm";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const handleScroll = (e) => {
      if (window.scrollY < 50 && e.deltaY > 0) {
        document.querySelector(".landing-section")?.scrollIntoView({
          behavior: "smooth",
        });
      }
    };

    document.addEventListener("wheel", handleScroll);

    return () => {
      document.removeEventListener("wheel", handleScroll);
    };
  }, []);

  return (
    <>
      <Hero />
      <div className="landing-section">
        <LandingForm />
      </div>
    </>
  );
}
