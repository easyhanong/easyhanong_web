import React from "react";

type HeaderProps = {
  onAttendanceClick?: () => void;
  onChatClick?: () => void;
};

export const Header: React.FC<HeaderProps> = ({
  onAttendanceClick,
  onChatClick,
}) => {
  return (
    <header className="bg-[#2d6a4f] px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
      <div className="flex items-center gap-2.5">
        <span className="text-[28px]">🌿</span>
        <span className="text-white text-[22px] font-bold tracking-[-0.5px]">
          이지하농
        </span>
      </div>
      <nav className="flex gap-7">
        <a
          href="#crops"
          className="text-[#b7e4c7] no-underline text-[15px] font-medium hover:text-white transition-colors"
        >
          작물 가이드
        </a>
        <a
          href="#features"
          className="text-[#b7e4c7] no-underline text-[15px] font-medium hover:text-white transition-colors"
        >
          기능
        </a>
        <button
          type="button"
          onClick={onChatClick}
          className="text-[#b7e4c7] bg-transparent border-none text-[15px] font-medium hover:text-white transition-colors cursor-pointer p-0"
        >
          AI 채팅
        </button>
        <button
          type="button"
          onClick={onAttendanceClick}
          className="text-[#b7e4c7] bg-transparent border-none text-[15px] font-medium hover:text-white transition-colors cursor-pointer p-0"
        >
          출석 체크
        </button>
      </nav>
    </header>
  );
};
