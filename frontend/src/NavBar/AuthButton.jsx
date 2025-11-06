import { useState, useEffect } from "react";
import axios from "axios";

function AuthButton() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // { username: "test_user" }
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [mode, setMode] = useState("login"); // "login" или "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Проверяем localStorage при монтировании
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      // Можно использовать токен для последующих запросов, например:
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    }
  }, []);

  const toggleForm = () => setIsFormVisible(!isFormVisible);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = `http://localhost:8002/auth/${mode}`;
      const payload =
        mode === "login"
          ? { email: formData.email, password: formData.password }
          : formData;

      const response = await axios.post(url, payload);
      console.log(response.data);

      const token = response.data.access_token;
      const username = mode === "login" ? formData.email.split("@")[0] : formData.username;

      // Сохраняем токен и пользователя
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ username }));

      // Настраиваем axios для последующих запросов
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser({ username });
      setIsLoggedIn(true);
      setIsFormVisible(false);
      setFormData({ username: "", email: "", password: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Ошибка при запросе");
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn && user) {
    return (
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "#4caf50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer"
        }}
        title={user.username}
      >
        {user.username[0].toUpperCase()}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button onClick={toggleForm}>
        {isFormVisible ? "Закрыть форму" : "Войти/Зарегистрироваться"}
      </button>

      {isFormVisible && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: 0,
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#fff",
            zIndex: 10
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <button
              onClick={() => setMode("login")}
              disabled={mode === "login"}
            >
              Вход
            </button>
            <button
              onClick={() => setMode("register")}
              disabled={mode === "register"}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div>
                <input
                  type="text"
                  name="username"
                  placeholder="Имя пользователя"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? "Отправка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AuthButton;
