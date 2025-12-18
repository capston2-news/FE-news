// components/layout/CategoryTabs.jsx
import React from "react";

const CategoryTabs = ({ categories, activeId, onChange }) => {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 flex gap-4 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={`relative py-3 text-xs md:text-sm font-medium whitespace-nowrap
                ${
                  isActive
                    ? "text-sky-600"
                    : "text-slate-600 hover:text-sky-500"
                }`}
            >
              <span className="flex items-center gap-1.5">
                {cat.id === "all" && <span>🔥</span>}
                {cat.name}
              </span>
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] bg-sky-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
