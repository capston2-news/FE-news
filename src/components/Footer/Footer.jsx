import React from 'react';
import { Mail, Phone, Globe, Facebook, Twitter, Instagram } from 'lucide-react';

function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-200 font-['Inter',_sans-serif] mt-12">
            {/* Top Footer Section */}
            <div className="max-w-7xl mx-auto py-12 px-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    {/* Column 1 */}
                    <div>
                        <h4 className="font-bold text-white text-sm uppercase mb-4 border-b border-gray-700 pb-2">Trang chủ</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition">Ảnh</a></li>
                            <li><a href="#" className="hover:text-white transition">Infographics</a></li>
                        </ul>
                    </div>
                    {/* Column 2 */}
                    <div>
                        <h4 className="font-bold text-white text-sm uppercase mb-4 border-b border-gray-700 pb-2">Danh mục</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition">Thời sự</a></li>
                            <li><a href="#" className="hover:text-white transition">Thế giới</a></li>
                            <li><a href="#" className="hover:text-white transition">Kinh doanh</a></li>
                            <li><a href="#" className="hover:text-white transition">Khoa học</a></li>
                        </ul>
                    </div>
                    {/* Column 3 */}
                    <div>
                        <h4 className="font-bold text-white text-sm uppercase mb-4 border-b border-gray-700 pb-2">Giải trí</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition">Pháp luật</a></li>
                            <li><a href="#" className="hover:text-white transition">Bất động sản</a></li>
                            <li><a href="#" className="hover:text-white transition">Sức khỏe</a></li>
                            <li><a href="#" className="hover:text-white transition">Thể thao</a></li>
                        </ul>
                    </div>
                    {/* Column 4 */}
                    <div>
                        <h4 className="font-bold text-white text-sm uppercase mb-4 border-b border-gray-700 pb-2">Ý kiến</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition">Tâm sự</a></li>
                            <li><a href="#" className="hover:text-white transition">Đời sống</a></li>
                            <li><a href="#" className="hover:text-white transition">Xe</a></li>
                            <li><a href="#" className="hover:text-white transition">Du lịch</a></li>
                        </ul>
                    </div>
                    {/* Column 5 */}
                    <div>
                        <h4 className="font-bold text-white text-sm uppercase mb-4 border-b border-gray-700 pb-2">Liên hệ</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition">Tuyển dụng</a></li>
                            <li><a href="#" className="hover:text-white transition">Quảng cáo</a></li>
                            <li><a href="#" className="hover:text-white transition">Góp ý</a></li>
                            <li><a href="#" className="hover:text-white transition">Điều khoản</a></li>
                        </ul>
                    </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-4 mt-8 pt-8 border-t border-gray-700">
                    <a href="#" className="text-gray-400 hover:text-white transition">
                        <Facebook size={20} />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition">
                        <Twitter size={20} />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition">
                        <Instagram size={20} />
                    </a>
                </div>
            </div>            
            {/* Bottom Section - Copyright */}
            <div className="border-t border-gray-700 py-6 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center text-center text-xs text-gray-400">
                        <p className="mb-2">© 1997-2025 | FE-News | Báo tiếng Việt nhiều người xem nhất</p>
                        <p>Số giấy phép: 548/GP-BTTTT | Bộ Thông tin và Truyền thông</p>
                        <p className="mt-2">Email: <a href="mailto:contact@fe-news.vn" className="text-gray-300 hover:text-white">contact@fe-news.vn</a></p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
