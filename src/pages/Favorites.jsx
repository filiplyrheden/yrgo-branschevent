import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../components/layout/Favorites.css";

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hämta favoriter när komponenten laddas
  useEffect(() => {
    const checkAuthAndFetchFavorites = async () => {
      try {
        // Kontrollera om användaren är inloggad
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!sessionData.session) {
          navigate('/');
          return;
        }
        
        // Kontrollera om användaren är student
        const userType = sessionData.session.user.user_metadata?.user_type;
        console.log("User type:", userType);
        if (userType !== "Student") {
          navigate('/profil');
          return;
        }
        
        // Hämta favoriter
        await fetchFavorites(sessionData.session.user.id);
      } catch (error) {
        console.error("Error checking auth:", error);
        setError("Ett fel uppstod vid inloggningskontroll");
      }
    };
    
    checkAuthAndFetchFavorites();
  }, [navigate]);

  // Funktion för att hämta favoriter från databasen
  const fetchFavorites = async (userId) => {
    try {
      setLoading(true);
      
      console.log("Fetching favorites for user ID:", userId);
      
      // Försök först med en enklare query
      const { data, error } = await supabase
        .from('favorites')
        .select('id, company_id, student_id')
        .eq('student_id', userId);
      
      if (error) {
        console.error("Error fetching favorites:", error);
        throw error;
      }
      
      console.log("Fetched basic favorites:", data);
      
      if (data && data.length > 0) {
        // Om vi har grundläggande favoriter, hämta nu företagsdetaljer
        const favoritePromises = data.map(async (favorite) => {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select(`
              id,
              company_name,
              logo_url,
              website_url,
              email
            `)
            .eq('id', favorite.company_id)
            .single();
            
          if (companyError) {
            console.error("Error fetching company data:", companyError);
            return favorite;
          }
          
          // Hämta specialties separat
          const { data: specialties, error: specialtiesError } = await supabase
            .from('company_specialties')
            .select('specialty')
            .eq('company_id', favorite.company_id);
            
          if (specialtiesError) {
            console.error("Error fetching specialties:", specialtiesError);
          }
          
          return {
            ...favorite,
            companies: {
              ...companyData,
              company_specialties: specialties || []
            }
          };
        });
        
        const enrichedFavorites = await Promise.all(favoritePromises);
        console.log("Enriched favorites:", enrichedFavorites);
        setFavorites(enrichedFavorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setError("Ett fel uppstod när dina favoriter skulle hämtas");
    } finally {
      setLoading(false);
    }
  };

  // Funktion för att ta bort favorit
  const handleRemoveFavorite = async (favoriteId) => {
    try {
      // Visa bekräftelsedialog
      if (!window.confirm("Är du säker på att du vill ta bort företaget från dina favoriter?")) {
        return;
      }
      
      // Ta bort från databasen
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);
        
      if (error) throw error;
      
      // Uppdatera listan genom att filtrera bort den borttagna favoriten
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      
    } catch (error) {
      console.error("Error removing favorite:", error);
      setError("Ett fel uppstod när favoriten skulle tas bort");
    }
  };

  // Visa laddningsmeddelande
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
        <h1 className="favorites-title">Favoriter</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="favorites-grid">
          {favorites.length > 0 ? (
            favorites.map(favorite => (
              <div key={favorite.id} className="favorite-card">
                <div className="favorite-card-image">
                  {favorite.companies && favorite.companies.logo_url ? (
                    <img 
                      src={`${supabase.supabaseUrl}/storage/v1/object/public/company_logos/${favorite.companies.logo_url}`}
                      alt={`${favorite.companies.company_name} logotyp`} 
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
                
                <div className="favorite-card-footer">
                  <h3>{favorite.companies ? favorite.companies.company_name : 'Företag'}</h3>
                  
                  {favorite.companies && favorite.companies.company_specialties && favorite.companies.company_specialties.length > 0 && (
                    <div className="company-specialties">
                      {favorite.companies.company_specialties.slice(0, 3).map((specialtyObj, index) => (
                        <span key={index} className="specialty-tag">
                          {specialtyObj.specialty}
                        </span>
                      ))}
                      {favorite.companies.company_specialties.length > 3 && (
                        <span className="more-specialties">+{favorite.companies.company_specialties.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <button 
                  className="remove-button" 
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  aria-label="Ta bort från favoriter"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#E51236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className="no-favorites">
              <p>Du har inga favoriter än. Gå till <a href="/swajp">Swajp</a> för att hitta företag!</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;