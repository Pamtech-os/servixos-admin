import { useState, type FC } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Edit, Trash2, Plus, UserPlus, Lock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api-client';
import {
  useRoles,
  useTeamMembers,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useAssignRole,
  useInviteTeamMember,
} from '@/hooks/useRoles';
import type { ApiRole, TeamMember } from '@/types/roles';
import { ALL_PERMISSIONS } from '@/types/roles';

const ROLE_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(270, 70%, 60%)',
  'hsl(174, 72%, 50%)',
  'hsl(40, 90%, 55%)',
  'hsl(0, 70%, 60%)',
];

function initials(m: TeamMember): string {
  return `${m.firstName[0] ?? ''}${m.lastName[0] ?? ''}`.toUpperCase();
}

const RolesPermissions: FC = () => {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: members = [], isLoading: membersLoading } = useTeamMembers();

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const assignRole = useAssignRole();
  const inviteMember = useInviteTeamMember();

  // Create role dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPerms, setNewPerms] = useState<string[]>([]);

  // Edit role dialog
  const [editRole, setEditRole] = useState<ApiRole | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPerms, setEditPerms] = useState<string[]>([]);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<ApiRole | null>(null);

  // Assign role dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignMemberId, setAssignMemberId] = useState('');
  const [assignRoleId, setAssignRoleId] = useState('');

  // Invite dialog
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteFirst, setInviteFirst] = useState('');
  const [inviteLast, setInviteLast] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');

  const togglePerm = (key: string, current: string[], set: (p: string[]) => void) => {
    set(current.includes(key) ? current.filter((k) => k !== key) : [...current, key]);
  };

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error('Role name is required'); return; }
    try {
      await createRole.mutateAsync({ name: newName.trim(), description: newDesc.trim(), permissions: newPerms });
      toast.success(`Role "${newName}" created`);
      setCreateOpen(false);
      setNewName(''); setNewDesc(''); setNewPerms([]);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Create failed');
    }
  };

  const openEdit = (role: ApiRole) => {
    setEditRole(role);
    setEditName(role.name);
    setEditDesc(role.description);
    setEditPerms([...role.permissions]);
  };

  const handleUpdate = async () => {
    if (!editRole) return;
    try {
      await updateRole.mutateAsync({
        id: editRole.id,
        ...(!editRole.isSystem && { name: editName.trim() }),
        description: editDesc.trim(),
        permissions: editPerms,
      });
      toast.success('Role updated');
      setEditRole(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.isSystem) { toast.error('System roles cannot be deleted'); return; }
    if (deleteTarget.memberCount > 0) { toast.error('Remove all members before deleting this role'); return; }
    try {
      await deleteRole.mutateAsync(deleteTarget.id);
      toast.success(`Role "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Delete failed');
    }
  };

  const handleAssign = async () => {
    if (!assignMemberId || !assignRoleId) { toast.error('Select a member and role'); return; }
    try {
      const res = await assignRole.mutateAsync({ adminId: assignMemberId, roleId: assignRoleId });
      toast.success(`Role "${res.roleName}" assigned`);
      setAssignOpen(false);
      setAssignMemberId(''); setAssignRoleId('');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Assign failed');
    }
  };

  const handleInvite = async () => {
    if (!inviteFirst.trim() || !inviteLast.trim() || !inviteEmail.trim()) {
      toast.error('First name, last name and email are required');
      return;
    }
    try {
      await inviteMember.mutateAsync({
        firstName: inviteFirst.trim(),
        lastName: inviteLast.trim(),
        email: inviteEmail.trim(),
        ...(inviteRoleId && { roleId: inviteRoleId }),
      });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteOpen(false);
      setInviteFirst(''); setInviteLast(''); setInviteEmail(''); setInviteRoleId('');
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) {
        toast.error('Only the super admin can invite new admins');
      } else {
        toast.error(err instanceof ApiError ? err.message : 'Invite failed');
      }
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Roles & Permissions</h1>
          <p className='text-sm text-muted-foreground'>Manage admin roles and team member access</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setInviteOpen(true)} className='gap-2'>
            <UserPlus size={16} /> Invite Admin
          </Button>
          <Button onClick={() => { setCreateOpen(true); setNewPerms([]); }} className='gap-2 gradient-bg text-primary-foreground'>
            <Plus size={16} /> Create Role
          </Button>
        </div>
      </div>

      {/* Role cards */}
      {rolesLoading ? (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='h-32 animate-pulse rounded-xl bg-muted/40' />
          ))}
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {roles.map((role, i) => {
            const color = ROLE_COLORS[i % ROLE_COLORS.length];
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className='relative overflow-hidden h-full'>
                  <div className='absolute left-0 top-0 h-1 w-full' style={{ background: color }} />
                  <CardContent className='p-5'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <div className='flex items-center gap-2'>
                          {role.isSystem
                            ? <Lock size={16} style={{ color }} />
                            : <Shield size={16} style={{ color }} />}
                          <h3 className='font-semibold text-foreground'>{role.name}</h3>
                        </div>
                        <p className='mt-1 text-xs text-muted-foreground line-clamp-2'>{role.description}</p>
                      </div>
                      <div className='flex gap-1 shrink-0'>
                        <button
                          onClick={() => openEdit(role)}
                          className='rounded p-1 text-muted-foreground hover:text-foreground'
                        >
                          <Edit size={14} />
                        </button>
                        {!role.isSystem && (
                          <button
                            onClick={() => setDeleteTarget(role)}
                            className='rounded p-1 text-muted-foreground hover:text-destructive'
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className='mt-3 flex items-center justify-between'>
                      <span className='text-xs text-muted-foreground'>
                        {role.permissions.length} permissions
                      </span>
                      <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                        <Users size={12} /> {role.memberCount}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Team members table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(4)].map((__, j) => (
                          <TableCell key={j}>
                            <div className='h-4 animate-pulse rounded bg-muted/60' />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className='py-8 text-center text-muted-foreground'>
                        No team members yet. Invite an admin to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((m) => {
                      const memberRoleColor = roleColor_by_name(m.roleName, roles);
                      return (
                        <TableRow key={m.id}>
                          <TableCell>
                            <div className='flex items-center gap-3'>
                              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
                                {initials(m)}
                              </div>
                              <div>
                                <p className='font-medium text-foreground'>{m.firstName} {m.lastName}</p>
                                <p className='text-xs text-muted-foreground'>{m.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant='outline'
                              style={{
                                backgroundColor: memberRoleColor ? `${memberRoleColor}22` : undefined,
                                color: memberRoleColor,
                                borderColor: memberRoleColor ? `${memberRoleColor}44` : undefined,
                              }}
                            >
                              {m.roleName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline' className={m.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground'}>
                              {m.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-right'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => { setAssignOpen(true); setAssignMemberId(m.id); setAssignRoleId(''); }}
                              className='text-xs'
                            >
                              Change Role
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Role Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='sm:max-w-lg max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Define a new role with specific permissions.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label>Role Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder='e.g. Editor' className='mt-1.5' />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder='Brief description' className='mt-1.5' />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className='mt-2 grid grid-cols-1 gap-2 max-h-52 overflow-y-auto'>
                {ALL_PERMISSIONS.map((p) => (
                  <label key={p.key} className='flex items-center gap-3 rounded-lg border border-border p-2.5 cursor-pointer hover:bg-muted/50'>
                    <Checkbox
                      checked={newPerms.includes(p.key)}
                      onCheckedChange={() => togglePerm(p.key, newPerms, setNewPerms)}
                    />
                    <span className='text-sm'>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => void handleCreate()} disabled={createRole.isPending}>
              {createRole.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editRole} onOpenChange={(open) => !open && setEditRole(null)}>
        <DialogContent className='sm:max-w-lg max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit {editRole?.name}</DialogTitle>
            <DialogDescription>Update role details and permissions.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label>Role Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={editRole?.isSystem}
                className='mt-1.5'
              />
              {editRole?.isSystem && (
                <p className='mt-1 text-xs text-muted-foreground'>System role names cannot be changed.</p>
              )}
            </div>
            <div>
              <Label>Description</Label>
              <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className='mt-1.5' />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className='mt-2 grid grid-cols-1 gap-2 max-h-52 overflow-y-auto'>
                {ALL_PERMISSIONS.map((p) => (
                  <label key={p.key} className='flex items-center gap-3 rounded-lg border border-border p-2.5 cursor-pointer hover:bg-muted/50'>
                    <Checkbox
                      checked={editPerms.includes(p.key)}
                      onCheckedChange={() => togglePerm(p.key, editPerms, setEditPerms)}
                    />
                    <span className='text-sm'>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditRole(null)}>Cancel</Button>
            <Button onClick={() => void handleUpdate()} disabled={updateRole.isPending}>
              {updateRole.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant='destructive' onClick={() => void handleDelete()} disabled={deleteRole.isPending}>
              {deleteRole.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>Select a team member and assign a role.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label>Team Member</Label>
              <Select value={assignMemberId} onValueChange={setAssignMemberId}>
                <SelectTrigger className='mt-1.5 w-full'>
                  <SelectValue placeholder='Select member...' />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role</Label>
              <Select value={assignRoleId} onValueChange={setAssignRoleId}>
                <SelectTrigger className='mt-1.5 w-full'>
                  <SelectValue placeholder='Select role...' />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={() => void handleAssign()} disabled={assignRole.isPending}>
              {assignRole.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Admin Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Invite Admin</DialogTitle>
            <DialogDescription>Send an invitation to a new admin team member.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label>First Name</Label>
                <Input value={inviteFirst} onChange={(e) => setInviteFirst(e.target.value)} placeholder='Jane' className='mt-1.5' />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={inviteLast} onChange={(e) => setInviteLast(e.target.value)} placeholder='Doe' className='mt-1.5' />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type='email' value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder='jane@admin.com' className='mt-1.5' />
            </div>
            <div>
              <Label>Role <span className='text-muted-foreground'>(optional)</span></Label>
              <Select value={inviteRoleId} onValueChange={setInviteRoleId}>
                <SelectTrigger className='mt-1.5 w-full'>
                  <SelectValue placeholder='Assign a role...' />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setInviteOpen(false)} disabled={inviteMember.isPending}>Cancel</Button>
            <Button onClick={() => void handleInvite()} disabled={inviteMember.isPending} className='gradient-bg text-primary-foreground'>
              {inviteMember.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function roleColor_by_name(roleName: string, roles: ApiRole[]): string | undefined {
  const idx = roles.findIndex((r) => r.name === roleName);
  if (idx === -1) return undefined;
  return ROLE_COLORS[idx % ROLE_COLORS.length];
}

export default RolesPermissions;
