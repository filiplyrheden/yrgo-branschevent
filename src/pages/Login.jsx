import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import "./Login.css";

export default function Login() {
  return (
    <div>
      <Header />
      <div className="login-container">
        <Input
          id="email"
          label="Mejl"
          placeholder="Mejl..."
          type="email"
          required
        />

        <Input
          id="password"
          label="Lösenord"
          placeholder="Lösenord..."
          type="password"
          required
        />

        <Button text="Logga in" />
      </div>
      <Footer />
    </div>
  );
}
