import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesService } from '@/services/roles.service';

export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: rolesService.list, staleTime: 30_000 });
}

export function useTeamMembers() {
  return useQuery({ queryKey: ['roles-team'], queryFn: rolesService.team, staleTime: 30_000 });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rolesService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      name?: string;
      description?: string;
      permissions?: string[];
    }) => rolesService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rolesService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ adminId, roleId }: { adminId: string; roleId: string }) =>
      rolesService.assign(adminId, roleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      qc.invalidateQueries({ queryKey: ['roles-team'] });
    },
  });
}

export function useInviteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rolesService.inviteTeamMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles-team'] }),
  });
}
