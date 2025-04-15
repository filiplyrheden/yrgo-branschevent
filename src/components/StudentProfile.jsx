import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { supabase } from "../supabaseClient";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import { useNotification } from "./notifications/NotificationSystem";
import {
  showSuccess,
  showError,
  showInfo,
} from "../components/utils/notifications";

const StudentProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [user, setUser] = useState(null);
  const [studentDbId, setStudentDbId] = useState(null);
  
  // State för lösenordshantering
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "************", // Lösenordet visas aldrig i klartext
  });
  const [formErrors, setFormErrors] = useState({});
  const { addNotification } = useNotification();
  
  // Ref för att spåra om profilen har hämtats
  const profileFetchedRef = useRef(false);

  // Lista över alla möjliga intressen (samma som specialties för företag)
  const allInterests = [
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
    "CSS"
  ];

  // State för intresse-val
  const [selectedInterests, setSelectedInterests] = useState([]);

  useEffect(() => {
    // Kontrollera om användaren är inloggad och hämta profildata
    const checkUser = async () => {
      try {
        // Undvik att köra om profilen redan har hämtats
        if (profileFetchedRef.current) return;

        setLoading(true);
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!sessionData.session) {
          navigate("/");
          return;
        }

        // Spara användardata
        setUser(sessionData.session.user);

        // Hämta studentdata med user.id som auth_id
        await fetchStudentProfile(sessionData.session.user.id);
      } catch (error) {
        console.error("Fel vid inläsning av användarprofil:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate, addNotification]); // Ta bort profileFetched beroendet

  const fetchStudentProfile = async (userId) => {
    try {
      console.log("Hämtar studentprofil för användar-ID:", userId);

      // Försök först hämta användarens e-post från Supabase Auth
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        console.error("Fel vid hämtning av användardata:", userError);
        throw userError;
      }

      const userEmail = userData?.user?.email || "";
      console.log("Användarens e-post:", userEmail);

      // Steg 1: Kontrollera om studenten finns baserat på auth_id
      let { data: existingStudents, error: fetchError } = await supabase
        .from("students")
        .select("id, name, auth_id, email")
        .eq("auth_id", userId);

      // Om inget hittas, försök söka med e-postadressen som backup
      if ((!existingStudents || existingStudents.length === 0) && userEmail) {
        console.log(
          "Hittade ingen student på auth_id, provar med e-post:",
          userEmail
        );
        const { data: studentsByEmail, error: emailFetchError } = await supabase
          .from("students")
          .select("id, name, auth_id, email")
          .eq("email", userEmail);

        if (!emailFetchError && studentsByEmail && studentsByEmail.length > 0) {
          existingStudents = studentsByEmail;
          console.log("Hittade student via e-post:", studentsByEmail);
        }
      }

      if (fetchError) {
        console.error("Fel vid hämtning av studentdata:", fetchError);
        throw fetchError;
      }

      console.log("Hämtad studentdata:", existingStudents);

      let student;

      // Om studenten redan finns
      if (existingStudents && existingStudents.length > 0) {
        student = existingStudents[0];
        console.log("Hittade existerande student:", student);

        // Kontrollera att auth_id är korrekt, uppdatera om det behövs
        if (student.auth_id !== userId) {
          console.log("Uppdaterar auth_id för studentpost:", student.id);
          await supabase
            .from("students")
            .update({ auth_id: userId })
            .eq("id", student.id);
        }

        // Spara studentens databas-id
        setStudentDbId(student.id);

        // Dela upp namnet i för- och efternamn
        let firstName = "";
        let lastName = "";

        if (student.name) {
          const nameParts = student.name.split(" ");
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(" ") || "";
        }

        // Uppdatera formData
        setFormData({
          firstName,
          lastName,
          password: "************", // Lösenordet visas aldrig i klartext
        });

        // Hämta studentintressen
        const { data: interests, error: interestsError } = await supabase
          .from("student_interests")
          .select("interest")
          .eq("student_id", student.id);

        if (interestsError) {
          console.error("Fel vid hämtning av intressen:", interestsError);
        } else if (interests && interests.length > 0) {
          // Uppdatera selectedInterests
          setSelectedInterests(interests.map((item) => item.interest));
        }
      } else {
        // Om studenten inte finns, skapa en ny post i students-tabellen
        // Generera ett defaultnamn för att undvika not null-fel
        const defaultName = "Ny Student";

        console.log("Skapar ny studentprofil med e-post:", userEmail);

        const { data: newStudent, error: insertError } = await supabase
          .from("students")
          .insert([
            {
              auth_id: userId,
              name: defaultName,
              email: userEmail || `user-${userId}@example.com`, // Fallback för att undvika not null-fel
            },
          ])
          .select();

        if (insertError) {
          console.error("Fel vid skapande av studentprofil:", insertError);
          throw insertError;
        }

        if (newStudent && newStudent.length > 0) {
          student = newStudent[0];
          setStudentDbId(student.id);

          // Sätt för- och efternamn till tomma initialt
          setFormData({
            firstName: "",
            lastName: "",
            password: "************",
          });
        } else {
          throw new Error("Kunde inte skapa studentprofil");
        }
      }
      
      // Markera att profilen har hämtats framgångsrikt med useRef
      profileFetchedRef.current = true;
      
    } catch (error) {
      console.error("Fel vid hämtning av studentprofil:", error);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });

    // Rensa fel när användaren börjar skriva
    if (formErrors[id]) {
      setFormErrors({
        ...formErrors,
        [id]: null,
      });
    }
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    
    // Rensa fel när användaren börjar skriva
    if (passwordErrors.newPassword) {
      setPasswordErrors({
        ...passwordErrors,
        newPassword: null
      });
    }
  };

  const handleToggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "Förnamn kan inte vara tomt";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Efternamn kan inte vara tomt";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};

    if (!newPassword) {
      errors.newPassword = "Lösenord kan inte vara tomt";
    } else if (newPassword.length < 6) {
      errors.newPassword = "Lösenordet måste vara minst 6 tecken långt";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    try {
      // Validera formuläret
      if (!validateForm()) {
        showError(
          addNotification,
          "Vänligen fyll i alla obligatoriska fält",
          "Valideringsfel"
        );

        // Fokusera första fältet med fel
        const firstErrorField = Object.keys(formErrors)[0];
        if (firstErrorField) {
          document.getElementById(firstErrorField)?.focus();
        }

        return;
      }

      setSaveInProgress(true);
      setLoading(true);

      if (!user) {
        showError(
          addNotification,
          "Du måste vara inloggad för att spara",
          "Sessionsfel"
        );
        return;
      }

      // Om studentDbId saknas, försök hämta profilen igen
      if (!studentDbId) {
        console.log("studentDbId saknas, försöker hämta profil igen");
        await fetchStudentProfile(user.id);

        // Om vi fortfarande inte har ett studentDbId
        if (!studentDbId) {
          showError(
            addNotification,
            "Kunde inte hitta din profil. Försök logga ut och in igen.",
            "Profilfel"
          );
          return;
        }
      }
      
      // Hantera lösenordsändring om nytt lösenord har angetts
      if (showPasswordChange && newPassword) {
        // Validera lösenordet först
        if (!validatePassword()) {
          setSaveInProgress(false);
          setLoading(false);
          return;
        }
        
        try {
          // Använd Supabase Auth för att uppdatera lösenordet
          const { error } = await supabase.auth.updateUser({
            password: newPassword
          });
          
          if (error) {
            throw error;
          }
          
          // Visa framgångsmeddelande för lösenordsändring
          showSuccess(
            addNotification, 
            "Ditt lösenord har uppdaterats", 
            "Lösenord ändrat"
          );
          
          // Stäng lösenordsfältet och återställ
          setShowPasswordChange(false);
          setNewPassword("");
          
        } catch (error) {
          console.error("Fel vid uppdatering av lösenord:", error);
          
          // Mer detaljerad felhantering för lösenordsuppdatering
          let errorMessage = "Ett fel uppstod när lösenordet skulle uppdateras";
          
          if (error.message) {
            if (error.message.includes("weak-password")) {
              errorMessage = "Lösenordet är för svagt. Välj ett starkare lösenord.";
            } else if (error.message.includes("requires-recent-login")) {
              errorMessage = "Du behöver logga in igen innan du kan ändra lösenord.";
              // Logga ut användaren och skicka till inloggningssidan
              await supabase.auth.signOut();
              navigate("/login");
              return;
            }
          }
          
          showError(addNotification, errorMessage, "Lösenordsfel");
          setSaveInProgress(false);
          setLoading(false);
          return;
        }
      }

      // Skapa fullständigt namn
      let fullName = `${formData.firstName} ${formData.lastName}`.trim();
      if (!fullName) {
        // Säkerställ att name inte är tom (för att uppfylla not null-villkoret)
        fullName = "Okänd Student";
      }

      console.log("Sparar studentprofil med ID:", studentDbId);
      console.log("Fullständigt namn:", fullName);

      // Hämta aktuell e-postadress från auth
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData?.user?.email || "";

      // Uppdatera students-tabellen
      const { data: updateData, error: updateError } = await supabase
        .from("students")
        .update({
          name: fullName,
          auth_id: user.id, // Säkerställ att auth_id är korrekt
          email: userEmail, // Uppdatera e-post för säkerhets skull
        })
        .eq("id", studentDbId)
        .select();

      if (updateError) {
        console.error("Fel vid uppdatering av studentdata:", updateError);

        // Om uppdatering misslyckades, kontrollera om det är ett "not null"-fel
        if (
          updateError.message &&
          updateError.message.includes("violates not-null constraint")
        ) {
          showError(
            addNotification,
            "Ett obligatoriskt fält saknas. Kontrollera att du har fyllt i alla fält.",
            "Valideringsfel"
          );
        } else {
          throw updateError;
        }
        return;
      }

      console.log("Uppdaterad studentdata:", updateData);

      // Hantera intressen - använd en mer robust try-catch-struktur
      let interestsSuccess = true;

      try {
        // Ta bort befintliga intressen
        const { error: deleteError } = await supabase
          .from("student_interests")
          .delete()
          .eq("student_id", studentDbId);

        if (deleteError) {
          console.error("Fel vid borttagning av intressen:", deleteError);
          interestsSuccess = false;
        } else {
          // Lägg bara till nya intressen om borttagningen lyckades
          if (selectedInterests.length > 0) {
            const interestRows = selectedInterests.map((interest) => ({
              student_id: studentDbId,
              interest: interest,
            }));

            const { error: interestsError } = await supabase
              .from("student_interests")
              .insert(interestRows);

            if (interestsError) {
              console.error("Fel vid sparande av intressen:", interestsError);
              interestsSuccess = false;
            }
          }
        }
      } catch (interestError) {
        console.error("Fel vid hantering av intressen:", interestError);
        interestsSuccess = false;
      }

      if (interestsSuccess) {
        showSuccess(
          addNotification,
          "Din profil har sparats framgångsrikt",
          "Profil sparad"
        );
      } else {
        showSuccess(
          addNotification,
          "Din profil har sparats, men det uppstod ett problem med dina intressen",
          "Delvis sparat"
        );
      }

      // Announce to screen readers
      const liveRegion = document.getElementById("profile-live-region");
      if (liveRegion) {
        liveRegion.textContent = "Profil sparad framgångsrikt.";
      }
    } catch (error) {
      console.error("Fel vid sparande av profil:", error);

      // Mer detaljerad felhantering
      let errorMessage = "Ett fel uppstod när profilen skulle sparas";

      if (error.message) {
        if (error.message.includes("duplicate key")) {
          errorMessage = "E-postadressen används redan av ett annat konto";
        } else if (error.message.includes("not-null constraint")) {
          errorMessage =
            "Ett obligatoriskt fält saknas. Kontrollera alla fält.";
        } else if (error.message.includes("foreign key constraint")) {
          errorMessage =
            "Referensfel i databasen. Försök igen eller kontakta support.";
        }
      }

      showError(addNotification, errorMessage, "Sparfel");
    } finally {
      setSaveInProgress(false);
      setLoading(false);
    }

    navigate("/swajp");
  };

  const handleChangePassword = () => {
    // Togglea visning av lösenordsfältet
    setShowPasswordChange(!showPasswordChange);
    
    // Återställ lösenord och fel om fältet stängs
    if (showPasswordChange) {
      setNewPassword("");
      setPasswordErrors({});
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Fel vid utloggning:", error);
      showError(
        addNotification,
        "Ett fel uppstod vid utloggning",
        "Utloggningsfel"
      );
    }
  };

  const handleShowDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteInProgress(true);

      // 1. Kontrollera autentisering
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        addNotification({
          type: "error",
          title: "Sessionsfel",
          message: "Din session har gått ut. Vänligen logga in igen.",
          duration: 5000
        });
        navigate("/");
        return;
      }

      const userId = sessionData.session.user.id;
      
      // 2. Ta bort data i denna ordning för att respektera referensintegritet:
      
      // a) Ta bort intressen först
      const { error: interestsError } = await supabase
        .from("student_interests")
        .delete()
        .eq("student_id", studentDbId);

      if (interestsError) {
        console.error("Fel vid borttagning av intressen:", interestsError);
      }

      // b) Ta bort studentposter från andra tabeller om det finns några
      // Till exempel, favoriter, matchningar, etc.
      
      // c) Ta bort studentposten
      const { error: studentError } = await supabase
        .from("students")
        .delete()
        .eq("id", studentDbId);

      if (studentError) {
        console.error("Fel vid borttagning av studentdata:", studentError);
        throw studentError;
      }

      // Spara en temporär flagga i sessionStorage innan vi loggar ut användaren
      sessionStorage.setItem('accountDeleted', 'true');

      // Logga ut användaren och navigera till startsidan
      await supabase.auth.signOut();
      navigate("/");
      
    } catch (error) {
      console.error("Fel vid radering av konto:", error);
      
      addNotification({
        type: "error",
        title: "Raderingsfel",
        message: "Ett fel uppstod när kontot skulle raderas. Vänligen försök igen senare.",
        duration: 5000
      });
      
      setShowDeleteConfirmation(false);
    } finally {
      setDeleteInProgress(false);
    }
  };

  if (loading && !saveInProgress) {
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

          {/* Ny två-kolumns layout för formuläret */}
          <div className="profile-form-container">
            <div className="profile-form-left-column">
              {/* Personlig information */}
              <div className="form-group">
                <label htmlFor="firstName">
                  Förnamn{" "}
                  <span className="required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Förnamn"
                  required
                  aria-required="true"
                  aria-invalid={formErrors.firstName ? "true" : "false"}
                  aria-describedby={
                    formErrors.firstName ? "firstName-error" : undefined
                  }
                />
                {formErrors.firstName && (
                  <div id="firstName-error" className="error-message" role="alert">
                    {formErrors.firstName}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  Efternamn{" "}
                  <span className="required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Efternamn"
                  required
                  aria-required="true"
                  aria-invalid={formErrors.lastName ? "true" : "false"}
                  aria-describedby={
                    formErrors.lastName ? "lastName-error" : undefined
                  }
                />
                {formErrors.lastName && (
                  <div id="lastName-error" className="error-message" role="alert">
                    {formErrors.lastName}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Lösenord</label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  readOnly
                  placeholder="************"
                />
                
                <button
                  type="button"
                  className="password-change-button"
                  onClick={handleChangePassword}
                >
                  {showPasswordChange ? "Avbryt" : "Ändra Lösenord"}
                </button>
                
                {/* Nytt lösenordsfält som visas när användaren klickar på "Ändra Lösenord" */}
                {showPasswordChange && (
                  <div className="password-field-container">
                    <label htmlFor="newPassword">
                      Nytt lösenord{" "}
                      <span className="required" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      placeholder="Ange nytt lösenord"
                      required
                      aria-required="true"
                      aria-invalid={passwordErrors.newPassword ? "true" : "false"}
                      aria-describedby={
                        passwordErrors.newPassword ? "newPassword-error" : undefined
                      }
                    />
                    {passwordErrors.newPassword && (
                      <div id="newPassword-error" className="error-message" role="alert">
                        {passwordErrors.newPassword}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="profile-form-right-column">
              {/* Intressen-sektion */}
              <div className="form-group">
                <label id="interests-label">Jag är intresserad av:</label>
                <div
                  className="specialties-container"
                  role="group"
                  aria-labelledby="interests-label"
                >
                  {allInterests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      className={`specialty-button ${
                        selectedInterests.includes(interest) ? "active" : ""
                      }`}
                      onClick={() => handleToggleInterest(interest)}
                      aria-pressed={selectedInterests.includes(interest)}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons section */}
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
            <button
              className="delete-button"
              onClick={handleShowDeleteConfirmation}
              type="button"
              disabled={deleteInProgress}
            >
              Radera konto
            </button>
          </div>
          
          {/* Bekräftelsedialog för radering av konto */}
          {showDeleteConfirmation && (
            <div className="delete-confirmation-overlay">
              <div className="delete-confirmation-dialog" role="alertdialog" aria-labelledby="delete-title" aria-describedby="delete-description">
                <h2 id="delete-title">Bekräfta radering</h2>
                <p id="delete-description">Är du säker på att du vill radera ditt konto? Denna åtgärd kan inte ångras och all din data kommer att tas bort permanent.</p>
                
                <div className="confirmation-buttons">
                  <button 
                    className="cancel-button" 
                    onClick={handleCancelDelete}
                    type="button"
                  >
                    Avbryt
                  </button>
                  <button 
                    className="confirm-delete-button" 
                    onClick={handleDeleteAccount}
                    type="button"
                    disabled={deleteInProgress}
                    aria-busy={deleteInProgress ? "true" : "false"}
                  >
                    {deleteInProgress ? "Raderar..." : "Ja, radera mitt konto"}
                  </button>
                </div>
              </div>
            </div>
          )}

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
    </div>
  );
};

export default StudentProfile;