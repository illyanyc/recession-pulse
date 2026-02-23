import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "99% Uptime SLA — RecessionPulse",
  description:
    "RecessionPulse commits to 99% service availability for dashboard access and alert delivery.",
};

export default function SLAPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-invert prose-sm">
          <h1 className="text-3xl font-bold text-white mb-2">
            Service Level Agreement
          </h1>
          <p className="text-pulse-muted text-sm mb-8">
            Effective: February 23, 2026
          </p>

          <section className="space-y-6 text-pulse-text/90 text-sm leading-relaxed">
            <div className="p-4 rounded-lg bg-pulse-green/10 border border-pulse-green/20">
              <p className="font-semibold text-pulse-green mb-1">
                99% Uptime Commitment
              </p>
              <p>
                RecessionPulse commits to maintaining at least{" "}
                <strong className="text-white">99% monthly uptime</strong> for
                all paid plan services, including dashboard access, SMS alerts,
                and email briefings.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">
                1. Covered Services
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Web dashboard and indicator pages</li>
                <li>Daily SMS and email alert delivery</li>
                <li>Stock screener and signal notifications</li>
                <li>API access (where applicable)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">
                2. Uptime Calculation
              </h2>
              <p>
                Monthly uptime is calculated as the total number of minutes in a
                calendar month minus downtime minutes, divided by the total
                minutes in that month. Scheduled maintenance windows (announced
                at least 24 hours in advance) are excluded from downtime
                calculations.
              </p>
              <div className="mt-3 p-3 rounded bg-pulse-card border border-pulse-border font-mono text-xs text-pulse-muted">
                Uptime % = (Total Minutes − Downtime Minutes) / Total Minutes ×
                100
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">
                3. Service Credits
              </h2>
              <p>
                If monthly uptime falls below 99%, paid subscribers are eligible
                for service credits applied to future billing:
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-pulse-border">
                      <th className="text-left py-2 pr-4 text-white font-semibold">
                        Monthly Uptime
                      </th>
                      <th className="text-left py-2 text-white font-semibold">
                        Service Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-pulse-text/90">
                    <tr className="border-b border-pulse-border/50">
                      <td className="py-2 pr-4">95.0% – 98.9%</td>
                      <td className="py-2">10% of monthly fee</td>
                    </tr>
                    <tr className="border-b border-pulse-border/50">
                      <td className="py-2 pr-4">90.0% – 94.9%</td>
                      <td className="py-2">25% of monthly fee</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Below 90.0%</td>
                      <td className="py-2">50% of monthly fee</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">
                4. Exclusions
              </h2>
              <p>This SLA does not apply to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Free-tier accounts</li>
                <li>
                  Outages caused by third-party providers (e.g., carrier SMS
                  delays, upstream data source downtime)
                </li>
                <li>Scheduled maintenance with prior notice</li>
                <li>Force majeure events</li>
                <li>
                  Issues resulting from user-side factors (network, browser,
                  device)
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">
                5. How to Request Credits
              </h2>
              <p>
                To request a service credit, email{" "}
                <a
                  href="mailto:support@recessionpulse.com"
                  className="text-pulse-green hover:underline"
                >
                  support@recessionpulse.com
                </a>{" "}
                within 30 days of the affected month with your account details
                and a description of the downtime experienced. Credits are
                issued at our sole discretion after verification.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">
                6. Changes to This SLA
              </h2>
              <p>
                We may update this SLA from time to time. Material changes will
                be communicated via email to active subscribers at least 30 days
                before taking effect. The current version will always be
                available at this URL.
              </p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
