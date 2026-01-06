// lib/storage.ts
// Simple localStorage helpers for Gridly MVP
// Data model:
// localStorage["gridly:results"] = JSON.stringify({ [dateKey]: { win: boolean, ts: number, choice?: number } })

const STORAGE_KEY = "gridly:results";
const OVERRIDE_KEY = "gridly:overrideDate";

// Result supports an optional solveTimeMs field to record how long the user took to make the first attempt
export type Result = {
  win: boolean;
  ts: number;
  choice?: number;
  solveTimeMs?: number;
};

export function loadResults(): Record<string, Result> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Result>;
  } catch (e) {
    console.error("Failed to parse gridly results", e);
    return {};
  }
}

export function saveResults(map: Record<string, Result>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getResultForDate(dateKey: string) {
  const map = loadResults();
  return map[dateKey] ?? null;
}

export function setResultForDate(dateKey: string, result: Result) {
  const map = loadResults();
  map[dateKey] = result;
  saveResults(map);
}

export function clearResults() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getOverrideDate(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(OVERRIDE_KEY);
}

export function setOverrideDate(dateKey: string | null) {
  if (typeof window === "undefined") return;
  if (dateKey === null) localStorage.removeItem(OVERRIDE_KEY);
  else localStorage.setItem(OVERRIDE_KEY, dateKey);
}

// Statistics computed from results map
export function computeStats() {
  const map = loadResults();
  const dates = Object.keys(map).sort();

  const gamesPlayed = dates.length;
  const wins = dates.reduce((s, d) => s + (map[d].win ? 1 : 0), 0);

  // Compute streaks (consecutive UTC days with wins ending today)
  let bestStreak = 0;
  let currentStreak = 0;
  let streak = 0;
  let prevDate: Date | null = null;

  // Solve-time metrics
  let bestSolveTimeMs: number | null = null; // best (minimum) solve time among wins
  let lastSolveTimeMs: number | null = null; // most recent solve time (any result with solveTimeMs)

  for (const d of dates) {
    const entry = map[d];
    const win = entry.win;

    // solve-time aggregation
    if (entry.solveTimeMs != null) {
      lastSolveTimeMs = entry.solveTimeMs;
      if (win) {
        if (bestSolveTimeMs == null || entry.solveTimeMs < bestSolveTimeMs) {
          bestSolveTimeMs = entry.solveTimeMs;
        }
      }
    }

    const [y, m, day] = d.split("-").map((s) => parseInt(s, 10));
    const dateObj = new Date(Date.UTC(y, m - 1, day));

    if (prevDate) {
      // Check if current date is previous + 1 day
      const diff =
        (dateObj.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        // consecutive
      } else {
        streak = 0; // broken
      }
    }

    if (win) {
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      streak = 0;
    }

    prevDate = dateObj;
  }

  // compute current streak relative to last day in map if it's yesterday or today
  if (dates.length === 0) currentStreak = 0;
  else {
    // Walk backwards from last date
    let i = dates.length - 1;
    let cs = 0;
    let prev: Date | null = null;
    for (; i >= 0; i--) {
      const d = dates[i];
      const win = map[d].win;
      const [y, m, day] = d.split("-").map((s) => parseInt(s, 10));
      const dateObj = new Date(Date.UTC(y, m - 1, day));
      if (prev === null) {
        if (win) cs = 1;
        else cs = 0;
      } else {
        const diff =
          (prev.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1 && win) {
          cs += 1;
        } else break;
      }
      prev = dateObj;
    }
    currentStreak = cs;
  }

  return {
    gamesPlayed,
    wins,
    currentStreak,
    bestStreak,
    bestSolveTimeMs,
    lastSolveTimeMs,
  };
}
