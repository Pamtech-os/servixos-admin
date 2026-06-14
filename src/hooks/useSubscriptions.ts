import { useQuery } from '@tanstack/react-query';
import { subscriptionsService } from '@/services/subscriptions.service';

export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionsService.get,
    staleTime: 60_000,
  });
}
