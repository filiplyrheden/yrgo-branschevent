import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/layout/Header";
import Footer from "./layout/Footer";
import "./Profile.css";
import { Widget } from "@uploadcare/react-widget";
import { useNotification } from "./notifications/NotificationSystem";

const CompanyProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saveInProgress, setSaveInProgress] = useState(false);
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
    logoUrl: null,
  });

  // Använd useRef istället för state
  const profileFetchedRef = useRef(false);

  const [formErrors, setFormErrors] = useState({});
  const { addNotification } = useNotification();

  // Lista över alla möjliga specialties
  const allSpecialties = [
    "Digital Design",
    "PHP",
    "Frontend",
    "Backend",
    "TypeScript",
    "Webflow",
    "3D",
    "Motion",
    "Film",
    "Foto",
    "Figma",
    "Framer",
    "WordPress",
    "Illustrator",
    "Photoshop",
    "After Effects",
    "Java Script",
    "React",
    "In Design",
    "UI",
    "UX",
    "Spel",
    "C#",
    "Next.js",
    "Angular",
    "Node.js",
    "Laravel",
    "Supabase",
    "MongoDB",
    "Sanity",
    "Swift",
    "HTML",
    "CSS",
  ];

  // State för specialty selection
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);

  useEffect(() => {
    // Kontrollera om användaren är inloggad
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          setUser(data.session.user);
          // Only fetch if we haven't already fetched the profile
          if (!profileFetchedRef.current) {
            await fetchCompanyProfile(data.session.user.id);
          }
        } else {
          // Ta bort notifikationen och bara omdirigera
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking user session:", error);
        addNotification({
          type: "error",
          title: "Sessionsfel",
          message: "Kunde inte hämta användarinformation.",
          duration: 5000,
        });
      }
    };

    checkUser();
  }, [navigate, addNotification]); // Ta bort profileFetched beroende

  const fetchCompanyProfile = async (userId) => {
    // Guard against multiple simultaneous fetch attempts
    if (loading && profileFetchedRef.current) return;

    try {
      setLoading(true);
      console.log("Fetching company profile for user ID:", userId);

      // Hämta företagsdata
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select(
          `
          *,
          company_specialties (specialty)
        `
        )
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

        let logoUrl = null;
        if (companyData.logo_url) {
          logoUrl = companyData.logo_url;
        }

        // Sätt state med hämtad data
        setCompanyData({
          name:
            companyData.company_name === "NOT NULL"
              ? ""
              : companyData.company_name || "",
          website: companyData.website_url || "",
          email: companyData.email || "",
          contactPerson: companyData.contact_name || "",
          phone: companyData.phone || "",
          additionalInfo: additionalInfo?.additional_work_info || "",
          attending: companyData.coming_to_event === false ? false : true,
          specialties:
            companyData.company_specialties?.map((cs) => cs.specialty) || [],
          logo: null,
          logoUrl: logoUrl || null,
        });

        setSelectedSpecialties(
          companyData.company_specialties?.map((cs) => cs.specialty) || []
        );

        // Show success notification for data loading only on first successful load
        if (!profileFetchedRef.current) {
          // Använd setTimeout för att förhindra dubbla notifieringar
          setTimeout(() => {}, 300);
        }

        // Mark profile as fetched to prevent duplicate fetches
        profileFetchedRef.current = true;
      }
    } catch (error) {
      console.error("Error fetching company profile:", error);
      addNotification({
        type: "error",
        title: "Laddningsfel",
        message:
          "Ett fel uppstod när profilen skulle hämtas. Vänligen försök igen senare.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSpecialty = (specialty) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(
        selectedSpecialties.filter((s) => s !== specialty)
      );
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

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleAttendanceChange = (value) => {
    setCompanyData({
      ...companyData,
      attending: value,
    });
  };

  const handleUpload = (fileInfo) => {
    setCompanyData({
      ...companyData,
      logoUrl: fileInfo.cdnUrl,
      logo: null, // vi behöver inte längre filobjektet
    });

    addNotification({
      type: "success",
      title: "Logotyp uppladdad",
      message: "Din logotyp har laddats upp framgångsrikt.",
      duration: 3000,
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!companyData.name.trim()) {
      errors.name = "Företagets namn är obligatoriskt";
    }

    if (!companyData.email.trim()) {
      errors.email = "E-post är obligatoriskt";
    } else if (!/\S+@\S+\.\S+/.test(companyData.email)) {
      errors.email = "Ogiltig e-postadress";
    }

    if (
      companyData.website &&
      !/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(
        companyData.website
      )
    ) {
      errors.website = "Ogiltig webbadress";
    }

    if (
      companyData.phone &&
      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(
        companyData.phone
      )
    ) {
      errors.phone = "Ogiltigt telefonnummer";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    try {
      // Validate form before proceeding
      if (!validateForm()) {
        addNotification({
          type: "error",
          title: "Valideringsfel",
          message:
            "Det finns fel i formuläret. Kontrollera de markerade fälten.",
          duration: 5000,
        });

        // Focus the first field with an error
        const firstErrorField = Object.keys(formErrors)[0];
        if (firstErrorField) {
          document.getElementById(firstErrorField)?.focus();
        }

        return;
      }

      setSaveInProgress(true);
      setLoading(true);

      // 1. Check authentication
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        addNotification({
          type: "error",
          title: "Sessionsfel",
          message: "Din session har gått ut. Vänligen logga in igen.",
          duration: 5000,
        });

        await supabase.auth.signOut();
        navigate("/");
        return;
      }

      const userId = sessionData.session.user.id;
      console.log("User ID:", userId);

      console.log("Starting save with data:", {
        ...companyData,
        logo: companyData.logo ? "File object present" : "No file",
      });

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
          logo_url: companyData.logoUrl || null,
          updated_at: new Date().toISOString(),
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
              additional_work_info: companyData.additionalInfo || "",
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
              additional_work_info: companyData.additionalInfo || "",
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
          const specialtyRows = selectedSpecialties.map((specialty) => ({
            company_id: userId,
            specialty: specialty,
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

      // Show success notification
      addNotification({
        type: "success",
        title: "Profil sparad",
        message: "Din företagsprofil har uppdaterats framgångsrikt.",
        duration: 4000,
      });

      // Announce to screen readers
      const liveRegion = document.getElementById("profile-live-region");
      if (liveRegion) {
        liveRegion.textContent = "Profil sparad framgångsrikt.";
      }

      // Navigate to confirmation page
      navigate("/companyconfirmation");

      // No need to refetch everything, just update local state
      profileFetchedRef.current = true;
    } catch (error) {
      console.error("Error saving profile:", error);

      // More detailed error information
      if (error.message) console.error("Error message:", error.message);
      if (error.details) console.error("Error details:", error.details);
      if (error.hint) console.error("Error hint:", error.hint);

      // More detailed error messages
      let errorMessage = "Ett fel uppstod när profilen skulle sparas.";

      if (error.message) {
        if (error.message.includes("duplicate key")) {
          errorMessage = "E-postadressen används redan av ett annat konto.";
        } else if (error.message.includes("network")) {
          errorMessage = "Nätverksfel. Kontrollera din internetanslutning.";
        }
      }

      // Show error notification
      addNotification({
        type: "error",
        title: "Sparfel",
        message: errorMessage,
        duration: 5000,
      });

      // Announce to screen readers
      const liveRegion = document.getElementById("profile-live-region");
      if (liveRegion) {
        liveRegion.textContent = "Ett fel uppstod: " + errorMessage;
      }
    } finally {
      setSaveInProgress(false);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading && !saveInProgress && !profileFetchedRef.current) {
    return (
      <div>
        <Header />
        <div className="profile-container">
          <div className="loading" role="status" aria-live="polite">
            Laddar...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main>
        <div className="profile-container">
          <h1 className="profile-title">Profil</h1>

          <div className="profile-image-container">
            <div className="profile-image">
              {companyData.logoUrl ? (
                <img src={companyData.logoUrl} alt="Företagslogotyp" />
              ) : (
                <div
                  className="placeholder-image"
                  aria-label="Platshållare för logotyp"
                >
                  <svg
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle cx="50" cy="35" r="25" fill="#4F4F4F" />
                    <path
                      d="M100 100 H0 V70 C0 50 25 50 50 60 C75 50 100 50 100 70 Z"
                      fill="#4F4F4F"
                    />
                  </svg>
                </div>
              )}
            </div>

            <Widget
              publicKey="52e299605c6ee85fd0a3"
              onChange={handleUpload}
              tabs="file url"
              id="file-upload"
              aria-label="Ladda upp företagslogotyp"
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyName">
              Företagets namn{" "}
              <span className="required" aria-hidden="true">
                *
              </span>
            </label>
            <input
              type="text"
              id="companyName"
              name="name"
              value={companyData.name}
              onChange={handleInputChange}
              placeholder="Företag"
              required
              aria-required="true"
              aria-invalid={formErrors.name ? "true" : "false"}
              aria-describedby={
                formErrors.name ? "companyName-error" : undefined
              }
            />
            {formErrors.name && (
              <div
                id="companyName-error"
                className="error-message"
                role="alert"
              >
                {formErrors.name}
              </div>
            )}
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
              aria-invalid={formErrors.website ? "true" : "false"}
              aria-describedby={
                formErrors.website ? "website-error" : undefined
              }
            />
            {formErrors.website && (
              <div id="website-error" className="error-message" role="alert">
                {formErrors.website}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Mailadress för kontakt{" "}
              <span className="required" aria-hidden="true">
                *
              </span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={companyData.email}
              onChange={handleInputChange}
              placeholder="namn@mail.com"
              required
              aria-required="true"
              aria-invalid={formErrors.email ? "true" : "false"}
              aria-describedby={formErrors.email ? "email-error" : undefined}
            />
            {formErrors.email && (
              <div id="email-error" className="error-message" role="alert">
                {formErrors.email}
              </div>
            )}
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
              aria-invalid={formErrors.phone ? "true" : "false"}
              aria-describedby={formErrors.phone ? "phone-error" : undefined}
            />
            {formErrors.phone && (
              <div id="phone-error" className="error-message" role="alert">
                {formErrors.phone}
              </div>
            )}
          </div>

          <div className="form-group">
            <label id="attendance-label">
              Vi kommer närvara på minglet den 23/4
            </label>
            <div
              className="attendance-buttons"
              role="radiogroup"
              aria-labelledby="attendance-label"
            >
              <button
                className={`attendance-button ${
                  companyData.attending ? "active" : ""
                }`}
                onClick={() => handleAttendanceChange(true)}
                type="button"
                role="radio"
                aria-checked={companyData.attending}
              >
                Ja
              </button>
              <button
                className={`attendance-button ${
                  !companyData.attending ? "active" : ""
                }`}
                onClick={() => handleAttendanceChange(false)}
                type="button"
                role="radio"
                aria-checked={!companyData.attending}
              >
                Nej
              </button>
            </div>
          </div>

          <div className="form-group">
            <label id="specialties-label">Vi jobbar med:</label>
            <div
              className="specialties-container"
              role="group"
              aria-labelledby="specialties-label"
            >
              {allSpecialties.map((specialty) => (
                <button
                  key={specialty}
                  className={`specialty-button ${
                    selectedSpecialties.includes(specialty) ? "active" : ""
                  }`}
                  onClick={() => handleToggleSpecialty(specialty)}
                  type="button"
                  aria-pressed={selectedSpecialties.includes(specialty)}
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
            <button
              className="save-button"
              onClick={handleSave}
              disabled={saveInProgress}
              type="button"
              aria-busy={saveInProgress ? "true" : "false"}
            >
              {saveInProgress ? "Sparar..." : "Spara"}
            </button>
            <button
              className="logout-button"
              onClick={handleLogout}
              type="button"
            >
              Logga Ut
            </button>
          </div>

          {/* Hidden live region for screen reader announcements */}
          <div
            id="profile-live-region"
            className="visually-hidden"
            aria-live="assertive"
            role="status"
          ></div>
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

        .error-message {
          color: #e51236;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          display: block;
        }

        input[aria-invalid="true"],
        textarea[aria-invalid="true"] {
          border-color: #e51236;
          background-color: rgba(229, 18, 54, 0.05);
        }
      `}</style>
    </div>
  );
};

export default CompanyProfile;
