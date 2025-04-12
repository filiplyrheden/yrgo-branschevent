import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../components/layout/Favorites.css";

const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthAndFetchCompanies = async () => {
      try {
        // Check if user is logged in
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!sessionData.session) {
          navigate('/');
          return;
        }
        
        // Check if user is a student
        const userType = sessionData.session.user.user_metadata?.user_type;
        if (userType !== "Student") {
          navigate('/profil');
          return;
        }
        
        // Fetch all companies
        await fetchCompanies();
      } catch (error) {
        console.error("Error checking auth:", error);
        setError("Ett fel uppstod vid inloggningskontroll");
      }
    };
    
    checkAuthAndFetchCompanies();
  }, [navigate]);

  const fetchCompanies = async () => {
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
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error("Error in fetchCompanies:", error);
      setError("Ett fel uppstod när företagen skulle hämtas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="favorites-container">
          <div className="loading">Laddar...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="favorites-container">
        <h1 className="favorites-title">Alla företag</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="favorites-grid">
          {companies.length > 0 ? (
            companies.map(company => (
              <div 
                key={company.id} 
                className="favorite-card"
                onClick={() => navigate(`/company/${company.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="favorite-card-image">
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
            <div className="no-favorites">
              <p>Inga företag har registrerat sig än.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Companies;