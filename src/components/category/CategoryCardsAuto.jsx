// src/components/category/CategoryCardsAuto.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  getAllCategories,
  getCategoriesChildByCategorySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  createCategoryChild,
  updateCategoryChild,
  deleteCategoryChild,
} from "../../services/category/CategoryService.jsx";

import addCategory from "../../assets/add_category.png";
import toast from "react-hot-toast";

// ---------- helpers ----------
const unwrap = (res) => {
  if (Array.isArray(res)) return res;

  const data = res?.data ?? res;

  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed?.results)) return parsed.results;
      return [];
    } catch {
      return [];
    }
  }

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results; // ✅ common pattern
  if (Array.isArray(data?.data)) return data.data;       // ✅ sometimes used

  return [];
};

const toId = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;

  // { $oid: "..." }
  if (typeof v === "object" && v.$oid) return v.$oid;

  // { _id: { $oid: "..." } }
  if (typeof v === "object" && v._id && v._id.$oid) return v._id.$oid;

  try {
    return String(v);
  } catch {
    return "";
  }
};

const normalize = (s) =>
    String(s ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

const slugifyVi = (s) =>
    normalize(s)
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

// ---------- UI ----------
function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;
  return (
      <div className="fixed inset-0 z-[999]">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border overflow-hidden">
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
            <div className="p-4">{children}</div>
            {footer ? <div className="px-4 py-3 border-t bg-gray-50">{footer}</div> : null}
          </div>
        </div>
      </div>
  );
}

const MiniBtn = ({ tone = "gray", disabled, className = "", type = "button", ...props }) => {
  const base =
      "inline-flex items-center gap-1.5 text-[16px] font-semibold px-3 py-2 rounded-full border transition disabled:opacity-60 disabled:cursor-not-allowed";
  const tones = {
    gray: "bg-white hover:bg-gray-50 text-gray-700 border-gray-200",
    blue: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600",
    red: "bg-red-600 hover:bg-red-700 text-white border-red-600",
    soft: "bg-slate-800 hover:bg-slate-700 text-white border-slate-800",
  };
  return (
      <button type={type} disabled={disabled} className={`${base} ${tones[tone]} ${className}`} {...props} />
  );
};

