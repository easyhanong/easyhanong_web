import React from "react";

const features = [
  {
    id: "daily-guide",
    icon: "📅",
    title: "날짜별 재배 가이드",
    description:
      "씨앗 심기부터 수확까지, 오늘 해야 할 재배 활동을 매일 알려드려요. 물주기, 비료, 햇빛 관리까지 단계별 안내!",
    example: "🌱 오늘의 할 일: 토마토 물주기 & 지지대 설치",
    bgColor: "#52b788",
  },
  {
    id: "ai-chat",
    icon: "🤖",
    title: "AI 농사 채팅",
    description:
      "잎이 노랗게 됐어요? 벌레가 생겼어요? AI에게 무엇이든 물어보세요. 전문 농업 지식을 쉽게 답변해드려요.",
    example: '💬 "토마토 잎이 말려요" → AI 즉시 진단!',
    bgColor: "#40916c",
  },
  {
    id: "attendance",
    icon: "🏆",
    title: "출석 체크 & 포인트",
    description:
      "매일 출석하면 포인트를 획득해요! 모인 포인트로 AI 채팅을 무제한 사용하고 특별 혜택도 누려보세요.",
    example: "✅ 7일 연속 출석 = AI 채팅 30회 무료!",
    bgColor: "#74c69d",
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="bg-[#1b4332] px-8 py-[72px]">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-14">
          <span className="bg-[rgba(82,183,136,0.2)] text-[#52b788] px-4 py-1.5 rounded-[20px] text-[13px] font-semibold inline-block mb-3">
            핵심 기능
          </span>
          <h2 className="text-[36px] font-extrabold text-white mb-3">
            이지하농과 함께라면 쉬워요 ✨
          </h2>
          <p className="text-[#74c69d] text-base">
            3가지 스마트 기능으로 성공적인 홈 파밍을 경험하세요
          </p>
        </div>
        <div className="grid grid-cols-3 gap-7">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white/[0.07] rounded-[24px] px-7 py-10 border border-white/10 text-center"
            >
              <div
                className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center text-[36px] mx-auto mb-6"
                style={{ backgroundColor: feature.bgColor }}
              >
                {feature.icon}
              </div>
              <h3 className="text-[22px] font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-[#74c69d] text-[15px] leading-[1.7] mb-6">
                {feature.description}
              </p>
              <div className="px-4 py-4 bg-[rgba(82,183,136,0.15)] rounded-xl">
                <p className="text-[#b7e4c7] text-[13px] m-0">
                  {feature.example}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
