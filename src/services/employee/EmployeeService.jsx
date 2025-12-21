// services/employee/EmployeeService.jsx
import axios from "axios";

const API_URL = "http://localhost:8080/api/employee";

export const findAll = async () => {
    // Axios trả về response object, data thực sự nằm trong response.data
    try {
        const res = await axios.get("/api/getall/users/", {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
        return res.data.results;
    } catch (error) {
        console.error("Failed to fetch all articles", error);
        return [];
    }
};

export const findById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data; // Hoặc response nếu muốn xử lý tương tự findAll
};

export const createEmployee = async (data) => {
    try {
        const res = await axios.post(
            "/api/admin/users/",
            data,
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            }
        );
        return res; // ✅ nhớ return để component dùng res.data nếu cần
    } catch (error) {
        console.error("createEmployee error:", error);
        throw error; // ✅ ném lên để UI bắt lỗi
    }
};

export const editEmployee = (id, data) => {
    return axios.patch(`/api/users/${id}/`, data, {
        withCredentials: true,
        headers:  { "Content-Type": "application/json" },
    });
};

// soft delete theo đúng backend bạn viết: DELETE -> set is_active false (+ is_deleted true nếu có)
export const deleteEmployeeById = (id) => {
    return axios.patch(
        `/api/users/${id}/`,
        { is_deleted: true, is_active: false },   // body
        {
            withCredentials: true,                  // config
            headers: { "Content-Type": "application/json" },
        }
    );
};