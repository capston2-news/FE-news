// src/components/layout/Footer.jsx
import React from "react";
import logo from "../../assets/newmateai.png";

const Footer = () => {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 pt-5 pb-10 text-[13px] text-slate-600">
        {/* Hàng trên: logo + menu + app store */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {/* Logo + menu */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Logo (tạm logo text, có thể đổi sang ảnh) */}
<div className="h-9 flex items-center">
  <img
    src={logo}
    alt="NEWMATEAI"
    className="h-9 w-auto object-contain"
  />
</div>

            {/* Menu */}
            <nav className="flex items-center gap-6 text-[13px] font-semibold tracking-wide text-slate-800 uppercase mt-1">
              <button className="hover:text-sky-600">Liên hệ</button>
              <button className="hover:text-sky-600">Điều kiện sử dụng</button>
            </nav>
          </div>

          {/* Tải app + nút store */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="text-[13px] text-slate-500">
              Tải app Spiderum
            </span>
            <div className="flex items-center gap-2">
              <a
                href="#"
                className="h-9"
                aria-label="Tải trên App Store"
              >
                <img
                  className="h-full w-auto"
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on the App Store"
                />
              </a>
              <a
                href="#"
                className="h-9"
                aria-label="Tải trên Google Play"
              >
                <img
                  className="h-full w-auto"
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Đường kẻ mảnh giống hình */}
        <div className="border-t border-slate-200 my-4" />

        {/* Hàng dưới: 3 cột thông tin */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Cột 1: công ty */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-1">
              Công ty Cổ Phần Feliz
            </h4>
            <p className="leading-relaxed">
              Trực thuộc Công ty Cổ Phần Spiderum Việt Nam (Spiderum Vietnam
              JSC)
              <br />
              Người chịu trách nhiệm nội dung: Trần Việt Anh
              <br />
              Giấy phép MXH số 341/GP-TTTT do Bộ TTTT cấp ngày 27 tháng 6 năm
              2016
            </p>
          </div>

          {/* Cột 2: liên hệ hợp tác */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-1">
              Liên hệ hợp tác
            </h4>
            <p className="leading-relaxed">
              Email:{" "}
              <a
                href="mailto:contact@spiderum.com"
                className="text-sky-600 hover:underline"
              >
                contact@spiderum.com
              </a>
              <br />
              Điện thoại: (+84) 978 944 558
            </p>
          </div>

          {/* Cột 3: copyright */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-1">
              © Copyright 2017 - 2023
            </h4>
            <p className="leading-relaxed">
              Email:{" "}
              <a
                href="mailto:contact@spiderum.com"
                className="text-sky-600 hover:underline"
              >
                contact@spiderum.com
              </a>
              <br />
              Điện thoại: (+84) 978 944 558
              <br />
              Tầng 11, tòa nhà HL Tower, lô A2B, phố Duy Tân, phường Dịch Vọng
              Hậu, Cầu Giấy, Hà Nội
            </p>
          </div>
        </div>

        {/* Hàng DMCA ở dưới cùng bên trái */}
        <div className="flex justify-start">
          <a
            href="#"
            aria-label="DMCA protected"
            className="h-10"
          >
            <img
              className="h-full w-auto"
              src="https://images.dmca.com/Badges/dmca_protected_sml_120n.png?ID=some-id"
              alt="DMCA Protected"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
