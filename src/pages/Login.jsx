import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      alert("Login successful!");
      navigate("/profil");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <Header />
      <div className="login-container">
        <div className="input-container">
          <Input
            id="email"
            label="Mejl"
            placeholder="Mejl..."
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            id="password"
            label="Lösenord"
            placeholder="Lösenord..."
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <Button text="Logga in" onClick={handleLogin} />
      </div>
      <Footer />
    </div>
  );
}
