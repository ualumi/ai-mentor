// src/components/auth/auth.jsx

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./auth.css";
import "../../App.css"

const API_BASE = "http://localhost:8002";


export default function AuthForm() {
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("register");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "register" && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // -----------------------
      // 🔹 REGISTRATION
      // -----------------------
      if (mode === "register") {
        const registerResponse = await fetch(
          `${API_BASE}/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
              username: email.split("@")[0], // как в тесте
            }),
          }
        );

        if (!registerResponse.ok) {
          throw new Error("Registration failed");
        }

        // регистрация успешна → делаем логин
      }

      // -----------------------
      // 🔹 LOGIN (отдельный запрос!)
      // -----------------------
      const loginResponse = await fetch(
        `${API_BASE}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!loginResponse.ok) {
        throw new Error("Login failed");
      }

      const data = await loginResponse.json();

      login(data.access_token, {
        username: email.split("@")[0],
        email: email,
      });

      navigate("/");

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="free-mode">
      <div className="auth">
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setMode("login")}
            disabled={mode === "login"}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => setMode("register")}
            disabled={mode === "register"}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="item menu-item menu-item-input"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="item menu-item menu-item-input"
          />

          {mode === "register" && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              className="item menu-item menu-item-input"
            />
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Зарегистрироваться"}
          </button>
        </form>
      </div>
      
    </div>
  );
}