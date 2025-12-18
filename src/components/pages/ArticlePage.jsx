// src/components/pages/ArticlePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

// Services
import {
  getArticleById,
  IncreseArticleViewCount,
  getArticleExpectForArticleById,
} from "../../services/article/ArticleService";
import { AddBookmark, RemoveBookmark } from "../../services/bookmark/BookmarkService";
import { getCommentsByArticleId } from "../../services/comment/CommentService"; // ✅ thêm

// Components + hook + utils
import ArticleBody from "./article/ArticleBody";
import ArticleComments from "./article/ArticleComments";
import ArticleHorizontalNews from "./article/ArticleHorizontalNews";
import useArticleSpeak from "./article/useArticleSpeak";
import {
  norm,
  pickFirstImage,
  formatDateVi,
  normalizeArticleDetail,
  buildRichBlocks,
  oidOf,
} from "./article/ArticleUtils";

const SCROLL_OFFSET = 90;

const ArticlePage = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const commentsRef = useRef(null);
  const articleBodyRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [articleRaw, setArticleRaw] = useState(null);

  const [showActions, setShowActions] = useState(false);

  // bookmark state
  const [bookmarked, setBookmarked] = useState(false);

  // ✅ Horizontal list
  const [moreNews, setMoreNews] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  // ✅ Comments state (tách riêng)
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // =========================
  // 1) Load article detail
  // =========================
  useEffect(() => {
    const load = async () => {
      if (!articleId) return;

      setLoading(true);
      setErrorText("");
      try {
        const res = await getArticleById(articleId);
        const data = res;
        if (!data) throw new Error("No data");

        setArticleRaw(data);
        setBookmarked(!!data?.is_bookmarked);
      } catch {
        setArticleRaw(null);
        setErrorText("Không tìm thấy bài viết.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [articleId]);

  // =========================
  // 2) Load comments by articleId
  // =========================
  const reloadComments = async () => {
    if (!articleId) return;

    setLoadingComments(true);
    try {
      const res = await getCommentsByArticleId(articleId);

      // bạn nói API trả về dạng mảng:
      // [
      //   { username, content, created_at: { $date: ... } }
      // ]
      const list =
        Array.isArray(res) ? res : [];

      setComments(list);
    } catch (e) {
      setComments([]);
      toast.error("Không tải được bình luận.");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    reloadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  // scroll action show/hide
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setShowActions(y > 120);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const article = useMemo(() => {
    if (!articleRaw) return null;
    return normalizeArticleDetail(articleRaw);
  }, [articleRaw]);

  // split content -> paragraphs
  const paragraphs = useMemo(() => {
    const c = article?.content;
    if (!c) return [];
    if (Array.isArray(c)) return c.map((x) => norm(x)).filter(Boolean);

    return String(c)
      .split(/\n+/)
      .map((p) => norm(p))
      .filter(Boolean);
  }, [article?.content]);

  const { hero, blocks } = useMemo(() => {
    return buildRichBlocks(paragraphs, article?.images || []);
  }, [paragraphs, article?.images]);

  const heroImg = useMemo(() => {
    return hero || pickFirstImage(article?.images);
  }, [hero, article?.images]);

  const dateText = useMemo(() => {
    const d = article?.published_at || article?.created_at || "";
    return d ? formatDateVi(d) : "";
  }, [article?.published_at, article?.created_at]);

  // Speak hook
  const { isSpeaking, toggleSpeak } = useArticleSpeak({
    blocks,
    title: article?.title,
    articleBodyRef,
  });

  // ✅ scroll to comments with offset
  const handleScrollToComments = () => {
    const el = commentsRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // bookmark toggle
  const handleToggleBookmark = async () => {
    if (!article?.oid) return;

    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu bài.");
      navigate("/login");
      return;
    }

    const prev = bookmarked;
    setBookmarked(!prev);

    const toastId = toast.loading(prev ? "Đang bỏ lưu..." : "Đang lưu bài...");

    try {
      if (!prev) {
        const ok = await AddBookmark(article.oid);
        if (!ok) throw new Error("AddBookmark failed");
        toast.success("Đã lưu bài", { id: toastId });
      } else {
        const ok = await RemoveBookmark(article.oid);
        if (!ok) throw new Error("RemoveBookmark failed");
        toast.success("Đã bỏ lưu", { id: toastId });
      }
    } catch {
      setBookmarked(prev);
      toast.error("Không thể cập nhật bookmark. Thử lại nhé!", { id: toastId });
    }
  };

  // ✅ Load horizontal news list (except current article)
  useEffect(() => {
    const loadMore = async () => {
      if (!articleId) return;

      setLoadingMore(true);
      try {
        const res = await getArticleExpectForArticleById(articleId, 10);

        const arr = Array.isArray(res) ? res : [];

        const mapped = arr
          .map((a) => ({
            id: oidOf(a),
            title: a?.title || "",
            image: pickFirstImage(a?.images),
          }))
          .filter((x) => x.id && x.title && x.id !== articleId)
          .slice(0, 10);

        setMoreNews(mapped);
      } catch {
        setMoreNews([]);
      } finally {
        setLoadingMore(false);
      }
    };

    loadMore();
  }, [articleId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-sm text-slate-500">
        Đang tải bài viết…
      </div>
    );
  }

  if (errorText || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-sm text-slate-600">{errorText || "Không tìm thấy bài viết."}</p>
        <Link to="/" className="mt-3 inline-flex items-center text-sm text-sky-600 hover:text-sky-700">
          ← Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-0 py-6 lg:py-10">
      {/* Breadcrumb */}
      <div className="mb-4 text-[11px] md:text-xs text-slate-500 flex flex-wrap items-center gap-1">
        <Link to="/" className="hover:text-sky-600 hover:underline">
          Trang chủ
        </Link>
        <span>/</span>

        {article.category_slug ? (
          <Link to={`/category/${article.category_slug}`} className="hover:text-sky-600 hover:underline">
            {article.category_name || "Chuyên mục"}
          </Link>
        ) : (
          <span>{article.category_name || "Chuyên mục"}</span>
        )}

        {article.category_child_slug && (
          <>
            <span>/</span>
            <Link
              to={`/category/${article.category_slug}/${article.category_child_slug}`}
              className="hover:text-sky-600 hover:underline"
            >
              {article.category_child_name || "Chủ đề"}
            </Link>
          </>
        )}
      </div>

      <div className="flex justify-center">
        {/* LEFT actions (desktop) */}
        <div className="hidden md:block">
          <div className="relative h-full">
            <div
              className={
                "sticky top-1/2 -translate-y-1/2 flex flex-col items-center gap-5 text-sky-700 transition-opacity duration-300 " +
                (showActions ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
              }
            >
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-700">
                {String(article.site || "N")[0].toUpperCase()}
              </div>

              {user && (
                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  className={
                    "w-12 h-12 flex items-center justify-center rounded-full border transition " +
                    (bookmarked
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-sky-200 bg-transparent text-sky-700 hover:bg-sky-50")
                  }
                  aria-label="Lưu bài viết"
                  title="Lưu bài"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill={bookmarked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              )}

              <button
                type="button"
                onClick={handleScrollToComments}
                className="flex flex-col items-center gap-1"
                title="Bình luận"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full border border-sky-200 hover:bg-sky-50">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
              </button>

              <button
                type="button"
                onClick={toggleSpeak}
                className={
                  "w-12 h-12 flex items-center justify-center rounded-full border transition " +
                  (isSpeaking
                    ? "border-sky-500 bg-sky-500 text-white"
                    : "border-sky-200 bg-transparent text-sky-700 hover:bg-sky-50")
                }
                aria-label={isSpeaking ? "Tạm dừng đọc" : "Đọc nội dung"}
                title={isSpeaking ? "Tạm dừng" : "Đọc nội dung"}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {isSpeaking ? (
                    <>
                      <rect x="7" y="5" width="3" height="14" />
                      <rect x="14" y="5" width="3" height="14" />
                    </>
                  ) : (
                    <polygon points="6 4 18 12 6 20 6 4" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 max-w-3xl w-full mx-auto">
          <ArticleBody
            articleBodyRef={articleBodyRef}
            article={article}
            dateText={dateText}
            heroImg={heroImg}
            paragraphs={paragraphs}
            blocks={blocks}
          />

          {/* ✅ Horizontal news list */}
          {loadingMore ? (
            <div className="mt-6 text-sm text-slate-500">Đang tải tin tức khác…</div>
          ) : (
            <ArticleHorizontalNews
              title="Tin tức khác"
              items={moreNews}
              onOpen={(id) => {
                Promise.resolve(IncreseArticleViewCount(id)).catch(() => {});
                navigate(`/article/${id}`);
              }}
            />
          )}

          {/* ✅ Comments fetched by API */}
          {loadingComments && (
            <div className="mt-6 text-sm text-slate-500">Đang tải bình luận…</div>
          )}

          <ArticleComments
            user={user}
            articleId={article?.oid || articleId} // ✅ fallback dùng param
            comments={comments}
            commentsRef={commentsRef}
            onRequireLogin={() => navigate("/login")}
            onReloadComments={reloadComments} // ✅ để post xong reload list
          />
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
