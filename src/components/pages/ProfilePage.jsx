import React, { useMemo, useState } from "react";
import { articles } from "../../data";

import ProfileSidebar from "../profile/ProfileSidebar";
import AccountPanel from "../profile/AccountPanel";
import SavedNewsPanel from "../profile/SavedNewsPanel";
import SeenNewsPanel from "../profile/SeenNewsPanel";
import EmptyPanel from "../profile/EmptyPanel";

export default function ProfilePage() {
  const user = useMemo(
    () => ({
      username: "nvp15072003",
      joinedAt: "12/2025",
      email: "nvp15072003@gmail.com",
      name: "",
      avatarLetter: "N",
      birthday: "",
      gender: "",
      phone: "",
      address: "",
    }),
    []
  );

  const [active, setActive] = useState("general");

  const renderRight = () => {
    if (active === "general") return <AccountPanel user={user} />;

    if (active === "feedback")
      return <EmptyPanel title="Ý kiến của bạn" desc="(Demo) Nơi hiển thị phản hồi/đóng góp của bạn." />;

    if (active === "saved") return <SavedNewsPanel allArticles={articles} />;

    if (active === "seen") return <SeenNewsPanel allArticles={articles} />;

    if (active === "logout")
      return <EmptyPanel title="Thoát" desc="(Demo) Xử lý logout tại đây (xóa token, redirect...)." />;

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-0 py-0 lg:py-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4">
          <ProfileSidebar user={user} active={active} onChange={setActive} />
        </aside>

        <section className="lg:col-span-8">{renderRight()}</section>
      </div>
    </div>
  );
}
