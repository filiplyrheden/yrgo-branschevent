import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// Importera dina komponenter
import Home from "./pages/Home";
import CompanyProfile from "./components/CompanyProfile";
import StudentProfile from "./components/StudentProfile";
import Swipe from "./components/swipe";

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
    return <div>Laddar...</div>;
  }
  
  if (!authenticated) {
    return <Navigate to="/" />;
  }
  
  return userType === "Företag" ? <CompanyProfile /> : <StudentProfile />;
};

// Skyddad route-komponent
const ProtectedRoute = ({ element }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setAuthenticated(!!data.session);
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  if (loading) {
    return <div>Laddar...</div>;
  }
  
  return authenticated ? element : <Navigate to="/" />;
};
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer.jsx";
import "./styles/Global.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profil" element={<ProfilePage />} />
      <Route path="/swajp" element={<ProtectedRoute element={<Swipe />} />} />
    </Routes>
  );
}

export default App;