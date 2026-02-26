"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type ToastType = "success" | "error" | "info" | "loading";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  autoDismiss?: boolean;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, opts?: { autoDismiss?: boolean; duration?: number }) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const STORAGE_KEY = "rp_notifications_enabled";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "false") setNotificationsEnabledState(false);
  }, []);

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
    if (!enabled) setToasts([]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, opts?: { autoDismiss?: boolean; duration?: number }) => {
      if (!notificationsEnabled && type !== "loading") return "";

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const autoDismiss = opts?.autoDismiss ?? type !== "loading";
      const duration = opts?.duration ?? (type === "error" ? 6000 : 4000);

      setToasts((prev) => [...prev.slice(-4), { id, type, message, autoDismiss, duration }]);

      if (autoDismiss) {
        setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [notificationsEnabled, removeToast]
  );

  const clearAll = useCallback(() => setToasts([]), []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll, notificationsEnabled, setNotificationsEnabled }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
