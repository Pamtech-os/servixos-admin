import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import type { GenerateReportPayload } from '@/types/reports';

const PAGE_LIMIT = 10;

export function useReportStats() {
  return useQuery({
    queryKey: ['report-stats'],
    queryFn: reportsService.stats,
    staleTime: 30_000,
  });
}

export function useReports(page: number) {
  return useQuery({
    queryKey: ['reports', page],
    queryFn: () => reportsService.list(page, PAGE_LIMIT),
    placeholderData: (prev) => prev,
    refetchInterval: (query) => {
      const reports = query.state.data?.reports ?? [];
      const hasActive = reports.some((r) => r.status === 'pending' || r.status === 'processing');
      return hasActive ? 3000 : false;
    },
  });
}

export function useSchedules(page: number) {
  return useQuery({
    queryKey: ['report-schedules', page],
    queryFn: () => reportsService.scheduled(page, PAGE_LIMIT),
    placeholderData: (prev) => prev,
  });
}

export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateReportPayload) => reportsService.generate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
      qc.invalidateQueries({ queryKey: ['report-stats'] });
      qc.invalidateQueries({ queryKey: ['report-schedules'] });
    },
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: (id: string) => reportsService.download(id),
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportsService.deleteReport(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
      qc.invalidateQueries({ queryKey: ['report-stats'] });
    },
  });
}

export function usePauseSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportsService.pauseSchedule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['report-schedules'] });
      qc.invalidateQueries({ queryKey: ['report-stats'] });
    },
  });
}

export function useResumeSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportsService.resumeSchedule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['report-schedules'] });
      qc.invalidateQueries({ queryKey: ['report-stats'] });
    },
  });
}

export function useRunSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportsService.runSchedule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
      qc.invalidateQueries({ queryKey: ['report-stats'] });
    },
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportsService.deleteSchedule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['report-schedules'] });
      qc.invalidateQueries({ queryKey: ['report-stats'] });
    },
  });
}
