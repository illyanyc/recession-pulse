"use client";

import { useState, useRef, useCallback, useEffect, type PointerEvent as ReactPointerEvent } from "react";
import { X, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast, type ToastType } from "@/lib/toast-context";

const ICON: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: AlertCircle,
  loading: Loader2,
};

const STYLE: Record<ToastType, string> = {
  success: "bg-pulse-green/10 text-pulse-green border-pulse-green/20",
  error: "bg-pulse-red/10 text-pulse-red border-pulse-red/20",
  info: "bg-pulse-card/80 text-pulse-text border-pulse-border/50",
  loading: "bg-pulse-card/80 text-pulse-muted border-pulse-border/50",
};

const STORAGE_POS_KEY = "rp_toast_position";

function loadSavedPosition(): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_POS_KEY);
    if (!raw) return null;
    const pos = JSON.parse(raw);
    if (typeof pos.x === "number" && typeof pos.y === "number") return pos;
  } catch { /* ignore */ }
  return null;
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [customPos, setCustomPos] = useState(false);

  useEffect(() => {
    const saved = loadSavedPosition();
    if (saved) {
      setPosition(saved);
      setCustomPos(true);
    }
  }, []);

  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragging.current = true;
    hasMoved.current = false;
    const rect = containerRef.current!.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    containerRef.current!.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    hasMoved.current = true;
    const x = Math.max(0, Math.min(window.innerWidth - 320, e.clientX - dragOffset.current.x));
    const y = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y));
    setPosition({ x, y });
    setCustomPos(true);
  }, []);

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    containerRef.current?.releasePointerCapture(e.pointerId);
    if (hasMoved.current && position) {
      localStorage.setItem(STORAGE_POS_KEY, JSON.stringify(position));
    }
  }, [position]);

  if (toasts.length === 0) return null;

  const positionStyle = customPos && position
    ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
    : {};

  return (
    <div
      ref={containerRef}
      className={`fixed z-[9999] flex flex-col gap-2 w-[min(380px,calc(100vw-2rem))] select-none ${
        customPos ? "" : "bottom-6 right-6"
      }`}
      style={positionStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {toasts.map((toast) => {
        const Icon = ICON[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg cursor-grab active:cursor-grabbing animate-toast-in ${STYLE[toast.type]}`}
          >
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${toast.type === "loading" ? "animate-spin" : ""}`} />
            <span className="text-sm flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}

      {customPos && toasts.length > 0 && (
        <button
          onClick={() => {
            setCustomPos(false);
            setPosition(null);
            localStorage.removeItem(STORAGE_POS_KEY);
          }}
          className="self-end text-[10px] text-pulse-muted hover:text-white transition-colors px-2 py-0.5"
        >
          Reset position
        </button>
      )}
    </div>
  );
}
