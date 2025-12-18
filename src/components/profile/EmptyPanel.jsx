import React from "react";

export default function EmptyPanel({ title, desc }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </div>
  );
}
