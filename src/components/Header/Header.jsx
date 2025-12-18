import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../services/Auth";
import {
  Home,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import "./Header.css";


const Header = () => {
  const { user } = useAuth();
  const { logout: clearAuth } = useAuth();
  const navigate = useNavigate();
  const [openUserMenu, setOpenUserMenu] = useState(false);

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

  return (
    <header className="fixed top-0 left-0 w-full bg-[#071127] text-[#E6EEF3] z-50 border-b border-[#111827]">
      {/* ----- TOP BAR ----- */}
      <div className="h-14 flex items-center">
        <div className="max-w-[1270px] mx-auto w-full flex items-center justify-between px-2">
          {/* LEFT: LOGO + tagline */}

          {/* CENTER: location + weather + date */}
          <div className="flex items-center gap-3 text-base text-gray-600">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center">
                <img
                  src="https://s1.vnecdn.net/vnexpress/restruct/i/v9715/v2_2019/pc/graphics/logo_tagline.svg"
                  alt="VNEXPRESS"
                  className="h-13"
                />
              </a>
              <span className="text-gray-300">|</span>
            </div>
            <div className="flex items-center gap-1 hover:text-gray-800 cursor-pointer">
              <span>TP HCM</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 9l6 6 6-6"
                />
              </svg>
            </div>

            <span className="text-gray-300">|</span>

            <div className="flex items-center gap-1">
              <svg
                className="h-4 w-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 17.5a4.5 4.5 0 0 0-1-8.9 6 6 0 0 0-11.7 1.6A4 4 0 0 0 6 17.5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 20l.5-1M12 20l.5-1M16 20l.5-1"
                />
              </svg>
              <span>24°</span>
            </div>

            <span className="text-gray-300">|</span>

            <span className="hidden md:inline text-gray-500">
              Thứ hai, 6/10/2025
            </span>
          </div>

          {/* RIGHT: menu + icons */}
          <div className="flex items-center gap-4 text-base text-gray-700">
            <a href="#" className="hover:text-gray-900">
              Mới nhất
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:text-gray-900 ">
              Tin theo khu vực
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:text-gray-900 flex items-center gap-1">
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-[2px] bg-[#b11627] text-white text-[10px] font-bold">
                E
              </span>
              International
            </a>
            <span className="text-gray-300">|</span>

            {/* ICONS */}
            <div className="flex items-center gap-3 text-gray-500">
              {/* Search */}
              <button className="hover:text-gray-800">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 20l-3.5-3.5"
                  />
                </svg>
              </button>

              {/* Login */}
              <a
                href="#"
                className="flex items-center gap-1 hover:text-gray-800"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="8" r="3" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 20a7 7 0 0 1 14 0"
                  />
                </svg>
                {user ? (
                  <div className="relative">
                    {/* Nút hiển thị username */}
                    <button
                      type="button"
                      onClick={() => setOpenUserMenu((prev) => !prev)}
                      className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-full  text-sm font-semibold"
                    >
                      <span>{user.username}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform ${
                          openUserMenu ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 9l6 6 6-6"
                        />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {openUserMenu && (
                      <div className="absolute right-0 w-44 rounded-xl bg-[#0F1724] border border-[#1f2937] shadow-lg py-1 text-sm z-20">
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-[#111827] cursor-pointer text-[#E6EEF3]"
                          onClick={() => {
                            // TODO: chuyển đến trang thông tin tài khoản nếu có
                            // ví dụ: navigate("/profile");
                            setOpenUserMenu(false);
                          }}
                        >
                          Thông tin tài khoản
                        </button>
                        <div className="h-px bg-[#111827] my-1" />
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-red-500 hover:bg-[#3b0f0f] cursor-pointer"
                          onClick={handleLogout}
                        >
   <span className="flex items-center gap-2">
    <span>Đăng xuất</span>
    {/* ICON ĐĂNG XUẤT TỰ VẼ */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Khung cửa */}
      <path d="M5 3h7a2 2 0 0 1 2 2v3" />
      <path d="M5 21h7a2 2 0 0 0 2-2v-3" />
      <path d="M5 3v18" />

      {/* Mũi tên đi ra */}
      <path d="M13 12h6" />
      <path d="M17 8l4 4-4 4" />
    </svg>

    
  </span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink to="/login" className="cursor-pointer">
                    Đăng nhập
                  </NavLink>
                )}
              </a>

              {/* Bell */}
              <button className="hover:text-gray-800">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M15 17H9a3 3 0 01-3-3V10a6 6 0 1112 0v4a3 3 0 01-3 3z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 17a2 2 0 004 0"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ----- MAIN NAV (THANH DƯỚI) ----- */}
    <div className="h-16 flex items-center border-t border-[#0f1724] bg-[#071127]">
      <div className="max-w-[1800px] mx-auto w-full flex items-center justify-between px-4">

        {/* Nút trái */}
        <button
          onClick={scrollLeft}
          className="p-2 rounded-full hover:bg-[#0F1724] text-[#9AA9B8] cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Thanh menu scrollable */}
        <nav
          ref={scrollRef}
          className="flex items-center gap-5 overflow-x-auto scrollbar-hide text-[16px] text-[#9AA9B8] px-2"
        >
          <NavLink to="/" className="hover:text-gray-400 transition">
            <Home size={20} />
          </NavLink>

          {[
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
            "Du lịch",
            "Ý kiến",
            "Tâm sự",
            "Thư giãn",
          ].map((item) => (
            <a
              key={item}
              href="#"
              className="whitespace-nowrap hover:text-[#E6EEF3] transition"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Nút phải */}
        <button
          onClick={scrollRight}
          className="p-2 rounded-full hover:bg-[#0F1724] text-[#9AA9B8] cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>

    </header>
  );
};

export default Header;
