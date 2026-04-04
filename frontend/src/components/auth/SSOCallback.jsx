import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function SSOCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      alert("No SSO token found");
      navigate("/auth");
      return;
    }

    const ssoLogin = async () => {
      try {
        const res = await fetch("http://localhost:8002/auth/sso-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) throw new Error("SSO login failed");

        const data = await res.json();
        login(data.access_token, data.user);
        navigate("/"); // редирект после успешного SSO
      } catch (err) {
        alert(err.message);
        navigate("/auth");
      }
    };

    ssoLogin();
  }, [searchParams, login, navigate]);

  return <div>Logging in via SSO...</div>;
}