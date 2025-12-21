import axios from "axios";

export const getArticleTop10ViewsThisMonth = async () => {
  try {
    const res = await axios.get("/api/articles/month/", {
        headers: {
            "Content-Type": "application/json",
        },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch top 10 viewed articles", error);
    return [];
  }
}

export const IncreseArticleViewCount = async (articleId) => {
  try {
    const res = await axios.post(`/api/recommend/log/`, {
        article_id: articleId,
        action: "view",
    },
  {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
    return res.data;
  } catch (error) {
    console.error("Failed to increase article view count", error);
    return null;
  }
}

export const getAllArticles = async () => {
  try {
    const res = await axios.get("/api/articles/all/", {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch all articles", error);
    return [];
  }
}

export const getArticlesByCategorySlug = async (slug) => {
  try {
    const res = await axios.get(`/api/articles/category/${slug}/`, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch articles for category slug: ${slug}`, error);
    return [];
  }
}

export const getArticlesByArticleChild = async (slug, childSlug) => {
  try {
    const res = await axios.get(`/api/articles/category/${slug}/child/${childSlug}/`, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch articles for category slug: ${slug} and child slug: ${childSlug}`, error);
    return [];
  }
}

export const getArticleById = async (articleId) => {
  try {
    const res = await axios.get(`/api/article/${articleId}`, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch article with ID: ${articleId}`, error);
    return null;
  }
}

export const getArticleExpectForArticleById = async (articleId) => {
  try {
    const res = await axios.get(`/api/article/expect/${articleId}`, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch articles excluding article with ID: ${articleId}`, error);
    return [];
  }
}

export const textToSpeech = async (text) => {
  try {
    const res = await axios.post(`/api/article/text/sound`, 
      {
        text: text,
        lang: "vi"
      }
      ,
      {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });
    console.log(text);
    
    const audioUrl = res?.data?.audio_url || "";
    const fullUrl = "http://127.0.0.1:8000/" + audioUrl;
    return { audio_url: fullUrl };
  } catch (error) {
    console.error(`Failed to convert article with ID: ${articleId} to speech`, error);
    return null;
  }
}

export const searchArticlesByKeyword = async (keyword) => {
  try {
    const res = await axios.get(`/api/article/search/?key=${encodeURIComponent(keyword)}`, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });
    return res.data;
  } catch (error) {
    console.error(`Failed to search articles with keyword: ${keyword}`, error);
    return [];
  }
}

export const getHistoryArticleOfUser = async () => {
  try {
    const res = await axios.get("/api/articles/history/viewed/", {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch user's article history", error);
    return [];
  }
}