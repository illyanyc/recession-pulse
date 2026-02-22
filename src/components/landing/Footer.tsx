import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-pulse-border bg-pulse-darker py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="RecessionPulse" width={24} height={24} className="rounded" />
              <span className="text-xl font-bold text-white">RecessionPulse</span>
            </div>
            <p className="text-sm text-pulse-muted max-w-sm leading-relaxed">
              Real-time recession indicators delivered to your phone daily.
              Stay ahead of the market with data-driven signals.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#features" className="text-sm text-pulse-muted hover:text-pulse-green transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-sm text-pulse-muted hover:text-pulse-green transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#indicators" className="text-sm text-pulse-muted hover:text-pulse-green transition-colors">
                  Indicators
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-pulse-muted hover:text-pulse-green transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-pulse-muted hover:text-pulse-green transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-pulse-muted hover:text-pulse-green transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-sm text-pulse-muted hover:text-pulse-green transition-colors">
                  Investment Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-pulse-muted hover:text-pulse-green transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-pulse-border">
          <p className="text-xs text-pulse-muted leading-relaxed max-w-4xl mb-4">
            <strong>Disclaimer:</strong> RecessionPulse is for informational and educational purposes only.
            Nothing on this site constitutes investment advice, financial advice, or a recommendation to buy
            or sell any security. Past indicator readings do not guarantee future results. Always consult a
            qualified financial advisor before making investment decisions.
            See our full <Link href="/disclaimer" className="text-pulse-green hover:underline">Investment Disclaimer</Link>.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-pulse-muted">
              &copy; {new Date().getFullYear()} RecessionPulse. Data sourced from FRED, Treasury, and public APIs.
            </p>
            <p className="text-xs text-pulse-muted">
              Built for investors who think in probabilities, not certainties.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
