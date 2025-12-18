// src/layouts/MainLayout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../layout/Header";
import CategoryHero from "../home/CategoryHero";
import Footer from "../layout/Footer";
import ChatbotWidget from "../chat/ChatbotWidget";
import { getAllCategories } from "../../services/category/Category";

const HOME_HERO = {
  title: "World News • Tin tức toàn cầu",
  image:
    "https://static.vecteezy.com/system/resources/thumbnails/004/216/831/original/3d-world-news-background-loop-free-video.jpg",
};

// API categories của bạn chưa có ảnh -> dùng ảnh mặc định
const DEFAULT_CATEGORY_HERO =
  "https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg";

const MAIN_LIMIT = 6;

const MainLayout = () => {
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);

  const isHome = location.pathname === "/";
  const isArticlePage = location.pathname.startsWith("/article");

  // ---- FETCH CATEGORIES ----
  useEffect(() => {
    const run = async () => {
      try {
        const res = await getAllCategories();
        // tuỳ API: có thể trả array hoặc {data: array}
        const list = Array.isArray(res) ? res : res?.data || [];
        setCategories(list);
      } catch (err) {
        console.error("getAllCategories error:", err);
        setCategories([]);
      }
    };
    run();
  }, []);

  // ---- MAP CATEGORIES -> HEADER SECTIONS ----
  // Header đang dùng {id, label} và đi route /category/:id
  // => ta dùng slug làm id
  const allSections = useMemo(() => {
    return (categories || [])
      .filter((c) => c?.slug && c?.name)
      .map((c) => ({
        id: c.slug, // IMPORTANT: route /category/:slug
        label: String(c.name).toUpperCase(),
        heroImage: c.heroImage || DEFAULT_CATEGORY_HERO, // nếu có field ảnh thì dùng
        raw: c, // giữ bản gốc (_id, name, slug...)
      }));
  }, [categories]);

  const sections = useMemo(() => allSections.slice(0, MAIN_LIMIT), [allSections]);
  const extraSections = useMemo(() => allSections.slice(MAIN_LIMIT), [allSections]);

  // ---- ACTIVE SECTION BY URL ----
  useEffect(() => {
    const path = location.pathname;

    // /category/:slug
    if (path.startsWith("/category/")) {
      const slug = path.split("/")[2];
      if (slug) {
        setActiveSectionId(slug);
        return;
      }
    }

    // route khác (bao gồm /) -> chọn mặc định category đầu
    const fallback = sections[0]?.id || allSections[0]?.id || null;
    setActiveSectionId(fallback);
  }, [location.pathname, sections, allSections]);

  const activeSection =
    allSections.find((s) => s.id === activeSectionId) || allSections[0] || null;

  // ---- HERO ----
  const heroTitle = isHome ? HOME_HERO.title : activeSection?.label || "CHUYÊN MỤC";
  const heroImage = isHome ? HOME_HERO.image : activeSection?.heroImage || DEFAULT_CATEGORY_HERO;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header
        sections={sections}
        extraSections={extraSections}
        activeSectionId={activeSectionId}
        isHome={isHome}
      />

      {/* chỉ hiện hero khi không phải trang bài viết */}
      {!isArticlePage && <CategoryHero title={heroTitle} image={heroImage} />}

      <main className="max-w-6xl mx-auto px-4 pt-6 pb-10">
        <Outlet
          context={{
            isHome,
            activeSectionId,
            activeSection,
            categories,
            sections,
            extraSections,
          }}
        />
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default MainLayout;
