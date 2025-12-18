// src/components/home/DiscoverMoreSection.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

const DiscoverMoreSection = ({ articles = [] }) => {
  if (!articles.length) return null;

  // Top bài nhiều comment
  const mostDiscussed = useMemo(
    () =>
      [...articles]
        .sort(
          (a, b) =>
            (b.stats?.comments || 0) - (a.stats?.comments || 0)
        )
        .slice(0, 5),
    [articles]
  );

  // Gợi ý đọc tiếp (dựa trên rating, nếu không có thì fallback bằng thứ tự)
  const editorsPicks = useMemo(
    () =>
      [...articles]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4),
    [articles]
  );

  return (
    <section className="max-w-6xl mx-auto px-4 pb-14">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)] gap-8">
        {/* ====== Cột trái: ĐANG ĐƯỢC BÀN LUẬN ====== */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm md:text-base font-semibold text-slate-900 uppercase tracking-wide">
              Đang được bàn luận nhiều
            </h3>
            <button className="text-xs text-sky-600 hover:text-sky-700">
              Xem tất cả bình luận
            </button>
          </div>

          <div className="space-y-2">
            {mostDiscussed.map((article, idx) => {
              const title = article.title || "Tiêu đề bài viết";
              const comments = article.stats?.comments || 0;
              const category =
                article.category || article.category_name || null;
              const slug = article.slug || article.id || `article-${idx}`;

              return (
                <Link
                  key={slug}
                  to={`/article/${slug}`}
                  className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-slate-50 transition"
                >
                  {/* Thứ hạng + info bên trái */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 text-[12px] font-semibold text-slate-400">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] md:text-[14px] font-semibold text-slate-900 truncate">
                        {title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {category && (
                          <span className="uppercase font-semibold">
                            {category}
                          </span>
                        )}
                        {article.readTime && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{article.readTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* comment bubble bên phải */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 pl-3 shrink-0">
                    <svg
                      className="w-4 h-4"
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
                </Link>
              );
            })}
          </div>
        </div>

        {/* ====== Cột phải: GỢI Ý ĐỌC TIẾP ====== */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm md:text-base font-semibold text-slate-900 uppercase tracking-wide">
              Gợi ý đọc tiếp
            </h3>
            <button className="text-xs text-sky-600 hover:text-sky-700">
              Làm mới gợi ý
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {editorsPicks.map((article, idx) => {
              const title = article.title || "Tiêu đề bài viết";
              const slug = article.slug || article.id || `pick-${idx}`;
              const image =
                article.image ||
                "https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg";
              const readTime = article.readTime || article.readingTime;
              const category =
                article.category || article.category_name || null;

              return (
                <Link
                  key={slug}
                  to={`/article/${slug}`}
                  className="group rounded-2xl overflow-hidden border border-slate-100 hover:border-sky-400 hover:shadow-md transition bg-slate-50"
                >
                  <div className="relative">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-[120px] md:h-[140px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent opacity-80 group-hover:opacity-100 transition" />
                    {category && (
                      <span className="absolute left-3 top-3 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-black/40 text-white">
                        {category}
                      </span>
                    )}
                  </div>

                  <div className="px-3 pb-3 pt-2 bg-white">
                    {readTime && (
                      <div className="text-[11px] text-slate-500 mb-0.5">
                        {readTime}
                      </div>
                    )}
                    <h4 className="text-[13px] md:text-[14px] font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-sky-600">
                      {title}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverMoreSection;