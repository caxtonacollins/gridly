// lib/leaderboard.ts
// Local + session leaderboard helpers for Round Mode and global totals

export type LocalTotals = {
  totalRounds: number; // rounds played in Round Mode
  totalWins: number; // wins across all modes we record here (we'll add daily wins from daily handler)
  bestSolveTimeMs: number | null; // minimum across wins
  bestRoundStreak: number; // best streak ever achieved in Round Mode
};

const TOTALS_KEY = "gridly:leaderboard:totals";

export function loadLocalTotals(): LocalTotals {
  if (typeof window === "undefined")
    return { totalRounds: 0, totalWins: 0, bestSolveTimeMs: null, bestRoundStreak: 0 };
  try {
    const raw = localStorage.getItem(TOTALS_KEY);
    if (!raw) return { totalRounds: 0, totalWins: 0, bestSolveTimeMs: null, bestRoundStreak: 0 };
    const p = JSON.parse(raw) as Partial<LocalTotals>;
    return {
      totalRounds: p.totalRounds ?? 0,
      totalWins: p.totalWins ?? 0,
      bestSolveTimeMs: p.bestSolveTimeMs ?? null,
      bestRoundStreak: p.bestRoundStreak ?? 0,
    };
  } catch {
    return { totalRounds: 0, totalWins: 0, bestSolveTimeMs: null, bestRoundStreak: 0 };
  }
}

export function saveLocalTotals(t: LocalTotals) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOTALS_KEY, JSON.stringify(t));
  // notify listeners
  window.dispatchEvent(new Event("gridly:leaderboard:changed"));
}

// Call after a Round Mode completion
export function updateTotalsAfterRound(win: boolean, solveTimeMs?: number) {
  const t = loadLocalTotals();
  t.totalRounds += 1;
  if (win) {
    t.totalWins += 1;
    if (typeof solveTimeMs === "number") {
      if (t.bestSolveTimeMs == null || solveTimeMs < t.bestSolveTimeMs) {
        t.bestSolveTimeMs = solveTimeMs;
      }
    }
  }
  saveLocalTotals(t);
}

// Call after Daily Mode completion to reflect wins/time into all-time totals
export function updateTotalsAfterDaily(win: boolean, solveTimeMs?: number) {
  const t = loadLocalTotals();
  // Count daily attempt as a round for all-time totals
  t.totalRounds += 1;
  if (win) {
    t.totalWins += 1;
    if (typeof solveTimeMs === "number") {
      if (t.bestSolveTimeMs == null || solveTimeMs < t.bestSolveTimeMs) {
        t.bestSolveTimeMs = solveTimeMs;
      }
    }
  }
  saveLocalTotals(t);
}

export function maybeUpdateBestRoundStreak(bestStreak: number) {
  const t = loadLocalTotals();
  if (bestStreak > t.bestRoundStreak) {
    t.bestRoundStreak = bestStreak;
    saveLocalTotals(t);
  }
}
