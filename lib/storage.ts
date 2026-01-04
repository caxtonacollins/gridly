// lib/storage.ts
// Simple localStorage helpers for Gridly MVP
// Data model:
// localStorage["gridly:results"] = JSON.stringify({ [dateKey]: { win: boolean, ts: number, choice?: number } })

const STORAGE_KEY = "gridly:results";

type Result = { win: boolean; ts: number; choice?: number };

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

  for (const d of dates) {
    const win = map[d].win;
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
  };
}
