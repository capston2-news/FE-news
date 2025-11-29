import axios from "axios";

export const getArticleByCategory = async (category) => {
  try {
    const res = await axios.get(`/api/articles/category/${category}/`, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching articles by category", error);
    return [];
  }
};

export const getAllArticle = async () => {
    try {
        const res = await axios.get(`/api/articles/all/`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching all articles", error);
        return [];
    }
};

export const getArticleById = async (id) => {
    try {
        const res = await axios.get(`/api/article/${id}`, {
            headers: {  
                "Content-Type": "application/json",
            },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching article by ID", error);
        return null;
    }
};

export const getArticleExpectArticleId = async (id) => {
    try {
        const res = await axios.get(`/api/article/expect/${id}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching articles excluding specific ID", error);
        return [];
    }
};

export const handleTextToSpeech = async (data) => {
    try {
        const res = await axios.post(`/api/article/text/sound`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return res.data;
    } catch (error) {
        console.error("Error in text-to-speech request", error);
        return null;
    }
};