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
      alert("No token found");
      navigate("/auth");
      return;
    }

    const ssoLogin = async () => {
      try {
        /*const res = await fetch(`http://localhost:8012/api/integration/sso?token=${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });*/
        const res = await fetch(
            `/api/integration/api/integration/sso?token=${token}`
        );
        if (!res.ok) throw new Error("SSO login failed");

        const data = await res.json();
        console.log("SSO DATA:", data);
        login(data.access_token, data.user, true);
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