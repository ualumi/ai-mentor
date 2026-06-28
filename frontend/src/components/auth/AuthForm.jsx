import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./auth.css";
import "../../App.css"
import { generateTestSSOToken } from "../../utils/sso";

<<<<<<< HEAD
//const API_BASE = "http://localhost:8002";
const API_BASE = "/api/users";
=======
const API_BASE = "/api/users";

>>>>>>> frontend-dev
// AuthForm.jsx
export default function AuthForm({ isOpen, onClose }) {
  const handleSSOTestRedirect = async () => {
    const token = await generateTestSSOToken(); // ✅ ждем токен
    // редирект на callback с токеном
    console.log(token);
    window.location.href = `/sso-callback?token=${token}`;
  };


  const handleSSOAuth = async () => {
    try {
      setLoading(true);

      // 🔹 если регистрация — сначала регистрируем
      if (mode === "register") {
        const registerResponse = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            username: email.split("@")[0],
          }),
        });

        if (!registerResponse.ok) {
          throw new Error("registration failed");
        }

        // 🔥 ВОТ ЭТО ГЛАВНОЕ
        localStorage.setItem("has_seen_intro", "false");
      }

      // 🔹 потом всегда логинимся
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        throw new Error("login failed");
      }
      //localStorage.setItem("has_seen_intro", "true");
      const data = await loginResponse.json();

      // 🔥 ключевой момент
      login(
        data.access_token,
        {
          username: email.split("@")[0],
          email,
        },
        true // ← SSO флаг
      );

      onClose();
      navigate("/");

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const ssoButtonText =
  mode === "login"
    ? 'Войти как пользователь "Экзаметрия"'
    : 'Зарегистрироваться как пользователь "Экзаметрия"';

  if (!isOpen) return null; // 🔥 ключевая строка

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "register" && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      if (mode === "register") {
        const registerResponse = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            username: email.split("@")[0],
          }),
        });

        if (!registerResponse.ok) {
          throw new Error("Registration failed");
        }

        // 🔥 ВОТ ЭТО ГЛАВНОЕ
        localStorage.setItem("has_seen_intro", "false");
      }

      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        throw new Error("Login failed");
      }
      // 🔥 ВОТ ЭТО ГЛАВНОЕ
      //localStorage.setItem("has_seen_intro", "true");

      const data = await loginResponse.json();

      login(data.access_token, {
        username: email.split("@")[0],
        email,
      });

      onClose(); // 🔥 закрываем модалку
      navigate("/");

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>

        {/* ❌ кнопка закрытия */}
        <button className="auth-close" onClick={onClose}>✕</button>

        <div className="buttons" style={{ marginBottom: 16 }}>
          <button className={`auth-button ${mode === "login" ? "active" : ""}`}
           onClick={() => setMode("login")} disabled={mode === "login"}>
            Вход
          </button>
          <button className={`auth-button ${mode === "register" ? "active" : ""}`} 
            onClick={() => setMode("register")} 
            disabled={mode === "register"}>
            Регистрация
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

          <button className="def-button" type="submit" disabled={loading} onClick={handleSSOAuth}>
            {loading ? "Please wait..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
          <p className="auth-text-regular">или</p>
          <button
            className="module-button"
            onClick={handleSSOAuth}
            disabled={loading}
            style={{ marginTop: 16 }}
          >
            {ssoButtonText}
          </button>
          {/*<button
            className="module-button"
            onClick={handleSSOTestRedirect}
            //onClick={() => {
              // редирект на внешний SSO сервер
              //window.location.href = "https://sso.example.com/login?redirect_uri=http://localhost:3000/sso-callback";
              
              // 🔹 Заглушка SSO
            //  const token = generateTestSSOToken();

              // делаем редирект на callback с тестовым токеном
            //  window.location.href = `/sso-callback?token=${token}`;
            //}}
            disabled={loading}
            style={{ marginTop: 16 }}
          >
            Войти при помощи "Экзаметрия"
          </button>*/}
        </form>
      </div>
    </div>
  );
}