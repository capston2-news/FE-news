import React from 'react';
import { Mail, Phone, Globe, Facebook, Twitter, Instagram } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-[#071127] border-t border-[#111827] font-['Inter',_sans-serif] rounded-b-xl text-[#E6EEF3]">
      {/* Top Footer Section - Links and Contact */}
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* Column 1: Trang chủ */}
          <div>
            <h4 className="font-bold text-lg uppercase mb-4 text-[#E6EEF3]">Trang chủ</h4>
            <ul className="space-y-3 text-base text-[#9AA9B8]">
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Ảnh</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Infographics</a>
              </li>
            </ul>
          </div>

          {/* Column 2: VnE-GO */}
          <div>
            <h4 className="font-bold text-lg uppercase mb-4 text-[#E6EEF3]">VnE-GO</h4>
            <ul className="space-y-3 text-base text-[#9AA9B8]">
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Thời sự</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Thế giới</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Kinh doanh</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Khoa học công nghệ</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Góc nhìn</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Giải trí */}
          <div>
            <h4 className="font-bold text-lg uppercase mb-4 text-[#E6EEF3]">Giải trí</h4>
            <ul className="space-y-3 text-base text-[#9AA9B8]">
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Pháp luật</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Bất động sản</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Sức khỏe</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Thể thao</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Giáo dục</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Ý kiến */}
          <div>
            <h4 className="font-bold text-lg uppercase mb-4 text-[#E6EEF3]">Ý kiến</h4>
            <ul className="space-y-3 text-base text-[#9AA9B8]">
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Tâm sự</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Đời sống</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Xe</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Du lịch</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Thư giãn</a>
              </li>
            </ul>
          </div>

          {/* Column 5: Mới nhất */}
          <div>
            <h4 className="font-bold text-lg uppercase mb-4 text-[#E6EEF3]">Mới nhất</h4>
            <ul className="space-y-3 text-base text-[#9AA9B8]">
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Xem nhiều</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Tin nóng</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Newsletter</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Lịch vạn niên</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Rao vặt</a>
              </li>
            </ul>
          </div>

          {/* Column 6: Tải ứng dụng / Liên hệ / Đường dây nóng */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-bold text-base uppercase mb-4 text-[#E6EEF3]">Tải ứng dụng</h4>
            <h4 className="font-bold text-base uppercase mb-2 text-[#E6EEF3]">Liên hệ</h4>
            <ul className="space-y-1 text-sm text-[#9AA9B8] mb-6">
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Tòa soạn</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#60A5FA] transition duration-150">Quảng cáo</a>
              </li>
            </ul>

            <h4 className="font-bold text-base uppercase mb-2 text-[#E6EEF3]">Đường dây nóng</h4>
            <div className="flex flex-col md:flex-row md:space-x-6">
              <div className="mb-2 md:mb-0">
                <p className="text-red-600 font-bold text-lg leading-tight">083.888.0123</p>
                <p className="text-[#9AA9B8] text-sm">(Hà Nội)</p>
              </div>
              <div>
                <p className="text-red-600 font-bold text-lg leading-tight">082.233.3555</p>
                <p className="text-[#9AA9B8] text-sm">(TP. Hồ Chí Minh)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-[#0b1220] border-t border-[#111827] py-6 px-4 mt-8">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="text-left mb-4 lg:mb-0 max-w-lg">
              <h3 className="flex items-center font-bold text-base text-[#E6EEF3] mb-1">
                <Mail className="w-5 h-5 text-yellow-600 mr-2" /> VnExpress Newsletters
              </h3>
              <p className="text-xl font-bold text-[#E6EEF3] mb-1">Đừng bỏ lỡ tin tức quan trọng!</p>
              <p className="text-sm text-[#9AA9B8]">Nhận tóm tắt tin tức nổi bật, hấp dẫn nhất 24 giờ qua trên VnExpress.</p>
            </div>

            <div className="flex items-center space-x-2 w-full lg:w-auto">
              <button className="flex-shrink-0 flex items-center justify-center w-10 h-10 border border-[#1f2937] rounded-md bg-[#071127] hover:bg-[#0F1724] transition duration-150">
                <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" alt="Google" className="w-5 h-5" />
              </button>

              <div className="flex border border-[#1f2937] rounded-md overflow-hidden bg-[#071127] flex-grow lg:flex-grow-0">
                <input type="email" placeholder="Địa chỉ email..." className="flex-1 py-2 px-4 text-sm focus:outline-none min-w-[150px] bg-transparent text-[#E6EEF3] placeholder:text-[#94A3B8]" />
                <button className="bg-red-700 text-white font-bold text-sm py-2 px-4 hover:bg-red-800 transition duration-150 flex-shrink-0">Đăng ký</button>
              </div>
            </div>
          </div>
          <p className="text-xs text-[#9AA9B8] mt-2 text-right">*Khi đăng ký, bạn đồng ý điều khoản của VnExpress</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between text-center lg:text-left text-xs text-[#9AA9B8] space-y-4 lg:space-y-0">

          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-3 w-full lg:w-1/3">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2 lg:mb-0">
              <img src="https://s1.vnecdn.net/vnexpress/restruct/i/v9715/v2_2019/pc/graphics/logo.svg" alt="" />
            </div>
            <div className="flex-1 text-left space-y-1 text-[#9AA9B8]">
              <p>Báo tiếng Việt nhiều người xem nhất</p>
              <p>Thuộc Bộ Khoa học và Công nghệ</p>
              <p>Số giấy phép: 548/GP-BTTTT do Bộ Thông tin và Truyền thông cấp ngày 24/08/2021</p>
            </div>
          </div>

          <div className="flex flex-col space-y-2 items-center lg:items-start w-full lg:w-1/3 lg:pl-10">
            <div className="flex flex-wrap justify-center lg:justify-start space-x-3 text-sm text-[#9AA9B8] font-medium">
              <a href="#" className="hover:text-[#60A5FA]">Điều khoản sử dụng</a>
              <span className="text-[#374151] hidden sm:inline">|</span>
              <a href="#" className="hover:text-[#60A5FA]">Chính sách bảo mật</a>
              <span className="text-[#374151] hidden sm:inline">|</span>
              <a href="#" className="hover:text-[#60A5FA]">Cookies</a>
              <span className="text-[#374151] hidden sm:inline">|</span>
              <a href="#" className="hover:text-[#60A5FA]">RSS</a>
            </div>
            <p className="text-xs text-[#9AA9B8] mt-2">© 1997-2025. Toàn bộ bản quyền thuộc VnExpress</p>
          </div>

          <div className="flex flex-col space-y-1 w-full lg:w-1/3 lg:text-right">
            <p className="font-bold text-[#E6EEF3]">Tổng biên tập: Phạm Văn Hiếu</p>
            <p className="text-[#9AA9B8]">Địa chỉ: Tầng 10, Tòa A FPT Tower, số 10 Phạm Văn Bạch, phường Cầu Giấy, Hà Nội</p>
            <p className="text-[#9AA9B8]">Điện thoại: 024 7300 8999 - máy lẻ 4500</p>
            <p className="text-[#9AA9B8]">Email: <a href="mailto:webmaster@vnexpress.net" className="hover:text-[#60A5FA]">webmaster@vnexpress.net</a></p>

            <div className="flex items-center justify-center lg:justify-end space-x-3 pt-3">
              <span className="font-bold text-[#E6EEF3] text-sm">Theo dõi VnExpress trên</span>
              <a href="#" className="text-[#9AA9B8] hover:text-[#60A5FA] transition duration-150" aria-label="Facebook"><Facebook className="w-5 h-5"/></a>
              <a href="#" className="text-[#9AA9B8] hover:text-[#60A5FA] transition duration-150" aria-label="Twitter"><Twitter className="w-5 h-5"/></a>
              <a href="#" className="text-[#9AA9B8] hover:text-[#60A5FA] transition duration-150" aria-label="Instagram"><Instagram className="w-5 h-5"/></a>
              <a href="#" className="text-[#9AA9B8] hover:text-[#60A5FA] transition duration-150" aria-label="YouTube"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path fill="red" d="M10 15.5v-7l6 3.5z"/></svg></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;