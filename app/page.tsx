"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import PuzzleGrid from "../components/PuzzleGrid";
import Stats from "../components/Stats";
import { getDateKey, getSolutionIndexForDate } from "../lib/puzzle";
import { getResultForDate, setResultForDate } from "../lib/storage";

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  const todayKey = useMemo(() => getDateKey(new Date()), []);
  const solutionIndex = useMemo(() => getSolutionIndexForDate(new Date()), []);

  const [initialResult, setInitialResult] = useState(
    getResultForDate(todayKey)
  );
  const [justShared, setJustShared] = useState(false);
  const [copied, setCopied] = useState(false);

  function onComplete(res: { win: boolean; choice?: number }) {
    const now = Date.now();
    setResultForDate(todayKey, { win: res.win, ts: now, choice: res.choice });
    // include timestamp so local state matches storage shape
    setInitialResult({ win: res.win, choice: res.choice, ts: now });
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

  async function shareResult() {
    if (!initialResult) return;
    const emojiGrid = buildEmojiGrid(
      solutionIndex,
      initialResult.choice ?? null
    );
    const title = `Gridly — ${todayKey} — ${initialResult.win ? "1/1" : "0/1"}`;
    const text = `${title}\n\n${emojiGrid}`;

    // Try Web Share API first
    try {
      if (navigator.share) {
        await navigator.share({ title, text });
        setJustShared(true);
        return;
      }
    } catch (e) {
      // ignore
    }

    // Try Farcaster intent (protocol); if the protocol is not handled, it will simply do nothing
    try {
      const url = `farcaster://post?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
      setJustShared(true);
      return;
    } catch (e) {
      // ignore
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="w-full max-w-md mt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold" style={{ color: "#0052FF" }}>
            Gridly
          </h1>
          <div className="text-sm text-gray-500">One puzzle • One try</div>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Try to find today's tile. Good luck—no sign-in required.
        </p>
      </header>

      <main className="w-full max-w-md mt-6">
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
                className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: "#0052FF", color: "white" }}
              >
                Share
              </button>
              <a
                href={`/api/og?date=${todayKey}&result=${
                  initialResult.win ? "win" : "loss"
                }`}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-center border"
                style={{ borderColor: "#e5e7eb" }}
              >
                Preview
              </a>
            </div>
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
