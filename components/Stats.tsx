"use client";
import React, { useEffect, useState } from "react";
import { computeStats } from "../lib/storage";

/**
 * Stats
 * - Local-only statistics computed from saved results in localStorage
 * - Shows games played, wins, current streak, and best streak
 * - Listens to `storage` events so stats update when other tabs modify results
 */
export default function Stats() {
  const [stats, setStats] = useState<{
    gamesPlayed: number;
    wins: number;
    currentStreak: number;
    bestStreak: number;
    bestSolveTimeMs?: number | null;
    lastSolveTimeMs?: number | null;
  }>({
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    bestStreak: 0,
    bestSolveTimeMs: null,
    lastSolveTimeMs: null,
  });

  useEffect(() => {
    setStats(computeStats());
    const onStorage = () => setStats(computeStats());
    window.addEventListener("storage", onStorage);
    window.addEventListener("gridly:override:changed", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("gridly:override:changed", onStorage);
    };
  }, []);

  function fmt(ms?: number | null) {
    if (ms == null) return "-";
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}m ${r}s`;
  }

  return (
    <div className="w-full max-w-md mx-auto mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="grid grid-cols-2 sm:grid-cols-4 text-center gap-2">
        <div>
          <div className="text-xs text-gray-500">Played</div>
          <div className="mt-1 font-semibold text-lg" aria-label="games played">
            {stats.gamesPlayed}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Wins</div>
          <div className="mt-1 font-semibold text-lg" aria-label="wins">
            {stats.wins}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Streak</div>
          <div
            className="mt-1 font-semibold text-lg"
            aria-label="current streak"
          >
            {stats.currentStreak}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Best</div>
          <div className="mt-1 font-semibold text-lg" aria-label="best streak">
            {stats.bestStreak}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-xs text-gray-500">Last</div>
          <div
            className="mt-1 font-semibold text-lg"
            aria-label="last solve time"
          >
            {fmt(stats.lastSolveTimeMs)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Best time</div>
          <div
            className="mt-1 font-semibold text-lg"
            aria-label="best solve time"
          >
            {fmt(stats.bestSolveTimeMs)}
          </div>
        </div>
      </div>
    </div>
  );
}
