import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer.jsx";
import "./styles/Global.css";

import CompanyDetails from "./pages/CompanyDetails.jsx";
import Home from "./pages/Home";
import CompanyProfile from "./components/CompanyProfile";
import StudentProfile from "./components/StudentProfile";
import Swipe from "./components/swipe";
import Favorites from "./pages/Favorites";

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

// Skyddad route-komponent med kontroll för användartyp
const ProtectedRoute = ({ element, allowedUserTypes = ["Student", "Företag"] }) => {
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
    return <div>Laddar...</div>;
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
    <Routes>
      <Route 
        path="/" 
        element={
          <> 
            <Header/>
            <Home/>
            <Footer/> 
          </>
        } 
      />
      <Route path="/profil" element={<ProfilePage />} />
      <Route path="/swajp" element={<StudentRoute element={<Swipe />} />} />
      <Route path="/favoriter" element={<StudentRoute element={<Favorites />} />} />
      <Route path="/company/:id" element={<StudentRoute element={<CompanyDetails />} />} />
    </Routes>
  );
}

export default App;