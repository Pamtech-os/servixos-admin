import { apiClient } from '@/lib/api-client';
import type { ActivityLogsPage, ActivityLog, ActivityLogsQueryParams } from '@/types/activity-logs';

type RawPage = Omit<ActivityLogsPage, 'logs'> & { logs: (ActivityLog & { _id: string })[] };

function normalize(log: ActivityLog & { _id: string }): ActivityLog {
  return { ...log, id: log._id };
}

export const activityLogsService = {
  list: async (params: ActivityLogsQueryParams): Promise<ActivityLogsPage> => {
    const q = new URLSearchParams();
    q.set('page', String(params.page));
    q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.actorRole && params.actorRole !== 'all') q.set('actorRole', params.actorRole);
    const qs = q.toString() ? `?${q.toString()}` : '';
    const data = await apiClient.get<RawPage>(`/activity-logs${qs}`);
    return { ...data, logs: data.logs.map(normalize) };
  },
};
