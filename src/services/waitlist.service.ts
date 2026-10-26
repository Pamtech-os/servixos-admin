import { apiClient } from '@/lib/api-client';
import type { WaitlistEntry, WaitlistFilters, WaitlistPage, WaitlistQueryParams } from '@/types/waitlist';

const SEARCH_MAX = 100;

type RawPage = Omit<WaitlistPage, 'entries'> & { entries: WaitlistEntry[] };

function normalize(entry: WaitlistEntry): WaitlistEntry {
  return { ...entry, id: entry._id };
}

// Local start/end of day → ISO, so a date range covers whole days in the admin's timezone.
function toIso(date: string, endOfDay: boolean): string | null {
  const d = new Date(`${date}T${endOfDay ? '23:59:59.999' : '00:00:00'}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function filterParams(filters: WaitlistFilters): URLSearchParams {
  const q = new URLSearchParams();
  const search = filters.search.trim().slice(0, SEARCH_MAX);
  if (search) q.set('search', search);
  if (filters.persona !== 'all') q.set('persona', filters.persona);
  const from = filters.dateFrom && toIso(filters.dateFrom, false);
  const to = filters.dateTo && toIso(filters.dateTo, true);
  if (from) q.set('dateFrom', from);
  if (to) q.set('dateTo', to);
  return q;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  // Defer revoke so the browser has started reading the blob
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export const waitlistService = {
  list: async ({ page, limit, ...filters }: WaitlistQueryParams): Promise<WaitlistPage> => {
    const q = filterParams(filters);
    q.set('page', String(page));
    q.set('limit', String(limit));
    const data = await apiClient.get<RawPage>(`/waitlist?${q.toString()}`);
    return { ...data, entries: data.entries.map(normalize) };
  },

  export: async (filters: WaitlistFilters): Promise<void> => {
    const qs = filterParams(filters).toString();
    const { blob, filename } = await apiClient.download(`/waitlist/export${qs ? `?${qs}` : ''}`);
    triggerDownload(blob, filename ?? `waitlist-${new Date().toISOString().slice(0, 10)}.csv`);
  },
};
