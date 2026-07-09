import type { PaginatedMeta } from './common';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SupportStatusFilter = TicketStatus | 'all';

export interface TicketStats {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface TicketReply {
  content: string;
  authorId: string;
  authorName: string;
  authorType: 'admin' | 'user';
  createdAt: string;
}

export interface Ticket {
  id: string;
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: string;
  requesterId?: string;
  requesterName: string;
  requesterEmail: string;
  businessId?: string;
  businessName: string;
  assigneeId: string | null;
  assigneeName: string | null;
  replies?: TicketReply[];
  createdAt: string;
}

export interface SupportPage {
  stats: TicketStats;
  tickets: Ticket[];
  meta: PaginatedMeta;
}

export interface SupportQueryParams {
  page: number;
  limit: number;
  search: string;
  status: SupportStatusFilter;
}

export interface SupportAdmin {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}
