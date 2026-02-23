"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PLANS } from "@/types";
import type { Subscription, UserProfile } from "@/types";
import { CreditCard, Zap } from "lucide-react";
import { useState } from "react";

interface SubscriptionStatusProps {
  profile: UserProfile;
  subscription: Subscription | null;
}

export function SubscriptionStatus({ profile, subscription }: SubscriptionStatusProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const planInfo = profile.subscription_tier === "pulse_pro"
    ? PLANS.pulse_pro
    : profile.subscription_tier === "pulse"
    ? PLANS.pulse
    : null;

  async function handleManageBilling() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) throw new Error("Failed to open billing portal");
      const { url } = await res.json();
      if (!url) throw new Error("No portal URL returned");
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open billing portal. Please try again.");
      setLoading(false);
    }
  }

  async function handleCheckout(plan: "pulse" | "pulse_pro") {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error("Failed to start checkout");
      const { url } = await res.json();
      if (!url) throw new Error("No checkout URL returned");
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout. Please try again.");
      setLoading(false);
    }
  }

  if (!subscription || profile.subscription_tier === "free") {
    return (
      <Card className="border-pulse-yellow/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-pulse-yellow/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-pulse-yellow" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">Free Plan</h3>
            <p className="text-sm text-pulse-muted mb-4">
              You&apos;re viewing the dashboard for free. Subscribe to get daily SMS alerts
              and stay ahead of the market.
            </p>
            <div className="flex gap-3">
              <Button size="sm" onClick={() => handleCheckout("pulse")} loading={loading}>
                Pulse — $6.99/mo
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleCheckout("pulse_pro")} loading={loading}>
                Pulse Pro — $9.99/mo
              </Button>
            </div>
            {error && (
              <p className="text-xs text-pulse-red mt-3">{error}</p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-pulse-green/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-pulse-green" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{planInfo?.name} Plan</h3>
              <span className="px-2 py-0.5 rounded-full bg-pulse-green/10 text-pulse-green text-xs font-semibold">
                Active
              </span>
            </div>
            <p className="text-sm text-pulse-muted mt-1">
              ${planInfo?.price}/month · Renews{" "}
              {subscription.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString()
                : "soon"}
            </p>
            {subscription.cancel_at_period_end && (
              <p className="text-xs text-pulse-yellow mt-1">
                Cancels at end of billing period
              </p>
            )}
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={handleManageBilling} loading={loading}>
          Manage billing
        </Button>
      </div>
      {error && (
        <p className="text-xs text-pulse-red mt-3">{error}</p>
      )}
    </Card>
  );
}
