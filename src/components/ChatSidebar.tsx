import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaComments, FaTimes, FaPaperPlane, FaLeaf } from "react-icons/fa";
import {
  CHAT_QUESTION_COST,
  COINS_UPDATED_EVENT,
  getCoins,
} from "../lib/coins";
import { apiFetch } from "../lib/api";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const PLACEHOLDER = "작물 키우기 관련으로 무엇이 궁금하세요?";

type ChatSidebarProps = {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
};

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  open,
  onClose,
  onOpen,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [coins, setCoins] = useState(getCoins);
  const [coinError, setCoinError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const refreshCoins = useCallback(() => setCoins(getCoins()), []);

  useEffect(() => {
    window.addEventListener(COINS_UPDATED_EVENT, refreshCoins);
    return () => window.removeEventListener(COINS_UPDATED_EVENT, refreshCoins);
  }, [refreshCoins]);

  useEffect(() => {
    if (!open) return;
    refreshCoins();
    setCoinError(null);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, refreshCoins]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => {
        document.getElementById("chat-input")?.focus();
      }, 300);
    }
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;

    if (!isLoggedIn) {
      setCoinError("로그인 후 이용할 수 있어요.");
      return;
    }

    setCoinError(null);
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text }]);
    setInput("");
    setIsTyping(true);

    apiFetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: text }),
    })
      .then((r) => r.json())
      .then((data) => {
        const reply: string =
          typeof data.result === "string"
            ? data.result
            : (data.result?.answer ?? data.answer ?? data.message ?? "답변을 받지 못했어요.");
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: reply }]);
      })
      .catch(() => {
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: "오류가 발생했어요. 잠시 후 다시 시도해주세요." }]);
      })
      .finally(() => setIsTyping(false));
  };


  return (
    <>
      {/* 플로팅 토글 버튼 */}
      <button
        type="button"
        onClick={open ? onClose : onOpen}
        aria-label={open ? "AI 채팅 닫기" : "AI 채팅 열기"}
        className="fixed bottom-6 right-6 z-[95] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: open
            ? "linear-gradient(135deg, #034D38, #006C4D)"
            : "linear-gradient(135deg, #00BA84, #51C99A)",
          animation: "chatBtnPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        <span
          className="transition-transform duration-300"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          {open ? <FaTimes size={20} className="text-white" /> : <FaComments size={22} className="text-white" />}
        </span>
      </button>

      {/* 플로팅 채팅 패널 */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-90 w-90 flex flex-col rounded-3xl overflow-hidden shadow-2xl"
          style={{
            height: "600px",
            animation: "chatSlideUp 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            transformOrigin: "bottom right",
          }}
        >
          {/* 헤더 */}
          <header className="shrink-0 px-5 py-4 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #034D38, #006C4D)" }}>
            <div className="w-10 h-10 rounded-full bg-green3/30 flex items-center justify-center shrink-0">
              <FaLeaf size={18} className="text-green2" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm m-0 leading-tight">이지하농 AI</p>
              <p className="text-green2 text-xs m-0 mt-0.5">
                {isLoggedIn ? "로그인 후 무제한 이용 가능" : `보유 ${coins}coin · 질문당 ${CHAT_QUESTION_COST}coin`}
              </p>
            </div>
          </header>

          {/* 메시지 영역 */}
          <div
            ref={listRef}
            className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3"
            style={{ background: "#F4F9F2" }}
          >
            {messages.length === 0 && !isTyping && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#ABE6C5" }}>
                  <FaComments size={28} style={{ color: "#006C4D" }} />
                </div>
                <p className="text-gray-500 text-sm m-0">궁금한 점을 아래에 입력해 보세요</p>
                <p className="text-xs font-semibold m-0" style={{ color: "#00BA84" }}>
                  질문 1회 = {CHAT_QUESTION_COST}coin
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={[
                  "max-w-[82%] text-sm leading-relaxed px-4 py-2.5 rounded-2xl",
                  "animate-[msgIn_0.2s_ease-out]",
                  msg.role === "user"
                    ? "self-end text-white rounded-br-sm"
                    : "self-start bg-white text-gray-700 rounded-bl-sm shadow-sm",
                ].join(" ")}
                style={msg.role === "user" ? { background: "linear-gradient(135deg, #00BA84, #51C99A)" } : undefined}
              >
                {msg.text}
              </div>
            ))}

            {isTyping && (
              <div className="self-start bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
                {[0, 0.18, 0.36].map((delay, i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: "#51C99A",
                      animation: `typingBounce 0.9s ease-in-out ${delay}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 입력 영역 */}
          <form
            onSubmit={handleSubmit}
            className="shrink-0 bg-white border-t border-gray-100 px-4 py-3"
          >
            {!isLoggedIn && (
              <p className="text-red-400 text-xs text-center mb-2 m-0">
                <a href="/login" className="underline font-semibold">로그인</a> 후 무제한으로 이용할 수 있어요
              </p>
            )}
            {coinError && isLoggedIn && (
              <p className="text-red-400 text-xs text-center mb-2 m-0">{coinError}</p>
            )}
            <div className="flex gap-2 items-center">
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (coinError) setCoinError(null);
                }}
                placeholder={isLoggedIn ? PLACEHOLDER : "로그인 후 이용 가능해요"}
                disabled={isTyping || !isLoggedIn}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full text-sm px-4 py-2.5 outline-none transition-all disabled:opacity-50 placeholder:text-gray-400"
                style={{ "--tw-ring-color": "#00BA84" } as React.CSSProperties}
                onFocus={(e) => (e.target.style.borderColor = "#00BA84")}
                onBlur={(e) => (e.target.style.borderColor = "")}
              />
              <button
                type="submit"
                disabled={isTyping || !isLoggedIn || !input.trim()}
                className="w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #00BA84, #51C99A)" }}
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
