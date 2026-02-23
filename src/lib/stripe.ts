import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

export const STRIPE_PLANS = {
  pulse: {
    priceId: process.env.STRIPE_PULSE_PRICE_ID!,
    name: "Pulse",
    amount: 699,
  },
  pulse_pro: {
    priceId: process.env.STRIPE_PULSE_PRO_PRICE_ID!,
    name: "Pulse Pro",
    amount: 999,
  },
} as const;
