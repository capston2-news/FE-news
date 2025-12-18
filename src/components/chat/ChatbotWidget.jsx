// src/components/chat/ChatbotWidget.jsx
import React, { useState } from "react";

const initialBotMsg =
  "Xin chào! Mình là chatbot tin tức. Bạn có thể hỏi mình về bài viết, chủ đề hoặc bất cứ điều gì liên quan đến trang này.";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: initialBotMsg },
  ]);
  const [input, setInput] = useState("");

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
    };

    // TODO: sau này gọi API thật ở đây
    const botReply = {
      id: Date.now() + 1,
      sender: "bot",
      text: "Mình đã nhận câu hỏi của bạn. Sau này chỗ này sẽ gọi API chatbot thật để trả lời chi tiết nhé.",
    };

    setMessages((prev) => [...prev, userMsg, botReply]);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Khung chat – to hơn */}
      {isOpen && (
        <div className="mb-2 w-[360px] sm:w-[420px] rounded-3xl shadow-2xl bg-white flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center text-sm font-semibold">
                N
              </div>
              <div>
                <p className="text-sm font-semibold">Nana Chatbot</p>
                <p className="text-[11px] text-slate-200">
                  Trợ lý tin tức của bạn
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className="p-1.5 rounded-full hover:bg-slate-800/80"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Vùng message – cao hơn */}
          <div className="px-3 py-3 h-[300px] sm:h-[360px] overflow-y-auto space-y-2 bg-slate-50/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-sky-600 text-white rounded-br-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Ô nhập – cũng rộng hơn */}
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
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-full bg-sky-600 hover:bg-sky-500 flex items-center justify-center text-white"
            >
              <svg
                className="w-4.5 h-4.5 translate-x"
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

      {/* Nút tròn mở chat – CHỈ hiển thị khi đang tắt */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleToggle}
          className="w-12 h-12 rounded-full shadow-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center"
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
