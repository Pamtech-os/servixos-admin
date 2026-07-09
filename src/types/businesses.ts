import type { PaginatedMeta } from './common';

export type BusinessStatusFilter = 'all' | 'active' | 'suspended';

export interface BusinessSubscription {
  plan: string;
  status: string;
  trialEndsAt?: string;
}

export interface ApiBusiness {
  id: string;
  _id: string;
  name: string;
  subdomain: string;
  isSuspended?: boolean;
  subscription: BusinessSubscription;
  categoryName?: string;
  description?: string;
  timezone?: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessesPage {
  businesses: ApiBusiness[];
  meta: PaginatedMeta;
}

export interface BusinessesQueryParams {
  page: number;
  limit: number;
  search: string;
  status: BusinessStatusFilter;
}
