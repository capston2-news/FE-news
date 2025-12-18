import React from "react";
import { Outlet, Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ChatbotWidget from "../chat/ChatbotWidget";

// Header “gọn”: vẫn dùng Header component của bạn
// nhưng truyền sections = [] để nó không render mainNav category.
export default function ProfileLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header
        sections={[]}          // ẩn category nav
        extraSections={[]}     // ẩn dropdown categories
        activeSectionId={null}
        onSectionChange={() => {}}
        showHomeIcon={true}
      />

      <main className="max-w-6xl mx-auto px-4 lg:px-0 py-6 lg:py-6">
        <Outlet />
      </main>

        <Footer />

        <ChatbotWidget />
    </div>
  );
}
