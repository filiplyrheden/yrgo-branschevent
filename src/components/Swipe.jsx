import React, { useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import "./Swipe.css";
import Header from "./layout/Header";
import Footer from "./layout/Footer";

const Swipe = () => {
  const [companies, setCompanies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(null);
  const controls = useAnimation();

  // Fetch companies when component mounts
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          company_additional_info (additional_work_info),
          company_specialties (specialty)
        `)
        .eq('coming_to_event', true);
      
      if (error) {
        console.error("Error fetching companies:", error);
        throw error;
      }
      
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
    
    // If direction is right, save the like to favorites
    if (direction === 'right') {
      try {
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user) {
          const userId = sessionData.session.user.id;
          
          // Check if already liked
          const { data: existingLike } = await supabase
            .from('favorites')
            .select('*')
            .eq('student_id', userId)
            .eq('company_id', company.id)
            .single();
            
          if (!existingLike) {
            // Save to favorites
            await supabase
              .from('favorites')
              .insert({
                student_id: userId,
                company_id: company.id
              });
            
            console.log("Saved to favorites:", company.company_name);
          }
        }
      } catch (error) {
        console.error("Error saving favorite:", error);
      }
    }
    
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
      <div>
        <Header />
        <div className="swipe-container">
          <div className="swipe-loading">
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
              Du har gått igenom alla tillgängliga företag. Kom tillbaka senare för fler!
            </p>
            <button 
              className="redigera-button" 
              onClick={() => setCurrentIndex(0)}
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
                          src={`${supabase.supabaseUrl}/storage/v1/object/public/company_logos/${company.logo_url}`}
                          alt={`${company.company_name} logotyp`} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = ''; // Clear src on error
                          }}
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
                    <h3>{company.company_name}</h3>
                    
                    {company.website_url && (
                      <div className="website-container">
                        <div className="icon-circle">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E51236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                          </svg>
                        </div>
                        <a href={`https://${company.website_url}`} target="_blank" rel="noopener noreferrer" className="card-website">
                          {company.website_url}
                        </a>
                      </div>
                    )}
                    
                    {company.email && (
                      <div className="email-container">
                        <div className="icon-circle">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E51236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </div>
                        <a href={`mailto:${company.email}`} className="card-email">
                          {company.email}
                        </a>
                      </div>
                    )}
                    
                    <p className="card-attending">
                      Vi kommer närvara på minglet den 23/4
                    </p>
                    
                    <div className="attendance">
                      <div className={`attendance-button ${company.coming_to_event ? 'active' : ''}`}>Ja</div>
                      <div className={`attendance-button ${!company.coming_to_event ? 'active' : ''}`}>Nej</div>
                    </div>
                    
                    {company.company_specialties && company.company_specialties.length > 0 && (
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
                    
                    {company.company_additional_info && company.company_additional_info.length > 0 && company.company_additional_info[0]?.additional_work_info && (
                      <div className="card-additional-info">
                        <p>Roligt att veta om oss:</p>
                        <div className="info-box">
                          <p className="info-text">
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
            <button className="swipe-button dislike" onClick={() => handleSwipe('left')}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="#E51236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <button className="swipe-button back">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4L8 12L16 20" stroke="#E51236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <button className="swipe-button like" onClick={() => handleSwipe('right')}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#E51236"/>
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