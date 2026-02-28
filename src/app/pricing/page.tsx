import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Pricing — RecessionPulse",
  description:
    "Compare RecessionPulse plans: Free dashboard with 42 indicators, Pulse ($6.99/mo) with SMS alerts, or Pulse Pro ($9.99/mo) with stock screener.",
  openGraph: {
    type: "website",
    siteName: "RecessionPulse",
    title: "Pricing — RecessionPulse",
    description:
      "Compare RecessionPulse plans: Free dashboard with 42 indicators, Pulse with SMS alerts, or Pulse Pro with stock screener.",
    url: "https://recessionpulse.com/pricing",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "RecessionPulse Pricing" }],
  },
  alternates: { canonical: "https://recessionpulse.com/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <h1 className="sr-only">RecessionPulse Pricing Plans</h1>
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
