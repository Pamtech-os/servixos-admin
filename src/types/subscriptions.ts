export interface SubscriptionStats {
  mrr: number;
  mrrGrowthPercent: number;
  paidSubscribers: number;
  newPaidSubscribersThisMonth: number;
}

export interface PlanDistribution {
  plan: string;
  count: number;
  percentage: number;
}

export type PlanChangeType = 'conversion' | 'upgrade' | 'downgrade' | 'churn';

export interface RecentPlanChange {
  businessName: string;
  fromPlan: string;
  toPlan: string;
  type: PlanChangeType;
  createdAt: string;
}

export interface SubscriptionData {
  stats: SubscriptionStats;
  mrrHistory: { label: string; value: number }[];
  planDistribution: PlanDistribution[];
  recentPlanChanges: RecentPlanChange[];
}
