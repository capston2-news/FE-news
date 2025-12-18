import axios from "axios";

export const getAllCategories = async () => {
  try {
    const res = await axios.get("/api/categories/all/", {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return [];
  }
}

export const getCategoryChildOfCategory = async (slug) => {
  try {
    const res = await axios.get(`/api/category/all/child/${slug}/`, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch child categories for slug: ${slug}`, error);
    return [];
  }
}