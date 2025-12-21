// src/layouts/MainLayout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../layout/Header";
import CategoryHero from "../home/CategoryHero";
import Footer from "../layout/Footer";
import ChatbotWidget from "../chat/ChatbotWidget";
import { getAllCategories } from "../../services/category/Category";

const HOME_HERO = {
  title: "World News",
  image:
    "https://static.vecteezy.com/system/resources/thumbnails/004/216/831/original/3d-world-news-background-loop-free-video.jpg",
};

const DEFAULT_CATEGORY_HERO =
  "https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg";

const MAIN_LIMIT = 6;
const LS_LAST_SECTION = "last_active_section_slug";

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
  const allSections = useMemo(() => {
    return (categories || [])
      .filter((c) => c?.slug && c?.name)
      .map((c) => ({
        id: c.slug,
        label: String(c.name).toUpperCase(),
        heroImage: c.heroImage || DEFAULT_CATEGORY_HERO,
        raw: c,
      }));
  }, [categories]);

  const sections = useMemo(() => allSections.slice(0, MAIN_LIMIT), [allSections]);
  const extraSections = useMemo(() => allSections.slice(MAIN_LIMIT), [allSections]);

  // ---- ACTIVE SECTION BY URL (FIX) ----
  useEffect(() => {
    const path = location.pathname;

    if (!allSections.length) return;

    const exists = (slug) => !!allSections.find((x) => x.id === slug);

    // 1) /category/:slug => set + store
    if (path.startsWith("/category/")) {
      const slug = decodeURIComponent(path.split("/")[2] || "");
      const next = exists(slug) ? slug : allSections[0]?.id || null;
      if (next) {
        setActiveSectionId(next);
        sessionStorage.setItem(LS_LAST_SECTION, next);
      }
      return;
    }

    // 2) /article/... => keep current, or use state/stored/fallback
    if (path.startsWith("/article")) {
      const fromState =
        location.state?.categorySlug || location.state?.activeSectionId || null;
      const stored = sessionStorage.getItem(LS_LAST_SECTION);

      let next =
        (fromState && exists(fromState) ? fromState : null) ||
        (activeSectionId && exists(activeSectionId) ? activeSectionId : null) ||
        (stored && exists(stored) ? stored : null) ||
        allSections[0]?.id ||
        null;

      if (next && next !== activeSectionId) {
        setActiveSectionId(next);
        sessionStorage.setItem(LS_LAST_SECTION, next);
      }
      return;
    }

    // 3) route khác => ưu tiên stored, không thì fallback section đầu
    const stored = sessionStorage.getItem(LS_LAST_SECTION);
    const next =
      (activeSectionId && exists(activeSectionId) ? activeSectionId : null) ||
      (stored && exists(stored) ? stored : null) ||
      allSections[0]?.id ||
      null;

    if (next && next !== activeSectionId) {
      setActiveSectionId(next);
    }
  }, [location.pathname, location.state, allSections, activeSectionId]);

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
