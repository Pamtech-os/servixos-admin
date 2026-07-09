import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import type { DashboardPeriod } from '@/types/dashboard';

const STALE_MS = 60_000;

export const useDashboardStats = (period?: DashboardPeriod) =>
  useQuery({
    queryKey: ['dashboard', 'stats', period ?? 'default'],
    queryFn: () => dashboardService.getStats(period),
    staleTime: STALE_MS,
  });
