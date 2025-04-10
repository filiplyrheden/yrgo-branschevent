import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import "./Login.css";

export default function Login() {
  return (
    <div>
      <Header />
      <div className="input-container">
        <Input
          id="email"
          label="Mejl"
          placeholder="Mejl..."
          type="email"
          required
        />
        <div className="input-container">
          <Input
            id="password"
            label="Lösenord"
            placeholder="Lösenord..."
            type="password"
            required
          />
        </div>
      </div>
      <Button text="Logga in" />
      <Footer />
    </div>
  );
}
