import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Don&apos;t get caught off guard.
        </h2>
        <p className="text-lg text-pulse-muted max-w-2xl mx-auto mb-8 leading-relaxed">
          Every recession in the last 50 years was preceded by the exact indicators we track.
          The question isn&apos;t <em>if</em> the next one is coming — it&apos;s <em>when</em>.
          Be the one who sees it first.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto">
              Start monitoring today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/#indicators">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              See current signals
            </Button>
          </Link>
        </div>

        <p className="text-xs text-pulse-muted">
          Cancel anytime. No contracts. Not investment advice.
        </p>
      </div>
    </section>
  );
}
