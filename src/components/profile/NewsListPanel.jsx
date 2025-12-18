import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function IconBtn({ children, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
    >
      {children}
    </button>
  );
}

function parseIds(raw) {
  try {
    if (!raw) return [];
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return [...new Set(parsed.map((x) => (typeof x === "object" ? String(x?.id ?? "") : String(x))).filter(Boolean))];
    }
    if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed.ids)) return [...new Set(parsed.ids.map(String))];
      return [...new Set(Object.keys(parsed))];
    }
    return [];
  } catch {
    return [];
  }
}

function saveIds(key, ids) {
  localStorage.setItem(key, JSON.stringify(ids));
}

export default function NewsListPanel({
  title,
  storageKey,
  allArticles,
  emptyText,
  mode, // "saved" | "seen"
  bookmarkKey = "bookmarks",
}) {
  const [ids, setIds] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setIds(parseIds(localStorage.getItem(storageKey)));
    setBookmarkIds(parseIds(localStorage.getItem(bookmarkKey)));
  }, [storageKey, bookmarkKey]);

  const items = useMemo(() => {
    const map = new Map(allArticles.map((a) => [String(a.id), a]));
    return ids.map((id) => map.get(String(id))).filter(Boolean);
  }, [ids, allArticles]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage]);

  const toggleBookmark = (articleId) => {
    const id = String(articleId);
    const exists = bookmarkIds.includes(id);
    const next = exists ? bookmarkIds.filter((x) => x !== id) : [id, ...bookmarkIds];
    setBookmarkIds(next);
    saveIds(bookmarkKey, next);
  };

  const removeFromThisList = (articleId) => {
    const id = String(articleId);
    const next = ids.filter((x) => x !== id);
    setIds(next);
    saveIds(storageKey, next);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <div className="text-sm text-slate-500">{items.length} bài</div>
      </div>

      <div className="mt-4 divide-y divide-slate-200">
        {pageItems.length === 0 ? (
          <div className="py-8 text-sm text-slate-600">{emptyText}</div>
        ) : (
          pageItems.map((a) => {
            const isBookmarked = bookmarkIds.includes(String(a.id));
            const thumb =
              a.image ||
              "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg";

            return (
              <div key={a.id} className="py-5 flex items-start gap-4">
                {/* Thumb */}
                <Link to={`/article/${a.id}`} className="shrink-0">
                  <div className="w-[140px] h-[82px] rounded-md overflow-hidden bg-slate-200">
                    <img src={thumb} alt={a.title} className="w-full h-full object-cover" />
                  </div>
                </Link>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <Link to={`/article/${a.id}`} className="block">
                    <h3 className="text-[18px] font-semibold text-slate-900 leading-snug line-clamp-2 hover:text-sky-600">
                      {a.title}
                    </h3>
                  </Link>

                  <div className="mt-2 text-sm text-slate-500">
                    {(a.category || "Chuyên mục")} <span className="mx-1">-</span>
                    {a.date || "15/12/2025"}
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-2 pt-2">
                  {/* comment count */}
                  <div className="flex items-center gap-1 text-slate-500">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v0.5z" />
                    </svg>
                    <span className="text-[15px] font-semibold text-rose-600">
                      {a.stats?.comments ?? 0}
                    </span>
                  </div>

                  {/* share */}
                  <IconBtn title="Chia sẻ">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  </IconBtn>

                  {/* bookmark */}
                  <IconBtn title={isBookmarked ? "Bỏ lưu" : "Lưu"} onClick={() => toggleBookmark(a.id)}>
                    {isBookmarked ? (
                      <svg className="w-5 h-5 text-rose-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 3h12a1 1 0 0 1 1 1v18l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 3h12a1 1 0 0 1 1 1v18l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                      </svg>
                    )}
                  </IconBtn>

                  {/* remove from current list (chỉ để tiện demo) */}
                  <IconBtn
                    title={mode === "saved" ? "Bỏ khỏi tin đã lưu" : "Xóa khỏi tin đã xem"}
                    onClick={() => removeFromThisList(a.id)}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 16H6L5 6" />
                    </svg>
                  </IconBtn>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {items.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Trang {safePage} / {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={
                "w-9 h-9 rounded-full border flex items-center justify-center transition " +
                (safePage <= 1 ? "border-slate-200 text-slate-300" : "border-slate-200 text-slate-700 hover:bg-slate-50")
              }
              aria-label="Trang trước"
            >
              ‹
            </button>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={
                "w-9 h-9 rounded-full border flex items-center justify-center transition " +
                (safePage >= totalPages ? "border-slate-200 text-slate-300" : "border-slate-200 text-slate-700 hover:bg-slate-50")
              }
              aria-label="Trang sau"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
