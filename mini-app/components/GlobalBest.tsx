"use client";
import React from "react";
import { useReadContract } from "wagmi";
import { GRIDLY_LEADERBOARD_ADDRESS, leaderboardAbi } from "../lib/onchain";

function fmtMs(ms?: number | null) {
  if (ms == null || ms <= 0) return "-";
  const seconds = Math.round(ms / 100) / 10; // one decimal
  return `${seconds.toFixed(1)}s`;
}

export default function GlobalBest({ roundId }: { roundId: number }) {
  const enabled = Boolean(GRIDLY_LEADERBOARD_ADDRESS);

  const { data } = useReadContract({
    address: GRIDLY_LEADERBOARD_ADDRESS || undefined,
    abi: leaderboardAbi,
    functionName: "bestForRound",
    args: [BigInt(roundId)],
    query: { enabled, refetchInterval: 5000 },
  });

  // data may be an array [player, bestTimeMs] or an object with named outputs
  let bestTimeMs: number | null = null;
  if (data) {
    const dt: any = data;
    if (typeof dt?.bestTimeMs !== "undefined") {
      bestTimeMs = Number(dt.bestTimeMs);
    } else if (Array.isArray(dt) && dt.length > 1) {
      bestTimeMs = Number(dt[1]);
    }
  }

  return (
    <div className="mt-2 text-center text-xs text-gray-600 dark:text-gray-300">
      Global Best: <span className="font-semibold">{fmtMs(bestTimeMs)}</span>
    </div>
  );
}
