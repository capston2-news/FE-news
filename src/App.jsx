// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Register from './components/auth/register/Register'
import ProfileLayout from "./components/layout/ProfileLayout";

import HomePage from "./components/pages/HomePage";
import CategoryPage from "./components/pages/CategoryPage";
import ArticlePage from "./components/pages/ArticlePage";
import ProfilePage from "./components/pages/ProfilePage";
import ScrollToTop from './components/utils/ScrollToTop'
import Login from "./components/auth/login/Login";

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        {/* Bọc các trang bằng MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/category/:slug/:childSlug" element={<CategoryPage />} />
          <Route path="article/:articleId" element={<ArticlePage />} />

                  {/* 404 đơn giản */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center text-slate-600">
                Không tìm thấy trang
              </div>
            }
          />
        </Route>

              {/* Layout profile: không hero, không category nav */}
      <Route element={<ProfileLayout />}>
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Route>
      
      </Routes>

    </BrowserRouter>
  );
};

export default App;
