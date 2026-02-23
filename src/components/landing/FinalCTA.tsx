import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NewsletterSignup } from "@/components/shared/NewsletterSignup";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          The quants are watching. <span className="gradient-text">Are you?</span>
        </h2>
        <p className="text-lg text-pulse-muted max-w-2xl mx-auto mb-8 leading-relaxed">
          Every recession in the last 50 years was preceded by the exact indicators we track.
          28 signals across 8 categories — free to access. The question isn&apos;t <em>if</em> the
          next downturn is coming — it&apos;s <em>when</em>. Be positioned before it arrives.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto">
              Start free today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/#indicators">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              See all 28 signals
            </Button>
          </Link>
        </div>

        <p className="text-xs text-pulse-muted mb-12">
          Free forever. Paid plans from $6.99/mo. Not investment advice.
        </p>

        {/* Free newsletter signup */}
        <div className="max-w-lg mx-auto bg-pulse-card border border-pulse-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Free Weekly Recession Report
          </h3>
          <p className="text-sm text-pulse-muted mb-4">
            Not ready to sign up? Get our free weekly analysis in your inbox.
          </p>
          <NewsletterSignup />
        </div>
      </div>
    </section>
  );
}
