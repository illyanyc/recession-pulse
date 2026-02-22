"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { IndicatorStatus } from "@/types";

const STATUS_COLOR: Record<IndicatorStatus, string> = {
  safe: "#00ff87",
  watch: "#ffa502",
  warning: "#ff4757",
  danger: "#ff4757",
};

interface IndicatorChartProps {
  data: { date: string; value: number }[];
  status: IndicatorStatus;
  slug: string;
}

export function IndicatorChart({ data, status, slug }: IndicatorChartProps) {
  const color = STATUS_COLOR[status];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id={`grad-${slug}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(d) =>
              new Date(d + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "#12121a",
              border: "1px solid #1e1e2e",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "12px",
              color: "#e5e7eb",
            }}
            labelFormatter={(d) =>
              new Date(String(d) + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
            formatter={(value) => [Number(value).toLocaleString(), "Value"]}
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${slug})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
