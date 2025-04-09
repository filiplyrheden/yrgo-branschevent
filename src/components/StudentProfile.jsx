import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { supabase } from "../supabaseClient";
import Header from "./layout/Header";
import Footer from "./layout/Footer";

const StudentProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    interests: [],
  });

  // Lista över alla möjliga intressen (samma som specialties för företag)
  const allInterests = [
    "Digital Design",
    "HTML",
    "Front End",
    "Back End",
    "CSS",
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
    "Python",
    "In Design",
    "UI",
    "UX",
    "Spel",
  ];

  // State för intresse-val
  const [selectedInterests, setSelectedInterests] = useState([]);

  useEffect(() => {
    // Kontrollera om användaren är inloggad
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        navigate("/");
        return;
      }

      setUser(data.session.user);

      // Hämta studentdata med auth_id
      const { data: studentData, error } = await supabase
        .from("students")
        .select(
          `
          *,
          student_interests (interest)
        `
        )
        .eq("auth_id", data.session.user.id)
        .single();

      if (error) {
        console.error("Fel vid hämtning av studentdata:", error);
      } else if (studentData) {
        // Spara studentens databas-id i en variabel
        setFormData({
          firstName: studentData.name?.split(" ")[0] || "",
          lastName: studentData.name?.split(" ").slice(1).join(" ") || "",
          password: "************",
        });

        if (studentData.student_interests) {
          setSelectedInterests(
            studentData.student_interests.map((item) => item.interest)
          );
        }

        // 💾 SPARA studentens databas-id i state
        setStudentDbId(studentData.id); // <-- lägg till detta med en ny state-variabel
      }

      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleToggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (!user) {
        alert("Du måste vara inloggad.");
        return;
      }

      // Skapa fullständigt namn
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      // Uppdatera students-tabellen
      const { error: updateError } = await supabase
        .from("students")
        .update({
          name: fullName,
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      // Hantera intressen
      try {
        // Ta bort befintliga intressen
        await supabase
          .from("student_interests")
          .delete()
          .eq("student_id", user.id);

        // Lägg till nya intressen
        if (selectedInterests.length > 0) {
          const interestRows = selectedInterests.map((interest) => ({
            student_id: user.id,
            interest: interest,
          }));

          const { error: interestsError } = await supabase
            .from("student_interests")
            .insert(interestRows);

          if (interestsError) {
            console.error("Fel vid sparande av intressen:", interestsError);
          }
        }
      } catch (interestError) {
        console.error("Fel vid hantering av intressen:", interestError);
      }

      alert("Profil sparad!");
    } catch (error) {
      console.error("Fel vid sparande av profil:", error);
      alert("Ett fel uppstod när profilen skulle sparas.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    // Implementera lösenordsbyte om det behövs
    alert("Funktion för att ändra lösenord kommer snart.");
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

        <div className="form-group">
          <label htmlFor="firstName">Förnamn</label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Förnamn"
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Efternamn</label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Efternamn"
          />
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
            style={{
              background: "#001A52",
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "8px 16px",
              margin: "8px 0",
              cursor: "pointer",
            }}
          >
            Ändra Lösenord
          </button>
        </div>

        <div className="form-group">
          <label>Jag är intresserad av:</label>
          <div className="specialties-container">
            {allInterests.map((interest) => (
              <button
                key={interest}
                type="button"
                className={`specialty-button ${
                  selectedInterests.includes(interest) ? "active" : ""
                }`}
                onClick={() => handleToggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div className="profile-buttons">
          <button
            className="save-button"
            onClick={handleSave}
            disabled={loading}
            type="button"
          >
            {loading ? "Sparar..." : "Spara"}
          </button>
          <button
            className="logout-button"
            onClick={handleLogout}
            type="button"
          >
            Logga Ut
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StudentProfile;
