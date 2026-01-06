"use client";
import React, { useEffect, useState } from "react";
import { getOverrideDate, setOverrideDate } from "../lib/storage";

export default function DevControls() {
  const isDev = process.env.NODE_ENV !== "production";
  const [override, setOverride] = useState<string | null>(null);

  useEffect(() => {
    setOverride(getOverrideDate());
  }, []);

  if (!isDev) return null;

  function advanceDay() {
    const base = override ? new Date(override + "T00:00:00Z") : new Date();
    const next = new Date(
      Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + 1)
    );
    const s = `${next.getUTCFullYear()}-${String(
      next.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
    setOverrideDate(s);
    setOverride(s);
    // notify other parts of the app
    window.dispatchEvent(new Event("gridly:override:changed"));
  }

  function clearOverride() {
    setOverrideDate(null);
    setOverride(null);
    window.dispatchEvent(new Event("gridly:override:changed"));
  }

  return (
    <div className="mt-4 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="text-xs text-gray-500">Dev Controls</div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={advanceDay}
          aria-label="Advance override by one day"
          className="py-2 px-3 rounded bg-[#0052FF] text-white text-sm focus-visible:ring-2 focus-visible:ring-[#0052FF] focus-visible:ring-offset-2 focus:outline-none"
        >
          Advance +1 day
        </button>
        <button
          onClick={clearOverride}
          aria-label="Clear override"
          className="py-2 px-3 rounded border text-sm focus-visible:ring-2 focus-visible:ring-[#0052FF] focus-visible:ring-offset-2 focus:outline-none"
        >
          Clear
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Override: {override ?? "(none)"}
      </div>
    </div>
  );
}
