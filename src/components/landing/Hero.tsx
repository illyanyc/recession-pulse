"use client";

import { Button } from "@/components/ui/Button";
import { Activity, ArrowRight, Shield, Smartphone } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-pulse-green/5 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pulse-green/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pulse-green/20 bg-pulse-green/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-pulse-green animate-pulse" />
          <span className="text-pulse-green text-sm font-medium">Live monitoring active</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="text-white">Know before the</span>
          <br />
          <span className="gradient-text">recession hits</span>
        </h1>

        <p className="text-lg sm:text-xl text-pulse-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          9 critical economic indicators analyzed daily and delivered to your phone.
          From the Sahm Rule to yield curves — stay ahead of the market.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto">
              Start monitoring — $9.99/mo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              View plans
            </Button>
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { icon: Smartphone, label: "Daily SMS alerts" },
            { icon: Activity, label: "9 key indicators" },
            { icon: Shield, label: "Recession-proof portfolio" },
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

        {/* Live indicator preview */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-pulse-card border border-pulse-border rounded-2xl p-1 shadow-2xl">
            <div className="bg-pulse-dark rounded-xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-pulse-red/60" />
                  <div className="w-3 h-3 rounded-full bg-pulse-yellow/60" />
                  <div className="w-3 h-3 rounded-full bg-pulse-green/60" />
                </div>
                <span className="text-xs text-pulse-muted font-mono">recession-pulse — live dashboard</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Sahm Rule", value: "0.30", status: "safe", emoji: "🟢", detail: "Below 0.50 trigger" },
                  { name: "Yield Curve 2s10s", value: "+70 bps", status: "watch", emoji: "🟡", detail: "Watch — post-inversion" },
                  { name: "Conf. Board LEI", value: "-0.3%", status: "warning", emoji: "⚠️", detail: "3Ds Rule triggered" },
                  { name: "ON RRP Facility", value: "~$80B", status: "warning", emoji: "⚠️", detail: "97% depleted" },
                  { name: "DXY Dollar", value: "~96", status: "warning", emoji: "⚠️", detail: "5-year lows" },
                  { name: "JPM Recession Prob", value: "35%", status: "watch", emoji: "🟡", detail: "Moderate risk" },
                ].map((indicator) => (
                  <div
                    key={indicator.name}
                    className={`rounded-lg border p-4 ${
                      indicator.status === "safe"
                        ? "border-pulse-green/20 bg-pulse-green/5"
                        : indicator.status === "watch"
                        ? "border-pulse-yellow/20 bg-pulse-yellow/5"
                        : "border-pulse-red/20 bg-pulse-red/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-pulse-muted">{indicator.name}</span>
                      <span>{indicator.emoji}</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-white">{indicator.value}</div>
                    <div className="text-xs text-pulse-muted mt-1">{indicator.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
