import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — RecessionPulse",
  description:
    "RecessionPulse terms of service covering subscriptions, billing, SMS alerts, data accuracy, and limitation of liability. RecessionPulse is not investment advice.",
  openGraph: {
    type: "website",
    siteName: "RecessionPulse",
    title: "Terms of Service — RecessionPulse",
    description:
      "RecessionPulse terms of service covering subscriptions, billing, SMS alerts, and limitation of liability.",
    url: "https://recessionpulse.com/terms",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "RecessionPulse Terms of Service" }],
  },
  alternates: { canonical: "https://recessionpulse.com/terms" },
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-invert prose-sm">
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-pulse-muted text-sm mb-8">Last updated: February 22, 2026</p>

          <section className="space-y-6 text-pulse-text/90 text-sm leading-relaxed">
            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using RecessionPulse (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
                If you do not agree, do not use the Service. We may modify these terms at any time; continued use
                after changes constitutes acceptance.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">2. Description of Service</h2>
              <p>
                RecessionPulse is a subscription-based information service that aggregates publicly available economic
                indicators and delivers daily summaries via SMS and email. The Service includes recession indicator
                monitoring, stock screening alerts, and related data visualizations.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">3. Not Investment Advice</h2>
              <div className="p-4 rounded-lg bg-pulse-red/10 border border-pulse-red/20">
                <p className="font-semibold text-pulse-red mb-2">IMPORTANT DISCLAIMER</p>
                <p>
                  RecessionPulse is an <strong>informational service only</strong>. Nothing provided by the Service
                  constitutes investment advice, financial advice, trading advice, or any other sort of professional advice.
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>We are <strong>not</strong> a registered investment advisor, broker-dealer, or financial planner.</li>
                  <li>The indicators, signals, stock screener results, and commentary are for <strong>educational and informational purposes only</strong>.</li>
                  <li>You should <strong>not</strong> make any investment decision based solely on information from RecessionPulse.</li>
                  <li>Always consult a qualified financial advisor before making investment decisions.</li>
                  <li>Past indicator readings and signals do not guarantee future results.</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">4. Account &amp; Eligibility</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must be at least 18 years old to use the Service.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You are responsible for all activity under your account.</li>
                <li>One account per person. Sharing accounts is prohibited.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">5. Subscriptions &amp; Billing</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Paid plans are billed monthly via Stripe.</li>
                <li>You may cancel at any time. Cancellation takes effect at the end of your current billing period.</li>
                <li>No refunds for partial months. If you cancel mid-cycle, you retain access until the period ends.</li>
                <li>We reserve the right to change pricing with 30 days&apos; notice.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">6. SMS Terms</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>By opting in, you consent to receive recurring automated SMS messages.</li>
                <li>Message frequency: up to 2 messages/day.</li>
                <li>Message and data rates may apply.</li>
                <li>Text <strong>STOP</strong> to cancel. Text <strong>HELP</strong> for help.</li>
                <li>SMS consent is not required for purchase. You can use email-only alerts.</li>
                <li>Supported carriers include but are not limited to: AT&amp;T, T-Mobile, Verizon.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">7. Data Sources &amp; Accuracy</h2>
              <p>
                Economic data is sourced from the Federal Reserve Economic Data (FRED) API, U.S. Treasury,
                and other publicly available government and institutional sources. While we strive for accuracy,
                we do not guarantee the timeliness, completeness, or accuracy of any data.
              </p>
              <p className="mt-2">
                Stock screener data is derived from public market data sources. Screener results are algorithmic
                filters, not buy/sell recommendations.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">8. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, RECESSIONPULSE AND ITS OPERATORS SHALL NOT BE LIABLE FOR
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO
                LOSS OF PROFITS, DATA, OR INVESTMENT LOSSES, ARISING FROM YOUR USE OF THE SERVICE.
              </p>
              <p className="mt-2">
                You expressly acknowledge that any investment decisions you make are your own responsibility.
                RecessionPulse shall not be held liable for any financial losses resulting from actions taken
                based on information provided by the Service.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">9. Intellectual Property</h2>
              <p>
                All content, branding, and code comprising RecessionPulse are owned by us. You may not copy,
                redistribute, or commercially exploit any part of the Service without written permission.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">10. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at any time for violation of these terms,
                abusive behavior, or any other reason at our discretion. Upon termination, your right to use
                the Service ceases immediately.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">11. Governing Law</h2>
              <p>
                These terms are governed by the laws of the State of Delaware, United States, without regard
                to conflict of law provisions. Any disputes shall be resolved in the courts of Delaware.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">12. Contact</h2>
              <p>
                Questions about these terms? <a href="/contact" className="text-pulse-green hover:underline font-medium">Get in touch</a>.
              </p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
