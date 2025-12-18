import React from "react";
import NewsListPanel from "./NewsListPanel";

export default function SeenNewsPanel({ allArticles }) {
  return (
    <NewsListPanel
      title="Tin đã xem"
      storageKey="viewedArticles"
      allArticles={allArticles}
      emptyText="Chưa có tin đã xem. Khi bạn mở bài viết, hệ thống sẽ lưu vào đây."
      mode="seen"
    />
  );
}
