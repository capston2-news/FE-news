import axios from "axios";

export const AddBookmark = async (articleId) => {
  try {
    const res = await axios.post(`/api/bookmark/articles/user/${articleId}`,
    {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to add bookmark", error);
    return null;
  }
}

export const RemoveBookmark = async (articleId) => {
  try {
    const res = await axios.delete(`/api/bookmark/articles/user/${articleId}`,
    {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to remove bookmark", error);
    return null;
  }
}