import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — RecessionPulse",
  description:
    "Learn how RecessionPulse collects, uses, and protects your data. We never sell personal information. SMS opt-out available anytime.",
  openGraph: {
    type: "website",
    siteName: "RecessionPulse",
    title: "Privacy Policy — RecessionPulse",
    description:
      "Learn how RecessionPulse collects, uses, and protects your data. We never sell personal information.",
    url: "https://recessionpulse.com/privacy",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "RecessionPulse Privacy Policy" }],
  },
  alternates: { canonical: "https://recessionpulse.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-invert prose-sm">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-pulse-muted text-sm mb-8">Last updated: February 22, 2026</p>

          <section className="space-y-6 text-pulse-text/90 text-sm leading-relaxed">
            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">1. Information We Collect</h2>
              <p>When you create an account or subscribe to RecessionPulse, we collect:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Account information:</strong> name, email address, phone number, and password.</li>
                <li><strong>Payment information:</strong> processed securely by Stripe. We do not store your credit card number, CVC, or full card details on our servers.</li>
                <li><strong>Usage data:</strong> pages visited, features used, and interaction timestamps for improving the service.</li>
                <li><strong>Device data:</strong> browser type, operating system, IP address, and device identifiers.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To provide, maintain, and improve RecessionPulse services.</li>
                <li>To send you daily recession indicator alerts via SMS and/or email based on your preferences.</li>
                <li>To process subscription payments through Stripe.</li>
                <li>To communicate service updates, security alerts, and support messages.</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">3. SMS &amp; Communications</h2>
              <p>
                By opting in to SMS alerts, you consent to receive recurring automated text messages from RecessionPulse at the phone number you provided.
                Message frequency varies (typically 1-2 messages per day). Message and data rates may apply.
              </p>
              <p className="mt-2">
                You can opt out at any time by replying <strong>STOP</strong> to any message, or by disabling SMS alerts in your account settings.
                Reply <strong>HELP</strong> for support. Consent is not a condition of purchase.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">4. Data Sharing</h2>
              <p>We do not sell your personal information. We share data only with:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Stripe:</strong> for payment processing.</li>
                <li><strong>Brevo:</strong> for SMS delivery.</li>
                <li><strong>Resend:</strong> for email delivery.</li>
                <li><strong>Supabase:</strong> for database hosting and authentication.</li>
                <li><strong>Vercel:</strong> for application hosting.</li>
              </ul>
              <p className="mt-2">These providers process data solely on our behalf under their respective privacy policies.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">5. Data Security</h2>
              <p>
                We use industry-standard security measures including encryption in transit (TLS), encrypted storage,
                row-level security policies, and secure authentication via Supabase Auth. No method of electronic
                transmission or storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">6. Data Retention</h2>
              <p>
                We retain your account data for as long as your account is active. If you delete your account,
                we will delete your personal data within 30 days, except where retention is required by law.
                Aggregated, anonymized data may be retained indefinitely for analytics.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">7. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Access, correct, or delete your personal data.</li>
                <li>Opt out of marketing communications.</li>
                <li>Request a copy of your data in a portable format.</li>
                <li>Withdraw consent for SMS alerts at any time.</li>
              </ul>
              <p className="mt-2">To exercise these rights, <a href="/contact" className="text-pulse-green hover:underline font-medium">contact us here</a>.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">8. Cookies</h2>
              <p>
                We use essential cookies for authentication and session management. We do not use third-party
                advertising or tracking cookies.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. We will notify you of material changes via email
                or an in-app notice. Continued use of the service after changes constitutes acceptance.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mt-8 mb-3">10. Contact</h2>
              <p>
                Questions about this policy? <a href="/contact" className="text-pulse-green hover:underline font-medium">Get in touch</a>.
              </p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
