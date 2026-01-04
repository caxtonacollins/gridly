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
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    bestStreak: 0,
  });

  useEffect(() => {
    setStats(computeStats());
    const onStorage = () => setStats(computeStats());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="grid grid-cols-4 text-center gap-2">
        <div>
          <div className="text-xs text-gray-500">Played</div>
          <div className="mt-1 font-semibold text-lg">{stats.gamesPlayed}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Wins</div>
          <div className="mt-1 font-semibold text-lg">{stats.wins}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Streak</div>
          <div className="mt-1 font-semibold text-lg">
            {stats.currentStreak}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Best</div>
          <div className="mt-1 font-semibold text-lg">{stats.bestStreak}</div>
        </div>
      </div>
    </div>
  );
}
