// src/components/admin/CommentModeration.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
        adminApproveComment,
        adminDeleteComment,
        adminListComments,
        adminRestoreComment,
} from "../../services/comments/CommentService.jsx";

import restoreIcon from "../../../public/img/restore.png";
import tick from "../../../public/img/send-submit-1.png";

const LS_KEY = "pending_comments_last_seen_ts";

// ---------- helpers ----------
const toId = (v) => {
        if (!v) return "";
        if (typeof v === "string") return v;
        if (typeof v === "object" && v.$oid) return v.$oid;
        if (typeof v === "object" && v._id && v._id.$oid) return v._id.$oid;
        try {
                return String(v);
        } catch {
                return "";
        }
};

const clamp = (s, n = 220) => {
        const t = String(s ?? "");
        if (t.length <= n) return t;
        return t.slice(0, n).trim() + "…";
};

// ✅ parse time robustly
const toTimeMs = (v) => {
        if (v == null) return 0;

        let raw = v;

        // Mongo extjson: { $date: ... }
        if (typeof raw === "object" && raw.$date != null) raw = raw.$date;

        // Mongo extjson: { $date: { $numberLong: "..." } }
        if (typeof raw === "object" && raw?.$numberLong) raw = raw.$numberLong;

        // number / numeric string (ms or sec)
        if (
            typeof raw === "number" ||
            (typeof raw === "string" && /^\d+$/.test(raw.trim()))
        ) {
                const n = Number(raw);
                if (!Number.isFinite(n)) return 0;
                return n < 1e12 ? n * 1000 : n; // seconds -> ms
        }

        // string dạng "YYYY-MM-DD HH:mm:ss" (không timezone) => ép UTC
        if (typeof raw === "string") {
                const s = raw.trim();

                if (
                    /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(s) &&
                    !/[zZ]|([+-]\d{2}:\d{2})$/.test(s)
                ) {
                        const iso = s.replace(" ", "T") + "Z";
                        const t = Date.parse(iso);
                        return Number.isFinite(t) ? t : 0;
                }

                const t = Date.parse(s);
                return Number.isFinite(t) ? t : 0;
        }

        const d = new Date(raw);
        const t = d.getTime();
        return Number.isFinite(t) ? t : 0;
};

// ✅ show VN time regardless of client timezone
const fmtTime = (v) => {
        const t = toTimeMs(v);
        if (!t) return "";

        return new Intl.DateTimeFormat("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
        }).format(new Date(t));
};

function ConfirmModal({ open, title, desc, onClose, onConfirm, loading }) {
        if (!open) return null;
        return (
            <div className="fixed inset-0 z-[999]">
                    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border overflow-hidden">
                                    <div className="px-4 py-3 border-b flex items-center justify-between">
                                            <div className="font-semibold text-gray-800">{title}</div>
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="px-2 py-1 rounded-lg hover:bg-gray-100 text-gray-600"
                                            >
                                                    ✕
                                            </button>
                                    </div>
                                    <div className="p-4 text-sm text-gray-700">{desc}</div>
                                    <div className="px-4 py-3 border-t bg-gray-50 flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                disabled={loading}
                                                className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-60"
                                            >
                                                    Huỷ
                                            </button>
                                            <button
                                                type="button"
                                                onClick={onConfirm}
                                                disabled={loading}
                                                className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
                                            >
                                                    {loading ? "Đang xoá..." : "Xoá"}
                                            </button>
                                    </div>
                            </div>
                    </div>
            </div>
        );
}

const TabBtn = ({ active, children, ...props }) => (
    <button
        type="button"
        className={[
                "px-3 py-2 rounded-full text-sm font-semibold border transition",
                active
                    ? "bg-[#0194F3] text-white border-[#0194F3]"
                    : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200",
        ].join(" ")}
        {...props}
    >
            {children}
    </button>
);

