import { useState, useEffect, type FC } from 'react';
import { motion } from 'framer-motion';
import { Eye, Ban, Mail, CheckCircle2, KeyRound, UserPlus, Users as UsersIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { formatRelativeTime } from '@/lib/format';
import { ApiError } from '@/lib/api-client';
import { useDebounce } from '@/hooks/useDebounce';
import { useSelection } from '@/hooks/useSelection';
import {
  useUsers, useToggleSuspendUser, useBulkToggleSuspendUsers,
  useInviteUser, useResetUserPassword, useSendUserEmail,
} from '@/hooks/useUsers';
import {
  PageHeader, StatsGrid, DataTablePagination, SearchFilterBar,
  ConfirmDialog, EmailDialog, EmptyState, BulkActions,
} from '@/components/shared';
import type { ApiUser, UserStatusFilter, UserRoleFilter } from '@/types/users';
import { deriveUserStatus } from '@/types/users';
import ModernSpinner from '@/components/ModernSpinner';

const STATUS_CONFIG = {
  active:    { label: 'Active',    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  suspended: { label: 'Suspended', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  pending:   { label: 'Pending',   className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
} as const;

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  owner:    { label: 'Owner',    className: 'bg-primary/10 text-primary' },
  employee: { label: 'Employee', className: 'bg-muted text-muted-foreground' },
  staff:    { label: 'Staff',    className: 'bg-accent/10 text-accent' },
  client:   { label: 'Client',   className: 'bg-secondary/10 text-secondary' },
};

const STATUS_FILTERS: { value: UserStatusFilter; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending' },
];
const ROLE_FILTERS: { value: UserRoleFilter; label: string }[] = [
  { value: 'all', label: 'All Roles' },
  { value: 'owner', label: 'Owner' },
  { value: 'employee', label: 'Employee' },
  { value: 'client', label: 'Client' },
];
const PAGE_LIMIT = 10;

const Users: FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('all');
  const [detailUser, setDetailUser] = useState<ApiUser | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmIds, setConfirmIds] = useState<string[]>([]);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'reactivate'>('suspend');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTargets, setEmailTargets] = useState<{ id: string; name: string }[]>([]);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'employee'>('employee');
  const [inviteBusiness, setInviteBusiness] = useState('');

  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isFetching } = useUsers({
    page, limit: PAGE_LIMIT, search: debouncedSearch, status: statusFilter, role: roleFilter,
  });

  const toggleSuspend = useToggleSuspendUser();
  const bulkToggleSuspend = useBulkToggleSuspendUsers();
  const inviteUser = useInviteUser();
  const resetPassword = useResetUserPassword();
  const sendEmail = useSendUserEmail();

  const users = data?.users ?? [];
  const meta = data?.meta;
  const stats = data?.stats;

  const { selected, toggle, toggleAll, clear, isAllSelected } = useSelection(users);

  // Clear selection on page change
  useEffect(() => { clear(); }, [page, clear]);

  const resetFilters = () => { setPage(1); clear(); };

  const openConfirmDialog = (ids: string[], currentUsers: ApiUser[]) => {
    const targets = currentUsers.filter((u) => ids.includes(u.id));
    const allSuspended = targets.every((u) => !u.isActive);
    setConfirmAction(allSuspended ? 'reactivate' : 'suspend');
    setConfirmIds(ids);
    setConfirmOpen(true);
  };

  const executeStatusChange = async () => {
    setConfirmLoading(true);
    try {
      if (confirmIds.length === 1) {
        await toggleSuspend.mutateAsync(confirmIds[0]);
      } else {
        await bulkToggleSuspend.mutateAsync({ userIds: confirmIds });
      }
      clear();
      setConfirmOpen(false);
      if (detailUser && confirmIds.includes(detailUser.id)) setDetailUser(null);
      toast.success(
        `${confirmIds.length} user${confirmIds.length > 1 ? 's' : ''} ${confirmAction === 'suspend' ? 'suspended' : 'reactivated'}`
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Action failed');
    } finally {
      setConfirmLoading(false);
    }
  };

  const openEmailDialog = (targets: ApiUser[]) => {
    setEmailTargets(targets.map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}` })));
    setEmailOpen(true);
  };

  const handleSendEmail = async (subject: string, message: string) => {
    await sendEmail.mutateAsync({ ids: emailTargets.map((t) => t.id), subject, message });
  };

  const handleResetPassword = async (user: ApiUser) => {
    try {
      await resetPassword.mutateAsync(user.id);
      toast.success(`Password reset email sent to ${user.email}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Reset failed');
    }
  };

  const handleInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error('Name and email are required');
      return;
    }
    try {
      await inviteUser.mutateAsync({
        fullName: inviteName,
        email: inviteEmail,
        role: inviteRole,
        businessName: inviteBusiness.trim() || undefined,
      });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInviteRole('employee');
      setInviteBusiness('');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Invite failed');
    }
  };

  const selectedUsers = users.filter((u) => selected.has(u.id));

  const statItems = [
    { label: 'Total Users',     value: stats?.totalUsers     ?? '—', icon: UsersIcon },
    { label: 'Active Users',    value: stats?.activeUsers    ?? '—', icon: CheckCircle2 },
    { label: 'Business Owners', value: stats?.businessOwners ?? '—', icon: KeyRound },
    { label: 'Team Members',    value: stats?.teamMembers    ?? '—', icon: UserPlus },
    { label: 'Clients',         value: stats?.clients        ?? '—', icon: UsersIcon },
  ];

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Users'
        subtitle='Manage business owners and their team members'
        action={
          <Button
            onClick={() => setInviteOpen(true)}
            className='gradient-bg text-primary-foreground gap-1 w-full sm:w-auto'
          >
            <UserPlus className='h-4 w-4' /> Invite User
          </Button>
        }
      />

      <StatsGrid stats={statItems} className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5' />

      <SearchFilterBar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); resetFilters(); }}
        searchPlaceholder='Search by name or email...'
        filters={
          <div className='flex gap-2'>
            <Select
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v as UserStatusFilter); resetFilters(); }}
            >
              <SelectTrigger className='w-36'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={roleFilter}
              onValueChange={(v) => { setRoleFilter(v as UserRoleFilter); resetFilters(); }}
            >
              <SelectTrigger className='w-36'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_FILTERS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <BulkActions count={selected.size} onClear={clear}>
        <Button
          size='sm'
          variant='outline'
          onClick={() => openConfirmDialog(Array.from(selected), users)}
          className='gap-1'
        >
          <Ban className='h-3.5 w-3.5' /> Toggle Suspend
        </Button>
        <Button
          size='sm'
          variant='outline'
          onClick={() => openEmailDialog(selectedUsers)}
          className='gap-1'
        >
          <Mail className='h-3.5 w-3.5' /> Send Email
        </Button>
      </BulkActions>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-10'>
                      <Checkbox checked={isAllSelected} onCheckedChange={toggleAll} />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(PAGE_LIMIT)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(7)].map((__, j) => (
                          <TableCell key={j}>
                            <div className='h-4 animate-pulse rounded bg-muted/60' />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <EmptyState icon={UsersIcon} message='No users match your filters.' colSpan={7} />
                  ) : (
                    users.map((user) => {
                      const status = deriveUserStatus(user);
                      const role = ROLE_CONFIG[user.userRole] ?? { label: user.userRole, className: 'bg-muted text-muted-foreground' };
                      return (
                        <TableRow
                          key={user.id}
                          className={`border-b border-border transition-colors hover:bg-muted/50 ${isFetching ? 'opacity-60' : ''}`}
                        >
                          <TableCell>
                            <Checkbox checked={selected.has(user.id)} onCheckedChange={() => toggle(user.id)} />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className='text-sm font-medium'>{user.firstName} {user.lastName}</p>
                              <p className='text-xs text-muted-foreground'>{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className='text-sm'>{user.businessName}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${role.className}`}>
                              {role.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline' className={STATUS_CONFIG[status].className}>
                              {STATUS_CONFIG[status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            {formatRelativeTime(new Date(user.createdAt))}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex items-center justify-end gap-1'>
                              <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => setDetailUser(user)} title='View'>
                                <Eye className='h-4 w-4' />
                              </Button>
                              <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => openEmailDialog([user])} title='Email'>
                                <Mail className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost' size='icon' className='h-8 w-8'
                                onClick={() => openConfirmDialog([user.id], users)}
                                title={user.isActive ? 'Suspend' : 'Reactivate'}
                              >
                                {user.isActive
                                  ? <Ban className='h-4 w-4 text-destructive' />
                                  : <CheckCircle2 className='h-4 w-4 text-emerald-600' />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            {meta && (
              <DataTablePagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                startIndex={(meta.page - 1) * meta.limit + 1}
                endIndex={Math.min(meta.page * meta.limit, meta.total)}
                totalItems={meta.total}
                onPageChange={setPage}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Detail Dialog */}
      <Dialog open={!!detailUser} onOpenChange={(open) => !open && setDetailUser(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              {detailUser ? `${detailUser.firstName} ${detailUser.lastName}` : ''}
            </DialogDescription>
          </DialogHeader>
          {detailUser && (() => {
            const status = deriveUserStatus(detailUser);
            const role = ROLE_CONFIG[detailUser.userRole] ?? { label: detailUser.userRole, className: '' };
            return (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Name</Label>
                    <p className='text-sm font-medium'>{detailUser.firstName} {detailUser.lastName}</p>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Email</Label>
                    <p className='text-sm font-medium break-all'>{detailUser.email}</p>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Business</Label>
                    <p className='text-sm font-medium'>{detailUser.businessName}</p>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Role</Label>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${role.className}`}>
                      {role.label}
                    </span>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Joined</Label>
                    <p className='text-sm font-medium'>
                      {new Date(detailUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Status</Label>
                    <Badge variant='outline' className={STATUS_CONFIG[status].className}>
                      {STATUS_CONFIG[status].label}
                    </Badge>
                  </div>
                  {detailUser.lastLoginAt && (
                    <div className='col-span-2'>
                      <Label className='text-xs text-muted-foreground'>Last Login</Label>
                      <p className='text-sm font-medium'>{formatRelativeTime(new Date(detailUser.lastLoginAt))}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          <DialogFooter className='gap-2 flex-wrap'>
            <Button
              variant='outline' size='sm'
              disabled={resetPassword.isPending}
              onClick={() => detailUser && void handleResetPassword(detailUser)}
              className='gap-1'
            >
              {resetPassword.isPending ? <ModernSpinner size='sm' /> : <KeyRound className='h-3.5 w-3.5' />}
              Reset Password
            </Button>
            <Button variant='outline' size='sm' onClick={() => detailUser && openEmailDialog([detailUser])} className='gap-1'>
              <Mail className='h-3.5 w-3.5' /> Send Email
            </Button>
            <Button
              variant={detailUser?.isActive ? 'destructive' : 'default'}
              size='sm'
              onClick={() => detailUser && openConfirmDialog([detailUser.id], users)}
              className='gap-1'
            >
              {detailUser?.isActive
                ? <><Ban className='h-3.5 w-3.5' /> Suspend</>
                : <><CheckCircle2 className='h-3.5 w-3.5' /> Reactivate</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction === 'suspend' ? 'Suspend User(s)' : 'Reactivate User(s)'}
        description={`Are you sure you want to ${confirmAction} ${
          confirmIds.length === 1 ? 'this user' : `${confirmIds.length} users`
        }? ${confirmAction === 'suspend' ? 'They will lose access to the platform.' : 'They will regain access.'}`}
        confirmLabel={confirmAction === 'suspend' ? 'Suspend' : 'Reactivate'}
        variant={confirmAction === 'suspend' ? 'destructive' : 'default'}
        onConfirm={() => void executeStatusChange()}
        loading={confirmLoading}
      />

      <EmailDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        targets={emailTargets}
        onSend={handleSendEmail}
      />

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>Send an invitation with a temporary password</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='invite-name'>Full Name</Label>
              <Input id='invite-name' placeholder='Jane Doe' value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='invite-email'>Email</Label>
              <Input id='invite-email' type='email' placeholder='jane@company.com' value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='invite-business'>Business Name <span className='text-muted-foreground'>(optional)</span></Label>
              <Input id='invite-business' placeholder='Existing business name...' value={inviteBusiness} onChange={(e) => setInviteBusiness(e.target.value)} />
            </div>
            <div className='space-y-2'>
              <Label>Role</Label>
              <div className='flex gap-2'>
                {(['owner', 'employee'] as const).map((r) => (
                  <Button
                    key={r}
                    variant={inviteRole === r ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setInviteRole(r)}
                    className={inviteRole === r ? 'gradient-bg text-primary-foreground' : ''}
                  >
                    {ROLE_CONFIG[r].label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setInviteOpen(false)} disabled={inviteUser.isPending}>Cancel</Button>
            <Button
              onClick={() => void handleInvite()}
              className='gradient-bg text-primary-foreground gap-1'
              disabled={inviteUser.isPending}
            >
              {inviteUser.isPending ? <ModernSpinner size='sm' color='primary-foreground' /> : null}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
