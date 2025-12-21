// src/components/admin/dashboard/RevenueChart.jsx
import React from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

const RevenueChart = ({ title = "Views Overview", data = [], loading }) => {
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
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />

                            {/* ✅ màu */}
                            <Area
                                type="monotone"
                                dataKey="views"
                                stroke="#2563eb"      // xanh dương
                                fill="#93c5fd"        // xanh nhạt
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default RevenueChart;
