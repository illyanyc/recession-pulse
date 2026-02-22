import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://recessionpulse.com"),
  title: {
    default: "RecessionPulse — Real-time Recession Indicators & Daily SMS Alerts",
    template: "%s | RecessionPulse",
  },
  description:
    "Track 9 critical recession indicators daily: Sahm Rule, yield curves, Conference Board LEI, credit spreads, and more. Get daily SMS alerts with data-driven economic signals. From $9.99/month.",
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
      "9 critical recession indicators analyzed daily. Sahm Rule, yield curves, LEI, credit spreads & more. Daily SMS alerts from $9.99/mo.",
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
      "Track 9 recession indicators daily. Sahm Rule, yield curves, LEI & more. Daily SMS alerts.",
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
    "Real-time recession indicator tracking and daily SMS alerts. Monitors Sahm Rule, yield curves, Conference Board LEI, credit spreads, and more.",
  url: "https://recessionpulse.com",
  offers: [
    {
      "@type": "Offer",
      name: "Pulse Plan",
      price: "9.99",
      priceCurrency: "USD",
      description: "Daily recession indicator SMS alerts — 9 key indicators tracked",
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
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RecessionPulse",
  url: "https://recessionpulse.com",
  logo: "https://recessionpulse.com/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@recessionpulse.com",
    contactType: "customer support",
  },
  sameAs: [],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the Sahm Rule?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Sahm Rule identifies recessions when the 3-month moving average of the national unemployment rate rises 0.50 percentage points or more above its low from the previous 12 months. Created by economist Claudia Sahm, it has correctly signaled every recession since 1970 in real time. RecessionPulse tracks this indicator daily.",
      },
    },
    {
      "@type": "Question",
      name: "What does yield curve inversion mean for recession?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yield curve inversion occurs when short-term interest rates exceed long-term rates. The 2-year/10-year Treasury spread inverting has preceded every US recession since 1955, with only one false signal. Historically, recessions follow 6-18 months after un-inversion. RecessionPulse tracks both the 2s10s and 2s30s spreads.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Conference Board LEI 3Ds Rule?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The 3Ds Rule evaluates three conditions in the Conference Board Leading Economic Index: Depth (6-month growth rate below -4.3%), Diffusion (more than half of components declining), and Duration (sustained decline over multiple months). When all three trigger simultaneously, historical recession probability exceeds 85%.",
      },
    },
    {
      "@type": "Question",
      name: "What is the ON RRP Facility and why does it matter?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Overnight Reverse Repo (ON RRP) Facility is the Federal Reserve's mechanism for absorbing excess liquidity from the financial system. When ON RRP balances decline sharply, it signals that the liquidity buffer in the financial system is thinning. Near-zero levels mean banks and money-market funds have less margin of safety during market stress.",
      },
    },
    {
      "@type": "Question",
      name: "What indicators does RecessionPulse track?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RecessionPulse monitors key recession indicators daily including: the Sahm Rule, Yield Curve spreads (2s10s and 2s30s), Conference Board LEI, ON RRP Facility levels, DXY Dollar Index, Emerging Market performance, JPMorgan recession probability, GDP growth forecasts, credit spreads, ISM Manufacturing PMI, bank unrealized losses, US interest expense, and M2 money supply.",
      },
    },
    {
      "@type": "Question",
      name: "How much does RecessionPulse cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RecessionPulse offers two plans: Pulse at $9.99/month (daily SMS and email alerts with all recession indicators) and Pulse Pro at $14.99/month (adds daily stock screener alerts for stocks below 200 EMA with RSI <30 and P/E <15). Cancel anytime. No contracts.",
      },
    },
    {
      "@type": "Question",
      name: "Is RecessionPulse investment advice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. RecessionPulse is strictly an informational service. We aggregate publicly available economic data and present it in a clear format. Nothing we provide constitutes investment advice, financial advice, or a recommendation to buy or sell any security. Always consult a qualified financial advisor before making investment decisions.",
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
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <meta name="theme-color" content="#0a0a0f" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-pulse-darker text-pulse-text antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
