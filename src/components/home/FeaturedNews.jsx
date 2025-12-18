// src/components/home/FeaturedNews.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AddBookmark, RemoveBookmark } from "../../services/bookmark/BookmarkService";

// ✅ sửa path cho đúng nơi bạn đặt
import { IncreseArticleViewCount } from "../../services/article/ArticleService";
import toast from "react-hot-toast";

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

const FeaturedNews = ({ articles = [] }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const viewportRef = useRef(null);
  const dirRef = useRef(1);
  const timerRef = useRef(null);
  const roRef = useRef(null);

  const [visibleCount, setVisibleCount] = useState(4);
  const [index, setIndex] = useState(0);

  // bookmark state theo oid
  const [bookmarkMap, setBookmarkMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  // init bookmarkMap từ data API (item.is_bookmarked)
  useEffect(() => {
    const map = {};
    for (const item of articles) {
      const a = item?.article || {};
      const oid = a?._id?.$oid || a?._id || item?._id?.$oid || item?._id || item?.id;
      if (!oid) continue;
      map[String(oid)] = !!item?.is_bookmarked;
    }
    setBookmarkMap(map);
  }, [articles]);

  const maxIndex = useMemo(
    () => Math.max(0, articles.length - visibleCount),
    [articles.length, visibleCount]
  );

  const clampIndex = (i) => Math.max(0, Math.min(i, maxIndex));

  const measure = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const cards = viewport.querySelectorAll("[data-card]");
    if (!cards.length) return;

    const cardRect = cards[0].getBoundingClientRect();
    const viewRect = viewport.getBoundingClientRect();

    const cardWidth = cardRect.width || 1;
    const visible = Math.max(1, Math.floor(viewRect.width / cardWidth));
    setVisibleCount(visible);
  };

  useEffect(() => {
    measure();

    const viewport = viewportRef.current;
    if (!viewport) return;

    roRef.current?.disconnect?.();
    roRef.current = new ResizeObserver(() => requestAnimationFrame(measure));
    roRef.current.observe(viewport);

    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      roRef.current?.disconnect?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles.length]);

  // Khi index đổi -> scroll tới card tương ứng
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const clamped = clampIndex(index);
    if (clamped !== index) {
      setIndex(clamped);
      return;
    }

    const cards = viewport.querySelectorAll("[data-card]");
    if (!cards.length) return;

    const el = cards[Math.min(clamped, cards.length - 1)];
    viewport.scrollTo({ left: el.offsetLeft, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, visibleCount, maxIndex]);

  const stopAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const startAuto = () => {
    stopAuto();
    if (articles.length <= visibleCount) return;

    timerRef.current = setInterval(() => {
      setIndex((prev) => {
        let next = prev + dirRef.current;

        if (next > maxIndex) {
          dirRef.current = -1;
          next = Math.max(maxIndex - 1, 0);
        } else if (next < 0) {
          dirRef.current = 1;
          next = 0;
        }
        return next;
      });
    }, 5000);
  };

  useEffect(() => {
    startAuto();
    return stopAuto;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles.length, visibleCount, maxIndex]);

  const handlePrev = () => {
    dirRef.current = -1;
    setIndex((i) => clampIndex(i - 1));
  };

  const handleNext = () => {
    dirRef.current = 1;
    setIndex((i) => clampIndex(i + 1));
  };

  // ✅ click card -> navigate + (nếu login) tăng view count
  const goArticle = (oidOrId) => {
    if (!oidOrId) return;

    // chỉ khi login mới tăng view count
    if (user) {
      Promise.resolve(IncreseArticleViewCount(String(oidOrId))).catch(() => {});
    }

    navigate(`/article/${oidOrId}`);
  };

const toggleBookmark = async (oid) => {
  const key = String(oid || "");
  if (!key) return;
  if (loadingMap[key]) return;

  const current = !!bookmarkMap[key];
  const next = !current;

  // optimistic update
  setBookmarkMap((prev) => ({ ...prev, [key]: next }));
  setLoadingMap((prev) => ({ ...prev, [key]: true }));

  const toastId = toast.loading(next ? "Đang lưu bài..." : "Đang bỏ lưu...");

  try {
    if (current) await RemoveBookmark(key);
    else await AddBookmark(key);

    toast.success(next ? "Đã lưu bài" : "Đã bỏ lưu", { id: toastId });
  } catch (err) {
    // rollback nếu lỗi
    setBookmarkMap((prev) => ({ ...prev, [key]: current }));
    toast.error("Có lỗi xảy ra, thử lại nhé!", { id: toastId });
    console.error("Bookmark failed:", err);
  } finally {
    setLoadingMap((prev) => ({ ...prev, [key]: false }));
  }
};

  if (!articles.length) return null;

  return (
    <section className="bg-sky-50/50 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-baseline gap-4 mb-4">
          <h2 className="text-[15px] md:text-base font-semibold text-slate-900 uppercase tracking-wide">
            Nổi bật trong tháng
          </h2>
        </div>

        <div className="relative">
          <div
            ref={viewportRef}
            className="overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth"
            onMouseEnter={stopAuto}
            onMouseLeave={startAuto}
          >
            <div className="flex">
              {articles.map((item, idx) => {
                const a = item?.article || {};

                const oid =
                  a?._id?.$oid || a?._id || item?._id?.$oid || item?._id || item?.id;

                const key = String(oid || a?.title || idx);

                const title = a?.title || "Tiêu đề bài viết";
                const img = pickFirstImage(a?.images || a?.image);
                const published = a?.published_at?.$date || a?.published_at || "";
                const dateText = formatDateVi(published);
                const categoryName = a?.category_name || "Chuyên mục";

                const isSaved = !!bookmarkMap[String(oid)];
                const isLoading = !!loadingMap[String(oid)];

                return (
                  <article
                    key={key}
                    data-card
                    className="flex-shrink-0 basis-full sm:basis-1/2 lg:basis-1/4"
                  >
                    <div className="px-3">
                      <div
                        onClick={() => goArticle(oid)}
                        role="button"
                        tabIndex={0}
                        className="group cursor-pointer overflow-hidden rounded-[10px] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
                      >
                        <div className="relative aspect-[4/3] bg-slate-200">
                          <img
                            src={
                              img ||
                              "https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg"
                            }
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                            loading="lazy"
                            onLoad={() => requestAnimationFrame(measure)}
                          />

                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />

                          {/* ✅ chỉ hiện bookmark khi đã login */}
                          {user && (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={(e) => {
                                e.stopPropagation(); // không cho click lan lên card
                                toggleBookmark(oid);
                              }}
                              className={`absolute cursor-pointer right-3 top-3 grid h-10 w-10 place-items-center rounded-full border backdrop-blur transition
                                ${
                                  isSaved
                                    ? "bg-sky-600 border-sky-600 text-white shadow-md"
                                    : "bg-white/80 border-white/60 text-slate-700 hover:bg-white"
                                }
                                ${isLoading ? "opacity-60 cursor-not-allowed" : ""}
                              `}
                              aria-label="Lưu bài viết"
                            >
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill={isSaved ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                              </svg>
                            </button>
                          )}

                          <div className="absolute left-3 bottom-3">
                            <span className="inline-flex items-center rounded-full bg-white/85 backdrop-blur px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-800">
                              {categoryName}
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center gap-2 text-[12px] text-slate-500">
                            <span>{dateText || ""}</span>
                          </div>

                          <h3 className="mt-2 text-[16px] md:text-[17px] font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-sky-700 transition-colors">
                            {title}
                          </h3>

                          <div className="mt-3 text-[11px] uppercase tracking-wide text-slate-400">
                            {categoryName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {articles.length > visibleCount && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="hidden cursor-pointer md:flex absolute left-0 top-1/3 -translate-y-1/2 -translate-x-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 items-center justify-center hover:bg-slate-50"
              >
                <svg
                  className="w-4 h-4 text-slate-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="hidden md:flex cursor-pointer absolute right-0 top-1/3 -translate-y-1/2 translate-x-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 items-center justify-center hover:bg-slate-50"
              >
                <svg
                  className="w-4 h-4 text-slate-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedNews;
