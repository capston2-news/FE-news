// Reader.jsx (Quản lý Người Đọc + xổ bookmark)
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import CustomerModal from "./ReaderModal.jsx";
import RotatingArrowButton from "./RotatingArrowButton.jsx";

import {
    findAll,
    createCustomer,
    editCustomer,
    deleteCustomerById,
} from "../../services/reader/ReaderService.jsx";

import { getBookmarksByUserId } from "../../services/bookmark/BookmarkService.jsx";
import { getAllCategories } from "../../services/category/CategoryService.jsx";

const restoreIcon = "/img/restore.png";

// ---------- helpers ----------
const normalizeText = (v) =>
    String(v ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

// json_util ObjectId => { $oid: "..." }
const toId = (v) => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object" && v.$oid) return v.$oid;
    return String(v);
};

// json_util Date => { $date: "..." } hoặc { $date: { $numberLong: "..." } }
const parseDate = (v) => {
    if (!v) return null;
    if (v instanceof Date) return v;

    if (typeof v === "string" || typeof v === "number") {
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }

    if (typeof v === "object" && v.$date) {
        const inner = v.$date;
        if (typeof inner === "string" || typeof inner === "number") return parseDate(inner);
        if (inner?.$numberLong) return parseDate(Number(inner.$numberLong));
    }

    return null;
};

