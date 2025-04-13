import React, { useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import "./Swipe.css";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import { useNotification } from "./notifications/NotificationSystem";
import { showSuccess, showError, showInfo } from "../components/utils/notifications";

const Swipe = () => {
  const [companies, setCompanies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(null);
  const controls = useAnimation();
  const { addNotification } = useNotification();

  // Fetch companies when component mounts
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
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
        showError(addNotification, "Kunde inte hämta företagsinformation", "Datahämtningsfel");
        throw error;
      }

      if (data) {
        console.log("Companies data:", data);
        setCompanies(data);
        
        if (data.length === 0) {
          showInfo(
            addNotification, 
            "Inga företag finns tillgängliga för swipe just nu. Kom tillbaka senare!", 
            "Inga företag"
          );
        } else {
          showSuccess(
            addNotification, 
            `${data.length} företag laddade. Swipa höger för att visa intresse!`, 
            "Företag laddade"
          );
        }
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
        console.log("Attempting to save favorite for company:", company.company_name);
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData?.session?.user) {
          const userId = sessionData.session.user.id;
          console.log("User ID:", userId, "Company ID:", company.id);
          
          // Check if already liked
          const { data: existingLike, error: checkError } = await supabase
            .from('favorites')
            .select('*')
            .eq('student_id', userId)
            .eq('company_id', company.id)
            .single();
            
          if (checkError && checkError.code !== 'PGRST116') {
            console.error("Error checking existing favorite:", checkError);
          }
              
          if (!existingLike) {
            // Save to favorites
            const { data, error } = await supabase
              .from('favorites')
              .insert({
                student_id: userId,
                company_id: company.id
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
        "Skip"
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
                fetchCompanies();
                showInfo(
                  addNotification, 
                  "Uppdaterar företagslistan...",
                  "Uppdaterar"
                );
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
                      company.company_additional_info[0]?.additional_work_info && (
                        <div className="card-additional-info">
                          <p>Roligt att veta om oss:</p>
                          <div className="info-box">
                            <p className="info-swipe-text">
                              {company.company_additional_info[0].additional_work_info}
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
                xmlns="http://www.w3.org/2000/svg"
                width="74"
                height="73"
                viewBox="0 0 74 73"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M20.9451 33.8201C23.646 30.2352 27.4501 27.6373 31.772 26.4261C36.0939 25.2149 40.6941 25.4574 44.8646 27.1165C49.0351 28.7756 52.5449 31.7592 54.8538 35.6083C57.1626 39.4573 58.1426 43.9584 57.643 48.4189C57.5627 49.1384 57.7714 49.8604 58.2234 50.426C58.6753 50.9916 59.3335 51.3544 60.053 51.4348C60.7725 51.5151 61.4944 51.3064 62.06 50.8544C62.6256 50.4025 62.9885 49.7443 63.0688 49.0248C63.6785 43.5685 62.5407 38.0594 59.8193 33.291C57.098 28.5226 52.9334 24.7409 47.9255 22.4906C42.9175 20.2403 37.3246 19.6374 31.9521 20.7689C26.5796 21.9003 21.7049 24.7076 18.0298 28.7866L17.4955 20.3631C17.4498 19.6404 17.1189 18.9655 16.5756 18.4868C16.0323 18.0081 15.3211 17.7649 14.5984 17.8106C13.8758 17.8562 13.2008 18.1871 12.7222 18.7305C12.2435 19.2738 12.0002 19.985 12.0459 20.7076L13.0826 37.0539C13.1293 37.7764 13.4611 38.4507 14.005 38.9286C14.3606 39.2293 14.7813 39.4431 15.2338 39.5533C15.6862 39.6634 16.1582 39.6667 16.6122 39.5631L32.3248 38.5682C33.0475 38.5225 33.7224 38.1916 34.2011 37.6483C34.6797 37.105 34.923 36.3938 34.8773 35.6711C34.8316 34.9485 34.5007 34.2736 33.9574 33.7949C33.4141 33.3162 32.7029 33.0729 31.9802 33.1186L20.9451 33.8201Z"
                  fill="#E51236"
                />
              </svg>
            </button>

            <button 
              className="swipe-button back"
              aria-label="Återställ senaste företag (inte implementerat)"
              disabled={true}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M16 4L8 12L16 20"
                  stroke="#E51236"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              className="swipe-button like"
              onClick={() => handleSwipe("right")}
              aria-label="Lägg till detta företag i favoriter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="62"
                height="55"
                viewBox="0 0 62 55"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M50.6401 2.26221C44.7307 -0.479127 37.4754 0.33517 30.9993 6.11455C24.5275 0.33492 17.2685 -0.478752 11.3599 2.26221L11.3598 2.26224C5.15518 5.14298 0.843385 11.782 0.751498 19.448H0.75V19.698V19.948H0.751128C0.791599 24.4286 1.9189 28.3029 3.71122 31.702L3.7102 31.7026L3.82736 31.9199L3.82739 31.9199L3.94738 32.1426L3.9592 32.136C4.08633 32.3215 4.23923 32.4881 4.41359 32.6304C4.65328 32.8261 4.9288 32.9721 5.22448 33.0599C5.52017 33.1478 5.8301 33.1756 6.1365 33.142C6.44291 33.1083 6.73963 33.0137 7.00972 32.8637C7.2798 32.7138 7.51788 32.5115 7.71051 32.2685C7.90314 32.0255 8.04656 31.7467 8.13277 31.4478C8.21897 31.149 8.24631 30.8359 8.21327 30.5265C8.18912 30.3003 8.13303 30.0791 8.04703 29.8697L8.05845 29.8634L7.97185 29.7048C7.96155 29.6843 7.95095 29.6639 7.94005 29.6437L7.81994 29.4209L7.81898 29.4215C6.27323 26.5041 5.45495 23.2465 5.43605 19.9337V19.6988V19.698L5.43709 19.5143C5.5045 13.5989 8.82173 8.66289 13.3117 6.57839C17.6946 4.54503 23.6166 5.05478 29.2892 11.0196C29.2967 11.0275 29.3042 11.0354 29.3116 11.0433L29.3118 11.0434L29.4862 11.2273L29.4961 11.2176C29.6723 11.3671 29.8698 11.4898 30.0823 11.5815C30.3724 11.7066 30.6845 11.7712 31 11.7712C31.3155 11.7712 31.6276 11.7066 31.9177 11.5815C32.1302 11.4899 32.3276 11.3671 32.5038 11.2177L32.5137 11.2273L32.6882 11.0434L32.6883 11.0433C32.6925 11.0389 32.6966 11.0346 32.7008 11.0302C38.3764 5.05815 44.3029 4.54386 48.6883 5.35467C53.2247 6.68445 56.564 9.60554 56.564 13.198C56.564 16.8956 54.0866 19.748 50.5198 22.2185C47.5704 24.2629 44.0035 26.823 40.5031 29.5617C39.7383 30.1601 38.9766 30.756 38.2252 31.355L38.225 31.3547L38.0271 31.5132L38.027 31.5132C38.0263 31.5138 38.0256 31.5143 38.0249 31.5149C37.9612 31.566 37.8977 31.6167 37.8346 31.6672C36.4432 32.7792 35.2068 33.742 34.0151 34.4468C32.7678 35.1844 31.8006 35.5023 31 35.5023C30.1991 35.5023 29.229 35.187 27.9855 34.4471L27.9849 34.4468C26.7932 33.742 25.5568 32.7792 24.1654 31.6672L24.1655 31.6671L23.973 31.5132L23.9728 31.5131C23.9497 31.4946 23.9267 31.4762 23.9039 31.4579C22.8392 30.6041 22.164 29.9974 21.4784 29.3722C21.417 29.3162 21.3555 29.26 21.2936 29.2035C20.6878 28.6504 20.0456 28.0641 19.102 27.2699L19.1023 27.2695L18.9132 27.1117L18.9131 27.1116C18.9129 27.1114 18.9127 27.1112 18.9124 27.111L18.7185 26.949L18.7098 26.9597C18.2645 26.6633 17.7299 26.5277 17.1939 26.5807C16.5736 26.642 16.0037 26.9508 15.609 27.4378C15.2144 27.9247 15.027 28.55 15.0871 29.1761C15.1393 29.7196 15.3743 30.2261 15.7494 30.6124L15.7413 30.6224L15.9294 30.7795C15.9298 30.7798 15.9301 30.7801 15.9304 30.7803C17.0006 31.674 17.734 32.3381 18.4214 32.9606C18.4751 33.0092 18.5285 33.0576 18.5818 33.1058C19.2719 33.7303 19.9377 34.3268 20.8759 35.085L20.8754 35.0856L21.068 35.2395L21.0681 35.2396C21.069 35.2403 21.0698 35.2409 21.0707 35.2416L21.266 35.3979L21.2661 35.3977C22.6401 36.4944 24.118 37.6536 25.6175 38.5442C27.1234 39.4386 28.8575 40.1848 30.75 40.246V40.25H31H31.25V40.2459C33.1426 40.1846 34.8767 39.4357 36.3823 38.5443L36.3824 38.5443C37.8846 37.6537 39.3603 36.4942 40.7339 35.3978L40.7341 35.398L40.9298 35.2413C40.9305 35.2407 40.9312 35.2401 40.9319 35.2396L40.932 35.2395C40.9857 35.1965 41.0396 35.1534 41.0937 35.1103C41.7827 34.5606 42.5051 33.9961 43.2493 33.4146C46.7622 30.6694 50.7604 27.545 54.0244 23.8136C58.0733 19.189 61.1813 13.4517 61.2489 5.94803H61.25V5.698V5.448H61.2485C61.1567 -1.7821 56.8476 -5.14298 50.6401 -2.26222L50.6401 2.26221Z"
                  fill="#E51236"
                  stroke="#E51236"
                  strokeWidth="0.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Swipe;