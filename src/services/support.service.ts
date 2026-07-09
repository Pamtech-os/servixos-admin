import { apiClient } from '@/lib/api-client';
import type { SupportPage, Ticket, SupportQueryParams, SupportAdmin } from '@/types/support';

type RawPage = Omit<SupportPage, 'tickets'> & { tickets: (Ticket & { _id: string })[] };

function normalize(t: Ticket & { _id: string }): Ticket {
  return { ...t, id: t._id };
}

export const supportService = {
  list: async (params: SupportQueryParams): Promise<SupportPage> => {
    const q = new URLSearchParams();
    q.set('page', String(params.page));
    q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.status !== 'all') q.set('status', params.status);
    const qs = q.toString() ? `?${q.toString()}` : '';
    const data = await apiClient.get<RawPage>(`/support${qs}`);
    return { ...data, tickets: data.tickets.map(normalize) };
  },

  get: async (id: string): Promise<Ticket> => {
    const t = await apiClient.get<Ticket & { _id: string }>(`/support/${id}`);
    return normalize(t);
  },

  admins: async (): Promise<SupportAdmin[]> => {
    const list = await apiClient.get<(SupportAdmin & { _id: string })[]>('/support/admins');
    return list.map((a) => ({ ...a, id: a._id }));
  },

  assign: (id: string, adminId: string | null) =>
    apiClient.patch<Ticket>(`/support/${id}/assign`, { adminId }),

  reply: (id: string, content: string) =>
    apiClient.post<Ticket>(`/support/${id}/reply`, { content }),

  resolve: (id: string) => apiClient.patch<Ticket>(`/support/${id}/resolve`, {}),

  close: (id: string) => apiClient.patch<Ticket>(`/support/${id}/close`, {}),
};
