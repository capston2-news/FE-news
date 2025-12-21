import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireAuth({ children, allowedRoles = [] }) {
  const { user, booting } = useAuth();
  const location = useLocation();

  if (booting) return null; // hoặc spinner

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // kiểm tra role (tùy bạn lưu role ở đâu)
  const role = user?.role || user?.user_role || user?.type;
  if (allowedRoles.length && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
