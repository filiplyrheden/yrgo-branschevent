
/**
 * Visar en bekräftelsenotifikation
 * @param {function} addNotification - NotificationSystem-funktionen
 * @param {string} message - Meddelandet som ska visas
 * @param {string} [title="Lyckades"] - Notifikationens titel
 * @param {number} [duration=4000] - Hur länge notifikationen visas (ms)
 */
export const showSuccess = (addNotification, message, title = "Lyckades", duration = 4000) => {
    addNotification({
      type: "success",
      title,
      message,
      duration
    });
  };
  
  /**
   * Visar en felnotifikation
   * @param {function} addNotification - NotificationSystem-funktionen
   * @param {string} message - Felmeddelandet som ska visas
   * @param {string} [title="Ett fel uppstod"] - Notifikationens titel
   * @param {number} [duration=5000] - Hur länge notifikationen visas (ms)
   */
  export const showError = (addNotification, message, title = "Ett fel uppstod", duration = 5000) => {
    addNotification({
      type: "error",
      title,
      message,
      duration
    });
  };
  
  /**
   * Visar en informationsnotifikation
   * @param {function} addNotification - NotificationSystem-funktionen
   * @param {string} message - Informationen som ska visas
   * @param {string} [title="Information"] - Notifikationens titel
   * @param {number} [duration=3000] - Hur länge notifikationen visas (ms)
   */
  export const showInfo = (addNotification, message, title = "Information", duration = 3000) => {
    addNotification({
      type: "info",
      title,
      message,
      duration
    });
  };
  
  /**
   * Formaterar felmeddelanden från Supabase för att vara användarvänliga
   * @param {Error} error - Felet som ska formateras
   * @returns {string} - Användarrvänligt felmeddelande
   */
  export const formatError = (error) => {
    if (!error || !error.message) return "Ett okänt fel inträffade";
    
    if (error.message.includes("duplicate")) {
      return "E-postadressen används redan av ett annat konto";
    } else if (error.message.includes("password") || error.message.includes("lösenord")) {
      return "Lösenordet uppfyller inte säkerhetskraven. Det bör vara minst 6 tecken";
    } else if (error.message.includes("network") || error.message.includes("nätverks")) {
      return "Nätverksfel. Kontrollera din internetanslutning";
    } else if (error.message.includes("not found") || error.message.includes("hittades inte")) {
      return "Den begärda resursen hittades inte";
    } else if (error.message.includes("Invalid login credentials")) {
      return "Felaktiga inloggningsuppgifter. Kontrollera din e-postadress och lösenord";
    } else if (error.message.includes("invalid email") || error.message.includes("ogiltig e-post")) {
      return "Ogiltig e-postadress";
    }
    
    return error.message;
  };
  
  /**
   * Validerar ett formulärfält och returnerar ett felmeddelande om det finns
   * @param {string} type - Typ av validering ("required", "email", "password", etc)
   * @param {any} value - Värdet som ska valideras
   * @returns {string|null} - Felmeddelande eller null om validering passerade
   */
  export const validateField = (type, value) => {
    switch(type) {
      case "required":
        return value && value.trim() !== "" ? null : "Detta fält är obligatoriskt";
      
      case "email":
        return /\S+@\S+\.\S+/.test(value) ? null : "Ogiltig e-postadress";
      
      case "password":
        return value && value.length >= 6 ? null : "Lösenordet måste vara minst 6 tecken";
      
      case "url":
        return !value || /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(value) 
          ? null 
          : "Ogiltig webbadress";
      
      case "phone":
        return !value || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(value) 
          ? null 
          : "Ogiltigt telefonnummer";
      
      default:
        return null;
    }
  };