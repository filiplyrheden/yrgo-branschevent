import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import "./Swipe.css";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import { useNotification } from "./notifications/NotificationSystem";
import {
  showSuccess,
  showError,
  showInfo,
} from "../components/utils/notifications";

const Swipe = () => {
  const [companies, setCompanies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(null);

  // Använd useRef istället för useState
  const notificationShownRef = useRef(false);

  // Add new state for popup
  const [showPopup, setShowPopup] = useState(() => {
    // Check if the user has seen the popup before
    return localStorage.getItem("swipePopupSeen") !== "true";
  });

  const controls = useAnimation();
  const { addNotification } = useNotification();

  // Add the closePopup function
  const closePopup = () => {
    setShowPopup(false);
    // Save to localStorage that the user has seen the popup
    localStorage.setItem("swipePopupSeen", "true");
  };

  // Fetch companies when component mounts
  useEffect(() => {
    if (!notificationShownRef.current) {
      fetchCompanies();
      notificationShownRef.current = true;
    }
  }, []); // Ta bort notificationShown som dependency

  const fetchCompanies = async () => {
    try {
      // Kontrollera om vi redan laddar för att undvika dubbla anrop
      if (loading) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("companies")
        .select(
          `
          *,
          company_additional_info (additional_work_info),
          company_specialties (specialty)
        `
        )
        .eq("coming_to_event", true);

      if (error) {
        console.error("Error fetching companies:", error);
        showError(
          addNotification,
          "Kunde inte hämta företagsinformation",
          "Datahämtningsfel"
        );
        throw error;
      }

      if (data) {
        console.log("Companies data:", data);
        setCompanies(data);

        // Använd en timeout för att förhindra att notifieringar visas för snabbt efter varandra
        setTimeout(() => {
          if (data.length === 0) {
            showInfo(
              addNotification,
              "Inga företag finns tillgängliga för swipe just nu. Kom tillbaka senare!",
              "Inga företag"
            );
          }
        }, 300);
      }
    } catch (error) {
      console.error("Error fetching companies:", error.message);
      showError(
        addNotification,
        "Ett fel uppstod när företagsinformation skulle hämtas. Vänligen försök igen senare.",
        "Hämtningsfel"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    // Skip if no more companies
    if (currentIndex >= companies.length) return;

    const company = companies[currentIndex];
    setDirection(direction);

    // Animate the card off screen
    await controls.start({
      x: direction === "right" ? 600 : -600,
      opacity: 0,
      transition: { duration: 0.3 },
    });

    // If direction is right, save the like to favorites
    if (direction === "right") {
      try {
        console.log(
          "Attempting to save favorite for company:",
          company.company_name
        );
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData?.session?.user) {
          const userId = sessionData.session.user.id;
          console.log("User ID:", userId, "Company ID:", company.id);

          // Check if already liked
          const { data: existingLike, error: checkError } = await supabase
            .from("favorites")
            .select("*")
            .eq("student_id", userId)
            .eq("company_id", company.id)
            .single();

          if (checkError && checkError.code !== "PGRST116") {
            console.error("Error checking existing favorite:", checkError);
          }

          if (!existingLike) {
            // Save to favorites
            const { data, error } = await supabase.from("favorites").insert({
              student_id: userId,
              company_id: company.id,
            });

            if (error) {
              console.error("Error saving favorite:", error);
              showError(
                addNotification,
                "Kunde inte lägga till företaget i favoriter",
                "Sparfel"
              );
            } else {
              console.log("Saved to favorites:", company.company_name, data);
              showSuccess(
                addNotification,
                `${company.company_name} har lagts till i dina favoriter!`,
                "Favorit sparad"
              );
            }
          } else {
            console.log("Company already in favorites:", company.company_name);
            showInfo(
              addNotification,
              `${company.company_name} finns redan i dina favoriter`,
              "Information"
            );
          }
        } else {
          console.log("No user session found");
          showError(
            addNotification,
            "Du måste vara inloggad för att spara favoriter",
            "Sessionsfel"
          );
        }
      } catch (error) {
        console.error("Error saving favorite:", error);
        showError(
          addNotification,
          "Kunde inte spara företaget som favorit",
          "Fel"
        );
      }
    } else {
      // Left swipe - "nej tack"
      showInfo(
        addNotification,
        `Du valde att skippa ${company.company_name}`,
        "Du swipeade nej"
      );
    }

    // Move to next card
    setCurrentIndex((prev) => prev + 1);
    // Reset animation controls for the next card
    controls.set({ x: 0, opacity: 1 });
  };

  const handleDragEnd = (_, info) => {
    const threshold = 100; // px to consider a swipe

    if (info.offset.x > threshold) {
      handleSwipe("right");
    } else if (info.offset.x < -threshold) {
      handleSwipe("left");
    } else {
      // Reset position if not swiped far enough
      controls.start({ x: 0, opacity: 1 });
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div>
        <Header />
        <div className="swipe-container">
          <div className="swipe-loading" role="status" aria-live="polite">
            <div className="loading-spinner"></div>
            <p>Laddar företag...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // No more companies to show
  if (currentIndex >= companies.length) {
    return (
      <div>
        <Header />
        <div className="swipe-container">
          <div className="swipe-main">
            <h2 className="swipe-title">Inga fler företag</h2>
            <p className="swipe-description">
              Du har gått igenom alla tillgängliga företag. Kom tillbaka senare
              för fler!
            </p>
            <button
              className="redigera-button"
              onClick={() => {
                setCurrentIndex(0);
                showInfo(
                  addNotification,
                  "Swipe-listan har börjat om från början",
                  "Börjar om"
                );
              }}
            >
              Börja om
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // No companies found
  if (companies.length === 0 && !loading) {
    return (
      <div>
        <Header />
        <div className="swipe-container">
          <div className="swipe-main">
            <h2 className="swipe-title">Inga företag att visa</h2>
            <p className="swipe-description">
              Det finns inga företag tillgängliga just nu. Kom tillbaka senare!
            </p>
            <button
              className="redigera-button"
              onClick={() => {
                // Använd ref istället för state
                notificationShownRef.current = false;
                fetchCompanies();
              }}
            >
              Uppdatera listan
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const company = companies[currentIndex];

  return (
    <div>
      <Header />
      <div className="swipe-container">
        <div className="swipe-main">
          <div className="card-container">
            <AnimatePresence>
              <motion.div
                key={currentIndex}
                className="swipe-card"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                initial={{ x: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                whileTap={{ scale: 1.05 }}
                whileDrag={{ scale: 1.05 }}
              >
                <div className="card">
                  <div className="card-left">
                    <div className="card-image">
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={`${company.company_name} logotyp`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                          }}
                        />
                      ) : (
                        <div className="placeholder-image">
                          <svg
                            viewBox="0 0 100 100"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <circle cx="50" cy="35" r="25" fill="#4F4F4F" />
                            <path
                              d="M100 100 H0 V70 C0 50 25 50 50 60 C75 50 100 50 100 70 Z"
                              fill="#4F4F4F"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-info">
                    <h3>{company.company_name}</h3>

                    {company.website_url && (
                      <div className="website-container">
                        <div className="icon-circle">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#E51236"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                          </svg>
                        </div>
                        <a
                          href={`https://${company.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="card-website"
                        >
                          {company.website_url}
                        </a>
                      </div>
                    )}

                    {company.email && (
                      <div className="email-container">
                        <div className="icon-circle">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#E51236"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </div>
                        <a
                          href={`mailto:${company.email}`}
                          className="card-email"
                        >
                          {company.email}
                        </a>
                      </div>
                    )}

                    <p className="card-attending">
                      Vi kommer närvara på minglet den 23/4
                    </p>

                    <div className="attendance">
                      <div
                        className={`attendance-button ${
                          company.coming_to_event ? "active" : ""
                        }`}
                      >
                        Ja
                      </div>
                      <div
                        className={`attendance-button ${
                          !company.coming_to_event ? "active" : ""
                        }`}
                      >
                        Nej
                      </div>
                    </div>

                    {company.company_specialties &&
                      company.company_specialties.length > 0 && (
                        <div className="card-specialties">
                          <p>Vi jobbar med:</p>
                          <div className="specialty-tags">
                            {company.company_specialties.map((specialty, i) => (
                              <span key={i} className="specialty-tag">
                                {specialty.specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {company.company_additional_info &&
                      company.company_additional_info.length > 0 &&
                      company.company_additional_info[0]
                        ?.additional_work_info && (
                        <div className="card-additional-info">
                          <p>Roligt att veta om oss:</p>
                          <div className="info-box">
                            <p className="info-swipe-text">
                              {
                                company.company_additional_info[0]
                                  .additional_work_info
                              }
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="swipe-buttons">
            <button
              className="swipe-button dislike"
              onClick={() => handleSwipe("left")}
              aria-label="Skippa detta företag"
            >
              <svg
                width="52"
                height="50"
                viewBox="0 0 52 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M19.3256 21.813C18.6703 21.7325 18.039 21.4283 17.5529 20.9042L4.19137 6.5032C3.0853 5.31531 3.14408 3.43446 4.32445 2.31C5.50352 1.18656 7.35906 1.23983 8.46341 2.43227L21.8254 16.8298C22.931 18.0212 22.8725 19.8997 21.6918 21.0265C21.0315 21.6544 20.1586 21.9153 19.3256 21.813Z"
                  fill="#E51236"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M32.6744 21.813C33.3297 21.7325 33.961 21.4283 34.4471 20.9042L47.8086 6.5032C48.9147 5.31531 48.8559 3.43446 47.6756 2.31C46.4965 1.18656 44.6409 1.23983 43.5366 2.43227L30.1746 16.8298C29.069 18.0212 29.1275 19.8997 30.3082 21.0265C30.9685 21.6544 31.8414 21.9153 32.6744 21.813Z"
                  fill="#E51236"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M6.64778 48.4758C5.81236 48.5784 4.9402 48.3242 4.27981 47.7098C3.09798 46.6071 3.0445 44.7657 4.1547 43.5914L17.5799 29.4261C18.6902 28.2528 20.5479 28.1925 21.7287 29.2954C22.9103 30.3958 22.965 32.2381 21.8534 33.4104L8.42982 47.5789C7.93997 48.0946 7.3062 48.395 6.64778 48.4758Z"
                  fill="#E51236"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M45.3522 48.4758C46.1876 48.5784 47.0598 48.3242 47.7202 47.7098C48.902 46.6071 48.9555 44.7657 47.8453 43.5914L34.4201 29.4261C33.3098 28.2528 31.4521 28.1925 30.2713 29.2954C29.0897 30.3958 29.035 32.2381 30.1466 33.4104L43.5702 47.5789C44.06 48.0946 44.6938 48.395 45.3522 48.4758Z"
                  fill="#E51236"
                />
              </svg>
            </button>

            <button
              className="swipe-button like"
              onClick={() => handleSwipe("right")}
              aria-label="Lägg till detta företag i favoriter"
            >
              <svg
                width="62"
                height="55"
                viewBox="0 0 62 55"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  id="Vector"
                  d="M50.6401 2.26221C44.7307 -0.479127 37.4754 0.33517 30.9993 6.11455C24.5275 0.33492 17.2685 -0.478752 11.3599 2.26221L11.3598 2.26224C5.15518 5.14298 0.843385 11.782 0.751498 19.448H0.75V19.698V19.948H0.751128C0.791599 24.4286 1.9189 28.3029 3.71122 31.702L3.7102 31.7026L3.82736 31.9199L3.82739 31.9199L3.94738 32.1426L3.9592 32.136C4.08633 32.3215 4.23923 32.4881 4.41359 32.6304C4.65328 32.8261 4.9288 32.9721 5.22448 33.0599C5.52017 33.1478 5.8301 33.1756 6.1365 33.142C6.44291 33.1083 6.73963 33.0137 7.00972 32.8637C7.2798 32.7138 7.51788 32.5115 7.71051 32.2685C7.90314 32.0255 8.04656 31.7467 8.13277 31.4478C8.21897 31.149 8.24631 30.8359 8.21327 30.5265C8.18912 30.3003 8.13303 30.0791 8.04703 29.8697L8.05845 29.8634L7.97185 29.7048C7.96155 29.6843 7.95095 29.6639 7.94005 29.6437L7.81994 29.4209L7.81898 29.4215C6.27323 26.5041 5.45495 23.2465 5.43605 19.9337V19.6988V19.698L5.43709 19.5143C5.5045 13.5989 8.82173 8.66289 13.3117 6.57839C17.6946 4.54503 23.6166 5.05478 29.2892 11.0196C29.2967 11.0275 29.3042 11.0354 29.3116 11.0433L29.3118 11.0434L29.4862 11.2273L29.4961 11.2176C29.6723 11.3671 29.8698 11.4898 30.0823 11.5815C30.3724 11.7066 30.6845 11.7712 31 11.7712C31.3155 11.7712 31.6276 11.7066 31.9177 11.5815C32.1302 11.4899 32.3276 11.3671 32.5038 11.2177L32.5137 11.2273L32.6882 11.0434L32.6883 11.0433C32.6925 11.0389 32.6966 11.0346 32.7008 11.0302C38.3764 5.05815 44.3029 4.54386 48.6883 6.57839C53.2247 8.68445 56.564 13.6984 56.564 19.698C56.564 25.8455 54.0866 30.5836 50.5198 34.6638C47.5704 38.0323 44.0035 40.823 40.5031 43.5617C39.7383 44.1601 38.9766 44.756 38.2252 45.355L38.225 45.3547L38.0271 45.5132L38.027 45.5132C38.0263 45.5138 38.0256 45.5143 38.0249 45.5149C37.9612 45.566 37.8977 45.6167 37.8346 45.6672C36.4432 46.7792 35.2068 47.742 34.0151 48.4468C32.7678 49.1844 31.8006 49.5023 31 49.5023C30.1991 49.5023 29.229 49.187 27.9855 48.4471L27.9849 48.4468C26.7932 47.742 25.5568 46.7792 24.1654 45.6672L24.1655 45.6671L23.973 45.5132L23.9728 45.5131C23.9497 45.4946 23.9267 45.4762 23.9039 45.4579C22.8392 44.6041 22.164 43.9974 21.4784 43.3722C21.417 43.3162 21.3555 43.26 21.2936 43.2035C20.6878 42.6504 20.0456 42.0641 19.102 41.2699L19.1023 41.2695L18.9132 41.1117L18.9131 41.1116C18.9129 41.1114 18.9127 41.1112 18.9124 41.111L18.7185 40.949L18.7098 40.9597C18.2645 40.6633 17.7299 40.5277 17.1939 40.5807C16.5736 40.642 16.0037 40.9508 15.609 41.4378C15.2144 41.9247 15.027 42.55 15.0871 43.1761C15.1393 43.7196 15.3743 44.2261 15.7494 44.6124L15.7413 44.6224L15.9294 44.7795C15.9298 44.7798 15.9301 44.7801 15.9304 44.7803C17.0006 45.674 17.734 46.3381 18.4214 46.9606C18.4751 47.0092 18.5285 47.0576 18.5818 47.1058C19.2719 47.7303 19.9377 48.3268 20.8759 49.085L20.8754 49.0856L21.068 49.2395L21.0681 49.2396C21.069 49.2403 21.0698 49.2409 21.0707 49.2416L21.266 49.3979L21.2661 49.3977C22.6401 50.4944 24.118 51.6536 25.6175 52.5442C27.1234 53.4386 28.8575 54.1848 30.75 54.246V54.25H31H31.25V54.2459C33.1426 54.1846 34.8767 53.4357 36.3823 52.5443L36.3824 52.5443C37.8846 51.6537 39.3603 50.4942 40.7339 49.3978L40.7341 49.398L40.9298 49.2413C40.9305 49.2407 40.9312 49.2401 40.9319 49.2396L40.932 49.2395C40.9857 49.1965 41.0396 49.1534 41.0937 49.1103C41.7827 48.5606 42.5051 47.9961 43.2493 47.4146C46.7622 44.6694 50.7604 41.545 54.0244 37.8136C58.0733 33.189 61.1813 27.4517 61.2489 19.948H61.25V19.698V19.448H61.2485C61.1567 11.7821 56.8476 5.14298 50.6401 2.26222L50.6401 2.26221Z"
                  fill="#E51236"
                  stroke="#E51236"
                  stroke-width="0.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <Footer />
      {showPopup && (
        <div className="welcome-popup-overlay">
          <div className="welcome-popup">
            <h2 className="welcome-popup-title">Välkommen till Swipe!</h2>
            <div className="welcome-popup-content">
              <p>
                Här kan du "dejta" olika företag som deltar i branschminglet.
              </p>
              <p>
                Swipa höger för att lägga till företag i dina favoriter eller
                vänster för att skippa.
              </p>
            </div>
            <button onClick={closePopup} className="welcome-popup-button">
              Stäng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swipe;
