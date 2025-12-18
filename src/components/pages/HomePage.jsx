// src/pages/HomePage.jsx
import React, { use, useMemo, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import HeroSection from "../home/HeroSection";
import ArticleList from "../home/ArticleList";
import Sidebar from "../home/Sidebar";
import FeaturedNews from "../home/FeaturedNews";
import MainFeed from "../home/MainFeed";
import DiscoverMoreSection from "../home/DiscoverMoreSection";
import { articles, trendingArticles, topics } from "../../data";
import { getArticleTop10ViewsThisMonth } from "../../services/article/ArticleService";

const HomePage = () => {

  //Lấy các bài viết nổi bật trong tháng
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const getFeaturedArticles = async () => {
    const respone = await getArticleTop10ViewsThisMonth();
    setFeaturedArticles(respone);
  }

  useEffect(() => {
    getFeaturedArticles();
    console.log(featuredArticles);
  }, []);

  // lấy categories/sections từ MainLayout (Outlet context)
  const { sections = [], extraSections = [] } = useOutletContext() || {};

  const featured = articles[0];
  const others = articles.slice(1);

  // topics để đổ vào MainFeed (từ categories API đã map)
  const headerTopics = useMemo(() => {
    const all = [...sections, ...extraSections];
    return all.map((s) => ({
      id: s.id,            // slug
      name: s.label,       // label đã uppercase ở MainLayout (nếu muốn giữ nguyên)
      slug: s.id,          // route param /category/:slug
    }));
  }, [sections, extraSections]);

  // if(!featuredArticles) {
  //   return <div>hello</div>;
  // }

  return (
    <>
      {/* NỔI BẬT TRONG THÁNG ngay dưới CategoryHero */}
      <FeaturedNews articles={featuredArticles} />

      {/* Danh sách bài + Chủ đề (sticky) */}
      <MainFeed articles={articles} topics={headerTopics} />

      {/* Ý tưởng nổi bật mới: Đang được bàn luận + Gợi ý đọc tiếp */}
      <DiscoverMoreSection articles={articles} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <HeroSection featured={featured} others={others} />
          <ArticleList articles={others} />
        </div>

        <div className="lg:col-span-1">
          <Sidebar trending={trendingArticles} topics={topics} />
        </div>
      </div>
    </>
  );
};

export default HomePage;
