// src/components/layout/Header.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logout as apiLogout } from "../../services/Auth";
import NotificationBell from "./NotificationBell";
import WeatherMini from "./WeatherMini";
import logo from "../../assets/newmateai.png";

const LS_LAST_SECTION = "last_active_section_slug";

const Header = ({ sections = [], extraSections = [], activeSectionId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: clearAuth } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Search UI
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const searchWrapRef = useRef(null);
  const searchInputRef = useRef(null);

  const displayName = useMemo(() => {
    return user?.full_name || user?.name || user?.username || "Tài khoản";
  }, [user]);

  const handleText = useMemo(() => {
    if (user?.username) return `@${user.username}`;
    return user?.email || "";
  }, [user]);

  const avatarText = useMemo(() => {
    const s = (displayName || "").trim();
    return s ? s[0].toUpperCase() : "U";
  }, [displayName]);

  const closeAllMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  };

  // ✅ cho NotificationBell dùng để đóng các dropdown khác
  const closeOthersForBell = () => {
    setMenuOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  };

  const goHome = () => {
    sessionStorage.removeItem(LS_LAST_SECTION);
    navigate("/");
    closeAllMenus();
  };

  const goLogin = () => {
    navigate("/login");
    closeAllMenus();
  };

  const goSection = (slug) => {
    if (slug) sessionStorage.setItem(LS_LAST_SECTION, slug);
    navigate(`/category/${slug}`, { state: { activeSectionId: slug } });
    closeAllMenus();
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    } finally {
      clearAuth?.();
      closeAllMenus();
      navigate("/");
    }
  };

  const submitSearch = () => {
    const q = (searchText || "").trim();
    if (!q) return;

    navigate(`/article/search?key=${encodeURIComponent(q)}`);

    setSearchOpen(false);
    setMenuOpen(false);
    setProfileOpen(false);
    setSearchText("");
  };

  useEffect(() => {
    if (searchOpen) requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [searchOpen]);

  useEffect(() => {
    const onDown = (e) => {
      if (!searchOpen) return;
      const wrap = searchWrapRef.current;
      if (wrap && !wrap.contains(e.target)) setSearchOpen(false);
    };

    const onKey = (e) => {
      if (!searchOpen) return;
      if (e.key === "Escape") setSearchOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  // ✅ tính isHome theo URL
  const isHomeComputed = location.pathname === "/";
  // ✅ FIX: tắt highlight section ở /article...
  const isArticleRoute = location.pathname.startsWith("/article");

  // ✅ active section: vẫn lưu section last seen để dùng nơi khác (không ảnh hưởng highlight trên /article)
  const activeSectionIdComputed = useMemo(() => {
    const path = location.pathname;

    // /category/:slug
    if (path.startsWith("/category/")) {
      const slug = decodeURIComponent(path.split("/")[2] || "");
      if (slug) {
        sessionStorage.setItem(LS_LAST_SECTION, slug);
        return slug;
      }
    }

    const stored = sessionStorage.getItem(LS_LAST_SECTION);

    // /article/... => state -> prop -> stored -> section đầu
    if (path.startsWith("/article")) {
      const fromState =
        location.state?.categorySlug || location.state?.activeSectionId || null;

      return (
        fromState ||
        activeSectionId ||
        stored ||
        sections?.[0]?.id ||
        extraSections?.[0]?.id ||
        null
      );
    }

    // route khác
    return (
      activeSectionId ||
      stored ||
      sections?.[0]?.id ||
      extraSections?.[0]?.id ||
      null
    );
  }, [location.pathname, location.state, activeSectionId, sections, extraSections]);

  const dropdownClass = `
    absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200
    rounded-2xl shadow-lg py-2 z-40
    transform origin-top-right transition-all duration-150
    ${
      menuOpen
        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
        : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
    }
  `;

  const mobileDropdownClass = `
    absolute right-2 top-full mt-1 w-60 bg-white border border-slate-200
    rounded-2xl shadow-lg py-2 z-40
    transform origin-top-right transition-all duration-150
    ${
      menuOpen
        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
        : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
    }
  `;

  const profileDropdownClass = `
    absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl
    border border-slate-200 z-50
    transform origin-top-right transition-all duration-150
    ${
      profileOpen
        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
        : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
    }
  `;

  const searchDropdownClass = `
    absolute right-0 top-full mt-2
    w-[min(520px,calc(100vw-2rem))]
    bg-white border border-slate-200 rounded-2xl shadow-xl z-50
    transform origin-top-right transition-all duration-150
    ${
      searchOpen
        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
        : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
    }
  `;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.12)]">
      <div className="max-w-6xl mx-auto px-4">
        {/* HÀNG TRÊN */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo + tên */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={goHome}
              className="flex items-center gap-2 hover:opacity-90 transition cursor-pointer"
              type="button"
            >
<div className="h-9 flex items-center">
  <img
    src={logo}
    alt="NEWMATEAI"
    className="h-9 w-auto object-contain"
  />
</div>
              {/* <span className="text-xl font-semibold tracking-tight text-slate-800">
                NewsMateAI
              </span> */}
            </button>

            <WeatherMini />
          </div>

          {/* Icons + avatar/login */}
          <div className="flex items-center gap-3">
            {/* SEARCH */}
            <div className="relative" ref={searchWrapRef}>
              <button
                className={`p-1 hover:text-slate-700 cursor-pointer transition ${
                  searchOpen ? "text-slate-800" : "text-slate-500"
                }`}
                type="button"
                onClick={() => {
                  setSearchOpen((v) => !v);
                  setMenuOpen(false);
                  setProfileOpen(false);
                }}
                aria-label="Search"
                title="Tìm kiếm"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="16.5" y1="16.5" x2="20" y2="20" />
                </svg>
              </button>

              <div className={searchDropdownClass}>
                <div className="p-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitSearch();
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="7" />
                          <line x1="16.5" y1="16.5" x2="20" y2="20" />
                        </svg>
                      </span>

                      <input
                        ref={searchInputRef}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Tìm kiếm bài viết..."
                        className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />

                      {searchText && (
                        <button
                          type="button"
                          onClick={() => setSearchText("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                          aria-label="Clear"
                          title="Xoá"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="px-3 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 cursor-pointer"
                    >
                      Tìm
                    </button>
                  </form>

                  <div className="mt-2 text-[11px] text-slate-500">
                    Nhấn <span className="font-semibold">Enter</span> để tìm •{" "}
                    <span className="font-semibold">Esc</span> để đóng
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ NOTIFICATION (mount chuẩn) */}
            <NotificationBell user={user} closeOthers={closeOthersForBell} />

            {/* DESKTOP user/login */}
            <div className="hidden sm:flex items-center relative">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setProfileOpen((v) => !v);
                      setMenuOpen(false);
                      setSearchOpen(false);
                    }}
                    className="flex items-center gap-1 hover:opacity-90 transition cursor-pointer"
                    type="button"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center text-xs font-semibold text-white">
                      {avatarText}
                    </div>
                    <svg
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  <div className={profileDropdownClass}>
                    <div className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center text-sm font-semibold text-white">
                        {avatarText}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-900 truncate">
                          {displayName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {handleText}
                        </div>

                        <button
                          className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            navigate(`/profile/${user.username}/general`);
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 21a8 8 0 0 0-16 0" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span>Xem trang cá nhân</span>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* ✅ thêm 2 mục vào dropdown */}
                    <div className="py-2 text-sm text-slate-700">
                      <button
                        className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-100 cursor-pointer"
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate(`/profile/${user.username}/saved`);
                        }}
                      >
                        <svg
                          className="w-4 h-4 text-slate-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>Tin đã lưu</span>
                      </button>

                      <button
                        className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-100 cursor-pointer"
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate(`/profile/${user.username}/seen`);
                        }}
                      >
                        <svg
                          className="w-4 h-4 text-slate-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>Tin đã xem</span>
                      </button>
                    </div>

                    <div className="rounded-b-2xl overflow-hidden">
                      <button
                        className="w-full px-4 py-2 flex items-center gap-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer rounded-none transition"
                        type="button"
                        onClick={handleLogout}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 17l5-5-5-5" />
                          <path d="M15 12H3" />
                          <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
                          <path d="M13 21h6a2 2 0 0 0 2-2" />
                        </svg>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={goLogin}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 cursor-pointer"
                  type="button"
                >
                  Đăng nhập
                </button>
              )}
            </div>

            {/* MOBILE user/login */}
            <div className="flex sm:hidden items-center relative">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setProfileOpen((v) => !v);
                      setMenuOpen(false);
                      setSearchOpen(false);
                    }}
                    className="flex items-center hover:opacity-90 transition cursor-pointer"
                    type="button"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center text-[11px] font-semibold text-white">
                      {avatarText}
                    </div>
                  </button>

                  <div className={profileDropdownClass}>
                    <div className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center text-sm font-semibold text-white">
                        {avatarText}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-900 truncate">
                          {displayName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {handleText}
                        </div>

                        <button
                          className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            navigate(`/profile/${user.username}/general`);
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 21a8 8 0 0 0-16 0" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span>Xem trang cá nhân</span>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* ✅ thêm 2 mục vào dropdown mobile */}
                    <div className="py-2 text-sm text-slate-700">
                      <button
                        className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-100 cursor-pointer"
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate(`/profile/${user.username}/saved`);
                        }}
                      >
                        <svg
                          className="w-4 h-4 text-slate-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>Tin đã lưu</span>
                      </button>

                      <button
                        className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-100 cursor-pointer"
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate(`/profile/${user.username}/seen`);
                        }}
                      >
                        <svg
                          className="w-4 h-4 text-slate-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>Tin đã xem</span>
                      </button>
                    </div>

                    <button
                      className="w-full px-4 py-2 flex items-center gap-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                      type="button"
                      onClick={handleLogout}
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10 17l5-5-5-5" />
                        <path d="M15 12H3" />
                        <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
                        <path d="M13 21h6a2 2 0 0 0 2-2" />
                      </svg>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={goLogin}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 cursor-pointer"
                  type="button"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>

        {/* HÀNG DƯỚI: desktop */}
        <div className="hidden md:flex items-center justify-between h-11 text-[14px] font-semibold tracking-wide text-slate-800 uppercase relative">
          <div className="flex items-center gap-6">
            <button
              onClick={goHome}
              className={`flex items-center gap-1.5 whitespace-nowrap hover:text-sky-600 cursor-pointer ${
                isHomeComputed ? "text-sky-600" : ""
              }`}
              type="button"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 11l9-8 9 8" />
                <path d="M5 10v10h5v-6h4v6h5V10" />
              </svg>
              <span>Trang chủ</span>
            </button>

            <div className="flex items-center gap-8">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  className={`whitespace-nowrap hover:text-sky-600 cursor-pointer ${
                    !isHomeComputed &&
                    !isArticleRoute &&
                    sec.id === activeSectionIdComputed
                      ? "text-sky-600"
                      : ""
                  }`}
                  onClick={() => goSection(sec.id)}
                  type="button"
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <button
              className="inline-flex p-1.5 text-slate-600 hover:text-sky-600 cursor-pointer"
              onClick={() => {
                setMenuOpen((v) => !v);
                setProfileOpen(false);
                setSearchOpen(false);
              }}
              type="button"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className={dropdownClass}>
              <div className="px-4 pb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Chủ đề khác
                </span>
                <button
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  onClick={() => setMenuOpen(false)}
                  type="button"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto no-scrollbar">
                {extraSections.map((topic) => (
                  <button
                    key={topic.id}
                    className="w-full text-left px-4 py-2 text-sm text-slate-800 hover:bg-slate-100 cursor-pointer"
                    onClick={() => goSection(topic.id)}
                    type="button"
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* HÀNG DƯỚI: mobile */}
        <div className="md:hidden border-t border-slate-100 relative">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 text-[11px] font-semibold tracking-wide text-slate-800 uppercase">
              <button
                onClick={goHome}
                className={`flex-shrink-0 flex items-center gap-1 hover:text-sky-600 cursor-pointer ${
                  isHomeComputed ? "text-sky-600" : ""
                }`}
                type="button"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 11l9-8 9 8" />
                  <path d="M5 10v10h5v-6h4v6h5V10" />
                </svg>
                <span>Trang chủ</span>
              </button>

              {sections.map((sec) => (
                <button
                  key={sec.id}
                  className={`flex-shrink-0 px-1 hover:text-sky-600 cursor-pointer ${
                    !isHomeComputed &&
                    !isArticleRoute &&
                    sec.id === activeSectionIdComputed
                      ? "text-sky-600"
                      : ""
                  }`}
                  onClick={() => goSection(sec.id)}
                  type="button"
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <div className="relative flex-shrink-0 pr-1">
              <button
                className="p-1.5 text-slate-600 hover:text-sky-600 cursor-pointer"
                onClick={() => {
                  setMenuOpen((v) => !v);
                  setProfileOpen(false);
                  setSearchOpen(false);
                }}
                type="button"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              <div className={mobileDropdownClass}>
                <div className="px-4 pb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Chủ đề khác
                  </span>
                  <button
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    onClick={() => setMenuOpen(false)}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto no-scrollbar">
                  {extraSections.map((topic) => (
                    <button
                      key={topic.id}
                      className="w-full text-left px-4 py-2 text-sm text-slate-800 hover:bg-slate-100 cursor-pointer"
                      onClick={() => goSection(topic.id)}
                      type="button"
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
