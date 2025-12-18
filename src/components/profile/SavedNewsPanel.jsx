import React from "react";
import NewsListPanel from "./NewsListPanel";

export default function SavedNewsPanel({ allArticles }) {
  return (
    <NewsListPanel
      title="Tin đã lưu"
      storageKey="bookmarks"
      allArticles={allArticles}
      emptyText="Chưa có tin đã lưu. Hãy bấm bookmark ở bài viết để lưu."
      mode="saved"
    />
  );
}
