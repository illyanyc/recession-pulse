"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is the Sahm Rule?",
    answer:
      "The Sahm Rule identifies recessions when the 3-month moving average of the national unemployment rate rises 0.50 percentage points or more above its low from the previous 12 months. Created by economist Claudia Sahm, it has correctly signaled every recession since 1970 in real time. RecessionPulse tracks this indicator daily.",
  },
  {
    question: "What does yield curve inversion mean for recession?",
    answer:
      "Yield curve inversion occurs when short-term interest rates exceed long-term rates. The 2-year/10-year Treasury spread inverting has preceded every US recession since 1955, with only one false signal. Historically, recessions follow 6–18 months after un-inversion (when the curve steepens back to normal). RecessionPulse tracks both the 2s10s and 2s30s spreads.",
  },
  {
    question: "What is the Conference Board LEI 3Ds Rule?",
    answer:
      "The 3Ds Rule evaluates three conditions in the Conference Board Leading Economic Index: Depth (6-month growth rate below -4.3%), Diffusion (more than half of components declining), and Duration (sustained decline over multiple months). When all three trigger simultaneously, historical recession probability exceeds 85%.",
  },
  {
    question: "What is the ON RRP Facility and why does it matter?",
    answer:
      "The Overnight Reverse Repo (ON RRP) Facility is the Federal Reserve's mechanism for absorbing excess liquidity from the financial system. When ON RRP balances decline sharply, it signals that the liquidity buffer in the financial system is thinning. Near-zero levels mean banks and money-market funds have less margin of safety during market stress.",
  },
  {
    question: "What indicators does RecessionPulse track?",
    answer:
      "RecessionPulse monitors key recession indicators daily including: the Sahm Rule, Yield Curve spreads (2s10s and 2s30s), Conference Board LEI, ON RRP Facility levels, DXY Dollar Index, Emerging Market performance, JPMorgan recession probability, GDP growth forecasts, credit spreads, ISM Manufacturing PMI, bank unrealized losses, US interest expense, and M2 money supply.",
  },
  {
    question: "How much does RecessionPulse cost?",
    answer:
      "RecessionPulse offers two plans: Pulse at $9.99/month (daily SMS and email alerts with all recession indicators) and Pulse Pro at $14.99/month (adds daily stock screener alerts for stocks below 200 EMA with RSI <30 and P/E <15). Cancel anytime. No contracts.",
  },
  {
    question: "Is RecessionPulse investment advice?",
    answer:
      "No. RecessionPulse is strictly an informational service. We aggregate publicly available economic data and present it in a clear format. Nothing we provide constitutes investment advice, financial advice, or a recommendation to buy or sell any security. Always consult a qualified financial advisor before making investment decisions.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-pulse-dark/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Frequently asked <span className="gradient-text">questions</span>
          </h2>
          <p className="text-pulse-muted text-lg">
            Everything you need to know about recession indicators and RecessionPulse.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-pulse-border bg-pulse-card/50 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-pulse-card/80 transition-colors"
                aria-expanded={openIndex === i}
              >
                <span className="text-sm font-semibold text-white pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-pulse-muted shrink-0 transition-transform duration-200",
                    openIndex === i && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-200 ease-in-out",
                  openIndex === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-pulse-muted leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
