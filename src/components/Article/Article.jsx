import Header from "../Header/Header.jsx";
import MainContent from "./MainContent.jsx";
import Sidebar from "./Sidebar.jsx";
import ArticleCard from "./ArticleCard.jsx";
import ArticleActions from "./ArticleActions.jsx";
import Sidebars from "./Sidebars.jsx";
import BusinessNews from "./BusinessNews.jsx";
import CommentsSection from "./CommentsSection.jsx";
import { use, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArticleExpectArticleId } from "../../services/article/Article.jsx";
import Loading from "../utils/Loading.jsx";

function Article(){
    const [a, setA] = useState();
    // const mainArticles = [
    //     {
    //         image: "https://i1-vnexpress.vnecdn.net/2025/10/13/ttg1-16674742319591431933173-1-9916-1998-1760312794.jpg?w=180&h=108&q=100&dpr=2&fit=crop&s=UPjQKsOh6GdQrKVWZgDoIA",
    //         title: "Thủ tướng: Đảng bộ Chính phủ tiên phong kiến tạo kỷ nguyên phát triển mới",
    //         description: "Thủ tướng Phạm Minh Chính nhấn mạnh Đảng bộ Chính phủ tiên phong; phát huy bản lĩnh, trí tuệ, khát vọng đổi mới; góp phần đưa đất nước vào kỷ nguyên phát triển phồn vinh. ",
    //         hasBorder:true
    //     },
    //     {
    //         image: "https://i1-vnexpress.vnecdn.net/2025/10/13/img2790-1760260245350457213194-7121-1432-1760306453.jpg?w=180&h=108&q=100&dpr=2&fit=crop&s=JNOjIyZkTrKrtKOBznZPvQ",
    //         title: "Tiết kiệm 39.000 tỷ đồng mỗi năm sau sắp xếp bộ máy",
    //         description: "Theo báo cáo của Chính phủ, sau sắp xếp bộ máy, tổng số biên chế giảm 145.000 công chức, viên chức, tiết kiệm được 39.000 tỷ đồng chi thường xuyên mỗi năm.",
    //         hasBorder:false
    //     }
    // ];

    const {id} = useParams();
    const [mainArticles, setMainArticles] = useState([]); 

    const handleGetMainArticles = async (id) => {
        const data = await getArticleExpectArticleId(id);
        setMainArticles(data);
    }

    useEffect(() => {
        handleGetMainArticles(id);
    }, [id]);

    const firstSentence = (text) => {
        if (!text) return "";
        const split = text.split(".");
        return split[0] + ".";
    };

    if (mainArticles.length === 0) {
        return <Loading />;
    }

    return (
        <>
            <div className="min-h-screen  font-sans bg-[#FCFAF6]">
                <Header/>
                <div className="container mx-auto w-full px-4 py-30 flex gap-12 pl-8 pr-8">
                    <div className="w-full lg:w-2/3">
                        <MainContent/>
                        <div className="bg-white px-4 shadow-sm border border-gray-300">
                            <div className="divide-y divide-gray-300">
                                {mainArticles.map((article, index) => (
                                    <ArticleCard
                                        key={index}
                                        image={article.images}
                                        title={article.title}
                                        description={firstSentence(article.content)}
                                        isLast={index === article.length - 1}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Các nút điều hướng giữ nguyên */}
                        {/* <div className="flex items-center justify-between mt-6  pt-4">
                            <ArticleActions/>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300">

                            <div className="space-y-6">
                                {articles.map((article, index) => (
                                    <ArticleCard
                                        key={index}
                                        image={article.image}
                                        title={article.title}
                                        description={article.description}
                                    />
                                ))}
                            </div>
                        </div> */}
                    </div>

                    <div className="w-full lg:w-1/3">
                        <Sidebar isSticky={true} /> {/* Here, it's sticky */}
                    </div>

                </div>

            </div>
            <div className="bg-white min-h-screen font-sans">
                <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-2/3">
                        <CommentsSection/>
                        {/*<BusinessNews/>*/}
                    </div>
                    <div className="w-full lg:w-1/3">
                        <Sidebars/>

                    </div>
                </div>
            </div>
        </>
    )

}

export default Article;