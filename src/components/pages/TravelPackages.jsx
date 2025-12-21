import React from "react";
import { Link } from "react-router-dom";

const TravelPackages = ({ title = "Top Articles", data = [], loading }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">{title}</h2>

        <Link
          to="/article?category=thoi-su"
          className="text-sm text-blue-600 hover:underline"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : data?.length ? (
        <div className="space-y-3">
          {data.map((x) => (
            <div key={String(x.article_id)} className="p-3 rounded-xl border border-slate-100">
              <div className="font-medium line-clamp-2">{x.title}</div>
              <div className="text-sm text-slate-500 mt-1 flex items-center justify-between">
                <span>{x.site || "—"}</span>
                <span className="font-semibold">{(x.views ?? 0).toLocaleString("vi-VN")} views</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-slate-500">No data</div>
      )}
    </div>
  );
};

export default TravelPackages;
