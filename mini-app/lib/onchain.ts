// lib/onchain.ts
import { base, baseSepolia } from "wagmi/chains";
import type { Abi } from "viem";

export const GRIDLY_LEADERBOARD_ADDRESS = (process.env
  .NEXT_PUBLIC_GRIDLY_LEADERBOARD_ADDRESS || "") as `0x${string}` | "";

export function getSelectedChain() {
  const useSepolia = process.env.NEXT_PUBLIC_USE_TESTNET === "1";
  const envId = process.env.NEXT_PUBLIC_CHAIN_ID?.trim();
  if (envId === String(baseSepolia.id) || useSepolia) return baseSepolia;
  return base;
}

// Minimal ABI for GridlyLeaderboard
export const leaderboardAbi = [
  {
    type: "function",
    name: "bestForRound",
    stateMutability: "view",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: [
      { name: "player", type: "address" },
      { name: "bestTimeMs", type: "uint32" },
    ],
  },
  {
    type: "function",
    name: "submitScore",
    stateMutability: "nonpayable",
    inputs: [
      { name: "roundId", type: "uint256" },
      { name: "timeMs", type: "uint32" },
    ],
    outputs: [],
  },
] as const satisfies Abi;
