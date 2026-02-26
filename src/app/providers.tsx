"use client";

import { ToastProvider } from "@/lib/toast-context";
import { ToastContainer } from "@/components/ui/ToastContainer";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
