// src/components/pages/article/ArticleComments.jsx
import React, { useState } from "react";
import { formatDateVi, timeAgoVi } from "./ArticleUtils";
import { postComment } from "../../../services/comment/CommentService";
import toast from "react-hot-toast";

export default function ArticleComments({
  user,
  articleId,
  comments = [],
  commentsRef,
  onRequireLogin,
  onReloadComments, // ✅ thêm prop này từ ArticlePage
}) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleComment = async () => {
    const content = (comment || "").trim();

    if (!user) return onRequireLogin?.();
    if (!articleId) return toast.error("Thiếu articleId.");
    if (!content) return toast.error("Bạn chưa nhập nội dung bình luận.");

    setSubmitting(true);
    const toastId = toast.loading("Đang gửi bình luận...");

    try {
      await postComment(articleId, content);

      toast.success("Đã gửi bình luận", { id: toastId });
      setComment("");

      // ✅ reload list comment để hiển thị comment mới
      await Promise.resolve(onReloadComments?.());
    } catch (e) {
      toast.error("Gửi bình luận thất bại. Thử lại nhé!", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // key cho comment không có _id (dữ liệu bạn đưa không có _id)
  const commentKey = (c, idx) => {
    const d = c?.created_at?.$date || c?.created_at || "";
    return `${c?.username || "u"}-${d || "t"}-${idx}`;
  };

  return (
    <section ref={commentsRef} className="mt-8 pt-8 border-t border-slate-200">
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
        {comments.length ? (
          comments.map((c, idx) => {
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
          <p></p>
        )}
      </div>
    </section>
  );
}
