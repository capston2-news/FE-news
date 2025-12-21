import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { message, Pagination } from "antd";

import { getAllCategories, getCategoriesChildByCategorySlug } from "../../services/category/CategoryService.jsx";
import { getArticleByCategory } from "../../services/articles/ArticleService.jsx";
import toast from "react-hot-toast";

// ---------- helpers ----------
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
    return data ?? [];
};

const toOid = (v) => {
    if (!v) return null;
    if (typeof v === "string") return v;
    if (v?.$oid) return v.$oid;
    return String(v);
};

const toDateObj = (v) => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v === "string") {
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }
    const dv = v?.$date;
    if (dv) {
        const d = new Date(dv);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
};

const toDateString = (v) => {
    const d = toDateObj(v);
    return d ? d.toLocaleString("vi-VN") : "";
};

const shortId = (id) => {
    if (!id) return "—";
    const s = String(id);
    return s.length <= 10 ? s : `${s.slice(0, 6)}…${s.slice(-4)}`;
};

const ArticleDash = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const highlightedRowRef = useRef(null);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    // DATA
    const [categories, setCategories] = useState([]);
    const [articles, setArticles] = useState([]);

    // UI
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // URL state
    const [activeTab, setActiveTab] = useState(() => searchParams.get("category") || "");
    const [highlightedId, setHighlightedId] = useState(() => searchParams.get("highlightId") || null);

    const [childOptions, setChildOptions] = useState([]);
    const [childFilter, setChildFilter] = useState("all"); // all | childId

    // Filters
    const [q, setQ] = useState("");
    const [siteFilter, setSiteFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [deletedFilter, setDeletedFilter] = useState("all"); // all | active | deleted
    const [hasChildFilter, setHasChildFilter] = useState("all"); // all | yes | no
    const [fromDate, setFromDate] = useState(""); // yyyy-mm-dd
    const [toDate, setToDate] = useState(""); // yyyy-mm-dd

    // Tabs drag
    const tabsWrapRef = useRef(null);
    const movedRef = useRef(false);
    const dragRef = useRef({ down: false, startX: 0, startLeft: 0 });

    const startDrag = (clientX) => {
        const el = tabsWrapRef.current;
        if (!el) return;
        dragRef.current.down = true;
        dragRef.current.startX = clientX;
        dragRef.current.startLeft = el.scrollLeft;
        movedRef.current = false;
    };

    const moveDrag = (clientX) => {
        const el = tabsWrapRef.current;
        if (!el || !dragRef.current.down) return;

        const dx = clientX - dragRef.current.startX;
        if (Math.abs(dx) > 5) movedRef.current = true;

        el.scrollLeft = dragRef.current.startLeft - dx;
    };

    const endDrag = () => {
        dragRef.current.down = false;
        setTimeout(() => (movedRef.current = false), 0);
    };

    // Mouse
    const onMouseDownTabs = (e) => {
        if (e.button !== 0) return;
        startDrag(e.clientX);
        e.preventDefault();

        const onMove = (ev) => moveDrag(ev.clientX);
        const onUp = () => {
            endDrag();
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    };

    // Touch
    const onTouchStartTabs = (e) => {
        const t = e.touches?.[0];
        if (!t) return;
        startDrag(t.clientX);
    };
    const onTouchMoveTabs = (e) => {
        const t = e.touches?.[0];
        if (!t) return;
        moveDrag(t.clientX);
    };
    const onTouchEndTabs = () => endDrag();

    // Wheel dọc => cuộn ngang
    const onTabsWheel = (e) => {
        const el = tabsWrapRef.current;
        if (!el) return;

        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
        }
    };

    // Tabs từ categories
    const tabs = useMemo(() => {
        return (categories || []).map((c) => ({
            id: c.slug,
            label: c.name,
        }));
    }, [categories]);

    // 1) Fetch categories
    useEffect(() => {
        const fetchCats = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const catsRes = await getAllCategories();
                const cats = unwrap(catsRes);
                setCategories(Array.isArray(cats) ? cats : []);
            } catch (err) {
                console.error(err);
                setError("Không thể tải categories.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCats();
    }, []);

    // 2) Sync activeTab/highlightedId từ URL
    useEffect(() => {
        const catFromUrl = searchParams.get("category") || "";
        const highlightIdFromUrl = searchParams.get("highlightId");

        if (catFromUrl !== activeTab) setActiveTab(catFromUrl);
        setHighlightedId(highlightIdFromUrl);
    }, [searchParams]); // eslint-disable-line

    // 3) Nếu chưa có category trên URL => set tab mặc định
    useEffect(() => {
        if (!activeTab && categories.length > 0) {
            const first = categories[0]?.slug;
            if (first) {
                setActiveTab(first);
                navigate(`?category=${first}`, { replace: true });
            }
        }
    }, [categories, activeTab, navigate]);

    // 3.1) Fetch category child options theo activeTab
    useEffect(() => {
        const fetchChilds = async () => {
            if (!activeTab) return;

            setChildFilter("all");
            try {
                const res = await getCategoriesChildByCategorySlug(activeTab);
                const list = unwrap(res);
                setChildOptions(Array.isArray(list) ? list : []);
            } catch (e) {
                console.error(e);
                setChildOptions([]);
            }
        };

        fetchChilds();
    }, [activeTab]);

    // 4) Fetch articles theo activeTab (slug)
    useEffect(() => {
        const fetchArticles = async () => {
            if (!activeTab) return;

            setIsLoading(true);
            setError(null);

            try {
                const res = await getArticleByCategory(activeTab, 200);
                const list = unwrap(res);
                setArticles(Array.isArray(list) ? list : []);
            } catch (err) {
                console.error(err);
                setError("Không thể tải bài viết theo category.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
    }, [activeTab]);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        setHighlightedId(null);
        navigate(`?category=${tabId}`);
    };

    // ✅ do routes bạn chỉ có "/article" nên "Xem bài" -> highlight ngay trong bảng
    const handleOpenArticle = (articleId) => {
        if (!articleId) return;

        const params = new URLSearchParams();
        if (activeTab) params.set("category", activeTab);
        params.set("highlightId", String(articleId));

        navigate(`/article?${params.toString()}`);
    };

    const handleOpenExternal = (url) => {
        if (!url) return message.warning("Không có external_url");
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleCopyId = async (id) => {
        if (!id) return message.warning("Không có ID");
        try {
            await navigator.clipboard.writeText(String(id));
            toast.success("Đã copy ID");
        } catch {
            message.error("Copy thất bại");
        }
    };

    // Normalize + sort mặc định theo published_at desc
    const normalized = useMemo(() => {
        const list = Array.isArray(articles) ? articles : [];
        return list
            .map((a) => {
                const id = toOid(a?._id);
                const pub = toDateObj(a?.published_at);
                // const upd = toDateObj(a?.updated_at);
                return {
                    ...a,
                    __id: id,
                    __pub: pub,
                    // __upd: upd,
                };
            })
            .sort((x, y) => (y.__pub?.getTime?.() || 0) - (x.__pub?.getTime?.() || 0));
    }, [articles]);

    // Options site/status
    const siteOptions = useMemo(() => {
        const s = new Set();
        normalized.forEach((a) => a?.site && s.add(a.site));
        return Array.from(s).sort();
    }, [normalized]);

    const statusOptions = useMemo(() => {
        const s = new Set();
        normalized.forEach((a) => a?.status && s.add(a.status));
        return Array.from(s).sort();
    }, [normalized]);

    // KPI
    const kpi = useMemo(() => {
        const now = Date.now();
        const d24 = now - 24 * 60 * 60 * 1000;
        const d7 = now - 7 * 24 * 60 * 60 * 1000;

        let total = 0,
            published = 0,
            deleted = 0,
            last24h = 0,
            last7d = 0;

        normalized.forEach((a) => {
            total += 1;
            if (a?.status === "published") published += 1;
            if (a?.is_deleted) deleted += 1;

            const t = a.__pub?.getTime?.() || 0;
            if (t >= d24) last24h += 1;
            if (t >= d7) last7d += 1;
        });

        return { total, published, deleted, last24h, last7d };
    }, [normalized]);

    // Filtered list
    const filteredArticles = useMemo(() => {
        const query = (q || "").trim().toLowerCase();

        const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
        const to = toDate ? new Date(`${toDate}T23:59:59`) : null;

        return normalized.filter((a) => {
            // child filter
            if (childFilter !== "all") {
                const aid = toOid(a?.category_child_id);
                if (String(aid) !== String(childFilter)) return false;
            }

            // search
            if (query) {
                const hay = [a?.title, a?.external_url, a?.__id].filter(Boolean).join(" ").toLowerCase();
                if (!hay.includes(query)) return false;
            }

            // site
            if (siteFilter !== "all" && a?.site !== siteFilter) return false;

            // status
            if (statusFilter !== "all" && a?.status !== statusFilter) return false;

            // deleted
            if (deletedFilter === "active" && a?.is_deleted) return false;
            if (deletedFilter === "deleted" && !a?.is_deleted) return false;

            // has child
            const hasChild = !!a?.category_child_id;
            if (hasChildFilter === "yes" && !hasChild) return false;
            if (hasChildFilter === "no" && hasChild) return false;

            // date range by published_at
            const t = a.__pub?.getTime?.();
            if (from && (!t || t < from.getTime())) return false;
            if (to && (!t || t > to.getTime())) return false;

            return true;
        });
    }, [normalized, q, siteFilter, statusFilter, deletedFilter, hasChildFilter, fromDate, toDate, childFilter]);

    const total = filteredArticles.length;

    const pagedArticles = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredArticles.slice(start, start + pageSize);
    }, [filteredArticles, page, pageSize]);

    // ✅ highlightId => tự nhảy đúng page chứa bài đó
    useEffect(() => {
        if (!highlightedId) return;

        const idx = filteredArticles.findIndex((a) => String(a.__id) === String(highlightedId));
        if (idx < 0) return;

        const targetPage = Math.floor(idx / pageSize) + 1;
        if (targetPage !== page) setPage(targetPage);
    }, [highlightedId, filteredArticles, pageSize]); // page ok để so sánh

    // ✅ đổi tab / filter => reset về trang 1
    useEffect(() => {
        setPage(1);
    }, [activeTab, q, siteFilter, statusFilter, deletedFilter, hasChildFilter, childFilter, fromDate, toDate]);

    // Scroll tới row highlight (nếu có)
    useEffect(() => {
        if (highlightedId && highlightedRowRef.current) {
            setTimeout(() => {
                highlightedRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
        }
    }, [pagedArticles, highlightedId, activeTab]);

    const renderContent = () => {
        if (isLoading) return <p className="text-center py-8">Đang tải...</p>;
        if (error) return <p className="text-center text-red-500 py-8">{error}</p>;

        if (tabs.length === 0) {
            return <p className="text-center text-red-500 py-8">Không tải được categories (tabs rỗng).</p>;
        }

        if (total === 0) {
            return <p className="text-center text-gray-500 py-8">Không có bài viết nào (theo bộ lọc hiện tại).</p>;
        }

        return (
            <div className="rounded-md">
                <table className="min-w-full bg-white scrollbar-hide">
                    <thead className="border-b-2 border-gray-200">
                    <tr>
                        <th className="text-left py-3 px-4 text-md font-medium text-gray-500 w-12">STT</th>
                        <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Ảnh</th>
                        <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Tiêu đề</th>
                        <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Nguồn</th>
                        <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Danh mục</th>
                        <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Danh mục con</th>
                        {/* <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Tác giả</th> */}
                        <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Lượt xem</th>
                        <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Deleted</th>
                        {/* <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Updated</th> */}
                        <th className="text-left py-3 px-4 text-md font-medium text-gray-500">ID</th>
                        <th className="text-left py-3 px-4 text-md font-medium text-gray-500">Ngày</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Hành động</th>
                    </tr>
                    </thead>

                    <tbody>
                    {pagedArticles.map((a, index) => {
                        const id = a?.__id;
                        const isHighlighted = String(id) === String(highlightedId);
                        const thumb = Array.isArray(a?.images) ? a.images?.[0] : null;

                        const stt = (page - 1) * pageSize + index + 1;

                        return (
                            <tr
                                key={id || index}
                                ref={isHighlighted ? highlightedRowRef : null}
                                className={`border-b border-gray-200 hover:bg-gray-50 ${
                                    isHighlighted ? "bg-blue-100 transition-all duration-1000" : ""
                                }`}
                            >
                                <td className="py-2 px-3 text-md text-center">{stt}</td>

                                <td className="py-2 px-3">
                                    {thumb ? (
                                        <img
                                            src={thumb}
                                            alt=""
                                            className="w-24 h-16 object-cover rounded"
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    "data:image/svg+xml;charset=utf-8," +
                                                    encodeURIComponent(
                                                        `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="14">No image</text></svg>`
                                                    );
                                            }}
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-sm">—</span>
                                    )}
                                </td>

                                <td className="py-2 px-3 text-lg font-semibold max-w-[290px]">
                                    <div className="line-clamp-2">{a?.title || "N/A"}</div>
                                </td>

                                <td className="py-2 px-3 text-md">{a?.site || "N/A"}</td>
                                <td className="py-2 px-3 text-md">{a?.category_name || "N/A"}</td>
                                <td className="py-2 px-3 text-md">{a?.category_child_name || "—"}</td>
                                {/* <td className="py-2 px-3 text-md">{a?.author_name || "—"}</td> */}
                                <td className="py-2 px-3 text-md">{a?.views || 0}</td>

                                <td className="py-2 px-3 text-md">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-200 text-yellow-700">
                      {a?.status || "—"}
                    </span>
                                </td>

                                <td className="py-2 px-3 text-md">
                                    {a?.is_deleted ? (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        TRUE
                      </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        FALSE
                      </span>
                                    )}
                                </td>

                                {/* <td className="py-2 px-3 text-md">{toDateString(a?.updated_at) || "—"}</td> */}
                                <td className="py-2 px-3 text-md font-mono">{shortId(id)}</td>
                                <td className="py-2 px-3 text-md">{toDateString(a?.published_at) || "—"}</td>

                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => {
                                                if (!id) return message.warning("Không có article id");
                                                handleOpenArticle(id);
                                            }}
                                            className="text-gray-500 hover:text-blue-600 p-1"
                                            title="Highlight bài này"
                                            type="button"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleCopyId(id)}
                                            className="text-gray-500 hover:text-gray-900 p-1"
                                            title="Copy ID"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M8 16h8M8 12h8M8 8h8M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H8l-2 2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleOpenExternal(a?.external_url)}
                                            className="text-gray-500 hover:text-emerald-600 p-1"
                                            title="Mở link gốc"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 3h7v7m0-7L10 14" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7v14h14v-7" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>

                <div className="flex justify-end mt-4">
                    <Pagination
                        current={page}
                        pageSize={pageSize}
                        total={total}
                        showSizeChanger
                        pageSizeOptions={[10, 20, 50, 100]}
                        onChange={(p, ps) => {
                            setPage(p);
                            setPageSize(ps);
                        }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md w-full mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold text-gray-800  -mt-2">Bài viết theo danh mục</h1>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                <div className="rounded-lg border p-3">
                    <div className="text-xs text-gray-500">Tổng</div>
                    <div className="text-lg font-semibold">{kpi.total}</div>
                </div>
                <div className="rounded-lg border p-3">
                    <div className="text-xs text-gray-500">Published</div>
                    <div className="text-lg font-semibold">{kpi.published}</div>
                </div>
                <div className="rounded-lg border p-3">
                    <div className="text-xs text-gray-500">Deleted</div>
                    <div className="text-lg font-semibold">{kpi.deleted}</div>
                </div>
                <div className="rounded-lg border p-3">
                    <div className="text-xs text-gray-500">24h</div>
                    <div className="text-lg font-semibold">{kpi.last24h}</div>
                </div>
                <div className="rounded-lg border p-3">
                    <div className="text-xs text-gray-500">7 ngày</div>
                    <div className="text-lg font-semibold">{kpi.last7d}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-5">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm: title / url / id..."
                    className="md:col-span-2 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                />

                <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className="border rounded-lg px-3 py-2">
                    <option value="all">Tất cả nguồn</option>
                    {siteOptions.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2">
                    <option value="all">Tất cả status</option>
                    {statusOptions.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>

                <select value={deletedFilter} onChange={(e) => setDeletedFilter(e.target.value)} className="border rounded-lg px-3 py-2">
                    <option value="all">All</option>
                    <option value="active">Chưa xoá</option>
                    <option value="deleted">Đã xoá</option>
                </select>

                <select value={childFilter} onChange={(e) => setChildFilter(e.target.value)} className="border rounded-lg px-3 py-2">
                    <option value="all">Tất cả danh mục con</option>
                    {childOptions.map((c) => (
                        <option key={toOid(c?._id)} value={toOid(c?._id)}>
                            {c?.name || c?.slug || "—"}
                        </option>
                    ))}
                </select>

                <div className="md:col-span-2 flex gap-2">
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
            </div>

            {/* Tabs */}
            <div
                ref={tabsWrapRef}
                onMouseDown={onMouseDownTabs}
                onTouchStart={onTouchStartTabs}
                onTouchMove={onTouchMoveTabs}
                onTouchEnd={onTouchEndTabs}
                onWheel={onTabsWheel}
                className="
          flex border-b border-gray-200 mb-6 overflow-x-auto
          cursor-grab active:cursor-grabbing select-none touch-pan-x
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
        "
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={(e) => {
                            if (movedRef.current) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                            }
                            handleTabClick(tab.id);
                        }}
                        className={`py-3 px-4 sm:px-6 whitespace-nowrap focus:outline-none transition-colors duration-150 ease-in-out
              ${
                            activeTab === tab.id
                                ? "border-b-4 border-[#8BE200] text-[#0194F3] font-extrabold"
                                : "text-[#0194F3] font-medium hover:text-blue-700 hover:border-b-4 hover:border-gray-300"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[200px]">{renderContent()}</div>
        </div>
    );
};

export default ArticleDash;
