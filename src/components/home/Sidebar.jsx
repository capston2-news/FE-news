// components/home/Sidebar.jsx
import React from "react";

const Sidebar = ({ trending, topics }) => {
  return (
    <aside className="space-y-5">
      {/* Intro / CTA */}
      <div className="border border-slate-200 rounded-3xl p-4 bg-gradient-to-br from-sky-50 to-white">
        <h3 className="text-sm font-semibold mb-1 text-slate-900">
          Tham gia Động Nhện
        </h3>
        <p className="text-xs text-slate-600 mb-3">
          Viết điều bạn nghĩ, chia sẻ với cộng đồng những người thích đọc và
          suy ngẫm.
        </p>
        <button className="w-full text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-full shadow-sm">
          Đăng ký tài khoản
        </button>
      </div>

      {/* Trending */}
      <div className="border border-slate-200 rounded-3xl p-4 bg-white">
        <h3 className="text-sm font-semibold mb-3 text-slate-900">
          Đang được quan tâm
        </h3>
        <ul className="space-y-3">
          {trending.map((item, idx) => (
            <li key={item.id} className="flex gap-2">
              <span className="text-xs font-semibold text-sky-600 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <p className="text-sm font-medium leading-snug line-clamp-2 text-slate-900">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-500">{item.views}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Topics */}
      <div className="border border-slate-200 rounded-3xl p-4 bg-white">
        <h3 className="text-sm font-semibold mb-3 text-slate-900">
          Chủ đề phổ biến
        </h3>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <button
              key={topic}
              className="px-3 py-1 rounded-full bg-slate-100 text-[11px] text-slate-700 hover:bg-slate-200"
            >
              #{topic}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
