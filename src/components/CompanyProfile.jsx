import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "./Header";
import Footer from "./Footer";

const CompanyProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Kontrollera om användaren är inloggad
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/');
        return;
      }
      
      // Hämta företagsdata
      const { data: companyData, error } = await supabase
        .from('companies')
        .select(`
          *,
          company_additional_info (additional_work_info),
          company_specialties (specialty)
        `)
        .eq('id', data.session.user.id)
        .single();
        
      if (error) {
        console.error("Fel vid hämtning av företagsdata:", error);
      } else {
        setUserData(companyData);
      }
      
      setLoading(false);
    };
    
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading-container">Laddar...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="profile-container">
        <h1>Företagsprofil</h1>
        {userData && (
          <div>
            <p>E-post: {userData.email}</p>
            {/* Lägg till fler fält här */}
          </div>
        )}
        <button onClick={handleLogout}>Logga ut</button>
      </div>
      <Footer />
    </div>
  );
};

export default CompanyProfile;