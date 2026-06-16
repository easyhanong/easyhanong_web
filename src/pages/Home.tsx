import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "../components/Header";
import Footer from "../components/Footer";

gsap.registerPlugin(ScrollTrigger);

const crops = [
  { emoji: "🍅", name: "토마토", desc: "햇빛 충분한 창가에서 키우는 새콤달콤 토마토", difficulty: "보통", days: "60~80일" },
  { emoji: "🍓", name: "딸기",   desc: "실내에서도 잘 자라는 달콤한 딸기",           difficulty: "쉬움", days: "90~120일" },
  { emoji: "🥬", name: "상추",   desc: "가장 빠르게 수확 가능한 쌈채소",             difficulty: "매우 쉬움", days: "30~40일" },
  { emoji: "🌿", name: "허브",   desc: "요리에 향을 더해주는 바질, 로즈마리 등",     difficulty: "쉬움", days: "45~60일" },
  { emoji: "🌶️", name: "고추",   desc: "비타민C 풍부한 매콤한 고추",                difficulty: "보통", days: "90~120일" },
  { emoji: "🥒", name: "오이",   desc: "수분 가득 시원한 오이",                     difficulty: "보통", days: "50~70일" },
];

const features = [
  {
    emoji: "📅",
    title: "날짜별 재배 가이드",
    desc: "씨앗 심기부터 수확까지, 오늘 해야 할 재배 활동을 매일 알려드려요. 물주기, 비료, 햇빛 관리까지 단계별 안내!",
    example: "🌱 오늘의 할 일: 토마토 물주기 & 지지대 설치",
  },
  {
    emoji: "🤖",
    title: "AI 농사 채팅",
    desc: "잎이 노랗게 됐어요? 벌레가 생겼어요? AI에게 무엇이든 물어보세요. 전문 농업 지식을 쉽게 답변해드려요.",
    example: "💬 \"토마토 잎이 말려요\" → AI 즉시 진단!",
  },
  {
    emoji: "✅",
    title: "출석 체크 & 포인트",
    desc: "매일 출석하면 포인트를 획득해요! 모인 포인트로 AI 채팅을 무제한 사용하고 특별 혜택도 누려보세요.",
    example: "✅ 7일 연속 출석 = AI 채팅 30회 무료!",
  },
];

const points = [
  { emoji: "✅", amount: "+10P", label: "일일 출석",  sub: "매일 앱 접속" },
  { emoji: "🔥", amount: "+50P", label: "연속 출석",  sub: "7일 연속 출석" },
  { emoji: "📖", amount: "+20P", label: "가이드 완료", sub: "오늘의 할 일 완료" },
  { emoji: "⭐", amount: "+100P", label: "수확 인증", sub: "작물 수확 사진 공유" },
];