export default function CategoryCardsAuto() {
  const [cats, setCats] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [errCats, setErrCats] = useState(null);

  // children cache: { [categorySlug]: [{id,name,slug,is_deleted}] }
  const [childMap, setChildMap] = useState({});
  const [childLoading, setChildLoading] = useState({});
  const [childError, setChildError] = useState({});

  const [q, setQ] = useState("");

  // dialog
  const [dlg, setDlg] = useState({ open: false, type: null, payload: null });
  const [form, setForm] = useState({ name: "", slug: "" });
  const [slugTouched, setSlugTouched] = useState(false);
  const [allowEditSlug, setAllowEditSlug] = useState(false);
  const [acting, setActing] = useState(false);
  const [actionErr, setActionErr] = useState(null);

  const hasApi = useMemo(
      () => ({
        createCategory: typeof createCategory === "function",
        updateCategory: typeof updateCategory === "function",
        deleteCategory: typeof deleteCategory === "function",
        createChild: typeof createCategoryChild === "function",
        updateChild: typeof updateCategoryChild === "function",
        deleteChild: typeof deleteCategoryChild === "function",
      }),
      []
  );

  const loadCats = async () => {
    setLoadingCats(true);
    setErrCats(null);
    try {
      const res = await getAllCategories();
      const list = unwrap(res);

      // ✅ IMPORTANT: include is_deleted then filter
      const cleaned = (Array.isArray(list) ? list : [])
          .map((c) => ({
            id: toId(c?._id) || toId(c?.id),
            name: c?.name ?? "",
            slug: c?.slug ?? "",
            is_deleted: Boolean(c?.is_deleted),
          }))
          .filter((c) => c.slug && !c.is_deleted); // ✅ only active

      setCats(cleaned);
    } catch (e) {
      console.error(e);
      setErrCats("Không tải được categories.");
      setCats([]);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    loadCats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchChildrenForSlug = async (slug) => {
    if (!slug) return;
    setChildLoading((m) => ({ ...m, [slug]: true }));
    setChildError((m) => ({ ...m, [slug]: null }));

    try {
      const res = await getCategoriesChildByCategorySlug(slug);
      const list = unwrap(res);

      // ✅ require id + only active
      const children = (Array.isArray(list) ? list : [])
          .map((x) => ({
            id: toId(x?._id) || toId(x?.id),
            name: x?.name ?? "",
            slug: x?.slug ?? "",
            is_deleted: Boolean(x?.is_deleted),
          }))
          .filter((x) => x.id && !x.is_deleted);

      setChildMap((prev) => ({ ...prev, [slug]: children }));
    } catch (e) {
      console.error(e);
      setChildError((m) => ({ ...m, [slug]: "Không tải được category_child." }));
      setChildMap((prev) => ({ ...prev, [slug]: [] }));
    } finally {
      setChildLoading((m) => ({ ...m, [slug]: false }));
    }
  };

  // auto fetch children for all categories
  useEffect(() => {
    if (!cats.length) return;

    let cancelled = false;

    (async () => {
      const missing = cats
          .map((c) => c.slug)
          .filter((slug) => slug && childMap[slug] === undefined);

      if (missing.length === 0) return;

      setChildLoading((m) => {
        const next = { ...m };
        missing.forEach((slug) => (next[slug] = true));
        return next;
      });

      setChildError((m) => {
        const next = { ...m };
        missing.forEach((slug) => (next[slug] = null));
        return next;
      });

      const results = await Promise.allSettled(
          missing.map(async (slug) => {
            const res = await getCategoriesChildByCategorySlug(slug);
            const list = unwrap(res);

            const children = (Array.isArray(list) ? list : [])
                .map((x) => ({
                  id: toId(x?._id) || toId(x?.id),
                  name: x?.name ?? "",
                  slug: x?.slug ?? "",
                  is_deleted: Boolean(x?.is_deleted),
                }))
                .filter((x) => x.id && !x.is_deleted);

            return { slug, children };
          })
      );

      if (cancelled) return;

      setChildMap((prev) => {
        const next = { ...prev };
        results.forEach((r) => {
          if (r.status === "fulfilled") next[r.value.slug] = r.value.children;
        });
        return next;
      });

      setChildError((prev) => {
        const next = { ...prev };
        results.forEach((r, i) => {
          const slug = missing[i];
          if (r.status === "rejected") next[slug] = "Không tải được category_child.";
        });
        return next;
      });

      setChildLoading((prev) => {
        const next = { ...prev };
        missing.forEach((slug) => (next[slug] = false));
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cats]);

  const filtered = useMemo(() => {
    const s = normalize(q);
    if (!s) return cats;
    return cats.filter((c) => normalize(`${c.name} ${c.slug}`).includes(s));
  }, [cats, q]);

  // ---------- dialog helpers ----------
  const closeDlg = () => {
    setDlg({ open: false, type: null, payload: null });
    setForm({ name: "", slug: "" });
    setSlugTouched(false);
    setAllowEditSlug(false);
    setActing(false);
    setActionErr(null);
  };

  const openAddCat = () => {
    setDlg({ open: true, type: "addCat", payload: null });
    setForm({ name: "", slug: "" });
    setSlugTouched(false);
    setAllowEditSlug(true);
    setActionErr(null);
  };

  const openEditCat = (cat) => {
    setDlg({ open: true, type: "editCat", payload: { cat } });
    setForm({ name: cat?.name ?? "", slug: cat?.slug ?? "" });
    setSlugTouched(true);
    setAllowEditSlug(false);
    setActionErr(null);
  };

  const openDelCat = (cat) => {
    setDlg({ open: true, type: "delCat", payload: { cat } });
    setActionErr(null);
  };

  const openAddChild = (cat) => {
    setDlg({ open: true, type: "addChild", payload: { cat } });
    setForm({ name: "", slug: "" });
    setSlugTouched(false);
    setAllowEditSlug(true);
    setActionErr(null);
  };

  const openEditChild = (cat, child) => {
    setDlg({ open: true, type: "editChild", payload: { cat, child } });
    setForm({ name: child?.name ?? "", slug: child?.slug ?? "" });
    setSlugTouched(true);
    setAllowEditSlug(false);
    setActionErr(null);
  };

  const openDelChild = (cat, child) => {
    setDlg({ open: true, type: "delChild", payload: { cat, child } });
    setActionErr(null);
  };

  const onChangeName = (v) => {
    setForm((f) => {
      const next = { ...f, name: v };
      if (!slugTouched) next.slug = slugifyVi(v);
      return next;
    });
  };

  const onChangeSlug = (v) => {
    setSlugTouched(true);
    setForm((f) => ({ ...f, slug: slugifyVi(v) || v }));
  };

  const requireApi = (key) => {
    if (!hasApi[key]) throw new Error(`Thiếu service: ${key}. Hãy export hàm tương ứng trong CategoryService.jsx`);
  };

  const submitDialog = async () => {
    console.log("SUBMIT dlg.type =", dlg.type, dlg.payload);

    setActing(true);
    setActionErr(null);

    try {
      switch (dlg.type) {
        case "addCat": {
          requireApi("createCategory");
          const payload = { name: form.name?.trim(), slug: form.slug?.trim() };
          if (!payload.name || !payload.slug) throw new Error("Vui lòng nhập name và slug.");
          await createCategory(payload);
          toast.success("Tạo category thành công");
          await loadCats();
          closeDlg();
          return;
        }

        case "editCat": {
          requireApi("updateCategory");
          const cat = dlg.payload?.cat;
          const oldSlug = cat?.slug;

          const payload = { name: form.name?.trim(), slug: form.slug?.trim() };
          if (!payload.name) throw new Error("Vui lòng nhập name.");
          if (!allowEditSlug) payload.slug = oldSlug;

          await updateCategory(cat?.id, payload);
          toast.success("Cập nhật category thành công");
          await loadCats();
          closeDlg();
          return;
        }

        case "delCat": {
          requireApi("deleteCategory");
          const cat = dlg.payload?.cat;
          await deleteCategory(cat?.id);
          toast.success("Xoá category thành công");
          await loadCats();
          closeDlg();
          return;
        }

        case "addChild": {
          requireApi("createChild");
          const cat = dlg.payload?.cat;
          const categorySlug = cat?.slug;

          const payload = { name: form.name?.trim(), slug: form.slug?.trim() };
          if (!payload.name || !payload.slug) throw new Error("Vui lòng nhập name và slug.");

          await createCategoryChild(categorySlug, payload);
          toast.success("Tạo category con thành công");
          await fetchChildrenForSlug(categorySlug);
          closeDlg();
          return;
        }

        case "editChild": {
          requireApi("updateChild");
          const { cat, child } = dlg.payload || {};
          const categorySlug = cat?.slug;

          if (!child?.id) throw new Error("Thiếu child.id (API GET child phải trả _id).");

          const payload = { name: form.name?.trim(), slug: form.slug?.trim() };
          if (!payload.name) throw new Error("Vui lòng nhập name.");
          if (!allowEditSlug) payload.slug = child?.slug;

          await updateCategoryChild(categorySlug, child.id, payload);
          toast.success("Cập nhật category con thành công");
          await fetchChildrenForSlug(categorySlug);
          closeDlg();
          return;
        }

        case "delChild": {
          requireApi("deleteChild");
          const { cat, child } = dlg.payload || {};
          const categorySlug = cat?.slug;

          if (!child?.id) throw new Error("Thiếu child.id (API GET child phải trả _id).");

          await deleteCategoryChild(categorySlug, child.id);
          toast.success("Xoá category con thành công");
          await fetchChildrenForSlug(categorySlug);
          closeDlg();
          return;
        }

        default:
          throw new Error("Dialog type không hợp lệ.");
      }
    } catch (e) {
      console.error(e);
      setActionErr(e?.response?.data?.detail || e?.message || "Thao tác thất bại.");
    } finally {
      setActing(false);
    }
  };

  // ---------- render ----------
  if (loadingCats) return <div className="p-6 text-gray-600">Đang tải categories...</div>;
  if (errCats) return <div className="p-6 text-red-600">{errCats}</div>;

  return (
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-800">Danh mục & Danh mục con</h2>

            <button
                type="button"
                onClick={openAddCat}
                title="Thêm category"
                className="inline-flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 shadow-sm transition"
            >
              <img src={addCategory} alt="Add" className="w-9 h-9" />
            </button>
          </div>

          <div className="mt-3">
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Find by name/slug..."
                className="w-full md:w-[360px] max-w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
            <div className="text-gray-500">Không có category nào (hoặc tất cả đang is_deleted=true).</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((c) => {
                const loading = !!childLoading[c.slug];
                const err = childError[c.slug];
                const childs = childMap[c.slug] ?? [];

                return (
                    <div key={c.id || c.slug} className="bg-white border rounded-xl shadow-sm overflow-hidden">
                      {/* category header */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xl font-semibold text-[#0194F3]">{c.name || "—"}</div>
                            <div className="text-md text-gray-500 mt-0.5">
                              <span className="font-mono text-[#8BE200] font-bold">slug: {c.slug}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 justify-end">
                            <button
                                onClick={() => openEditCat(c)}
                                className="text-gray-500 fonr hover:text-blue-600 p-1 transform transition-all duration-300 ease-out hover:scale-110"
                                title="Chỉnh sửa"
                                type="button"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </button>

                            <button
                                onClick={() => openDelCat(c)}
                                className="text-gray-500 hover:text-red-600 p-1 transform transition-all duration-300 ease-out hover:scale-110"
                                title="Xoá / Tạm ngừng"
                                type="button"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Child section */}
                      <div className="border-t bg-gray-50">
                        <div className="p-4">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="text-md font-semibold text-gray-700">Category con</div>

                            <button
                                type="button"
                                onClick={() => openAddChild(c)}
                                title="Thêm category con"
                                className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 shadow-sm transition"
                            >
                              <img src={addCategory} alt="Add" className="w-6 h-6" />
                            </button>
                          </div>

                          {err ? (
                              <div className="text-md text-red-600">{err}</div>
                          ) : loading && childMap[c.slug] === undefined ? (
                              <div className="text-md text-gray-600">Đang tải category_child...</div>
                          ) : (childs?.length ?? 0) === 0 ? (
                              <div className="text-md text-gray-500">Không có category_child (hoặc tất cả đang is_deleted=true).</div>
                          ) : (
                              <div className="flex flex-wrap gap-2">
                                {childs.map((x, idx) => (
                                    <span
                                        key={x.id || `${c.slug}-${idx}`}
                                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border text-md"
                                        title={x.slug ? `slug: ${x.slug}` : ""}
                                    >
                            <span className="font-medium text-gray-800">{x.name || "—"}</span>
                                      {x.slug && <span className="text-gray-500 font-mono text-xs">{x.slug}</span>}

                                      <button
                                          onClick={() => openEditChild(c, x)}
                                          className="text-gray-500 hover:text-blue-600 p-1 transform transition-all duration-300 ease-out hover:scale-110"
                                          title="Chỉnh sửa category child"
                                          type="button"
                                      >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </button>

                            <button
                                onClick={() => openDelChild(c, x)}
                                className="text-gray-500 hover:text-red-600 p-1 transform transition-all duration-300 ease-out hover:scale-110"
                                title="Xoá category_child"
                                type="button"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </span>
                                ))}
                              </div>
                          )}

                          <div className="mt-3">
                            <MiniBtn tone="gray" onClick={() => fetchChildrenForSlug(c.slug)} disabled={!!childLoading[c.slug]}>
                              ↻ Tải lại con
                            </MiniBtn>
                          </div>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
        )}

        {/* ---------- MODALS ---------- */}
        <Modal
            open={dlg.open && (dlg.type === "addCat" || dlg.type === "editCat")}
            title={dlg.type === "addCat" ? "Thêm category" : "Sửa category"}
            onClose={closeDlg}
            footer={
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg text-red-600">{actionErr}</div>
                <div className="flex gap-2">
                  <MiniBtn tone="gray" onClick={closeDlg} disabled={acting}>
                    Huỷ
                  </MiniBtn>
                  <MiniBtn tone="blue" onClick={submitDialog} disabled={acting}>
                    {acting ? "Đang lưu..." : "Lưu"}
                  </MiniBtn>
                </div>
              </div>
            }
        >
          <div className="space-y-3">
            <div>
              <div className="text-lg font-medium text-gray-700 mb-1">Name</div>
              <input
                  value={form.name}
                  onChange={(e) => onChangeName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="VD: Thời sự"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="text-lg font-medium text-gray-700">Slug</div>

                {dlg.type === "editCat" ? (
                    <label className="text-xs text-gray-600 inline-flex items-center gap-2">
                      <input
                          type="checkbox"
                          checked={allowEditSlug}
                          onChange={(e) => setAllowEditSlug(e.target.checked)}
                      />
                      Cho phép sửa slug
                    </label>
                ) : null}
              </div>

              <input
                  value={form.slug}
                  onChange={(e) => onChangeSlug(e.target.value)}
                  disabled={dlg.type === "editCat" && !allowEditSlug}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
                  placeholder="VD: thoi-su"
              />
              <div className="text-xs text-gray-500 mt-1">Tip: nhập name sẽ tự gợi ý slug (bạn có thể sửa).</div>
            </div>
          </div>
        </Modal>

        <Modal
            open={dlg.open && (dlg.type === "addChild" || dlg.type === "editChild")}
            title={
              dlg.type === "addChild"
                  ? `Thêm Category con (${dlg.payload?.cat?.slug})`
                  : `Sửa Category con (${dlg.payload?.cat?.slug})`
            }
            onClose={closeDlg}
            footer={
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-red-600">{actionErr}</div>
                <div className="flex gap-2">
                  <MiniBtn tone="gray" onClick={closeDlg} disabled={acting}>
                    Huỷ
                  </MiniBtn>
                  <MiniBtn tone="blue" onClick={submitDialog} disabled={acting}>
                    {acting ? "Đang lưu..." : "Lưu"}
                  </MiniBtn>
                </div>
              </div>
            }
        >
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Name</div>
              <input
                  value={form.name}
                  onChange={(e) => onChangeName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="VD: Dân sinh"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="text-sm font-medium text-gray-700">Slug</div>

                {dlg.type === "editChild" ? (
                    <label className="text-xs text-gray-600 inline-flex items-center gap-2">
                      <input
                          type="checkbox"
                          checked={allowEditSlug}
                          onChange={(e) => setAllowEditSlug(e.target.checked)}
                      />
                      Cho phép sửa slug
                    </label>
                ) : null}
              </div>

              <input
                  value={form.slug}
                  onChange={(e) => onChangeSlug(e.target.value)}
                  disabled={dlg.type === "editChild" && !allowEditSlug}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
                  placeholder="VD: dan-sinh"
              />
            </div>
          </div>
        </Modal>

        <Modal
            open={dlg.open && dlg.type === "delCat"}
            title="Xoá Category"
            onClose={closeDlg}
            footer={
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-red-600">{actionErr}</div>
                <div className="flex gap-2">
                  <MiniBtn tone="gray" onClick={closeDlg} disabled={acting}>
                    Huỷ
                  </MiniBtn>
                  <MiniBtn tone="red" onClick={submitDialog} disabled={acting}>
                    {acting ? "Đang xoá..." : "Xoá"}
                  </MiniBtn>
                </div>
              </div>
            }
        >
          <div className="text-lg text-gray-700">
            Bạn chắc chắn muốn xoá category <b className="text-gray-900">{dlg.payload?.cat?.name}</b> (
            <span className="font-mono">{dlg.payload?.cat?.slug}</span>) ?
          </div>
        </Modal>

        <Modal
            open={dlg.open && dlg.type === "delChild"}
            title="Xoá Category con"
            onClose={closeDlg}
            footer={
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-red-600">{actionErr}</div>
                <div className="flex gap-2">
                  <MiniBtn tone="gray" onClick={closeDlg} disabled={acting}>
                    Huỷ
                  </MiniBtn>
                  <MiniBtn tone="red" onClick={submitDialog} disabled={acting}>
                    {acting ? "Đang xoá..." : "Xoá"}
                  </MiniBtn>
                </div>
              </div>
            }
        >
          <div className="text-lg text-gray-700">
            Bạn chắc chắn muốn xoá category con <b className="text-gray-900">{dlg.payload?.child?.name}</b> (
            <span className="font-mono">{dlg.payload?.child?.slug}</span>) ?
          </div>
        </Modal>
      </div>
  );
}
