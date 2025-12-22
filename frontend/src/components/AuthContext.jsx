import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // восстановление из localStorage
  useEffect(() => {
    const saved = localStorage.getItem("access_token");
    if (saved) {
      setToken(saved);
      setUser(decodeUser(saved));
    }
  }, []);

  const login = (accessToken) => {
    localStorage.setItem("access_token", accessToken);
    setToken(accessToken);
    setUser(decodeUser(accessToken));
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// ⚠️ простой JWT decode (без проверки подписи)
function decodeUser(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      username: payload.username || payload.sub || payload.email,
    };
  } catch {
    return null;
  }
}
