// src/components/pages/article/ArticleUtils.js

// ---------------------- helpers ----------------------
export const oidOf = (x) => x?._id?.$oid || x?._id || x?.id || null;

export const pickFirstImage = (images) => {
  if (!images) return "";
  if (typeof images === "string") return images;
  if (Array.isArray(images)) return images[0] || "";
  if (typeof images === "object") return images.url || images.src || "";
  return "";
};

export const formatDateVi = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
};

export const normalizeArticleDetail = (a) => {
  const published = a?.published_at?.$date || a?.published_at || a?.date || "";
  const created = a?.created_at?.$date || a?.created_at || "";
  const updated = a?.updated_at?.$date || a?.updated_at || "";

  return {
    _raw: a,
    oid: oidOf(a),
    title: a?.title || "",
    content: a?.content || "",
    images: Array.isArray(a?.images) ? a.images : a?.images ? [a.images] : [],
    published_at: published,
    created_at: created,
    updated_at: updated,

    site: a?.site || "",
    external_url: a?.external_url || "",

    category_name: a?.category_name || "",
    category_slug: a?.category_slug || "",
    category_child_name: a?.category_child_name || "",
    category_child_slug: a?.category_child_slug || "",

    is_bookmarked: !!a?.is_bookmarked,

    comments: Array.isArray(a?.comments) ? a.comments : [],
    comment_count:
      a?.comment_count ?? (Array.isArray(a?.comments) ? a.comments.length : 0),
  };
};

// ---------------------- buildRichBlocks ----------------------
export const norm = (s) => String(s || "").trim();

// marker mạnh: dòng bắt đầu bằng "Ảnh:"
export const hasAnhWord = (p) => /^ảnh\s*:\s*/i.test(norm(p));

// ✅ CHỈ coi là credit Reuters khi CẢ DÒNG là "Ảnh: Reuters"
export const isReutersCreditLine = (p) => {
  const t = norm(p);
  return /^ảnh\s*:\s*reuters\s*\.?\s*$/i.test(t);
};

// ✅ nếu caption có dạng nhiều dòng và dòng cuối là "Ảnh: Reuters" -> bỏ riêng dòng đó
export const stripReutersFromCaption = (text) => {
  const t = String(text || "");
  const lines = t
    .split("\n")
    .map((x) => norm(x))
    .filter(Boolean);

  if (!lines.length) return "";

  if (lines.length === 1 && isReutersCreditLine(lines[0])) return "";

  if (isReutersCreditLine(lines[lines.length - 1])) {
    return lines.slice(0, -1).join("\n");
  }

  return lines.join("\n");
};

const isBinhLuanStart = (p) => norm(p).toLowerCase().startsWith("bình luận");

const stripFromBinhLuan = (paragraphs) => {
  const arr = Array.isArray(paragraphs) ? paragraphs : [];
  const idx = arr.findIndex((p) => isBinhLuanStart(p));
  return idx >= 0 ? arr.slice(0, idx) : arr;
};

const extractCredit = (captionLine) => {
  const t = norm(captionLine);
  const m = t.match(/^ảnh\s*:\s*(.+)$/i);
  if (!m) return { credit: "", caption: t };

  const creditText = (m[1] || "").trim();

  // ✅ chỉ xoá Reuters, còn nguồn khác giữ nguyên
  if (/^reuters\b/i.test(creditText)) {
    return { credit: "", caption: "" };
  }

  return { credit: creditText ? `ẢNH: ${creditText}` : "ẢNH", caption: "" };
};

export const buildRichBlocks = (paragraphs, images) => {
  const imgs = Array.isArray(images) ? images : [];
  const rawParas = Array.isArray(paragraphs) ? paragraphs : [];

  // ✅ cắt “Bình luận …”
  const paras = stripFromBinhLuan(rawParas);

  const needInline = paras.some((p) => hasAnhWord(p));
  const hero = !needInline ? (imgs[0] || "") : "";
  const rest = needInline ? imgs : imgs.slice(1);

  let imgIdx = 0;
  const blocks = [];

  for (let i = 0; i < paras.length; i++) {
    const p = norm(paras[i]);
    if (!p) continue;

    // ✅ nếu là 1 dòng riêng "Ảnh: Reuters" mà KHÔNG dùng làm marker ảnh -> xoá
    if (isReutersCreditLine(p) && !(needInline && hasAnhWord(p))) {
      continue;
    }

    // ✅ gặp dòng "Ảnh: ..." -> chèn ảnh + caption/credit dưới ảnh
    if (needInline && hasAnhWord(p)) {
      if (!rest[imgIdx]) continue;

      // caption = dòng ngay trước (nếu block cuối là paragraph)
      let captionText = "";
      if (blocks.length && blocks[blocks.length - 1]?.type === "p") {
        const prevText = blocks[blocks.length - 1]?.text || "";
        if (prevText && !hasAnhWord(prevText)) {
          captionText = prevText;
          blocks.pop();
        }
      }

      captionText = stripReutersFromCaption(captionText);

      const { credit } = extractCredit(p); // Reuters -> ""

      blocks.push({
        type: "figure",
        src: rest[imgIdx],
        caption: captionText,
        credit,
        key: `fig_${imgIdx}_${i}`,
      });

      imgIdx += 1;
      continue;
    }

    blocks.push({ type: "p", text: p, key: `p_${i}` });
  }

  return { hero, blocks };
};


export const timeAgoVi = (input) => {
  if (!input) return "";

  const d = input?.$date ? new Date(input.$date) : new Date(input);
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  let diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) diffMs = 0;

  const sec = Math.floor(diffMs / 1000);

  // ✅ giây trước
  if (sec < 5) return "vừa xong";
  if (sec < 60) return `${sec} giây trước`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;

  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} giờ trước`;

  const day = Math.floor(hour / 24);
  if (day < 7) return `${day} ngày trước`;

  return d.toLocaleDateString("vi-VN");
};

