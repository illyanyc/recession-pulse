import Image from "next/image";
import Link from "next/link";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const FOOTER_INDICATORS = {
  primary: [
    { slug: "sahm-rule", label: "Sahm Rule" },
    { slug: "yield-curve-2s10s", label: "Yield Curve 2s10s" },
    { slug: "yield-curve-2s30s", label: "Yield Curve 2s30s" },
    { slug: "conference-board-lei", label: "Conference Board LEI" },
    { slug: "ism-manufacturing", label: "ISM Manufacturing" },
    { slug: "unemployment-rate", label: "Unemployment Rate" },
  ],
  secondary: [
    { slug: "initial-claims", label: "Jobless Claims" },
    { slug: "consumer-sentiment", label: "Consumer Sentiment" },
    { slug: "fed-funds-rate", label: "Fed Funds Rate" },
    { slug: "gdp-growth", label: "GDP Growth" },
    { slug: "jpm-recession-probability", label: "JPM Recession Prob" },
  ],
  liquidity: [
    { slug: "m2-money-supply", label: "M2 Money Supply" },
    { slug: "on-rrp-facility", label: "ON RRP Facility" },
    { slug: "bank-unrealized-losses", label: "Bank Losses" },
    { slug: "us-interest-expense", label: "Interest Expense" },
  ],
  market: [
    { slug: "dxy-dollar-index", label: "DXY Dollar Index" },
    { slug: "credit-spreads", label: "Credit Spreads" },
    { slug: "emerging-markets", label: "Emerging Markets" },
  ],
};

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-xs text-pulse-muted hover:text-pulse-green transition-colors">
        {children}
      </Link>
    </li>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-pulse-border bg-pulse-darker py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top section: Brand + navigation */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo-transparent.png" alt="RecessionPulse" width={48} height={26} />
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

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2">
              <FooterLink href="/#features">Features</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/indicators">All Indicators</FooterLink>
              <FooterLink href="/dashboard">Dashboard</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
            </ul>
          </div>

          {/* Primary Indicators */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Primary Indicators</h4>
            <ul className="space-y-2">
              {FOOTER_INDICATORS.primary.map((ind) => (
                <FooterLink key={ind.slug} href={`/indicators/${ind.slug}`}>
                  {ind.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Secondary & Liquidity Indicators */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">More Indicators</h4>
            <ul className="space-y-2">
              {[...FOOTER_INDICATORS.secondary, ...FOOTER_INDICATORS.liquidity].map((ind) => (
                <FooterLink key={ind.slug} href={`/indicators/${ind.slug}`}>
                  {ind.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Market Indicators + Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Market Indicators</h4>
            <ul className="space-y-2">
              {FOOTER_INDICATORS.market.map((ind) => (
                <FooterLink key={ind.slug} href={`/indicators/${ind.slug}`}>
                  {ind.label}
                </FooterLink>
              ))}
            </ul>
            <h4 className="text-sm font-semibold text-white mb-3 mt-6">Legal</h4>
            <ul className="space-y-2">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/disclaimer">Disclaimer</FooterLink>
              <FooterLink href="/sla">99% Uptime SLA</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-pulse-border">
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
