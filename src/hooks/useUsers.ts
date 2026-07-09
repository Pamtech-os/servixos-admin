import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import type { UsersQueryParams } from '@/types/users';

export const useUsers = (params: UsersQueryParams) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () => usersService.list(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export const useToggleSuspendUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.toggleSuspend(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useBulkToggleSuspendUsers = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userIds, suspend }: { userIds: string[]; suspend?: boolean }) =>
      usersService.bulkToggleSuspend(userIds, suspend),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useResetUserPassword = () =>
  useMutation({ mutationFn: (id: string) => usersService.resetPassword(id) });

export const useSendUserEmail = () =>
  useMutation({
    mutationFn: async ({ ids, subject, message }: { ids: string[]; subject: string; message: string }) => {
      if (ids.length === 1) {
        await usersService.sendEmailSingle(ids[0], subject, message);
      } else {
        await usersService.sendEmailBulk(ids, subject, message);
      }
    },
  });
