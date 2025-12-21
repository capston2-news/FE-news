// src/pages/SearchArticlesPage.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

import { AddBookmark, RemoveBookmark } from "../../services/bookmark/BookmarkService";

import {
  IncreseArticleViewCount,
  searchArticlesByKeyword,
} from "../../services/article/ArticleService";

const PAGE_SIZE = 10;
const PAGE_WINDOW = 10;
const SCROLL_OFFSET = 130;

// ---------- helpers ----------
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
    description: a?.content || a?.description || "",
    excerpt: a?.excerpt,
    readTime: a?.readTime || a?.readingTime,
    date: published ? formatDateVi(published) : "",

    category_name: a?.category_name || "",
    category_slug: a?.category_slug || "",
    category_child_name: a?.category_child_name || "",
    category_child_slug: a?.category_child_slug || "",

    is_bookmarked: !!a?.is_bookmarked,
    comments_count: a?.comments_count,
    stats: a?.stats,
  };
};

// ---------- Highlight keyword (bôi đen như ảnh) ----------
const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const Highlight = ({ text, query }) => {
  const raw = String(text ?? "");
  const q = String(query ?? "").trim();
  if (!q) return raw;

  // nhiều từ thì highlight từng từ
  const words = q.split(/\s+/).filter(Boolean).slice(0, 6);
  if (!words.length) return raw;

  const pattern = words
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");

  const re = new RegExp(`(${pattern})`, "gi");
  const parts = raw.split(re);

  return (
    <>
      {parts.map((p, i) => {
        const hit = words.some((w) => p.toLowerCase() === w.toLowerCase());
        if (!hit) return <React.Fragment key={i}>{p}</React.Fragment>;

        return (
          <mark
            key={i}
            className="bg-slate-700 text-white px-1 py-[1px] rounded-[2px]"
          >
            {p}
          </mark>
        );
      })}
    </>
  );
};

