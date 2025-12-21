// src/components/home/SavedNewsPanel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

import {
  GetBookmarksOfUser,
  RemoveBookmark,
} from "../../services/bookmark/BookmarkService";
import { IncreseArticleViewCount } from "../../services/article/ArticleService";

const PAGE_SIZE = 5;
const PAGE_WINDOW = 7;
const SCROLL_OFFSET = 120;

const buildPageWindow = (current, total, windowSize = PAGE_WINDOW) => {
  if (total <= 0) return [];
  const half = Math.floor(windowSize / 2);

  let start = current - half;
  let end = start + windowSize - 1;

  if (start < 1) {
    start = 1;
    end = Math.min(total, start + windowSize - 1);
  }
  if (end > total) {
    end = total;
    start = Math.max(1, end - windowSize + 1);
  }

  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
};

const oidOf = (x) => x?._id?.$oid || x?._id || x?.id || null;

const pickFirstImage = (images) => {
  if (!images) return "";
  if (typeof images === "string") return images;
  if (Array.isArray(images)) return images[0] || "";
  if (typeof images === "object") return images.url || images.src || "";
  return "";
};

const formatDateVi = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
};

const normalizeApiArticle = (a) => {
  const oid = oidOf(a);
  const img = pickFirstImage(a?.images);
  const published = a?.published_at?.$date || a?.published_at || a?.date || "";

  return {
    _raw: a,
    oid,
    title: a?.title || "",
    image: img,

    readTime: a?.readTime || a?.readingTime,
    date: published ? formatDateVi(published) : "",

    category_name: a?.category_name || "",
    category_slug: a?.category_slug || "",
    category_child_name: a?.category_child_name || "",
    category_child_slug: a?.category_child_slug || "",

    is_bookmarked: a?.is_bookmarked ?? true,
    comments_count: a?.comments_count,
    stats: a?.stats,
  };
};

