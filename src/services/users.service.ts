import { apiClient } from '@/lib/api-client';
import type { UsersPage, ApiUser, UsersQueryParams, InviteUserPayload } from '@/types/users';

function buildQs(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== 'all') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

function normalize(u: ApiUser): ApiUser {
  return { ...u, id: u._id };
}

type RawUsersPage = Omit<UsersPage, 'users'> & { users: (ApiUser & { _id: string })[] };

export const usersService = {
  list: async (params: UsersQueryParams): Promise<UsersPage> => {
    const qs = buildQs({
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      status: params.status !== 'all' ? params.status : undefined,
      role: params.role !== 'all' ? params.role : undefined,
    });
    const data = await apiClient.get<RawUsersPage>(`/users${qs}`);
    return { ...data, users: data.users.map(normalize) };
  },

  get: async (id: string): Promise<ApiUser> => {
    const u = await apiClient.get<ApiUser & { _id: string }>(`/users/${id}`);
    return normalize(u);
  },

  toggleSuspend: (id: string) =>
    apiClient.patch<{ suspended: boolean }>(`/users/${id}/toggle-suspend`, {}),

  bulkToggleSuspend: (userIds: string[], suspend?: boolean) =>
    apiClient.patch<{ modifiedCount: number }>('/users/bulk/toggle-suspend', {
      userIds,
      ...(suspend !== undefined && { suspend }),
    }),

  invite: (payload: InviteUserPayload) =>
    apiClient.post<void>('/users/invite', payload),

  sendEmailBulk: (userIds: string[], subject: string, message: string) =>
    apiClient.post<{ sent: number }>('/users/send-email', { userIds, subject, message }),

  sendEmailSingle: (id: string, subject: string, message: string) =>
    apiClient.post<void>(`/users/${id}/send-email`, { subject, message }),

  resetPassword: (id: string) =>
    apiClient.post<void>(`/users/${id}/reset-password`, {}),
};
