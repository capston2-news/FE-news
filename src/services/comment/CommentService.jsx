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


export const lookupArticleIdByCommentId = async (commentId) => {
  try {
    if (!commentId) return null;

    const res = await axios.get(`/api/comments/${commentId}/lookup-article/`, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });

    return res.data; // { comment_id, article_id }
  } catch (error) {
    console.error("Failed to lookup articleId by commentId", error);
    return null;
  }
};