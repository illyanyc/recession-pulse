"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Point {
  date: string;
  a?: number;
  b?: number;
}

interface CompareChartProps {
  data: Point[];
  aLabel: string;
  bLabel: string;
}

export function CompareChart({ data, aLabel, bLabel }: CompareChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
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
            minTickGap={40}
          />
          <YAxis
            yAxisId="a"
            stroke="#00CC66"
            tick={{ fill: "#00CC66", fontSize: 11 }}
            width={50}
          />
          <YAxis
            yAxisId="b"
            orientation="right"
            stroke="#3B82F6"
            tick={{ fill: "#3B82F6", fontSize: 11 }}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111",
              border: "1px solid #2A2A2A",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#fff" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }}
            iconType="line"
          />
          <Line
            yAxisId="a"
            type="monotone"
            dataKey="a"
            name={aLabel}
            stroke="#00CC66"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            yAxisId="b"
            type="monotone"
            dataKey="b"
            name={bLabel}
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
