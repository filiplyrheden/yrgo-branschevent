import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import TrashIcon from "../components/ui/TrashIcon";
import "../components/layout/Favorites.css";
import { useNotification } from "../components/notifications/NotificationSystem";
import {
  showSuccess,
  showError,
  showInfo,
} from "../components/utils/notifications";

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addNotification } = useNotification();

  // Use useRef to avoid repeated fetches
  const favoritesFetchedRef = useRef(false);

  useEffect(() => {
    const checkAuthAndFetchFavorites = async () => {
      try {
        // If favorites already fetched, exit immediately
        if (favoritesFetchedRef.current) return;

        // Check if user is logged in
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!sessionData.session) {
          showError(
            addNotification,
            "Du måste vara inloggad för att se dina favoriter",
            "Åtkomst nekad"
          );
          navigate("/");
          return;
        }

        // Check if user is a student
        const userType = sessionData.session.user.user_metadata?.user_type;
        if (userType !== "Student") {
          showError(
            addNotification,
            "Endast studenter kan se favoriter",
            "Åtkomst nekad"
          );
          navigate("/profil");
          return;
        }
        
        // Fetch favorites - passing true to show notifications
        await fetchFavorites(sessionData.session.user.id, true);
        
        // Mark that favorites have been fetched
        favoritesFetchedRef.current = true;
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

    checkAuthAndFetchFavorites();
  }, [navigate, addNotification]);

  const fetchFavorites = async (userId, showNotifications = false) => {
    try {
      setLoading(true);
      
      const { data: favoriteIds, error: favoritesError } = await supabase
        .from("favorites")
        .select("id, company_id")
        .eq("student_id", userId);

      if (favoritesError) {
        console.error("Error fetching favorite IDs:", favoritesError);
        throw favoritesError;
      }
      
      if (favoriteIds && favoriteIds.length > 0) {
        const enrichedFavorites = await Promise.all(
          favoriteIds.map(async (favorite) => {
            try {
              const { data: company, error: companyError } = await supabase
                .from("companies")
                .select("id, company_name, logo_url, email, website_url")
                .eq("id", favorite.company_id)
                .single();

              if (companyError) {
                console.error(
                  `Error fetching company ${favorite.company_id}:`,
                  companyError
                );
                return {
                  ...favorite,
                  companies: { company_name: "Okänt företag" },
                };
              }

              const { data: specialties, error: specialtiesError } =
                await supabase
                  .from("company_specialties")
                  .select("specialty")
                  .eq("company_id", favorite.company_id);

              if (specialtiesError) {
                console.error(
                  `Error fetching specialties for company ${favorite.company_id}:`,
                  specialtiesError
                );
              }

              return {
                ...favorite,
                companies: {
                  ...company,
                  company_specialties: specialties || [],
                },
              };
            } catch (err) {
              console.error(
                `Error processing company ${favorite.company_id}:`,
                err
              );
              return favorite;
            }
          })
        );
        
        setFavorites(enrichedFavorites);
        
        if (showNotifications && !favoritesFetchedRef.current) {
          // Optional: You can uncomment this if you want to show success notification
          // showSuccess(
          //   addNotification,
          //   `Dina favoriter har laddats (${enrichedFavorites.length} företag)`,
          //   "Favoriter"
          // );
        }
      } else {
        setFavorites([]);
        
        if (showNotifications && !favoritesFetchedRef.current) {
          setTimeout(() => {
          }, 300);
        }
      }
    } catch (error) {
      console.error("Error in fetchFavorites:", error);
      setError("Ett fel uppstod när dina favoriter skulle hämtas");
      showError(
        addNotification,
        "Ett fel uppstod när dina favoriter skulle hämtas",
        "Hämtningsfel"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId, companyName) => {
    try {
      if (
        !window.confirm(
          "Är du säker på att du vill ta bort företaget från dina favoriter?"
        )
      ) {
        return;
      }

      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter((fav) => fav.id !== favoriteId));

      showSuccess(
        addNotification,
        `${companyName || "Företaget"} har tagits bort från dina favoriter.`,
        "Favorit borttagen"
      );
    } catch (error) {
      console.error("Error removing favorite:", error);
      setError("Ett fel uppstod när favoriten skulle tas bort");
      showError(
        addNotification,
        "Ett fel uppstod när favoriten skulle tas bort",
        "Borttagningsfel"
      );
    }
  };

  if (loading && !favoritesFetchedRef.current) {
    return (
      <div>
        <Header />
        <main>
          <div className="favorites-container">
            <h1 className="favorites-title">Favoriter</h1>
            <div className="loading" role="status" aria-live="polite">
              <span className="visually-hidden">Laddar favoriter...</span>
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
          <h1 className="favorites-title">Favoriter</h1>

          {error && (
            <div className="error-message" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <div
            className="favorites-grid"
            role="list"
            aria-label="Lista av favoritföretag"
          >
            {favorites.length > 0 ? (
              favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="favorite-card"
                  onClick={() => navigate(`/company/${favorite.company_id}`)}
                  role="listitem"
                  aria-label={`${
                    favorite.companies
                      ? favorite.companies.company_name
                      : "Företag"
                  }`}
                  tabIndex="0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/company/${favorite.company_id}`);
                    }
                  }}
                >
                  <div className="favorite-card-image">
                    {favorite.companies && favorite.companies.logo_url ? (
                      <img
                        src={favorite.companies.logo_url}
                        alt={`${favorite.companies.company_name} logotyp`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = ""; // Clear src on error
                        }}
                      />
                    ) : (
                      <div className="placeholder-image" aria-hidden="true">
                        <svg
                          viewBox="0 0 100 100"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="100" height="100" fill="#4F4F4F" />
                          <text
                            x="50%"
                            y="50%"
                            fill="white"
                            fontSize="14"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            Bild
                          </text>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="favorite-card-footer">
                    <h3>
                      {favorite.companies
                        ? favorite.companies.company_name
                        : "Företag"}
                    </h3>
                  </div>

                  <button
                    className="trash-button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the entire card from being clicked
                      handleRemoveFavorite(
                        favorite.id,
                        favorite.companies
                          ? favorite.companies.company_name
                          : "Företaget"
                      );
                    }}
                    aria-label={`Ta bort ${
                      favorite.companies
                        ? favorite.companies.company_name
                        : "företaget"
                    } från favoriter`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))
            ) : (
              <div className="no-favorites" role="status">
                <p>
                  Du har inga favoriter än. Gå till <a href="/swajp">Swajp</a>{" "}
                  för att hitta företag!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
