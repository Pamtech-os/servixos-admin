import { apiClient } from '@/lib/api-client';
import type { SubscriptionData } from '@/types/subscriptions';

export const subscriptionsService = {
  get: () => apiClient.get<SubscriptionData>('/subscriptions'),
};
