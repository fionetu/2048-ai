const BEST_SCORE_KEY = "2048-ai-best-score";

export function getBestScore(): number {
  if (typeof window === "undefined") return 0;
  try {
    const value = window.localStorage.getItem(BEST_SCORE_KEY);
    return value ? parseInt(value, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function setBestScore(score: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // Ignore storage errors.
  }
}
