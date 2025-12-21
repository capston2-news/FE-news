// src/services/WeatherService.js
import axios from "axios";

export const searchLocations = async (q) => {
  try {
    const res = await axios.get("/api/weather/locations/", {
      params: { q, country: "VN", limit: 10, lang: "vi" },
      headers: { "Content-Type": "application/json" },
    });
    return res.data?.results || [];
  } catch (error) {
    console.error("Failed to search weather locations", error);
    return [];
  }
};

export const getForecast = async ({ lat, lon, tz = "Asia/Ho_Chi_Minh", days = 7 }) => {
  try {
    const res = await axios.get("/api/weather/forecast/", {
      params: { lat, lon, tz, days },
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch forecast", error);
    return null;
  }
};

export const getTodayWeather = async ({ lat, lon, tz = "Asia/Ho_Chi_Minh" }) => {
  try {
    const res = await axios.get("/api/weather/forecast/", {
      params: { lat, lon, tz, days: 1 },
      headers: { "Content-Type": "application/json" },
    });
    const data = res.data || {};
    const cur = data.current || null;
    if (!cur) return null;
    return {
      temperature: cur.temperature_2m,
      weather_code: cur.weather_code,
      apparent_temperature: cur.apparent_temperature,
      relative_humidity_2m: cur.relative_humidity_2m,
      wind_speed_10m: cur.wind_speed_10m,
    };
  } catch (error) {
    console.error("Failed to fetch today weather", error);
    return null;
  }
};

export const getVietnamHeatmap = async () => {
  try {
    const res = await axios.get("/api/weather/vn-heatmap/", {
      headers: { "Content-Type": "application/json" },
    });
    return res.data?.results || [];
  } catch (error) {
    console.error("Failed to fetch VN heatmap", error);
    return [];
  }
};
