// src/components/admin/AuthorModal.jsx
import React, { useEffect, useMemo, useState } from "react";

export default function AuthorModal({ isOpen, onClose, currentAuthor, onSubmit }) {
    const isEdit = useMemo(() => !!currentAuthor?.authorId, [currentAuthor]);

    const [name, setName] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        setName(currentAuthor?.name || "");
    }, [isOpen, currentAuthor]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        const n = String(name || "").trim();
        if (!n) return;

        if (isEdit) {
            await onSubmit({ authorId: currentAuthor.authorId, name: n });
        } else {
            await onSubmit({ name: n });
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div
                className="relative w-[520px] max-w-[92vw] rounded-2xl bg-white shadow-lg p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <div className="text-xl font-semibold">{isEdit ? "Sửa tác giả" : "Thêm tác giả"}</div>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-900 text-xl">
                        ✕
                    </button>
                </div>

                <div className="mt-5">
                    <label className="text-lg font-semibold text-gray-700">Tên tác giả</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập tên tác giả..."
                        className="mt-2 w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                        {isEdit ? "Lưu" : "Tạo"}
                    </button>
                </div>
            </div>
        </div>
    );
}
