"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isLeaderboard = pathname?.startsWith("/leaderboard");

  return (
    <>
      {/* Top nav: logo, title, optional desktop nav items, avatar and close */}
      <header className="w-full max-w-md mt-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="logo" className="w-12 h-12 rounded-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
            {/* <div>
              <h1 className="text-xl font-semibold" style={{ color: "#0052FF" }}>
                Gridly
              </h1>
            </div> */}
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop nav items (hidden on small screens) */}
            <nav className="hidden md:flex items-center gap-3 mr-2">
              <Link
                href="/"
                className={`px-3 py-2 text-sm font-medium relative group ${isHome ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"}`}
              >
                Games
                <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4/5 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-200 ${isHome ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></span>
              </Link>
              <Link
                href="/leaderboard"
                className={`px-3 py-2 text-sm font-medium relative group ${isLeaderboard ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"}`}
              >
                Leaderboard
                <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4/5 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-200 ${isLeaderboard ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></span>
              </Link>
            </nav>

            {/* Avatar */}
            <button aria-label="Open account" title="Open account" className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-medium text-gray-800 dark:text-gray-100">
              <img src="/og/default.png" alt="avatar" className="w-9 h-9 rounded-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
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
      <nav className="fixed left-0 right-0 bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-3 px-4 md:hidden">
        <div className="flex justify-center items-center gap-6">
          <Link href="/" className={`flex flex-col items-center relative group px-3 py-1 ${isHome ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1">
              <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-medium">Game</span>
            <span className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-4/5 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-200 ${isHome ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></span>
          </Link>

          <Link href="/leaderboard" className={`flex flex-col items-center relative group px-3 py-1 ${isLeaderboard ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1">
              <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 3v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-medium">Leaderboard</span>
            <span className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-4/5 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-200 ${isLeaderboard ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></span>
          </Link>

          {/* Add more navigation items here - they will be automatically centered */}
        </div>
      </nav>
    </>
  );
}
