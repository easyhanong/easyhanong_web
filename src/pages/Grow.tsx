import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaLeaf, FaSeedling, FaStar, FaTint,
  FaCalendarAlt, FaCheckCircle, FaForward,
} from "react-icons/fa";
import { GiTomato, GiStrawberry, GiCabbage, GiChiliPepper, GiAcorn } from "react-icons/gi";
import { TbPlant } from "react-icons/tb";
import gsap from "gsap";
import Header from "../components/Header";
import { ChatSidebar } from "../components/ChatSidebar";
import { apiFetch } from "../lib/api";

type ApiCrop = {
  id: number;
  slug: string;
  name: string;
  difficulty: number;
  days_to_harvest: number;
  summary: string;
};

type DaySchedule = {
  name: string;
  start_day: number;
  end_day: number;
  water_per_day: number;
  tasks: string[];
  tip: string;
};

type GrowData = {
  cropId: number;
  cropSlug: string;
  cropName: string;
  cropTotalDays: number;
  plantedAt: string;       // YYYY-MM-DD
  wateredDates: string[];  // YYYY-MM-DD 배열 (중복 허용 — 하루 N번)
};

const CROP_ICON_MAP: Record<string, IconType> = {
  tomato:     GiTomato,
  strawberry: GiStrawberry,
  lettuce:    GiCabbage,
  basil:      FaLeaf,
  rosemary:   FaLeaf,
  pepper:     GiChiliPepper,
  cucumber:   FaSeedling,
};

const DIFFICULTY_MAP: Record<number, string> = { 1: "쉬움", 2: "보통", 3: "어려움" };

function getCropIcon(slug: string): IconType {
  return CROP_ICON_MAP[slug] ?? FaLeaf;
}

function dateToStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getTodayStr(): string {
  return dateToStr(new Date());
}

function getCurrentDay(plantedAt: string): number {
  const planted = new Date(plantedAt + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((today.getTime() - planted.getTime()) / 86400000) + 1);
}

function getPlantIcon(pct: number, slug: string): IconType {
  if (pct >= 80) return getCropIcon(slug);
  if (pct >= 60) return FaLeaf;
  if (pct >= 35) return TbPlant;
  if (pct >= 15) return FaSeedling;
  return GiAcorn;
}

function getPlantScale(pct: number): number {
  return 0.6 + (pct / 100) * 1.0;
}

const STORAGE_KEY = "easyhanong_grow";

