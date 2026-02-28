import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { Features } from "@/components/landing/Features";
import { Indicators } from "@/components/landing/Indicators";
import { SMSPreview } from "@/components/landing/SMSPreview";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RecessionPulse",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description:
    "Track 42 recession & macro indicators in real time. Free dashboard with Sahm Rule, yield curves, VIX, JOLTS, building permits, GDPNow, NFCI, and more.",
  url: "https://recessionpulse.com",
  offers: [
    {
      "@type": "Offer",
      name: "Free Plan",
      price: "0",
      priceCurrency: "USD",
      description:
        "Free dashboard with all 42 recession and macro indicators tracked in real time",
      url: "https://recessionpulse.com/signup",
    },
    {
      "@type": "Offer",
      name: "Pulse Plan",
      price: "6.99",
      priceCurrency: "USD",
      description:
        "Daily email and SMS recession alerts — 42 indicators tracked with threshold notifications",
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

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <Indicators />
        <SMSPreview />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
