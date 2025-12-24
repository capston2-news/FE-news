import React, { useEffect, useState } from 'react';
import NewsSection from './NewsSection';
import AdSection from './AdSection';
import Section from "./Section.jsx";
import AdBank from "./AdBank.jsx";
import ScheduleFootball from "./ScheduleFootball.jsx";
import NewsCategory from './NewsCategory.jsx';
import Navbar from '../Science/Navbar.jsx';
import MainContent from '../Science/MainContent.jsx';
import Header from '../../Header/Header.jsx';
import Footer from '../../Footer/Footer.jsx';
import { getAllArticle } from '../../../services/article/Article.jsx';
import Loading from '../../utils/Loading.jsx';



const newsSections = [
    {
        title: "Kinh doanh",
        categories: ["Quốc tế", "Doanh nghiệp", "Hàng hóa", "Vĩ mô", "Ebank", "Hậu trường kinh doanh"],
        mainArticle: {
            image: "https://i1-kinhdoanh.vnecdn.net/2025/10/10/china-golden-week-reu-17600876-5062-8735-1760087835.jpg?w=380&h=228&q=100&dpr=2&fit=crop&s=qdDrfS3mFpzXPWSp3REkFQ",
            headline: "Cuộc chiến giá trong Tuần lễ Vàng tại Trung Quốc",
            summary: "Làn sóng giảm giá đang lan sang ngành du lịch Trung Quốc, làm trầm trọng thêm lo ngại về áp lực giảm phát trong ...",
            subHeadline: "Giảm thuế xuất khẩu vàng trang sức, kỹ nghệ về 0%",
            subSummary: "Từ 10/10/2025, thuế suất xuất khẩu với vàng trang sức, kỹ nghệ giảm về 0%, theo Nghị định của Chính phủ.",
        },
        bulletPoints: [
            "Mỹ rút gọn danh sách ứng cử viên Chủ tịch Fed",
            "9 tháng đầu năm, Đà Nẵng giải ngân vốn đầu tư công chỉ đạt 47%",
            "CEO FPT và VinaCapital lập liên minh drone khai thác 'nền kinh tế tầm thấp'"
        ],
        adComponent: 'AdBank'
    },
    {
        title: "Bất động sản",
        categories: ["Chính sách", "Thị trường", "Không gian sống", "Tư vấn"],
        mainArticle: {
            image: "https://i1-vnexpress.vnecdn.net/2025/10/10/1-1760081024.jpg?w=380&h=228&q=100&dpr=2&fit=crop&s=SJjtYrbWOFdghXF7D1xQpQ",
            headline: "Biệt thự nghỉ dưỡng 190 m2 bằng tre ẩn mình giữa rừng",
            summary: "IndonesiaCông trình nằm ở giữa núi rừng, sử dụng hoàn toàn vật liệu tự nhiên và thiết kế hòa nhập với địa ...",
            subHeadline: "'Cần cơ chế để gia đình từ 3 con tiếp cận được nhà ở xã hội'",
            subSummary: "Phó thủ tướng Trần Hồng Hà cho rằng cần có chính sách khuyến khích, tạo điều kiện tiếp cận nhà ở xã hội ...",
        },
        bulletPoints: [
            "Đề xuất chuyển chức năng văn phòng đăng ký đất đai về phường, xã",
            "Hà Nội có thêm dự án nhà xã hội hơn 20 triệu một m2 mở bán",
            "Thiết kế tinh gọn cho căn hộ 70 m2 với ngân sách 300 triệu đồng"
        ],
        adComponent: null
    },
    {
        title: "Thể thao",
        categories: ["Bóng đá", "Tennis", "Marathon", "Lịch thi đấu", "V-League"],
        mainArticle: {
            image: "https://i1-thethao.vnecdn.net/2025/10/10/estevao-jpeg-1760100924-176010-9712-7805-1760100988.jpg?w=380&h=228&q=100&dpr=2&fit=crop&s=LN6aN1Z_Rshzb4XWO1ST2g",
            headline: "Tuyển Brazil đè bẹp Hàn Quốc",
            summary: "Hàn Quốc-Đội tuyển Brazil thắng Hàn Quốc 5-0 trong trận giao hữu FIFA, trên sân Seoul World Cup.",
            subHeadline: "Sharapova làm giàu thế nào sau khi giải nghệ",
            subSummary: "Nhờ những bản hợp đồng triệu đô với các thương hiệu xa xỉ cùng danh mục đầu tư trải rộng, cựu tay vợt người Nga Maria Sharapova đã ...",
        },
        bulletPoints: [
            "Truyền thông thế giới thán phục kỷ lục của Bao Phương Vinh",
            "Tuyển Iraq nhận cảnh báo về 'cái bẫy' của Indonesia",
            "Chạy marathon với tần suất nào cho phù hợp"
        ],
        adComponent: 'ScheduleFootball'
    },
    {
        title: "Giải trí",
        categories: ["Giới sao", "Phim", "Nhạc", "Thời trang"],
        mainArticle: {
            image: "https://i1-giaitri.vnecdn.net/2025/10/08/eternal-sunshine-of-the-spotle-1149-5110-1759908824.png?w=380&h=228&q=100&dpr=2&fit=crop&s=5B0impa4OGKru6jNk6qSzw",
            headline: "10 vai diễn hay nhất của Kate Winslet",
            summary: "Vai cô gái cố xóa ký ức về người yêu cũ trong phim \"Eternal Sunshine of the Spotless Mind\" là màn trình diễn ... ",
            subHeadline: "Chủ nhân Nobel Văn học 2025: 'Nỗi cay đắng là nguồn cảm hứng của tôi'",
            subSummary: "László Krasznahorkai sốc khi nhận tin đoạt giải Nobel và cho biết cảm hứng ...",
        },
        bulletPoints: [
            "Trần Tiến: 'Nhạc sĩ Văn Cao, Trịnh Công Sơn là người ơn của tôi'",
            "Phạm Quỳnh Anh: 'Tôi luôn biết ơn chồng cũ'",
            "Annie - tiểu thư tài phiệt Hàn làm idol"
        ],
        adComponent: null
    },
    {
        title: "Sức khỏe",
        categories: ["Tin tức", "Sống khỏe", "Vaccine"],
        mainArticle: {
            image: "https://i1-suckhoe.vnecdn.net/2025/10/10/233a1776-1760087027-1760087043-5422-1760087070.jpg?w=380&h=228&q=100&dpr=2&fit=crop&s=oW546qaVYrzYlGdimiF7lA",
            headline: "Giải phẫu bệnh - 'đơn thuốc' đầu tiên của bệnh nhân ung thư",
            summary: "Trong điều trị ung thư, chẩn đoán giải phẫu bệnh là bước khởi đầu được ví như ... ",
            subHeadline: "Huyết áp thấp thai kỳ",
            subSummary: "Huyết áp dưới 90/60 mmHg khi mang thai khá phổ biến, thường không đáng lo ngại song một số trường hợp ... .",
        },
        bulletPoints: [
            "Bệnh nhân phản ánh bị thu 50.000 đồng khi đổi nơi khám BHYT ",
            "Vợ chồng cùng điều trị vô sinh ",
            "Bác sĩ tạo hình hậu môn cho bé sơ sinh "
        ],
        adComponent: null
    },
    {
        title: "Giáo dục",
        categories: ["Tin tức", "Tuyển sinh", "Chân dung","Du học","Giáo dục 4.0","Trắc nghiệm"],
        mainArticle: {
            image: "https://i1-vnexpress.vnecdn.net/2025/10/11/529426302-1131976905628337-691-8089-5768-1760135041.jpg?w=380&h=228&q=100&dpr=2&fit=crop&s=AnNSmBtN11uJOO1PcM7phA",
            headline: "Du học sinh tới Mỹ giảm kỷ lục",
            summary: "Khoảng 300.000 sinh viên quốc tế tới Mỹ mùa thu này, giảm 19% so với năm ngoái, sau hàng loạt động thái siết thị thực du học của chính phủ. ",
            subHeadline: "Quốc gia nào được 3 đại dương bao quanh?",
            subSummary: "Nằm ở gần cực Bắc, 3 mặt của quốc gia này được bảo bọc bởi các đại dương khác nhau. Bạn có biết đây là nước nào? ",
        },
        bulletPoints: [
            "Nam sinh ẵm suất học bổng hiếm của đại học top đầu Australia ",
            "Nhiều đại học chi tiền tỷ cho nghiên cứu của sinh viên ",
            "5 môn học thiếu nhiều giáo viên nhất ở TP HCM "
        ],
        adComponent: null
    }
];
const MainLayout = () => {
    const [articles, setArticles] = useState([]);

    const getArticles = async () => {
        const data = await getAllArticle();
        setArticles(data);
    };

    // Cắt theo câu đầu tiên
    const firstSentence = (text) => {
        if (!text) return "";
        const split = text.split(".");
        return split[0] + ".";
    };

    useEffect(() => {
        getArticles();
    }, []);

    if (articles.length === 0) {
        return <Loading />;
    }

    return (
            <main className="container max-w-7xl px-2 py-4 mt-24 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* MAIN CONTENT - 2.5 columns */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Featured Article */}
                        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                            {newsSections[0]?.mainArticle && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                                    <div className="md:col-span-2">
                                        <img 
                                            src={newsSections[0].mainArticle.image} 
                                            alt="featured"
                                            className="w-full h-64 object-cover rounded"
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight hover:text-red-600 cursor-pointer transition">
                                                {newsSections[0].mainArticle.headline}
                                            </h2>
                                            <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                                {newsSections[0].mainArticle.summary}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500">2 phút trước</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* News Sections */}
                        <div className="space-y-6">
                            {newsSections.map((section, index) => (
                                <NewsCategory
                                    key={index}
                                    title={section.title}
                                    categories={section.categories}
                                    mainArticle={section.mainArticle}
                                    bulletPoints={section.bulletPoints}
                                    adComponent={section.adComponent}
                                />
                            ))}
                        </div>

                        {/* More Articles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {articles.slice(0, 8).map((article, index) => (
                                <Section
                                    key={article._id.$oid}
                                    title={article?.title}
                                    image={article?.images}
                                    summary={firstSentence(article.content)}
                                    id={String(article._id.$oid)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* SIDEBAR - 1.5 columns */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Trending Widget */}
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b-2 border-red-600">
                                XEM NHIỀU NHẤT
                            </h3>
                            <div className="space-y-3">
                                {articles.slice(0, 5).map((article, i) => (
                                    <a
                                        key={article._id.$oid}
                                        href={`/article/${article._id.$oid}`}
                                        className="flex gap-2 group"
                                    >
                                        <span className="text-lg font-bold text-gray-300 flex-shrink-0 mt-0.5">{i + 1}</span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 group-hover:text-red-600 line-clamp-2 transition">
                                                {article.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{article.category || 'Tin tức'}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Ad Section */}
                        <AdSection/>

                        {/* Latest News Widget */}
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b-2 border-red-600">
                                TIN MỚI NHẤT
                            </h3>
                            <div className="space-y-3">
                                {articles.slice(5, 10).map((article) => (
                                    <a
                                        key={article._id.$oid}
                                        href={`/article/${article._id.$oid}`}
                                        className="block group"
                                    >
                                        <p className="text-sm font-semibold text-gray-900 group-hover:text-red-600 line-clamp-2 transition">
                                            {article.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleString('vi-VN')}</p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Science Section */}
                <div className="mt-8">
                   <Navbar/>
                   <MainContent/>
                </div>
<Footer/>
            </main>

            );
            };

            export default MainLayout;