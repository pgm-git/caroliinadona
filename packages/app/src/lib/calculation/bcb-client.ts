/**
 * BCB (Banco Central do Brasil) API client for fetching economic indices.
 * API: https://api.bcb.gov.br/dados/serie/bcdata.sgs.{series}/dados
 *
 * Series IDs:
 *   IGPM = 189, IPCA = 433, INPC = 188,
 *   SELIC = 11, CDI = 12, TR = 226
 */

const BCB_BASE_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";

export const BCB_SERIES: Record<string, number> = {
  igpm: 189,
  ipca: 433,
  inpc: 188,
  selic: 11,
  cdi: 12,
  tr: 226,
};

export interface BcbIndexValue {
  date: string; // YYYY-MM-DD
  value: number; // percentage value (e.g. 0.47 means 0.47%)
}

/** In-memory cache: key = "series:startDate:endDate" */
const cache = new Map<string, { data: BcbIndexValue[]; expiresAt: number }>();
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

function formatDateBcb(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseDate(dateStr: string): string {
  // BCB returns "dd/mm/yyyy" → convert to "YYYY-MM-DD"
  const [dd, mm, yyyy] = dateStr.split("/");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Fetch index values from BCB API for a given series and date range.
 */
export async function fetchBcbIndex(
  indexCode: string,
  startDate: Date,
  endDate: Date
): Promise<BcbIndexValue[]> {
  const seriesId = BCB_SERIES[indexCode.toLowerCase()];
  if (!seriesId) {
    throw new Error(`Unknown index code: ${indexCode}`);
  }

  const start = formatDateBcb(startDate);
  const end = formatDateBcb(endDate);
  const cacheKey = `${seriesId}:${start}:${end}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const url = `${BCB_BASE_URL}.${seriesId}/dados?formato=json&dataInicial=${start}&dataFinal=${end}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(
      `BCB API error: ${response.status} ${response.statusText}`
    );
  }

  const raw = (await response.json()) as Array<{
    data: string;
    valor: string;
  }>;

  const data: BcbIndexValue[] = raw.map((item) => ({
    date: parseDate(item.data),
    value: parseFloat(item.valor),
  }));

  // Store in cache
  cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });

  return data;
}

/**
 * Build a monthly index map (YYYY-MM → rate) for a date range.
 * For accumulated indices (IGPM, IPCA, INPC, TR): each entry is the monthly %
 * For rate indices (SELIC, CDI): monthly rate is daily rate * ~21 biz days / 100
 */
export async function getMonthlyIndexMap(
  indexCode: string,
  startDate: Date,
  endDate: Date
): Promise<Map<string, number>> {
  const values = await fetchBcbIndex(indexCode, startDate, endDate);
  const map = new Map<string, number>();

  for (const v of values) {
    const ym = v.date.substring(0, 7); // "YYYY-MM"
    // For monthly indices, the last value of the month is the accumulator
    map.set(ym, v.value);
  }

  return map;
}

/**
 * Clear the in-memory cache.
 */
export function clearBcbCache(): void {
  cache.clear();
}
