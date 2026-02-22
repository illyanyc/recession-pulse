import Image from "next/image";
import Link from "next/link";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-pulse-border bg-pulse-darker py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="RecessionPulse" width={24} height={24} className="rounded" />
              <span className="text-xl font-bold text-white">RecessionPulse</span>
            </div>
            <p className="text-sm text-pulse-muted max-w-sm leading-relaxed mb-4">
              Real-time recession indicators delivered to your phone daily.
              Stay ahead of the market with data-driven signals.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/RecessionPulse"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pulse-muted hover:text-pulse-green transition-colors"
                aria-label="Follow on X/Twitter"
              >
                <XIcon className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/company/recessionpulse"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pulse-muted hover:text-pulse-green transition-colors"
                aria-label="Follow on LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
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
                <Link href="/indicators" className="text-sm text-pulse-muted hover:text-pulse-green transition-colors">
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
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-sm text-pulse-muted hover:text-pulse-green transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/indicators" className="text-sm text-pulse-muted hover:text-pulse-green transition-colors">
                  All Indicators
                </Link>
              </li>
              <li>
                <Link href="/indicators/sahm-rule" className="text-sm text-pulse-muted hover:text-pulse-green transition-colors">
                  Sahm Rule
                </Link>
              </li>
              <li>
                <Link href="/indicators/yield-curve-2s10s" className="text-sm text-pulse-muted hover:text-pulse-green transition-colors">
                  Yield Curve
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