const sdgsTags = ["🌱 식량 자립", "♻️ 친환경 재배", "🏡 도시 농업", "💚 탄소 절감"];

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const cropsRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const pointsRef = useRef<HTMLElement>(null);
  const aiChatRef = useRef<HTMLElement>(null);
  const sdgsRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 히어로 — 마운트 시 순차 페이드인
      gsap.from(".hero-item", {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.15,
        ease: "power2.out",
      });

      // 공통 섹션 헤더 페이드인
      gsap.utils.toArray<HTMLElement>(".section-header").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 85%" },
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: "power2.out",
        });
      });

      // 작물 카드 stagger
      gsap.from(".crop-card", {
        scrollTrigger: { trigger: cropsRef.current, start: "top 80%" },
        opacity: 0,
        y: 40,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
      });

      // 기능 카드 stagger
      gsap.from(".feature-card", {
        scrollTrigger: { trigger: featuresRef.current, start: "top 80%" },
        opacity: 0,
        y: 40,
        duration: 0.5,
        stagger: 0.12,
        ease: "power2.out",
      });

      // 포인트 카드 — 아래서 팝업
      gsap.from(".point-card", {
        scrollTrigger: { trigger: pointsRef.current, start: "top 80%" },
        opacity: 0,
        scale: 0.85,
        duration: 0.45,
        stagger: 0.1,
        ease: "back.out(1.5)",
      });

      // AI 채팅 — 좌우 슬라이드
      gsap.from(".ai-left", {
        scrollTrigger: { trigger: aiChatRef.current, start: "top 80%" },
        opacity: 0,
        x: -40,
        duration: 0.6,
        ease: "power2.out",
      });
      gsap.from(".ai-right", {
        scrollTrigger: { trigger: aiChatRef.current, start: "top 80%" },
        opacity: 0,
        x: 40,
        duration: 0.6,
        ease: "power2.out",
      });

      // SDGs 태그 stagger
      gsap.from(".sdgs-tag", {
        scrollTrigger: { trigger: sdgsRef.current, start: "top 80%" },
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        stagger: 0.07,
        ease: "back.out(1.4)",
      });

      // CTA 페이드인
      gsap.from(".cta-content", {
        scrollTrigger: { trigger: ctaRef.current, start: "top 85%" },
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* 히어로 섹션 */}
      <main ref={heroRef} className="bg-linear-to-br from-sub1 to-sub2 flex flex-col items-center justify-center gap-5 py-28 text-center px-4">
        <p className="hero-item text-5xl">🏡🌱</p>
        <h1 className="hero-item text-4xl font-bold text-white">집에서 쉽게 시작하는 스마트 홈 파밍</h1>
        <p className="hero-item text-green2 text-lg max-w-lg leading-relaxed">
          AI와 함께 누구나 집에서 신선한 채소를 키울 수 있어요.<br />
          UN SDGs 식량안보 및 지속가능한 농업 목표를 실천해요.
        </p>
        <div className="hero-item flex gap-3 mt-2">
          <a href="/signup" className="bg-green3 hover:bg-green5 transition-colors text-white font-bold py-3 px-7 rounded-full">
            🌱 지금 시작하기
          </a>
          <a href="#features" className="text-white font-bold py-3 px-7 border border-white/40 hover:border-white/70 transition-colors rounded-full">
            더 알아보기
          </a>
        </div>
      </main>

      {/* UN SDGs 배너 */}
      <div className="bg-white flex items-center justify-center gap-3 py-5 border-b border-gray-100">
        <span className="text-2xl">🌍</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <div key={crop.name} className="crop-card bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-3">
                <span className="text-5xl">{crop.emoji}</span>
                <h3 className="text-xl font-bold">{crop.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{crop.desc}</p>
                <div className="flex gap-2 mt-auto pt-2">
                  <span className="bg-green2/60 text-green5 text-xs px-3 py-1 rounded-full font-medium">난이도: {crop.difficulty}</span>
                  <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">⏱ {crop.days}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 핵심 기능 섹션 */}
      <section id="features" ref={featuresRef} className="bg-sub1 py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="section-header text-center mb-12">
            <span className="bg-green5 text-white text-sm font-semibold px-4 py-1 rounded-full">핵심 기능</span>
            <h2 className="text-3xl font-bold text-white mt-4 mb-2">이지하농과 함께라면 쉬워요 ✨</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="feature-card bg-white/10 border border-green4/40 rounded-2xl p-6 flex flex-col gap-4">
                <span className="text-4xl">{f.emoji}</span>
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
          <h2 className="section-header text-3xl font-bold text-center mb-12">🎯 포인트 획득 방법</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {points.map((p) => (
              <div key={p.label} className="point-card bg-gray-50 hover:bg-green2/30 transition-colors rounded-2xl p-6 flex flex-col items-center gap-2 text-center">
                <span className="text-4xl">{p.emoji}</span>
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
            <h2 className="text-3xl font-bold mt-4 mb-4">AI에게 물어보세요 🤖</h2>
            <p className="text-gray-500 mb-6">초보 농부도 걱정 없어요. 병충해, 물주기, 영양 부족 등 어떤 질문이든 AI가 전문적이고 친절하게 답변해드려요.</p>
            <a href="/ai-chat" className="inline-block bg-green3 hover:bg-green5 transition-colors text-white font-bold py-3 px-6 rounded-full">
              AI와 채팅 시작하기 →
            </a>
          </div>
          <div className="ai-right bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 text-sm text-gray-700">
                잎이 노래지는 것은 주로 질소 부족이나 과습이 원인이에요! 물주기 빈도를 줄이고 액체 비료를 2주에 한 번 주세요 🌱
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
          <span className="section-header text-5xl block mb-6">🌍</span>
          <h2 className="section-header text-3xl font-bold mb-4">UN SDGs와 함께하는 이지하농</h2>
          <p className="section-header text-gray-600 mb-6">지속가능발전목표 2번 - 기아 종식을 실천합니다.</p>
          <p className="section-header text-gray-500 mb-8 leading-relaxed">
            집에서 직접 식물을 키움으로써 식량 자립도를 높이고, 화학 농약 없는 건강한 먹거리를 만들어요.<br />
            작은 화분 하나에서 시작되는 지속가능한 미래! 🌱
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {sdgsTags.map((tag) => (
              <span key={tag} className="sdgs-tag bg-white text-green4 px-4 py-2 rounded-full text-sm">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section ref={ctaRef} className="bg-linear-to-br from-sub1 to-sub2 py-24 px-8 text-center">
        <div className="cta-content">
          <h2 className="text-3xl font-bold text-white mb-4">오늘부터 홈 파밍 시작! 🌿</h2>
          <p className="text-green2 mb-8">이지하농과 함께 집에서 신선하고 건강한 채소를 키워보세요. 가입 후 첫 출석 체크로 AI 채팅 10회 무료!</p>
          <a href="/signup" className="inline-block bg-green3 hover:bg-green5 transition-colors text-white font-bold py-4 px-10 rounded-full text-lg">
            🌱 무료로 시작하기
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