// UI card (không description)
const FeedArticleCard = ({
  article,
  articleId,
  onOpenArticle,
  isBookmarked,
  onToggleBookmark,
}) => {
  const {
    title,
    image,
    readTime,
    date,

    category_name,
    category_slug,
    category_child_name,
    category_child_slug,

    comments_count,
    stats,
  } = article || {};

  const comments = comments_count ?? stats?.comments ?? 0;

  const open = () => {
    if (!articleId) return;
    onOpenArticle?.(articleId);
  };

  const onKeyOpen = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  return (
    <article className="group">
      <div
        className="flex gap-3 md:gap-4 "
      >
        {/* ảnh không bo góc */}
        <div className="w-[120px] md:w-[140px] flex-shrink-0">
          <div
            className="relative bg-slate-200 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={open}
            onKeyDown={onKeyOpen}
            title="Xem bài viết"
          >
            <img
              src={
                image ||
                "https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg"
              }
              alt={title}
              className="w-full h-[84px] md:h-[96px] object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* meta */}
              <div className="flex items-center gap-2 flex-wrap text-[11px] md:text-xs text-slate-500">
                {category_name && category_slug ? (
                  <NavLink
                    to={`/category/${category_slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold tracking-wide uppercase hover:text-sky-600"
                  >
                    {category_name}
                  </NavLink>
                ) : (
                  category_name && (
                    <span className="font-semibold tracking-wide uppercase">
                      {category_name}
                    </span>
                  )
                )}

                {category_child_name &&
                  category_child_slug &&
                  category_slug && (
                    <>
                      <span className="text-slate-300">/</span>
                      <NavLink
                        to={`/category/${category_slug}/${category_child_slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold tracking-wide uppercase hover:text-sky-600"
                      >
                        {category_child_name}
                      </NavLink>
                    </>
                  )}

                {(readTime || date) && <span className="text-slate-300">•</span>}
                {readTime && <span>{readTime}</span>}
                {readTime && date && <span className="text-slate-300">•</span>}
                {date && <span>{date}</span>}
              </div>

              {/* title */}
              <h3
                className="mt-1 text-[14.5px] md:text-[16px] font-semibold text-slate-900 leading-snug
                           line-clamp-2 cursor-pointer hover:text-sky-600"
                role="button"
                tabIndex={0}
                onClick={open}
                onKeyDown={onKeyOpen}
                title="Xem bài viết"
              >
                {title || "Tiêu đề bài viết"}
              </h3>

              {/* footer nhỏ gọn */}
              <div className="mt-2 flex items-center justify-between gap-3 text-[12px] text-slate-500">
                <div className="flex items-center gap-1">
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
                  {/* <span>{comments}</span> */}
                </div>

              </div>
            </div>

            {/* bookmark */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark?.();
              }}
              className={`shrink-0 w-9 h-9 grid place-items-center cursor-pointer rounded-full border transition
                ${
                  isBookmarked
                    ? "bg-sky-600 border-sky-600 text-white hover:bg-sky-500"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              aria-label="Bookmark"
              title={isBookmarked ? "Bỏ lưu" : "Lưu bài"}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill={isBookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default function SavedNewsPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const topRef = useRef(null);

  const scrollToTop = () => {
    const el = topRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [apiList, setApiList] = useState([]);
  const list = useMemo(() => apiList.map(normalizeApiArticle), [apiList]);

  const [bookmarkByOid, setBookmarkByOid] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const pages = useMemo(
    () => buildPageWindow(currentPage, totalPages, PAGE_WINDOW),
    [currentPage, totalPages]
  );

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await GetBookmarksOfUser();
        const raw =
          Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.results)
            ? res.results
            : Array.isArray(res?.items)
            ? res.items
            : [];

        setApiList(raw);

        const next = {};
        for (const a of raw) {
          const oid = oidOf(a);
          if (oid) next[oid] = true;
        }
        setBookmarkByOid(next);
      } catch {
        setError("Không tải được danh sách tin đã lưu.");
        setApiList([]);
        setBookmarkByOid({});
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentList = list.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    requestAnimationFrame(scrollToTop);
  };

  const openArticle = (articleId) => {
    if (!articleId) return;
    Promise.resolve(IncreseArticleViewCount(articleId)).catch(() => {});
    navigate(`/article/${articleId}`);
  };

  const handleUnsave = async (oid) => {
    if (!oid) return;

    if (!user) {
      toast.error("Vui lòng đăng nhập để xem tin đã lưu.");
      navigate("/login");
      return;
    }

    const toastId = toast.loading("Đang bỏ lưu...");
    const prevList = apiList;

    // optimistic
    setBookmarkByOid((m) => ({ ...m, [oid]: false }));
    setApiList((arr) => arr.filter((x) => oidOf(x) !== oid));

    try {
      const ok = await RemoveBookmark(oid);
      if (!ok) throw new Error("RemoveBookmark failed");
      toast.success("Đã bỏ lưu", { id: toastId });
    } catch {
      setApiList(prevList);
      setBookmarkByOid((m) => ({ ...m, [oid]: true }));
      toast.error("Không thể bỏ lưu. Thử lại nhé!", { id: toastId });
    }
  };

  const getArticleId = (item) => item?.oid || oidOf(item?._raw) || null;

  if (!user) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Tin đã lưu</h2>
          <p className="mt-1 text-sm text-slate-600">
            Bạn cần đăng nhập để xem danh sách tin đã lưu.
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-500"
          >
            Đăng nhập
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div ref={topRef} className="scroll-mt-24" />

      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Tin đã lưu</h3>
          {/* <p className="text-sm text-slate-500">Danh sách bài bạn đã lưu</p> */}
        </div>
        <div className="text-sm text-slate-500">
          {list.length ? `${list.length} bài` : ""}
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          Đang tải tin đã lưu…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && list.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 grid place-items-center mb-3">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-sm text-slate-600">
            Chưa có tin đã lưu. Hãy bấm bookmark ở bài viết để lưu.
          </p>
        </div>
      )}

<div>
  {currentList.map((item, idx) => {
    const key = item?.oid || item?.title || `${startIndex + idx}`;
    const articleId = getArticleId(item);
    const oid = item?.oid;

    const isLast = idx === currentList.length - 1;

    return (
        <div
              key={key}
              className={
                "py-3 " +
                (isLast ? "" : "border-b border-slate-300/60")
              }
            >
              <FeedArticleCard
                article={item}
                articleId={articleId}
                onOpenArticle={openArticle}
                isBookmarked={!!bookmarkByOid[oid]}
                onToggleBookmark={() => handleUnsave(oid)}
              />
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-700 select-none">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-9 h-9 cursor-pointer rounded-xl border border-slate-200 bg-white disabled:opacity-40
                       hover:border-slate-300 transition"
            aria-label="Previous"
          >
            {"<"}
          </button>

          <div className="flex items-center gap-2">
            {pages.map((p) => {
              const active = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  className={
                    "w-9 h-9 cursor-pointer rounded-xl border transition " +
                    (active
                      ? "bg-sky-600 border-sky-600 text-white"
                      : "bg-white border-slate-200 hover:border-slate-300")
                  }
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="w-9 h-9 cursor-pointer rounded-xl border border-slate-200 bg-white disabled:opacity-40
                       hover:border-slate-300 transition"
            aria-label="Next"
          >
            {">"}
          </button>
        </div>
      )}
    </section>
  );
}
