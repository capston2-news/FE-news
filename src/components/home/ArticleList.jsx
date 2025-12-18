// src/components/home/ArticleList.jsx
import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMG =
  "https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg";

const ArticleCard = ({ article }) => {
  const {
    id,
    title,
    image,
    excerpt,
    description,
    category,
    categoryChild,
    readTime,
    author,
    date,
    stats,
  } = article;

  const url = `/article/${id}`;
  const displayDesc = excerpt || description;
  const authorName = author?.name || author || "Tác giả";
  const comments = stats?.comments ?? 0;

  return (
    <article className="flex gap-4 md:gap-6 py-4 border-b border-slate-200 last:border-b-0">
      {/* Ảnh */}
      <Link
        to={url}
        className="w-[120px] md:w-[160px] flex-shrink-0"
      >
        <div className="relative rounded-xl overflow-hidden bg-slate-200">
          <img
            src={image || FALLBACK_IMG}
            alt={title}
            className="w-full h-[90px] md:h-[110px] object-cover"
          />
        </div>
      </Link>

      {/* Nội dung */}
      <div className="flex-1 min-w-0">
        {/* category + time */}
        <div className="flex items-center justify-between text-[11px] md:text-xs text-slate-500 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            {category && (
              <span className="uppercase font-semibold tracking-wide">
                {categoryChild ? `${category} - ${categoryChild}` : category}
              </span>
            )}
            {readTime && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                <span>{readTime}</span>
              </>
            )}
          </div>
          {/* bookmark */}
          <button
            type="button"
            className="p-1 rounded-full border border-slate-300 hover:border-sky-500 hover:text-sky-600"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {/* tiêu đề */}
        <Link to={url}>
          <h2 className="text-[15px] md:text-[16px] font-semibold text-slate-900 leading-snug mb-1.5 hover:text-sky-600">
            {title}
          </h2>
        </Link>

        {/* mô tả ngắn */}
        {displayDesc && (
          <p className="text-[13px] md:text-[14px] text-slate-600 line-clamp-2 mb-2">
            {displayDesc}
          </p>
        )}

        {/* tác giả + comment */}
        <div className="flex items-center gap-3 text-[11px] md:text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-[11px]">
              {author?.avatar ? (
                <img
                  src={author.avatar}
                  alt={authorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                authorName[0]
              )}
            </div>
            <span className="font-semibold text-slate-800">{authorName}</span>
            {date && (
              <>
                <span>•</span>
                <span>{date}</span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{comments}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

const ArticleList = ({ articles = [] }) => {
  if (!articles.length) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 px-4 md:px-5">
      {articles.map((article) => (
        <ArticleCard key={article.id || article.slug} article={article} />
      ))}
    </div>
  );
};

export default ArticleList;
