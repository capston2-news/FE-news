import axios from "axios";

export const adminRestoreAuthor = async (id) => {
    const res = await axios.post(`/api/admin/authors/${id}/restore/`, null, {
        withCredentials: true,
    });
    return res.data; // { author }
};
export const adminListAuthors = async ({ q = "", page = 1, page_size = 30 } = {}) => {
    const res = await axios.get("/api/admin/authors/", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
    });
    console.log(res.data);
    return res.data; // { results, meta }
};

export const adminCreateAuthor = async (payload) => {
    const res = await axios.post("/api/admin/authors/", payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
    });
    return res.data; // { author }
};

export const adminUpdateAuthor = async (id, payload) => {
    const res = await axios.put(`/api/admin/authors/${id}/`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
    });
    return res.data; // { author }
};

export const adminDeleteAuthor = async (id) => {
    const res = await axios.delete(`/api/admin/authors/${id}/`, {
        withCredentials: true,
    });
    return res.data; // { ok: true }
};