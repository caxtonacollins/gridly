"use client";
import React, { useEffect, useMemo, useState } from "react";
import PuzzleGrid from "./PuzzleGrid";
import SessionStats, { SessionState } from "./SessionStats";
import GlobalBest from "./GlobalBest";
import SubmitScore from "./SubmitScore";
import { getRoundModeRoundId, getSolutionIndexForRound } from "../lib/puzzle";
import { maybeUpdateBestRoundStreak, updateTotalsAfterRound } from "../lib/leaderboard";

export default function RoundMode() {
  const [roundNumber, setRoundNumber] = useState(1);
  const [session, setSession] = useState<SessionState>({
    rounds: 0,
    wins: 0,
    currentStreak: 0,
    bestStreak: 0,
    bestSolveTimeMs: null,
  });
  const [lastWin, setLastWin] = useState<{ roundId: number; timeMs: number } | null>(null);

  const roundId = useMemo(() => getRoundModeRoundId(roundNumber), [roundNumber]);
  const solutionIndex = useMemo(() => getSolutionIndexForRound(roundId), [roundId]);

  const [latestResult, setLatestResult] = useState<{ win: boolean; solveTimeMs?: number; bestStreak: number } | null>(null);

  useEffect(() => {
    if (latestResult) {
      updateTotalsAfterRound(latestResult.win, latestResult.solveTimeMs);
      maybeUpdateBestRoundStreak(latestResult.bestStreak);
      setLatestResult(null); // Reset after processing
    }
  }, [latestResult]);

  // advance to next round quickly after each decision
  function handleComplete(res: { win: boolean; choice?: number; solveTimeMs?: number }) {
    setSession((prev) => {
      const rounds = prev.rounds + 1;
      const wins = prev.wins + (res.win ? 1 : 0);
      const currentStreak = res.win ? prev.currentStreak + 1 : 0;
      const bestStreak = Math.max(prev.bestStreak, currentStreak);
      const bestSolveTimeMs =
        res.win && typeof res.solveTimeMs === "number"
          ? prev.bestSolveTimeMs == null
            ? res.solveTimeMs
            : Math.min(prev.bestSolveTimeMs, res.solveTimeMs)
          : prev.bestSolveTimeMs;
          
      // Schedule the leaderboard updates for the next render
      setLatestResult({ win: res.win, solveTimeMs: res.solveTimeMs, bestStreak });
      
      return { rounds, wins, currentStreak, bestStreak, bestSolveTimeMs };
    });

    if (res.win && typeof res.solveTimeMs === "number") {
      setLastWin({ roundId, timeMs: res.solveTimeMs });
    }

    // Auto-advance after the result is visible long enough
    setTimeout(() => setRoundNumber((n) => n + 1), 1100);
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600 dark:text-gray-300">Round</div>
        <div className="font-semibold">#{roundNumber}</div>
      </div>

      <div className="transition-opacity duration-200">
        <PuzzleGrid
          key={roundNumber}
          solutionIndex={solutionIndex}
          dateKey={`round:${roundId}`}
          initialResult={null}
          onComplete={handleComplete}
        />
      </div>

      <GlobalBest roundId={roundId} />

      {lastWin && (
        <div className="mt-2 flex gap-2 items-center">
          <SubmitScore roundId={lastWin.roundId} timeMs={lastWin.timeMs} />
          <button
            onClick={() => setLastWin(null)}
            className="py-2 px-3 rounded-lg text-sm font-medium border focus-visible:ring-2 focus-visible:ring-[#0052FF] focus-visible:ring-offset-2 focus:outline-none"
            style={{ borderColor: "#e5e7eb" }}
            aria-label="Dismiss submit"
          >
            Dismiss
          </button>
        </div>
      )}

      <SessionStats state={session} />
    </div>
  );
}
