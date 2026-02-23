import { ImageResponse } from "next/og";
import { getIndicatorSEO } from "@/lib/indicators-metadata";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "edge";

const STATUS_COLORS: Record<string, string> = {
  safe: "#00CC66",
  watch: "#FFCC00",
  warning: "#FF3333",
  danger: "#FF3333",
};

const STATUS_BG: Record<string, string> = {
  safe: "rgba(0,204,102,0.15)",
  watch: "rgba(255,204,0,0.15)",
  warning: "rgba(255,51,51,0.15)",
  danger: "rgba(255,51,51,0.15)",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const seo = getIndicatorSEO(slug);

  let latestValue = "—";
  let status = "safe";
  let signal = "";
  let signalEmoji = "";

  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("indicator_readings")
      .select("latest_value, status, signal, signal_emoji")
      .eq("slug", slug)
      .order("reading_date", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      latestValue = data.latest_value;
      status = data.status;
      signal = data.signal;
      signalEmoji = data.signal_emoji;
    }
  } catch {
    /* fallback to defaults */
  }

  const color = STATUS_COLORS[status] || STATUS_COLORS.safe;
  const bgColor = STATUS_BG[status] || STATUS_BG.safe;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: "linear-gradient(135deg, #000000 0%, #080808 50%, #0D0D0D 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "9999px",
                background: bgColor,
                border: `1px solid ${color}40`,
                color,
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {status.toUpperCase()}
            </div>
          </div>
          <div style={{ fontSize: "48px", fontWeight: 800, color: "white", lineHeight: 1.1 }}>
            {seo?.title ?? slug}
          </div>
          <div style={{ fontSize: "20px", color: "#9ca3af", maxWidth: "800px" }}>
            {seo?.metaDescription ?? "Recession indicator tracking by RecessionPulse"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
            <div style={{ fontSize: "72px", fontWeight: 800, color: "white", fontFamily: "monospace" }}>
              {latestValue}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "24px" }}>{signalEmoji}</div>
              <div style={{ fontSize: "16px", color: "#9ca3af", maxWidth: "400px" }}>
                {signal}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "0px",
                background: "#00CC66",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 800,
                color: "#000000",
              }}
            >
              R
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>
              RecessionPulse
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
