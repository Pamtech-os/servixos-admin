import { useState, useMemo, type FC } from 'react';
import { motion } from 'framer-motion';
import { Eye, Ban, Mail, CheckCircle2, KeyRound, UserPlus, Users as UsersIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  users as initialUsers,
  type User,
  type UserRole,
  type UserStatus,
} from '@/lib/users-mock-data';
import { toast } from 'sonner';
import { formatRelativeTime } from '@/lib/format';
import { usePagination } from '@/hooks/usePagination';
import { useSelection } from '@/hooks/useSelection';
import {
  PageHeader,
  StatsGrid,
  DataTablePagination,
  SearchFilterBar,
  ConfirmDialog,
  EmailDialog,
  EmptyState,
  BulkActions,
} from '@/components/shared';

const statusConfig: Record<UserStatus, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  suspended: {
    label: 'Suspended',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
};

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  owner: { label: 'Owner', className: 'bg-primary/10 text-primary' },
  admin: { label: 'Admin', className: 'bg-secondary/10 text-secondary' },
  manager: { label: 'Manager', className: 'bg-accent/10 text-accent' },
  employee: { label: 'Employee', className: 'bg-muted text-muted-foreground' },
};

const statuses: (UserStatus | 'all')[] = ['all', 'active', 'suspended', 'pending'];
const roles: (UserRole | 'all')[] = ['all', 'owner', 'admin', 'manager', 'employee'];

