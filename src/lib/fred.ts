import { FRED_BASE_URL } from "./constants";

interface FredObservation {
  date: string;
  value: string;
}

interface FredResponse {
  observations: FredObservation[];
}

export async function fetchFredSeries(
  seriesId: string,
  limit = 5
): Promise<FredObservation[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) throw new Error("FRED_API_KEY not configured");

  const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=${limit}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`FRED API error: ${res.status} ${res.statusText}`);
  }

  const data: FredResponse = await res.json();
  return data.observations.filter((obs) => obs.value !== ".");
}

export async function fetchLatestValue(seriesId: string): Promise<{ value: number; date: string } | null> {
  try {
    const observations = await fetchFredSeries(seriesId, 1);
    if (observations.length === 0) return null;

    const obs = observations[0];
    const value = parseFloat(obs.value);
    if (isNaN(value)) return null;

    return { value, date: obs.date };
  } catch (error) {
    console.error(`Error fetching FRED series ${seriesId}:`, error);
    return null;
  }
}

export async function fetchAllIndicators(): Promise<
  Map<string, { value: number; date: string }>
> {
  const results = new Map<string, { value: number; date: string }>();

  const series = [
    "SAHMCURRENT",
    "T10Y2Y",
    "UNRATE",
    "MANEMP",
    "M2SL",
    "ICSA",
    "UMCSENT",
    "FEDFUNDS",
    "PERMIT",
    "W875RX1",
    "INDPRO",
    "JTSQUR",
    "NFCI",
    "TEMPHELPS",
    "CP",
    "PSAVERT",
    "DRCCLACBS",
    "HOUST",
    "TSIFRGHTC",
    "ISRATIO",
    "TDSP",
    "T10Y3M",
    "VIXCLS",
  ];

  const promises = series.map(async (seriesId) => {
    const result = await fetchLatestValue(seriesId);
    if (result) {
      results.set(seriesId, result);
    }
  });

  await Promise.allSettled(promises);
  return results;
}
