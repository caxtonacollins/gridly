"use client";
import React, { useEffect, useState } from "react";
import { getGridSize } from "../lib/puzzle";

/**
 * PuzzleGrid
 * - Renders a 4x4 grid of tappable cells
 * - Only one tap is allowed (one attempt per user per day)
 * - After a tap the result is revealed (success/failure) and the grid is locked
 * - Uses `navigator.vibrate` for lightweight haptic feedback on supported devices
 */
export type PuzzleState = "idle" | "success" | "failure" | "locked";

type Props = {
  solutionIndex: number;
  dateKey: string;
  // initialResult reflects stored result shape; solveTimeMs is optional
  initialResult?: {
    win: boolean;
    choice?: number;
    ts?: number;
    solveTimeMs?: number;
  } | null;
  onComplete: (data: {
    win: boolean;
    choice?: number;
    solveTimeMs?: number;
  }) => void;
};

export default function PuzzleGrid({
  solutionIndex,
  dateKey,
  initialResult = null,
  onComplete,
}: Props) {
  const size = getGridSize();
  const total = size * size;

  const [state, setState] = useState<PuzzleState>(
    initialResult ? (initialResult.win ? "success" : "locked") : "idle"
  );
  const [choice, setChoice] = useState<number | null>(
    initialResult?.choice ?? null
  );

  // Timer for solve time tracking
  const [startTs, setStartTs] = useState<number | null>(null);

  // start timer when grid is shown and puzzle is not already completed
  useEffect(() => {
    if (!initialResult) {
      setStartTs(Date.now());
    } else {
      setStartTs(null);
    }
  }, [initialResult]);

  useEffect(() => {
    if (initialResult) setChoice(initialResult.choice ?? null);
  }, [initialResult]);

  function tryVibrate() {
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        // short haptic on supported devices
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        navigator.vibrate(12);
      }
    } catch (e) {
      // ignore
    }
  }

  function handleTap(i: number) {
    if (state === "locked" || state === "success" || choice !== null) return;
    tryVibrate();
    const win = i === solutionIndex;
    setChoice(i);
    setState(win ? "success" : "failure");
    // lock further interaction
    setTimeout(() => setState("locked"), 250);

    // stop timer and compute duration (ms)
    const now = Date.now();
    const duration = startTs ? Math.max(0, now - startTs) : undefined;

    onComplete({ win, choice: i, solveTimeMs: duration });
  }

  function cellClass(i: number) {
    const base =
      "w-full aspect-square flex items-center justify-center rounded-lg text-sm font-medium border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0052FF] focus-visible:ring-offset-2";
    if (choice === null)
      return `${base} bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800`;

    if (i === solutionIndex) {
      return `${base} bg-[#22C55E] border-[#16a34a] text-white`; // accent green
    }
    if (i === choice && !(choice === solutionIndex)) {
      return `${base} bg-[#ff4d4f] border-[#a61e1e] text-white`; // red for incorrect choice
    }
    return `${base} bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800`;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="grid grid-cols-4 gap-3 justify-center"
        role="grid"
        aria-label="Puzzle grid"
      >
        {Array.from({ length: total }).map((_, i) => (
          <button
            role="gridcell"
            key={i}
            aria-label={`cell ${i + 1}`}
            onClick={() => handleTap(i)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === " " ||
                e.key === "Spacebar" ||
                e.code === "Space"
              ) {
                e.preventDefault();
                handleTap(i);
              }
            }}
            className={cellClass(i)}
            disabled={state === "locked" || state === "success" || choice !== null}
            aria-disabled={state === "locked" || state === "success" || choice !== null ? "true" : "false"}
            aria-pressed={choice === i ? "true" : "false"}
          >
            {/* Keep cells minimal and rounded */}
          </button>
        ))}
      </div>
      <div className="mt-4 text-center" role="status" aria-live="polite">
        {state === "idle" && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Tap a cell to guess today's tile.
          </p>
        )}
        {state === "success" && (
          <p className="text-sm text-[#0052FF]">
            Nice! You found today's tile.
          </p>
        )}
        {state === "failure" && (
          <p className="text-sm text-red-600">
            Not quite — the correct tile is highlighted in green.
          </p>
        )}
        {state === "locked" && choice === null && (
          <p className="text-sm text-gray-600">
            This puzzle is locked for today.
          </p>
        )}
      </div>
    </div>
  );
}
