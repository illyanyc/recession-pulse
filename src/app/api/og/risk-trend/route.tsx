import { ImageResponse } from "next/og";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "edge";

const RISK_BANDS = [
  { max: 20, label: "LOW", color: "#00CC66" },
  { max: 40, label: "MODERATE", color: "#F2C94C" },
  { max: 60, label: "ELEVATED", color: "#F0913A" },
  { max: 80, label: "HIGH", color: "#EB5757" },
  { max: 100, label: "CRITICAL", color: "#BB0A1F" },
];

function colorForScore(score: number): string {
  for (const band of RISK_BANDS) {
    if (score <= band.max) return band.color;
  }
  return RISK_BANDS[RISK_BANDS.length - 1].color;
}

function labelForScore(score: number): string {
  for (const band of RISK_BANDS) {
    if (score <= band.max) return band.label;
  }
  return RISK_BANDS[RISK_BANDS.length - 1].label;
}

interface ScoreRow {
  assessment_date: string;
  score: number;
}

function sizePreset(size: string | null): { width: number; height: number; scale: "og" | "email" | "blog" } {
  if (size === "email") return { width: 600, height: 300, scale: "email" };
  if (size === "blog") return { width: 1000, height: 420, scale: "blog" };
  return { width: 1200, height: 630, scale: "og" };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const size = url.searchParams.get("size");
  const daysParam = Number(url.searchParams.get("days") || 30);
  const days = Math.max(7, Math.min(180, Number.isFinite(daysParam) ? daysParam : 30));
  const dateParam = url.searchParams.get("date");

  const { width, height, scale } = sizePreset(size);

  const endDate = dateParam ? new Date(`${dateParam}T00:00:00Z`) : new Date();
  const startDate = new Date(endDate);
  startDate.setUTCDate(endDate.getUTCDate() - days);

  let series: ScoreRow[] = [];
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("recession_risk_assessments")
      .select("assessment_date, score")
      .gte("assessment_date", startDate.toISOString().split("T")[0])
      .lte("assessment_date", endDate.toISOString().split("T")[0])
      .order("assessment_date", { ascending: true });
    series = (data as ScoreRow[]) || [];
  } catch {
    series = [];
  }

  const currentScore = series.length > 0 ? series[series.length - 1].score : 0;
  const previousScore = series.length > 1 ? series[0].score : currentScore;
  const delta = currentScore - previousScore;
  const minScore = series.length ? Math.min(...series.map((s) => s.score)) : 0;
  const maxScore = series.length ? Math.max(...series.map((s) => s.score)) : 0;
  const currentColor = colorForScore(currentScore);
  const currentLabel = labelForScore(currentScore);

  const padding = scale === "email" ? 28 : scale === "blog" ? 48 : 56;
  const chartTop = scale === "email" ? 70 : scale === "blog" ? 110 : 150;
  const chartHeight = height - chartTop - padding - (scale === "email" ? 28 : 44);
  const chartWidth = width - padding * 2;
  const chartRight = padding + chartWidth;
  const chartBottom = chartTop + chartHeight;

  // Chart-local coordinates (origin = top-left of the <svg>, which is the chart area itself)
  const n = Math.max(series.length, 1);
  const points = series.map((row, i) => {
    const x = n === 1 ? chartWidth / 2 : (i / (n - 1)) * chartWidth;
    const y = (1 - row.score / 100) * chartHeight;
    return { x, y, score: row.score, date: row.assessment_date };
  });

  const bandRows = RISK_BANDS.map((band, idx) => {
    const topScore = band.max;
    const bottomScore = idx === 0 ? 0 : RISK_BANDS[idx - 1].max;
    const yTop = (1 - topScore / 100) * chartHeight;
    const yBottom = (1 - bottomScore / 100) * chartHeight;
    return { yTop, height: yBottom - yTop, color: band.color };
  });

  const titleFont = scale === "email" ? 16 : scale === "blog" ? 22 : 28;
  const scoreFont = scale === "email" ? 42 : scale === "blog" ? 64 : 84;
  const metaFont = scale === "email" ? 11 : scale === "blog" ? 13 : 16;

  const deltaColor = delta > 2 ? "#EB5757" : delta < -2 ? "#00CC66" : "#9ca3af";
  const deltaArrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "–";

  const linePath = points.length > 1
    ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
    : points.length === 1
      ? `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
      : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #000000 0%, #080808 60%, #0D0D0D 100%)",
          fontFamily: "system-ui, sans-serif",
          color: "#D4D4D4",
          padding: `${padding}px`,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: scale === "email" ? 4 : 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: titleFont,
                fontWeight: 700,
                color: "#D4D4D4",
                letterSpacing: "-0.3px",
                display: "flex",
              }}
            >
              Recession Risk Score · Last {days} days
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: scale === "email" ? 18 : 24,
                  height: scale === "email" ? 18 : 24,
                  background: "#FF6600",
                  color: "#000",
                  fontWeight: 800,
                  fontSize: scale === "email" ? 11 : 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                R
              </div>
              <div style={{ fontSize: metaFont, fontWeight: 700, color: "#fff", display: "flex" }}>
                RecessionPulse
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: scale === "email" ? 12 : 24 }}>
            <div
              style={{
                fontSize: scoreFont,
                fontWeight: 800,
                color: currentColor,
                fontFamily: "monospace",
                lineHeight: 1,
                display: "flex",
              }}
            >
              {currentScore}
              <span style={{ fontSize: scoreFont / 2, color: "#6b7280", marginLeft: 6 }}>/100</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div
                style={{
                  fontSize: metaFont + 2,
                  fontWeight: 700,
                  color: currentColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  display: "flex",
                }}
              >
                {currentLabel}
              </div>
              <div style={{ fontSize: metaFont, color: deltaColor, display: "flex" }}>
                {deltaArrow} {delta >= 0 ? "+" : ""}
                {delta.toFixed(0)} vs {days}d ago · min {minScore} · max {maxScore}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <svg
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ marginTop: scale === "email" ? 8 : 16 }}
        >
          {bandRows.map((b, i) => (
            <rect
              key={i}
              x={0}
              y={b.yTop}
              width={chartWidth}
              height={b.height}
              fill={b.color}
              opacity={0.06}
            />
          ))}
          {[0, 20, 40, 60, 80, 100].map((tick) => {
            const y = (1 - tick / 100) * chartHeight;
            return (
              <g key={tick}>
                <line x1={0} x2={chartWidth} y1={y} y2={y} stroke="#2A2A2A" strokeWidth={1} />
                <text x={chartWidth - 4} y={y - 2} fill="#6b7280" fontSize={metaFont - 2} textAnchor="end">
                  {tick}
                </text>
              </g>
            );
          })}
          {linePath ? (
            <path
              d={linePath}
              fill="none"
              stroke={currentColor}
              strokeWidth={scale === "email" ? 2 : 3}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={scale === "email" ? 4 : 6}
              fill={currentColor}
              stroke="#0D0D0D"
              strokeWidth={2}
            />
          )}
        </svg>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: metaFont - 2,
            color: "#6b7280",
            marginTop: 4,
          }}
        >
          <div style={{ display: "flex" }}>
            {series[0]?.assessment_date || startDate.toISOString().split("T")[0]}
          </div>
          <div style={{ display: "flex" }}>recessionpulse.com</div>
          <div style={{ display: "flex" }}>
            {series[series.length - 1]?.assessment_date || endDate.toISOString().split("T")[0]}
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
