import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Swipe from "./components/swipe.jsx";
import Header from "./components/Header";
import Footer from "./components/Footer.jsx";
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
        <Route 
          path="/swajp" 
          element={
            <>
              <Swipe />
            </>
          } 
        />
      </Routes>
    </>
  );
}

export default App;