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
        <div className={"mt-1 text-sm " + (dim ? "text-slate-400" : "text-slate-600")}>
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
        <FieldRow label="Ảnh đại diện" value="" right={<AvatarCircle letter={user.avatarLetter} />} />
        <FieldRow label="Họ tên" value={user.name ? user.name : "Chưa có dữ liệu"} dim={!user.name} />
        <FieldRow label="Email" value={user.email} />
        <FieldRow label="Mật khẩu" value="••••••••••••" />

        <div className="py-4 border-b border-slate-200">
          <div className="text-sm font-semibold text-slate-800">Kết nối tài khoản</div>
          <div className="mt-1 text-sm text-slate-600">
            Kết nối tài khoản của bạn với Google, Facebook hoặc Apple bằng những tài khoản này.
          </div>

          <div className="mt-3 space-y-2">
            <button className="w-full flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2.5 hover:bg-slate-50">
              <span className="w-5 h-5 flex items-center justify-center font-bold">G</span>
              <span className="text-sm font-semibold text-slate-800">Google</span>
            </button>

            <button className="w-full flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2.5 hover:bg-slate-50 opacity-60">
              <span className="w-5 h-5 flex items-center justify-center font-bold">f</span>
              <span className="text-sm font-semibold text-slate-800">Facebook</span>
            </button>
          </div>
        </div>
      </div>

      <h3 className="mt-6 text-xl font-bold text-slate-900">Thông tin cá nhân</h3>
      <div className="mt-4">
        <FieldRow label="Ngày sinh" value={user.birthday ? user.birthday : "Chưa có thông tin"} dim={!user.birthday} />
        <FieldRow label="Giới tính" value={user.gender ? user.gender : "Không chia sẻ"} dim={!user.gender} />
        <FieldRow label="Số điện thoại cá nhân" value={user.phone ? user.phone : "Chưa có thông tin"} dim={!user.phone} />
        <FieldRow label="Địa chỉ" value={user.address ? user.address : "Chưa có thông tin"} dim={!user.address} />
      </div>
    </div>
  );
}