// ---------- Card 1 bài trong danh sách ----------
const FeedArticleCard = ({
  article,
  articleId,
  onOpenArticle,
  showBookmark,
  isBookmarked,
  onToggleBookmark,
  keyword,
}) => {
  const {
    title,
    image,
    description,
    excerpt,
    readTime,
    date,
    category_name,
    category_slug,
    category_child_name,
    category_child_slug,
    comments_count,
    stats,
  } = article || {};

  const displayDesc = excerpt || description;
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
    <article className="flex gap-3 md:gap-5 py-6 border-b border-slate-200 last:border-b-0">
      <div className="w-[190px] md:w-[250px] flex-shrink-0">
        <div
          className="relative rounded-xl overflow-hidden bg-slate-200 cursor-pointer"
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
            className="w-full h-[150px] md:h-[180px] object-cover"
          />
        </div>
      </div>

      <div className="flex-1 min-w-0 relative">
        <div className="flex items-center justify-between text-[11px] md:text-xs text-slate-500 mb-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            {category_name && category_slug ? (
              <NavLink
                to={`/category/${category_slug}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold tracking-wide uppercase hover:text-sky-600 cursor-pointer"
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

            {category_child_name && category_child_slug && category_slug && (
              <>
                <span className="text-slate-300">/</span>
                <NavLink
                  to={`/category/${category_slug}/${category_child_slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold tracking-wide uppercase hover:text-sky-600 cursor-pointer"
                >
                  {category_child_name}
                </NavLink>
              </>
            )}

            {readTime && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                <span>{readTime}</span>
              </>
            )}
            {date && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                <span>{date}</span>
              </>
            )}
          </div>

          {showBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark?.();
              }}
              className={`p-1.5 rounded-full border transition cursor-pointer
                ${
                  isBookmarked
                    ? "bg-sky-600 border-sky-600 text-white hover:bg-sky-500"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              aria-label="Bookmark"
              title="Lưu bài"
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
          )}
        </div>

        <h3
          className="text-[16px] md:text-[18px] font-semibold text-slate-900 leading-snug mb-1.5 cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={open}
          onKeyDown={onKeyOpen}
          title="Xem bài viết"
        >
          {/* ✅ highlight keyword trong title */}
          <Highlight text={title || "Tiêu đề bài viết"} query={keyword} />
        </h3>

        {displayDesc && (
          <p
            className="text-[14px] md:text-[15px] text-slate-600 line-clamp-2 mb-8 cursor-pointer hover:text-slate-700"
            role="button"
            tabIndex={0}
            onClick={open}
            onKeyDown={onKeyOpen}
            title="Xem bài viết"
          >
            {displayDesc}
          </p>
        )}

        <div className="absolute right-0 bottom-0 flex items-center gap-1 text-slate-500">
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
          <span className="text-[12px]">{comments}</span>
        </div>
      </div>
    </article>
  );
};

export default function SearchArticlesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const keyword = (params.get("key") || "").trim();

  const topRef = useRef(null);
  const scrollToTabs = () => {
    const el = topRef.current;
    if (!el) return;
    const y = el.getBoundingClient().top + window.pageYOffset - SCROLL_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const [currentPage, setCurrentPage] = useState(1);

  // data
  const [rawApi, setRawApi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // bookmark map
  const [bookmarkByOid, setBookmarkByOid] = useState({});

  const listAll = useMemo(() => rawApi.map(normalizeApiArticle), [rawApi]);

  const mergeBookmarkFlags = useCallback((arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return;
    const next = {};
    for (const a of arr) {
      const oid = oidOf(a);
      if (!oid) continue;
      next[oid] = !!a?.is_bookmarked;
    }
    setBookmarkByOid((prev) => ({ ...prev, ...next }));
  }, []);

  // load search result
  useEffect(() => {
    const load = async () => {
      if (!keyword) {
        setRawApi([]);
        setError("");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const res = await searchArticlesByKeyword(keyword);

        const list =
          Array.isArray(res) ? res :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res?.results) ? res.results :
          Array.isArray(res?.items) ? res.items :
          [];

        setRawApi(list);
        mergeBookmarkFlags(list);
      } catch {
        setError("Không tải được kết quả tìm kiếm.");
        setRawApi([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [keyword, mergeBookmarkFlags]);

  // reset page + scroll khi keyword đổi
  useEffect(() => {
    setCurrentPage(1);
    requestAnimationFrame(scrollToTabs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(listAll.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentList = listAll.slice(startIndex, startIndex + PAGE_SIZE);

  const pages = useMemo(
    () => buildPageWindow(currentPage, totalPages, PAGE_WINDOW),
    [currentPage, totalPages]
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    requestAnimationFrame(scrollToTabs);
  };

  // toggle bookmark
  const handleToggleBookmark = async (oid) => {
    if (!oid) return;

    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu bài.");
      navigate("/login");
      return;
    }

    const prev = !!bookmarkByOid[oid];
    setBookmarkByOid((m) => ({ ...m, [oid]: !prev }));

    const toastId = toast.loading(prev ? "Đang bỏ lưu..." : "Đang lưu bài...");

    try {
      if (!prev) {
        const ok = await AddBookmark(oid);
        if (!ok) throw new Error("AddBookmark failed");
        toast.success("Đã lưu bài", { id: toastId });
      } else {
        const ok = await RemoveBookmark(oid);
        if (!ok) throw new Error("RemoveBookmark failed");
        toast.success("Đã bỏ lưu", { id: toastId });
      }
    } catch {
      setBookmarkByOid((m) => ({ ...m, [oid]: prev }));
      toast.error("Không thể cập nhật bookmark. Thử lại nhé!", { id: toastId });
    }
  };

  // open article + tăng view
  const openArticle = (articleId) => {
    if (!articleId) return;
    Promise.resolve(IncreseArticleViewCount(articleId)).catch(() => {});
    navigate(`/article/${articleId}`);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 pt-8 pb-12">
      <div ref={topRef} className="scroll-mt-24">
        <h1 className="text-center text-3xl md:text-4xl font-extrabold text-slate-900">
          Kết quả tìm kiếm:{" "}
          <span className="italic font-extrabold">"{keyword || "..."}"</span>
        </h1>
      </div>

      <div className="mt-10 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="text-sm font-semibold text-slate-700">Bài viết</div>
        </div>

        <div className="px-6">
          {!keyword && (
            <div className="py-10 text-center text-slate-500">
              Nhập từ khóa để tìm kiếm.
            </div>
          )}

          {keyword && loading && (
            <div className="py-10 text-center text-slate-500">
              Đang tải kết quả…
            </div>
          )}

          {keyword && !loading && error && (
            <div className="py-10 text-center text-rose-600">{error}</div>
          )}

          {keyword && !loading && !error && listAll.length === 0 && (
            <div className="py-10 text-center text-slate-500">
              Không tìm thấy bài viết nào.
            </div>
          )}

          <div>
            {currentList.map((item, idx) => {
              const keyRow = item?.oid || item?.title || `${startIndex + idx}`;
              const articleId = item?.oid || null;

              return (
                <FeedArticleCard
                  key={keyRow}
                  article={item}
                  articleId={articleId}
                  onOpenArticle={openArticle}
                  showBookmark={!!user}
                  isBookmarked={!!bookmarkByOid[item?.oid]}
                  onToggleBookmark={() => handleToggleBookmark(item?.oid)}
                  keyword={keyword}
                />
              );
            })}
          </div>

          {keyword && !loading && !error && totalPages > 1 && (
            <div className="mt-10 pb-10 flex items-center justify-center gap-8 text-[15px] text-slate-700 select-none">
              {currentPage > 1 ? (
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  className="hover:text-sky-600 cursor-pointer"
                  aria-label="Previous"
                >
                  {"<"}
                </button>
              ) : (
                <span className="opacity-0 pointer-events-none">{"<"}</span>
              )}

              <div className="flex items-center gap-4">
                {pages.map((p) => {
                  const active = p === currentPage;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goToPage(p)}
                      className={
                        "w-10 h-10 grid cursor-pointer place-items-center transition " +
                        (active ? "bg-sky-500 text-white" : "hover:text-sky-600")
                      }
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {currentPage < totalPages ? (
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  className="hover:text-sky-600 cursor-pointer"
                  aria-label="Next"
                >
                  {">"}
                </button>
              ) : (
                <span className="opacity-0 pointer-events-none">{">"}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
