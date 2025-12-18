// src/components/pages/article/useArticleSpeak.js
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { textToSpeech } from "../../../services/article/ArticleService";

export default function useArticleSpeak({
  blocks,
  title,
  articleBodyRef,
  maxParagraphs = 6,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false); // đang phát
  const [isLoading, setIsLoading] = useState(false);   // đang tạo audio
  const [isPaused, setIsPaused] = useState(false);     // đang pause

  const audioRef = useRef(null);
  const lastTextRef = useRef(""); // để biết có cần tạo audio mới hay không

  const textToRead = useMemo(() => {
    const parts =
      (blocks || [])
        .filter((b) => b?.type === "p" && b?.text)
        .map((b) => String(b.text).trim())
        .filter(Boolean);

    const text = parts.join(". ");
    return text || (title || "Không có nội dung để đọc.");
  }, [blocks, title]);

  const stop = () => {
    const a = audioRef.current;
    if (a) {
      try {
        a.pause();
        a.currentTime = 0; // stop hoàn toàn
      } catch {}
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setIsLoading(false);
  };

  const pause = () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.pause(); // ✅ giữ currentTime
      setIsSpeaking(false);
      setIsPaused(true);
    } catch {}
  };

  const resume = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      await a.play(); // ✅ chạy tiếp từ currentTime
      setIsSpeaking(true);
      setIsPaused(false);
    } catch {
      toast.error("Không thể tiếp tục phát audio.");
      stop();
    }
  };

  const toggleSpeak = async () => {
    // ✅ đang tạo audio thì KHÔNG cho bấm (ignore)
    if (isLoading) return;

    // ✅ nếu đang pause -> resume tiếp tục
    if (isPaused && audioRef.current) {
      await resume();
      return;
    }

    // ✅ nếu đang phát -> pause (dừng giữa chừng, bấm lại chạy tiếp)
    if (isSpeaking && audioRef.current) {
      pause();
      return;
    }

    // ✅ nếu có audio đã tạo và text không đổi -> play lại từ đầu hoặc resume?
    // (ở đây vì isSpeaking=false & isPaused=false, audio đã end hoặc user stop)
    // ta phát lại từ đầu nếu audio còn
    const currentText = (textToRead || "").trim();
    if (!currentText) {
      toast.error("Không có nội dung để đọc.");
      return;
    }

    // Nếu audio đã tồn tại và text giống lần trước, phát lại (từ currentTime hiện tại)
    if (audioRef.current && lastTextRef.current === currentText) {
      // nếu user từng stop() thì audioRef null rồi; còn nếu onended chưa clear thì phát lại
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setIsSpeaking(true);
        setIsPaused(false);
        articleBodyRef?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      } catch {
        // nếu play fail thì fallback tạo lại audio
      }
    }

    // ✅ tạo audio mới từ API
    setIsLoading(true);
    const toastId = toast.loading("Đang tạo giọng đọc...");

    try {
      const res = await textToSpeech(currentText); // { audio_url: "..." }
      const audioUrl = res?.audio_url;
      if (!audioUrl) throw new Error("No audio_url");

      // ghép URL
      const base = axios.defaults.baseURL || window.location.origin;
      const fullUrl = audioUrl.startsWith("http") ? audioUrl : `${base}${audioUrl}`;

      // tạo audio mới
      const audio = new Audio(fullUrl);
      audioRef.current = audio;
      lastTextRef.current = currentText;

      audio.onended = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        // giữ audioRef để có thể play lại từ đầu nếu muốn
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        toast.error("Không phát được audio.", { id: toastId });
      };

      await audio.play();

      setIsSpeaking(true);
      setIsPaused(false);
      toast.success("Đang đọc...", { id: toastId });

      articleBodyRef?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (e) {
      toast.error("Tạo giọng đọc thất bại.", { id: toastId });
      stop();
    } finally {
      setIsLoading(false);
    }
  };

  // cleanup
  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isSpeaking,
    isLoading,
    isPaused,
    toggleSpeak,
    stop,
    pause,
    resume,
  };
}
