// Swipe.jsx
import React, { useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import Header from "./Header";
import Footer from "./Footer";
import "./Swipe.css";

const Swipe = () => {
  const [companies, setCompanies] = useState([
    // Sample data until your Supabase is connected
    {
      id: 1,
      name: "Company Name",
      website: "www.website.se",
      email: "company@mail.com",
      logo_url: null,
      company_specialties: [
        { specialty: "Digital Design" },
        { specialty: "Figma" },
        { specialty: "UX" },
        { specialty: "Webflow" },
        { specialty: "Photoshop" },
        { specialty: "UI" }
      ],
      company_additional_info: [
        { 
          additional_work_info: "Varje onsdag har vi en massör som kommer in till kontoret så att alla anställda kan få massage!" 
        }
      ]
    }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(null);
  const controls = useAnimation();

  // Fetch companies when Supabase is connected
  useEffect(() => {
    // Uncomment this when your Supabase is ready
    // fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          company_additional_info (*),
          company_specialties (specialty)
        `);
      
      if (error) throw error;
      
      if (data) {
        console.log("Companies data:", data);
        setCompanies(data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error.message);
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
      x: direction === 'right' ? 600 : -600,
      opacity: 0,
      transition: { duration: 0.3 }
    });
    
    // In the future, save swipe to Supabase here
    
    // Move to next card
    setCurrentIndex(prev => prev + 1);
    // Reset animation controls for the next card
    controls.set({ x: 0, opacity: 1 });
  };

  const handleDragEnd = (_, info) => {
    const threshold = 100; // px to consider a swipe
    
    if (info.offset.x > threshold) {
      handleSwipe('right');
    } else if (info.offset.x < -threshold) {
      handleSwipe('left');
    } else {
      // Reset position if not swiped far enough
      controls.start({ x: 0, opacity: 1 });
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="swipe-container">
        <Header />
        <div className="swipe-loading">
          <div className="loading-spinner"></div>
          <p>Laddar företag...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // No more companies to show
  if (currentIndex >= companies.length) {
    return (
      <div className="swipe-container">
        <Header />
        <div className="swipe-main">
          <h2 className="swipe-title">Inga fler företag</h2>
          <p className="swipe-description">
            Du har gått igenom alla tillgängliga företag. Kom tillbaka senare för fler!
          </p>
          <button 
            className="redigera-button" 
            onClick={() => setCurrentIndex(0)}
          >
            Börja om
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const company = companies[currentIndex];

  return (
    <div className="swipe-container">
      <Header />
      
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
                        alt={`${company.name} logotyp`} 
                      />
                    ) : (
                      <div className="placeholder-image">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="50" cy="35" r="25" fill="#4F4F4F" />
                          <path d="M100 100 H0 V70 C0 50 25 50 50 60 C75 50 100 50 100 70 Z" fill="#4F4F4F" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="card-info">
                  <h3>{company.name}</h3>
                  
                  <div className="website-container">
                    <div className="icon-circle">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E51236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </div>
                    <p className="card-website">{company.website}</p>
                  </div>
                  
                  <div className="email-container">
                    <div className="icon-circle">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E51236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <p className="card-email">{company.email}</p>
                  </div>
                  
                  <p className="card-attending">
                    Vi kommer närvara på minglet den 23/4
                  </p>
                  
                  <div className="attendance">
                    <div className="attendance-button active">Ja</div>
                    <div className="attendance-button">Nej</div>
                  </div>
                  
                  <div className="card-specialties">
                    <p>Vi jobbar med:</p>
                    <div className="specialty-tags">
                      {company.company_specialties?.map((specialty, i) => (
                        <span key={i} className="specialty-tag">
                          {specialty.specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="card-additional-info">
                    <p>Roligt att veta om oss:</p>
                    <div className="info-box">
                      <p className="info-text">
                        {company.company_additional_info?.[0]?.additional_work_info}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="action-container">
          <button className="redigera-button">
            Redigera
          </button>
        </div>
        
        <div className="swipe-buttons">
          <button className="swipe-button dislike" onClick={() => handleSwipe('left')}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#E51236"/>
            </svg>
          </button>
          
          <button className="swipe-button like" onClick={() => handleSwipe('right')}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#E51236"/>
            </svg>
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Swipe;