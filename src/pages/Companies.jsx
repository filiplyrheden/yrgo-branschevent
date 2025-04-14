import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../components/layout/Favorites.css";
import "../components/layout/Companies.css";
import { useNotification } from "../components/notifications/NotificationSystem";
import { showSuccess, showError, showInfo } from "../components/utils/notifications";

const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [specialtyFilters, setSpecialtyFilters] = useState([]);
  const { addNotification } = useNotification();
  
  // Använd useRef istället för useState för att spåra om företag har hämtats
  const companiesFetchedRef = useRef(false);
  // Ref för att spåra föregående filter
  const previousFilterRef = useRef('all');

  useEffect(() => {
    const checkAuthAndFetchCompanies = async () => {
      try {
        // Undvik att köra om företagen redan har hämtats
        if (companiesFetchedRef.current) return;
        
        // Check if user is logged in
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!sessionData.session) {
          showError(
            addNotification, 
            "Du måste vara inloggad för att se företag", 
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
            "Endast studenter kan se företagslistan", 
            "Åtkomst nekad"
          );
          navigate('/profil');
          return;
        }
        
        // Fetch all companies - skicka med true för att visa notifikationer
        await fetchCompanies(true);
        
        // Markera att företagen har hämtats
        companiesFetchedRef.current = true;
      } catch (error) {
        console.error("Error checking auth:", error);
        setError("Ett fel uppstod vid inloggningskontroll");
        showError(
          addNotification, 
          "Ett fel uppstod vid inloggningskontroll",
          "Autentiseringsfel"
        );
      }
    };
    
    checkAuthAndFetchCompanies();
  }, [navigate, addNotification]); // Ta bort companiesFetched som dependency

  useEffect(() => {
    // Apply filters when companies or filters change
    if (companies.length > 0) {
      applyFilters();
    }
  }, [companies, activeFilter]);

  const fetchCompanies = async (showNotifications = false) => {
    try {
      setLoading(true);
      
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, company_name, logo_url, email, website_url, coming_to_event');
      
      if (companiesError) {
        console.error("Error fetching companies:", companiesError);
        throw companiesError;
      }
      
      if (companiesData) {
        const enrichedCompanies = await Promise.all(
          companiesData.map(async (company) => {
            try {
              const { data: specialties, error: specialtiesError } = await supabase
                .from('company_specialties')
                .select('specialty')
                .eq('company_id', company.id);
                
              if (specialtiesError) {
                console.error(`Error fetching specialties for company ${company.id}:`, specialtiesError);
              }
              
              return {
                ...company,
                company_specialties: specialties || []
              };
            } catch (err) {
              console.error(`Error processing company ${company.id}:`, err);
              return company;
            }
          })
        );
        
        setCompanies(enrichedCompanies);
        setFilteredCompanies(enrichedCompanies);
        
        // Extract unique specialties for filters
        const allSpecialties = new Set();
        enrichedCompanies.forEach(company => {
          company.company_specialties && company.company_specialties.forEach(spec => {
            if (spec.specialty) allSpecialties.add(spec.specialty);
          });
        });
        setSpecialtyFilters(Array.from(allSpecialties).sort());
        
        // Show success notification only if requested AND not shown before
        if (showNotifications && !companiesFetchedRef.current) {
         
        }
      } else {
        setCompanies([]);
        setFilteredCompanies([]);
        if (showNotifications && !companiesFetchedRef.current) {
          setTimeout(() => {
            showInfo(
              addNotification, 
              "Inga företag hittades i databasen.",
              "Inga företag"
            );
          }, 300);
        }
      }
    } catch (error) {
      console.error("Error in fetchCompanies:", error);
      setError("Ett fel uppstod när företagen skulle hämtas");
      showError(
        addNotification, 
        "Ett fel uppstod när företagen skulle hämtas.",
        "Datahämtningsfel"
      );
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...companies];
    
    // Apply attendance filter
    if (activeFilter === 'attending') {
      filtered = filtered.filter(company => company.coming_to_event === true);
    } else if (activeFilter === 'not-attending') {
      filtered = filtered.filter(company => company.coming_to_event === false);
    }
    
    setFilteredCompanies(filtered);
    
    // Announce filter results to screen readers
    const resultMessage = `Visar ${filtered.length} av ${companies.length} företag.`;
    const filterResults = document.getElementById('filter-results-live');
    if (filterResults) {
      filterResults.textContent = resultMessage;
    }
    
    // Endast visa notifiering om filtret har ändrats
    if (companiesFetchedRef.current && previousFilterRef.current !== activeFilter) {
     
      previousFilterRef.current = activeFilter;
    }
  };

  const handleFilterChange = (filter) => {
    if (activeFilter !== filter) {
      setActiveFilter(filter);
    }
  };

  if (loading && !companiesFetchedRef.current) {
    return (
      <div>
        <Header />
        <main>
          <div className="favorites-container">
            <div className="loading" role="status" aria-live="polite">
              <span className="visually-hidden">Laddar företag...</span>
              <div className="loading-spinner" aria-hidden="true"></div>
              Laddar...
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main>
        <div className="favorites-container">
          <h1 className="favorites-title">Alla företag</h1>
          
          {/* Filter controls */}
          <div className="filters-section" role="region" aria-labelledby="filter-heading">
            <h2 id="filter-heading" className="filter-heading">Filtrera företag</h2>
            <div className="filters-container">
              <button 
                className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
                aria-pressed={activeFilter === 'all'}
              >
                Alla företag
              </button>
              <button 
                className={`filter-button ${activeFilter === 'attending' ? 'active' : ''}`}
                onClick={() => handleFilterChange('attending')}
                aria-pressed={activeFilter === 'attending'}
              >
                Deltar på minglet
              </button>
              <button 
                className={`filter-button ${activeFilter === 'not-attending' ? 'active' : ''}`}
                onClick={() => handleFilterChange('not-attending')}
                aria-pressed={activeFilter === 'not-attending'}
              >
                Deltar inte
              </button>
            </div>
            
            {/* Live region for filter results */}
            <div 
              id="filter-results-live" 
              className="visually-hidden" 
              aria-live="polite"
              role="status"
            ></div>
          </div>
          
          {error && (
            <div 
              className="error-message" 
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}
          
          <div 
            className="favorites-grid" 
            role="list"
            aria-label="Lista av företag"
          >
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map(company => (
                <div 
                  key={company.id} 
                  className="favorite-card"
                  onClick={() => navigate(`/company/${company.id}`)}
                  style={{ cursor: 'pointer' }}
                  role="listitem"
                  aria-label={`${company.company_name || 'Företag'}${company.coming_to_event ? ', deltar på minglet' : ''}`}
                  tabIndex="0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/company/${company.id}`);
                    }
                  }}
                >
                  <div className="favorite-card-image">
                    {company.logo_url ? (
                      <img 
                        src={company.logo_url}
                        alt={`${company.company_name} logotyp`} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = ''; // Clear src on error
                        }}
                      />
                    ) : (
                      <div className="placeholder-image" aria-hidden="true">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100" height="100" fill="#4F4F4F" />
                          <text x="50%" y="50%" fill="white" fontSize="14" textAnchor="middle" dominantBaseline="middle">
                            Bild
                          </text>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="favorite-card-footer">
                    <h3>{company.company_name || 'Företag'}</h3>
                    {company.coming_to_event && (
                      <div className="company-attending">
                        <span>Deltar på minglet</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div 
                className="no-favorites"
                role="status"
              >
                <p>Inga företag hittades med de valda filtren.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Hidden styles for accessibility */}
      <style jsx>{`
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
        
        .filter-heading {
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }
        
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
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Companies;