export default function Grow() {
  const [initialized, setInitialized] = useState(false);
  const [phase, setPhase] = useState<"select" | "grow">("select");
  const [crops, setCrops] = useState<ApiCrop[]>([]);
  const [growData, setGrowData] = useState<GrowData | null>(null);
  const [daySchedule, setDaySchedule] = useState<DaySchedule | null>(null);
  const [isWatering, setIsWatering] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const plantRef = useRef<HTMLDivElement>(null);
  const dropsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<GrowData>;
      // 구버전 로컬스토리지 데이터 호환 (wateredDates 없을 수 있음)
      setGrowData({ wateredDates: [], ...parsed } as GrowData);
      setPhase("grow");
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized || phase !== "select") return;
    apiFetch("/crops/api-easy/get")
      .then((r) => r.json())
      .then((d) => setCrops(d.result as ApiCrop[]))
      .catch(() => {});
  }, [initialized, phase]);

  // plantedAt이 바뀔 때마다 (다음날 넘기기 포함) 오늘의 케어 일정 재fetch
  useEffect(() => {
    if (phase !== "grow" || !growData) return;
    const day = getCurrentDay(growData.plantedAt);
    apiFetch(`/crops/${growData.cropId}/schedule?day=${day}`)
      .then((r) => r.json())
      .then((d) => setDaySchedule(d.result ?? d))
      .catch(() => {});
  }, [phase, growData?.cropId, growData?.plantedAt]);

  const selectCrop = (crop: ApiCrop) => {
    const data: GrowData = {
      cropId: crop.id,
      cropSlug: crop.slug,
      cropName: crop.name,
      cropTotalDays: crop.days_to_harvest,
      plantedAt: getTodayStr(),
      wateredDates: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setGrowData(data);
    setPhase("grow");
  };

  const handleWater = () => {
    if (!growData || isWatering) return;
    const today = getTodayStr();
    const wateredTodayCount = growData.wateredDates.filter((d) => d === today).length;
    if (wateredTodayCount >= (daySchedule?.water_per_day ?? 1)) return;

    setIsWatering(true);

    if (dropsRef.current) {
      const drops = dropsRef.current.querySelectorAll(".drop");
      gsap.fromTo(
        drops,
        { y: 0, opacity: 1, scale: 1 },
        {
          y: 160, opacity: 0, scale: 0.6, duration: 0.9, stagger: 0.1, ease: "power1.in",
          onComplete: () => {
            if (plantRef.current) {
              gsap.fromTo(plantRef.current, { rotation: -8 }, { rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
            }
          },
        }
      );
    }

    setTimeout(() => {
      const updated: GrowData = {
        ...growData,
        wateredDates: [...growData.wateredDates, today],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setGrowData(updated);
      setIsWatering(false);
    }, 1100);
  };

  const skipDay = () => {
    if (!growData) return;
    const d = new Date(growData.plantedAt + "T00:00:00");
    d.setDate(d.getDate() - 1);
    const updated = { ...growData, plantedAt: dateToStr(d), wateredDates: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setGrowData(updated);
  };

  const resetCrop = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGrowData(null);
    setCrops([]);
    setDaySchedule(null);
    setPhase("select");
  };

  // ─── 작물 선택 ────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onChatClick={() => setChatOpen(true)} />
        <ChatSidebar open={chatOpen} onClose={() => setChatOpen(false)} onOpen={() => setChatOpen(true)} />
        <main className="flex-1 bg-linear-to-br from-sub1 to-sub2 flex flex-col items-center justify-center py-16 px-4">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <FaSeedling /> 키울 작물을 선택하세요
          </h1>
          <p className="text-green2 mb-10">오늘부터 함께 키워봐요!</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl w-full">
            {crops.map((crop) => {
              const CropIcon = getCropIcon(crop.slug);
              return (
                <button
                  key={crop.id}
                  onClick={() => selectCrop(crop)}
                  className="bg-white/90 hover:bg-white hover:scale-105 transition-all rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm cursor-pointer"
                >
                  <CropIcon size={40} className="text-green4" />
                  <span className="font-bold">{crop.name}</span>
                  <span className="text-xs text-gray-400">
                    {DIFFICULTY_MAP[crop.difficulty]} · {crop.days_to_harvest}일
                  </span>
                </button>
              );
            })}
            {crops.length === 0 && (
              <p className="col-span-4 text-green2 text-center py-10">불러오는 중...</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ─── 재배 화면 ────────────────────────────────────────────────
  if (!growData) return null;

  const currentDay = getCurrentDay(growData.plantedAt);
  const progressPct = Math.min((currentDay / growData.cropTotalDays) * 100, 100);
  const isHarvestable = currentDay >= growData.cropTotalDays;
  const PlantIcon = getPlantIcon(progressPct, growData.cropSlug);
  const plantScale = getPlantScale(progressPct);
  const CropIcon = getCropIcon(growData.cropSlug);

  const today = getTodayStr();
  const wateredTodayCount = growData.wateredDates.filter((d) => d === today).length;
  const requiredWater = daySchedule?.water_per_day ?? 1;
  const wateredEnoughToday = wateredTodayCount >= requiredWater;

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-sub1 to-sub2">
      <Header onChatClick={() => setChatOpen(true)} />
      <ChatSidebar open={chatOpen} onClose={() => setChatOpen(false)} onOpen={() => setChatOpen(true)} />

      <main className="flex-1 flex flex-col items-center py-10 px-4 gap-6">

        {/* 작물명 + 단계 + 날짜 */}
        <div className="text-center flex flex-col items-center gap-1">
          <span className="bg-white/20 text-green2 text-xs font-semibold px-3 py-1 rounded-full">
            {daySchedule?.name ?? "성장중"}
          </span>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mt-2">
            <CropIcon size={22} className="text-green3" />
            {growData.cropName}
          </h2>
          <p className="text-green2 text-sm flex items-center gap-1 mt-0.5">
            <FaCalendarAlt size={11} />
            {growData.plantedAt} 심음 ·{" "}
            <span className="font-bold text-white">{currentDay}일차</span>
          </p>
        </div>

        {/* 식물 + 화분 */}
        <div className="relative flex flex-col items-center">
          <div ref={dropsRef} className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-10">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="drop absolute opacity-0" style={{ left: `${(i - 2) * 18}px` }}>
                <FaTint size={20} className="text-blue-300" />
              </span>
            ))}
          </div>
          <div ref={plantRef} className="flex flex-col items-center">
            <PlantIcon
              size={plantScale * 72}
              className="text-green4 transition-all duration-700"
            />
            <div className="flex flex-col items-center mt-2">
              <div className="w-36 h-4 bg-amber-600 rounded-t-lg" />
              <div
                className="bg-amber-700 relative"
                style={{ width: "8rem", height: "5.5rem", clipPath: "polygon(5% 0%, 95% 0%, 82% 100%, 18% 100%)" }}
              >
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-amber-950 rounded-full opacity-60" />
              </div>
            </div>
          </div>
        </div>

        {/* 수확까지 진행도 */}
        <div className="w-72 flex flex-col gap-2">
          <div className="flex justify-between text-xs text-green2">
            <span>{currentDay}일 / {growData.cropTotalDays}일</span>
            {isHarvestable
              ? <span className="flex items-center gap-1 text-yellow-300 font-bold"><FaStar size={10} /> 수확 가능!</span>
              : <span>{growData.cropTotalDays - currentDay}일 남았어요</span>
            }
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-green3 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 오늘의 케어 */}
        {daySchedule && (
          <div className="w-72 bg-white/10 rounded-2xl px-5 py-4 flex flex-col gap-3 text-sm">
            <p className="text-white font-bold">오늘의 할 일</p>
            <ul className="flex flex-col gap-1.5">
              {daySchedule.tasks.map((task, i) => (
                <li key={i} className="text-green2 flex items-start gap-2">
                  <FaCheckCircle className="text-green3 mt-0.5 shrink-0" size={12} />
                  {task}
                </li>
              ))}
            </ul>
            {daySchedule.tip && (
              <p className="text-green3 text-xs border-t border-white/10 pt-2">
                💡 {daySchedule.tip}
              </p>
            )}
            <div className="flex items-center gap-1 text-xs text-green2">
              <FaTint className="text-blue-300" size={11} />
              오늘 물주기 {wateredTodayCount} / {requiredWater}회
              {wateredEnoughToday && (
                <FaCheckCircle className="text-green3 ml-1" size={11} />
              )}
            </div>
          </div>
        )}

        {/* 물주기 버튼 */}
        <button
          onClick={handleWater}
          disabled={isWatering || wateredEnoughToday}
          className="bg-blue-400 hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 px-14 rounded-full shadow-lg transition-all flex items-center gap-2"
        >
          <FaTint />
          {isWatering ? "물 주는 중..." : wateredEnoughToday ? "오늘 완료!" : "물주기"}
        </button>

        {/* 다음날로 넘기기 */}
        <button
          onClick={skipDay}
          className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-2.5 px-8 rounded-full transition-all flex items-center gap-2"
        >
          <FaForward size={13} /> 다음날로 넘기기
        </button>

        <button
          onClick={resetCrop}
          className="text-green3/60 hover:text-green3 text-xs underline transition-colors"
        >
          다른 작물로 바꾸기
        </button>
      </main>
    </div>
  );
}
