import React from "react";

function AvatarCircle({ letter = "N" }) {
  return (
    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-600">
      {letter}
    </div>
  );
}

function FieldRow({ label, value, right, dim = false }) {
  return (
    <div className="py-4 border-b border-slate-200 flex items-start justify-between gap-6">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-800">{label}</div>
        <div className={"mt-1 text-sm " + (dim ? "text-slate-600" : "text-slate-600")}>
          {value}
        </div>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export default function AccountPanel({ user }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
      <h2 className="text-xl font-bold text-slate-900">Thông tin tài khoản</h2>

      <div className="mt-4">
        <FieldRow label="Ảnh đại diện" value="" right={<AvatarCircle letter={((user?.username || "").trim().charAt(0) || "U").toUpperCase()} />} />
        <FieldRow label="Họ tên" value={user.fullname ? user.fullname : "Chưa có dữ liệu"} dim={!user.name} />
        <FieldRow label="Email" value={user.email} />
        <FieldRow label="Tuổi" value={user.age ? user.age : "Chưa có thông tin"} dim={!user.age} />
        <FieldRow label="Vai trò" value={user.role ? user.role : "Chưa có thông tin"} dim={!user.role} />
      </div>

    </div>
  );
}
