import axios from "axios";

export const getAllCategories = async () => {
    try {
        const res = await axios.get("/api/categories/all/", {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log("hghgh", res.data);
        return res.data;
    } catch (error) {
        console.error("Failed to fetch all articles", error);
        return [];
    }
}
export const getCategoriesChildByCategorySlug = async (categorySlug) => {
    try {
        if (!categorySlug) return [];

        // CÁCH 1 (URL param): /api/category/all/child/<slug>/
        const res = await axios.get(`/api/category/all/child/${categorySlug}/`, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        });

        return res.data;
    } catch (error) {
        console.error("Failed to fetch category childs", error);
        return [];
    }
};
export const createCategory = async (payload) => {
    try {
        const res = await axios.post("/api/create/categories/", payload, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        });
        return res;
    } catch (error) {
        console.error("Failed to create category", error);
        throw error;
    }
};

// PATCH /api/admin/categories/<category_id>/
export const updateCategory = async (categoryId, patchData) => {
    try {
        if (!categoryId) throw new Error("categoryId is required");

        const res = await axios.patch(`/api/categories/${categoryId}/`, patchData, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        });
        return res;
    } catch (error) {
        console.error("Failed to update category", error);
        throw error;
    }
};

// DELETE /api/admin/categories/<category_id>/delete/
export const deleteCategory = async (categoryId) => {
    try {
        if (!categoryId) throw new Error("categoryId is required");

        const res = await axios.delete(`/api/categories/${categoryId}/delete/`, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        });
        return res;
    } catch (error) {
        console.error("Failed to delete category", error);
        throw error;
    }
};

// POST /api/admin/categories/<category_slug>/children/
export const createCategoryChild = async (categorySlug, payload) => {
    try {
        if (!categorySlug) throw new Error("categorySlug is required");

        const res = await axios.post(`/api/categories/${categorySlug}/children/`, payload, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        });
        return res;
    } catch (error) {
        console.error("Failed to create category child", error);
        throw error;
    }
};

// PATCH /api/admin/categories/<category_slug>/children/<child_id>/
export const updateCategoryChild = async (categorySlug, childId, patchData) => {
    try {
        if (!categorySlug) throw new Error("categorySlug is required");
        if (!childId) throw new Error("childId is required");

        const res = await axios.patch(
            `/api/categories/${categorySlug}/children/${childId}/`,
            patchData,
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            }
        );
        return res;
    } catch (error) {
        console.error("Failed to update category child", error);
        throw error;
    }
};

// DELETE /api/admin/categories/<category_slug>/children/<child_id>/delete/
export const deleteCategoryChild = async (categorySlug, childId) => {
    try {
        if (!categorySlug) throw new Error("categorySlug is required");
        if (!childId) throw new Error("childId is required");

        const res = await axios.delete(
            `/api/categories/${categorySlug}/children/${childId}/delete/`,
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            }
        );
        return res;
    } catch (error) {
        console.error("Failed to delete category child", error);
        throw error;
    }
};