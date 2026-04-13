import { useState, type FC } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Edit, Trash2, Plus, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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

interface Permission {
  id: string;
  label: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  userCount: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: Date;
  avatar: string;
}

const allPermissions: Permission[] = [
  { id: 'users.view', label: 'View Users', description: 'View user accounts and profiles' },
  { id: 'users.manage', label: 'Manage Users', description: 'Create, edit, suspend user accounts' },
  { id: 'businesses.view', label: 'View Businesses', description: 'View business accounts' },
  {
    id: 'businesses.manage',
    label: 'Manage Businesses',
    description: 'Edit, suspend, approve businesses',
  },
  { id: 'billing.view', label: 'View Billing', description: 'View invoices and payment info' },
  { id: 'billing.manage', label: 'Manage Billing', description: 'Process refunds, adjust plans' },
  { id: 'analytics.view', label: 'View Analytics', description: 'Access analytics dashboards' },
  { id: 'api.manage', label: 'Manage API Keys', description: 'Generate and revoke API keys' },
  { id: 'system.settings', label: 'System Settings', description: 'Modify platform configuration' },
  {
    id: 'ai.manage',
    label: 'Manage AI Settings',
    description: 'Configure AI query limits and models',
  },
  { id: 'logs.view', label: 'View Activity Logs', description: 'Access audit and activity logs' },
  {
    id: 'roles.manage',
    label: 'Manage Roles',
    description: 'Create and edit roles and permissions',
  },
];

const initialRoles: Role[] = [
  {
    id: 'r1',
    name: 'Admin',
    description: 'Full platform access with all permissions',
    permissions: allPermissions.map((p) => p.id),
    color: 'hsl(217, 91%, 60%)',
    userCount: 2,
  },
  {
    id: 'r2',
    name: 'Manager',
    description: 'Business and user management without system settings',
    permissions: [
      'users.view',
      'users.manage',
      'businesses.view',
      'businesses.manage',
      'analytics.view',
      'logs.view',
      'billing.view',
    ],
    color: 'hsl(270, 70%, 60%)',
    userCount: 3,
  },
  {
    id: 'r3',
    name: 'Support',
    description: 'View-only access with limited user management',
    permissions: ['users.view', 'businesses.view', 'billing.view', 'logs.view'],
    color: 'hsl(174, 72%, 50%)',
    userCount: 4,
  },
  {
    id: 'r4',
    name: 'Billing',
    description: 'Full billing access with view-only user access',
    permissions: ['users.view', 'businesses.view', 'billing.view', 'billing.manage', 'logs.view'],
    color: 'hsl(40, 90%, 55%)',
    userCount: 2,
  },
];

