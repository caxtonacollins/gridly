"use client";

import { SafeArea, useQuickAuth } from "@coinbase/onchainkit/minikit";
import { ReactNode } from "react";

interface LayoutContentProps {
  children: ReactNode;
}

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number;
    issuedAt?: number;
    expiresAt?: number;
  };
  message?: string;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  useQuickAuth<AuthResponse>("/api/auth", { method: "GET" });
  
  return <SafeArea>{children}</SafeArea>;
}
