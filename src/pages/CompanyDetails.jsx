import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../components/Profile.css";
import { useNotification } from "../components/notifications/NotificationSystem";
import { showSuccess, showError, showInfo } from "../components/utils/notifications";

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);
  const { addNotification } = useNotification();
  
  // Använd useRef istället för useState för att spåra om detaljer har hämtats
  const detailsFetchedRef = useRef(false);

  useEffect(() => {
    const checkAuthAndFetchDetails = async () => {
      try {
        // Om företagsdetaljer redan har hämtats, avsluta direkt
        if (detailsFetchedRef.current) return;
        
        // Check if user is logged in
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!sessionData.session) {
          showError(
            addNotification, 
            "Du måste vara inloggad för att se företagsdetaljer",
            "Åtkomst nekad"
          );
          navigate('/');
          return;
        }
        
        // Check if user is a student
        const userType = sessionData.session.user.user_metadata?.user_type;
        if (userType !== "Student") {
          showError(
            addNotification, 
            "Endast studenter kan se företagsdetaljer",
            "Åtkomst nekad"
          );
          navigate('/profil');
          return;
        }
        
        // Fetch company details - skicka med true för att visa notifikationer
        await fetchCompanyDetails(true);
        
        // Markera att företagsdetaljer har hämtats med useRef
        detailsFetchedRef.current = true;
      } catch (error) {
        console.error("Auth check error:", error);
        showError(
          addNotification, 
          "Ett fel uppstod vid behörighetskontroll",
          "Autentiseringsfel"
        );
      }
    };
    
    checkAuthAndFetchDetails();
  }, [id, navigate, addNotification]); // Ta bort detailsFetched dependency

  const fetchCompanyDetails = async (showNotifications = false) => {
    try {
      setLoading(true);
      
      // Hämta företagsdata
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select(`
          *,
          company_additional_info (additional_work_info),
          company_specialties (specialty)
        `)
        .eq("id", id)
        .single();
      
      if (companyError) {
        console.error("Error fetching company data:", companyError);
        setError("Ett fel uppstod när företagsdetaljerna skulle hämtas");
        showError(
          addNotification, 
          "Ett fel uppstod när företagsdetaljerna skulle hämtas",
          "Datahämtningsfel"
        );
        throw companyError;
      }
      
      if (companyData) {
        setCompany(companyData);
        
        // Visa endast framgångsmeddelande om det är begärt och inte redan visat
        if (showNotifications && !detailsFetchedRef.current) {
          // Använd setTimeout för att förhindra dubbla notifieringar
          setTimeout(() => {
           
          }, 300);
        }
      } else {
        setError("Företaget hittades inte");
        
        if (showNotifications && !detailsFetchedRef.current) {
          setTimeout(() => {
            showError(
              addNotification, 
              "Företaget hittades inte i databasen",
              "Ingen data"
            );
          }, 300);
        }
      }
    } catch (error) {
      console.error("Error fetching company:", error);
      setError("Ett fel uppstod när företagsdetaljerna skulle hämtas");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !detailsFetchedRef.current) {
    return (
      <div>
        <Header />
        <div className="profile-container">
          <div className="loading" role="status" aria-live="polite">
            <span className="visually-hidden">Laddar företagsdetaljer...</span>
            <div className="loading-spinner" aria-hidden="true"></div>
            Laddar...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div>
        <Header />
        <div className="profile-container">
          <div className="error-message" role="alert">{error || "Företaget hittades inte"}</div>
          <button 
            className="save-button" 
            onClick={() => {
              navigate("/favoriter");
            }}
          >
            Tillbaka till favoriter
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main>
        <div className="profile-container company-details-view">
          <div className="profile-image-container">
            <div className="profile-image">
              {company.logo_url ? (
                <img 
                  src={company.logo_url}
                  alt={`${company.company_name} logotyp`} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                  }}
                />
              ) : (
                <div className="placeholder-image" aria-label="Platshållare för logotyp">
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect width="100%" height="100%" fill="#4F4F4F" />
                    <path d="M50 30 C60 30 70 40 70 50 C70 60 60 70 50 70 C40 70 30 60 30 50 C30 40 40 30 50 30 Z" fill="#FFFFFF" />
                    <path d="M30 80 L70 80 L70 100 L30 100 Z" fill="#FFFFFF" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          <h1 className="profile-title">{company.company_name}</h1>
          
          {company.website_url && (
            <div className="form-group">
              <label>Hemsida</label>
              <a 
                href={company.website_url.startsWith('http') ? company.website_url : `https://${company.website_url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="website-link"
                onClick={() => {
                  showInfo(
                    addNotification,
                    `Besöker ${company.company_name}s webbplats i en ny flik`,
                    "Extern länk"
                  );
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#E51236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H22" stroke="#E51236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="#E51236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {company.website_url}
              </a>
            </div>
          )}
          
          {company.email && (
            <div className="form-group">
              <label>Email</label>
              <a 
                href={`mailto:${company.email}`}
                className="email-link"
                onClick={() => {
                  showInfo(
                    addNotification,
                    `Skickar e-post till ${company.company_name}`,
                    "E-post"
                  );
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#E51236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" stroke="#E51236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {company.email}
              </a>
            </div>
          )}
          
          <div className="form-group">
            <label>Vi kommer närvara på minglet den 23/4</label>
            <div className="attendance-buttons" role="status" aria-label={`${company.company_name} ${company.coming_to_event ? 'kommer' : 'kommer inte'} att närvara på minglet`}>
              <div className={`attendance-button ${company.coming_to_event ? 'active' : ''}`}>Ja</div>
              <div className={`attendance-button ${!company.coming_to_event ? 'active' : ''}`}>Nej</div>
            </div>
          </div>
          
          {company.company_specialties && company.company_specialties.length > 0 && (
            <div className="form-group">
              <label>Vi jobbar med:</label>
              <div className="specialties-container">
                {company.company_specialties.map((specialty, index) => (
                  <div key={index} className="specialty-button">
                    {specialty.specialty}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {company.company_additional_info && company.company_additional_info.length > 0 && company.company_additional_info[0]?.additional_work_info && (
            <div className="form-group">
              <label>Roligt att veta om oss:</label>
              <div style={{ 
                backgroundColor: '#F2F2F2', 
                padding: '1rem', 
                borderRadius: '4px' 
              }}>
                <p>{company.company_additional_info[0].additional_work_info}</p>
              </div>
            </div>
          )}
          
          <div className="profile-buttons">
            <button 
              className="save-button" 
              onClick={() => {
                navigate("/favoriter");
              }}
            >
              Tillbaka till favoriter
            </button>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Styling för laddningsanimation */}
      <style jsx>{`
        .loading-spinner {
          display: inline-block;
          width: 2rem;
          height: 2rem;
          border: 0.25rem solid rgba(0, 26, 82, 0.2);
          border-radius: 50%;
          border-top-color: var(--Primary-Navy);
          animation: spin 1s linear infinite;
          margin-right: 1rem;
        }
        
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyDetails;