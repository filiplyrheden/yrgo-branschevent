import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../components/Profile.css";

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
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
          throw companyError;
        }
        
        if (companyData) {
          setCompany(companyData);
        } else {
          setError("Företaget hittades inte");
        }
      } catch (error) {
        console.error("Error fetching company:", error);
        setError("Ett fel uppstod när företagsdetaljerna skulle hämtas");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyDetails();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="profile-container">
          <div className="loading">Laddar...</div>
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
          <div className="error-message">{error || "Företaget hittades inte"}</div>
          <button className="save-button" onClick={() => navigate("/favoriter")}>
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
      <div className="profile-container company-details-view">
        <div className="profile-image-container">
          <div className="profile-image">
            {company.logo_url ? (
              <img 
                src={`${supabase.supabaseUrl}/storage/v1/object/public/company_logos/${company.logo_url}`}
                alt={`${company.company_name} logotyp`} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                }}
              />
            ) : (
              <div className="placeholder-image">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#E51236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 6L12 13L2 6" stroke="#E51236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {company.email}
            </a>
          </div>
        )}
        
        <div className="form-group">
          <label>Vi kommer närvara på minglet den 23/4</label>
          <div className="attendance-buttons">
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
          <button className="save-button" onClick={() => navigate("/favoriter")}>
            Tillbaka till favoriter
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CompanyDetails;