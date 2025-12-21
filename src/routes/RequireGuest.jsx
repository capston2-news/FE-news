import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireGuest({ children }) {
  const { user, booting } = useAuth();
  const location = useLocation();

  if (booting) return null;

  if (user) {
    const from = location.state?.from?.pathname || "/";
    const search = location.state?.from?.search || "";
    return <Navigate to={`${from}${search}`} replace />;
  }

  return children;
}
