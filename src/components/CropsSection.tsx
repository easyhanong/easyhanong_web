import React from "react";

const crops = [
  {
    emoji: "🍅",
    name: "토마토",
    desc: "햇빛 충분한 창가에서 키우는 새콤달콤 토마토",
    difficulty: "보통",
    days: "60~80일",
  },
  {
    emoji: "🍓",
    name: "딸기",
    desc: "실내에서도 잘 자라는 달콤한 딸기",
    difficulty: "쉬움",
    days: "90~120일",
  },
  {
    emoji: "🥬",
    name: "상추",
    desc: "가장 빠르게 수확 가능한 쌈채소",
    difficulty: "매우 쉬움",
    days: "30~40일",
  },
  {
    emoji: "🌿",
    name: "허브",
    desc: "요리에 향을 더해주는 바질, 로즈마리 등",
    difficulty: "쉬움",
    days: "45~60일",
  },
  {
    emoji: "🌶️",
    name: "고추",
    desc: "비타민C 풍부한 매콤한 고추",
    difficulty: "보통",
    days: "90~120일",
  },
  {
    emoji: "🥒",
    name: "오이",
    desc: "수분 가득 시원한 오이",
    difficulty: "보통",
    days: "50~70일",
  },
];

export const CropsSection: React.FC = () => {
  return (
    <section id="crops" className="px-8 py-[72px] max-w-[1100px] mx-auto">
      <div className="text-center mb-12">
        <span className="bg-[#d8f3dc] text-[#2d6a4f] px-4 py-1.5 rounded-[20px] text-[13px] font-semibold inline-block mb-3">
          재배 가능 작물
        </span>
        <h2 className="text-[36px] font-extrabold text-[#1b4332] mb-3">
          6가지 작물을 집에서 키워요 🌿
        </h2>
        <p className="text-[#52796f] text-base">
          날짜별 맞춤 가이드로 쉽고 재미있게 재배할 수 있어요
        </p>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {crops.map((crop) => (
          <div
            key={crop.name}
            className="bg-white rounded-[20px] px-6 py-8 shadow-[0_2px_16px_rgba(45,106,79,0.08)] border border-[#e8f4ee] text-center transition-all duration-200 cursor-pointer hover:transform hover:scale-105 hover:shadow-[0_4px_24px_rgba(45,106,79,0.15)]"
          >
            <div className="text-[52px] mb-3">{crop.emoji}</div>
            <h3 className="text-[22px] font-bold text-[#1b4332] mb-2">
              {crop.name}
            </h3>
            <p className="text-[#52796f] text-sm leading-[1.6] mb-4">
              {crop.desc}
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <span className="bg-[#d8f3dc] text-[#2d6a4f] px-3 py-1 rounded-xl text-xs font-semibold">
                난이도: {crop.difficulty}
              </span>
              <span className="bg-[#e9ecef] text-[#495057] px-3 py-1 rounded-xl text-xs font-semibold">
                ⏱ {crop.days}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
