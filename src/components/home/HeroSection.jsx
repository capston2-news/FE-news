// components/home/HeroSection.jsx
import React from "react";
import ArticleCard from "./ArticleCard";

const HeroSection = ({ featured, others }) => {
  if (!featured) return null;

  return (
    <section className="space-y-4">
      {/* Banner intro */}
      <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 text-white px-5 md:px-8 py-6 md:py-7 mb-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="uppercase tracking-[0.18em] text-[11px] font-semibold text-sky-100 mb-2">
              Động Nhện cho người thích nghĩ
            </p>
            <h1 className="text-xl md:text-2xl font-bold leading-snug mb-1">
              Viết – Chia sẻ – Kết nối – Chiêm nghiệm
            </h1>
            <p className="text-xs md:text-sm text-sky-50 max-w-xl">
              Nơi những câu chuyện, góc nhìn và bài học cuộc sống được kể lại
              bởi chính người trẻ Việt Nam.
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-2 text-xs md:text-sm">
            <p className="text-sky-50">
              Hơn <span className="font-semibold">40.000+</span> bài viết từ{" "}
              <span className="font-semibold">50.000+</span> thành viên.
            </p>
            <button className="inline-flex items-center gap-1.5 bg-white text-sky-600 font-semibold px-4 py-1.5 rounded-full text-xs shadow-sm hover:bg-sky-50">
              Bắt đầu đọc ngay
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured + 2 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ArticleCard article={featured} variant="hero" />
        </div>
        <div className="flex flex-col gap-4">
          {others.slice(0, 2).map((a) => (
            <ArticleCard key={a.id} article={a} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