const formatDateToDDMMYYYY = (dateLike) => {
    const d = parseDate(dateLike);
    if (!d) return "N/A";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const calcAgeFromBirthDate = (birthDate) => {
    const dob = parseDate(birthDate);
    if (!dob) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
    return age >= 0 ? age : null;
};

const unwrap = (res) => {
    if (Array.isArray(res)) return res;

    const data = res?.data ?? res;

    if (typeof data === "string") {
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
};

// gom tất cả value của object thành 1 chuỗi (để search “mọi field”)
const flattenValues = (obj) => {
    const out = [];
    const walk = (v) => {
        if (v === null || v === undefined) return;
        if (typeof v === "object") {
            if (Array.isArray(v)) v.forEach(walk);
            else Object.values(v).forEach(walk);
            return;
        }
        out.push(String(v));
    };
    walk(obj);
    return out.join(" ");
};

// ✅ Custom Confirm Modal (Tailwind)
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

function Reader() {
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentCustomer, setCurrentCustomer] = useState(null);

    // pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // confirm modal
    const [confirmState, setConfirmState] = useState({
        open: false,
        title: "",
        message: "",
        okText: "Xác nhận",
        cancelText: "Hủy",
        okVariant: "primary",
        resolve: null,
    });

    // ✅ expand bookmark
    const [expandedId, setExpandedId] = useState(null);
    const [bookmarkMap, setBookmarkMap] = useState({}); // { [userId]: [] }
    const [bookmarkLoading, setBookmarkLoading] = useState({}); // { [userId]: true/false }
    const [bookmarkError, setBookmarkError] = useState({}); // { [userId]: "..." }

    // ✅ map category_id -> slug để nhảy đúng tab ArticleDash
    const [categoryIdToSlug, setCategoryIdToSlug] = useState({}); // { [catIdStr]: slug }

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

    const getStatusTextAndColor = (inactive) => {
        if (inactive === false) return { text: "Hoạt động", className: "text-green-600 bg-green-100" };
        if (inactive === true) return { text: "Tạm ngừng", className: "text-red-600 bg-red-100" };
        return { text: "Không rõ", className: "text-gray-600 bg-gray-100" };
    };

    const fetchCustomers = async () => {
        try {
            const raw = await findAll();
            const arr = unwrap(raw);

            const onlyUsers = arr
                .filter((u) => normalizeText(u?.role) === "user")
                .map((u) => {
                    const id = toId(u?._id || u?.customerId || u?.userId || u?.id);
                    const fullname = u?.fullname || u?.fullName || "";
                    const username = u?.username || "";
                    const email = u?.email || "";
                    const age = u?.age ?? calcAgeFromBirthDate(u?.birthDate);
                    const created_at = u?.created_at || u?.createdAt || null;

                    // ✅ khuyến nghị: chỉ dùng is_deleted/is_active (đừng dùng field delete)
                    const inactive = !!u?.is_deleted || u?.is_active === false;

                    return {
                        customerId: id,
                        fullName: fullname,
                        username,
                        email,
                        age,
                        created_at,
                        inactive,

                        // giữ thêm field thô nếu bạn muốn search sâu
                        role: u?.role,
                        is_active: u?.is_active,
                        is_deleted: u?.is_deleted,
                    };
                });

            setCustomers(onlyUsers);
        } catch (err) {
            console.error("Lỗi khi tải danh sách người đọc:", err);
            setCustomers([]);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // ✅ load categories để map category_id -> slug (cho navigate /article?category=...&highlightId=...)
    useEffect(() => {
        (async () => {
            try {
                const res = await getAllCategories();
                const cats = unwrap(res);
                const map = {};
                (cats || []).forEach((c) => {
                    map[toId(c?._id)] = c?.slug;
                });
                setCategoryIdToSlug(map);
            } catch (e) {
                console.error("Load categories failed:", e);
            }
        })();
    }, []);

    // ✅ search theo mọi field trong object + status + ngày tạo
    const filteredCustomers = useMemo(() => {
        const q = normalizeText(searchTerm);
        if (!q) return customers;

        return customers.filter((c) => {
            const statusText = getStatusTextAndColor(c.inactive).text;
            const createdFmt = formatDateToDDMMYYYY(c.created_at);

            const haystack = normalizeText(`${flattenValues(c)} ${statusText} ${createdFmt}`);
            return haystack.includes(q);
        });
    }, [customers, searchTerm]);

    useEffect(() => setPage(1), [searchTerm, customers]);

    const total = filteredCustomers.length;
    const pagedCustomers = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredCustomers.slice(start, start + pageSize);
    }, [filteredCustomers, page, pageSize]);

    const handleAddCustomer = () => {
        setCurrentCustomer(null);
        setIsModalOpen(true);
    };

    const handleEditCustomer = (customer) => {
        setCurrentCustomer(customer);
        setIsModalOpen(true);
    };

    const handleDeleteCustomer = async (id) => {
        if (!id) return;

        const ok = await confirmAction({
            title: "Tạm ngừng người đọc?",
            message: "Bạn có chắc chắn muốn tạm ngừng người đọc này không?",
            okText: "Tạm ngừng",
            okVariant: "danger",
        });
        if (!ok) return;

        try {
            await deleteCustomerById(id);
            toast.success("Đã tạm ngừng người đọc");
            fetchCustomers();
        } catch (err) {
            console.error("Lỗi khi tạm ngừng người đọc:", err);
            toast.error(err?.response?.data?.detail || "Tạm ngừng thất bại");
        }
    };

    const handleRestoreCustomer = async (id) => {
        if (!id) return;

        const ok = await confirmAction({
            title: "Khôi phục người đọc?",
            message: "Bạn có chắc chắn muốn khôi phục người đọc này không?",
            okText: "Khôi phục",
        });
        if (!ok) return;

        try {
            await editCustomer(id, { is_active: true, is_deleted: false });
            toast.success("Đã khôi phục người đọc");
            fetchCustomers();
        } catch (err) {
            console.error("Lỗi khi khôi phục người đọc:", err);
            toast.error(err?.response?.data?.detail || "Khôi phục thất bại");
        }
    };

    // ✅ toggle xổ bookmark theo user
    const toggleBookmarks = async (userId) => {
        if (!userId) return;

        if (expandedId === userId) {
            setExpandedId(null);
            return;
        }
        setExpandedId(userId);

        // cache có rồi thì khỏi gọi lại
        if (bookmarkMap[userId]) return;

        try {
            setBookmarkLoading((m) => ({ ...m, [userId]: true }));
            setBookmarkError((m) => ({ ...m, [userId]: null }));

            const res = await getBookmarksByUserId(userId);
            const list = unwrap(res);

            setBookmarkMap((m) => ({ ...m, [userId]: Array.isArray(list) ? list : [] }));
        } catch (e) {
            console.error("getBookmarksByUserId error:", e);
            setBookmarkError((m) => ({
                ...m,
                [userId]: e?.response?.data?.detail || "Không tải được bookmark",
            }));
        } finally {
            setBookmarkLoading((m) => ({ ...m, [userId]: false }));
        }
    };

    // ✅ click bookmark -> nhảy sang /article và highlight bài đó
    const openBookmarkedArticle = (b) => {
        const articleId = toId(b?.article_id || b?.articleId);
        if (!articleId) return toast.error("Bookmark thiếu article_id");

        const catId = toId(b?.category_id);
        const catSlug = b?.category_slug || categoryIdToSlug[catId] || "";

        const params = new URLSearchParams();
        if (catSlug) params.set("category", catSlug);
        params.set("highlightId", articleId);

        navigate(`/article?${params.toString()}`);
    };

    // ✅ Submit modal
    const handleModalSubmit = async (payload) => {
        try {
            const isEdit = !!payload?.customerId;

            if (isEdit) {
                const ok = await confirmAction({
                    title: "Cập nhật người đọc?",
                    message: "Bạn có chắc chắn muốn lưu thay đổi không?",
                    okText: "Lưu",
                });
                if (!ok) return;

                const { customerId, ...body } = payload;

                await editCustomer(customerId, {
                    fullname: body.fullname,
                    username: body.username,
                    email: body.email,
                });

                toast.success("Đã cập nhật người đọc");
            } else {
                const ok = await confirmAction({
                    title: "Tạo người đọc mới?",
                    message: "Bạn có chắc chắn muốn tạo người đọc này không?",
                    okText: "Tạo",
                });
                if (!ok) return;

                await createCustomer(payload);
                toast.success("Đã tạo người đọc");
            }

            await fetchCustomers();
            setIsModalOpen(false);
            setCurrentCustomer(null);
        } catch (err) {
            console.error("Lỗi khi lưu người đọc:", err);
            const data = err?.response?.data;
            const msg =
                data?.detail ||
                data?.username?.[0] ||
                data?.email?.[0] ||
                data?.password?.[0] ||
                data?.fullname?.[0] ||
                data?.age?.[0] ||
                "Lưu thất bại";
            toast.error(msg);
        }
    };

    return (
        <div className="flex-1 p-8 bg-gray-50">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold mb-4 -mt-3 ">Quản lý Người Đọc</h1>

                <div className="flex justify-between items-center">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm"
                            className="w-[420px] pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
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

                    <button onClick={handleAddCustomer} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Thêm người đọc
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Tên</th>
                            <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Tuổi</th>
                            <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Email</th>
                            <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Tên đăng nhập</th>
                            <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Thời gian tạo</th>
                            <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Trạng thái</th>
                            <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Hành động</th>
                        </tr>
                        </thead>

                        <tbody>
                        {pagedCustomers.length > 0 ? (
                            pagedCustomers.map((c) => {
                                const statusInfo = getStatusTextAndColor(c.inactive);
                                const id = c.customerId;
                                const isOpen = expandedId === id;

                                const bmLoading = !!bookmarkLoading[id];
                                const bmError = bookmarkError[id];
                                const bmList = bookmarkMap[id] || [];

                                return (
                                    <Fragment key={id}>
                                        {/* ---- main row ---- */}
                                        <tr className="border-b border-gray-200 hover:bg-gray-50 last:border-0 text-lg">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center mr-3 uppercase text-green-700 font-semibold">
                                                        {c.fullName?.charAt(0) || "?"}
                                                    </div>
                                                    <div className="font-medium">{c.fullName || "N/A"}</div>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4">{c.age ?? "—"}</td>
                                            <td className="py-3 px-4">{c.email || "N/A"}</td>
                                            <td className="py-3 px-4">{c.username || "N/A"}</td>
                                            <td className="py-3 px-4">{formatDateToDDMMYYYY(c.created_at)}</td>

                                            <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
                            {statusInfo.text}
                          </span>
                                            </td>

                                            <td className="py-3 px-4">
                                                {c.inactive ? (
                                                    <button
                                                        onClick={() => handleRestoreCustomer(id)}
                                                        className="hover:opacity-75 pl-6 ease-out hover:scale-110"
                                                        title="Khôi phục"
                                                        type="button"
                                                    >
                                                        <img src={restoreIcon} alt="" className="w-5 h-5" />
                                                    </button>
                                                ) : (
                                                    <div className="flex space-x-2 items-center">
                                                        <button
                                                            onClick={() => handleEditCustomer(c)}
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
                                                            onClick={() => handleDeleteCustomer(id)}
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

                                                        {/* ✅ xổ bookmark */}
                                                        <RotatingArrowButton
                                                            rotated={isOpen}
                                                            onClick={() => toggleBookmarks(id)}
                                                            title={isOpen ? "Đóng bookmark" : "Xem bookmark"}
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>

                                        {/* ---- expand row: bookmarks ---- */}
                                        {isOpen && (
                                            <tr className="border-b border-gray-200 bg-gray-50">
                                                <td colSpan={7} className="p-4">
                                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                        <div className="px-4 py-3 border-b flex items-center justify-between">
                                                            <div className="font-semibold text-gray-700">
                                                                Bookmark của:{" "}
                                                                <span className="text-gray-900">{c.fullName || c.username}</span>
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {bmLoading ? "Đang tải..." : `${bmList.length} bài`}
                                                            </div>
                                                        </div>

                                                        {bmError ? (
                                                            <div className="p-4 text-red-600">{bmError}</div>
                                                        ) : bmLoading ? (
                                                            <div className="p-4 text-gray-600">Đang tải danh sách bookmark...</div>
                                                        ) : bmList.length === 0 ? (
                                                            <div className="p-4 text-gray-600">Người dùng chưa bookmark bài viết nào.</div>
                                                        ) : (
                                                            <div className="overflow-x-auto">
                                                                <table className="min-w-full">
                                                                    <thead>
                                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tiêu đề</th>
                                                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Thời gian bookmark</th>
                                                                    </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                    {bmList.map((b) => {
                                                                        const bid = toId(b?._id) || `${toId(b?.article_id)}_${Math.random()}`;

                                                                        return (
                                                                            <tr
                                                                                key={bid}
                                                                                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                                                                onClick={() => openBookmarkedArticle(b)}
                                                                                title="Bấm để mở trong trang Bài viết"
                                                                            >
                                                                                <td className="py-3 px-4">
                                                                                    <div className="font-medium text-blue-600 hover:underline line-clamp-2">
                                                                                        {b?.title || "N/A"}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="py-3 px-4">
                                                                                    {formatDateToDDMMYYYY(b?.created_at || b?.bookmarked_at)}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-gray-500">
                                    Không tìm thấy người đọc nào.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* pagination */}
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

            <CustomerModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setCurrentCustomer(null);
                }}
                currentCustomer={currentCustomer}
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

export default Reader;
