// src/components/pages/article/ArticleHorizontalNews.jsx
import React, { useMemo } from "react";

export default function ArticleHorizontalNews({
  title = "Tin tức khác",
  items = [], // [{ id, title, image }]
  onOpen,
}) {
  const top3 = useMemo(() => (items || []).filter(Boolean).slice(0, 3), [items]);

  if (!top3.length) return null;

  return (
    <section className="mt-8 pt-8 border-t border-slate-200">
        <div className="flex items-center mb-3 gap-2">
            <span className="w-1 h-7 md:h-8 bg-sky-600" />
            <h3 className="text-xl md:text-2xl font-semibold text-black leading-none">
                {title}
            </h3>
        </div>

      {/* ✅ không scroll, luôn render 3 bài (trên màn đủ rộng sẽ là 3 cột) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {top3.map((it) => {
          const id = it?.id;
          const img = it?.image;
          const t = it?.title || "Bài viết";

          return (
            <div key={id || t} className="bg-transparent">
              <div
                role="button"
                tabIndex={0}
                onClick={() => id && onOpen?.(id)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && id) onOpen?.(id);
                }}
                className="cursor-pointer group"
                title="Xem bài viết"
              >
                <div className="bg-slate-200 overflow-hidden rounded-none">
                  <img
                    src={
                      img ||
                      "https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg"
                    }
                    alt={t}
                    className="w-full h-[150px] md:h-[160px] object-cover rounded-none group-hover:opacity-95 transition"
                  />
                </div>

                <h4 className="mt-2 text-[14px] md:text-[15px] font-semibold text-slate-900 line-clamp-2 group-hover:text-sky-600">
                  {t}
                </h4>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
