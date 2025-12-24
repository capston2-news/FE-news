import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../services/Auth";
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  X
} from "lucide-react";
import "./Header.css";


const Header = () => {
  const { user } = useAuth();
  const { logout: clearAuth } = useAuth();
  const navigate = useNavigate();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
    clearAuth();
    setOpenUserMenu(false);
    navigate("/"); // quay về trang chủ sau khi đăng xuất
  };

  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  const categories = [
    "Thời sự",
    "Thế giới",
    "Kinh doanh",
    "Khoa học công nghệ",
    "Góc nhìn",
    "Bất động sản",
    "Sức khỏe",
    "Thể thao",
    "Giải trí",
    "Pháp luật",
    "Giáo dục",
    "Đời sống",
    "Xe",
    "Du lịch"
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-white z-50 shadow-sm">
      {/* ----- TOP BAR ----- */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 h-14">
          {/* LEFT: LOGO + tagline */}

          {/* CENTER: location + weather + date */}
          <div className="hidden md:flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1 hover:text-gray-800 cursor-pointer">
              <span>TP HCM</span>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 17.5a4.5 4.5 0 0 0-1-8.9 6 6 0 0 0-11.7 1.6A4 4 0 0 0 6 17.5" />
              </svg>
              <span>24°</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-xs">Thứ hai, 2/12/2025</span>
          </div>

          {/* RIGHT: icons */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1.5 hover:bg-gray-100 rounded transition"
              >
                <Search size={18} className="text-gray-600" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded shadow-lg p-2 z-40">
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm tin tức..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              )}
            </div>

            {/* International */}
            <a href="#" className="hidden md:flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              <span className="inline-flex items-center justify-center h-4 w-4 rounded text-white text-[9px] font-bold bg-red-600">E</span>
              <span>EN</span>
            </a>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setOpenUserMenu(!openUserMenu)}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 text-sm font-medium"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 20a7 7 0 0 1 14 0" />
                  </svg>
                  <span className="hidden sm:inline">{user.username}</span>
                </button>
                {openUserMenu && (
                  <div className="absolute right-0 w-44 bg-white border border-gray-200 rounded shadow-lg py-1 text-sm z-40">
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-50">Thông tin tài khoản</button>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-50">Bài viết đã lưu</button>
                    <div className="h-px bg-gray-100 my-1" />
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to="/login" className="text-sm text-red-600 font-medium hover:text-red-700">
                Đăng nhập
              </NavLink>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 hover:bg-gray-100 rounded"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ----- MAIN NAV BAR ----- */}
      <nav className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-3 h-12 flex items-center overflow-hidden">
          {/* Home Icon */}
          <NavLink to="/" className="flex items-center justify-center w-10 h-10 rounded hover:bg-gray-100 mr-2">
            <Home size={18} className="text-gray-700" />
          </NavLink>

          {/* Categories Scroll */}
          <div className="flex-1 flex items-center overflow-x-auto gap-6 scrollbar-hide" ref={scrollRef}>
            {categories.map((cat) => (
              <a
                key={cat}
                href="#"
                className="whitespace-nowrap text-sm text-gray-700 hover:text-red-600 font-medium transition py-3"
              >
                {cat}
              </a>
            ))}
          </div>

          {/* Scroll Buttons */}
          <button onClick={scrollLeft} className="p-1 hover:bg-gray-100 rounded ml-1 flex-shrink-0">
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <button onClick={scrollRight} className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      </nav>

      {/* ----- MOBILE MENU ----- */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-3 py-2">
          {categories.map((cat) => (
            <a
              key={cat}
              href="#"
              className="block py-2 text-sm text-gray-700 hover:text-red-600 font-medium"
            >
              {cat}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
