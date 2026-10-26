import { useQuery, useMutation } from '@tanstack/react-query';
import { waitlistService } from '@/services/waitlist.service';
import type { WaitlistFilters, WaitlistQueryParams } from '@/types/waitlist';

export function useWaitlist(params: WaitlistQueryParams) {
  return useQuery({
    queryKey: ['waitlist', params],
    queryFn: () => waitlistService.list(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useExportWaitlist() {
  return useMutation({
    mutationFn: (filters: WaitlistFilters) => waitlistService.export(filters),
  });
}
