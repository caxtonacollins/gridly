"use client";
import React, { useEffect, useState } from "react";

function formatMs(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}

export default function Countdown() {
  // Computes time until next UTC midnight and updates every second
  const getNextMidnight = () => {
    const now = new Date();
    const next = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    );
    return next;
  };

  const [nextMidnight, setNextMidnight] = useState<Date>(() =>
    getNextMidnight()
  );
  const [remainingMs, setRemainingMs] = useState<number>(() =>
    Math.max(0, nextMidnight.getTime() - Date.now())
  );

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const rem = Math.max(0, nextMidnight.getTime() - now);
      setRemainingMs(rem);
      if (rem <= 0) {
        // Reset to the following midnight
        setNextMidnight(getNextMidnight());
        setRemainingMs(Math.max(0, getNextMidnight().getTime() - Date.now()));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [nextMidnight]);

  return (
    <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-300">
      Next puzzle in{" "}
      <span className="font-mono font-semibold">{formatMs(remainingMs)}</span>
    </div>
  );
}
