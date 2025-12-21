// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const ALLOWED_ROLES = ["admin", "employee"];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (data) => {
    // data từ BE: { username, role, ... }
    const role = data?.role;

    // ✅ Chặn role không hợp lệ
    if (!ALLOWED_ROLES.includes(role)) {
      setUser(null);
      localStorage.removeItem("auth_user");
      throw new Error("Bạn không có quyền đăng nhập (chỉ admin/employee).");
    }

    const u = {
      username: data.username,
      role,
    };

    setUser(u);
    localStorage.setItem("auth_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  useEffect(() => {
    const saved = localStorage.getItem("auth_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        // ✅ Nếu localStorage bị “bẩn” (role sai) cũng đá ra
        if (!ALLOWED_ROLES.includes(u?.role)) {
          localStorage.removeItem("auth_user");
          setUser(null);
        } else {
          setUser(u);
        }
      } catch {
        setUser(null);
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
