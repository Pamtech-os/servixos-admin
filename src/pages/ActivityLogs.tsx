import { useState, type FC } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  UserCog,
  HeadphonesIcon,
  Receipt,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { activityLogs, type ActivityLog } from '@/lib/admin-mock-data';

const ITEMS_PER_PAGE = 20;

const roleConfig: Record<
  ActivityLog['role'],
  { label: string; icon: typeof Shield; className: string }
> = {
  admin: {
    label: 'Admin',
    icon: Shield,
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  manager: {
    label: 'Manager',
    icon: UserCog,
    className: 'bg-secondary/10 text-secondary border-secondary/20',
  },
  support: {
    label: 'Support',
    icon: HeadphonesIcon,
    className: 'bg-accent/10 text-accent border-accent/20',
  },
  billing: {
    label: 'Billing',
    icon: Receipt,
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
};

const categoryColors: Record<ActivityLog['category'], string> = {
  user: 'bg-primary/10 text-primary',
  billing: 'bg-amber-500/10 text-amber-600',
  business: 'bg-emerald-500/10 text-emerald-600',
  system: 'bg-muted text-muted-foreground',
  ai: 'bg-accent/10 text-accent',
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const ActivityLogs: FC = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<ActivityLog['role'] | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      !search ||
      log.performer.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || log.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const roles: (ActivityLog['role'] | 'all')[] = ['all', 'admin', 'manager', 'support', 'billing'];

  const handleFilterChange = (role: ActivityLog['role'] | 'all') => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <div className='space-y-6'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className='text-2xl font-bold'>Activity Logs</h1>
        <p className='text-muted-foreground'>Track all business actions across the platform</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className='flex flex-col gap-3 sm:flex-row sm:items-center'
      >
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search by name, action, or target...'
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='pl-9'
          />
        </div>
        <div className='flex gap-2 flex-wrap'>
          {roles.map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? 'default' : 'outline'}
              size='sm'
              onClick={() => handleFilterChange(role)}
              className={roleFilter === role ? 'gradient-bg text-primary-foreground' : ''}
            >
              {role === 'all' ? 'All Roles' : roleConfig[role].label}
            </Button>
          ))}
        </div>
      </motion.div>

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
                    <TableHead>Performer</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className='text-right'>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log) => {
                    const roleInfo = roleConfig[log.role];
                    const RoleIcon = roleInfo.icon;
                    return (
                      <TableRow
                        key={log.id}
                        className='border-b border-border transition-colors hover:bg-muted/50'
                      >
                        <TableCell>
                          <div>
                            <p className='text-sm font-medium'>{log.performer}</p>
                            <p className='text-xs text-muted-foreground'>{log.performerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline' className={`gap-1 ${roleInfo.className}`}>
                            <RoleIcon className='h-3 w-3' />
                            {roleInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-sm'>{log.action}</TableCell>
                        <TableCell className='text-sm text-muted-foreground max-w-[200px] truncate'>
                          {log.target}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              categoryColors[log.category]
                            }`}
                          >
                            {log.category}
                          </span>
                        </TableCell>
                        <TableCell className='text-right text-xs text-muted-foreground whitespace-nowrap'>
                          {timeAgo(log.timestamp)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {paginatedLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className='py-8 text-center text-muted-foreground'>
                        No activity logs match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className='flex items-center justify-between border-t border-border px-4 py-3'>
                <p className='text-sm text-muted-foreground'>
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of{' '}
                  {filteredLogs.length}
                </p>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className='h-4 w-4' />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setCurrentPage(i + 1)}
                      className={currentPage === i + 1 ? 'gradient-bg text-primary-foreground' : ''}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ActivityLogs;
