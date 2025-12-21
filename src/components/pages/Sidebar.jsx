// Sidebar.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { navigationConfig } from "../../routes/route";
import { adminGetPendingCommentsCount } from "../../services/comments/CommentService.jsx";

import { logout as apiLogout } from "../../services/Auth"; 
import { useAuth } from "../../../context/AuthContext"; 

import booking from "../../assets/booking.png";
import author from "../../assets/author.webp";
import article from "../../assets/article.png";
import dashboard from "../../assets/dashboard.png";
import category from "../../assets/hotel.png";
import employee from "../../assets/employee.png";
import reader from "../../assets/customer-review.png";
import mana from "../../assets/mana.png";

const LS_KEY = "pending_comments_last_seen_ts";
const POLL_MS = 5000;

const normalizeBasePath = (path) => {
  if (!path) return "";
  let p = String(path).split("?")[0].split("#")[0];
  p = p.replace(/\/\*.*$/, "");
  p = p.replace(/\/:[^/]+/g, "");
  p = p.replace(/\/+$/, "");
  return p || "/";
};

const Sidebar = ({ open = true, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout: clearAuth } = useAuth(); // ✅ lấy role + logout context

  const LABEL_VI = {
    Dashboard: "Thống kê",
    Article: "Bài viết",
    Comments: "Bình luận",
    Category: "Danh mục",
    Author: "Tác giả",
    Employee: "Nhân viên",
    Reader: "Người đọc",
  };

  const icons = {
    Dashboard: dashboard,
    Employee: employee,
    Reader: reader,
    Category: category,
    Comments: booking,
    Author: author,
    Article: article,
  };

  const commentsPath = useMemo(() => {
    const it = navigationConfig.find((x) => x.label === "Comments");
    return it?.path || "";
  }, []);

  const commentsBase = useMemo(() => normalizeBasePath(commentsPath), [commentsPath]);

  const isOnComments = useMemo(() => {
    const p = (location.pathname || "").replace(/\/+$/, "");
    if (!commentsBase) return false;
    if (p === commentsBase) return true;
    return p.startsWith(commentsBase + "/");
  }, [location.pathname, commentsBase]);

  // ✅ Lọc menu theo role:
  // - employee: ẩn Reader
  // - admin: hiện tất cả
  const filteredNav = useMemo(() => {
    const role = user?.role;
    if (role === "employee") {
      return navigationConfig.filter((it) => it.label !== "Reader" && it.label !== "Employee");
    }
    return navigationConfig; // admin hoặc role khác (nếu có) thì hiện hết
  }, [user?.role]);

  const [pendingCount, setPendingCount] = useState(0);

  const reqSeqRef = useRef(0);
  const aliveRef = useRef(true);
  const timerRef = useRef(null);
  const inFlightRef = useRef(false);

  const fetchCount = useCallback(async () => {
    if (isOnComments) return;
    if (inFlightRef.current) return;

    const afterTs = Number(localStorage.getItem(LS_KEY) || 0);
    const seq = ++reqSeqRef.current;

    inFlightRef.current = true;
    try {
      const n = await adminGetPendingCommentsCount({ afterTs });

      if (!aliveRef.current) return;
      if (seq !== reqSeqRef.current) return;

      setPendingCount(Number(n) || 0);
    } catch (e) {
      console.error("pending-count error:", e);
    } finally {
      inFlightRef.current = false;
    }
  }, [isOnComments]);

  useEffect(() => {
    aliveRef.current = true;

    const scheduleNext = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        await fetchCount();
        scheduleNext();
      }, POLL_MS);
    };

    fetchCount();
    scheduleNext();

    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchCount();
    };
    const onFocus = () => fetchCount();

    const onSeen = () => setPendingCount(0);
    const onChanged = () => fetchCount();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("comments:seen", onSeen);
    window.addEventListener("comments:changed", onChanged);

    return () => {
      aliveRef.current = false;
      clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("comments:seen", onSeen);
      window.removeEventListener("comments:changed", onChanged);
    };
  }, [fetchCount, location.pathname]);

  const showBadge = pendingCount > 0 && !isOnComments;
  const badgeText = pendingCount > 99 ? "99+" : String(pendingCount);

  // ✅ Đăng xuất
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // gọi API logout (xoá cookie ở BE nếu có)
      await apiLogout();
    } catch (e) {
      // vẫn logout ở FE cho chắc
      console.error("logout api error:", e);
    } finally {
      // clear auth + dọn badge state
      clearAuth();
      localStorage.removeItem(LS_KEY);
      setPendingCount(0);

      navigate("/login", { replace: true });
      setLoggingOut(false);
    }
  };

  return (
    <div className={`w-64 h-screen bg-white border-r border-gray-200 p-4 ${open ? "" : "hidden"}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <span className="text-5xl mr-2">
            <img src={mana} alt="" className="w-12 h-12 ml-2" />
          </span>
          <div className="flex flex-col">
            <h1 className="text-[18px] font-semibold mt-2">
              Quản lý <span>hệ thống</span>
            </h1>
            {/* ✅ hiển thị role nhỏ nhỏ */}
            <span className="text-xs text-gray-500">
              {user?.username ? `${user.username} • ${user.role}` : ""}
            </span>
          </div>
        </div>
      </div>

      <nav>
        {filteredNav.map((item, index) => {
          const iconSource = icons[item.label];
          const labelText = LABEL_VI[item.label] || item.label;

          const badgeOk = item.label === "Comments" && showBadge;

          return (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                `flex items-center p-3 mb-2 rounded-lg cursor-pointer font-semibold text-[16px] ${
                  isActive ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
                }`
              }
            >
              <span className="mr-3">
                <img src={iconSource} alt={labelText} className="w-10 h-10" />
              </span>

              <span className="flex-1">{labelText}</span>

              {badgeOk && (
                <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[12px] font-bold bg-red-500 text-white">
                  {badgeText}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ✅ Logout button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg font-semibold text-[16px] transition
            ${loggingOut ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-red-50 hover:bg-red-100 text-red-600"}`}
        >
          {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
