import type { PaginatedMeta } from './common';

export type ApiUserRole = 'owner' | 'employee' | 'staff' | 'client';
export type UserStatusFilter = 'all' | 'active' | 'suspended' | 'pending';
export type UserRoleFilter = 'all' | ApiUserRole;

export interface ApiUser {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userRole: ApiUserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  businessName: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  businessOwners: number;
  teamMembers: number;
  clients: number;
}

export interface UsersPage {
  stats: UserStats;
  users: ApiUser[];
  meta: PaginatedMeta;
}

export interface UsersQueryParams {
  page: number;
  limit: number;
  search: string;
  status: UserStatusFilter;
  role: UserRoleFilter;
}

export function deriveUserStatus(user: ApiUser): 'active' | 'suspended' | 'pending' {
  if (!user.isEmailVerified) return 'pending';
  return user.isActive ? 'active' : 'suspended';
}
