// src/components/layout/NotificationBell.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotificationStreamUrl,
  listNotifications,
  markAllNotificationsRead,
  markReadNotifications,
} from "../../services/notification/NotificationService";

// ---------- helpers ----------
const oidStr = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v.$oid) return v.$oid;
  if (typeof v === "object" && v._id && v._id.$oid) return v._id.$oid;
  try { return String(v); } catch { return ""; }
};

const normalizeNotif = (raw) => {
  const id = raw?.id || oidStr(raw?._id);
  const is_read =
    raw?.is_read === true ||
    raw?.is_read === 1 ||
    raw?.is_read === "1" ||
    raw?.is_read === "true";

  return {
    id,
    is_read,
    message: String(raw?.message || ""),
    comment_id: oidStr(raw?.comment_id),
    article_id: oidStr(raw?.article_id),
    comment_content: String(raw?.comment_content || ""),
    article_title: String(raw?.article_title || ""),
  };
};

export default function NotificationBell({ user, closeOthers }) {
  const navigate = useNavigate();
  const wrapRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const hasUser = !!user;

  // ✅ chống tăng bậy (dedupe)
  const seenIdsRef = useRef(new Set());

  // ✅ track SSE state + polling fallback
  const esRef = useRef(null);
  const pollRef = useRef(null);
  const [sseOk, setSseOk] = useState(false);

  const applyList = useCallback((data) => {
    const mapped = (data?.items || []).map(normalizeNotif);
    setItems(mapped);
    setUnread(Number(data?.unread || 0));

    // reset seen set theo server list
    const s = seenIdsRef.current;
    s.clear();
    for (const it of mapped) if (it?.id) s.add(it.id);
  }, []);

  const fetchList = useCallback(async () => {
    try {
      const data = await listNotifications(30);
      applyList(data);
    } catch {
      applyList({ items: [], unread: 0 });
    }
  }, [applyList]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPollingIfNeeded = useCallback(() => {
    if (pollRef.current) return;
    // ✅ polling nhẹ: chỉ để unread tự cập nhật khi SSE fail
    pollRef.current = setInterval(() => {
      fetchList();
    }, 8000);
  }, [fetchList]);

  // Load initial
  useEffect(() => {
    if (!hasUser) {
      setItems([]);
      setUnread(0);
      seenIdsRef.current.clear();
      setSseOk(false);
      stopPolling();
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      return;
    }
    fetchList();
  }, [hasUser, fetchList, stopPolling]);

  // SSE realtime
  useEffect(() => {
    if (!hasUser) return;

    // close old
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const url = getNotificationStreamUrl();

    // ✅ quan trọng: withCredentials để gửi cookie nếu khác origin/proxy
    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    es.onopen = () => {
      setSseOk(true);
      stopPolling(); // SSE ok thì không poll
      // console.log("[SSE] connected", url);
    };

    const onNotif = (e) => {
      try {
        const payload = JSON.parse(e.data);
        const raw = payload?.notification || payload;
        const n = normalizeNotif(raw);
        if (!n?.id) return;

        const s = seenIdsRef.current;
        const existed = s.has(n.id);

        setItems((prev) => [n, ...prev.filter((x) => x.id !== n.id)].slice(0, 50));

        if (!existed) {
          s.add(n.id);
          if (!n.is_read) setUnread((u) => u + 1);
        }
      } catch {
        // ignore
      }
    };

    es.addEventListener("notification", onNotif);
    es.onmessage = onNotif;
    es.addEventListener("ping", () => {});

    es.onerror = () => {
      // ❗ nếu SSE không auth / CORS / proxy buffer -> sẽ vào đây liên tục
      setSseOk(false);
      startPollingIfNeeded();
    };

    return () => {
      es.removeEventListener("notification", onNotif);
      es.close();
      esRef.current = null;
    };
  }, [hasUser, startPollingIfNeeded, stopPolling]);

  // click outside close
  useEffect(() => {
    const onDown = (e) => {
      if (!open) return;
      const w = wrapRef.current;
      if (w && !w.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const dropdownClass = `
    absolute right-0 top-full mt-2 w-[min(420px,calc(100vw-1rem))]
    bg-white shadow-xl z-50
    transform origin-top-right transition-all duration-150
    ${open ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
           : "opacity-0 -translate-y-2 scale-95 pointer-events-none"}
  `;

  const toggle = async () => {
    closeOthers?.();
    const next = !open;
    setOpen(next);

    // ✅ mở dropdown thì sync lại (đảm bảo đúng)
    if (next && hasUser) await fetchList();
  };

  const handleMarkAll = async () => {
    if (!hasUser) return;
    const r = await markAllNotificationsRead();
    setUnread(Number(r?.unread || 0));
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
  };

  const handleClickItem = async (n) => {
    if (!n?.id) return;

    if (!n.is_read) {
      const r = await markReadNotifications([n.id]);
      if (typeof r?.unread === "number") setUnread(r.unread);
      else setUnread((u) => Math.max(0, u - 1));

      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    }

    if (n.article_id) {
      setOpen(false);
      navigate(`/article/${n.article_id}#comments`);
      return;
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={toggle}
        className="relative p-1 hover:text-slate-700 cursor-pointer transition text-slate-500"
        aria-label="Thông báo"
        title={sseOk ? "Thông báo (realtime)" : "Thông báo (đang sync...)"}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] leading-4 text-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      <div className={dropdownClass}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-slate-900">
            Thông báo {unread > 0 ? <span className="text-slate-500">({unread})</span> : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-[12px] text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              Đã đọc hết
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 hover:bg-slate-100 text-slate-500 cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto no-scrollbar">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">Chưa có thông báo.</div>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleClickItem(n)}
                className={`w-full text-left px-4 py-3 cursor-pointer transition
                  ${!n.is_read ? "bg-slate-50 hover:bg-slate-100" : "hover:bg-slate-50"}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-1.5">
                    {!n.is_read ? (
                      <span className="inline-block rounded-full w-2 h-2 bg-sky-500" />
                    ) : (
                      <span className="inline-block w-2 h-2 bg-transparent" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-slate-900 truncate">
                      {n.article_title || "Bài viết"}
                    </div>

                    {n.comment_content ? (
                      <div className="mt-0.5 text-[13px] text-slate-700 truncate">
                        {n.comment_content}
                      </div>
                    ) : null}

                    {n.message ? (
                      <div className="mt-1 text-[11px] text-slate-500 truncate">{n.message}</div>
                    ) : null}
                  </div>

                  <div className="pt-1 text-slate-400">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
