// src/components/pages/article/ArticleBody.jsx
import React from "react";
import { hasAnhWord } from "./ArticleUtils";

export default function ArticleBody({
  articleBodyRef,
  article,
  dateText,
  heroImg,
  paragraphs,
  blocks,
}) {
  return (
    <article ref={articleBodyRef} className="flex-1 max-w-3xl w-full mx-auto">
      <h1 className="text-2xl md:text-3xl lg:text-[32px] font-bold text-slate-900 leading-snug mb-4">
        {article.title}
      </h1>

      {/* HERO (khi content không có marker Ảnh:) */}
      {heroImg && !paragraphs.some((p) => hasAnhWord(p)) && (
        <figure className="mb-6">
          <img
            src={heroImg}
            alt={article.title}
            className="w-full h-auto object-contain rounded-none"
          />
        </figure>
      )}

      {/* Content blocks */}
      {(blocks || []).map((b) => {
        if (b.type === "figure") {
          return (
            <figure key={b.key} className="my-3">
              <img src={b.src} alt="" className="w-full h-auto object-contain rounded-none" />

              {(b.caption || b.credit) && (
                <figcaption className="mt-1 text-center leading-snug">
                  {b.caption && (
                    <div className="text-[13px] text-slate-500 mb-1 italic">{b.caption}</div>
                  )}
                  {b.credit && (
                    <div className="text-[12px] uppercase tracking-wide text-slate-500 italic">
                      {b.credit}
                    </div>
                  )}
                </figcaption>
              )}
            </figure>
          );
        }

        return (
          <p
            key={b.key}
            className="text-base md:text-[16px] lg:text-[18px] text-slate-800 leading-relaxed mb-4"
          >
            {b.text}
          </p>
        );
      })}
    </article>
  );
}
