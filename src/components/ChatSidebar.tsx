import React, { useEffect, useRef, useState } from "react";
import {
  canAffordChat,
  CHAT_QUESTION_COST,
  COINS_UPDATED_EVENT,
  getCoins,
  spendCoins,
} from "../lib/coins";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const PLACEHOLDER = "작물 키우기 관련으로 무엇이 궁금하세요?";

function mockAiReply(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("노랗") || q.includes("말려"))
    return "잎이 노랗거나 말라가면 물 과다·질소 부족일 수 있어요. 흙이 축축하면 물주기를 줄이고, 하루 6시간 이상 햇빛을 받는지 확인해보세요! 🌱";
  if (q.includes("벌레") || q.includes("해충"))
    return "해충이 보이면 잎 뒷면을 확인하고, 물뿌리기로 벌레를 떨어뜨린 뒤 통풍을 좋게 해주세요. 심하면 친환경 살충제를 고려해보세요.";
  if (q.includes("물") || q.includes("물주"))
    return "작물마다 다르지만 보통 흙 표면이 마르면 충분히 주세요. 화분 밑 물이 고이지 않게 배수구를 확인하는 것도 중요해요!";
  return "좋은 질문이에요! 재배 환경(햇빛, 물, 온도)을 알려주시면 더 정확히 도와드릴게요. 🌿";
}

type ChatSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [headerStatus, setHeaderStatus] = useState<"~~" | "생성중" | "완료">(
    "~~"
  );
  const [coins, setCoins] = useState(getCoins);
  const [coinError, setCoinError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const refreshCoins = () => setCoins(getCoins());

  useEffect(() => {
    refreshCoins();
    window.addEventListener(COINS_UPDATED_EVENT, refreshCoins);
    return () => window.removeEventListener(COINS_UPDATED_EVENT, refreshCoins);
  }, []);

  useEffect(() => {
    if (!open) return;
    refreshCoins();
    setCoinError(null);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => {
        document.getElementById("chat-sidebar-input")?.focus();
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;

    if (!spendCoins(CHAT_QUESTION_COST)) {
      setCoinError(
        `코인이 부족해요. (필요 ${CHAT_QUESTION_COST}coin · 보유 ${getCoins()}coin)`
      );
      return;
    }

    setCoins(getCoins());
    setCoinError(null);

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text },
    ]);
    setInput("");
    setHeaderStatus("생성중");
    setIsTyping(true);

    window.setTimeout(() => {
      const reply = mockAiReply(text);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", text: reply },
      ]);
      setHeaderStatus("완료");
      setIsTyping(false);
    }, 800);
  };

  const affordable = canAffordChat();

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/30 lg:bg-transparent"
        aria-hidden
        onClick={onClose}
      />

      <aside
        id="chat-panel"
        className="fixed top-0 right-0 z-[90] flex flex-col w-full max-w-[400px] h-screen bg-white border-l-2 border-[#A3D166] shadow-[-8px_0_32px_rgba(0,0,0,0.12)] animate-[slideIn_0.25s_ease-out]"
        aria-label="AI 채팅"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[#ff0000] text-white text-lg font-bold flex items-center justify-center leading-none hover:opacity-90 transition-opacity cursor-pointer border-none p-0"
        >
          ×
        </button>

        <header className="shrink-0 px-5 pt-5 pb-3 pr-12 border-b border-[#e8f4ee]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 shrink-0 rounded-full bg-[#A3D166]"
              aria-hidden
            />
            <div>
              <p className="text-[#333] text-[15px] font-semibold m-0 leading-snug">
                AI의 답변은 {headerStatus}
              </p>
              <p className="text-[#5a8a2e] text-xs font-bold m-0 mt-1">
                보유 {coins}coin · 질문당 {CHAT_QUESTION_COST}coin
              </p>
            </div>
          </div>
          <div className="mt-3 h-px bg-[#555]" />
        </header>

        <div
          ref={listRef}
          className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-3"
        >
          {messages.length === 0 && !isTyping && (
            <p className="text-[#999] text-sm text-center mt-8 m-0">
              궁금한 점을 아래에 입력해 보세요
              <br />
              <span className="text-[#7cb342] font-semibold">
                질문 1회 = {CHAT_QUESTION_COST}coin
              </span>
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={[
                "max-w-[88%] text-sm leading-relaxed px-3.5 py-2.5 rounded-2xl",
                msg.role === "user"
                  ? "self-end bg-[#A3D166] text-[#1b4332] rounded-br-sm"
                  : "self-start bg-[#f5f5f5] text-[#333] rounded-bl-sm",
              ].join(" ")}
            >
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="self-start text-[#888] text-sm px-2">
              이지하농 AI가 답변 중...
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="shrink-0 bg-[#EAF4D3] px-4 py-5 border-t border-[#d8e8c0]"
        >
          {coinError && (
            <p className="text-[#e63946] text-xs font-semibold text-center mb-2 m-0">
              {coinError}
            </p>
          )}
          {!affordable && !coinError && (
            <p className="text-[#e63946] text-xs font-semibold text-center mb-2 m-0">
              코인이 부족해요. 출석 체크로 코인을 모아주세요!
            </p>
          )}
          <label className="sr-only" htmlFor="chat-sidebar-input">
            채팅 입력
          </label>
          <input
            id="chat-sidebar-input"
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (coinError) setCoinError(null);
            }}
            placeholder={
              affordable
                ? PLACEHOLDER
                : `질문하려면 ${CHAT_QUESTION_COST}coin이 필요해요`
            }
            disabled={isTyping || !affordable}
            className="w-full bg-[#EAF4D3] border-none outline-none text-center text-[#5a8a2e] text-[15px] font-medium placeholder:text-[#7cb342] placeholder:opacity-90 disabled:opacity-60 rounded-[20px] py-3 px-3"
          />
        </form>
      </aside>
    </>
  );
};
