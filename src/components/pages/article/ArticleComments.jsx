// src/components/pages/article/ArticleComments.jsx
import React, { useEffect, useMemo, useState } from "react";
import { timeAgoVi } from "./ArticleUtils";
import { postComment } from "../../../services/comment/CommentService";
import toast from "react-hot-toast";

const AUTO_CLOSE_MS = 3000;

const isTrue = (v) => v === true || v === 1 || v === "1" || v === "true";

export default function ArticleComments({
  user,
  articleId,
  comments = [],
  commentsRef,
  onRequireLogin,
  onReloadComments,
}) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ modal success
  const [successOpen, setSuccessOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!successOpen) return;

    // reset countdown mỗi lần mở
    setCountdown(3);

    const started = Date.now();
    const tick = setInterval(() => {
      const leftMs = Math.max(0, AUTO_CLOSE_MS - (Date.now() - started));
      setCountdown(Math.max(1, Math.ceil(leftMs / 1000)));
    }, 200);

    const t = setTimeout(() => setSuccessOpen(false), AUTO_CLOSE_MS);

    return () => {
      clearTimeout(t);
      clearInterval(tick);
    };
  }, [successOpen]);

  // ✅ chỉ hiển thị comment khi is_checked: true
  const visibleComments = useMemo(() => {
    return (comments || []).filter((c) => isTrue(c?.is_checked));
  }, [comments]);

  const handleComment = async () => {
    const content = (comment || "").trim();

    if (!user) return onRequireLogin?.();
    if (!articleId) return toast.error("Thiếu articleId.");
    if (!content) return toast.error("Bạn chưa nhập nội dung bình luận.");

    setSubmitting(true);
    const toastId = toast.loading("Đang gửi bình luận...");

    try {
      await postComment(articleId, content);

      // ✅ bỏ toast success, thay bằng modal giống ảnh
      toast.dismiss(toastId);
      setComment("");
      setSuccessOpen(true);

      // ✅ reload để lấy trạng thái mới (nếu backend trả về comment đã duyệt)
      await Promise.resolve(onReloadComments?.());
    } catch (e) {
      toast.error("Gửi bình luận thất bại. Thử lại nhé!", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // key cho comment không có _id
  const commentKey = (c, idx) => {
    const d = c?.created_at?.$date || c?.created_at || "";
    return `${c?.username || "u"}-${d || "t"}-${idx}`;
  };

  return (
    <section ref={commentsRef} className="mt-8 pt-8 border-t border-slate-200">
      {/* ✅ Modal success */}
      {successOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSuccessOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-md shadow-lg border border-slate-200">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setSuccessOpen(false)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              ✕
            </button>

            <div className="px-6 py-7">
              <h4 className="text-xl font-semibold text-slate-900 text-center">
                Gửi bình luận thành công
              </h4>
              <p className="mt-3 text-slate-700 text-center">
                Bình luận của bạn đang được xét duyệt.
              </p>
              <p className="mt-2 text-slate-400 text-center text-sm">
                Tự động đóng sau {countdown}s
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center mb-3 gap-2">
        <span className="w-1 h-7 md:h-8 bg-sky-600" />
        <h3 className="text-xl md:text-2xl font-semibold text-black leading-none">
          Bình luận
        </h3>
      </div>

      {/* form */}
      {user ? (
        <div>
          <textarea
            rows={3}
            value={comment}
            className="w-full border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleComment}
              disabled={submitting}
              className="px-4 py-1.5 rounded-sm bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? "Đang gửi..." : "Gửi bình luận"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 text-sm text-slate-600">
          Bạn cần{" "}
          <button
            className="text-sky-600 hover:underline cursor-pointer"
            onClick={onRequireLogin}
          >
            đăng nhập
          </button>{" "}
          để bình luận.
        </div>
      )}

      {/* list comments */}
      <div className="space-y-4 text-sm">
        {visibleComments.length ? (
          visibleComments.map((c, idx) => {
            const cDate = c?.created_at?.$date || c?.created_at;
            return (
              <div key={commentKey(c, idx)} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                  {String(c?.username || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-black">
                    {c?.username || "User"}
                    {cDate && (
                      <span className="ml-2 text-xs text-slate-500">
                        {timeAgoVi(cDate)}
                      </span>
                    )}
                  </p>
                  <p className="text-slate-700">{c?.content || ""}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-slate-500 text-sm">Chưa có bình luận.</p>
        )}
      </div>
    </section>
  );
}
