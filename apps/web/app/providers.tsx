"use client";

import { useEffect, type ReactNode } from "react";
import { useSocketStore } from "../store/socket";

export function Providers({ children }: { children: ReactNode }) {
  const connect = useSocketStore((state) => state.connect);

  useEffect(() => {
    connect();
  }, [connect]);

  return <>{children}</>;
}
