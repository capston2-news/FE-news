// src/components/admin/dashboard/Messages.jsx
import React from "react";

const Messages = ({ title = "Comments", pendingCount = 0, data = [], loading }) => {
  return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">{title}</h2>
          <a href="/admin/comments" className="text-sm text-blue-600 hover:underline">
            Moderate
          </a>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-sm text-slate-500">Pending comments</div>
          <div className="text-2xl font-semibold">{loading ? "…" : pendingCount}</div>
        </div>

        {/* Nếu bạn có endpoint recent comments thì data sẽ hiện */}
          {loading ? (
              <div className="text-slate-500">Loading…</div>
          ) : data?.length ? (
              <div className="space-y-3">
                  {data.map((c) => (
                      <div
                          key={String(c?._id || c?.id || Math.random())}
                          className="p-3 rounded-xl border border-slate-100"
                      >
                          <div className="text-sm text-slate-500">{c?.username || "user"}</div>
                          <div className="mt-1 line-clamp-2">{c?.content || ""}</div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="text-slate-500"></div>
          )}
      </div>
  );
};

export default Messages;
