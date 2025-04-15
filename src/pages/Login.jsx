import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useNotification } from "../components/notifications/NotificationSystem";
import { showSuccess, showError, validateField, formatError } from "../components/utils/notifications";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const validateForm = () => {
    const errors = {};
    
    // Kontrollera e-post
    const emailError = validateField("email", email);
    if (emailError) errors.email = emailError;
    
    // Kontrollera lösenord (endast kontrollera att det inte är tomt för inloggning)
    if (!password) errors.password = "Lösenordet kan inte vara tomt";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    try {
      // Validera formulär först
      if (!validateForm()) {
        // Samla alla felmeddelanden
        const errorMessages = Object.values(formErrors).join(", ");
        showError(addNotification, errorMessages, "Fyll i formuläret korrekt");
        return;
      }

      setIsLoading(true);

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (loginError) throw loginError;
      
      // Success notification
      showSuccess(
        addNotification, 
        "Du kommer att omdirigeras till din profil.",
        "Inloggning lyckades!"
      );
      
      // Short delay to allow the notification to be seen
      setTimeout(() => {
        navigate("/profil");
      }, 1500);
      
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle specific error cases with user-friendly messages
      const errorMessage = formatError(err);
      
      setFormErrors(prev => ({
        ...prev,
        general: errorMessage
      }));
      
      // Error notification
      showError(
        addNotification, 
        errorMessage, 
        "Inloggning misslyckades"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="login-page">
      <Header />
      <main className="login-main">
        <div className="login-container" role="region" aria-labelledby="login-heading">
          <h1 id="login-heading">Logga in</h1>
          
          <div className="login-form-container">
            <div className="login-input-container">
              <div className="login-input-wrapper">
                <Input
                  id="email"
                  label="Mejl"
                  placeholder="Mejl..."
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Rensa fel när användaren börjar skriva
                    if (formErrors.email) {
                      setFormErrors(prev => ({ ...prev, email: null }));
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  aria-describedby={formErrors.email ? "email-error" : undefined}
                  aria-invalid={formErrors.email ? "true" : "false"}
                />
                {formErrors.email && (
                  <div id="email-error" className="login-error-message" role="alert">
                    {formErrors.email}
                  </div>
                )}
              </div>
              
              
            </div>
            
            <div className="login-input-container">
              <div className="login-input-wrapper">
                <Input
                  id="password"
                  label="Lösenord"
                  placeholder="Lösenord..."
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Rensa fel när användaren börjar skriva
                    if (formErrors.password) {
                      setFormErrors(prev => ({ ...prev, password: null }));
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  aria-describedby={formErrors.password ? "password-error" : undefined}
                  aria-invalid={formErrors.password ? "true" : "false"}
                />
                {formErrors.password && (
                  <div id="password-error" className="login-error-message" role="alert">
                    {formErrors.password}
                  </div>
                )}
              </div>
              
              
            </div>
          </div>

          {formErrors.general && (
            <div 
              className="login-error-message login-general-error" 
              role="alert"
              aria-live="assertive"
            >
              {formErrors.general}
            </div>
          )}

          <div className="login-button-container">
            <Button 
              text={isLoading ? "Loggar in..." : "Logga in"} 
              onClick={handleLogin} 
              disabled={isLoading}
              aria-busy={isLoading ? "true" : "false"}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}