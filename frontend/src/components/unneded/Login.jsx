import { useState } from "react";

const USER_SERVICE = "http://localhost:8002";

export default function Login({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);

    try {
      const url =
        mode === "login"
          ? `${USER_SERVICE}/auth/login`
          : `${USER_SERVICE}/auth/register`;

      const body =
        mode === "login"
          ? { email, password }
          : { email, password, username };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Auth failed");
      }

      // После регистрации сразу логинимся
      if (mode === "register") {
        setMode("login");
        setError("Регистрация успешна. Теперь войдите.");
        return;
      }

      const data = await res.json();
      onAuth(data.access_token);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>{mode === "login" ? "Login" : "Register"}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      {mode === "register" && (
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      )}

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={submit} disabled={loading}>
        {loading ? "..." : mode === "login" ? "Login" : "Register"}
      </button>

      <hr />

      <button
        onClick={() =>
          setMode(mode === "login" ? "register" : "login")
        }
      >
        {mode === "login"
          ? "Create account"
          : "Already have an account"}
      </button>
    </div>
  );
}
