import { apiClient } from '@/lib/api-client';
import type { BusinessesPage, ApiBusiness, BusinessesQueryParams } from '@/types/businesses';

function buildQs(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== 'all') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

function normalize(b: ApiBusiness): ApiBusiness {
  return { ...b, id: b._id };
}

type RawBusinessesPage = Omit<BusinessesPage, 'businesses'> & {
  businesses: (ApiBusiness & { _id: string })[];
};

export const businessesService = {
  list: async (params: BusinessesQueryParams): Promise<BusinessesPage> => {
    const qs = buildQs({
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      status: params.status !== 'all' ? params.status : undefined,
    });
    const data = await apiClient.get<RawBusinessesPage>(`/businesses${qs}`);
    return { ...data, businesses: data.businesses.map(normalize) };
  },

  get: async (id: string): Promise<ApiBusiness> => {
    const b = await apiClient.get<ApiBusiness & { _id: string }>(`/businesses/${id}`);
    return normalize(b);
  },

  suspend: (id: string) => apiClient.patch<void>(`/businesses/${id}/suspend`, {}),

  reactivate: (id: string) => apiClient.patch<void>(`/businesses/${id}/reactivate`, {}),

  bulkToggleSuspend: (businessIds: string[]) =>
    apiClient.patch<{ modifiedCount: number; suspended: boolean }>(
      '/businesses/bulk/toggle-suspend',
      { businessIds },
    ),

  sendEmailBulk: (businessIds: string[], subject: string, message: string) =>
    apiClient.post<{ sent: number }>('/businesses/send-email', {
      businessIds,
      subject,
      message,
    }),

  sendEmailSingle: (id: string, subject: string, message: string) =>
    apiClient.post<void>(`/businesses/${id}/send-email`, { subject, message }),
};
