// src/components/admin/author.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import toast from "react-hot-toast";

import AuthorModal from "./AuthorModal.jsx";
import {
    adminListAuthors,
    adminCreateAuthor,
    adminUpdateAuthor,
    adminDeleteAuthor,
    adminRestoreAuthor,
} from "../../services/author/AuthorService.jsx";

const restoreIcon = "/img/restore.png";

const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "N/A";
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return "N/A";
    }
};

const normalizeText = (v) =>
    String(v ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

/** ✅ Custom Confirm Modal (Tailwind) */
function ConfirmDialog({
                           open,
                           title,
                           message,
                           okText = "Xác nhận",
                           cancelText = "Hủy",
                           okVariant = "primary", // "primary" | "danger"
                           onOk,
                           onCancel,
                       }) {
    if (!open) return null;

    const okBtnClass =
        okVariant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
            <div
                className="relative w-[420px] max-w-[92vw] rounded-xl bg-white shadow-lg p-5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-lg font-semibold">{title}</div>
                <div className="mt-2 text-gray-600">{message}</div>

                <div className="mt-5 flex justify-end gap-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                        {cancelText}
                    </button>
                    <button type="button" onClick={onOk} className={`px-4 py-2 rounded-lg text-white ${okBtnClass}`}>
                        {okText}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Author() {
    const [authors, setAuthors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentAuthor, setCurrentAuthor] = useState(null);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // ✅ Confirm modal state
    const [confirmState, setConfirmState] = useState({
        open: false,
        title: "",
        message: "",
        okText: "Xác nhận",
        cancelText: "Hủy",
        okVariant: "primary",
        resolve: null,
    });

    const confirmAction = ({ title, message, okText, cancelText, okVariant }) =>
        new Promise((resolve) => {
            setConfirmState({
                open: true,
                title: title || "Xác nhận",
                message: message || "",
                okText: okText || "Xác nhận",
                cancelText: cancelText || "Hủy",
                okVariant: okVariant || "primary",
                resolve,
            });
        });

    const closeConfirm = (result) => {
        confirmState.resolve?.(result);
        setConfirmState((s) => ({ ...s, open: false, resolve: null }));
    };

    const getStatusTextAndColor = (isDeleted) => {
        if (isDeleted === false) return { text: "Hoạt động", className: "text-green-600 bg-green-100" };
        if (isDeleted === true) return { text: "Tạm ngừng", className: "text-red-600 bg-red-100" };
        return { text: "Không rõ", className: "text-gray-600 bg-gray-100" };
    };

    const fetchAuthors = async () => {
        try {
            // ✅ lấy ALL để có cả deleted + active (lọc client giống employee)
            const data = await adminListAuthors({ status: "all", q: "", page: 1, page_size: 500 });

            const raw = Array.isArray(data?.results) ? data.results : [];
            const cleaned = raw.map((a) => ({
                authorId: a?._id,
                name: a?.name || "",
                created_at: a?.created_at || null,
                deleted: !!a?.is_deleted,
            }));

            setAuthors(cleaned);
        } catch (err) {
            console.error("Lỗi khi tải danh sách tác giả:", err);
            setAuthors([]);
        }
    };

    useEffect(() => {
        fetchAuthors();
    }, []);

    const filteredAuthors = useMemo(() => {
        const q = normalizeText(searchTerm);
        if (!q) return authors;

        return authors.filter((a) => {
            const statusText = getStatusTextAndColor(a.deleted).text;
            const createdFmt = formatDateToDDMMYYYY(a.created_at);

            const haystack = [a.name, createdFmt, statusText].map(normalizeText).join(" ");
            return haystack.includes(q);
        });
    }, [authors, searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, authors]);

    const total = filteredAuthors.length;

    const pagedAuthors = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredAuthors.slice(start, start + pageSize);
    }, [filteredAuthors, page, pageSize]);

    const handleAddAuthor = () => {
        setCurrentAuthor(null);
        setIsModalOpen(true);
    };

    const handleEditAuthor = (author) => {
        setCurrentAuthor(author);
        setIsModalOpen(true);
    };

    const handleDeleteAuthor = async (authorId) => {
        if (!authorId) return;

        const ok = await confirmAction({
            title: "Tạm ngừng tác giả?",
            message: "Bạn có chắc chắn muốn tạm ngừng tác giả này không?",
            okText: "Tạm ngừng",
            okVariant: "danger",
        });
        if (!ok) return;

        try {
            await adminDeleteAuthor(authorId); // soft delete (update is_deleted=true)
            toast.success("Đã tạm ngừng tác giả");
            fetchAuthors();
        } catch (err) {
            console.error("Lỗi khi tạm ngừng tác giả:", err);
            toast.error("Tạm ngừng thất bại");
        }
    };

    const handleRestoreAuthor = async (authorId) => {
        if (!authorId) return;

        const ok = await confirmAction({
            title: "Khôi phục tác giả?",
            message: "Bạn có chắc chắn muốn khôi phục tác giả này không?",
            okText: "Khôi phục",
        });
        if (!ok) return;

        try {
            await adminRestoreAuthor(authorId);
            toast.success("Đã khôi phục tác giả");
            fetchAuthors();
        } catch (err) {
            console.error("Lỗi khi khôi phục tác giả:", err);
            toast.error("Khôi phục thất bại");
        }
    };

    const handleModalSubmit = async (payload) => {
        try {
            if (payload?.authorId) {
                const ok = await confirmAction({
                    title: "Cập nhật tác giả?",
                    message: "Bạn có chắc chắn muốn lưu thay đổi không?",
                    okText: "Lưu",
                });
                if (!ok) return;

                const { authorId, ...body } = payload;
                await adminUpdateAuthor(authorId, body);
                toast.success("Đã sửa thành công");
            } else {
                const ok = await confirmAction({
                    title: "Tạo tác giả mới?",
                    message: "Bạn có chắc chắn muốn tạo tác giả này không?",
                    okText: "Tạo",
                });
                if (!ok) return;

                await adminCreateAuthor(payload);
                toast.success("Đã tạo tác giả");
            }

            await fetchAuthors();
            setIsModalOpen(false);
            setCurrentAuthor(null);
        } catch (err) {
            console.error("Lỗi khi lưu tác giả:", err);
            toast.error("Lưu thất bại");
        }
    };

    return (
        <div className="flex-1 p-8 bg-gray-50">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold mb-4 -mt-2 ">Quản lý tác giả</h1>

                <div className="flex justify-between items-center">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm"
                            className="w-[420px] pl-10 pr-4 py-2 border rounded-lg  focus:outline-none focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-3 top-2.5 text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    <button onClick={handleAddAuthor} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Thêm tác giả
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Tên tác giả</th>
                            <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Thời gian tạo</th>
                            <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Trạng thái</th>
                            <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Hành động</th>
                        </tr>
                        </thead>

                        <tbody>
                        {pagedAuthors.length > 0 ? (
                            pagedAuthors.map((a) => {
                                const statusInfo = getStatusTextAndColor(a.deleted);
                                const idToUse = a.authorId;

                                return (
                                    <tr
                                        key={idToUse}
                                        className="border-b border-gray-200 hover:bg-gray-50 last:border-0 text-lg"
                                    >
                                        <td className="py-3 px-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3 uppercase text-red-700 font-semibold">
                                                    {a.name?.charAt(0) || "?"}
                                                </div>
                                                <div className="font-medium">{a.name || "N/A"}</div>
                                            </div>
                                        </td>

                                        <td className="py-3 px-4">{formatDateToDDMMYYYY(a.created_at)}</td>

                                        <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                                        </td>

                                        <td className="py-3 px-4">
                                            {a.deleted ? (
                                                <button
                                                    onClick={() => handleRestoreAuthor(idToUse)}
                                                    className="hover:opacity-75 pl-6 ease-out hover:scale-110"
                                                    title="Khôi phục"
                                                    type="button"
                                                >
                                                    <img src={restoreIcon} alt="" className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <div className="flex space-x-2 items-center">
                                                    <button
                                                        onClick={() => handleEditAuthor(a)}
                                                        className="text-gray-500 hover:text-blue-600 p-1 transform transition-all duration-300 ease-out hover:scale-110"
                                                        title="Chỉnh sửa"
                                                        type="button"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                            />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteAuthor(idToUse)}
                                                        className="text-gray-500 hover:text-red-600 p-1 transform transition-all duration-300 ease-out hover:scale-110"
                                                        title="Tạm ngừng"
                                                        type="button"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-gray-500">
                                    Không tìm thấy tác giả nào.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end p-4">
                    <Pagination
                        current={page}
                        pageSize={pageSize}
                        total={total}
                        showSizeChanger
                        pageSizeOptions={[5, 10, 20, 50, 100]}
                        onChange={(p, ps) => {
                            setPage(p);
                            setPageSize(ps);
                        }}
                    />
                </div>
            </div>

            <AuthorModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setCurrentAuthor(null);
                }}
                currentAuthor={currentAuthor}
                onSubmit={handleModalSubmit}
            />

            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                okText={confirmState.okText}
                cancelText={confirmState.cancelText}
                okVariant={confirmState.okVariant}
                onCancel={() => closeConfirm(false)}
                onOk={() => closeConfirm(true)}
            />
        </div>
    );
}

export default Author;
