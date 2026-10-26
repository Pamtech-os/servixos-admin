import type { PaginatedMeta } from './common';

export const WAITLIST_PERSONAS = ['aspiring_founder', 'has_idea', 'business_owner', 'exploring'] as const;

export type WaitlistPersona = (typeof WAITLIST_PERSONAS)[number];

export type WaitlistStats = { total: number } & Record<WaitlistPersona, number>;

export interface WaitlistEntry {
  id: string;
  _id: string;
  firstName: string;
  email: string;
  persona: WaitlistPersona;
  createdAt: string;
  updatedAt: string;
}

export interface WaitlistPage {
  stats: WaitlistStats;
  entries: WaitlistEntry[];
  meta: PaginatedMeta;
}

export interface WaitlistFilters {
  search: string;
  persona: WaitlistPersona | 'all';
  /** YYYY-MM-DD from a date input, interpreted in the admin's local timezone */
  dateFrom: string;
  /** YYYY-MM-DD from a date input, inclusive of the whole day */
  dateTo: string;
}

export interface WaitlistQueryParams extends WaitlistFilters {
  page: number;
  limit: number;
}
