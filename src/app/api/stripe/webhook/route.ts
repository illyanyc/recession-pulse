import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendSMS } from "@/lib/sms";
import { sendEmail, buildWelcomeEmail } from "@/lib/resend";
import { formatConfirmationSMS, formatWelcomeSMS } from "@/lib/message-formatter";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan as "pulse" | "pulse_pro";

      if (userId && session.subscription) {
        const subscription = await getStripe().subscriptions.retrieve(
          session.subscription as string
        );

        // Upsert subscription
        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0].price.id,
          plan,
          status: "active",
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }, { onConflict: "stripe_subscription_id" });

        // Update profile tier
        await supabase
          .from("profiles")
          .update({
            subscription_tier: plan,
            stripe_subscription_id: subscription.id,
          })
          .eq("id", userId);

        // Send welcome messages
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profile) {
          // Queue welcome SMS
          if (profile.phone && profile.sms_enabled) {
            await supabase.from("message_queue").insert({
              user_id: userId,
              message_type: "welcome",
              channel: "sms",
              recipient: profile.phone,
              content: formatWelcomeSMS(),
              scheduled_for: new Date().toISOString(),
            });

            // Also queue confirmation
            await supabase.from("message_queue").insert({
              user_id: userId,
              message_type: "confirmation",
              channel: "sms",
              recipient: profile.phone,
              content: formatConfirmationSMS(plan === "pulse_pro" ? "Pulse Pro" : "Pulse"),
              scheduled_for: new Date().toISOString(),
            });
          }

          // Send welcome email
          if (profile.email) {
            const { subject, html } = buildWelcomeEmail(profile.full_name);
            await sendEmail({ to: profile.email, subject, html });
          }

          // Notify owner of new subscriber
          await notifyOwner(
            `NEW SUBSCRIBER\n\n${profile.full_name || "Unknown"}\n${profile.email}\nPlan: ${plan === "pulse_pro" ? "Pulse Pro ($9.99)" : "Pulse ($6.99)"}\n\nTotal: check dashboard`
          );
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;

      if (userId) {
        const plan = subscription.metadata?.plan as "pulse" | "pulse_pro" || "pulse";

        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status as string,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            plan,
          })
          .eq("stripe_subscription_id", subscription.id);

        // Update profile tier
        const tier = subscription.status === "active" ? plan : "free";
        await supabase
          .from("profiles")
          .update({ subscription_tier: tier })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;

      if (userId) {
        // Get profile before updating
        const { data: cancelProfile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", userId)
          .single();

        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        await supabase
          .from("profiles")
          .update({ subscription_tier: "free", stripe_subscription_id: null })
          .eq("id", userId);

        // Notify owner of cancellation
        await notifyOwner(
          `SUBSCRIPTION CANCELED\n\n${cancelProfile?.full_name || "Unknown"}\n${cancelProfile?.email}\nPlan: ${subscription.metadata?.plan || "unknown"}\n\nReason: voluntary cancellation`
        );
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function notifyOwner(message: string) {
  const ownerPhone = process.env.OWNER_PHONE_NUMBER;
  if (!ownerPhone) return;

  try {
    await sendSMS(ownerPhone, message);
  } catch (error) {
    console.error("Failed to notify owner:", error);
  }
}
