import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Swipe from "./components/swipe.jsx";
import Header from "./components/Header";
import Footer from "./components/Footer.jsx";
import CompanyProfile from "./components/CompanyProfile.jsx";
import StudentProfile from "./components/StudentProfile.jsx";
import "./components/Global.css";

function App() {
  return (
    <>
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
        <Route path="/about" element={<About />} />
        <Route path="/swajp" element={<Swipe />} />
        <Route path="/info" element={<Header />} />
        <Route path="/favoriter" element={<Header />} />
        <Route path="/profil" element={<CompanyProfile />} />
        <Route path="/student-profil" element={<StudentProfile />} />
      </Routes>
    </>
  );
}

export default App;