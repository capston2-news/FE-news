// components/home/ArticleCard.jsx
import React from "react";

const ArticleCard = ({ article, variant = "list" }) => {
  if (variant === "hero") {
    return (
      <article className="rounded-3xl overflow-hidden bg-white border border-slate-200 hover:shadow-md transition cursor-pointer">
        <div className="h-52 md:h-64 w-full overflow-hidden">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 font-semibold">
              {article.categoryName}
            </span>
            <span>•</span>
            <span>{article.createdAt}</span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>
          <h2 className="text-lg md:text-2xl font-semibold mb-2 md:mb-3 leading-snug line-clamp-2">
            {article.title}
          </h2>
          <p className="text-sm md:text-[15px] text-slate-600 line-clamp-3 mb-4">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3">
            <img
              src={article.authorAvatar}
              alt={article.author}
              className="w-8 h-8 rounded-full"
            />
            <div className="text-xs">
              <div className="font-semibold text-slate-800">
                {article.author}
              </div>
              <div className="text-slate-500 text-[11px]">
                Thành viên cộng đồng
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="rounded-2xl overflow-hidden bg-white border border-slate-200 hover:shadow-md transition cursor-pointer flex">
        <div className="w-24 md:w-28 h-full flex-shrink-0">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3 flex flex-col justify-between">
          <div>
            <div className="text-[11px] text-sky-600 font-semibold mb-1 uppercase">
              {article.categoryName}
            </div>
            <h3 className="text-sm md:text-[15px] font-semibold line-clamp-2 leading-snug">
              {article.title}
            </h3>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex gap-2">
            <span>{article.createdAt}</span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </article>
    );
  }

  // list variant
  return (
    <article className="flex gap-3 md:gap-4 py-4 border-b border-slate-100 last:border-none cursor-pointer">
      <div className="w-24 md:w-32 h-24 md:h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-200">
        <img
          src={article.thumbnail}
          alt={article.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
          <span className="uppercase font-semibold text-sky-600">
            {article.categoryName}
          </span>
          <span>•</span>
          <span>{article.createdAt}</span>
          <span>•</span>
          <span>{article.readTime}</span>
        </div>
        <h3 className="text-[15px] md:text-[16px] font-semibold mb-1 leading-snug line-clamp-2">
          {article.title}
        </h3>
        <p className="text-xs md:text-sm text-slate-600 line-clamp-2 md:line-clamp-3">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <img
            src={article.authorAvatar}
            alt={article.author}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-[11px] text-slate-700">{article.author}</span>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
