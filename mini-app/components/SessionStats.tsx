"use client";
import React from "react";

export type SessionState = {
  rounds: number;
  wins: number;
  currentStreak: number;
  bestStreak: number;
  bestSolveTimeMs: number | null;
};

function fmt(ms: number | null) {
  if (ms == null) return "-";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

export default function SessionStats({ state }: { state: SessionState }) {
  return (
    <div className="w-full max-w-md mx-auto mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="text-xs text-gray-500 mb-2">Session Stats</div>
      <div className="grid grid-cols-2 sm:grid-cols-5 text-center gap-2">
        <div>
          <div className="text-xs text-gray-500">Rounds</div>
          <div className="mt-1 font-semibold text-lg">{state.rounds}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Wins</div>
          <div className="mt-1 font-semibold text-lg">{state.wins}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Streak</div>
          <div className="mt-1 font-semibold text-lg">{state.currentStreak}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Best</div>
          <div className="mt-1 font-semibold text-lg">{state.bestStreak}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Best time</div>
          <div className="mt-1 font-semibold text-lg">{fmt(state.bestSolveTimeMs)}</div>
        </div>
      </div>
    </div>
  );
}
