export const COIN_STORAGE_KEY = "easyhanong-coins";
export const COINS_UPDATED_EVENT = "easyhanong-coins-updated";
export const CHAT_QUESTION_COST = 10;

export function getAttendanceReward(day: number): number {
  return day % 7 === 0 ? 50 : 10;
}

export function getCoins(): number {
  try {
    const raw = localStorage.getItem(COIN_STORAGE_KEY);
    if (raw !== null) {
      const n = parseInt(raw, 10);
      return Number.isFinite(n) ? Math.max(0, n) : 0;
    }
  } catch {
    /* ignore */
  }
  return 0;
}

export function setCoins(amount: number): number {
  const value = Math.max(0, Math.floor(amount));
  localStorage.setItem(COIN_STORAGE_KEY, String(value));
  window.dispatchEvent(new CustomEvent(COINS_UPDATED_EVENT));
  return value;
}

export function addCoins(amount: number): number {
  return setCoins(getCoins() + amount);
}

export function spendCoins(amount: number): boolean {
  const current = getCoins();
  if (current < amount) return false;
  setCoins(current - amount);
  return true;
}

export function canAffordChat(): boolean {
  return getCoins() >= CHAT_QUESTION_COST;
}
