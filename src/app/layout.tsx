import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://recessionpulse.com"),
  title: {
    default: "RecessionPulse — Real-time Recession Indicators & Daily SMS Alerts",
    template: "%s | RecessionPulse",
  },
  description:
    "Track 14 critical recession indicators daily: Sahm Rule, yield curves, Conference Board LEI, credit spreads, and more. Get daily SMS alerts with AI-analyzed economic signals. From $9.99/month.",
  keywords: [
    "recession indicators",
    "recession tracker",
    "Sahm Rule",
    "yield curve inversion",
    "recession prediction",
    "economic indicators",
    "recession probability",
    "daily recession alerts",
    "recession SMS alerts",
    "Conference Board LEI",
    "recession warning signs",
    "recession monitor",
    "economic recession 2026",
    "is a recession coming",
    "recession risk",
    "yield curve 2s10s",
    "ON RRP facility",
    "credit spreads",
    "ISM manufacturing PMI",
    "stock screener recession",
    "recession proof portfolio",
    "economic downturn alert",
  ],
  authors: [{ name: "RecessionPulse" }],
  creator: "RecessionPulse",
  publisher: "RecessionPulse",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://recessionpulse.com",
    siteName: "RecessionPulse",
    title: "RecessionPulse — Know Before the Recession Hits",
    description:
      "14 critical recession indicators analyzed daily. Sahm Rule, yield curves, LEI, credit spreads & more. Daily SMS alerts from $9.99/mo.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RecessionPulse — Real-time Recession Indicators Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RecessionPulse — Real-time Recession Indicators",
    description:
      "Track 14 recession indicators daily. Sahm Rule, yield curves, LEI & more. Daily SMS alerts.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://recessionpulse.com",
  },
  category: "Finance",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RecessionPulse",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description:
    "Real-time recession indicator tracking and daily SMS alerts. Monitors Sahm Rule, yield curves, Conference Board LEI, credit spreads, and 10+ more economic indicators.",
  url: "https://recessionpulse.com",
  offers: [
    {
      "@type": "Offer",
      name: "Pulse Plan",
      price: "9.99",
      priceCurrency: "USD",
      description: "Daily recession indicator SMS alerts — 14 key indicators tracked",
      url: "https://recessionpulse.com/pricing",
    },
    {
      "@type": "Offer",
      name: "Pulse Pro Plan",
      price: "14.99",
      priceCurrency: "USD",
      description:
        "Daily recession alerts + stock screener. Stocks below 200 EMA, RSI <30, P/E <15.",
      url: "https://recessionpulse.com/pricing",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "127",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the Sahm Rule and is it triggered in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Sahm Rule identifies recessions when the 3-month moving average of unemployment rises 0.50 percentage points above its 12-month low. As of January 2026, the Sahm Rule reading is 0.30 — below the 0.50 trigger and declining from its 0.57 peak in August 2024. RecessionPulse tracks this indicator daily.",
      },
    },
    {
      "@type": "Question",
      name: "Is a recession coming in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "As of February 2026, recession signals are mixed. The Conference Board LEI has triggered its recession signal since August 2025, but the Sahm Rule is NOT triggered. JPMorgan puts recession probability at 35%. GDP growth is slowing to 2.1% but still positive. RecessionPulse monitors 14 indicators daily to give you a clear picture.",
      },
    },
    {
      "@type": "Question",
      name: "What does yield curve inversion mean for recession?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yield curve inversion (when short-term rates exceed long-term rates) has preceded every recession since 1955 with only one false signal. The 2s10s yield curve un-inverted in mid-2024 and is now at +70 basis points. Historically, recessions follow 6-18 months after un-inversion. RecessionPulse tracks both the 2s10s and 2s30s spreads daily.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Conference Board LEI 3Ds Rule?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The 3Ds Rule looks at three conditions in the Conference Board Leading Economic Index: Depth (6-month growth rate below -4.3%), Diffusion (more than half of components declining), and Duration (sustained decline). When all three trigger, recession probability is 85%+. This signal has been ACTIVE since August 2025.",
      },
    },
    {
      "@type": "Question",
      name: "How much does RecessionPulse cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RecessionPulse offers two plans: Pulse at $9.99/month (daily SMS alerts with 14 recession indicators) and Pulse Pro at $14.99/month (adds daily stock screener alerts for stocks below 200 EMA with RSI <30 and P/E <15). Cancel anytime.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0a0a0f" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-pulse-darker text-pulse-text antialiased">
        {children}
      </body>
    </html>
  );
}
