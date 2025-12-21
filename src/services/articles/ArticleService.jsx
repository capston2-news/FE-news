import axios from "axios";

export const getArticleByCategory = async (slug, limit = 400) => {
    try {
        const res = await axios.get(`/api/articles/category/${slug}/`, {
            params: { limit },
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        });
        console.log(res.data);
        return res.data; // backend trả json list
    } catch (error) {
        console.error("Failed to fetch articles by category", error);
        return [];
    }
};

