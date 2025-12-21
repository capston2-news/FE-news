import axios from "axios";

export const getArticleByRecommend = async () => {
  try {
    const res = await axios.post(`/api/recommend/user-topic-feed/`, 
    {
        topk: 10,
        min_focus: "0.35",
    },
    {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
    }
    );
    console.log(res.data);
    
    return res.data;
  } catch (error) {
    console.error("Error fetching recommended articles:", error);
    return [];
  }
}