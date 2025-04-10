import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer.jsx";
import "./styles/Global.css";
import Home from "./pages/Home";
import CompanyProfile from "./components/CompanyProfile";
import StudentProfile from "./components/StudentProfile";
import Swipe from "./components/Swipe";
import Login from "./pages/Login";

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

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            {" "}
            <Header />
            <Home />
            <Footer />{" "}
          </>
        }
      />
      <Route path="/profil" element={<ProfilePage />} />
      <Route path="/swajp" element={<ProtectedRoute element={<Swipe />} />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
