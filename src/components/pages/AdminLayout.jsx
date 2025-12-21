import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/pages/Sidebar.jsx"; // sửa path đúng dự án bạn

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    // ✅ đổi route xong thì tự ẩn sidebar
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 relative">
                {/* nút mở lại */}
                {!sidebarOpen && (
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="fixed top-4 left-4 z-50 bg-white border rounded-lg px-3 py-2 shadow hover:bg-gray-50"
                        title="Mở sidebar"
                    >
                        ☰
                    </button>
                )}

                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
