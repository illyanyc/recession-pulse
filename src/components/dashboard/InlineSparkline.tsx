"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { IndicatorStatus } from "@/types";

const STATUS_COLORS: Record<IndicatorStatus, string> = {
  safe: "#00CC66",
  watch: "#F2C94C",
  warning: "#F0913A",
  danger: "#EB5757",
};

const historyCache = new Map<string, { date: string; value: number }[]>();

interface InlineSparklineProps {
  slug: string;
  status: IndicatorStatus;
  width?: number;
  height?: number;
}

export function InlineSparkline({
  slug,
  status,
  width = 80,
  height = 24,
}: InlineSparklineProps) {
  const [points, setPoints] = useState<{ date: string; value: number }[] | null>(
    historyCache.get(slug) ?? null
  );
  const [loading, setLoading] = useState(!historyCache.has(slug));
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (fetchedRef.current || historyCache.has(slug)) return;
    fetchedRef.current = true;
    try {
      const res = await fetch(`/api/indicators/${slug}/history`);
      if (!res.ok) return;
      const data = await res.json();
      const history = data.history ?? [];
      historyCache.set(slug, history);
      setPoints(history);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (historyCache.has(slug)) {
      setPoints(historyCache.get(slug)!);
      setLoading(false);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchData();
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [slug, fetchData]);

  const color = STATUS_COLORS[status];

  if (loading) {
    return (
      <div
        ref={containerRef}
        style={{ width, height }}
        className="bg-pulse-border/30 animate-pulse rounded"
      />
    );
  }

  if (!points || points.length < 2) {
    return (
      <div
        ref={containerRef}
        style={{ width, height }}
        className="bg-pulse-border/20 rounded"
      />
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 2;

  const polyPoints = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (width - pad * 2);
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div ref={containerRef} style={{ width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline
          points={polyPoints}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
