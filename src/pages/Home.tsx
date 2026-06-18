import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  FaLeaf, FaSeedling, FaFire, FaStar, FaBook, FaRobot,
  FaCheckCircle, FaGlobeAmericas, FaHome, FaBullseye,
  FaClock, FaRecycle, FaHeart, FaCalendarAlt, FaComments,
} from "react-icons/fa";
import { GiTomato, GiStrawberry, GiCabbage, GiChiliPepper } from "react-icons/gi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { apiFetch } from "../lib/api";

gsap.registerPlugin(ScrollTrigger);

type ApiCrop = {
  id: number;
  slug: string;
  name: string;
  difficulty: number;
  days_to_harvest: number;
  summary: string;
  sunlight: string;
  water_cycle: string;
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

type Crop = {
  icon: ReactNode;
  name: string;
  desc: string;
  difficulty: string;
  days: string;
};

type Feature = {
  Icon: IconType;
  title: string;
  desc: string;
  example: ReactNode;
};

type Point = {
  Icon: IconType;
  iconColor: string;
  amount: string;
  label: string;
  sub: string;
};

type SdgsTag = {
  Icon: IconType;
  label: string;
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

function getCropIcon(slug: string, size = 48): ReactNode {
  const Icon = CROP_ICON_MAP[slug] ?? FaLeaf;
  return <Icon size={size} className="text-green4" />;
}

function mapCrop(c: ApiCrop): Crop {
  return {
    icon: getCropIcon(c.slug),
    name: c.name,
    desc: c.summary,
    difficulty: DIFFICULTY_MAP[c.difficulty] ?? String(c.difficulty),
    days: `${c.days_to_harvest}일`,
  };
}


const features: Feature[] = [
  {
    Icon: FaCalendarAlt,
    title: "날짜별 재배 가이드",
    desc: "씨앗 심기부터 수확까지, 오늘 해야 할 재배 활동을 매일 알려드려요. 물주기, 비료, 햇빛 관리까지 단계별 안내!",
    example: <><FaSeedling className="inline mr-1" /> 오늘의 할 일: 토마토 물주기 &amp; 지지대 설치</>,
  },
  {
    Icon: FaRobot,
    title: "AI 농사 채팅",
    desc: "잎이 노랗게 됐어요? 벌레가 생겼어요? AI에게 무엇이든 물어보세요. 전문 농업 지식을 쉽게 답변해드려요.",
    example: <><FaComments className="inline mr-1" /> &quot;토마토 잎이 말려요&quot; → AI 즉시 진단!</>,
  },
  {
    Icon: FaCheckCircle,
    title: "출석 체크 & 포인트",
    desc: "매일 출석하면 포인트를 획득해요! 모인 포인트로 AI 채팅을 무제한 사용하고 특별 혜택도 누려보세요.",
    example: <><FaCheckCircle className="inline mr-1" /> 7일 연속 출석 = AI 채팅 30회 무료!</>,
  },
];

const points: Point[] = [
  { Icon: FaCheckCircle, iconColor: "text-green4",  amount: "+10P",  label: "일일 출석",   sub: "매일 앱 접속" },
  { Icon: FaFire,        iconColor: "text-orange-400", amount: "+50P",  label: "연속 출석",   sub: "7일 연속 출석" },
  { Icon: FaBook,        iconColor: "text-blue-400", amount: "+20P",  label: "가이드 완료", sub: "오늘의 할 일 완료" },
  { Icon: FaStar,        iconColor: "text-yellow-400", amount: "+100P", label: "수확 인증",   sub: "작물 수확 사진 공유" },
];

const sdgsTags: SdgsTag[] = [
  { Icon: FaSeedling, label: "식량 자립" },
  { Icon: FaRecycle,  label: "친환경 재배" },
  { Icon: FaHome,     label: "도시 농업" },
  { Icon: FaHeart,    label: "탄소 절감" },
];

export default function Home() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [cropIds, setCropIds] = useState<number[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const heroRef     = useRef<HTMLElement>(null);
  const cropsRef    = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const pointsRef   = useRef<HTMLElement>(null);
  const aiChatRef   = useRef<HTMLElement>(null);
  const sdgsRef     = useRef<HTMLElement>(null);
  const ctaRef      = useRef<HTMLElement>(null);

  useEffect(() => {
    apiFetch("/crops/api-easy/get")
      .then((res) => res.json())
      .then((data) => {
        const list = data.result as ApiCrop[];
        setCrops(list.map(mapCrop));
        setCropIds(list.map((c) => c.id));
      })
      .catch(() => {});
  }, []);

  const openCropDetail = (id: number) => {
    setDetailLoading(true);
    setSelectedCrop(null);
    apiFetch(`/crops/${id}`)
      .then((r) => r.json())
      .then((d) => setSelectedCrop(d as CropDetail))
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  };

  useEffect(() => {
    if (crops.length === 0) return;
    const id = requestAnimationFrame(() => {
      const cards = document.querySelectorAll(".crop-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
      );
    });
    return () => cancelAnimationFrame(id);
  }, [crops]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-item", {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.15, ease: "power2.out",
      });

      gsap.utils.toArray<HTMLElement>(".section-header").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 85%" },
          opacity: 0, y: 24, duration: 0.6, ease: "power2.out",
        });
      });

      gsap.from(".feature-card", {
        scrollTrigger: { trigger: featuresRef.current, start: "top 80%" },
        opacity: 0, y: 40, duration: 0.5, stagger: 0.12, ease: "power2.out",
      });

      gsap.from(".point-card", {
        scrollTrigger: { trigger: pointsRef.current, start: "top 80%" },
        opacity: 0, scale: 0.85, duration: 0.45, stagger: 0.1, ease: "back.out(1.5)",
      });

      gsap.from(".ai-left", {
        scrollTrigger: { trigger: aiChatRef.current, start: "top 80%" },
        opacity: 0, x: -40, duration: 0.6, ease: "power2.out",
      });
      gsap.from(".ai-right", {
        scrollTrigger: { trigger: aiChatRef.current, start: "top 80%" },
        opacity: 0, x: 40, duration: 0.6, ease: "power2.out",
      });

      gsap.from(".sdgs-tag", {
        scrollTrigger: { trigger: sdgsRef.current, start: "top 80%" },
        opacity: 0, scale: 0.8, duration: 0.4, stagger: 0.07, ease: "back.out(1.4)",
      });

      gsap.from(".cta-content", {
        scrollTrigger: { trigger: ctaRef.current, start: "top 85%" },
        opacity: 0, y: 30, duration: 0.6, ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, []);

  const renderCard = (crop: Crop, id: number) => (
    <button
      key={crop.name}
      onClick={() => openCropDetail(id)}
      className="crop-card bg-white rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex flex-col items-center text-center gap-3 cursor-pointer w-full"
    >
      <span>{crop.icon}</span>
      <h3 className="text-xl font-bold">{crop.name}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{crop.desc}</p>
      <div className="flex gap-2 mt-auto pt-2">
        <span className="bg-green2/60 text-green5 text-xs px-3 py-1 rounded-full font-medium">난이도: {crop.difficulty}</span>
        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <FaClock size={10} /> {crop.days}
        </span>
      </div>
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* 작물 상세 모달 */}
      {(detailLoading || selectedCrop) && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCrop(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col gap-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <p className="text-center text-gray-400 py-8">불러오는 중...</p>
            ) : selectedCrop && (
              <>
                <div className="flex items-center gap-3">
                  <span>{getCropIcon(selectedCrop.slug, 40)}</span>
                  <div>
                    <h3 className="text-xl font-bold">{selectedCrop.name}</h3>
                    <span className="text-xs text-gray-400">
                      {DIFFICULTY_MAP[selectedCrop.difficulty]} · {selectedCrop.days_to_harvest}일
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedCrop.summary}</p>
                <div className="bg-green1 rounded-2xl p-4 flex flex-col gap-2 text-sm">
                  <p className="flex items-center gap-2"><FaLeaf className="text-green4" /> {selectedCrop.sunlight}</p>
                  <p className="flex items-center gap-2"><FaSeedling className="text-blue-400" /> 물 주기: {selectedCrop.water_cycle}</p>
                </div>
                <button
                  onClick={() => setSelectedCrop(null)}
                  className="mt-2 bg-green3 hover:bg-green5 text-white font-bold py-2 rounded-full transition-colors"
                >
                  닫기
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 히어로 섹션 */}
      <main ref={heroRef} className="bg-linear-to-br from-sub1 to-sub2 flex flex-col items-center justify-center gap-5 py-28 text-center px-4">
        <div className="hero-item flex items-center gap-3 text-white text-6xl">
          <FaHome />
          <FaSeedling />
        </div>
        <p className="hero-item text-4xl font-bold text-white">집에서 쉽게 시작하는 스마트 홈 파밍</p>
        <p className="hero-item text-green2 text-lg max-w-lg leading-relaxed">
          AI와 함께 누구나 집에서 신선한 채소를 키울 수 있어요.<br />
          UN SDGs 식량안보 및 지속가능한 농업 목표를 실천해요.
        </p>
        <div className="hero-item flex gap-3 mt-2">
          <a href="/grow" className="bg-green3 hover:bg-green5 transition-colors text-white font-bold py-3 px-7 rounded-full flex items-center gap-2">
            <FaSeedling /> 지금 시작하기
          </a>
          <a href="#features" className="text-white font-bold py-3 px-7 border border-white/40 hover:border-white/70 transition-colors rounded-full">
            더 알아보기
          </a>
        </div>
      </main>

      {/* UN SDGs 배너 */}
      <div className="bg-white flex items-center justify-center gap-3 py-5 border-b border-gray-100">
        <FaGlobeAmericas className="text-green4 text-2xl" />
        <p className="text-gray-600 text-sm">UN 지속가능발전목표(SDGs) · 목표 2: 기아 종식 및 지속가능한 농업 강화를 실천합니다</p>
      </div>

      {/* 재배 가능 작물 섹션 */}
      <section ref={cropsRef} className="bg-gray-50 py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="section-header text-center mb-12">
            <span className="bg-green3 text-white text-sm font-semibold px-4 py-1 rounded-full">재배 가능 작물</span>
            <h2 className="text-3xl font-bold mt-4 mb-2">집에서 키울 수 있는 작물들</h2>
            <p className="text-gray-500">초보자도 쉽게 시작할 수 있는 다양한 작물을 안내해드려요.</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {crops.slice(0, 4).map((c, i) => renderCard(c, cropIds[i]))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:w-3/4 mx-auto">
              {crops.slice(4).map((c, i) => renderCard(c, cropIds[i + 4]))}
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 기능 섹션 */}
      <section id="features" ref={featuresRef} className="bg-sub1 py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="section-header text-center mb-12">
            <span className="bg-green5 text-white text-sm font-semibold px-4 py-1 rounded-full">핵심 기능</span>
            <h2 className="text-3xl font-bold text-white mt-4 mb-2 flex items-center justify-center gap-2">
              이지하농과 함께라면 쉬워요 <FaStar className="text-yellow-300 text-2xl" />
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="feature-card bg-white/10 border border-green4/40 rounded-2xl p-6 flex flex-col gap-4">
                <f.Icon size={36} className="text-green2" />
                <h3 className="text-white font-bold text-lg">{f.title}</h3>
                <p className="text-green2 text-sm leading-relaxed">{f.desc}</p>
                <div className="bg-green2 rounded-xl px-4 py-3 text-green5 text-sm">{f.example}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 포인트 획득 방법 섹션 */}
      <section ref={pointsRef} className="bg-white py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-header text-3xl font-bold text-center mb-12 flex items-center justify-center gap-2">
            <FaBullseye className="text-green4" /> 포인트 획득 방법
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {points.map((p) => (
              <div key={p.label} className="point-card bg-gray-50 hover:bg-green2/30 transition-colors rounded-2xl p-6 flex flex-col items-center gap-2 text-center">
                <p.Icon size={36} className={p.iconColor} />
                <span className="text-green4 font-bold text-xl">{p.amount}</span>
                <span className="font-semibold text-sm">{p.label}</span>
                <span className="text-gray-400 text-xs">{p.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI 채팅 섹션 */}
      <section ref={aiChatRef} className="bg-gray-50 py-20 px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="ai-left">
            <span className="bg-green3 text-white text-sm font-semibold px-4 py-1 rounded-full">AI 채팅</span>
            <h2 className="text-3xl font-bold mt-4 mb-4 flex items-center gap-2">
              AI에게 물어보세요 <FaRobot className="text-green4" />
            </h2>
            <p className="text-gray-500 mb-6">초보 농부도 걱정 없어요. 병충해, 물주기, 영양 부족 등 어떤 질문이든 AI가 전문적이고 친절하게 답변해드려요.</p>
            <a href="/ai-chat" className="inline-block bg-green3 hover:bg-green5 transition-colors text-white font-bold py-3 px-6 rounded-full">
              AI와 채팅 시작하기 →
            </a>
          </div>
          <div className="ai-right bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <FaRobot size={24} className="text-green4 mt-1 shrink-0" />
              <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 text-sm text-gray-700">
                잎이 노래지는 것은 주로 질소 부족이나 과습이 원인이에요! 물주기 빈도를 줄이고 액체 비료를 2주에 한 번 주세요 <FaLeaf className="inline text-green4" />
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-green3 text-white rounded-2xl rounded-tr-none p-4 text-sm max-w-xs">
                감사해요! 어떤 비료를 써야 하나요?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UN SDGs 섹션 */}
      <section ref={sdgsRef} className="bg-green2 py-20 px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <FaGlobeAmericas size={52} className="section-header text-green4 mx-auto mb-6" />
          <h2 className="section-header text-3xl font-bold mb-4">UN SDGs와 함께하는 이지하농</h2>
          <p className="section-header text-gray-600 mb-6">지속가능발전목표 2번 - 기아 종식을 실천합니다.</p>
          <p className="section-header text-gray-500 mb-8 leading-relaxed">
            집에서 직접 식물을 키움으로써 식량 자립도를 높이고, 화학 농약 없는 건강한 먹거리를 만들어요.<br />
            작은 화분 하나에서 시작되는 지속가능한 미래! <FaLeaf className="inline text-green4" />
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {sdgsTags.map((tag) => (
              <span key={tag.label} className="sdgs-tag bg-white text-green4 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                <tag.Icon /> {tag.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section ref={ctaRef} className="bg-linear-to-br from-sub1 to-sub2 py-24 px-8 text-center">
        <div className="cta-content">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            오늘부터 홈 파밍 시작! <FaLeaf className="text-green3" />
          </h2>
          <p className="text-green2 mb-8">이지하농과 함께 집에서 신선하고 건강한 채소를 키워보세요. 가입 후 첫 출석 체크로 AI 채팅 10회 무료!</p>
          <a href="/signup" className="inline-flex items-center gap-2 bg-green3 hover:bg-green5 transition-colors text-white font-bold py-4 px-10 rounded-full text-lg">
            <FaSeedling /> 무료로 시작하기
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
