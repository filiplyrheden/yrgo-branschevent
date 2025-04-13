import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingForm.css";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button";
import Label from "../ui/Label.jsx";
import RegisterPopup from "./RegisterPopup";
import PolicyPopup from "./PolicyPopup";
import { supabase } from "../../supabaseClient.js";
import { useNotification } from "../notifications/NotificationSystem";
import { showSuccess, showError, showInfo, validateField, formatError } from "../utils/notifications";

const LandingForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("Företag");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    acceptTerms: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const { addNotification } = useNotification();

  const handleUserTypeChange = (type) => {
    setUserType(type);
    showInfo(addNotification, `Du registreras som ${type}`);
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
    
    // Rensa fel när användaren börjar skriva
    if (formErrors[id]) {
      setFormErrors({
        ...formErrors,
        [id]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Kontrollera e-post
    const emailError = validateField("email", formData.email);
    if (emailError) errors.email = emailError;
    
    // Kontrollera lösenord
    const passwordError = validateField("password", formData.password);
    if (passwordError) errors.password = passwordError;
    
    // Kontrollera villkoren
    if (!formData.acceptTerms) {
      errors.acceptTerms = "Du måste acceptera villkoren för att fortsätta";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked"); // Debug
    
    // Validera formuläret
    if (!validateForm()) {
      // Visa ett sammanfattande felmeddelande
      const errorList = Object.values(formErrors).join(", ");
      showError(addNotification, errorList, "Valideringsfel");
      return;
    }

    try {
      setLoading(true);

      // Registrera användare med Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: userType,
          },
        },
      });

      if (error) throw error;

      if (data?.user) {
        // Visa bekräftelse på lyckad registrering
        showSuccess(
          addNotification, 
          `Du har registrerats som ${userType}. Du kommer att omdirigeras till din profil.`,
          "Registrering lyckades!"
        );
        
        if (userType === "Företag") {
          // Kontrollera om företaget redan finns
          const { data: existingCompany } = await supabase
            .from("companies")
            .select("id")
            .eq("id", data.user.id)
            .maybeSingle();

          if (!existingCompany) {
            // Skapa ny företagspost
            const { error: insertError } = await supabase
              .from("companies")
              .insert([
                {
                  id: data.user.id,
                  email: formData.email,
                  company_name: "",
                  coming_to_event: true, // Default till närvarande
                },
              ]);

            if (insertError) throw insertError;

            try {
              // Skapa en tom post i additional_info-tabellen
              await supabase.from("company_additional_info").insert([
                {
                  company_id: data.user.id,
                  additional_work_info: "",
                },
              ]);
            } catch (additionalInfoError) {
              console.error(
                "Error creating additional info:",
                additionalInfoError
              );
              // Fortsätt även om detta misslyckas
            }
          }

          // Kort fördröjning för att användaren ska hinna se bekräftelsen
          setTimeout(() => {
            navigate("/profil");
          }, 1500);
        } else {
          // Kontrollera om studenten redan finns
          const { data: existingStudent } = await supabase
            .from("students")
            .select("id")
            .eq("id", data.user.id)
            .maybeSingle();

          if (!existingStudent) {
            // Skapa ny studentpost
            const { error: insertError } = await supabase
              .from("students")
              .insert([
                {
                  id: data.user.id,
                  email: formData.email,
                  name: "",
                },
              ]);

            if (insertError) throw insertError;
          }

          // Kort fördröjning för att användaren ska hinna se bekräftelsen
          setTimeout(() => {
            navigate("/profil");
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error under registrering:", error);
      
      // Visa ett användarvänligt felmeddelande
      showError(
        addNotification, 
        formatError(error), 
        "Registrering misslyckades"
      );
      
      setFormErrors(prev => ({
        ...prev,
        general: formatError(error)
      }));
    } finally {
      setLoading(false);
    }
  };

  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const [showPolicyPopup, setShowPolicyPopup] = useState(false);

  const openPolicyPopup = (e) => {
    e.preventDefault();
    setShowPolicyPopup(true);
  };

  const closePolicyPopup = () => {
    setShowPolicyPopup(false);
  };

  return (
    <div className="landing-form">
      <div className="landing-form-content">
        <h1>
          <span>&lt;h1&gt;</span>Mingel för framtidens digitala stjärnor!
          <span>&lt;/h1&gt;</span>
        </h1>
        <p>
          <span>&lt;p&gt;</span>Letar ni efter nästa webbutvecklare eller
          digital designer till ert team? Eller bara nyfikna på framtidens
          talanger? Kom och mingla med studenter från Yrgo, se deras projekt och
          kanske hitta en perfekt match – för jobb, samarbete eller LIA!
          <span>&lt;/p&gt;</span>
        </p>
        <p>
          <span>&lt;p&gt;</span>Ta gärna med något som visar vilket företag ni
          representerar. Det blir stationer för möten, men framför allt en
          avslappnad chans att snacka och nätverka.<span>&lt;/p&gt;</span>
        </p>
        <p>
          <span>&lt;p&gt;</span>Välkomna önskar Webbutvecklare & Digital
          Designers på Yrgo!<span>&lt;/p&gt;</span>
        </p>
        <div className="register-container">
          <p id="register-text">Registrera dig här</p>
          <svg
            className="register-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            onClick={togglePopup}
            style={{ cursor: "pointer" }}
            aria-label="Mer information om registrering"
            role="button"
            tabIndex="0"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                togglePopup();
              }
            }}
          >
            <path
              d="M16 3C13.4288 3 10.9154 3.76244 8.77759 5.1909C6.63975 6.61935 4.97351 8.64968 3.98957 11.0251C3.00563 13.4006 2.74819 16.0144 3.2498 18.5362C3.75141 21.0579 4.98953 23.3743 6.80762 25.1924C8.6257 27.0105 10.9421 28.2486 13.4638 28.7502C15.9856 29.2518 18.5995 28.9944 20.9749 28.0104C23.3503 27.0265 25.3807 25.3603 26.8091 23.2224C28.2376 21.0846 29 18.5712 29 16C28.9964 12.5533 27.6256 9.24882 25.1884 6.81163C22.7512 4.37445 19.4467 3.00364 16 3ZM16 27C13.8244 27 11.6977 26.3549 9.88873 25.1462C8.07979 23.9375 6.66989 22.2195 5.83733 20.2095C5.00477 18.1995 4.78693 15.9878 5.21137 13.854C5.63581 11.7202 6.68345 9.7602 8.22183 8.22183C9.76021 6.68345 11.7202 5.6358 13.854 5.21136C15.9878 4.78692 18.1995 5.00476 20.2095 5.83733C22.2195 6.66989 23.9375 8.07979 25.1462 9.88873C26.3549 11.6977 27 13.8244 27 16C26.9967 18.9164 25.8367 21.7123 23.7745 23.7745C21.7123 25.8367 18.9164 26.9967 16 27ZM18 22C18 22.2652 17.8946 22.5196 17.7071 22.7071C17.5196 22.8946 17.2652 23 17 23C16.4696 23 15.9609 22.7893 15.5858 22.4142C15.2107 22.0391 15 21.5304 15 21V16C14.7348 16 14.4804 15.8946 14.2929 15.7071C14.1054 15.5196 14 15.2652 14 15C14 14.7348 14.1054 14.4804 14.2929 14.2929C14.4804 14.1054 14.7348 14 15 14C15.5304 14 16.0391 14.2107 16.4142 14.5858C16.7893 14.9609 17 15.4696 17 16V21C17.2652 21 17.5196 21.1054 17.7071 21.2929C17.8946 21.4804 18 21.7348 18 22ZM14 10.5C14 10.2033 14.088 9.91332 14.2528 9.66665C14.4176 9.41997 14.6519 9.22771 14.926 9.11418C15.2001 9.00065 15.5017 8.97094 15.7926 9.02882C16.0836 9.0867 16.3509 9.22956 16.5607 9.43934C16.7704 9.64912 16.9133 9.91639 16.9712 10.2074C17.0291 10.4983 16.9994 10.7999 16.8858 11.074C16.7723 11.3481 16.58 11.5824 16.3334 11.7472C16.0867 11.912 15.7967 12 15.5 12C15.1022 12 14.7206 11.842 14.4393 11.5607C14.158 11.2794 14 10.8978 14 10.5Z"
              fill="black"
            />
          </svg>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="label-choice-container">
            <p>Jag är:</p>
            <div
              className={userType === "Företag" ? "active-label" : ""}
              style={{ cursor: "pointer" }}
              onClick={() => handleUserTypeChange("Företag")}
            >
              <Label text="Företag" active={userType === "Företag"} />
            </div>
            <div
              className={userType === "Student" ? "active-label" : ""}
              style={{ cursor: "pointer" }}
              onClick={() => handleUserTypeChange("Student")}
            >
              <Label text="Student" active={userType === "Student"} />
            </div>
          </div>
          <div className="input-container">
            <Input
              id="email"
              label="Mejl"
              placeholder="Mejl..."
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              aria-invalid={formErrors.email ? "true" : "false"}
              aria-describedby={formErrors.email ? "email-error" : undefined}
            />
            {formErrors.email && (
              <div id="email-error" className="error-message" role="alert">
                {formErrors.email}
              </div>
            )}
            
            <Input
              id="password"
              label="Lösenord"
              placeholder="Lösenord..."
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              aria-invalid={formErrors.password ? "true" : "false"}
              aria-describedby={formErrors.password ? "password-error" : undefined}
            />
            {formErrors.password && (
              <div id="password-error" className="error-message" role="alert">
                {formErrors.password}
              </div>
            )}
          </div>
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
              aria-required="true"
              aria-invalid={formErrors.acceptTerms ? "true" : "false"}
            />
            <label htmlFor="acceptTerms" id="consent-label">
              Jag accepterar{" "}
              <a href="#" id="conditions-policy" onClick={openPolicyPopup}>
                Villkor och Sekretesspolicy
              </a>
            </label>
          </div>
          {formErrors.acceptTerms && (
            <div className="error-message" role="alert">{formErrors.acceptTerms}</div>
          )}
          {formErrors.general && (
            <div role="alert" className="error-message">{formErrors.general}</div>
          )}
          <div className="button-container">
            <Button 
              text={loading ? "Registrerar..." : "Registrera"} 
              type="submit" 
              disabled={loading}
              aria-busy={loading ? "true" : "false"}
            />
          </div>
          {showPopup && <RegisterPopup onClose={closePopup} />}
          {showPolicyPopup && <PolicyPopup onClose={closePolicyPopup} />}
        </form>
      </div>
      
      {/* Styling för felmeddelanden */}
      <style jsx>{`
        .error-message {
          color: #E51236;
          font-size: 0.875rem;
          margin: 0.5rem 0;
          display: block;
        }
      `}</style>
    </div>
  );
};

export default LandingForm;