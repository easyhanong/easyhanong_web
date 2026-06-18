import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaLeaf, FaSeedling, FaStar, FaTint,
} from "react-icons/fa";
import { GiTomato, GiStrawberry, GiCabbage, GiChiliPepper, GiAcorn } from "react-icons/gi";
import { TbPlant } from "react-icons/tb";
import gsap from "gsap";
import Header from "../components/Header";
import { apiFetch } from "../lib/api";

type ApiCrop = {
  id: number;
  slug: string;
  name: string;
  difficulty: number;
  days_to_harvest: number;
  summary: string;
};

type CropDetail = {
  id: number;
  slug: string;
  name: string;
  difficulty: number;
  days_to_harvest: number;
  summary: string;
  sunlight: string;
  water_cycle: string;
};

type GrowData = {
  cropId: number;
  cropSlug: string;
  cropName: string;
  cropEmoji: string;
  waterCount: number;
  growStage: number;
  lastWatered: string | null;
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

type Stage = { label: string; Icon: IconType; scale: number };

const STAGES: Stage[] = [
  { label: "씨앗",       Icon: GiAcorn,    scale: 0.6  },
  { label: "새싹",       Icon: FaSeedling, scale: 0.85 },
  { label: "성장중",     Icon: TbPlant,    scale: 1.1  },
  { label: "무르익는중", Icon: FaLeaf,     scale: 1.3  },
  { label: "수확 가능!", Icon: FaStar,     scale: 1.6  },
];

const STAGE_THRESHOLDS = [0, 2, 6, 12, 20];

function getStage(waterCount: number) {
  for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (waterCount >= STAGE_THRESHOLDS[i]) return i;
  }
  return 0;
}

function getCropIcon(slug: string): IconType {
  return CROP_ICON_MAP[slug] ?? FaLeaf;
}

const STORAGE_KEY = "easyhanong_grow";

