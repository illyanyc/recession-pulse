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
  safe: "#00CC66",
  watch: "#FFCC00",
  warning: "#FF3333",
  danger: "#FF3333",
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
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
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
              background: "#0D0D0D",
              border: "1px solid #2A2A2A",
              borderRadius: "0px",
              padding: "8px 12px",
              fontSize: "12px",
              color: "#D4D4D4",
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
