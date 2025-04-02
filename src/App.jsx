import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer.jsx";
import "./styles/Global.css";

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
      </Routes>
    </>
  );
}

export default App;
