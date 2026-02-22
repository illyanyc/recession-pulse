import { Activity } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-pulse-border bg-pulse-darker py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-6 w-6 text-pulse-green" />
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
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-pulse-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-pulse-muted">
            &copy; {new Date().getFullYear()} RecessionPulse. Not financial advice.
            Data sourced from FRED, Treasury, and public APIs.
          </p>
          <p className="text-xs text-pulse-muted">
            Built for investors who think in probabilities, not certainties.
          </p>
        </div>
      </div>
    </footer>
  );
}
