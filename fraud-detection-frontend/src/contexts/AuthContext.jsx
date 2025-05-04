// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext({
  token: null,
  role:  null,
  login: () => {},
  logout: () => {},
});

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("jwt"));
  const [role,  setRole ]  = useState(() => localStorage.getItem("role"));

  useEffect(() => {
    if (token && role) {
      localStorage.setItem("jwt", token);
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("jwt");
      localStorage.removeItem("role");
    }
  }, [token, role]);

  // take both token AND role
  const login = (newToken, newRole) => {
    setToken(newToken);
    setRole(newRole);
  };
  const logout = () => {
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
