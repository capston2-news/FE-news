import axios from "axios";

// Simple mock data used when running frontend locally without a backend
const mockArticles = [
    {
        _id: { $oid: "1" },
        title: "Chuyện thời sự mẫu: Cập nhật nhanh",
        images: "https://via.placeholder.com/640x400.png?text=Featured+1",
        content: "Đây là nội dung mẫu cho bài viết số 1. Thông tin chi tiết sẽ nằm ở đây.",
        category: "Thời sự"
    },
    {
        _id: { $oid: "2" },
        title: "Báo chí mẫu: Tin tức kinh doanh",
        images: "https://via.placeholder.com/640x400.png?text=Business+2",
        content: "Nội dung mẫu cho bài viết số 2 về kinh doanh.",
        category: "Kinh doanh"
    },
    {
        _id: { $oid: "3" },
        title: "Giải trí: Sự kiện văn hóa",
        images: "https://via.placeholder.com/640x400.png?text=Entertainment+3",
        content: "Nội dung mẫu cho bài viết giải trí.",
        category: "Giải trí"
    }
];

const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export const getArticleByCategory = async (category) => {
    if (isLocal) {
        return mockArticles.filter((a) => (a.category || "").toLowerCase() === (category || "").toLowerCase());
    }

    try {
        const res = await axios.get(`/api/articles/category/${category}/`, {
            headers: { "Content-Type": "application/json" },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching articles by category", error);
        return [];
    }
};

export const getAllArticle = async () => {
    if (isLocal) {
        return mockArticles;
    }

    try {
        const res = await axios.get(`/api/articles/all/`, {
            headers: { "Content-Type": "application/json" },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching all articles", error);
        return [];
    }
};

export const getArticleById = async (id) => {
    if (isLocal) {
        return mockArticles.find((a) => String(a._id.$oid) === String(id)) || null;
    }

    try {
        const res = await axios.get(`/api/article/${id}`, {
            headers: { "Content-Type": "application/json" },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching article by ID", error);
        return null;
    }
};

export const getArticleExpectArticleId = async (id) => {
    if (isLocal) {
        return mockArticles.filter((a) => String(a._id.$oid) !== String(id));
    }

    try {
        const res = await axios.get(`/api/article/expect/${id}`, {
            headers: { "Content-Type": "application/json" },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching articles excluding specific ID", error);
        return [];
    }
};