const initialMembers: TeamMember[] = [
  {
    id: 'm1',
    name: 'Sarah Chen',
    email: 'sarah@servixos.com',
    role: 'Admin',
    lastActive: new Date(Date.now() - 300000),
    avatar: 'SC',
  },
  {
    id: 'm2',
    name: 'James Wilson',
    email: 'james@servixos.com',
    role: 'Billing',
    lastActive: new Date(Date.now() - 1800000),
    avatar: 'JW',
  },
  {
    id: 'm3',
    name: 'Maria Lopez',
    email: 'maria@servixos.com',
    role: 'Support',
    lastActive: new Date(Date.now() - 3600000),
    avatar: 'ML',
  },
  {
    id: 'm4',
    name: 'David Kim',
    email: 'david@servixos.com',
    role: 'Manager',
    lastActive: new Date(Date.now() - 7200000),
    avatar: 'DK',
  },
  {
    id: 'm5',
    name: 'Alex Torres',
    email: 'alex@servixos.com',
    role: 'Support',
    lastActive: new Date(Date.now() - 14400000),
    avatar: 'AT',
  },
  {
    id: 'm6',
    name: 'Lisa Park',
    email: 'lisa@servixos.com',
    role: 'Manager',
    lastActive: new Date(Date.now() - 21600000),
    avatar: 'LP',
  },
  {
    id: 'm7',
    name: 'Ryan Mitchell',
    email: 'ryan@servixos.com',
    role: 'Support',
    lastActive: new Date(Date.now() - 43200000),
    avatar: 'RM',
  },
  {
    id: 'm8',
    name: 'Emma Davis',
    email: 'emma@servixos.com',
    role: 'Admin',
    lastActive: new Date(Date.now() - 86400000),
    avatar: 'ED',
  },
  {
    id: 'm9',
    name: 'Chris Yang',
    email: 'chris@servixos.com',
    role: 'Manager',
    lastActive: new Date(Date.now() - 172800000),
    avatar: 'CY',
  },
  {
    id: 'm10',
    name: 'Nina Brown',
    email: 'nina@servixos.com',
    role: 'Support',
    lastActive: new Date(Date.now() - 259200000),
    avatar: 'NB',
  },
  {
    id: 'm11',
    name: 'Tom Harris',
    email: 'tom@servixos.com',
    role: 'Billing',
    lastActive: new Date(Date.now() - 345600000),
    avatar: 'TH',
  },
];

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const RolesPermissions: FC = () => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [assignMemberId, setAssignMemberId] = useState('');
  const [assignRoleId, setAssignRoleId] = useState('');

  const togglePerm = (permId: string) => {
    setSelectedPerms((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      toast.error('Role name is required');
      return;
    }
    if (selectedPerms.length === 0) {
      toast.error('Select at least one permission');
      return;
    }
    const newRole: Role = {
      id: `r${Date.now()}`,
      name: newRoleName.trim(),
      description: newRoleDesc.trim(),
      permissions: selectedPerms,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 55%)`,
      userCount: 0,
    };
    setRoles((prev) => [...prev, newRole]);
    setCreateOpen(false);
    setNewRoleName('');
    setNewRoleDesc('');
    setSelectedPerms([]);
    toast.success(`Role "${newRole.name}" created`);
  };

  const handleUpdateRole = () => {
    if (!editRole) return;
    setRoles((prev) =>
      prev.map((r) => (r.id === editRole.id ? { ...r, permissions: selectedPerms } : r))
    );
    setEditRole(null);
    setSelectedPerms([]);
    toast.success('Role permissions updated');
  };

  const handleDeleteRole = () => {
    if (!deleteRole) return;
    setRoles((prev) => prev.filter((r) => r.id !== deleteRole.id));
    setDeleteRole(null);
    toast.success(`Role "${deleteRole.name}" deleted`);
  };

  const handleAssignRole = () => {
    if (!assignMemberId || !assignRoleId) {
      toast.error('Select a member and role');
      return;
    }
    const role = roles.find((r) => r.id === assignRoleId);
    if (!role) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === assignMemberId ? { ...m, role: role.name } : m))
    );
    setAssignOpen(false);
    setAssignMemberId('');
    setAssignRoleId('');
    toast.success('Role assigned successfully');
  };

  const openEdit = (role: Role) => {
    setEditRole(role);
    setSelectedPerms([...role.permissions]);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Roles & Permissions</h1>
          <p className='text-sm text-muted-foreground'>Manage admin roles and team member access</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setAssignOpen(true)} className='gap-2'>
            <UserPlus size={16} /> Assign Role
          </Button>
          <Button
            onClick={() => {
              setCreateOpen(true);
              setSelectedPerms([]);
            }}
            className='gap-2'
          >
            <Plus size={16} /> Create Role
          </Button>
        </div>
      </div>

      {/* Role cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {roles.map((role, i) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className='relative overflow-hidden h-full'>
              <div
                className='absolute left-0 top-0 h-1 w-full'
                style={{ background: role.color }}
              />
              <CardContent className='p-5'>
                <div className='flex items-start justify-between'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <Shield size={18} style={{ color: role.color }} />
                      <h3 className='font-semibold text-foreground'>{role.name}</h3>
                    </div>
                    <p className='mt-1 text-xs text-muted-foreground'>{role.description}</p>
                  </div>
                  <div className='flex gap-1'>
                    <button
                      onClick={() => openEdit(role)}
                      className='rounded p-1 text-muted-foreground hover:text-foreground'
                    >
                      <Edit size={14} />
                    </button>
                    {role.name !== 'Admin' && (
                      <button
                        onClick={() => setDeleteRole(role)}
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
                    <Users size={12} /> {members.filter((m) => m.role === role.name).length}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

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
                    <TableHead>Last Active</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => {
                    const role = roles.find((r) => r.name === m.role);
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
                              {m.avatar}
                            </div>
                            <div>
                              <p className='font-medium text-foreground'>{m.name}</p>
                              <p className='text-xs text-muted-foreground'>{m.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            style={{
                              backgroundColor: role?.color
                                ? `${role.color.replace(')', ' / 0.15)')}`
                                : undefined,
                              color: role?.color,
                              borderColor: role?.color,
                            }}
                            variant='outline'
                          >
                            {m.role}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-sm text-muted-foreground'>
                          {timeAgo(m.lastActive)}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setAssignOpen(true);
                              setAssignMemberId(m.id);
                            }}
                            className='text-xs'
                          >
                            Change Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Role Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='sm:max-w-lg max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Define a new role with specific permissions.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label>Role Name</Label>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder='e.g. Editor'
                className='mt-1.5'
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                placeholder='Brief description'
                className='mt-1.5'
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className='mt-2 space-y-2 max-h-48 overflow-y-auto'>
                {allPermissions.map((p) => (
                  <label
                    key={p.id}
                    className='flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50'
                  >
                    <Checkbox
                      checked={selectedPerms.includes(p.id)}
                      onCheckedChange={() => togglePerm(p.id)}
                      className='mt-0.5'
                    />
                    <div>
                      <p className='text-sm font-medium text-foreground'>{p.label}</p>
                      <p className='text-xs text-muted-foreground'>{p.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole}>Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editRole} onOpenChange={() => setEditRole(null)}>
        <DialogContent className='sm:max-w-lg max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit {editRole?.name} Permissions</DialogTitle>
            <DialogDescription>Update the permissions for this role.</DialogDescription>
          </DialogHeader>
          <div className='space-y-2 max-h-96 overflow-y-auto'>
            {allPermissions.map((p) => (
              <label
                key={p.id}
                className='flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50'
              >
                <Checkbox
                  checked={selectedPerms.includes(p.id)}
                  onCheckedChange={() => togglePerm(p.id)}
                  className='mt-0.5'
                />
                <div>
                  <p className='text-sm font-medium text-foreground'>{p.label}</p>
                  <p className='text-xs text-muted-foreground'>{p.description}</p>
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditRole(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirm */}
      <Dialog open={!!deleteRole} onOpenChange={() => setDeleteRole(null)}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the <strong>{deleteRole?.name}</strong> role? Members
              with this role will need to be reassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteRole(null)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDeleteRole}>
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
              <select
                value={assignMemberId}
                onChange={(e) => setAssignMemberId(e.target.value)}
                className='mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              >
                <option value=''>Select member...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Role</Label>
              <select
                value={assignRoleId}
                onChange={(e) => setAssignRoleId(e.target.value)}
                className='mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              >
                <option value=''>Select role...</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignRole}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPermissions;
