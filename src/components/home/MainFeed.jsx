// src/components/home/MainFeed.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

import { getAllArticles } from "../../services/article/ArticleService";
import { AddBookmark, RemoveBookmark } from "../../services/bookmark/BookmarkService";

// ✅ đổi path này đúng theo nơi bạn đặt service
import { IncreseArticleViewCount } from "../../services/article/ArticleService";

const PAGE_SIZE = 20;
const PAGE_WINDOW = 10;
const SCROLL_OFFSET = 130;

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

// Card 1 bài trong danh sách
const FeedArticleCard = ({
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
      {/* ✅ click ảnh -> open */}
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
        {/* meta + bookmark */}
        <div className="flex items-center justify-between text-[11px] md:text-xs text-slate-500 mb-1.5">
          <div className="flex items-center gap-2 flex-wrap">
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
                <span className="font-semibold tracking-wide uppercase">{category_name}</span>
              )
            )}

            {category_child_name && category_child_slug && category_slug && (
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

          {/* ✅ chỉ render khi login */}
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

        {/* ✅ click title -> open */}
        <h3
          className="text-[16px] md:text-[18px] font-semibold text-slate-900 leading-snug mb-1.5 hover:text-sky-600 cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={open}
          onKeyDown={onKeyOpen}
          title="Xem bài viết"
        >
          {title || "Tiêu đề bài viết"}
        </h3>

        {/* ✅ click description -> open */}
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

        {/* icon comment */}
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

const MainFeed = ({ articles = [], topics = [] }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const topRef = useRef(null);
  const scrollToTabs = () => {
    const el = topRef.current;
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const [activeTab, setActiveTab] = useState("for-you");
  const [currentPage, setCurrentPage] = useState(1);

  // newest
  const [newestApi, setNewestApi] = useState([]);
  const [loadingNewest, setLoadingNewest] = useState(false);
  const [errorNewest, setErrorNewest] = useState("");

  // bookmark map
  const [bookmarkByOid, setBookmarkByOid] = useState({});

  const forYouList = useMemo(() => [...articles], [articles]);
  const newestList = useMemo(() => newestApi.map(normalizeApiArticle), [newestApi]);

  // load newest when switch to newest
  useEffect(() => {
    const loadNewest = async () => {
      setLoadingNewest(true);
      setErrorNewest("");
      try {
        const res = await getAllArticles();
        const list =
          Array.isArray(res) ? res :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res?.results) ? res.results :
          Array.isArray(res?.items) ? res.items :
          [];
        setNewestApi(list);
      } catch {
        setErrorNewest("Không tải được danh sách Mới nhất.");
        setNewestApi([]);
      } finally {
        setLoadingNewest(false);
      }
    };

    if (activeTab === "newest" && newestApi.length === 0 && !loadingNewest) {
      loadNewest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // init bookmark map from api response
  useEffect(() => {
    if (!newestApi.length) return;
    const next = {};
    for (const a of newestApi) {
      const oid = oidOf(a);
      if (!oid) continue;
      next[oid] = !!a?.is_bookmarked;
    }
    setBookmarkByOid(next);
  }, [newestApi]);

  const listBase = activeTab === "newest" ? newestList : forYouList;

  const totalPages = Math.max(1, Math.ceil(listBase.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
    requestAnimationFrame(scrollToTabs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentList = listBase.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    requestAnimationFrame(scrollToTabs);
  };

  const pages = useMemo(
    () => buildPageWindow(currentPage, totalPages, PAGE_WINDOW),
    [currentPage, totalPages]
  );

  const handleToggleBookmarkNewest = async (oid) => {
    if (!oid) return;

    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu bài.");
      navigate("/login");
      return;
    }

    const prev = !!bookmarkByOid[oid];

    // Optimistic UI
    setBookmarkByOid((m) => ({ ...m, [oid]: !prev }));

    // Toast loading
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
      // rollback
      setBookmarkByOid((m) => ({ ...m, [oid]: prev }));
      toast.error("Không thể cập nhật bookmark. Thử lại nhé!", { id: toastId });
    }
  };

  // ✅ open article + tăng view count
  const openArticle = (articleId) => {
    if (!articleId) return;

    // fire-and-forget
    Promise.resolve(IncreseArticleViewCount(articleId)).catch(() => {});
    navigate(`/article/${articleId}`);
  };

  // lấy id đúng cho từng tab
  const getArticleId = (item, isNewest) => {
    if (isNewest) return item?.oid || oidOf(item?._raw) || null;
    return oidOf(item) || item?.article_id || item?.slug || item?.id || null;
  };

  return (
    <section className="max-w-6xl mx-auto px-4 pt-6 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.2fr)_minmax(260px,1fr)] gap-10">
        <div>
          {/* Tabs */}
          <div
            ref={topRef}
            className="scroll-mt-24 flex gap-6 text-sm font-semibold tracking-wide text-slate-600 uppercase border-b border-slate-200"
          >
            <button
              type="button"
              onClick={() => setActiveTab("for-you")}
              className={`pb-2 relative ${
                activeTab === "for-you" ? "text-slate-900" : "hover:text-slate-800"
              }`}
            >
              Dành cho bạn
              {activeTab === "for-you" && (
                <span className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-sky-500 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("newest")}
              className={`pb-2 relative ${
                activeTab === "newest" ? "text-slate-900" : "hover:text-slate-800"
              }`}
            >
              Mới nhất
              {activeTab === "newest" && (
                <span className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-sky-500 rounded-full" />
              )}
            </button>
          </div>

          {activeTab === "newest" && loadingNewest && (
            <div className="py-6 text-sm text-slate-500">Đang tải bài viết mới nhất…</div>
          )}
          {activeTab === "newest" && !loadingNewest && errorNewest && (
            <div className="py-6 text-sm text-rose-600">{errorNewest}</div>
          )}

          {/* List */}
          <div>
            {currentList.map((item, idx) => {
              const isNewest = activeTab === "newest";

              const key = isNewest
                ? item?.oid || item?.title || `${startIndex + idx}`
                : item?.id || item?.slug || item?.title || `${startIndex + idx}`;

              const articleId = getArticleId(item, isNewest);

              return (
                <FeedArticleCard
                  key={key}
                  article={item}
                  articleId={articleId}
                  onOpenArticle={openArticle}
                  showBookmark={!!user} // ✅ chỉ hiện khi login
                  isBookmarked={isNewest ? !!bookmarkByOid[item?.oid] : !!item?.is_bookmarked}
                  onToggleBookmark={() => {
                    if (!isNewest) return;
                    handleToggleBookmarkNewest(item?.oid);
                  }}
                />
              );
            })}
          </div>

          {/* Pagination giống hình + Trước/Tiếp = <> */}
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

        {/* RIGHT topics */}
        <aside className="lg:sticky lg:top-28 self-start">
          <div className="px-3 py-3">
            <h3 className="text-sm font-semibold tracking-wide text-slate-900 uppercase mb-4">
              Chủ đề
            </h3>

            <div className="flex flex-wrap gap-3">
              {topics.map((topic) => {
                const slug = topic.slug || topic.id;
                const label = topic.name || topic.label || "Chủ đề";

                return (
                  <Link
                    key={slug}
                    to={`/category/${slug}`}
                    className="px-5 py-2 text-[14px] rounded-full border border-slate-300 bg-white text-slate-800 hover:border-sky-500 hover:text-sky-600 whitespace-nowrap"
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default MainFeed;
