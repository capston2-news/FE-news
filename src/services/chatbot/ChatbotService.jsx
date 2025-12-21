import axios from "axios";

export const fetchChatbotResponse = async (message, conversation_id, article_id) => {
  try {
    const response = await axios.post(
      "/api/chatbot/chat/",
      {
        message: message,
        conversation_id: conversation_id,
        article_id: article_id ?? null,
      },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching chatbot response:", error);
    throw error;
  }
};

export const CreateNewConversation = async () => {
  try {
    const response = await axios.post("/api/chatbot/chat/new-conversation/",
    {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });
    console.log(response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error creating new conversation:", error);
    throw error;
  }
};