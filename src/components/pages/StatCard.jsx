// src/components/admin/dashboard/StatCard.jsx
import React from "react";

const StatCard = ({ icon, title, value, change, isPositive }) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
                <div>

                    <div className="text-sm text-slate-500">{title}</div>
                    <div className="text-2xl font-semibold mt-2">{value}</div>
                    <div className={`text-sm mt-2 ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                        {change}
                    </div>
                </div>
                <img src={icon} alt="" className="w-10 h-10 object-contain"/>
            </div>
        </div>
    );
};

export default StatCard;
