import React, { useCallback, useEffect, useState } from "react";
import { FaTimes, FaStar, FaCheckCircle, FaLeaf } from "react-icons/fa";
import {
  COINS_UPDATED_EVENT,
  getAttendanceReward,
  getCoins,
  setCoins,
} from "../lib/coins";
import {
  ATTENDANCE_TEST_MODE,
  canCheckToday,
  getToday,
  loadAttendanceState,
  saveAttendanceState,
  TOTAL_ATTENDANCE_DAYS,
  type AttendanceState,
} from "../lib/attendance";
import { apiFetch } from "../lib/api";

type AttendanceRecord = { attended_date: string; streak: number; earned: number };
type GetAttendanceResponse = { result: { attendances: AttendanceRecord[]; balance: number } };
type PostAttendanceResponse = { result: { attended_date: string; streak: number; earned: number; balance: number } };

function parseGetAttendance(data: GetAttendanceResponse): { state: AttendanceState; balance: number } {
  const attendances = data.result.attendances ?? [];
  const balance = data.result.balance ?? 0;
  const latest = attendances[0];
  const today = getToday();
  const alreadyToday = latest?.attended_date === today;
  const streakBase = latest?.streak ?? 0;
  return {
    state: {
      currentDay: Math.max(1, alreadyToday ? streakBase : streakBase + 1),
      lastCheckDate: alreadyToday ? today : (latest?.attended_date ?? null),
    },
    balance,
  };
}

const TOTAL_DAYS = TOTAL_ATTENDANCE_DAYS;

function isDayCompleted(
  day: number,
  currentDay: number,
  lastCheckDate: string | null
): boolean {
  if (ATTENDANCE_TEST_MODE) return day < currentDay;
  if (day < currentDay) return true;
  if (day === currentDay && lastCheckDate === getToday()) return true;
  return false;
}

type AttendanceCheckModalProps = {
  open: boolean;
  onClose: () => void;
};

