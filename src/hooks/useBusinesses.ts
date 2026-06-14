import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { businessesService } from '@/services/businesses.service';
import type { BusinessesQueryParams } from '@/types/businesses';

export const useBusinesses = (params: BusinessesQueryParams) =>
  useQuery({
    queryKey: ['businesses', params],
    queryFn: () => businessesService.list(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export const useToggleSuspendBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'suspend' | 'reactivate' }) =>
      businessesService[action](id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['businesses'] }),
  });
};

export const useBulkToggleSuspendBusinesses = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (businessIds: string[]) => businessesService.bulkToggleSuspend(businessIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['businesses'] }),
  });
};

export const useSendBusinessEmail = () =>
  useMutation({
    mutationFn: async ({ ids, subject, message }: { ids: string[]; subject: string; message: string }) => {
      if (ids.length === 1) {
        await businessesService.sendEmailSingle(ids[0], subject, message);
      } else {
        await businessesService.sendEmailBulk(ids, subject, message);
      }
    },
  });
