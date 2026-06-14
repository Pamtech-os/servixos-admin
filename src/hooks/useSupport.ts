import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportService } from '@/services/support.service';
import type { SupportQueryParams } from '@/types/support';

export function useSupport(params: SupportQueryParams) {
  return useQuery({
    queryKey: ['support', params],
    queryFn: () => supportService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useSupportTicket(id: string | null) {
  return useQuery({
    queryKey: ['support-ticket', id],
    queryFn: () => supportService.get(id!),
    enabled: !!id,
  });
}

export function useSupportAdmins() {
  return useQuery({
    queryKey: ['support-admins'],
    queryFn: supportService.admins,
    staleTime: 60_000,
  });
}

export function useAssignTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminId }: { id: string; adminId: string | null }) =>
      supportService.assign(id, adminId),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['support'] });
      qc.invalidateQueries({ queryKey: ['support-ticket', id] });
    },
  });
}

export function useReplyTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      supportService.reply(id, content),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['support'] });
      qc.invalidateQueries({ queryKey: ['support-ticket', id] });
    },
  });
}

export function useResolveTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: supportService.resolve,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['support'] });
      qc.invalidateQueries({ queryKey: ['support-ticket', id] });
    },
  });
}

export function useCloseTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: supportService.close,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['support'] });
      qc.invalidateQueries({ queryKey: ['support-ticket', id] });
    },
  });
}
