import axios from "axios";

export const getBookmarksByUserId  = async (customerId) => {
    // Axios trả về response object, data thực sự nằm trong response.data
    try {
        const res = await axios.get(`/api/admin/users/${customerId}/bookmarks/`, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log(res.data);
        return res.data;
    } catch (error) {
        console.error("Failed to fetch all articles", error);
        return [];
    }
};