import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Investment Disclaimer — RecessionPulse",
  description:
    "RecessionPulse is an informational service only and does not provide investment advice. All data is for educational purposes. Consult a financial advisor.",
  openGraph: {
    type: "website",
    siteName: "RecessionPulse",
    title: "Investment Disclaimer — RecessionPulse",
    description:
      "RecessionPulse is informational only and does not provide investment advice. Consult a financial advisor.",
    url: "https://recessionpulse.com/disclaimer",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "RecessionPulse Disclaimer" }],
  },
  alternates: { canonical: "https://recessionpulse.com/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-invert prose-sm">
          <h1 className="text-3xl font-bold text-white mb-2">Investment Disclaimer</h1>
          <p className="text-pulse-muted text-sm mb-8">Last updated: February 22, 2026</p>

          <section className="space-y-6 text-pulse-text/90 text-sm leading-relaxed">
            <div className="p-5 rounded-lg bg-pulse-red/10 border border-pulse-red/20">
              <p className="text-base font-semibold text-pulse-red mb-3">
                RecessionPulse Does Not Provide Investment Advice
              </p>
              <p>
                All information provided by RecessionPulse — including but not limited to recession indicators,
                economic data, stock screener results, signals, status classifications, and SMS/email alerts —
                is for <strong>educational and informational purposes only</strong>.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">No Professional Advice</h2>
              <p>
                RecessionPulse is not a registered investment advisor, broker-dealer, financial analyst, financial bank,
                securities broker, or financial planner. The Service does not provide investment advice, financial advice,
                tax advice, legal advice, or any other form of professional advice.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">No Recommendations</h2>
              <p>
                The presentation of economic indicators, recession signals, and stock screener results does not constitute
                a recommendation to buy, sell, or hold any security. The &quot;status&quot; labels (safe, watch, warning, danger)
                used in the Service are simplified categorizations of publicly available data and should not be interpreted
                as buy or sell signals.
              </p>
              <p className="mt-2">
                Stock screener results (value/dividend plays, oversold growth, defensive positions) are the output of
                mechanical filters applied to public market data. They are <strong>not</strong> curated recommendations.
                Inclusion of any stock in screener results does not imply endorsement.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">No Guarantees</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Past performance is not indicative of future results.</strong> Historical indicator readings
                  and their correlation with recessions do not guarantee that the same patterns will predict future
                  economic events.
                </li>
                <li>
                  <strong>Data may be delayed or inaccurate.</strong> Economic data is sourced from the FRED API and
                  other public sources. We do not guarantee real-time accuracy, completeness, or reliability.
                </li>
                <li>
                  <strong>Models can fail.</strong> The Sahm Rule, yield curve analysis, and other indicators have
                  limitations and false positive/negative rates that are well-documented in economic literature.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">Your Responsibility</h2>
              <p>
                You are solely responsible for your own investment decisions. Before making any investment, you should:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Consult with a qualified, licensed financial advisor.</li>
                <li>Conduct your own independent research and due diligence.</li>
                <li>Consider your personal financial situation, risk tolerance, and investment objectives.</li>
                <li>Understand that all investments carry risk, including the risk of total loss.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">Limitation of Liability</h2>
              <p>
                Under no circumstances shall RecessionPulse, its operators, employees, or affiliates be held liable
                for any losses, damages, or costs (including but not limited to investment losses, lost profits, or
                consequential damages) arising from or related to your use of, or reliance on, information provided
                by the Service.
              </p>
              <p className="mt-2">
                By using RecessionPulse, you acknowledge and agree that you use the Service at your own risk and that
                you will not hold RecessionPulse responsible for any investment outcomes.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">Regulatory Notice</h2>
              <p>
                RecessionPulse is not registered with the U.S. Securities and Exchange Commission (SEC), the
                Financial Industry Regulatory Authority (FINRA), or any state securities regulatory authority.
                The Service is not subject to the regulatory requirements applicable to registered investment
                advisors or broker-dealers.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-pulse-card border border-pulse-border mt-8">
              <p className="text-sm text-pulse-muted">
                By creating an account or subscribing to RecessionPulse, you acknowledge that you have read,
                understood, and agree to this Investment Disclaimer, our{" "}
                <a href="/terms" className="text-pulse-green hover:underline">Terms of Service</a>, and our{" "}
                <a href="/privacy" className="text-pulse-green hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
