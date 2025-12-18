import React from "react";

const NAV = [
  { id: "general", label: "Thông tin chung" },
  { id: "feedback", label: "Ý kiến của bạn (0)" },
  { id: "saved", label: "Tin đã lưu" },
  { id: "seen", label: "Tin đã xem" },
  { id: "logout", label: "Thoát" },
];

function AvatarCircle({ letter = "N" }) {
  return (
    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-600">
      {letter}
    </div>
  );
}

export default function ProfileSidebar({ user, active, onChange }) {
  return (
    <div className="sticky top-30 space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b border-slate-200">
          <AvatarCircle letter={user.avatarLetter} />
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 truncate">{user.username}</div>
            <div className="text-xs text-slate-500">Tham gia từ {user.joinedAt}</div>
          </div>
        </div>

        <nav className="p-2">
          {NAV.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition " +
                  (isActive
                    ? "text-rose-600 bg-rose-50"
                    : "text-slate-700 hover:bg-slate-50")
                }
                type="button"
              >
                <span>{item.label}</span>
                {item.id === "logout" ? (
                  <svg
                    className="w-4 h-4 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                ) : (
                  <span className="text-xs text-slate-400">›</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="text-sm text-slate-600">Cần hỗ trợ, vui lòng liên hệ:</div>
        <a
          className="mt-1 inline-block text-sm font-semibold text-sky-600 hover:text-sky-700"
          href="mailto:bandoc@vnexpress.net"
        >
          bandoc@vnexpress.net
        </a>
      </div>
    </div>
  );
}
