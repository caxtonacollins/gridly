"use client";
import React, { useEffect, useState } from "react";
import { computeStats } from "../lib/storage";
import { loadLocalTotals } from "../lib/leaderboard";

function fmt(ms?: number | null) {
  if (ms == null) return "-";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

export default function LocalStats() {
  const [view, setView] = useState({
    totalRounds: 0,
    totalWins: 0,
    bestSolveTimeMs: null as number | null,
    bestStreak: 0,
  });

  const compute = () => {
    const daily = computeStats();
    const totals = loadLocalTotals();
    const bestSolve = (() => {
      const a = daily.bestSolveTimeMs ?? null;
      const b = totals.bestSolveTimeMs ?? null;
      if (a == null) return b;
      if (b == null) return a;
      return Math.min(a, b);
    })();
    const bestStreak = Math.max(daily.bestStreak, totals.bestRoundStreak);
    const totalWins = totals.totalWins;
    setView({
      totalRounds: totals.totalRounds,
      totalWins,
      bestSolveTimeMs: bestSolve,
      bestStreak,
    });
  };

  useEffect(() => {
    compute();
    const onChange = () => compute();
    window.addEventListener("storage", onChange);
    window.addEventListener("gridly:leaderboard:changed", onChange);
    window.addEventListener("gridly:override:changed", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("gridly:leaderboard:changed", onChange);
      window.removeEventListener("gridly:override:changed", onChange);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="text-xs text-gray-500 mb-2">Local Stats</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 text-center gap-2">
        <div>
          <div className="text-xs text-gray-500">Rounds</div>
          <div className="mt-1 font-semibold text-lg">{view.totalRounds}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Wins</div>
          <div className="mt-1 font-semibold text-lg">{view.totalWins}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Best streak</div>
          <div className="mt-1 font-semibold text-lg">{view.bestStreak}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Best time</div>
          <div className="mt-1 font-semibold text-lg">{fmt(view.bestSolveTimeMs)}</div>
        </div>
      </div>
    </div>
  );
}
