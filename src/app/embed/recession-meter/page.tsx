import { createServiceClient } from "@/lib/supabase/server";
import type { IndicatorStatus } from "@/types";

export const revalidate = 3600;

export default async function RecessionMeterEmbed() {
  const supabase = createServiceClient();

  const { data: readings } = await supabase
    .from("indicator_readings")
    .select("slug, name, latest_value, status, signal_emoji, reading_date")
    .order("reading_date", { ascending: false });

  const latestBySlug = new Map<string, {
    slug: string;
    name: string;
    latest_value: string;
    status: IndicatorStatus;
    signal_emoji: string;
    reading_date: string;
  }>();

  if (readings) {
    for (const r of readings) {
      if (!latestBySlug.has(r.slug)) {
        latestBySlug.set(r.slug, r as typeof latestBySlug extends Map<string, infer V> ? V : never);
      }
    }
  }

  const indicators = Array.from(latestBySlug.values());
  const statusCounts = { safe: 0, watch: 0, warning: 0, danger: 0 };
  for (const ind of indicators) {
    if (ind.status in statusCounts) statusCounts[ind.status]++;
  }

  const total = indicators.length || 1;
  const riskScore = Math.round(
    ((statusCounts.danger * 100 + statusCounts.warning * 66 + statusCounts.watch * 33) / total)
  );

  const riskLevel =
    riskScore >= 60 ? "HIGH" : riskScore >= 35 ? "ELEVATED" : riskScore >= 15 ? "MODERATE" : "LOW";
  const riskColor =
    riskScore >= 60
      ? "#EB5757"
      : riskScore >= 35
        ? "#F2C94C"
        : riskScore >= 15
          ? "#F2C94C"
          : "#00CC66";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Recession Risk Meter — RecessionPulse</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'JetBrains Mono', 'Fira Code', monospace, system-ui, sans-serif;
                background: #000000;
                color: #D4D4D4;
                padding: 16px;
              }
              .container {
                max-width: 360px;
                margin: 0 auto;
                border: 1px solid #2A2A2A;
                overflow: hidden;
                background: #0D0D0D;
              }
              .header {
                padding: 16px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid #2A2A2A;
              }
              .title { font-size: 13px; font-weight: 600; color: white; }
              .powered {
                font-size: 10px;
                color: #808080;
                text-decoration: none;
              }
              .powered:hover { color: #F0913A; }
              .body { padding: 20px; text-align: center; }
              .score {
                font-size: 48px;
                font-weight: 800;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                color: ${riskColor};
                line-height: 1;
              }
              .label {
                font-size: 14px;
                font-weight: 700;
                color: ${riskColor};
                margin-top: 4px;
                letter-spacing: 0.05em;
              }
              .bar-track {
                margin: 16px 0;
                height: 6px;
                background: #2A2A2A;
                overflow: hidden;
              }
              .bar-fill {
                height: 100%;
                width: ${riskScore}%;
                background: ${riskColor};
                transition: width 0.5s;
              }
              .stats {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
                margin-top: 12px;
              }
              .stat { text-align: center; }
              .stat-count {
                font-size: 18px;
                font-weight: 700;
                font-family: monospace;
                color: white;
              }
              .stat-label { font-size: 10px; color: #808080; margin-top: 2px; }
              .safe .stat-count { color: #00CC66; }
              .watch .stat-count { color: #F2C94C; }
              .warning .stat-count { color: #EB5757; }
              .danger .stat-count { color: #EB5757; }
              .footer {
                padding: 12px 20px;
                border-top: 1px solid #2A2A2A;
                text-align: center;
              }
              .cta {
                display: inline-block;
                padding: 8px 20px;
                background: #F0913A;
                color: #000000;
                font-size: 12px;
                font-weight: 700;
                text-decoration: none;
              }
              .cta:hover { opacity: 0.9; }
              .updated {
                font-size: 10px;
                color: #808080;
                margin-top: 8px;
              }
            `,
          }}
        />
      </head>
      <body>
        <div className="container">
          <div className="header">
            <span className="title">Recession Risk Meter</span>
            <a
              href="https://recessionpulse.com?ref=embed"
              target="_blank"
              rel="noopener"
              className="powered"
            >
              by RecessionPulse
            </a>
          </div>
          <div className="body">
            <div className="score">{riskScore}</div>
            <div className="label">{riskLevel} RISK</div>
            <div className="bar-track">
              <div className="bar-fill" />
            </div>
            <div className="stats">
              <div className="stat safe">
                <div className="stat-count">{statusCounts.safe}</div>
                <div className="stat-label">Safe</div>
              </div>
              <div className="stat watch">
                <div className="stat-count">{statusCounts.watch}</div>
                <div className="stat-label">Watch</div>
              </div>
              <div className="stat warning">
                <div className="stat-count">{statusCounts.warning}</div>
                <div className="stat-label">Warning</div>
              </div>
              <div className="stat danger">
                <div className="stat-count">{statusCounts.danger}</div>
                <div className="stat-label">Danger</div>
              </div>
            </div>
          </div>
          <div className="footer">
            <a
              href="https://recessionpulse.com/indicators?ref=embed"
              target="_blank"
              rel="noopener"
              className="cta"
            >
              View All Indicators
            </a>
            <div className="updated">
              Updated {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {" "}&bull; {indicators.length} indicators tracked
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