export const AttendanceCheckModal: React.FC<AttendanceCheckModalProps> = ({
  open,
  onClose,
}) => {
  const [state, setState] = useState<AttendanceState>(loadAttendanceState);
  const [coinBalance, setCoinBalance] = useState(getCoins);
  const [justChecked, setJustChecked] = useState(false);
  const [lastEarned, setLastEarned] = useState(0);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setCoinBalance(getCoins());
    window.addEventListener(COINS_UPDATED_EVENT, sync);
    return () => window.removeEventListener(COINS_UPDATED_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    setJustChecked(false);
    setApiError(null);

    // 서버에서 출석 현황 + 잔액 로드
    apiFetch("/api/attendance/get")
      .then((r) => r.json())
      .then((data) => {
        const { state: parsed, balance } = parseGetAttendance(data as GetAttendanceResponse);
        setState(parsed);
        saveAttendanceState(parsed);
        setCoins(balance);
        setCoinBalance(balance);
      })
      .catch(() => setState(loadAttendanceState()));

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleCheckIn = useCallback(async () => {
    if (!canCheckToday(state.lastCheckDate) || apiLoading) return;
    if (!ATTENDANCE_TEST_MODE && state.currentDay > TOTAL_DAYS) return;

    setApiLoading(true);
    setApiError(null);

    try {
      const res = await apiFetch("/api/attendance/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.status === 409) {
        setApiError("오늘은 이미 출석했어요!");
        // 서버 기준으로 상태 동기화
        const next: AttendanceState = { ...state, lastCheckDate: getToday() };
        setState(next);
        saveAttendanceState(next);
        return;
      }

      if (!res.ok) {
        setApiError("출석 처리 중 오류가 발생했어요.");
        return;
      }

      // 성공 — 서버 응답 기반으로 코인·상태 업데이트
      const { result } = (await res.json()) as PostAttendanceResponse;
      setCoins(result.balance);
      setCoinBalance(result.balance);

      const next: AttendanceState = ATTENDANCE_TEST_MODE
        ? {
            currentDay: result.streak >= TOTAL_DAYS ? 1 : result.streak + 1,
            lastCheckDate: null,
          }
        : {
            currentDay: result.streak,
            lastCheckDate: getToday(),
          };

      setState(next);
      saveAttendanceState(next);
      setLastEarned(result.earned);
      setJustChecked(true);
      setTimeout(() => setJustChecked(false), 1800);
    } catch {
      setApiError("네트워크 오류가 발생했어요.");
    } finally {
      setApiLoading(false);
    }
  }, [state, apiLoading]);

  if (!open) return null;

  const canCheck = canCheckToday(state.lastCheckDate);
  const todayReward = getAttendanceReward(state.currentDay);
  const completedCount = canCheck
    ? Math.max(state.currentDay - 1, 0)
    : Math.min(state.currentDay, TOTAL_DAYS);
  const progressPct = Math.min((completedCount / TOTAL_DAYS) * 100, 100);
  const allDays = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      style={{ background: "rgba(3,77,56,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-115 rounded-3xl overflow-hidden shadow-2xl"
        style={{ animation: "chatSlideUp 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 헤더 ── */}
        <div
          className="px-6 pt-6 pb-5"
          style={{ background: "linear-gradient(135deg, #034D38 0%, #006C4D 100%)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <img src="/easyhanong.png" alt="" className="w-7 h-7" />
              <span className="text-white font-bold text-base tracking-tight">출석 체크</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.15)" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            >
              <FaTimes size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.1)" }}>
              <p className="text-green2 text-[11px] m-0 mb-0.5">보유 코인</p>
              <p className="text-white font-bold text-xl m-0 leading-tight">{coinBalance}<span className="text-sm font-normal ml-1">coin</span></p>
            </div>
            <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.1)" }}>
              <p className="text-green2 text-[11px] m-0 mb-0.5">진행 현황</p>
              <p className="text-white font-bold text-xl m-0 leading-tight">{completedCount}<span className="text-sm font-normal text-green2 ml-1">/ {TOTAL_DAYS}일</span></p>
            </div>
          </div>
        </div>

        {/* ── 바디 ── */}
        <div className="bg-white px-6 py-5 flex flex-col gap-4">

          {/* 오늘 출석 카드 */}
          {canCheck ? (
            <div
              className="rounded-2xl p-4 flex items-center gap-4 border-2"
              style={{ background: "#F4F9F2", borderColor: "#51C99A" }}
            >
              <div
                className="w-13 h-13 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #00BA84, #51C99A)", width: 52, height: 52 }}
              >
                <FaStar size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm m-0" style={{ color: "#006C4D" }}>
                  {state.currentDay}일차 · 오늘 보상 +{todayReward} coin
                </p>
                <p className="text-gray-400 text-xs m-0 mt-0.5">지금 바로 출석하세요!</p>
              </div>
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={apiLoading}
                className="shrink-0 text-white font-bold text-sm px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #00BA84, #51C99A)" }}
              >
                {apiLoading ? "처리중..." : "출석!"}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl p-4 flex items-center gap-4 bg-gray-50">
              <div className="w-13 h-13 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <FaCheckCircle size={22} className="text-gray-300" />
              </div>
              <div>
                <p className="font-bold text-sm m-0 text-gray-600">오늘 출석 완료!</p>
                <p className="text-gray-400 text-xs m-0 mt-0.5">내일 다시 만나요 🌱</p>
              </div>
            </div>
          )}

          {/* 진행바 */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>전체 진행률</span>
              <span className="font-semibold" style={{ color: "#00BA84" }}>{Math.round(progressPct)}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, #00BA84, #51C99A)",
                }}
              />
            </div>
          </div>

          {apiError && (
            <p className="text-center text-sm text-red-400 font-semibold m-0 -mt-1">{apiError}</p>
          )}

          {/* 35일 그리드 */}
          <div className="grid grid-cols-7 gap-1.5">
            {allDays.map((day) => {
              const completed = isDayCompleted(day, state.currentDay, state.lastCheckDate);
              const isBonus = day % 7 === 0;
              const isToday = day === state.currentDay && canCheck;
              const isFuture = !completed && !isToday;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={!isToday}
                  onClick={isToday ? handleCheckIn : undefined}
                  title={`${day}일차 · +${getAttendanceReward(day)}coin`}
                  className={[
                    "aspect-square rounded-xl flex flex-col items-center justify-center text-[11px] font-bold transition-all",
                    isToday ? "scale-110 shadow-md" : "",
                    isFuture ? "cursor-default" : "cursor-pointer",
                  ].join(" ")}
                  style={{
                    background: completed
                      ? isBonus
                        ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                        : "linear-gradient(135deg, #00BA84, #51C99A)"
                      : isToday
                        ? "linear-gradient(135deg, #006C4D, #00BA84)"
                        : "#F4F9F2",
                    color: completed || isToday ? "#fff" : "#C8D5C4",
                    boxShadow: isToday ? "0 0 0 2.5px #00BA84, 0 4px 12px rgba(0,186,132,0.3)" : undefined,
                  }}
                >
                  {completed
                    ? isBonus ? <FaStar size={11} /> : <FaLeaf size={10} />
                    : isToday ? "GO" : day}
                </button>
              );
            })}
          </div>

          {/* 범례 */}
          <div className="flex gap-4 justify-center text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#00BA84" }} />
              출석 완료
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#f59e0b" }} />
              보너스 (50coin)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block border border-gray-200" style={{ background: "#F4F9F2" }} />
              예정
            </span>
          </div>

          {ATTENDANCE_TEST_MODE && (
            <p className="text-center text-[11px] text-red-400 font-semibold m-0">
              ⚠ 테스트 모드 · 연속 출석 가능
            </p>
          )}
        </div>
      </div>

      {/* 출석 완료 토스트 */}
      {justChecked && (
        <div
          className="fixed top-24 left-1/2 -translate-x-1/2 text-white font-bold px-6 py-3 rounded-full shadow-lg z-110 flex items-center gap-2 text-sm"
          style={{
            background: "linear-gradient(135deg, #00BA84, #51C99A)",
            animation: "chatSlideUp 0.3s ease-out",
          }}
        >
          <FaStar /> +{lastEarned} coin 획득!
        </div>
      )}
    </div>
  );
};
