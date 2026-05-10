"use client";

import type { ReactNode } from "react";
import { SocketProvider } from "@/components/SocketProvider";

export function Providers({ children }: { children: ReactNode }) {
  return <SocketProvider>{children}</SocketProvider>;
}
