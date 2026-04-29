import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Providers } from "./providers";
import { INDICATOR_COUNT } from "@/lib/indicators-metadata";
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
    default: `RecessionPulse — Track ${INDICATOR_COUNT} Recession Indicators Free`,
    template: "%s | RecessionPulse",
  },
  description: `Track ${INDICATOR_COUNT} recession & macro indicators free: Sahm Rule, yield curves, VIX, JOLTS, building permits, GDPNow, NFCI & more. SMS alerts from $6.99/mo.`,
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
    description: `${INDICATOR_COUNT} recession & macro indicators tracked free. Sahm Rule, yield curves, VIX, JOLTS, GDPNow & more. SMS alerts from $6.99/mo.`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `RecessionPulse — ${INDICATOR_COUNT} Recession Indicators Dashboard`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `RecessionPulse — ${INDICATOR_COUNT} Recession Indicators, Free Dashboard`,
    description: `Track ${INDICATOR_COUNT} recession indicators free. Sahm Rule, yield curves, VIX, JOLTS, building permits & more. SMS alerts from $6.99/mo.`,
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://recessionpulse.com",
  },
  category: "Finance",
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
  // SearchAction intentionally omitted — no site-wide search handler wired yet.
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "whrfga0wc3");`}
        </Script>
      </head>
      <body className="min-h-screen bg-pulse-darker text-pulse-text antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
