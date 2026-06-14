import type { PaginatedMeta } from './common';

export type ReportType = 'users' | 'revenue' | 'businesses' | 'activity_log' | 'subscriptions' | 'ai_usage';
export type ReportFormat = 'csv' | 'excel';
export type ReportStatus = 'pending' | 'processing' | 'ready' | 'failed';
export type ReportFrequency = 'one_time' | 'daily' | 'weekly' | 'monthly';
export type ScheduleStatus = 'active' | 'paused';

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  dateFrom: string;
  dateTo: string;
  createdAt: string;
  completedAt?: string;
  rowCount?: number;
  fileSize?: string;
}

export interface ReportSchedule {
  id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  frequency: Exclude<ReportFrequency, 'one_time'>;
  status: ScheduleStatus;
  nextRunAt: string;
  lastRunAt?: string;
  createdAt: string;
}

export interface ReportStats {
  totalReports: number;
  readyToDownload: number;
  activeSchedules: number;
  reportTypes: number;
}

export interface ReportsPage {
  reports: Report[];
  meta: PaginatedMeta;
}

export interface SchedulesPage {
  schedules: ReportSchedule[];
  meta: PaginatedMeta;
}

export interface GenerateReportPayload {
  name?: string;
  type: ReportType;
  format: ReportFormat;
  dateFrom: string;
  dateTo: string;
  frequency: ReportFrequency;
}
