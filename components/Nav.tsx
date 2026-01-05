"use client";
import React, { useState } from "react";

export default function Nav() {
  const [active, setActive] = useState("games");

  return (
    <>
      {/* Top nav: logo, title, optional desktop nav items, avatar and close */}
      <header className="w-full max-w-md mt-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow" style={{ backgroundColor: "#0052FF" }}>
              G
            </div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#0052FF" }}>
                Gridly
              </h1>
              <div className="text-sm text-gray-500 hidden md:block">One puzzle • One try</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop nav items (hidden on small screens) */}
            <nav className="hidden md:flex items-center gap-3 mr-2">
              <button
                onClick={() => setActive("games")}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${active === "games" ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-200"}`}
              >
                Games
              </button>
              <button
                onClick={() => setActive("leaderboard")}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${active === "leaderboard" ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-200"}`}
              >
                Leaderboard
              </button>
                {/* <button
                    onClick={() => setActive("grid")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${active === "cody" ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-200"}`}
                >
                    $GRID
                </button> */}
            </nav>

            {/* Avatar */}
            <button aria-label="Open account" title="Open account" className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-medium text-gray-800 dark:text-gray-100">
              <img src="/og/icon-192.png" alt="avatar" className="w-9 h-9 rounded-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
              <span className="sr-only">Open account</span>
            </button>

            {/* Close / X */}
            <button aria-label="Close" title="Close" onClick={() => window.close?.()} className="p-2 rounded-md text-gray-600 dark:text-gray-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 md:hidden">Try to find today&apos;s tile</p>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed left-0 right-0 bottom-4 flex justify-center md:hidden">
        <div className="w-full max-w-md px-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-3 flex justify-between items-center" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
            <button onClick={() => setActive("games")} className={`flex flex-col items-center gap-1 text-xs ${active === "games" ? "text-white bg-blue-600 rounded-md px-3 py-1" : "text-gray-600 dark:text-gray-300"}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Game</span>
            </button>

            <button onClick={() => setActive("leaderboard")} className={`flex flex-col items-center gap-1 text-xs ${active === "leaderboard" ? "text-white bg-blue-600 rounded-md px-3 py-1" : "text-gray-600 dark:text-gray-300"}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Leaderboard</span>
            </button>

            {/* <button onClick={() => setActive("Grid")} className={`flex flex-col items-center gap-1 text-xs ${active === "Grid" ? "text-white bg-blue-600 rounded-md px-3 py-1" : "text-gray-600 dark:text-gray-300"}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 21c2-4 6-6 7-6s5 2 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>$Grid</span>
            </button> */}
          </div>
        </div>
      </nav>
    </>
  );
}
