import React, { useCallback, useEffect, useState } from "react";
import {
  addCoins,
  COINS_UPDATED_EVENT,
  getAttendanceReward,
  getCoins,
} from "../lib/coins";
import {
  ATTENDANCE_TEST_MODE,
  canCheckToday,
  getDaysInWeek,
  getToday,
  getWeekForDay,
  loadAttendanceState,
  saveAttendanceState,
  TOTAL_ATTENDANCE_DAYS,
  type AttendanceState,
} from "../lib/attendance";

const dayCoinImage = "/day-coin.png";

const TOTAL_WEEKS = 5;
const TOTAL_DAYS = TOTAL_ATTENDANCE_DAYS;

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

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
  const [viewWeek, setViewWeek] = useState(1);
  const [coinBalance, setCoinBalance] = useState(getCoins);

  useEffect(() => {
    const sync = () => setCoinBalance(getCoins());
    window.addEventListener(COINS_UPDATED_EVENT, sync);
    return () => window.removeEventListener(COINS_UPDATED_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => {
      const loaded = loadAttendanceState();
      setState(loaded);
      const active = canCheckToday(loaded.lastCheckDate)
        ? loaded.currentDay
        : Math.max(loaded.currentDay - 1, 1);
      setViewWeek(getWeekForDay(active));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleCheckIn = useCallback(() => {
    if (!canCheckToday(state.lastCheckDate)) return;

    const next: AttendanceState = ATTENDANCE_TEST_MODE
      ? {
          currentDay:
            state.currentDay >= TOTAL_DAYS ? 1 : state.currentDay + 1,
          lastCheckDate: null,
        }
      : {
          currentDay: Math.min(state.currentDay + 1, TOTAL_DAYS + 1),
          lastCheckDate: getToday(),
        };

    if (!ATTENDANCE_TEST_MODE && state.currentDay > TOTAL_DAYS) return;

    const reward = getAttendanceReward(state.currentDay);
    addCoins(reward);
    setCoinBalance(getCoins());

    setState(next);
    saveAttendanceState(next);
    if (ATTENDANCE_TEST_MODE) {
      setViewWeek(getWeekForDay(next.currentDay));
    }
  }, [state]);

  if (!open) return null;

  const today = getToday();
  const canCheck = canCheckToday(state.lastCheckDate);
  const activeDay = canCheck
    ? Math.min(state.currentDay, TOTAL_DAYS)
    : null;
  const weekDays = getDaysInWeek(viewWeek);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attendance-modal-title"
      onClick={onClose}
    >
      <div
        className="relative bg-white border border-[#bdbdbd] w-full max-w-[560px] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[#ff0000] text-white text-lg font-bold flex items-center justify-center leading-none hover:opacity-90 transition-opacity cursor-pointer border-none p-0"
        >
          ×
        </button>

        <header className="pt-8 pb-4 px-6 text-center">
          <p
            id="attendance-modal-title"
            className="text-black text-base font-bold m-0 tracking-tight"
          >
            여기에 로고 들어갈거
          </p>
          <p className="text-[#2d6a4f] text-sm font-bold mt-2 mb-0">
            보유 {coinBalance}coin
          </p>
        </header>

        <div className="px-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              disabled={viewWeek <= 1}
              onClick={() => setViewWeek((w) => Math.max(1, w - 1))}
              className="text-[#2d6a4f] bg-[#d8f3dc] border-none rounded-lg px-3 py-1.5 text-sm font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← 이전 주
            </button>
            <span className="text-black text-lg font-extrabold">
              {viewWeek}주차
            </span>
            <button
              type="button"
              disabled={viewWeek >= TOTAL_WEEKS}
              onClick={() => setViewWeek((w) => Math.min(TOTAL_WEEKS, w + 1))}
              className="text-[#2d6a4f] bg-[#d8f3dc] border-none rounded-lg px-3 py-1.5 text-sm font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              다음 주 →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 justify-items-center">
            {weekDays.map((day, index) => {
              const coins = getAttendanceReward(day);
              const completed = isDayCompleted(
                day,
                state.currentDay,
                state.lastCheckDate
              );
              const isActive = activeDay === day;
              const isFuture = day > (activeDay ?? state.currentDay);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={!isActive}
                  onClick={isActive ? handleCheckIn : undefined}
                  className={[
                    "flex flex-col items-center gap-0.5 w-full border-none bg-transparent p-0",
                    isActive ? "cursor-pointer" : "cursor-default",
                    isFuture ? "opacity-35" : completed ? "opacity-80" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="text-[10px] font-semibold text-[#888] leading-none">
                    {WEEKDAY_LABELS[index]}
                  </span>
                  <span className="text-[13px] font-bold text-black leading-none">
                    {day}일차
                  </span>
                  <img
                    src={dayCoinImage}
                    alt={`${day}일차 보상`}
                    className={[
                      "w-11 h-11 object-contain select-none",
                      isActive ? "scale-110" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    draggable={false}
                  />
                  <span className="text-[11px] font-bold text-black leading-none">
                    {coins}coin
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-center text-[#888] text-xs mt-4 mb-0">
            주별 출석 · 총 {TOTAL_WEEKS}주 ({TOTAL_DAYS}일)
            {ATTENDANCE_TEST_MODE && (
              <span className="block text-[#e63946] font-bold mt-1">
                테스트 모드 · 연속 출석 가능
              </span>
            )}
          </p>

          {!ATTENDANCE_TEST_MODE && state.lastCheckDate === today && (
            <p className="text-center text-[#333] text-xs font-semibold mt-4 mb-0">
              오늘 출석 완료
            </p>
          )}
          {canCheck && activeDay && viewWeek === getWeekForDay(activeDay) && (
            <p className="text-center text-[#666] text-xs mt-4 mb-0">
              {activeDay}일차 코인을 눌러 출석하세요
            </p>
          )}
          {canCheck && activeDay && viewWeek !== getWeekForDay(activeDay) && (
            <p className="text-center text-[#666] text-xs mt-4 mb-0">
              {getWeekForDay(activeDay)}주차에서 출석할 수 있어요
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
