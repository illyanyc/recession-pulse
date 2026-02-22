import { STOCK_SCREENER_CONFIG } from "./constants";
import type { StockSignal } from "@/types";

interface YahooQuote {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  forwardPE?: number;
  trailingPE?: number;
  marketCap?: number;
  averageDailyVolume3Month?: number;
  dividendYield?: number;
  sector?: string;
  twoHundredDayAverage?: number;
  fiftyDayAverage?: number;
}

interface YahooChartQuote {
  close: (number | null)[];
}

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

async function fetchQuote(ticker: string): Promise<YahooQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}&fields=regularMarketPrice,forwardPE,trailingPE,marketCap,averageDailyVolume3Month,dividendYield,shortName,longName,sector,twoHundredDayAverage`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.quoteResponse?.result?.[0] || null;
  } catch {
    return null;
  }
}

async function fetchChart(ticker: string): Promise<number[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1y`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const quotes: YahooChartQuote = data?.chart?.result?.[0]?.indicators?.quote?.[0];
    if (!quotes?.close) return [];
    return quotes.close.filter((c): c is number => c != null);
  } catch {
    return [];
  }
}

async function screenTicker(ticker: string): Promise<{
  ticker: string;
  company_name: string;
  price: number;
  ema_200: number;
  rsi_14: number;
  forward_pe: number;
  market_cap: number;
  avg_volume: number;
  dividend_yield: number;
  sector: string;
} | null> {
  try {
    const [quote, closes] = await Promise.all([
      fetchQuote(ticker),
      fetchChart(ticker),
    ]);

    if (!quote || closes.length < 200) return null;

    const ema200 = calculateEMA(closes, 200);
    const rsi14 = calculateRSI(closes);
    const currentPrice = quote.regularMarketPrice || closes[closes.length - 1];

    return {
      ticker,
      company_name: quote.shortName || quote.longName || ticker,
      price: currentPrice,
      ema_200: ema200,
      rsi_14: rsi14,
      forward_pe: quote.forwardPE || quote.trailingPE || 0,
      market_cap: quote.marketCap || 0,
      avg_volume: quote.averageDailyVolume3Month || 0,
      dividend_yield: (quote.dividendYield || 0) * 100,
      sector: quote.sector || "Unknown",
    };
  } catch (error) {
    console.error(`Error screening ${ticker}:`, error);
    return null;
  }
}

export async function runStockScreener(): Promise<StockSignal[]> {
  const signals: StockSignal[] = [];
  const { watchlist, value_dividend, oversold_growth } = STOCK_SCREENER_CONFIG;

  // Process in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < watchlist.length; i += batchSize) {
    const batch = watchlist.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(screenTicker));

    for (const result of results) {
      if (result.status !== "fulfilled" || !result.value) continue;
      const stock = result.value;

      const belowEMA = stock.price < stock.ema_200;

      // Check value dividend criteria
      if (
        stock.forward_pe > 0 &&
        stock.forward_pe <= value_dividend.max_pe &&
        stock.dividend_yield >= value_dividend.min_dividend_yield &&
        stock.market_cap >= value_dividend.min_market_cap &&
        stock.avg_volume >= value_dividend.min_avg_volume &&
        belowEMA
      ) {
        signals.push({
          id: `${stock.ticker}-${Date.now()}`,
          ticker: stock.ticker,
          company_name: stock.company_name,
          price: stock.price,
          ema_200: stock.ema_200,
          rsi_14: stock.rsi_14,
          forward_pe: stock.forward_pe,
          market_cap: stock.market_cap,
          avg_volume: stock.avg_volume,
          dividend_yield: stock.dividend_yield,
          sector: stock.sector,
          signal_type: "value_dividend",
          passes_filter: true,
          notes: `P/E ${stock.forward_pe.toFixed(1)}, Yield ${stock.dividend_yield.toFixed(1)}%, Below 200 EMA`,
          screened_at: new Date().toISOString(),
        });
        continue;
      }

      // Check oversold growth criteria
      if (
        stock.forward_pe > 0 &&
        stock.forward_pe <= oversold_growth.max_pe &&
        stock.rsi_14 <= oversold_growth.max_rsi &&
        stock.market_cap >= oversold_growth.min_market_cap &&
        stock.avg_volume >= oversold_growth.min_avg_volume &&
        belowEMA
      ) {
        signals.push({
          id: `${stock.ticker}-${Date.now()}`,
          ticker: stock.ticker,
          company_name: stock.company_name,
          price: stock.price,
          ema_200: stock.ema_200,
          rsi_14: stock.rsi_14,
          forward_pe: stock.forward_pe,
          market_cap: stock.market_cap,
          avg_volume: stock.avg_volume,
          dividend_yield: stock.dividend_yield,
          sector: stock.sector,
          signal_type: "oversold_growth",
          passes_filter: true,
          notes: `RSI ${stock.rsi_14.toFixed(0)}, P/E ${stock.forward_pe.toFixed(1)}, Below 200 EMA`,
          screened_at: new Date().toISOString(),
        });
      }
    }

    // Delay between batches
    if (i + batchSize < watchlist.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return signals;
}
