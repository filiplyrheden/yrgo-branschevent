import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/layout/Header";
import Footer from "./layout/Footer";
import "./Profile.css";

const CompanyProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [companyData, setCompanyData] = useState({
    name: "",
    website: "",
    email: "",
    contactPerson: "",
    phone: "",
    additionalInfo: "",
    attending: true,
    specialties: [],
    logo: null,
    logoUrl: null
  });

  // Lista över alla möjliga specialties
  const allSpecialties = [
    "Digital Design", "HTML", "Front End", "Back End", "CSS", "Webflow", "3D",
    "Motion", "Film", "Foto", "Figma", "Framer", "WordPress", "Illustrator",
    "Photoshop", "After Effects", "Java Script", "Python", "In Design", "UI", "UX", "Spel"
  ];

  // State för specialty selection
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);

  useEffect(() => {
    // Kontrollera om användaren är inloggad
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        setUser(data.session.user);
        fetchCompanyProfile(data.session.user.id);
      } else {
        navigate("/");
      }
    };

    checkUser();
  }, [navigate]);

  const fetchCompanyProfile = async (userId) => {
    try {
      setLoading(true);
      console.log("Fetching company profile for user ID:", userId);
      
      // Hämta företagsdata
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select(`
          *,
          company_specialties (specialty)
        `)
        .eq("id", userId)
        .single();
      
      if (companyError) {
        console.error("Error fetching company data:", companyError);
        throw companyError;
      }
      
      console.log("Company data retrieved:", companyData);
      
      if (companyData) {
        // Hämta additional info
        const { data: additionalInfo, error: additionalError } = await supabase
          .from("company_additional_info")
          .select("additional_work_info")
          .eq("company_id", userId)
          .single();
          
        if (additionalError && additionalError.code !== "PGRST116") {
          console.error("Error fetching additional info:", additionalError);
        }
        
        // Hämta bild om den finns
        let logoUrl = null;
        if (companyData.logo_url) {
          try {
            const { data: logoData, error: logoError } = await supabase.storage
              .from('company_logos')
              .download(companyData.logo_url);
              
            if (logoError) {
              console.error("Error downloading logo:", logoError);
            } else if (logoData) {
              logoUrl = URL.createObjectURL(logoData);
            }
          } catch (logoError) {
            console.error("Error processing logo:", logoError);
          }
        }
        
        // Sätt state med hämtad data
        setCompanyData({
          name: companyData.company_name === 'NOT NULL' ? '' : companyData.company_name || "",
          website: companyData.website_url || "",
          email: companyData.email || "",
          contactPerson: companyData.contact_name || "",
          phone: companyData.phone || "",
          additionalInfo: additionalInfo?.additional_work_info || "",
          attending: companyData.coming_to_event === false ? false : true,
          specialties: companyData.company_specialties?.map(cs => cs.specialty) || [],
          logo: null,
          logoUrl: logoUrl || null
        });
        
        setSelectedSpecialties(companyData.company_specialties?.map(cs => cs.specialty) || []);
      }
      
    } catch (error) {
      console.error("Error fetching company profile:", error);
      alert("Ett fel uppstod när profilen skulle hämtas. Vänligen försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSpecialty = (specialty) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty));
    } else {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData({
      ...companyData,
      [name]: value,
    });
  };

  const handleAttendanceChange = (value) => {
    setCompanyData({
      ...companyData,
      attending: value,
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyData({
        ...companyData,
        logo: file,
        logoUrl: URL.createObjectURL(file)
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // 1. Check authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error("Session error:", sessionError);
        alert("Din session har gått ut. Vänligen logga in igen.");
        await supabase.auth.signOut();
        navigate('/');
        return;
      }
      
      const userId = sessionData.session.user.id;
      console.log("User ID:", userId);
      
      // Validate required fields
      if (!companyData.name) {
        alert("Företagets namn är obligatoriskt.");
        setLoading(false);
        return;
      }
      
      if (!companyData.email) {
        alert("E-post är obligatoriskt.");
        setLoading(false);
        return;
      }
      
      console.log("Starting save with data:", {
        ...companyData,
        logo: companyData.logo ? "File object present" : "No file"
      });
      
      // Upload logo if exists
      let logoPath = null;
      if (companyData.logo) {
        try {
          const fileName = `${userId}-${Date.now()}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('company_logos')
            .upload(fileName, companyData.logo, {
              upsert: true
            });
            
          if (uploadError) {
            console.error("Logo upload error:", uploadError);
          } else {
            console.log("Logo uploaded successfully:", uploadData);
            logoPath = fileName;
          }
        } catch (logoError) {
          console.error("Error uploading logo:", logoError);
          // Continue with save even if logo upload fails
        }
      }
      
      console.log("Updating company table...");
      
      // Update company table
      const { data: companyUpdateData, error: companyError } = await supabase
        .from("companies")
        .update({
          company_name: companyData.name || "",
          website_url: companyData.website || null,
          email: companyData.email || "",
          contact_name: companyData.contactPerson || null,
          phone: companyData.phone || null,
          coming_to_event: companyData.attending === false ? false : true,
          logo_url: logoPath || companyData.logoUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);
      
      if (companyError) {
        console.error("Company update error:", companyError);
        throw companyError;
      }
      
      console.log("Company updated successfully:", companyUpdateData);
      
      // Update company_additional_info - try a separate operation
      console.log("Updating additional info...");
      try {
        const { data: additionalInfoCheck, error: checkError } = await supabase
          .from("company_additional_info")
          .select("company_id")
          .eq("company_id", userId)
          .single();
        
        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking additional info:", checkError);
        }
        
        if (additionalInfoCheck) {
          // Update existing record
          const { error: updateError } = await supabase
            .from("company_additional_info")
            .update({
              additional_work_info: companyData.additionalInfo || ""
            })
            .eq("company_id", userId);
            
          if (updateError) {
            console.error("Error updating additional info:", updateError);
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from("company_additional_info")
            .insert({
              company_id: userId,
              additional_work_info: companyData.additionalInfo || ""
            });
            
          if (insertError) {
            console.error("Error inserting additional info:", insertError);
          }
        }
      } catch (additionalError) {
        console.error("Error with additional info:", additionalError);
        // Continue even if this part fails
      }
      
      // Handle specialties - in a try/catch block to isolate errors
      console.log("Updating specialties...");
      try {
        // First delete existing specialties
        const { error: deleteError } = await supabase
          .from("company_specialties")
          .delete()
          .eq("company_id", userId);
          
        if (deleteError) {
          console.error("Error deleting specialties:", deleteError);
        }
        
        // Then insert new specialties if any selected
        if (selectedSpecialties.length > 0) {
          const specialtyRows = selectedSpecialties.map(specialty => ({
            company_id: userId,
            specialty: specialty
          }));
          
          const { error: specialtiesError } = await supabase
            .from("company_specialties")
            .insert(specialtyRows);
          
          if (specialtiesError) {
            console.error("Specialties insert error:", specialtiesError);
          }
        }
      } catch (specialtiesError) {
        console.error("Error handling specialties:", specialtiesError);
        // Continue even if specialties fail
      }
      
      alert("Profil sparad!");
      
      // Force reload company data
      fetchCompanyProfile(userId);
      
    } catch (error) {
      console.error("Error saving profile:", error);
      
      // More detailed error information
      if (error.message) console.error("Error message:", error.message);
      if (error.details) console.error("Error details:", error.details);
      if (error.hint) console.error("Error hint:", error.hint);
      
      alert("Ett fel uppstod när profilen skulle sparas. Se konsolen för detaljer.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

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

  return (
    <div>
      <Header />
      <div className="profile-container">
        <h1 className="profile-title">Profil</h1>
        
        <div className="profile-image-container">
          <div className="profile-image">
            {companyData.logoUrl ? (
              <img src={companyData.logoUrl} alt="Företagslogotyp" />
            ) : (
              <div className="placeholder-image">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="35" r="25" fill="#4F4F4F" />
                  <path d="M100 100 H0 V70 C0 50 25 50 50 60 C75 50 100 50 100 70 Z" fill="#4F4F4F" />
                </svg>
              </div>
            )}
          </div>
          <label htmlFor="file-upload" className="camera-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </label>
          <input 
            id="file-upload" 
            type="file" 
            onChange={handleFileChange} 
            style={{ display: 'none' }}
            accept="image/*"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="companyName">Företagets namn <span className="required">*</span></label>
          <input
            type="text"
            id="companyName"
            name="name"
            value={companyData.name}
            onChange={handleInputChange}
            placeholder="Företag"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="website">Företagets hemsida</label>
          <input
            type="text"
            id="website"
            name="website"
            value={companyData.website}
            onChange={handleInputChange}
            placeholder="www.företag.se"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Mailadress för kontakt <span className="required">*</span></label>
          <input
            type="email"
            id="email"
            name="email"
            value={companyData.email}
            onChange={handleInputChange}
            placeholder="namn@mail.com"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contactPerson">Kontaktperson</label>
          <input
            type="text"
            id="contactPerson"
            name="contactPerson"
            value={companyData.contactPerson}
            onChange={handleInputChange}
            placeholder="Förnamn Efternamn"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Telefonnummer</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={companyData.phone}
            onChange={handleInputChange}
            placeholder="+46 - 000 00 00"
          />
        </div>
        
        <div className="form-group">
          <label>Vi kommer närvara på minglet den 23/4</label>
          <div className="attendance-buttons">
            <button 
              className={`attendance-button ${companyData.attending ? 'active' : ''}`}
              onClick={() => handleAttendanceChange(true)}
              type="button"
            >
              Ja
            </button>
            <button 
              className={`attendance-button ${!companyData.attending ? 'active' : ''}`}
              onClick={() => handleAttendanceChange(false)}
              type="button"
            >
              Nej
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label>Vi jobbar med:</label>
          <div className="specialties-container">
            {allSpecialties.map((specialty) => (
              <button
                key={specialty}
                className={`specialty-button ${selectedSpecialties.includes(specialty) ? 'active' : ''}`}
                onClick={() => handleToggleSpecialty(specialty)}
                type="button"
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="additionalInfo">Roligt att veta om oss:</label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={companyData.additionalInfo}
            onChange={handleInputChange}
            placeholder="Fri text..."
            rows="4"
          ></textarea>
        </div>
        
        <div className="profile-buttons">
          <button className="save-button" onClick={handleSave} disabled={loading} type="button">
            {loading ? "Sparar..." : "Spara"}
          </button>
          <button className="logout-button" onClick={handleLogout} type="button">
            Logga Ut
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CompanyProfile;