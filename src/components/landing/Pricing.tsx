"use client";

import { Button } from "@/components/ui/Button";
import { PLANS } from "@/types";
import { Check, Zap } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple pricing. <span className="gradient-text">Serious edge.</span>
          </h2>
          <p className="text-pulse-muted text-lg max-w-xl mx-auto">
            Less than the cost of one trade commission. Know what&apos;s coming before the crowd.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Pulse Plan */}
          <div className="rounded-2xl border border-pulse-border bg-pulse-card p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-1">{PLANS.pulse.name}</h3>
              <p className="text-sm text-pulse-muted">{PLANS.pulse.description}</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">${PLANS.pulse.price}</span>
                <span className="text-pulse-muted">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {PLANS.pulse.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-pulse-green shrink-0 mt-0.5" />
                  <span className="text-sm text-pulse-text">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/signup?plan=pulse">
              <Button variant="secondary" size="lg" className="w-full">
                Get started
              </Button>
            </Link>
          </div>

          {/* Pulse Pro Plan */}
          <div className="relative rounded-2xl border-2 border-pulse-green/30 bg-pulse-card p-8 flex flex-col glow-green">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pulse-green text-pulse-darker text-xs font-bold">
                <Zap className="h-3 w-3" />
                MOST POPULAR
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-1">{PLANS.pulse_pro.name}</h3>
              <p className="text-sm text-pulse-muted">{PLANS.pulse_pro.description}</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">${PLANS.pulse_pro.price}</span>
                <span className="text-pulse-muted">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {PLANS.pulse_pro.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-pulse-green shrink-0 mt-0.5" />
                  <span className="text-sm text-pulse-text">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/signup?plan=pulse_pro">
              <Button size="lg" className="w-full">
                Get Pulse Pro
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-pulse-muted mt-8">
          Cancel anytime. No contracts. No hidden fees.
        </p>
      </div>
    </section>
  );
}
