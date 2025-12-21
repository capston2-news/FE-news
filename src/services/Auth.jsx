import axios from "axios";

export const login = async (account) => {
  console.log(account);
  
  try {
    const res = await axios.post("/api/auth/login/", account, {
      withCredentials: true, // để browser nhận cookies access/refresh/role
      headers: {
        "Content-Type": "application/json", // có cũng được, axios tự set
      },
    });
    console.log("Login successful");
    return res.data;
  } catch (error) {
    console.error("Login failed", error);
    return null;
  }
};

export const logout = async () => {
    try {
        const res = await axios.post("/api/auth/logout/", {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log("Logout successful");
        return true;
    } catch (error) {
        console.error("Logout failed", error);
        return false;
    }
}

export const registerApi = async (payload) => {
  try {
    const res = await axios.post("/api/auth/register/", payload, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("Register failed", error);
    if (error.response) {
      return {
        ok: false,
        status: error.response.status,
        detail: error.response.data?.detail || "Register failed",
      };
    }
    return { ok: false, status: 0, detail: "Network error" };
  }
};

export const getInfomationOfUser = async () => {
  try {
    const res = await axios.get("/api/auth/me/", {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Get user info failed", error);
    return null;
  }
};
