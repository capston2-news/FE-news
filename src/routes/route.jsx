// src/routes/route.jsx
import React from "react";
import { Navigate } from "react-router-dom";

import Employee from "../components/employee/Employee";
import Dashboard from "../components/pages/Dashboard";
import Reader from "../components/reader/Reader.jsx";
import CategoryCardsAuto from "../components/category/CategoryCardsAuto.jsx";
import CommentModeration from "../components/comments/CommentModeration.jsx";
import AuthorManagement from "../components/author/AuthorManagement.jsx";
import ArticleDash from "../components/article/Article.jsx";
import Login from "../components/auth/login/Login.jsx";

import RequireAuth from "./RequireAuth";
import RequireGuest from "./RequireGuest";

// ✅ Bạn nên có 1 trang 404 đơn giản
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center text-slate-600">
    404 - Not Found
  </div>
);

const protect = (el) => (
  <RequireAuth allowedRoles={["admin", "employee"]}>{el}</RequireAuth>
);

export const routes = [
  // Public
  { path: "/login", element: <RequireGuest><Login /></RequireGuest> },

  // Protected
  { path: "/", element: protect(<Dashboard />) },
  { path: "/article", element: protect(<ArticleDash />) },
  { path: "/comments", element: protect(<CommentModeration />) },
  { path: "/category", element: protect(<CategoryCardsAuto />) },
  { path: "/author", element: protect(<AuthorManagement />) },
  { path: "/employee", element: protect(<Employee />) },
  { path: "/reader", element: protect(<Reader />) },

  // ✅ fallback nên là 404, không ép về /login (để RequireAuth lo)
  { path: "*", element: <NotFound /> },
];

export const navigationConfig = routes
  .filter((r) => r.path !== "*" && r.path !== "/login")
  .filter((r) => !r.path.includes(":"))
  .map((route) => ({
    path: route.path,
    label:
      route.path === "/"
        ? "Dashboard"
        : route.path.slice(1).charAt(0).toUpperCase() + route.path.slice(2),
  }));
