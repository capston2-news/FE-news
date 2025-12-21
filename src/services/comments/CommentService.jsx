// src/services/Comment/AdminCommentService.jsx
import axios from "axios";

// ✅ helper unwrap: hỗ trợ API trả array hoặc {results: []} hoặc {data: []}
const unwrapList = (res) => {
    if (Array.isArray(res)) return res;
    const data = res?.data ?? res;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
};

const unwrapMeta = (res) => {
    const data = res?.data ?? res;
    return {
        total: data?.total ?? data?.count ?? null,
        page: data?.page ?? null,
        page_size: data?.page_size ?? null,
    };
};

/**
 * ✅ Bạn cần backend có các endpoint tương ứng:
 * GET    /api/admin/comments/?status=pending|approved|all&q=&page=&page_size=
 * PATCH  /api/admin/comments/<comment_id>/approve/   (hoặc PATCH /api/admin/comments/<id>/ với body {is_approved:true})
 * DELETE /api/admin/comments/<comment_id>/delete/
 */
export async function adminListComments(params = {}) {
    const {
        status = "pending", // pending | approved | all
        q = "",
        page = 1,
        page_size = 30,
    } = params;

    const res = await axios.get("/api/admin/comments/", {
        withCredentials: true,
        params: { status, q, page, page_size },
        headers: { "Content-Type": "application/json" },
    });

    return { results: unwrapList(res), meta: unwrapMeta(res) };
}

export async function adminApproveComment(commentId) {
    // ✅ Option A: endpoint approve riêng
    const res = await axios.patch(
        `/api/admin/comments/${commentId}/checked/`,
        {},
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
    );
    return res?.data ?? res;
}

export async function adminDeleteComment(commentId) {
    const res = await axios.delete(`/api/admin/comments/${commentId}/delete/`, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
    });
    return res?.data ?? res;
}
export async function adminRestoreComment(commentId) {
    if (!commentId) throw new Error("Missing comment id");

    const res = await axios.patch(
        `/api/admin/comments/${commentId}/restore/`,
        {},
        {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        }
    );

    return res?.data ?? res;
}

export const adminGetPendingCommentsCount = async ({ afterTs } = {}) => {
    const params = afterTs ? { after_ts: afterTs } : {};
    const res = await axios.get("/api/admin/comments/pending-count/", {
        withCredentials: true,
        params,
    });
    return Number(res?.data?.count ?? 0);
};