const MiniBtn = ({ tone = "gray", className = "", ...props }) => {
        const base =
            "inline-flex items-center gap-1.5 text-[14px] font-semibold px-3 py-2 rounded-full border transition disabled:opacity-60 disabled:cursor-not-allowed";
        const tones = {
                gray: "bg-white hover:bg-gray-50 text-gray-700 border-gray-200",
                blue: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600",
                red: "bg-red-600 hover:bg-red-700 text-white border-red-600",
                green: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600",
        };
        return (
            <button
                type="button"
                className={`${base} ${tones[tone]} ${className}`}
                {...props}
            />
        );
};

const IconBtn = ({ title, disabled, onClick, children, className = "" }) => (
    <button
        type="button"
        title={title}
        onClick={onClick}
        disabled={disabled}
        className={[
                "p-1 rounded-lg hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition",
                className,
        ].join(" ")}
    >
            {children}
    </button>
);

export default function CommentModeration() {
        const [status, setStatus] = useState("pending"); // pending | approved | deleted | all
        const [q, setQ] = useState("");
        const [debouncedQ, setDebouncedQ] = useState("");
        const [page, setPage] = useState(1);
        const pageSize = 30;

        const [loading, setLoading] = useState(true);
        const [err, setErr] = useState(null);

        const [rows, setRows] = useState([]);
        const [meta, setMeta] = useState({ total: null, page: null, page_size: null });

        const [selected, setSelected] = useState({}); // {id: true}
        const selectedIds = useMemo(
            () => Object.keys(selected).filter((k) => selected[k]),
            [selected]
        );

        const [acting, setActing] = useState(false);
        const [confirmDel, setConfirmDel] = useState({ open: false, id: null });

        // ✅ Mark "seen"
        useEffect(() => {
                const markSeen = () => {
                        const now = Date.now();
                        localStorage.setItem(LS_KEY, String(now));
                        window.dispatchEvent(new Event("comments:seen"));
                };
                markSeen();
                return () => markSeen();
        }, []);

        // ✅ debounce search (không gọi load trực tiếp để tránh stale page)
        useEffect(() => {
                const t = setTimeout(() => {
                        setPage(1);
                        setDebouncedQ(q);
                }, 350);
                return () => clearTimeout(t);
        }, [q]);

        // ✅ map by id
        const rowById = useMemo(() => {
                const m = {};
                rows.forEach((r) => (m[r.id] = r));
                return m;
        }, [rows]);

        // ✅ filter + sort newest first ALWAYS
        const displayRows = useMemo(() => {
                let arr = rows;

                if (status === "pending") {
                        arr = rows.filter((r) => !r.is_deleted && !r.is_checked);
                } else if (status === "approved") {
                        arr = rows.filter((r) => !r.is_deleted && r.is_checked);
                } else if (status === "deleted") {
                        arr = rows.filter((r) => r.is_deleted);
                } else {
                        arr = rows;
                }

                return [...arr].sort((a, b) => {
                        const bt = b.created_ms || 0;
                        const at = a.created_ms || 0;
                        if (bt !== at) return bt - at;
                        return String(b.id).localeCompare(String(a.id));
                });
        }, [rows, status]);

        const selectedDeletedIds = useMemo(
            () => selectedIds.filter((id) => rowById[id]?.is_deleted),
            [selectedIds, rowById]
        );

        const selectedNotDeletedIds = useMemo(
            () => selectedIds.filter((id) => !rowById[id]?.is_deleted),
            [selectedIds, rowById]
        );

        const load = useCallback(async () => {
                setLoading(true);
                setErr(null);

                try {
                        const { results, meta } = await adminListComments({
                                status,
                                q: debouncedQ,
                                page,
                                page_size: pageSize,
                        });

                        const cleaned = (Array.isArray(results) ? results : []).map((c) => {
                                const created_at = c?.created_at ?? c?.createdAt ?? c?.created ?? null;

                                // ✅ ưu tiên backend trả created_at_ms
                                const created_ms = c?.created_at_ms ?? c?.created_ms ?? toTimeMs(created_at);

                                return {
                                        id: toId(c?._id) || toId(c?.id),
                                        content: c?.content ?? c?.text ?? c?.message ?? "",
                                        created_at,
                                        created_ms,
                                        is_checked: Boolean(c?.is_checked ?? c?.isApproved),
                                        is_deleted: Boolean(c?.is_deleted ?? c?.isDeleted),
                                        user_name:
                                            c?.user_name ??
                                            c?.username ??
                                            c?.user?.full_name ??
                                            c?.user?.username ??
                                            "",
                                        user_id: toId(c?.user_id ?? c?.userId ?? c?.user?._id),
                                        article_title: c?.article_title ?? c?.article?.title ?? "",
                                        article_id: toId(c?.article_id ?? c?.articleId ?? c?.article?._id),
                                };
                        });

                        setRows(cleaned.filter((x) => x.id));
                        setMeta(meta || {});
                        setSelected({});
                } catch (e) {
                        console.error(e);
                        setErr(
                            e?.response?.data?.detail ||
                            e?.message ||
                            "Không tải được danh sách comment."
                        );
                        setRows([]);
                        setSelected({});
                } finally {
                        setLoading(false);
                }
        }, [status, debouncedQ, page]);

        useEffect(() => {
                load();
        }, [load]);

        const toggleAll = (checked) => {
                if (!checked) return setSelected({});
                const next = {};
                displayRows.forEach((r) => (next[r.id] = true));
                setSelected(next);
        };

        const toggleOne = (id) => {
                setSelected((m) => ({ ...m, [id]: !m[id] }));
        };

        const approveOne = async (id) => {
                if (!id) return;
                setActing(true);
                try {
                        await adminApproveComment(id);
                        toast.success("Đã đăng comment");
                        window.dispatchEvent(new Event("comments:changed"));

                        setRows((prev) =>
                            prev.map((x) => (x.id === id ? { ...x, is_checked: true } : x))
                        );
                        if (status === "pending") setSelected((m) => ({ ...m, [id]: false }));
                } catch (e) {
                        console.error(e);
                        toast.error(e?.response?.data?.detail || e?.message || "Duyệt comment thất bại");
                } finally {
                        setActing(false);
                }
        };

        const deleteOne = async (id) => {
                if (!id) return;
                setActing(true);
                try {
                        await adminDeleteComment(id);
                        toast.success("Đã xoá comment");
                        window.dispatchEvent(new Event("comments:changed"));

                        setRows((prev) =>
                            prev.map((x) => (x.id === id ? { ...x, is_deleted: true } : x))
                        );
                        setSelected((m) => {
                                const n = { ...m };
                                delete n[id];
                                return n;
                        });
                } catch (e) {
                        console.error(e);
                        toast.error(e?.response?.data?.detail || e?.message || "Xoá comment thất bại");
                } finally {
                        setActing(false);
                }
        };

        // ✅ RESTORE => đưa về CHỜ DUYỆT (pending): is_deleted=false & is_checked=false
        const restoreOne = async (id) => {
                if (!id) return;
                setActing(true);
                try {
                        const updated = await adminRestoreComment(id);
                        toast.success("Đã khôi phục (chờ duyệt)");
                        window.dispatchEvent(new Event("comments:changed"));

                        // nếu backend trả comment, ưu tiên sync theo backend
                        const backendIsChecked = Boolean(updated?.is_checked ?? updated?.isApproved ?? false);

                        setRows((prev) =>
                            prev.map((x) =>
                                x.id === id
                                    ? {
                                            ...x,
                                            is_deleted: false,
                                            is_checked: backendIsChecked, // backend restore đã set False
                                    }
                                    : x
                            )
                        );

                        setSelected((m) => {
                                const n = { ...m };
                                delete n[id];
                                return n;
                        });

                        // ✅ auto chuyển sang tab pending để thấy comment vừa restore
                        setStatus("pending");
                        setPage(1);
                } catch (e) {
                        console.error(e);
                        toast.error(e?.response?.data?.detail || e?.message || "Khôi phục thất bại");
                } finally {
                        setActing(false);
                }
        };

        const bulkApprove = async () => {
                const ids = selectedNotDeletedIds.filter((id) => !rowById[id]?.is_checked);
                if (ids.length === 0) return;

                setActing(true);
                try {
                        for (const id of ids) await adminApproveComment(id);
                        toast.success(`Đã đăng ${ids.length} comment`);
                        window.dispatchEvent(new Event("comments:changed"));

                        setRows((prev) =>
                            prev.map((x) => (ids.includes(x.id) ? { ...x, is_checked: true } : x))
                        );
                        setSelected({});
                } catch (e) {
                        console.error(e);
                        toast.error(e?.response?.data?.detail || e?.message || "Duyệt hàng loạt thất bại");
                } finally {
                        setActing(false);
                }
        };

        const bulkDelete = async () => {
                const ids = selectedNotDeletedIds;
                if (ids.length === 0) return;

                setActing(true);
                try {
                        for (const id of ids) await adminDeleteComment(id);
                        toast.success(`Đã xoá ${ids.length} comment`);
                        window.dispatchEvent(new Event("comments:changed"));

                        setRows((prev) =>
                            prev.map((x) => (ids.includes(x.id) ? { ...x, is_deleted: true } : x))
                        );
                        setSelected({});
                } catch (e) {
                        console.error(e);
                        toast.error(e?.response?.data?.detail || e?.message || "Xoá hàng loạt thất bại");
                } finally {
                        setActing(false);
                }
        };

        // ✅ BULK RESTORE => đưa về CHỜ DUYỆT
        const bulkRestore = async () => {
                const ids = selectedDeletedIds;
                if (ids.length === 0) return;

                setActing(true);
                try {
                        for (const id of ids) await adminRestoreComment(id);
                        toast.success(`Đã khôi phục ${ids.length} comment (chờ duyệt)`);
                        window.dispatchEvent(new Event("comments:changed"));

                        setRows((prev) =>
                            prev.map((x) =>
                                ids.includes(x.id)
                                    ? { ...x, is_deleted: false, is_checked: false }
                                    : x
                            )
                        );
                        setSelected({});

                        // ✅ auto chuyển sang pending
                        setStatus("pending");
                        setPage(1);
                } catch (e) {
                        console.error(e);
                        toast.error(e?.response?.data?.detail || e?.message || "Khôi phục hàng loạt thất bại");
                } finally {
                        setActing(false);
                }
        };

        const statsText = useMemo(() => `Đang hiển thị: ${displayRows.length}`, [displayRows.length]);

        return (
            <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                                    <h2 className="text-2xl font-semibold text-gray-900">Duyệt bình luận</h2>
                                    <div className="text-lg text-[#0194F3] font-semibold mt-1 flex">{statsText}</div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                    <TabBtn
                                        active={status === "pending"}
                                        onClick={() => {
                                                setStatus("pending");
                                                setPage(1);
                                        }}
                                    >
                                            Chờ duyệt
                                    </TabBtn>
                                    <TabBtn
                                        active={status === "approved"}
                                        onClick={() => {
                                                setStatus("approved");
                                                setPage(1);
                                        }}
                                    >
                                            Đã đăng
                                    </TabBtn>
                                    <TabBtn
                                        active={status === "deleted"}
                                        onClick={() => {
                                                setStatus("deleted");
                                                setPage(1);
                                        }}
                                    >
                                            Đã xoá
                                    </TabBtn>
                                    <TabBtn
                                        active={status === "all"}
                                        onClick={() => {
                                                setStatus("all");
                                                setPage(1);
                                        }}
                                    >
                                            Tất cả
                                    </TabBtn>
                            </div>
                    </div>

                    {/* Search + bulk */}
                    <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Tìm theo nội dung / người dùng / tiêu đề bài viết..."
                                className="w-full md:w-[520px] border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-200"
                            />

                            <div className="flex items-center gap-2">
                                    <MiniBtn tone="gray" onClick={load} disabled={loading || acting}>
                                            ↻ Tải lại
                                    </MiniBtn>

                                    <MiniBtn
                                        tone="green"
                                        onClick={bulkApprove}
                                        disabled={acting || selectedNotDeletedIds.length === 0 || status === "deleted"}
                                        className="whitespace-nowrap"
                                    >
                                            ✅ Đăng ({selectedNotDeletedIds.length})
                                    </MiniBtn>

                                    <MiniBtn
                                        tone="red"
                                        onClick={bulkDelete}
                                        disabled={acting || selectedNotDeletedIds.length === 0 || status === "deleted"}
                                        className="whitespace-nowrap"
                                    >
                                            🗑️ Xoá ({selectedNotDeletedIds.length})
                                    </MiniBtn>

                                    {(status === "deleted" || status === "all") && (
                                        <MiniBtn
                                            tone="blue"
                                            onClick={bulkRestore}
                                            disabled={acting || selectedDeletedIds.length === 0}
                                            className="whitespace-nowrap"
                                        >
                                                ↩️ Khôi phục ({selectedDeletedIds.length})
                                        </MiniBtn>
                                    )}
                            </div>
                    </div>

                    {/* Content */}
                    <div className="mt-4">
                            {loading ? (
                                <div className="text-gray-600">Đang tải comment...</div>
                            ) : err ? (
                                <div className="text-red-600">{err}</div>
                            ) : displayRows.length === 0 ? (
                                <div className="text-gray-500">Không có comment phù hợp.</div>
                            ) : (
                                <div className="bg-white border overflow-hidden">
                                        {/* table header */}
                                        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b text-[18px] font-semibold text-gray-700 bg-white rounded-xl shadow-sm overflow-hidden">
                                                <div className="col-span-1 flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={displayRows.length > 0 && selectedIds.length === displayRows.length}
                                                            onChange={(e) => toggleAll(e.target.checked)}
                                                        />
                                                </div>
                                                <div className="col-span-5">Nội dung</div>
                                                <div className="col-span-2">Người dùng</div>
                                                <div className="col-span-3">Bài viết</div>
                                                <div className="col-span-1 text-right">Thao tác</div>
                                        </div>

                                        {/* rows */}
                                        <div className="divide-y">
                                                {displayRows.map((r) => {
                                                        const isPending = !r.is_checked;
                                                        const isDeleted = !!r.is_deleted;
                                                        const dimInAll = status === "all" && isDeleted;

                                                        return (
                                                            <div
                                                                key={r.id}
                                                                className={["grid grid-cols-12 gap-3 px-4 py-3", dimInAll ? "opacity-50" : ""].join(" ")}
                                                            >
                                                                    <div className="col-span-1 flex items-start pt-1">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!!selected[r.id]}
                                                                                onChange={() => toggleOne(r.id)}
                                                                            />
                                                                    </div>

                                                                    <div className="col-span-5">
                                                                            <div className={["text-md text-gray-900 leading-6", isDeleted ? "line-through" : ""].join(" ")}>
                                                                                    {clamp(r.content, 260)}
                                                                            </div>

                                                                            {/* ✅ VN time (ưu tiên ms nếu có) */}
                                                                            <div className="text-md text-gray-500 mt-1">
                                                                                    {fmtTime(r.created_ms || r.created_at)}
                                                                            </div>

                                                                            {isDeleted ? (
                                                                                <span className="inline-flex mt-2 text-sm font-semibold px-2 py-1 rounded-full text-red-600 bg-red-100">
                          Đã xoá
                        </span>
                                                                            ) : isPending ? (
                                                                                <span className="inline-flex mt-2 text-sm font-semibold px-2 py-1 rounded-full text-yellow-600 bg-yellow-100">
                          Chờ duyệt
                        </span>
                                                                            ) : (
                                                                                <span className="inline-flex mt-2 text-sm font-semibold px-2 py-1 rounded-full text-green-600 bg-green-100">
                          Đã đăng
                        </span>
                                                                            )}
                                                                    </div>

                                                                    <div className="col-span-2">
                                                                            <div className="text-md font-semibold text-gray-900">{r.user_name || "—"}</div>
                                                                            <div className="text-md text-gray-500 font-mono mt-1">{r.user_id || ""}</div>
                                                                    </div>

                                                                    <div className="col-span-3">
                                                                            <div className={["text-md text-gray-900", isDeleted ? "line-through" : ""].join(" ")}>
                                                                                    {r.article_title || "—"}
                                                                            </div>
                                                                            <div className="text-md text-gray-500 font-mono mt-1">{r.article_id || ""}</div>
                                                                    </div>

                                                                    <div className="col-span-1 flex items-start justify-end gap-2">
                                                                            {!isDeleted && isPending ? (
                                                                                <IconBtn
                                                                                    title="Đăng comment"
                                                                                    disabled={acting}
                                                                                    onClick={() => approveOne(r.id)}
                                                                                    className="bg-white"
                                                                                >
                                                                                        <img src={tick} alt="" className="w-6 h-6" />
                                                                                </IconBtn>
                                                                            ) : null}

                                                                            {isDeleted ? (
                                                                                <button
                                                                                    type="button"
                                                                                    title="Khôi phục (chờ duyệt)"
                                                                                    onClick={() => restoreOne(r.id)}
                                                                                    disabled={acting}
                                                                                    className="p-1 hover:opacity-75 pl-6 ease-out hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed"
                                                                                >
                                                                                        <img src={restoreIcon} alt="Khôi phục" className="w-7 h-7" />
                                                                                </button>
                                                                            ) : (
                                                                                <IconBtn
                                                                                    title="Xoá"
                                                                                    disabled={acting}
                                                                                    onClick={() => setConfirmDel({ open: true, id: r.id })}
                                                                                    className="text-gray-500 hover:text-red-600"
                                                                                >
                                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path
                                                                                                    strokeLinecap="round"
                                                                                                    strokeLinejoin="round"
                                                                                                    strokeWidth="2"
                                                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                                                />
                                                                                        </svg>
                                                                                </IconBtn>
                                                                            )}
                                                                    </div>
                                                            </div>
                                                        );
                                                })}
                                        </div>

                                        {/* footer pagination */}
                                        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                                                <div className="text-sm text-gray-600">
                                                        Trang <b>{page}</b>
                                                </div>
                                                <div className="flex gap-2">
                                                        <MiniBtn
                                                            tone="gray"
                                                            disabled={page <= 1 || loading || acting}
                                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                        >
                                                                ← Trước
                                                        </MiniBtn>
                                                        <MiniBtn
                                                            tone="gray"
                                                            disabled={loading || acting || displayRows.length < pageSize}
                                                            onClick={() => setPage((p) => p + 1)}
                                                        >
                                                                Sau →
                                                        </MiniBtn>
                                                </div>
                                        </div>
                                </div>
                            )}
                    </div>

                    {/* Confirm delete */}
                    <ConfirmModal
                        open={confirmDel.open}
                        title="Xoá comment"
                        desc="Bạn chắc chắn muốn xoá comment này? Hành động không thể hoàn tác."
                        loading={acting}
                        onClose={() => setConfirmDel({ open: false, id: null })}
                        onConfirm={async () => {
                                const id = confirmDel.id;
                                setConfirmDel({ open: false, id: null });
                                await deleteOne(id);
                        }}
                    />
            </div>
        );
}
