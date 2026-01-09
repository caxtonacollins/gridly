"use client";
import React, { useMemo, useState } from "react";
import { useAccount, useConnect, useWriteContract } from "wagmi";
import { GRIDLY_LEADERBOARD_ADDRESS, leaderboardAbi } from "../lib/onchain";

export default function SubmitScore({
  roundId,
  timeMs,
}: {
  roundId: number;
  timeMs?: number;
}) {
  const address = GRIDLY_LEADERBOARD_ADDRESS;
  const { isConnected } = useAccount();
  const { connect, connectors, error: connectError, isPending: isConnecting } = useConnect();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!address) return false;
    if (!timeMs || timeMs <= 0) return false;
    return true;
  }, [address, timeMs]);

  if (!address || !canSubmit) return null; // onchain leaderboard optional

  async function onConnect() {
    setErr(null);
    try {
      const first = connectors?.[0];
      if (!first) throw new Error("No wallet connector available");
      await connect({ connector: first });
    } catch (e: any) {
      setErr(e?.message || "Failed to connect");
    }
  }

  async function onSubmit() {
    if (!isConnected || !address || !timeMs) return;
    setErr(null);
    try {
      const tx = await writeContractAsync({
        address,
        abi: leaderboardAbi,
        functionName: "submitScore",
        args: [BigInt(roundId), Number(Math.min(600000, Math.max(50, timeMs)))],
      });
      // we keep UX snappy: don't wait for confirmations
      setDone(true);
    } catch (e: any) {
      setErr(e?.shortMessage || e?.message || "Failed to submit");
    }
  }

  if (!isConnected) {
    return (
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="flex-1 py-2 rounded-lg text-sm font-medium border focus-visible:ring-2 focus-visible:ring-[#0052FF] focus-visible:ring-offset-2 focus:outline-none"
        style={{ borderColor: "#e5e7eb" }}
        aria-label="Connect wallet to submit score"
        title="Connect wallet to submit score"
      >
        {isConnecting ? "Connecting..." : "Connect wallet to submit"}
      </button>
    );
  }

  return (
    <div className="flex-1">
      <button
        onClick={onSubmit}
        disabled={isWriting || done}
        className="w-full py-2 rounded-lg text-sm font-medium focus-visible:ring-2 focus-visible:ring-[#0052FF] focus-visible:ring-offset-2 focus:outline-none"
        style={{ backgroundColor: done ? "#22C55E" : "#0052FF", color: "white" }}
        aria-label="Submit score onchain"
        title="Submit score onchain"
      >
        {done ? "Submitted" : isWriting ? "Submitting..." : "Submit Score (Optional)"}
      </button>
      {err && (
        <div className="mt-1 text-xs text-red-600" role="alert">
          {err}
        </div>
      )}
    </div>
  );
}
