
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [hasSeenIntro, setHasSeenIntro] = useState(() =>
    localStorage.getItem("has_seen_intro") === "true"
  );

  const completeIntro = () => {
    localStorage.setItem("has_seen_intro", "true");
    setHasSeenIntro(true);
  };

  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [isSSO, setIsSSO] = useState(() =>
    localStorage.getItem("isSSO") === "true"
  );

  const login = (newToken, userData, isSSOLogin = false) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isSSO", isSSOLogin);

    setToken(newToken);
    setUser(userData);
    setIsSSO(isSSOLogin);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isSSO");
    localStorage.removeItem("recommended_modules");
    localStorage.removeItem("has_seen_intro");
    localStorage.clear();
    setToken(null);
    setUser(null);
    setIsSSO(false);
  };

  return (
    <AuthContext.Provider value={{ token, user, isSSO, login, logout, hasSeenIntro, completeIntro }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);