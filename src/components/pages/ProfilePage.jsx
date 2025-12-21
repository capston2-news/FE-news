import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { logout as apiLogout } from "../../services/Auth";
import { useAuth } from "../../context/AuthContext";

import ProfileSidebar from "../profile/ProfileSidebar";
import AccountPanel from "../profile/AccountPanel";
import SavedNewsPanel from "../profile/SavedNewsPanel";
import SeenNewsPanel from "../profile/SeenNewsPanel";
import EmptyPanel from "../profile/EmptyPanel";

import { getInfomationOfUser } from "../../services/Auth";

export default function ProfilePage() {
  const { active, username } = useParams();
  const navigate = useNavigate(); // ✅ move lên trước
  const { logout: clearAuth } = useAuth();

  const currentTab = active || "general";

  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const handleUser = useCallback(async () => {
    setLoadingUser(true);
    try {
      const data = await getInfomationOfUser();
      setUserData(data || null);
    } catch {
      setUserData(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    handleUser();
  }, [handleUser]);

  const handleLogout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    } finally {
      clearAuth?.();
      navigate("/");
    }
  }, [clearAuth, navigate]);

  // ✅ logout phải chạy trong effect, không chạy trong render
  useEffect(() => {
    if (currentTab === "logout") {
      handleLogout();
    }
  }, [currentTab, handleLogout]);

  const handleChangeTab = (nextTab) => {
    navigate(`/profile/${username}/${nextTab}`);
  };

  const renderRight = () => {
    if (currentTab === "general") return <AccountPanel user={userData} />;

    if (currentTab === "feedback")
      return (
        <EmptyPanel
          title="Ý kiến của tôi"
          desc="(Demo) Nơi hiển thị phản hồi/đóng góp của bạn."
        />
      );

    // ✅ Panels tự fetch theo API, không cần allArticles nữa
    if (currentTab === "saved") return <SavedNewsPanel />;

    if (currentTab === "seen") return <SeenNewsPanel />;

    if (currentTab === "logout") {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Đang đăng xuất...
        </div>
      );
    }

    return null;
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Đang tải thông tin người dùng...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-0 py-0 lg:py-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4">
          <ProfileSidebar
            user={userData}
            active={currentTab}
            onChange={handleChangeTab}
          />
        </aside>

        <section className="lg:col-span-8">{renderRight()}</section>
      </div>
    </div>
  );
}
