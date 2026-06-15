import React from "react";

const pointMethods = [
  {
    icon: "✅",
    title: "일일 출석",
    points: "+10P",
    desc: "매일 앱 접속",
  },
  {
    icon: "🔥",
    title: "연속 출석",
    points: "+50P",
    desc: "7일 연속 출석",
  },
  {
    icon: "📖",
    title: "가이드 완료",
    points: "+20P",
    desc: "오늘의 할 일 완료",
  },
  {
    icon: "🌟",
    title: "수확 인증",
    points: "+100P",
    desc: "작물 수확 사진 공유",
  },
];

type PointsSectionProps = {
  onAttendanceClick?: () => void;
};

export const PointsSection: React.FC<PointsSectionProps> = ({
  onAttendanceClick,
}) => {
  return (
    <section id="attendance" className="px-8 py-[72px] bg-[#f0faf4]">
      <div className="max-w-[900px] mx-auto text-center">
        <h2 className="text-[32px] font-extrabold text-[#1b4332] mb-12">
          🎯 포인트 획득 방법
        </h2>
        <div className="grid grid-cols-4 gap-5">
          {pointMethods.map((item) => (
            <div
              key={item.title}
              role={item.title === "일일 출석" ? "button" : undefined}
              tabIndex={item.title === "일일 출석" ? 0 : undefined}
              onClick={
                item.title === "일일 출석" ? onAttendanceClick : undefined
              }
              onKeyDown={
                item.title === "일일 출석"
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onAttendanceClick?.();
                      }
                    }
                  : undefined
              }
              className={[
                "bg-white rounded-2xl px-5 py-7 shadow-[0_2px_12px_rgba(45,106,79,0.08)] border border-[#d8f3dc]",
                item.title === "일일 출석"
                  ? "cursor-pointer hover:shadow-[0_4px_20px_rgba(45,106,79,0.15)] hover:scale-[1.02] transition-all"
                  : "",
              ].join(" ")}
            >
              <div className="text-[36px] mb-3">{item.icon}</div>
              <div className="text-xl font-extrabold text-[#2d6a4f] mb-1">
                {item.points}
              </div>
              <div className="text-[15px] font-bold text-[#1b4332] mb-1.5">
                {item.title}
              </div>
              <div className="text-[13px] text-[#52796f]">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
