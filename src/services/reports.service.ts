import { apiClient } from '@/lib/api-client';
import type {
  Report, ReportSchedule, ReportStats,
  ReportsPage, SchedulesPage, GenerateReportPayload,
} from '@/types/reports';

type RawReport = Report & { _id: string };
type RawSchedule = ReportSchedule & { _id: string };

function normalizeReport(r: RawReport): Report {
  return { ...r, id: r._id };
}

function normalizeSchedule(s: RawSchedule): ReportSchedule {
  return { ...s, id: s._id };
}

export const reportsService = {
  stats: () => apiClient.get<ReportStats>('/reports/stats'),

  list: async (page: number, limit: number): Promise<ReportsPage> => {
    const { data, meta } = await apiClient.getList<RawReport[]>(`/reports?page=${page}&limit=${limit}`);
    return { reports: data.map(normalizeReport), meta: meta as ReportsPage['meta'] };
  },

  scheduled: async (page: number, limit: number): Promise<SchedulesPage> => {
    const { data, meta } = await apiClient.getList<RawSchedule[]>(`/reports/scheduled?page=${page}&limit=${limit}`);
    return { schedules: data.map(normalizeSchedule), meta: meta as SchedulesPage['meta'] };
  },

  generate: (payload: GenerateReportPayload) =>
    apiClient.post<Report>('/reports', payload),

  download: async (id: string): Promise<void> => {
    const { url } = await apiClient.get<{ url: string }>(`/reports/${id}/download`);
    window.open(url, '_blank');
  },

  deleteReport: (id: string) => apiClient.delete<void>(`/reports/${id}`),

  pauseSchedule: (id: string) =>
    apiClient.patch<ReportSchedule>(`/reports/scheduled/${id}/pause`, {}),

  resumeSchedule: (id: string) =>
    apiClient.patch<ReportSchedule>(`/reports/scheduled/${id}/resume`, {}),

  runSchedule: (id: string) =>
    apiClient.post<Report>(`/reports/scheduled/${id}/run`, {}),

  deleteSchedule: (id: string) => apiClient.delete<void>(`/reports/scheduled/${id}`),
};