export default function Grow() {
  const [initialized, setInitialized] = useState(false);
  const [phase, setPhase] = useState<"select" | "grow">("select");
  const [crops, setCrops] = useState<ApiCrop[]>([]);
  const [growData, setGrowData] = useState<GrowData | null>(null);
  const [cropDetail, setCropDetail] = useState<CropDetail | null>(null);
  const [isWatering, setIsWatering] = useState(false);
  const [levelUp, setLevelUp] = useState(false);

  const plantRef = useRef<HTMLDivElement>(null);
  const dropsRef = useRef<HTMLDivElement>(null);

  // localStorage 확인 후 initialized = true
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setGrowData(JSON.parse(saved));
      setPhase("grow");
    }
    setInitialized(true);
  }, []);

  // initialized 이후에만 작물 목록 fetch (불필요한 401 방지)
  useEffect(() => {
    if (!initialized || phase !== "select") return;
    apiFetch("/crops/api-easy/get")
      .then((r) => r.json())
      .then((d) => setCrops(d.result as ApiCrop[]))
      .catch(() => {});
  }, [initialized, phase]);

  // grow 단계 진입 시 작물 상세 fetch
  useEffect(() => {
    if (phase !== "grow" || !growData) return;
    apiFetch(`/crops/${growData.cropId}`)
      .then((r) => r.json())
      .then((d) => setCropDetail(d))
      .catch(() => {});
  }, [phase, growData?.cropId]);

  const selectCrop = (crop: ApiCrop) => {
    const data: GrowData = {
      cropId: crop.id,
      cropSlug: crop.slug,
      cropName: crop.name,
      cropEmoji: "",
      waterCount: 0,
      growStage: 0,
      lastWatered: null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setGrowData(data);
    setPhase("grow");
  };

  const handleWater = () => {
    if (!growData || isWatering) return;
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
      const newCount = growData.waterCount + 1;
      const newStage = getStage(newCount);
      const didLevelUp = newStage > growData.growStage;

      if (didLevelUp && plantRef.current) {
        gsap.fromTo(plantRef.current, { scale: 1 }, { scale: 1.35, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" });
        setLevelUp(true);
        setTimeout(() => setLevelUp(false), 2200);
      }

      const updated: GrowData = { ...growData, waterCount: newCount, growStage: newStage, lastWatered: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setGrowData(updated);
      setIsWatering(false);
    }, 1100);
  };

  const resetCrop = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGrowData(null);
    setCrops([]);
    setPhase("select");
  };

  // ─── 작물 선택 화면 ───────────────────────────────────────────
  if (phase === "select") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-linear-to-br from-sub1 to-sub2 flex flex-col items-center justify-center py-16 px-4">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <FaSeedling /> 키울 작물을 선택하세요
          </h1>
          <p className="text-green2 mb-10">한 번 선택하면 수확까지 함께해요!</p>
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
                  <span className="text-xs text-gray-400">{DIFFICULTY_MAP[crop.difficulty]} · {crop.days_to_harvest}일</span>
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

  const stage = STAGES[growData.growStage];
  // 3단계 이상이면 실제 작물 아이콘으로 교체
  const PlantIcon = growData.growStage >= 3 ? getCropIcon(growData.cropSlug) : stage.Icon;
  const CropIcon = getCropIcon(growData.cropSlug);

  const nextThreshold = STAGE_THRESHOLDS[Math.min(growData.growStage + 1, STAGE_THRESHOLDS.length - 1)];
  const prevThreshold = STAGE_THRESHOLDS[growData.growStage];
  const progressPct = growData.growStage >= 4
    ? 100
    : Math.min(((growData.waterCount - prevThreshold) / (nextThreshold - prevThreshold)) * 100, 100);

  const lastWateredText = growData.lastWatered
    ? new Date(growData.lastWatered).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "아직 물을 준 적이 없어요";

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-sub1 to-sub2">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 gap-7">

        {/* 레벨업 토스트 */}
        {levelUp && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-bold px-6 py-3 rounded-full shadow-lg z-50 animate-bounce flex items-center gap-2">
            <FaStar /> 성장했어요! {stage.label}
          </div>
        )}

        {/* 작물 이름 + 단계 */}
        <div className="text-center flex flex-col items-center gap-1">
          <p className="text-green2 text-sm tracking-wide">{stage.label}</p>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CropIcon size={22} className="text-green3" />
            {growData.cropName}
          </h2>
        </div>

        {/* 게임 보드 */}
        <div className="relative flex flex-col items-center">

          {/* 물방울 */}
          <div ref={dropsRef} className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-10">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="drop absolute opacity-0" style={{ left: `${(i - 2) * 18}px` }}>
                <FaTint size={20} className="text-blue-300" />
              </span>
            ))}
          </div>

          {/* 식물 + 화분 */}
          <div ref={plantRef} className="flex flex-col items-center">
            <PlantIcon
              size={stage.scale * 72}
              className="text-green4 transition-all duration-700"
            />

            {/* 화분 */}
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

        {/* 성장 진행도 */}
        <div className="w-72 flex flex-col gap-2">
          <div className="flex justify-between text-xs text-green2">
            <span className="flex items-center gap-1"><FaTint className="text-blue-300" /> {growData.waterCount}번 줬어요</span>
            {growData.growStage < 4
              ? <span>다음까지 {nextThreshold - growData.waterCount}번 남았어요</span>
              : <span className="flex items-center gap-1"><FaStar className="text-yellow-300" /> 다 컸어요!</span>
            }
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-green3 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 작물 상세 정보 */}
        {cropDetail && (
          <div className="w-72 bg-white/10 rounded-2xl px-5 py-4 flex flex-col gap-2 text-sm text-green2">
            <p>☀️ {cropDetail.sunlight}</p>
            <p>💧 물 주기: {cropDetail.water_cycle}</p>
            <p className="text-green3 text-xs">{cropDetail.summary}</p>
          </div>
        )}

        {/* 물주기 버튼 */}
        <button
          onClick={handleWater}
          disabled={isWatering}
          className="bg-blue-400 hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 px-14 rounded-full shadow-lg transition-all flex items-center gap-2"
        >
          <FaTint /> {isWatering ? "물 주는 중..." : "물주기"}
        </button>

        <p className="text-green3 text-xs">마지막으로 준 시간: {lastWateredText}</p>

        <button onClick={resetCrop} className="text-green3/60 hover:text-green3 text-xs underline transition-colors">
          다른 작물로 바꾸기
        </button>
      </main>
    </div>
  );
}
