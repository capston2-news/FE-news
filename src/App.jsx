// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/pages/Sidebar";
import { routes } from "./routes/route";
import { useAuth } from "../context/AuthContext";
import "./App.css";

function AppShell() {
  const { user, booting } = useAuth(); // ✅ cần booting

  // ✅ Khi refresh: đợi auth load xong rồi mới render routes (tránh bị redirect sớm)
  if (booting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ✅ chỉ hiện sidebar khi đã login */}
      {user ? <Sidebar /> : null}

      <div className="flex-1 min-w-0 relative overflow-x-hidden">
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
