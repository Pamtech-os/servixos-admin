import { apiClient } from '@/lib/api-client';
import type { DashboardStats, DashboardPeriod } from '@/types/dashboard';

export const dashboardService = {
  getStats: (period?: DashboardPeriod) => {
    const qs = period ? `?period=${period}` : '';
    return apiClient.get<DashboardStats>(`/dashboard${qs}`);
  },
};
