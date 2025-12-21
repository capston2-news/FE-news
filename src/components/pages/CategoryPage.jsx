// src/pages/CategoryPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

// ✅ services (sửa path nếu khác)
import {
  getArticlesByCategorySlug,
  getArticlesByArticleChild,
  IncreseArticleViewCount, // ✅ thêm view count giống MainFeed
} from "../../services/article/ArticleService";

import { getCategoryChildOfCategory } from "../../services/category/Category";
import { AddBookmark, RemoveBookmark } from "../../services/bookmark/BookmarkService";

const PAGE_SIZE = 20;
const PAGE_WINDOW = 10;
const SCROLL_OFFSET = 120;

const TABS = [{ id: "for-you", label: "DÀNH CHO BẠN" }];

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

const CategoryArticleCard = ({
  article,
  articleId,
  onOpenArticle,
  showBookmark,
  isBookmarked,
  onToggleBookmark,
}) => {
  const {
    title,
    image,
    excerpt,
    description,
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
    <article className="flex gap-5 md:gap-7 py-6 border-b border-slate-200 last:border-b-0">
      <div className="w-[150px] md:w-[200px] flex-shrink-0">
        <div
          className="relative rounded-2xl overflow-hidden bg-slate-200 cursor-pointer"
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
            className="w-full h-[120px] md:h-[140px] object-cover"
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
                className="uppercase font-semibold tracking-wide hover:text-sky-600"
              >
                {category_name}
              </NavLink>
            ) : (
              <span className="uppercase font-semibold tracking-wide">
                {category_name}
              </span>
            )}

            {category_child_name && category_child_slug && category_slug && (
              <>
                <span className="text-slate-300">/</span>
                <NavLink
                  to={`/category/${category_slug}/${category_child_slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="uppercase font-semibold tracking-wide hover:text-sky-600"
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

        <h2
          className="text-[16px] md:text-[18px] font-semibold text-slate-900 leading-snug mb-1.5 hover:text-sky-600 cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={open}
          onKeyDown={onKeyOpen}
          title="Xem bài viết"
        >
          {title}
        </h2>

        {displayDesc && (
          <p
            className="text-[13px] md:text-[14px] text-slate-600 line-clamp-2 mb-8 cursor-pointer hover:text-slate-700"
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
          {/* <span className="text-[12px]">{comments}</span> */}
        </div>
      </div>
    </article>
  );
};

const CategoryPage = () => {
  const { slug, childSlug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ open article + tăng view count (giống MainFeed)
  const openArticle = (articleId) => {
    if (!articleId) return;

    // fire-and-forget
    Promise.resolve(IncreseArticleViewCount(articleId)).catch(() => {});
    navigate(`/article/${articleId}`);
  };

  const topRef = useRef(null);
  const scrollToTabs = () => {
    const el = topRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const [activeTab, setActiveTab] = useState("for-you");
  const [currentPage, setCurrentPage] = useState(1);

  const [childTopics, setChildTopics] = useState([]);
  const [articlesApi, setArticlesApi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [bookmarkByOid, setBookmarkByOid] = useState({});

  useEffect(() => {
    const loadChildren = async () => {
      if (!slug) return;
      try {
        const res = await getCategoryChildOfCategory(slug);
        const list =
          Array.isArray(res) ? res :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res?.results) ? res.results :
          Array.isArray(res?.items) ? res.items :
          [];
        setChildTopics(list);
      } catch {
        setChildTopics([]);
      }
    };
    loadChildren();
  }, [slug]);

  useEffect(() => {
    const loadArticles = async () => {
      if (!slug) return;

      setLoading(true);
      setErrorText("");

      try {
        let res;
        if (childSlug) {
          res = await getArticlesByArticleChild(slug, childSlug);
        } else {
          res = await getArticlesByCategorySlug(slug);
        }

        const list =
          Array.isArray(res) ? res :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res?.results) ? res.results :
          Array.isArray(res?.items) ? res.items :
          [];

        setArticlesApi(list);
      } catch {
        setArticlesApi([]);
        setErrorText("Không tải được danh sách bài viết.");
      } finally {
        setLoading(false);
      }
    };

    setActiveTab("for-you");
    setCurrentPage(1);
    requestAnimationFrame(scrollToTabs);

    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, childSlug]);

  const baseList = useMemo(
    () => (articlesApi || []).map(normalizeApiArticle),
    [articlesApi]
  );

  useEffect(() => {
    if (!baseList.length) return;
    const next = {};
    for (const a of baseList) {
      if (!a?.oid) continue;
      next[a.oid] = !!a?.is_bookmarked;
    }
    setBookmarkByOid(next);
  }, [baseList]);

  const sortedList = useMemo(() => {
    const list = [...baseList];
    switch (activeTab) {
      case "trending":
        return list.sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0));
      case "newest":
        return list.sort((a, b) => {
          const da = a?._raw?.published_at?.$date || a?._raw?.published_at || 0;
          const db = b?._raw?.published_at?.$date || b?._raw?.published_at || 0;
          return new Date(db) - new Date(da);
        });
      case "hot":
        return list.sort(
          (a, b) =>
            (b.comments_count ?? b.stats?.comments ?? 0) -
            (a.comments_count ?? a.stats?.comments ?? 0)
        );
      case "top":
        return list.sort((a, b) => (b.stats?.votes || 0) - (a.stats?.votes || 0));
      default:
        return list;
    }
  }, [baseList, activeTab]);

  const totalPages = Math.max(1, Math.ceil(sortedList.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
    requestAnimationFrame(scrollToTabs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageArticles = sortedList.slice(startIndex, startIndex + PAGE_SIZE);

  const pages = useMemo(
    () => buildPageWindow(currentPage, totalPages, PAGE_WINDOW),
    [currentPage, totalPages]
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    requestAnimationFrame(scrollToTabs);
  };

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

  const titleText = useMemo(() => {
    const first = baseList?.[0];
    const catName = first?.category_name || "Chuyên mục";

    if (!childSlug) return catName;

    const childObj = (childTopics || []).find((c) => {
      const s = c?.category_child_slug || c?.slug || c?.id;
      return String(s) === String(childSlug);
    });

    const childName =
      childObj?.category_child_name ||
      childObj?.name ||
      childObj?.label ||
      first?.category_child_name ||
      "";

    return childName ? `${catName} / ${childName}` : catName;
  }, [baseList, childSlug, childTopics]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.4fr)_minmax(240px,1fr)] gap-10">
      <div>
        <div
          ref={topRef}
          className="scroll-mt-24 flex items-center justify-between border-b border-slate-200 pb-3"
        >
          <div className="flex items-center gap-6 text-[13px] md:text-sm font-semibold tracking-wide uppercase text-slate-600">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-2 ${
                  activeTab === tab.id ? "text-slate-900" : "hover:text-slate-900"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-sky-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-500">
            Trang: {currentPage} / {totalPages}
          </div>
        </div>

        <div className="flex items-baseline justify-between mt-4">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">
            {titleText}
          </h2>
        </div>

        <div className="mt-2">
          {loading && (
            <div className="py-6 text-sm text-slate-500">Đang tải bài viết…</div>
          )}
          {!loading && errorText && (
            <div className="py-6 text-sm text-rose-600">{errorText}</div>
          )}

          {!loading && !errorText && pageArticles.length ? (
            <>
              {pageArticles.map((a, idx) => (
                <CategoryArticleCard
                  key={a?.oid || a?.title || `${startIndex + idx}`}
                  article={a}
                  articleId={a?.oid}
                  onOpenArticle={openArticle} // ✅ đã có view count trong openArticle
                  showBookmark={!!user}
                  isBookmarked={!!bookmarkByOid[a?.oid]}
                  onToggleBookmark={() => handleToggleBookmark(a?.oid)}
                />
              ))}

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-8 text-[15px] text-slate-700 select-none">
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
                            (active
                              ? "bg-sky-500 text-white"
                              : "hover:text-sky-600")
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
            </>
          ) : (
            !loading &&
            !errorText && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                Chưa có bài viết cho chuyên mục này.
              </div>
            )
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-28 self-start">
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold tracking-wide text-slate-900 uppercase mb-4">
            CHỦ ĐỀ
          </h3>

          {(childTopics || []).length ? (
            <div className="flex flex-wrap gap-3">
              <NavLink
                to={`/category/${slug}`}
                className={({ isActive }) =>
                  "px-4 py-1.5 rounded-full border text-[13px] whitespace-nowrap transition " +
                  (!childSlug && isActive
                    ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                    : "bg-white border-slate-300 text-slate-800 hover:border-sky-500 hover:text-sky-600")
                }
              >
                Tất cả
              </NavLink>

              {childTopics.map((child) => {
                const cSlug = child?.category_child_slug || child?.slug || child?.id;
                const label =
                  child?.category_child_name ||
                  child?.name ||
                  child?.label ||
                  "Chủ đề";

                return (
                  <NavLink
                    key={cSlug}
                    to={`/category/${slug}/${cSlug}`}
                    className={({ isActive }) =>
                      "px-4 py-1.5 rounded-full border text-[13px] whitespace-nowrap transition " +
                      (isActive
                        ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                        : "bg-white border-slate-300 text-slate-800 hover:border-sky-500 hover:text-sky-600")
                    }
                  >
                    {label}
                  </NavLink>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] text-slate-500">
              Chưa có chủ đề con cho chuyên mục này.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
};

export default CategoryPage;
