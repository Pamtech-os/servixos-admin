import { useQuery } from '@tanstack/react-query';
import { activityLogsService } from '@/services/activity-logs.service';
import type { ActivityLogsQueryParams } from '@/types/activity-logs';

export function useActivityLogs(params: ActivityLogsQueryParams) {
  return useQuery({
    queryKey: ['activity-logs', params],
    queryFn: () => activityLogsService.list(params),
    placeholderData: (prev) => prev,
  });
}
