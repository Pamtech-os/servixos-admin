import type { PaginatedMeta } from './common';

export interface ActivityLog {
  id: string;
  _id: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  target: string;
  targetId: string;
  businessId: string;
  businessName: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityLogsPage {
  logs: ActivityLog[];
  meta: PaginatedMeta;
}

export interface ActivityLogsQueryParams {
  page: number;
  limit: number;
  search: string;
  actorRole: string;
}
