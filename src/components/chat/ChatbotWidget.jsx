// src/components/chat/ChatbotWidget.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useMatch } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  fetchChatbotResponse,
  CreateNewConversation,
} from "../../services/chatbot/ChatbotService";

import { AddBookmark, RemoveBookmark } from "../../services/bookmark/BookmarkService";
import { IncreseArticleViewCount } from "../../services/article/ArticleService";

import toast from "react-hot-toast";

const initialBotMsg =
  "Xin chào! Mình là chatbot tin tức. Bạn có thể hỏi mình về bài viết, chủ đề hoặc bất cứ điều gì liên quan đến trang này.";

const newMsgId = () => {
  // ✅ tránh warning key trùng (Date.now() có thể trùng trong cùng 1ms)
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const normalizeText = (v) =>
  String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// ✅ bắt “tóm tắt bài viết / tóm tắt tin tức / rút gọn / summary …”
const isSummaryIntent = (text) => {
  const t = normalizeText(text);

  if (
    t.includes("tom tat") ||
    t.includes("summary") ||
    t.includes("summarize") ||
    t.includes("rut gon") ||
    t.includes("tong hop") ||
    t.includes("tong ket")
  ) {
    return true;
  }

  const patterns = [
    /\btom\s*tat\b.*\b(bai|bai\s*viet|tin|tin\s*tuc|noi\s*dung|ban\s*tin)\b/,
    /\b(bai|bai\s*viet|tin|tin\s*tuc|noi\s*dung|ban\s*tin)\b.*\btom\s*tat\b/,
    /\brut\s*gon\b.*\b(bai|bai\s*viet|tin|tin\s*tuc|noi\s*dung|ban\s*tin)\b/,
  ];
  return patterns.some((re) => re.test(t));
};

/**
 * ✅ FIX “công nghệ” bị hiểu nhầm là “nghe audio”
 * - KHÔNG dùng t.includes("nghe") kiểu substring nữa
 */
const isSoundIntent = (text) => {
  const t = normalizeText(text).replace(/\s+/g, " ").trim();
  if (!t) return false;

  // 1) keyword audio rõ ràng
  if (/\b(sound|audio|tts|mp3|voice|giong)\b/.test(t)) return true;

  // 2) “nghe/đọc” có ngữ cảnh
  const patterns = [
    /\b(tao|bat|mo|cho)\b.*\b(sound|audio|tts|mp3|voice|giong)\b/,
    /\b(doc|nghe)\b.*\b(lai|len|tom tat|summary|bai|bai viet|tin|tin tuc|noi dung|ban tin)\b/,
    /\b(tom tat|summary)\b.*\b(doc|nghe)\b/,
  ];
  return patterns.some((re) => re.test(t));
};

const parsePayload = (data) => {
  let d = data;

  if (typeof d === "string") {
    try {
      d = JSON.parse(d);
    } catch {
      return {
        replyText: d,
        articlesRaw: null,
        audioUrl: null,
        hasArticlesField: false,
        errorDetail: null,
      };
    }
  }

  if (!d || typeof d !== "object") {
    return {
      replyText: String(d ?? ""),
      articlesRaw: null,
      audioUrl: null,
      hasArticlesField: false,
      errorDetail: null,
    };
  }

  // ✅ đọc lỗi từ BE (vd: { error: { detail: "Category not found" } })
  const errorDetail =
    d?.error?.detail ||
    d?.error?.message ||
    d?.detail ||
    (typeof d?.error === "string" ? d.error : null) ||
    null;

  return {
    replyText: d.reply || d.text || d.message || d.answer || "",
    articlesRaw: d.articles ?? null,
    audioUrl: d.audio_url || d.audioUrl || null,
    hasArticlesField: Object.prototype.hasOwnProperty.call(d, "articles"),
    errorDetail,
  };
};

// ✅ đọc is_bookmarked từ BE (nếu có)
const normalizeArticles = (arr) => {
  const list = Array.isArray(arr) ? arr : [];
  return list
    .map((a) => {
      const id = a?._id?.$oid || a?._id || a?.id || null;
      const title = a?.title || "";
      const image = (Array.isArray(a?.images) && a.images[0]) || a?.image || "";
      const is_bookmarked =
        typeof a?.is_bookmarked === "boolean"
          ? a.is_bookmarked
          : typeof a?.isBookmarked === "boolean"
          ? a.isBookmarked
          : undefined;
      return { id, title, image, is_bookmarked };
    })
    .filter((x) => x.id && x.title);
};

const toAudioSrc = (audioUrl) => (audioUrl ? audioUrl : "");

const BookmarkIcon = ({ saved }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-[18px] h-[18px]"
    fill={saved ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2z" />
  </svg>
);

const ChatbotWidget = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const matchArticle = useMatch("/article/:articleId");

  const storageKey = useMemo(() => {
    const u = user?.username || user?.email || "guest";
    return `chatbot_state_${u}`;
  }, [user?.username, user?.email]);

  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  // sound gần nhất
  const [lastAudioUrl, setLastAudioUrl] = useState(null);
  const [lastAudioArticleId, setLastAudioArticleId] = useState(null);

  // bookmark
  const [bookmarkMap, setBookmarkMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  // messages
  const [messages, setMessages] = useState([
    { id: newMsgId(), sender: "bot", text: initialBotMsg },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef(null);
  const hadUserRef = useRef(false);

  // ✅ refs cho từng hàng articles theo msg.id để scroll prev/next
  const articleRowRefs = useRef(new Map());

  const setArticleRowRef = useCallback(
    (msgId) => (el) => {
      if (!msgId) return;
      if (el) articleRowRefs.current.set(msgId, el);
      else articleRowRefs.current.delete(msgId);
    },
    []
  );

  const scrollArticlesByOne = useCallback((msgId, dir) => {
    const row = articleRowRefs.current.get(msgId);
    if (!row) return;

    const cards = row.querySelectorAll("[data-article-card]");
    let step = 180;

    if (cards.length >= 2) {
      step = (cards[1].offsetLeft || 0) - (cards[0].offsetLeft || 0);
      if (!step) {
        const w = cards[0].getBoundingClientRect()?.width || 170;
        step = w + 8;
      }
    } else if (cards.length === 1) {
      const w = cards[0].getBoundingClientRect()?.width || 170;
      step = w + 8;
    }

    row.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  // ✅ nhớ key hiện tại (chỉ khi có user)
  useEffect(() => {
    if (!user) return;
    hadUserRef.current = true;
    try {
      localStorage.setItem("chatbot_last_storage_key", storageKey);
    } catch {}
  }, [user, storageKey]);

  // ✅ logout thật -> reset + xóa localStorage chat của user đó
  useEffect(() => {
    if (user) return;
    if (!hadUserRef.current) return;

    try {
      const lastKey = localStorage.getItem("chatbot_last_storage_key");
      if (lastKey) localStorage.removeItem(lastKey);
      localStorage.removeItem("chatbot_last_storage_key");
    } catch {}

    setIsOpen(false);
    setConversationId(null);
    setLastAudioUrl(null);
    setLastAudioArticleId(null);
    setBookmarkMap({});
    setLoadingMap({});
    setMessages([{ id: newMsgId(), sender: "bot", text: initialBotMsg }]);
    setInput("");
    setSending(false);
    hadUserRef.current = false;
  }, [user]);

  // ✅ load localStorage (chỉ khi login)
  useEffect(() => {
    if (!user) return;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const saved = JSON.parse(raw);
      if (saved?.conversationId) setConversationId(saved.conversationId);
      if (Array.isArray(saved?.messages) && saved.messages.length > 0) {
        setMessages(saved.messages);
      }
      if (saved?.lastAudioUrl) setLastAudioUrl(saved.lastAudioUrl);
      if (saved?.lastAudioArticleId) setLastAudioArticleId(saved.lastAudioArticleId);
      if (saved?.bookmarkMap && typeof saved.bookmarkMap === "object") {
        setBookmarkMap(saved.bookmarkMap);
      }
    } catch {}
  }, [user, storageKey]);

  // ✅ persist (chỉ khi login)
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          conversationId,
          messages,
          lastAudioUrl,
          lastAudioArticleId,
          bookmarkMap,
        })
      );
    } catch {}
  }, [user, storageKey, conversationId, messages, lastAudioUrl, lastAudioArticleId, bookmarkMap]);

  // ✅ auto scroll
  useEffect(() => {
    if (!isOpen) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [isOpen, messages, sending]);

  const handleToggle = () => setIsOpen((prev) => !prev);

  // ✅ lấy articleId chắc chắn
  const getArticleIdFromUrlIfOnArticlePage = () => {
    const id1 = matchArticle?.params?.articleId;
    if (id1) return id1;

    const p1 = location?.pathname || "";
    let m = p1.match(/\/article\/([^/?#]+)/);
    if (m?.[1]) return decodeURIComponent(m[1]);

    const p2 = window.location.pathname || "";
    m = p2.match(/\/article\/([^/?#]+)/);
    if (m?.[1]) return decodeURIComponent(m[1]);

    const h = window.location.hash || "";
    m = h.match(/#\/article\/([^/?#]+)/) || h.match(/\/article\/([^/?#]+)/);
    if (m?.[1]) return decodeURIComponent(m[1]);

    return null;
  };

  const ensureConversationId = async () => {
    if (conversationId) return conversationId;

    const created = await CreateNewConversation();
    const newId =
      created?.conversation_id ||
      created?.conversationId ||
      created?.data?.conversation_id ||
      created?.data?.conversationId;

    if (!newId) throw new Error("CreateNewConversation: missing conversation_id");

    setConversationId(newId);
    return newId;
  };

  const handleNewConversation = async () => {
    if (sending) return;
    setSending(true);
    try {
      const created = await CreateNewConversation();
      const newId =
        created?.conversation_id ||
        created?.conversationId ||
        created?.data?.conversation_id ||
        created?.data?.conversationId;

      if (!newId) throw new Error("CreateNewConversation: missing conversation_id");

      setConversationId(newId);
      setLastAudioUrl(null);
      setLastAudioArticleId(null);
      setMessages([{ id: newMsgId(), sender: "bot", text: initialBotMsg }]);
      setInput("");
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { id: newMsgId(), sender: "bot", text: "Không tạo được cuộc hội thoại mới. Bạn thử lại giúp mình nhé." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleClickArticle = (articleId) => {
    if (!articleId) return;
    Promise.resolve(IncreseArticleViewCount(String(articleId))).catch(() => {});
    setIsOpen(false);
    navigate(`/article/${articleId}`);
  };

  const toggleBookmark = async (articleId) => {
    const key = String(articleId || "");
    if (!key) return;
    if (loadingMap[key]) return;

    const current = !!bookmarkMap[key];
    const next = !current;

    setBookmarkMap((prev) => ({ ...prev, [key]: next }));
    setLoadingMap((prev) => ({ ...prev, [key]: true }));

    const toastId = toast.loading(next ? "Đang lưu bài..." : "Đang bỏ lưu...");
    try {
      if (current) await RemoveBookmark(key);
      else await AddBookmark(key);
      toast.success(next ? "Đã lưu bài" : "Đã bỏ lưu", { id: toastId });
    } catch (err) {
      setBookmarkMap((prev) => ({ ...prev, [key]: current }));
      toast.error("Có lỗi xảy ra, thử lại nhé!", { id: toastId });
      console.error("Bookmark failed:", err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleTtsChoice = (msgId, choice) => {
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, ttsChoice: choice } : m)));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [...prev, { id: newMsgId(), sender: "user", text: trimmed }]);
    setInput("");
    setSending(true);

    try {
      const cid = await ensureConversationId();

      // ✅ user hỏi sound -> phát sound gần nhất
      if (isSoundIntent(trimmed)) {
        if (lastAudioUrl) {
          setMessages((prev) => [
            ...prev,
            {
              id: newMsgId(),
              sender: "bot",
              text: "Đây là sound của phần tóm tắt gần nhất:",
              ttsOffer: true,
              audioUrl: lastAudioUrl,
              ttsChoice: true,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: newMsgId(),
              sender: "bot",
              text: "Mình chưa có sound nào. Bạn hãy tóm tắt một bài viết trước (đang ở /article/:id) rồi mình phát sound nhé.",
            },
          ]);
        }
        return;
      }

      const wantsSummary = isSummaryIntent(trimmed);
      const articleId = wantsSummary ? getArticleIdFromUrlIfOnArticlePage() : null;

      const data = await fetchChatbotResponse(trimmed, cid, articleId);
      const { replyText, articlesRaw, audioUrl, hasArticlesField, errorDetail } = parsePayload(data);

      const articles = normalizeArticles(articlesRaw);

      // ✅ RỖNG hoặc LỖI => CHỈ hiển thị 1 tin duy nhất
      const hasError = !!errorDetail;                 // lỗi nào cũng coi như "không có bài"
      const emptyArticles = hasArticlesField && articles.length === 0;
      const noArticles = hasError || emptyArticles;

      if (noArticles) {
        setMessages((prev) => [
          ...prev,
          { id: newMsgId(), sender: "bot", text: "Không tìm thấy bài viết nào." },
        ]);
        return; // ✅ dừng, không show replyText “Dưới đây là…”
      }

      // ====== có bài => hiển thị bình thường ======
      const reply = replyText || "(Không có phản hồi)";

      // sync bookmarkMap theo is_bookmarked trả về từ BE
      if (articles.length) {
        setBookmarkMap((prev) => {
          const next = { ...prev };
          for (const a of articles) {
            if (typeof a.is_bookmarked === "boolean") next[a.id] = a.is_bookmarked;
          }
          return next;
        });
      }

      // offer TTS nếu tóm tắt bài viết có audio_url
      const isArticleSummary = wantsSummary && !!articleId;
      const canOfferTts = isArticleSummary && !!audioUrl;

      if (canOfferTts) {
        const src = toAudioSrc(audioUrl);
        setLastAudioUrl(src);
        setLastAudioArticleId(articleId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: newMsgId(),
          sender: "bot",
          text: reply,
          ...(articles.length ? { articles } : {}),
          ...(canOfferTts ? { ttsOffer: true, audioUrl: toAudioSrc(audioUrl), ttsChoice: null } : {}),
        },
      ]);
    } catch (err) {
      console.error(err);
      // ✅ request fail cũng coi như "không có bài"
      setMessages((prev) => [
        ...prev,
        { id: newMsgId(), sender: "bot", text: "Không tìm thấy bài viết nào." },
      ]);
    } finally {
      setSending(false);
    }
  };

  // ✅ chỉ hiện khi login
  if (!user) return null;

  return (
    <div className="fixed bottom-10 right-8 z-50">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {isOpen && (
        <div className="mb-2 w-[360px] sm:w-[420px] shadow-2xl bg-white flex flex-col overflow-hidden rounded-3xl">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-sky-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center text-sm font-semibold">
                N
              </div>
              <div>
                <p className="text-sm font-semibold">Nana</p>
                <p className="text-[11px] text-slate-200">
                  {user?.username ? `@${user.username}` : "Trợ lý tin tức của bạn"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNewConversation}
                disabled={sending}
                className="cursor-pointer text-[11px] px-2.5 py-1.5 rounded-full
                           bg-white hover:bg-white/90 text-slate-900
                           border border-white/60
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Tạo mới
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="cursor-pointer p-1.5 rounded-full"
                aria-label="Đóng"
                title="Đóng"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="px-3 py-3 h-[300px] sm:h-[360px] overflow-y-auto space-y-2 bg-slate-50/70"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[90%]">
                  <div
                    className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-sky-600 text-white rounded-2xl rounded-br-sm"
                        : "bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Articles ngang */}
                  {msg.sender === "bot" &&
                    Array.isArray(msg.articles) &&
                    msg.articles.length > 0 && (
                      <div className="mt-2 relative">
                        <div
                          ref={setArticleRowRef(msg.id)}
                          className="flex gap-2 overflow-x-auto no-scrollbar pb-1 scroll-smooth"
                        >
                          {msg.articles.map((a) => {
                            const isSaved = !!bookmarkMap[String(a.id)];
                            const isLoading = !!loadingMap[String(a.id)];

                            return (
                              <div
                                key={a.id}
                                data-article-card
                                role="button"
                                tabIndex={0}
                                onClick={() => handleClickArticle(a.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") handleClickArticle(a.id);
                                }}
                                className="cursor-pointer shrink-0 w-[220px] bg-white border border-slate-200"
                                title={a.title}
                              >
                                <div className="relative w-full h-[170px] overflow-hidden bg-slate-100">
                                  {a.image ? (
                                    <img
                                      src={a.image}
                                      alt={a.title}
                                      loading="lazy"
                                      className="absolute inset-0 w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-[12px] text-slate-500">
                                      No image
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleBookmark(a.id);
                                    }}
                                    className={[
                                      "absolute right-2 top-2 z-30 grid h-9 w-9 place-items-center rounded-full border",
                                      "cursor-pointer transition-colors",
                                      isSaved
                                        ? "bg-sky-600 border-sky-600 text-white hover:bg-sky-500 hover:border-sky-500"
                                        : "bg-white/90 border-slate-200 text-slate-800 hover:bg-slate-100",
                                      isLoading ? "opacity-60 cursor-not-allowed" : "",
                                    ].join(" ")}
                                    aria-label={isSaved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
                                    title={isSaved ? "Bỏ lưu" : "Lưu bài"}
                                  >
                                    <BookmarkIcon saved={isSaved} />
                                  </button>
                                </div>

                                <div className="px-2.5 py-2">
                                  <p className="text-[12px] font-semibold text-slate-800 line-clamp-3">
                                    {a.title}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {msg.articles.length > 1 && (
                          <div className="pointer-events-none absolute left-0 right-0 top-0 h-[170px] z-40">
                            <button
                              type="button"
                              onClick={() => scrollArticlesByOne(msg.id, -1)}
                              className="pointer-events-auto cursor-pointer absolute left-2 top-1/2 -translate-y-1/2
                                        h-10 w-10 rounded-full bg-white/70 border border-slate-200
                                        grid place-items-center
                                        opacity-50 hover:opacity-100 hover:bg-white/90 transition"
                              aria-label="Trước"
                              title="Trước"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-5 h-5 text-slate-700"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="15 18 9 12 15 6" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => scrollArticlesByOne(msg.id, 1)}
                              className="pointer-events-auto cursor-pointer absolute right-2 top-1/2 -translate-y-1/2
                                        h-10 w-10 rounded-full bg-white/70 border border-slate-200
                                        grid place-items-center
                                        opacity-50 hover:opacity-100 hover:bg-white/90 transition"
                              aria-label="Sau"
                              title="Sau"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-5 h-5 text-slate-700"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Offer TTS */}
                  {msg.sender === "bot" && msg.ttsOffer && (
                    <div className="mt-2">
                      {msg.ttsChoice === null && (
                        <div className="bg-white border border-slate-200 rounded-2xl px-3 py-2">
                          <p className="text-[12px] text-slate-700">Bạn có muốn tạo sound không?</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleTtsChoice(msg.id, true)}
                              className="cursor-pointer text-[12px] px-3 py-1.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                            >
                              Có
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTtsChoice(msg.id, false)}
                              className="cursor-pointer text-[12px] px-3 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
                            >
                              Không
                            </button>
                          </div>
                        </div>
                      )}

                      {msg.ttsChoice === true && msg.audioUrl && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-2">
                          <audio controls preload="none" className="w-full" src={msg.audioUrl} />
                        </div>
                      )}

                      {msg.ttsChoice === false && (
                        <p className="text-[12px] text-slate-500 mt-1">
                          Ok nha. Khi nào cần sound bạn nhắn “sound/đọc lại” là mình phát ngay.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] bg-white text-slate-600 border border-slate-200 rounded-bl-sm">
                  Nana đang trả lời...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="border-t border-slate-200 bg-white px-3 py-2.5 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhắn gì đó cho Nana..."
              className="flex-1 text-[13px] rounded-full border border-slate-300 px-3.5 py-2 outline-none focus:border-sky-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending}
              className="cursor-pointer w-10 h-10 rounded-full bg-sky-600 hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
              title="Gửi"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={handleToggle}
          className="cursor-pointer w-12 h-12 rounded-full shadow-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center transition-colors"
          title="Mở chat"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v0.5z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
