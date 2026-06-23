import React from "react";

export const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#40916c] px-8 py-20 text-center relative overflow-hidden">
      <div className="absolute -top-[60px] -left-[60px] w-[300px] h-[300px] rounded-full bg-white/[0.04]" />
      <div className="absolute -bottom-[80px] -right-[40px] w-[400px] h-[400px] rounded-full bg-white/[0.03]" />
      <div className="relative z-10">
        <div className="text-[64px] mb-4">🏡🌱</div>
        <h1 className="text-white text-[48px] font-extrabold mb-4 leading-[1.2]">
          이지하농
        </h1>
        <p className="text-[#b7e4c7] text-xl mb-3 font-medium">
          집에서 쉽게 시작하는 스마트 홈 파밍
        </p>
        <p className="text-[#74c69d] text-[15px] mb-10 max-w-[520px] mx-auto leading-[1.7]">
          UN SDGs 식량안보 및 지속가능한 농업 목표를 실천해요.
          <br />
          AI와 함께 누구나 집에서 신선한 채소를 키울 수 있어요.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="bg-[#52b788] text-white border-none rounded-[50px] px-9 py-4 text-[17px] font-bold cursor-pointer shadow-[0_4px_20px_rgba(82,183,136,0.4)] hover:bg-[#40916c] transition-colors">
            🌿 지금 시작하기
          </button>
          <button className="bg-transparent text-white border-2 border-white/40 rounded-[50px] px-9 py-4 text-[17px] font-semibold cursor-pointer hover:bg-white/10 transition-colors">
            더 알아보기
          </button>
        </div>
      </div>
    </section>
  );
};
