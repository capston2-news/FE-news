// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [a, setA] = useState();
  const [user, setUser] = useState(null); // { username, role }

  const login = (data) => {
    // data từ BE: { username, role, ... }
    const u = { username: data.username};
    setUser(u);
    localStorage.setItem("auth_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    // TODO: nếu muốn, gọi API logout để xoá cookie ở BE
  };

  // Khôi phục user sau khi F5
  useEffect(() => {
    const saved = localStorage.getItem("auth_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
