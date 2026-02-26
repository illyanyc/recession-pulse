import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
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
    default: "RecessionPulse — 42 Recession Indicators Tracked in Real Time | Free Dashboard",
    template: "%s | RecessionPulse",
  },
  description:
    "Track 42 recession & macro indicators free: Sahm Rule, yield curves, VIX, JOLTS, building permits, GDPNow, NFCI, and more. The quant's edge for every investor. SMS alerts from $6.99/mo.",
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
    "VIX recession",
    "JOLTS quits rate",
    "building permits recession",
    "GDPNow",
    "NFCI financial conditions",
    "copper gold ratio",
    "NFIB small business",
    "credit card delinquency",
    "SLOOS lending standards",
    "SOS recession indicator",
    "NY Fed recession probability",
    "ISM manufacturing PMI",
    "stock screener recession",
    "recession proof portfolio",
    "free recession dashboard",
    "quant recession indicators",
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
    title: "RecessionPulse — Think Like a Quant. Prepare for What's Next.",
    description:
      "42 recession & macro indicators tracked free. Sahm Rule, yield curves, VIX, JOLTS, GDPNow & more. SMS alerts from $6.99/mo.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RecessionPulse — 42 Recession Indicators Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RecessionPulse — 42 Recession Indicators, Free Dashboard",
    description:
      "Track 42 recession indicators free. Sahm Rule, yield curves, VIX, JOLTS, building permits & more. SMS alerts from $6.99/mo.",
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
    "Track 42 recession & macro indicators in real time. Free dashboard with Sahm Rule, yield curves, VIX, JOLTS, building permits, GDPNow, NFCI, and more. SMS alerts from $6.99/mo.",
  url: "https://recessionpulse.com",
  offers: [
    {
      "@type": "Offer",
      name: "Free Plan",
      price: "0",
      priceCurrency: "USD",
      description: "Free dashboard with all 42 recession and macro indicators tracked in real time",
      url: "https://recessionpulse.com/signup",
    },
    {
      "@type": "Offer",
      name: "Pulse Plan",
      price: "6.99",
      priceCurrency: "USD",
      description: "Daily email and SMS recession alerts — 42 indicators tracked with threshold notifications",
      url: "https://recessionpulse.com/pricing",
    },
    {
      "@type": "Offer",
      name: "Pulse Pro Plan",
      price: "9.99",
      priceCurrency: "USD",
      description:
        "Full quant toolkit — 42 indicators + stock screener alerts. Stocks below 200 EMA, RSI <30, P/E <15.",
      url: "https://recessionpulse.com/pricing",
    },
  ],
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RecessionPulse",
  url: "https://recessionpulse.com",
  logo: "https://recessionpulse.com/logo-transparent.png",
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@recessionpulse.com",
    contactType: "customer support",
  },
  sameAs: [
    "https://twitter.com/RecessionPulse",
    "https://linkedin.com/company/recessionpulse",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RecessionPulse",
  url: "https://recessionpulse.com",
  description: "Real-time recession indicator tracking and daily alerts.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://recessionpulse.com/indicators?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What indicators does RecessionPulse track?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RecessionPulse monitors 42 recession and macro indicators across 8 categories: Primary (Sahm Rule, unemployment, industrial production, JOLTS quits, temp help, SOS indicator), Housing (building permits, housing starts), Business Activity (corporate profits, NFIB, inventory-to-sales), Credit Stress (savings rate, credit card delinquency, SLOOS, debt service ratio), Market (yield curves, VIX, NFCI, copper-gold ratio, NY Fed & JPM recession probability), Liquidity (M2), and Real-Time (freight index, GDPNow).",
      },
    },
    {
      "@type": "Question",
      name: "Is RecessionPulse really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The full dashboard with all 42 indicators, signals, trends, historical context, and daily email briefings is completely free with no credit card required. The Pulse plan ($6.99/mo) adds AI recession risk assessment, SMS alerts, and threshold notifications. Pulse Pro ($9.99/mo) adds stock screener alerts, value picks, sector rotation signals, and portfolio defense positioning.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Sahm Rule?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Sahm Rule identifies recessions when the 3-month moving average of the national unemployment rate rises 0.50 percentage points or more above its low from the previous 12 months. Created by economist Claudia Sahm, it has correctly signaled every recession since 1970 in real time.",
      },
    },
    {
      "@type": "Question",
      name: "What does yield curve inversion mean for recession?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yield curve inversion occurs when short-term interest rates exceed long-term rates. The 2-year/10-year Treasury spread inverting has preceded every US recession since 1955, with only one false signal. Historically, recessions follow 6-18 months after un-inversion.",
      },
    },
    {
      "@type": "Question",
      name: "How much does RecessionPulse cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RecessionPulse has three tiers: Free (full dashboard with all 42 indicators plus daily email briefings), Pulse at $6.99/month (adds AI recession risk assessment, SMS alerts, and threshold notifications), and Pulse Pro at $9.99/month (adds stock screener alerts, value picks, sector rotation signals, and portfolio defense positioning). Cancel anytime. No contracts.",
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/logo-transparent.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo-transparent.png" />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-pulse-darker text-pulse-text antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
