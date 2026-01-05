"use client";
import React, { useEffect, useState } from "react";
import { useQuickAuth, useMiniKit } from "@coinbase/onchainkit/minikit";
import PuzzleGrid from "../components/PuzzleGrid";
import Stats from "../components/Stats";
import Countdown from "../components/Countdown";
import DevControls from "../components/DevControls";
import Nav from "../components/Nav";
import {
  getDateKey,
  getSolutionIndexForDate,
  parseDateKey,
} from "../lib/puzzle";
import {
  getResultForDate,
  setResultForDate,
  getOverrideDate,
  computeStats,
} from "../lib/storage";

export default function Home() {
  const { isMiniAppReady, setMiniAppReady } = useMiniKit();
  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [isMiniAppReady]);

  // effective date can be overridden in dev mode via localStorage
  const [overrideKey, setOverrideKey] = useState<string | null>(() =>
    getOverrideDate()
  );
  const [todayKey, setTodayKey] = useState<string>(
    () => overrideKey ?? getDateKey(new Date())
  );
  const [solutionIndex, setSolutionIndex] = useState<number>(() =>
    overrideKey
      ? getSolutionIndexForDate(parseDateKey(overrideKey))
      : getSolutionIndexForDate(new Date())
  );

  const [initialResult, setInitialResult] = useState(
    getResultForDate(todayKey)
  );
  const [justShared, setJustShared] = useState(false);
  const [copied, setCopied] = useState(false);

  function onComplete(res: {
    win: boolean;
    choice?: number;
    solveTimeMs?: number;
  }) {
    const now = Date.now();
    setResultForDate(todayKey, {
      win: res.win,
      ts: now,
      choice: res.choice,
      solveTimeMs: res.solveTimeMs,
    });
    // include timestamp / solve time so local state matches storage shape
    setInitialResult({
      win: res.win,
      choice: res.choice,
      ts: now,
      solveTimeMs: res.solveTimeMs,
    });
    // Storage triggers Stats updates elsewhere via `storage` event or computeStats on mount
  }

  function buildEmojiGrid(solIndex: number, userChoice?: number | null) {
    const size = 4;
    let out = "";
    for (let r = 0; r < size; r++) {
      const row = [] as string[];
      for (let c = 0; c < size; c++) {
        const idx = r * size + c;
        if (idx === solIndex) row.push("🟩");
        else if (userChoice != null && idx === userChoice) row.push("🟥");
        else row.push("⬜");
      }
      out += row.join("") + "\n";
    }
    return out.trim();
  }

  function formatTimeMs(ms?: number | null) {
    if (ms == null) return "-";
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}m ${r}s`;
  }

  async function shareResult() {
    if (!initialResult) return;
    const emojiGrid = buildEmojiGrid(
      solutionIndex,
      initialResult.choice ?? null
    );
    const title = `Gridly — ${todayKey} — ${initialResult.win ? "1/1" : "0/1"}`;

    // include solve time and streak in share text
    const stats = computeStats();
    const streakPart = `Streak: ${stats.currentStreak}`;
    const timePart = initialResult.win
      ? `Solve: ${formatTimeMs(initialResult.solveTimeMs ?? null)}`
      : null;

    const textParts = [title, timePart, streakPart, "", emojiGrid].filter(
      Boolean
    );
    const text = textParts.join("\n");

    // Try Web Share API first
    try {
      if (navigator.share) {
        await navigator.share({ title, text });
        setJustShared(true);
        return;
      }
    } catch {
      // ignore
    }

    // Try Farcaster intent (protocol); if the protocol is not handled, it will simply do nothing
    try {
      const url = `farcaster://post?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
      setJustShared(true);
      return;
    } catch {
      // ignore
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    function onOverrideChange() {
      const o = getOverrideDate();
      setOverrideKey(o);
      const key = o ?? getDateKey(new Date());
      setTodayKey(key);
      setSolutionIndex(
        o
          ? getSolutionIndexForDate(parseDateKey(o))
          : getSolutionIndexForDate(new Date())
      );
      setInitialResult(getResultForDate(key));
    }
    window.addEventListener("gridly:override:changed", onOverrideChange);
    window.addEventListener("storage", onOverrideChange);
    return () => {
      window.removeEventListener("gridly:override:changed", onOverrideChange);
      window.removeEventListener("storage", onOverrideChange);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Nav />

      <main className="w-full max-w-md mt-6">
        <DevControls />
        <PuzzleGrid
          solutionIndex={solutionIndex}
          dateKey={todayKey}
          initialResult={initialResult}
          onComplete={onComplete}
        />

        {initialResult && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                onClick={shareResult}
                aria-label="Share result"
                title="Share result"
                className="flex-1 py-2 rounded-lg text-sm font-medium focus-visible:ring-2 focus-visible:ring-[#0052FF] focus-visible:ring-offset-2 focus:outline-none"
                style={{ backgroundColor: "#0052FF", color: "white" }}
              >
                Share
              </button>
              <a
                href={`/api/og?date=${todayKey}&result=${
                  initialResult.win ? "win" : "loss"
                }`}
                aria-label="Preview share image"
                title="Preview share image"
                className="flex-1 py-2 rounded-lg text-sm font-medium text-center border focus-visible:ring-2 focus-visible:ring-[#0052FF] focus-visible:ring-offset-2 focus:outline-none"
                style={{ borderColor: "#e5e7eb" }}
              >
                Preview
              </a>
            </div>

            <Countdown />

            {copied && (
              <div className="text-xs text-gray-500">
                Result copied to clipboard
              </div>
            )}
            {justShared && (
              <div className="text-xs text-gray-500">Opened share intent</div>
            )}
            <Stats />
          </div>
        )}

        {!initialResult && (
          <div className="mt-4">
            <Stats />
          </div>
        )}

        <footer className="mt-6 text-xs text-gray-500 text-center">
          Built for Base Mini Apps • No wallets, no tokens
        </footer>
      </main>
    </div>
  );
}
