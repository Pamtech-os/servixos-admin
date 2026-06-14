export type DashboardPeriod = 'today' | 'last7days' | 'last30days';

export interface HistoryPoint {
  label: string;
  value: number;
}

export interface ActivityEntry {
  action: string;
  category: string;
  actorName: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  monthlyRevenue: number;
  activeBusinesses: number;
  revenueHistory: HistoryPoint[];
  growthHistory: HistoryPoint[];
  recentActivities: ActivityEntry[];
}
