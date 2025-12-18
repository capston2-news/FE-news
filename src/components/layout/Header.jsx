// src/components/layout/Header.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logout as apiLogout } from "../../services/Auth";

const Header = ({ sections = [], extraSections = [], activeSectionId, isHome }) => {
  const navigate = useNavigate();

  const { user, logout: clearAuth } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);       // dropdown 3 gạch
  const [profileOpen, setProfileOpen] = useState(false); // dropdown profile

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
  };

  const goHome = () => {
    navigate("/");
    closeAllMenus();
  };

  const goLogin = () => {
    navigate("/login");
    closeAllMenus();
  };

  const goSection = (slug) => {
    navigate(`/category/${slug}`);
    closeAllMenus();
  };

  const handleLogout = async () => {
    try {
      await apiLogout(); // gọi API logout (nếu có)
    } catch (e) {
      // nếu API lỗi vẫn cho logout ở client để tránh kẹt UI
    } finally {
      clearAuth?.();     // clear auth context
      closeAllMenus();
      navigate("/");
    }
  };

  const handleWritePost = () => {
    // tuỳ bạn route viết bài là gì
    if (!user) return goLogin();
    navigate("/write");
    closeAllMenus();
  };

  const dropdownClass = `
    absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200
    rounded-2xl shadow-lg py-2 z-40
    transform origin-top-right transition-all duration-150
    ${menuOpen ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
               : "opacity-0 -translate-y-2 scale-95 pointer-events-none"}
  `;

  const mobileDropdownClass = `
    absolute right-2 top-full mt-1 w-60 bg-white border border-slate-200
    rounded-2xl shadow-lg py-2 z-40
    transform origin-top-right transition-all duration-150
    ${menuOpen ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
               : "opacity-0 -translate-y-2 scale-95 pointer-events-none"}
  `;

  const profileDropdownClass = `
    absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl
    border border-slate-200 z-50
    transform origin-top-right transition-all duration-150
    ${profileOpen ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 -translate-y-2 scale-95 pointer-events-none"}
  `;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.12)]">
      <div className="max-w-6xl mx-auto px-4">
        {/* HÀNG TRÊN */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo + tên (click về Trang chủ) */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={goHome}
              className="flex items-center gap-2 hover:opacity-90 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
              </div>
              <span className="text-xl font-semibold tracking-tight text-slate-800">
                spiderum
              </span>
            </button>
          </div>

          {/* 3 pill giữa */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
            <button className="px-3 py-1.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100 inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M5 6h2l1 9h12l1-7H8" />
                <path d="M6 6l-1-3H2" />
              </svg>
              <span>Spider&apos;s Shop</span>
            </button>

            <button className="px-3 py-1.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100 inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>Agency</span>
            </button>

            <button className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2h9A2.5 2.5 0 0 1 18 4.5v15l-4.5-2L9 19.5Z" />
              </svg>
              <span>Publishing</span>
            </button>
          </div>

          {/* Icons + Viết bài + avatar / login */}
          <div className="flex items-center gap-3">
            {/* Search / mail / bell - desktop */}
            <div className="hidden md:flex items-center gap-3 text-slate-500">
              <button className="p-1 hover:text-slate-700">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="16.5" y1="16.5" x2="20" y2="20" />
                </svg>
              </button>
              <button className="p-1 hover:text-slate-700">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <polyline points="3 7 12 13 21 7" />
                </svg>
              </button>
              <button className="p-1 hover:text-slate-700">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>
            </div>

            {/* Viết bài desktop (nếu chưa login thì bấm sẽ đưa đi login) */}
            <button
              onClick={handleWritePost}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <span className="flex items-center justify-center w-4 h-4">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </span>
              <span>Viết bài</span>
            </button>

            {/* DESKTOP: nếu có user -> avatar dropdown, không có -> nút Đăng nhập */}
            <div className="hidden sm:flex items-center relative">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setProfileOpen((v) => !v);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-1 hover:opacity-90 transition"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center text-xs font-semibold text-white">
                      {avatarText}
                    </div>
                    <svg
                      className={`w-4 h-4 text-slate-500 transition-transform ${profileOpen ? "rotate-180" : ""}`}
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
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-slate-900">{displayName}</div>
                        <div className="text-[11px] text-slate-500">{handleText}</div>
                        <button
                          className="mt-2 px-3 py-1 rounded-full border border-slate-200 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100"
                          onClick={() => {
                            setProfileOpen(false);
                            navigate("/profile");
                          }}
                        >
                          Xem trang cá nhân
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    <div className="py-2 text-sm text-slate-700">
                      <button className="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                        <span>Bài viết của tôi</span>
                      </button>
                      <button className="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                        <span>Nháp của tôi</span>
                      </button>
                      <button className="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                        <span>Đã lưu</span>
                      </button>
                      <button className="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                        <span>Tùy chỉnh tài khoản</span>
                      </button>
                      <button className="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                        <span>Liên hệ</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 mt-1" />

                    <button
                      className="w-full px-4 py-2 flex items-center gap-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={goLogin}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700"
                >
                  Đăng nhập
                </button>
              )}
            </div>

            {/* MOBILE: nếu có user -> avatar dropdown, không có -> nút Đăng nhập */}
            <div className="flex sm:hidden items-center relative">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setProfileOpen((v) => !v);
                      setMenuOpen(false);
                    }}
                    className="flex items-center hover:opacity-90 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center text-[11px] font-semibold text-white">
                      {avatarText}
                    </div>
                  </button>

                  <div className={profileDropdownClass}>
                    <div className="p-4 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center text-xs font-semibold text-white">
                        {avatarText}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-slate-900">{displayName}</div>
                        <div className="text-[11px] text-slate-500">{handleText}</div>
                        <button
                          className="mt-2 px-3 py-1 rounded-full border border-slate-200 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100"
                          onClick={() => {
                            setProfileOpen(false);
                            navigate("/profile");
                          }}
                        >
                          Xem trang cá nhân
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    <div className="py-2 text-sm text-slate-700">
                      <button className="w-full px-4 py-2 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                        Bài viết của tôi
                      </button>
                      <button className="w-full px-4 py-2 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                        Nháp của tôi
                      </button>
                      <button className="w-full px-4 py-2 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                        Đã lưu
                      </button>
                      <button className="w-full px-4 py-2 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                        Tùy chỉnh tài khoản
                      </button>
                      <button className="w-full px-4 py-2 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                        Liên hệ
                      </button>
                    </div>

                    <div className="border-t border-slate-100 mt-1" />

                    <button className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50" onClick={handleLogout}>
                      Đăng xuất
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={goLogin}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>

        {/* HÀNG DƯỚI: desktop nav + Trang chủ + 3 gạch */}
        <div className="hidden md:flex items-center justify-between h-11 text-[14px] font-semibold tracking-wide text-slate-800 uppercase relative">
          <div className="flex items-center gap-6">
            <button
              onClick={goHome}
              className={`flex items-center gap-1.5 whitespace-nowrap hover:text-sky-600 ${isHome ? "text-sky-600" : ""}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l9-8 9 8" />
                <path d="M5 10v10h5v-6h4v6h5V10" />
              </svg>
              <span>Trang chủ</span>
            </button>

            <div className="flex items-center gap-8">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  className={`whitespace-nowrap hover:text-sky-600 ${!isHome && sec.id === activeSectionId ? "text-sky-600" : ""}`}
                  onClick={() => goSection(sec.id)}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <button
              className="inline-flex p-1.5 text-slate-600 hover:text-sky-600"
              onClick={() => {
                setMenuOpen((v) => !v);
                setProfileOpen(false);
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className={dropdownClass}>
              <div className="px-4 pb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Chủ đề khác</span>
                <button className="text-slate-400 hover:text-slate-600" onClick={() => setMenuOpen(false)}>
                  ✕
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto no-scrollbar">
                {extraSections.map((topic) => (
                  <button
                    key={topic.id}
                    className="w-full text-left px-4 py-2 text-sm text-slate-800 hover:bg-slate-50"
                    onClick={() => goSection(topic.id)}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* HÀNG DƯỚI: mobile nav + Trang chủ + 3 gạch */}
        <div className="md:hidden border-t border-slate-100 relative">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 text-[11px] font-semibold tracking-wide text-slate-800 uppercase">
              <button
                onClick={goHome}
                className={`flex-shrink-0 flex items-center gap-1 hover:text-sky-600 ${isHome ? "text-sky-600" : ""}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11l9-8 9 8" />
                  <path d="M5 10v10h5v-6h4v6h5V10" />
                </svg>
                <span>Trang chủ</span>
              </button>

              {sections.map((sec) => (
                <button
                  key={sec.id}
                  className={`flex-shrink-0 px-1 hover:text-sky-600 ${!isHome && sec.id === activeSectionId ? "text-sky-600" : ""}`}
                  onClick={() => goSection(sec.id)}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <div className="relative flex-shrink-0 pr-1">
              <button
                className="p-1.5 text-slate-600 hover:text-sky-600"
                onClick={() => {
                  setMenuOpen((v) => !v);
                  setProfileOpen(false);
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              <div className={mobileDropdownClass}>
                <div className="px-4 pb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Chủ đề khác</span>
                  <button className="text-slate-400 hover:text-slate-600" onClick={() => setMenuOpen(false)}>
                    ✕
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto no-scrollbar">
                  {extraSections.map((topic) => (
                    <button
                      key={topic.id}
                      className="w-full text-left px-4 py-2 text-sm text-slate-800 hover:bg-slate-50"
                      onClick={() => goSection(topic.id)}
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
