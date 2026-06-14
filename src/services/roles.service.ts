import { apiClient } from '@/lib/api-client';
import type { ApiRole, TeamMember } from '@/types/roles';

function normalizeRole(r: ApiRole & { _id: string }): ApiRole {
  return { ...r, id: r._id };
}

function normalizeMember(m: TeamMember & { _id: string }): TeamMember {
  return { ...m, id: m._id };
}

export const rolesService = {
  list: async (): Promise<ApiRole[]> => {
    const data = await apiClient.get<(ApiRole & { _id: string })[]>('/roles');
    return data.map(normalizeRole);
  },

  team: async (): Promise<TeamMember[]> => {
    const data = await apiClient.get<(TeamMember & { _id: string })[]>('/roles/team');
    return data.map(normalizeMember);
  },

  create: (payload: { name: string; description?: string; permissions: string[] }) =>
    apiClient.post<ApiRole>('/roles', payload),

  update: (id: string, payload: { name?: string; description?: string; permissions?: string[] }) =>
    apiClient.patch<ApiRole>(`/roles/${id}`, payload),

  delete: (id: string) => apiClient.delete<{ deleted: boolean }>(`/roles/${id}`),

  assign: (adminId: string, roleId: string) =>
    apiClient.patch<{ adminId: string; roleId: string; roleName: string }>('/roles/assign', {
      adminId,
      roleId,
    }),

  inviteTeamMember: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    roleId?: string;
  }) => apiClient.post<void>('/roles/team/invite', payload),
};
