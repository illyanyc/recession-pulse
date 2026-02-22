"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Subscription } from "@/types";

export function useSubscription(userId: string | undefined) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchSubscription() {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      setSubscription(data);
      setLoading(false);
    }

    fetchSubscription();
  }, [userId]);

  const isPulse = subscription?.plan === "pulse" || subscription?.plan === "pulse_pro";
  const isPulsePro = subscription?.plan === "pulse_pro";

  return { subscription, loading, isPulse, isPulsePro };
}
