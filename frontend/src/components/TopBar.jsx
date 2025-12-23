import { useAuth } from "./AuthContext";
import '../App.css'

export default function TopBar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const letter = user.username?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      className="topbar"
    >
      <strong>AI Mentor</strong>
      <h2>DevmindAI</h2>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#3B68FF",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {letter}
        </div>

        <button className="logout" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
