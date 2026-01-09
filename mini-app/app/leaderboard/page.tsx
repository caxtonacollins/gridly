"use client";
import React, { useMemo } from "react";
import Nav from "../../components/Nav";
import LocalStats from "../../components/LocalStats";
import { getDailyRoundId } from "../../lib/puzzle";
import { loadResults } from "../../lib/storage";
import { GRIDLY_LEADERBOARD_ADDRESS, leaderboardAbi } from "../../lib/onchain";
import { useReadContract } from "wagmi";

function fmtDate(dk: string) {
  return dk;
}

function fmtMs(ms?: number | null) {
  if (ms == null) return "-";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

function shortAddr(a?: string) {
  if (!a || a === "0x0000000000000000000000000000000000000000") return "-";
  return a.slice(0, 6) + "…" + a.slice(-4);
}

export default function LeaderboardPage() {
  const dailyRoundId = useMemo(() => getDailyRoundId(new Date()), []);
  const enabled = Boolean(GRIDLY_LEADERBOARD_ADDRESS);
  const { data } = useReadContract({
    address: GRIDLY_LEADERBOARD_ADDRESS || undefined,
    abi: leaderboardAbi,
    functionName: "bestForRound",
    args: [BigInt(dailyRoundId)],
    query: { enabled },
  });

  let bestPlayer: string | undefined;
  let bestTimeMs: number | null = null;
  if (data) {
    const dt: any = data;
    if (typeof dt?.bestTimeMs !== "undefined") {
      bestPlayer = dt.player as string;
      bestTimeMs = Number(dt.bestTimeMs);
    } else if (Array.isArray(dt) && dt.length > 1) {
      bestPlayer = dt[0] as string;
      bestTimeMs = Number(dt[1]);
    }
  }

  const results = loadResults();
  const rows = Object.entries(results)
    .sort(([a], [b]) => (a < b ? 1 : -1)) // newest first
    .map(([dk, r]) => ({ dk, win: r.win, solve: r.solveTimeMs ?? null }));

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Nav />
      <main className="w-full max-w-md mt-6">
        <h1 className="text-xl font-semibold" style={{ color: "#0052FF" }}>Leaderboard</h1>

        {/* Global Best for today's daily round */}
        <div className="mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="text-sm text-gray-600 dark:text-gray-300">Today's Global Best</div>
          <div className="mt-1 flex items-center justify-between">
            <div className="text-lg font-semibold">{bestTimeMs && bestTimeMs > 0 ? `${(Math.round(bestTimeMs / 100) / 10).toFixed(1)}s` : "-"}</div>
            <div className="text-sm text-gray-500">{shortAddr(bestPlayer)}</div>
          </div>
          {!enabled && (
            <div className="mt-2 text-xs text-gray-500">Set NEXT_PUBLIC_GRIDLY_LEADERBOARD_ADDRESS to enable onchain leaderboard.</div>
          )}
        </div>

        {/* Local Stats summary */}
        <LocalStats />

        {/* Daily history table */}
        <div className="w-full max-w-md mx-auto mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="text-xs text-gray-500 mb-2">Daily History</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">Date</th>
                  <th className="py-2">Result</th>
                  <th className="py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-3 text-gray-500 text-center">No games yet</td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.dk} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="py-2 font-mono">{fmtDate(r.dk)}</td>
                    <td className="py-2">{r.win ? <span className="text-[#22C55E] font-medium">Win</span> : <span className="text-red-600 font-medium">Loss</span>}</td>
                    <td className="py-2">{fmtMs(r.solve)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="mt-6 text-xs text-gray-500 text-center">Built for Base Mini Apps • No wallets, no tokens</footer>
      </main>
    </div>
  );
}