const Users: FC = () => {
  const [userList, setUserList] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [detailUser, setDetailUser] = useState<User | null>(null);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmIds, setConfirmIds] = useState<string[]>([]);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'reactivate'>('suspend');

  // Email dialog
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTargets, setEmailTargets] = useState<{ id: string; name: string }[]>([]);

  // Invite dialog
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('employee');
  const [inviteBusiness, setInviteBusiness] = useState('');

  const filtered = useMemo(() => {
    return userList.filter((u) => {
      const matchesSearch =
        !search ||
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.businessName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [userList, search, statusFilter, roleFilter]);

  const {
    currentPage,
    totalPages,
    paginated,
    setCurrentPage,
    startIndex,
    endIndex,
    totalItems,
    resetPage,
  } = usePagination(filtered);
  const { selected, toggle, toggleAll, clear, isAllSelected } = useSelection(paginated);

  const resetFilters = () => {
    resetPage();
    clear();
  };

  const openConfirmDialog = (ids: string[]) => {
    const targets = userList.filter((u) => ids.includes(u.id));
    setConfirmAction(targets.every((u) => u.status === 'suspended') ? 'reactivate' : 'suspend');
    setConfirmIds(ids);
    setConfirmOpen(true);
  };

  const executeStatusChange = () => {
    setUserList((prev) =>
      prev.map((u) =>
        confirmIds.includes(u.id)
          ? {
              ...u,
              status: u.status === 'suspended' ? ('active' as const) : ('suspended' as const),
            }
          : u
      )
    );
    clear();
    setConfirmOpen(false);
    toast.success(
      `${confirmIds.length} user(s) ${confirmAction === 'suspend' ? 'suspended' : 'reactivated'}`
    );
    if (detailUser && confirmIds.includes(detailUser.id)) setDetailUser(null);
  };

  const openEmailDialog = (targets: User[]) => {
    setEmailTargets(targets.map((t) => ({ id: t.id, name: t.fullName })));
    setEmailOpen(true);
  };

  const handleInvite = () => {
    if (!inviteName.trim() || !inviteEmail.trim() || !inviteBusiness.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      fullName: inviteName,
      email: inviteEmail,
      role: inviteRole,
      businessName: inviteBusiness,
      businessId: `b${Date.now()}`,
      status: 'pending',
      dateJoined: new Date(),
      lastActive: new Date(),
    };
    setUserList((prev) => [newUser, ...prev]);
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInviteRole('employee');
    setInviteBusiness('');
  };

  const selectedUsers = userList.filter((u) => selected.has(u.id));

  const stats = [
    { label: 'Total Users', value: userList.length, icon: UsersIcon },
    {
      label: 'Active Users',
      value: userList.filter((u) => u.status === 'active').length,
      icon: CheckCircle2,
    },
    {
      label: 'Business Owners',
      value: userList.filter((u) => u.role === 'owner').length,
      icon: KeyRound,
    },
    {
      label: 'Team Members',
      value: userList.filter((u) => u.role !== 'owner').length,
      icon: UserPlus,
    },
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

      <StatsGrid stats={stats} />

      <SearchFilterBar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          resetFilters();
        }}
        searchPlaceholder='Search by name, email, or business...'
        filters={
          <>
            <div className='flex gap-2 flex-wrap'>
              {statuses.map((s) => (
                <Button
                  key={s}
                  variant={statusFilter === s ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => {
                    setStatusFilter(s);
                    resetFilters();
                  }}
                  className={statusFilter === s ? 'gradient-bg text-primary-foreground' : ''}
                >
                  {s === 'all' ? 'All Status' : statusConfig[s].label}
                </Button>
              ))}
            </div>
            <div className='h-6 w-px bg-border self-center mx-1 hidden sm:block' />
            <div className='flex gap-2 flex-wrap'>
              {roles.map((r) => (
                <Button
                  key={r}
                  variant={roleFilter === r ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => {
                    setRoleFilter(r);
                    resetFilters();
                  }}
                  className={roleFilter === r ? 'gradient-bg text-primary-foreground' : ''}
                >
                  {r === 'all' ? 'All Roles' : roleConfig[r].label}
                </Button>
              ))}
            </div>
          </>
        }
      />

      <BulkActions count={selected.size} onClear={clear}>
        <Button
          size='sm'
          variant='outline'
          onClick={() => openConfirmDialog(Array.from(selected))}
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

      {/* Table */}
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
                    <TableHead>Last Active</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((user) => (
                    <TableRow key={user.id} className='border-b border-border transition-colors hover:bg-muted/50'>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(user.id)}
                          onCheckedChange={() => toggle(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='text-sm font-medium'>{user.fullName}</p>
                          <p className='text-xs text-muted-foreground'>{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className='text-sm'>{user.businessName}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            roleConfig[user.role].className
                          }`}
                        >
                          {roleConfig[user.role].label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline' className={statusConfig[user.status].className}>
                          {statusConfig[user.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {formatRelativeTime(user.lastActive)}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => setDetailUser(user)}
                            title='View details'
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => openEmailDialog([user])}
                            title='Send email'
                          >
                            <Mail className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => openConfirmDialog([user.id])}
                            title={user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          >
                            {user.status === 'suspended' ? (
                              <CheckCircle2 className='h-4 w-4 text-emerald-600' />
                            ) : (
                              <Ban className='h-4 w-4 text-destructive' />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginated.length === 0 && (
                    <EmptyState
                      icon={UsersIcon}
                      message='No users match your filters.'
                      colSpan={7}
                    />
                  )}
                </TableBody>
              </Table>
            </div>
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* User Detail Dialog */}
      <Dialog open={!!detailUser} onOpenChange={(open) => !open && setDetailUser(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Full details for {detailUser?.fullName}</DialogDescription>
          </DialogHeader>
          {detailUser && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-xs text-muted-foreground'>Full Name</Label>
                  <p className='text-sm font-medium'>{detailUser.fullName}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Email</Label>
                  <p className='text-sm font-medium'>{detailUser.email}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Business</Label>
                  <p className='text-sm font-medium'>{detailUser.businessName}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Role</Label>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      roleConfig[detailUser.role].className
                    }`}
                  >
                    {roleConfig[detailUser.role].label}
                  </span>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Date Joined</Label>
                  <p className='text-sm font-medium'>
                    {detailUser.dateJoined.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Status</Label>
                  <Badge variant='outline' className={statusConfig[detailUser.status].className}>
                    {statusConfig[detailUser.status].label}
                  </Badge>
                </div>
                <div className='col-span-2'>
                  <Label className='text-xs text-muted-foreground'>Last Active</Label>
                  <p className='text-sm font-medium'>{formatRelativeTime(detailUser.lastActive)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className='gap-2 flex-wrap'>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                detailUser && toast.success(`Password reset link sent to ${detailUser.email}`)
              }
              className='gap-1'
            >
              <KeyRound className='h-3.5 w-3.5' /> Reset Password
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => detailUser && openEmailDialog([detailUser])}
              className='gap-1'
            >
              <Mail className='h-3.5 w-3.5' /> Send Email
            </Button>
            <Button
              variant={detailUser?.status === 'suspended' ? 'default' : 'destructive'}
              size='sm'
              onClick={() => detailUser && openConfirmDialog([detailUser.id])}
              className='gap-1'
            >
              {detailUser?.status === 'suspended' ? (
                <>
                  <CheckCircle2 className='h-3.5 w-3.5' /> Reactivate
                </>
              ) : (
                <>
                  <Ban className='h-3.5 w-3.5' /> Suspend
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction === 'suspend' ? 'Suspend User' : 'Reactivate User'}
        description={`Are you sure you want to ${confirmAction} ${
          confirmIds.length === 1 ? 'this user' : `${confirmIds.length} users`
        }? ${
          confirmAction === 'suspend'
            ? 'They will lose access to the platform.'
            : 'They will regain access to the platform.'
        }`}
        confirmLabel={confirmAction === 'suspend' ? 'Suspend' : 'Reactivate'}
        variant={confirmAction === 'suspend' ? 'destructive' : 'default'}
        onConfirm={executeStatusChange}
      />

      {/* Email Dialog */}
      <EmailDialog open={emailOpen} onOpenChange={setEmailOpen} targets={emailTargets} />

      {/* Invite User Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>Send an invitation to join the platform</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='invite-name'>Full Name</Label>
              <Input
                id='invite-name'
                placeholder='Enter full name...'
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='invite-email'>Email</Label>
              <Input
                id='invite-email'
                type='email'
                placeholder='Enter email address...'
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='invite-business'>Business Name</Label>
              <Input
                id='invite-business'
                placeholder='Enter business name...'
                value={inviteBusiness}
                onChange={(e) => setInviteBusiness(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label>Role</Label>
              <div className='flex flex-wrap gap-2'>
                {(['owner', 'admin', 'manager', 'employee'] as UserRole[]).map((r) => (
                  <Button
                    key={r}
                    variant={inviteRole === r ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setInviteRole(r)}
                    className={inviteRole === r ? 'gradient-bg text-primary-foreground' : ''}
                  >
                    {roleConfig[r].label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} className='gradient-bg text-primary-foreground'>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
