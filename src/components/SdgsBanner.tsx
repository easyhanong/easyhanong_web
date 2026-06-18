import React from "react";

export const SdgsBanner: React.FC = () => {
  return (
    <div className="bg-white px-8 py-5 flex items-center justify-center gap-3 border-b border-[#e8f4ee]">
      <span className="text-xl">🌍</span>
      <p className="text-[#2d6a4f] text-sm font-semibold m-0">
        UN 지속가능발전목표(SDGs) · 목표 2: 기아 종식 및 지속가능한 농업 강화를
        실천합니다
      </p>
    </div>
  );
};
