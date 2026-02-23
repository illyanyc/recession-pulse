import YahooFinance from "yahoo-finance2";
import { STOCK_SCREENER_CONFIG } from "./constants";
import type { StockSignal } from "@/types";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

function calculateRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + (change >= 0 ? change : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (change < 0 ? -change : 0)) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calculateEMA(closes: number[], period: number): number {
  if (closes.length < period) return closes[closes.length - 1];

  const multiplier = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((sum, val) => sum + val, 0) / period;

  for (let i = period; i < closes.length; i++) {
    ema = (closes[i] - ema) * multiplier + ema;
  }

  return ema;
}

async function fetchRSI(ticker: string): Promise<number> {
  try {
    const chart = await yf.chart(ticker, {
      period1: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      interval: "1d",
    });
    const closes = chart.quotes?.map((q) => q.close).filter((c): c is number => c != null) ?? [];
    return calculateRSI(closes);
  } catch {
    return 50;
  }
}

interface ScreenerQuote {
  symbol?: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  trailingPE?: number;
  forwardPE?: number;
  marketCap?: number;
  averageDailyVolume3Month?: number;
  dividendYield?: number;
  sector?: string;
  twoHundredDayAverage?: number;
}

async function fetchScreenerCandidates(): Promise<ScreenerQuote[]> {
  const allQuotes: ScreenerQuote[] = [];
  const screenIds = ["undervalued_large_caps", "undervalued_growth_stocks"] as const;

  for (const scrId of screenIds) {
    try {
      const result = await yf.screener({ scrIds: scrId, count: 100 });
      if (result.quotes) {
        allQuotes.push(...(result.quotes as ScreenerQuote[]));
      }
    } catch (err) {
      console.error(`Screener ${scrId} failed:`, err instanceof Error ? err.message : err);
    }
  }

  // Deduplicate by symbol
  const seen = new Set<string>();
  return allQuotes.filter((q) => {
    if (!q.symbol || seen.has(q.symbol)) return false;
    seen.add(q.symbol);
    return true;
  });
}

export async function runStockScreener(): Promise<StockSignal[]> {
  const signals: StockSignal[] = [];
  const { value_dividend, oversold_growth } = STOCK_SCREENER_CONFIG;

  const candidates = await fetchScreenerCandidates();

  // Phase 1: Filter candidates into value_dividend and oversold_growth pre-candidates
  const oversoldCandidates: { quote: ScreenerQuote; ticker: string }[] = [];

  for (const q of candidates) {
    if (!q.symbol || !q.regularMarketPrice || !q.twoHundredDayAverage) continue;

    const price = q.regularMarketPrice;
    const ema200 = q.twoHundredDayAverage;
    const belowEMA = price < ema200;
    const pe = q.forwardPE || q.trailingPE || 0;
    const divYield = q.dividendYield || 0;
    const mCap = q.marketCap || 0;
    const vol = q.averageDailyVolume3Month || 0;

    if (
      pe > 0 && pe <= value_dividend.max_pe &&
      divYield >= value_dividend.min_dividend_yield &&
      mCap >= value_dividend.min_market_cap &&
      vol >= value_dividend.min_avg_volume &&
      belowEMA
    ) {
      signals.push({
        id: `${q.symbol}-${Date.now()}`,
        ticker: q.symbol,
        company_name: q.shortName || q.longName || q.symbol,
        price,
        ema_200: ema200,
        rsi_14: 0, // populated in phase 2
        forward_pe: pe,
        market_cap: mCap,
        avg_volume: vol,
        dividend_yield: divYield,
        sector: q.sector || "Unknown",
        signal_type: "value_dividend",
        passes_filter: true,
        notes: `P/E ${pe.toFixed(1)}, Yield ${divYield.toFixed(1)}%, Below 200 DMA`,
        screened_at: new Date().toISOString(),
      });
      continue;
    }

    if (
      pe > 0 && pe <= oversold_growth.max_pe &&
      mCap >= oversold_growth.min_market_cap &&
      vol >= oversold_growth.min_avg_volume &&
      belowEMA
    ) {
      oversoldCandidates.push({ quote: q, ticker: q.symbol });
    }
  }

  // Phase 2: Fetch RSI for oversold growth candidates (filter by RSI threshold)
  if (oversoldCandidates.length > 0) {
    const batchSize = 5;
    for (let i = 0; i < oversoldCandidates.length; i += batchSize) {
      const batch = oversoldCandidates.slice(i, i + batchSize);
      const rsiResults = await Promise.allSettled(batch.map((c) => fetchRSI(c.ticker)));

      for (let j = 0; j < batch.length; j++) {
        const rsiResult = rsiResults[j];
        const rsi = rsiResult.status === "fulfilled" ? rsiResult.value : 50;
        if (rsi > oversold_growth.max_rsi) continue;

        const { quote: q, ticker } = batch[j];
        signals.push({
          id: `${ticker}-${Date.now()}`,
          ticker,
          company_name: q.shortName || q.longName || ticker,
          price: q.regularMarketPrice!,
          ema_200: q.twoHundredDayAverage!,
          rsi_14: rsi,
          forward_pe: q.forwardPE || q.trailingPE || 0,
          market_cap: q.marketCap || 0,
          avg_volume: q.averageDailyVolume3Month || 0,
          dividend_yield: q.dividendYield || 0,
          sector: q.sector || "Unknown",
          signal_type: "oversold_growth",
          passes_filter: true,
          notes: `RSI ${rsi.toFixed(0)}, P/E ${(q.forwardPE || q.trailingPE || 0).toFixed(1)}, Below 200 DMA`,
          screened_at: new Date().toISOString(),
        });
      }

      if (i + batchSize < oversoldCandidates.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  // Phase 3: Backfill RSI for all signals that still have rsi_14 === 0
  const needRSI = signals.filter((s) => s.rsi_14 === 0);
  if (needRSI.length > 0) {
    const batchSize = 5;
    for (let i = 0; i < needRSI.length; i += batchSize) {
      const batch = needRSI.slice(i, i + batchSize);
      const rsiResults = await Promise.allSettled(batch.map((s) => fetchRSI(s.ticker)));

      for (let j = 0; j < batch.length; j++) {
        const rsiResult = rsiResults[j];
        const rsi = rsiResult.status === "fulfilled" ? rsiResult.value : 50;
        batch[j].rsi_14 = rsi;
        if (batch[j].signal_type === "value_dividend") {
          batch[j].notes = `P/E ${(batch[j].forward_pe ?? 0).toFixed(1)}, Yield ${(batch[j].dividend_yield ?? 0).toFixed(1)}%, RSI ${rsi.toFixed(0)}`;
        }
      }

      if (i + batchSize < needRSI.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  return signals;
}
