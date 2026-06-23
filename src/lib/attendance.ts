const DAYS_PER_WEEK = 7;
const TOTAL_WEEKS = 5;
export const TOTAL_ATTENDANCE_DAYS = DAYS_PER_WEEK * TOTAL_WEEKS;
export const ATTENDANCE_STORAGE_KEY = "easyhanong-attendance";

/** 테스트용: 하루 1회 제한 해제, 새로고침 시 팝업 자동 오픈 */
export const ATTENDANCE_TEST_MODE = true;

export type AttendanceState = {
  currentDay: number;
  lastCheckDate: string | null;
};

export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getWeekForDay(day: number): number {
  return Math.min(Math.ceil(day / DAYS_PER_WEEK), TOTAL_WEEKS);
}

export function getDaysInWeek(week: number): number[] {
  const start = (week - 1) * DAYS_PER_WEEK + 1;
  return Array.from({ length: DAYS_PER_WEEK }, (_, i) => start + i);
}

export function loadAttendanceState(): AttendanceState {
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AttendanceState;
      return {
        currentDay: Math.min(
          Math.max(parsed.currentDay ?? 1, 1),
          TOTAL_ATTENDANCE_DAYS
        ),
        lastCheckDate: parsed.lastCheckDate ?? null,
      };
    }
  } catch {
    /* ignore */
  }
  return { currentDay: 1, lastCheckDate: null };
}

export function saveAttendanceState(state: AttendanceState) {
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(state));
}

export function canCheckToday(lastCheckDate: string | null): boolean {
  if (ATTENDANCE_TEST_MODE) return true;
  return lastCheckDate !== getToday();
}

export function shouldAutoOpenAttendance(): boolean {
  if (ATTENDANCE_TEST_MODE) return true;
  return canCheckToday(loadAttendanceState().lastCheckDate);
}
