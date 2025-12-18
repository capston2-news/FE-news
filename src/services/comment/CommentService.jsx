import axios from "axios";

export const postComment = async (articleId, content) => {
  try {
    const res = await axios.post(`/api/article/comments`, {
        article_id: articleId,
        content: content,
    }, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
    });
    
    return res.data;
  } catch (error) {
    console.error("Failed to post comment", error);
    return null;
  }
}

export const getCommentsByArticleId = async (articleId) => {
  try {
    const res = await axios.get(`/api/article/comments/${articleId}`, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch comments", error);
    return [];
  }
}