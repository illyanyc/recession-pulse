"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, Loader2 } from "lucide-react";

type Tier = "free" | "pulse" | "pulse_pro";

const TIER_LABEL: Record<Tier, string> = {
  free: "Free",
  pulse: "Pulse",
  pulse_pro: "Pulse Pro",
};

const TIER_STYLE: Record<Tier, string> = {
  free: "text-pulse-yellow border-pulse-yellow/20 bg-pulse-yellow/5 hover:bg-pulse-yellow/10",
  pulse: "text-pulse-green border-pulse-green/20 bg-pulse-green/5 hover:bg-pulse-green/10",
  pulse_pro: "text-pulse-green border-pulse-green/20 bg-pulse-green/5 hover:bg-pulse-green/10",
};

export function NavPlanBadge() {
  const [tier, setTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.subscription_tier) setTier(data.subscription_tier as Tier);
          else setTier("free");
        });
    });
  }, []);

  async function handleClick() {
    setLoading(true);
    try {
      if (tier === "free") {
        window.location.href = "/#pricing";
        return;
      }
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      window.location.href = "/settings";
    } finally {
      setLoading(false);
    }
  }

  if (!tier) return null;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${TIER_STYLE[tier]}`}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <CreditCard className="h-3 w-3" />
      )}
      {TIER_LABEL[tier]}
    </button>
  );
}
