import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const today = new Date().toISOString();

const posts = [
  {
    slug: "primary-recession-indicators-february-2026",
    title: "Primary Recession Indicators: The Conflicting Signals of February 2026",
    excerpt:
      "The Sahm Rule sits at 0.30, yield curves have un-inverted, and the Conference Board LEI has triggered its 3Ds recession signal. We break down what every primary indicator is telling us right now.",
    meta_description:
      "Analysis of primary recession indicators for February 2026 including the Sahm Rule, yield curves, unemployment, manufacturing employment, and the Conference Board LEI.",
    keywords: [
      "recession indicators 2026",
      "sahm rule",
      "yield curve",
      "unemployment rate",
      "conference board lei",
      "recession probability",
      "manufacturing employment",
    ],
    content_type: "weekly_report",
    status: "published",
    published_at: today,
    content: `## The Big Picture

February 2026 presents one of the most unusual macro environments in recent memory. Primary recession indicators are split almost evenly between safe, watch, and warning territory — a pattern that historically precedes either a narrow miss or a slow-rolling downturn.

Of the 12 primary indicators we track, **1 is in danger territory, 4 are flashing warnings, and 7 are on watch**. None are fully safe. That's a meaningful deterioration from six months ago.

---

## Sahm Rule: 0.30 — Safe but Elevated

The Sahm Rule currently reads **0.30**, declining from its August 2024 peak of 0.57. The trigger threshold is 0.50 — a level that, once breached, has preceded every U.S. recession since 1970.

At 0.30, we're below the danger zone but still elevated relative to expansion-era norms (typically 0.05–0.15). The decline from 0.57 is encouraging, but the rate of improvement has stalled over the past three months. If unemployment ticks up from the current 4.1% to 4.3–4.4%, the Sahm Rule could re-approach its trigger.

**Verdict:** Safe, but the margin of safety is thin.

---

## Yield Curves: Un-Inverted, and That's Not Necessarily Good

The 2s10s spread has steepened to **+70 bps** — the widest since 2021. The 2s30s spread is even wider at **+139 bps**, the steepest since November 2021.

Here's the catch: yield curve un-inversion has historically preceded recessions by 6–18 months. The inversion was the warning; the steepening is often the *arrival*. The curve is steep because markets are pricing in aggressive rate cuts — which typically happen *because* the economy is weakening.

We're now in the window where the lag effect of the prior inversion could materialize. Every recession since 1970 was preceded by an inversion that later un-inverted before the downturn began.

**Verdict:** Watch. The steepening itself is the signal.

---

## Conference Board LEI: -0.3% — DANGER

The Conference Board's Leading Economic Index fell **-0.3%** in the latest reading, and its 3Ds Rule has been triggered since August 2025. The 3Ds Rule requires the LEI to show *Duration* (sustained decline), *Depth* (sufficient magnitude), and *Diffusion* (broad-based weakness).

All three conditions are met. This indicator has a strong track record — when all three D's fire simultaneously, a recession has followed within 12 months in 7 of the last 8 instances.

**Verdict:** Danger. This is the most concerning primary signal right now.

---

## Labor Market: Cracks Beneath the Surface

On the surface, the labor market looks okay. Unemployment at **4.1%** and initial claims at **230K** suggest stability. But dig deeper:

- **JOLTS Quits Rate: 2.0%** — Workers aren't quitting, which means they're afraid. The quits rate has fallen to its pre-pandemic floor, a level associated with labor market anxiety.
- **Temporary Help Services: 2,750K** — Temp jobs have been declining for months. This is historically the earliest labor market recession signal — employers cut temp workers before making permanent layoffs.
- **SOS Recession Indicator: 0.12** — The insured unemployment rate is ticking up and approaching its trigger level.

Manufacturing employment has fallen to **12.6M**, below trend and in "watch" territory. The NY Fed recession probability model sits at **18.8%** — below the 50% threshold but rising.

**Verdict:** The headline numbers are fine. The internals are deteriorating.

---

## What It All Means

The primary indicators paint a picture of an economy in late-cycle: not yet in recession, but with the preconditions in place. The Conference Board LEI trigger, declining temp jobs, a frozen quits rate, and the yield curve's post-inversion steepening are all classic pre-recession signatures.

The bull case: the Sahm Rule is declining, claims are stable, and unemployment hasn't spiked. If the Fed begins cutting in Q2 2026, these leading indicators could stabilize.

The bear case: the LEI has a near-perfect track record once all 3Ds fire. Temp jobs are falling. Workers are frozen. These are the patterns that precede every modern recession — the question is timing, not direction.

**Our assessment: Watch closely. The data says "late cycle, not yet recession" — but the window for a soft landing is narrowing.**`,
  },
  {
    slug: "secondary-indicators-consumer-confidence-fed-rates-february-2026",
    title: "Consumer Confidence, Fed Policy & GDP: What Secondary Indicators Reveal in February 2026",
    excerpt:
      "Consumer sentiment sits at 64.7, the Fed holds rates at 4.50%, and GDP growth has slowed to 2.1%. Plus: JPMorgan's recession model has climbed to 35%. A deep dive into the signals behind the headlines.",
    meta_description:
      "Deep dive into secondary recession indicators for February 2026: consumer sentiment, Fed funds rate, GDP growth, JPMorgan recession probability, and housing.",
    keywords: [
      "consumer sentiment 2026",
      "fed funds rate",
      "gdp growth forecast",
      "jpm recession probability",
      "housing starts",
      "building permits",
      "recession risk",
    ],
    content_type: "deep_dive",
    status: "published",
    published_at: today,
    content: `## Beyond the Headlines

While primary indicators track the structural backbone of the economy — yield curves, employment, industrial output — secondary indicators tell us how *people and institutions* are reacting. Consumer confidence, Fed policy, housing, and business sentiment are the transmission mechanisms that turn slow deterioration into actual contraction.

In February 2026, the secondary picture is consistently cautious. No indicator is screaming panic, but none are screaming confidence either.

---

## Consumer Sentiment: 64.7 — Warning Territory

The University of Michigan Consumer Sentiment Index has fallen to **64.7**, firmly in warning territory. The recessionary threshold is 60 — we're close.

This matters because consumer spending is roughly 70% of U.S. GDP. When consumers are pessimistic, they pull back on discretionary spending, delay large purchases, and increase precautionary saving (if they can). The problem is that many can't — more on that in the credit section.

The current reading of 64.7 is notable because it's persisted below 70 for months, which suggests this isn't a sentiment dip but a sustained shift in expectations. Consumers are telling us they expect worse conditions ahead.

**Historical context:** Consumer sentiment fell below 65 before the 2001 and 2008 recessions. It's not a perfect predictor — sentiment dropped sharply during the 2022 inflation scare without a recession — but when paired with weakening labor internals, it carries more weight.

---

## Fed Funds Rate: 4.50% — Still Restrictive

The Fed holds rates at **4.50%**, well above the neutral rate most economists estimate at 2.5–3.0%. This means monetary policy is still actively slowing the economy.

The critical question: will the Fed cut before the lag effects of high rates cause real damage?

Historical precedent isn't encouraging. The Fed has a pattern of holding rates too high for too long, then cutting aggressively once the damage is visible — by which point the recession is already underway. The 2007 and 2019 cutting cycles both began after leading indicators had already turned.

Markets are currently pricing in 3–4 cuts by year-end 2026, starting in Q2. If the Fed delivers, it could short-circuit the recession risk. If they wait for "more data," the window for a soft landing closes.

**Verdict:** The rate itself isn't dangerous — it's the duration of restrictive policy that creates risk.

---

## GDP Growth: 2.1% — Slowing but Positive

Real GDP growth has slowed to **2.1%**, down from 2.8% in 2024. The Atlanta Fed GDPNow tracker shows real-time growth at **1.8%**, below consensus.

Growth is positive, which is the good news. But the trajectory matters more than the level. The economy is decelerating, and the deceleration is broadening — it's not just one sector dragging things down.

**Key concern:** GDP is a lagging indicator. By the time GDP turns negative, you're typically already 2–3 months into a recession. The leading indicators we track (LEI, yield curve, temp jobs) are designed to catch the turn before GDP does.

---

## JPMorgan Recession Probability: 35%

JPMorgan's proprietary recession model now estimates a **35%** probability of recession within 12 months, up from roughly 25% in mid-2025.

For context, this model exceeded 50% before both the 2001 and 2008 recessions. At 35%, we're in the "elevated risk" zone — not a base case, but well above the 10–15% probability that prevails during healthy expansions.

The climb from 25% to 35% in six months is the trend worth watching. If it crosses 40% in the next quarter, markets will likely begin pricing recession risk more aggressively.

---

## Housing: The Slow-Motion Squeeze

Housing is a reliable leading indicator because it's the most rate-sensitive sector:

- **Building Permits: 1,483K** — Below trend and at the lowest level since pandemic-era shutdowns. This signals that homebuilders are pulling back on new projects, which means less construction employment and spending downstream.
- **Housing Starts: 1,366K** — Down 9.8% from the prior month. Starts typically lead the broader economy by 3–5 quarters.

The housing market is caught between still-elevated mortgage rates (above 6%) and limited supply. The result is frozen transaction volume, declining permits, and growing pressure on construction employment.

**Verdict:** Housing isn't crashing — it's seizing up. And a seized housing market eventually becomes a drag on GDP through reduced construction, lower consumer wealth effects, and declining durable goods demand.

---

## The Secondary Verdict

Secondary indicators confirm the message from the primary dashboard: the economy is late-cycle and decelerating. Consumer confidence is weak, monetary policy is still restrictive, GDP is slowing, housing is frozen, and Wall Street's recession models are climbing.

None of these individually guarantees a recession. But collectively, they describe an economy with diminishing resilience — one where a single shock (geopolitical event, financial accident, trade disruption) could tip the balance.

**The overarching theme: the economy isn't broken, but its shock absorbers are depleted.**`,
  },
  {
    slug: "market-liquidity-signals-february-2026",
    title: "Liquidity Crisis Brewing? Market & Liquidity Indicators Sound the Alarm in February 2026",
    excerpt:
      "The ON RRP facility is 97% depleted, banks sit on ~$500B in unrealized losses, and the U.S. government's interest bill approaches $1 trillion. Here's what market and liquidity indicators are warning about.",
    meta_description:
      "Market and liquidity recession indicators analysis for February 2026: NFCI, credit spreads, VIX, dollar index, ON RRP depletion, bank unrealized losses, and US interest expense.",
    keywords: [
      "liquidity crisis 2026",
      "on rrp facility",
      "bank unrealized losses",
      "credit spreads",
      "vix",
      "dollar index",
      "us interest expense",
      "financial conditions",
    ],
    content_type: "market_commentary",
    status: "published",
    published_at: today,
    content: `## The Plumbing Matters

Most recession analysis focuses on the real economy — jobs, output, spending. But recessions are often *triggered* by financial plumbing failures: liquidity drying up, credit spreads blowing out, or a systemic shock that turns a slowdown into a crisis.

In February 2026, the real economy indicators say "late cycle." The market and liquidity indicators are more concerning — they suggest the financial system's safety nets have been quietly eroded.

---

## Market Indicators: Calm Surface, Undertow Below

### Chicago Fed NFCI: -0.32 — Loose

The National Financial Conditions Index reads **-0.32**, indicating financial conditions are still accommodative (below zero = loose). This is the most reassuring signal in the entire dashboard.

But the NFCI is a coincident indicator — it tells you where conditions *are*, not where they're *going*. Financial conditions were loose in mid-2007 and early 2020. Conditions go from loose to tight very quickly when credit events occur.

### Credit Spreads (HY OAS): ~320 bps — Watch

High-yield credit spreads have widened to approximately **320 bps** over Treasuries. The stress threshold is 500 bps — we're not there yet, but the direction is concerning.

The widening from ~250 bps six months ago reflects growing market anxiety about corporate credit quality. If spreads cross 400 bps, it typically signals that credit markets are pricing in recession risk. At 500+ bps, it indicates active credit stress and potential for a self-reinforcing downturn as borrowing costs spike for weaker companies.

### VIX: 18.2 — Complacency Zone

The VIX at **18.2** suggests markets are relatively calm. Below 20 is generally considered low volatility. This is actually a *warning* in disguise — extreme complacency often precedes volatility spikes. The VIX was below 15 in January 2020.

Markets don't crash from high-fear environments; they crash from low-fear environments where risks are being underpriced.

### DXY Dollar Index: ~96-97 — Warning

The U.S. Dollar Index has fallen to **5-year lows** around 96-97, with **14-year record speculative short positioning** against the dollar.

A weakening dollar can be benign (reflecting a healthy global risk appetite) or alarming (reflecting capital flight from U.S. assets). In the current context — with fiscal deficits expanding and Treasury issuance surging — the weakness leans toward the concerning interpretation.

If the dollar sell-off accelerates, it could trigger forced selling of U.S. assets by foreign holders, tightening financial conditions abruptly.

### Emerging Markets: +33.6% — Outperforming

Emerging markets are having their **best year relative to developed markets since 2017**, up 33.6%. This is a classic late-cycle pattern — capital rotates out of expensive U.S. assets into cheaper EM as the U.S. cycle matures.

This isn't a recession signal per se, but it confirms where we are in the cycle: late, expensive, and vulnerable to mean reversion.

---

## Liquidity Indicators: The Safety Nets Are Gone

This is where the picture gets genuinely alarming. One by one, the financial system's liquidity buffers have been depleted.

### M2 Money Supply: Stagnant

The broadest measure of money supply — M2 — has flatlined. Growth that was running at 25%+ during the pandemic stimulus era has collapsed to near zero. The money that exists in the system is being absorbed by massive Treasury issuance to fund the federal deficit.

Less money growth = less fuel for economic activity. This isn't deflationary yet, but it's dis-inflationary, and it removes the liquidity cushion that normally supports asset prices during slowdowns.

### ON RRP Facility: ~$80B — 97% Depleted

The Overnight Reverse Repo facility has fallen from over **$2.5 trillion** at its 2023 peak to roughly **$80 billion**. It's 97% depleted.

The ON RRP served as a crucial liquidity buffer — a parking lot for excess cash in the financial system. Its depletion means there's essentially no spare liquidity sloshing around anymore. Every dollar is spoken for.

This matters because when a stress event occurs, the system used to have trillions in ON RRP that could be redeployed. Now that buffer is gone. The next liquidity shock will hit a system with no spare cash.

### Bank Unrealized Losses: ~$500B

U.S. banks are sitting on approximately **$500 billion in unrealized losses** on their bond portfolios — a legacy of buying long-duration bonds at low rates that are now underwater.

These losses are "unrealized" only as long as banks don't have to sell. But if depositors flee (as happened with Silicon Valley Bank in 2023), banks are forced to crystallize these losses, potentially triggering a cascade.

The banking system is not in crisis today. But it's structurally fragile — a confidence event, deposit run, or liquidity squeeze could force selling and turn unrealized losses into real ones.

### US Interest Expense: ~$950B/yr — Approaching $1 Trillion

The federal government now spends nearly **$950 billion per year** on interest payments alone — the fastest-growing line item in the federal budget. At current trajectories, it will exceed $1 trillion before the end of 2026.

This creates a fiscal doom loop: higher deficits require more borrowing, which increases interest costs, which increases deficits, which requires more borrowing. The only exits are growth (unlikely at current levels), inflation (politically toxic), or austerity (economically contractionary).

More immediately, massive Treasury issuance to fund these deficits competes with the private sector for capital, crowding out corporate borrowing and suppressing the M2 money supply.

---

## The Liquidity Verdict

The market indicators present a split picture: financial conditions are still technically loose, but the underlying infrastructure is fragile. Credit spreads are widening. The dollar is weak. Volatility is low — possibly too low.

The liquidity indicators are more unambiguous: **every major safety net has been depleted or compromised**. The ON RRP is gone. Banks are sitting on half a trillion in losses. The government is approaching $1T in annual interest. M2 is flat.

This doesn't guarantee a crisis. But it means the next shock — whatever it is — will hit a system with no spare capacity. In 2008, the plumbing broke before the real economy did. In 2020, the Fed could flood the system with liquidity because there was room. In 2026, that room is gone.

**Our assessment: The liquidity setup is the single most underappreciated risk in the current environment. The real economy is late-cycle. The financial plumbing is running on fumes.**`,
  },
];

async function seed() {
  console.log("Inserting 3 blog posts...");

  for (const post of posts) {
    const { data, error } = await supabase
      .from("blog_posts")
      .upsert(post, { onConflict: "slug" })
      .select("slug, title")
      .single();

    if (error) {
      console.error(`Failed to insert "${post.slug}":`, error.message);
    } else {
      console.log(`Published: ${data.title}`);
    }
  }

  console.log("\nDone! Visit /blog to see the articles.");
}

seed();
