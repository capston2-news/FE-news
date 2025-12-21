// src/services/notification/NotificationService.js
import axios from "axios";

// SSE URL: vì Vite proxy đã map /api -> 127.0.0.1:8000
export const getNotificationStreamUrl = () => "/api/notifications/stream/";

export const listNotifications = async (limit = 30) => {
  try {
    const res = await axios.get("/api/notifications/user", {
      params: { limit },
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
    return res.data; // { items, unread }
  } catch (error) {
    console.error("Failed to list notifications", error);
    return { items: [], unread: 0 };
  }
};

export const markReadNotifications = async (ids = []) => {
  try {
    const res = await axios.post(
      "/api/notifications/mark-read/",
      { ids },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
    return res.data; // { ok, unread }
  } catch (error) {
    console.error("Failed to mark notifications read", error);
    return { ok: false, unread: 0 };
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const res = await axios.post(
      "/api/notifications/mark-read/",
      { all: true },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
    return res.data; // { ok, unread }
  } catch (error) {
    console.error("Failed to mark all notifications read", error);
    return { ok: false, unread: 0 };
  }
};
