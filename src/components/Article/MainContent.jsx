import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getArticleById,
  handleTextToSpeech,
} from "../../services/article/Article";
import Loading from "../utils/Loading";
import { BiBookmark, BiSolidBookmark } from "react-icons/bi";
import { useAuth } from "../../context/AuthContext";
import {
  addBookmarkForUser,
  checkBookmark,
  deleteBookmarkForUser,
} from "../../services/bookmark/Bookmark";

const MainContent = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [article, setArticle] = useState();

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // 👉 state cho TTS
  const [audioUrl, setAudioUrl] = useState("");
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState("");

  const cleanContent = (text) => {
    if (!text) return "";

    const stopIndex = text.indexOf("Bình luận");
    if (stopIndex !== -1) {
      return text.substring(0, stopIndex).trim();
    }
    return text;
  };

  const handleGetArticle = async (id) => {
    const data = await getArticleById(id);
    data.content = cleanContent(data.content);
    setArticle(data);
  };

  // load bài viết
  useEffect(() => {
    if (!id) return;
    handleGetArticle(id);
  }, [id]);

  // kiểm tra bookmark
  const handleCheckBookmark = async () => {
    if (!user || !article?._id?.$oid) return;
    const isSuccess = await checkBookmark(article._id.$oid);
    if (isSuccess) {
      setSaved(true);
    }
  };

  useEffect(() => {
    handleCheckBookmark();
  }, [user, article?._id?.$oid]);

  // 🔥 Tự động gọi TTS khi article.content có dữ liệu
  useEffect(() => {
    const doTTS = async () => {
      if (!article?.content) return;

      setTtsError("");
      setAudioUrl("");
      setTtsLoading(true);

      try {
        const data = await handleTextToSpeech({
          text: article.content,
          lang: "vi", // sau này có thể đổi theo article.lang
        });

        if (!data || !data.audio_url) {
          setTtsError(
            (data && data.detail) || "Có lỗi khi tạo audio"
          );
        } else {
          const baseUrl = "http://127.0.0.1:8000"; // hoặc ENV
          setAudioUrl(baseUrl + data.audio_url);
        }
      } catch (err) {
        console.error(err);
        setTtsError(
          err?.message || "Lỗi kết nối server khi tạo audio"
        );
      } finally {
        setTtsLoading(false);
      }
    };

    doTTS();
  }, [article?.content]);

  // ⬇️ TẤT CẢ HOOK ở trên, giờ mới được return sớm
  if (!article) {
    return <Loading />;
  }

  const handleToggleBookmark = async () => {
    if (loading || !article._id.$oid) return;
    setLoading(true);

    if (!saved) {
      await addBookmarkForUser(article._id.$oid);
      setSaved(true);
    } else {
      await deleteBookmarkForUser(article._id.$oid);
      setSaved(false);
    }
    setLoading(false);
  };

  const paragraphs = article.content.split("\n\n");

  const renderContent = () => {
    return paragraphs.map((p, index) => {
      if (p.toLowerCase().includes("ảnh")) {
        return (
          <div key={index} className="my-4">
            <img
              src={article.images}
              alt="Ảnh mô tả"
              className="w-full rounded mb-2"
            />
            <p className="text-sm text-gray-500 italic">{p}</p>
          </div>
        );
      }

      return (
        <p key={index} className="mb-3 leading-relaxed text-gray-900">
          {p}
        </p>
      );
    });
  };

  return (
    <main className="bg-[#FCFAF6] p-6 rounded-lg shadow-sm">
      {/* Breadcrumb + Bookmark */}
      <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
        <div className="text-base text-gray-500">
          {article.category_name}
          {article.category_child_name && (
            <>
              <span className="mx-1">&gt;</span>
              <span>{article.category_child_name}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={handleToggleBookmark}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 transition text-gray-700"
            >
              {saved ? (
                <BiSolidBookmark className="text-blue-600 text-xl" />
              ) : (
                <BiBookmark className="text-gray-600 text-xl" />
              )}
            </button>
          )}
        </div>
      </div>

      <h1 className="text-4xl font-semibold leading-tight mb-4">
        {article.title}
      </h1>

      {/* Audio + error (luôn hiển thị khu vực này) */}
      <div className="mb-4">
        {ttsLoading && (
          <p className="text-sm text-gray-500 mb-2">
            Đang tạo giọng đọc cho bài báo...
          </p>
        )}

        {ttsError && (
          <p className="text-sm text-red-500 mb-2">{ttsError}</p>
        )}

        {audioUrl && (
          <audio controls src={audioUrl} className="w-full rounded">
            Trình duyệt không hỗ trợ audio.
          </audio>
        )}

        {!ttsLoading && !audioUrl && !ttsError && (
          <p className="text-xs text-gray-400">
            Không có audio cho bài này.
          </p>
        )}
      </div>

      <div className="prose max-w-none text-black text-xl">
        {renderContent()}
      </div>
    </main>
  );
};

export default MainContent;
