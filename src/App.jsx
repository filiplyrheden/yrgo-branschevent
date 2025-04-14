import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "./supabaseClient";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer.jsx";
import "./styles/Global.css";
import { NotificationProvider, useNotification } from "./components/notifications/NotificationSystem";

import CompanyDetails from "./pages/CompanyDetails.jsx";
import Home from "./pages/Home";
import Companies from "./pages/Companies";
import CompanyProfile from "./components/CompanyProfile";
import StudentProfile from "./components/StudentProfile";
import Swipe from "./components/swipe.jsx";
import Login from "./pages/Login";
import Favorites from "./pages/Favorites";
import CompanyConfirmation from "./pages/CompanyConfirmation";

// Wrapper-komponent för att hantera globala notifikationer
const AppWithNotifications = () => {
  const { addNotification } = useNotification();

  useEffect(() => {
    // Kontrollera om användaren just har raderat sitt konto
    const accountDeleted = sessionStorage.getItem('accountDeleted');
    
    if (accountDeleted === 'true') {
      // Visa bekräftelsemeddelande
      addNotification({
        type: "success",
        title: "Konto raderat",
        message: "Ditt konto har raderats framgångsrikt.",
        duration: 5000
      });
      
      // Ta bort flaggan från sessionStorage så att meddelandet inte visas igen
      sessionStorage.removeItem('accountDeleted');
    }
  }, [addNotification]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Header />
            <Home />
            <Footer />
          </>
        }
      />
      <Route path="/profil" element={<ProfilePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/swajp" element={<StudentRoute element={<Swipe />} />} />
      <Route
        path="/favoriter"
        element={<StudentRoute element={<Favorites />} />}
      />
      <Route
        path="/foretag"
        element={<StudentRoute element={<Companies />} />}
      />
      <Route
        path="/company/:id"
        element={<StudentRoute element={<CompanyDetails />} />}
      />
      <Route path="/companyconfirmation" element={<CompanyConfirmation />} />
    </Routes>
  );
};

// Profilsida som dirigerar till rätt komponent baserat på användartyp
const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setAuthenticated(true);
        // Hämta användartyp från metadata
        const userType = data.session.user.user_metadata?.user_type;
        setUserType(userType);
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div aria-live="polite" role="status">
        Laddar...
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/" />;
  }

  return userType === "Företag" ? <CompanyProfile /> : <StudentProfile />;
};

// Skyddad route-komponent med kontroll för användartyp
const ProtectedRoute = ({
  element,
  allowedUserTypes = ["Student", "Företag"],
}) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          setAuthenticated(true);
          // Hämta användartyp från metadata
          const userType = data.session.user.user_metadata?.user_type;
          setUserType(userType);
        }

        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div aria-live="polite" role="status">
        Laddar...
      </div>
    );
  }

  // Redirect if not authenticated
  if (!authenticated) {
    return <Navigate to="/" />;
  }

  // Redirect if not allowed user type
  if (!allowedUserTypes.includes(userType)) {
    return <Navigate to="/profil" />;
  }

  return element;
};

// Student-only protected route
const StudentRoute = ({ element }) => {
  return <ProtectedRoute element={element} allowedUserTypes={["Student"]} />;
};

function App() {
  return (
    <NotificationProvider>
      <AppWithNotifications />
    </NotificationProvider>
  );
}

export default App;