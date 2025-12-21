// src/components/admin/dashboard/TopDestinations.jsx
import React from "react";
import { PieChart, Pie, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts";

// ✅ bảng màu (bạn có thể đổi theo style của bạn)
const COLORS = [
    "#2563eb", // blue
    "#7c3aed", // purple
    "#16a34a", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#0ea5e9", // sky
    "#14b8a6", // teal
    "#a855f7", // violet
];

const TopDestinations = ({ title = "Views by Category", data = [], loading }) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">{title}</h2>
            </div>

            <div className="h-72">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-500">
                        Loading chart…
                    </div>
                ) : data?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="views"
                                nameKey="name"
                                innerRadius="55%"
                                outerRadius="80%"
                                paddingAngle={2}
                            >
                                {/* ✅ mỗi slice 1 màu */}
                                {data.map((_, idx) => (
                                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                ))}
                            </Pie>

                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">
                        No data
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopDestinations;
