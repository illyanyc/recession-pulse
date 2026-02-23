"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, BarChart3, Bell, Shield } from "lucide-react";
import Link from "next/link";

const pricingPills = [
  { label: "Dashboard", detail: "Free forever", href: "/signup" },
  { label: "SMS & Email Alerts", detail: "$6.99/mo", href: "/signup?plan=pulse" },
  { label: "Stock Picks + Indicators", detail: "$9.99/mo", href: "/signup?plan=pulse_pro" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(240,145,58,0.07) 0%, rgba(240,145,58,0.02) 40%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pulse-green/20 bg-pulse-green/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-pulse-green animate-pulse" />
          <span className="text-pulse-green text-sm font-medium">42 indicators tracked live</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="text-white">Think like a quant.</span>
          <br />
          <span className="gradient-text">Prepare for what&apos;s next.</span>
        </h1>

        <p className="text-lg sm:text-xl text-pulse-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          42 recession and macro indicators from FRED, Treasury, and financial APIs — analyzed
          daily. The same signals Wall Street quant desks monitor, in your pocket.
          <span className="text-white font-medium"> Free to start.</span>
        </p>

        {/* Pricing pills */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          {pricingPills.map((pill) => (
            <Link
              key={pill.label}
              href={pill.href}
              className="group flex items-center gap-3 px-5 py-3 rounded-xl border border-pulse-border bg-pulse-card/50 hover:border-pulse-green/30 hover:bg-pulse-card transition-all"
            >
              <div>
                <div className="text-sm font-semibold text-white">{pill.label}</div>
                <div className="text-xs text-pulse-green font-medium">{pill.detail}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-pulse-muted group-hover:text-pulse-green transition-colors" />
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto">
              Start free — no credit card
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              View live dashboard
            </Button>
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { icon: BarChart3, label: "42 macro indicators" },
            { icon: Bell, label: "SMS & email alerts" },
            { icon: Shield, label: "Recession-proof positioning" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pulse-card border border-pulse-border"
            >
              <Icon className="h-4 w-4 text-pulse-green" />
              <span className="text-sm text-pulse-text">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
