import React from "react";

export const AiChatSection: React.FC = () => {
  return (
    // AI 채팅 소개 섹션
    <section id="ai-chat" className="px-8 py-[72px] bg-white">
      <div className="max-w-[900px] mx-auto grid grid-cols-2 gap-12 items-center">
        {/* 왼쪽: AI 채팅 설명 영역 */}
        <div>
          <span className="bg-[#d8f3dc] text-[#2d6a4f] px-4 py-1.5 rounded-[20px] text-[13px] font-semibold inline-block mb-4">
            AI 채팅 미리보기
          </span>

          <h2 className="text-[32px] font-extrabold text-[#1b4332] mb-4 leading-[1.3]">
            농사 고민을
            <br />
            AI에게 물어보세요 🤖
          </h2>

          <p className="text-[#52796f] text-base leading-[1.7] mb-6">
            초보 농부도 걱정 없어요. 병충해, 물주기, 영양 부족 등 어떤 질문이든
            AI가 전문적이고 친절하게 답변해드려요.
          </p>

          {/* AI 사용 안내 */}
          <p className="text-[#52796f] text-sm m-0">
            상단 배너의 <strong>AI 채팅</strong>을 눌러 채팅창을 열 수 있어요.
            <br />
            질문 1회당 <strong>10coin</strong>이 필요합니다.
          </p>
        </div>

        {/* 오른쪽: AI 채팅 화면 예시 */}
        <div className="bg-[#f5f9f2] rounded-[20px] p-6 border border-[#e8f4ee]">
          <div className="bg-[#2d6a4f] rounded-t-xl px-4 py-3 flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <span className="text-white font-semibold text-sm">
              이지하농 AI
            </span>
          </div>

          <div className="p-4 flex flex-col gap-3">
            {/* 사용자 질문 예시 */}
            <div className="flex justify-end">
              <div className="bg-[#2d6a4f] text-white px-3.5 py-2.5 rounded-[16px_16px_4px_16px] text-sm max-w-[80%]">
                토마토 잎이 노랗게 변하고 있어요 😢
              </div>
            </div>

            {/* AI 답변 예시 */}
            <div className="flex gap-2">
              <div className="text-2xl">🤖</div>

              <div className="bg-white px-3.5 py-2.5 rounded-[4px_16px_16px_16px] text-sm max-w-[85%] text-[#1b4332] leading-[1.6] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                잎이 노랗게 변하는 건 물 과다 또는 질소 부족일 수 있어요. 흙이
                축축하면 2~3일 물주기를 줄이고, 햇빛 6시간 이상 받는지
                확인해보세요! 🌱
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};