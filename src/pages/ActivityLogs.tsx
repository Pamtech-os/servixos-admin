import { useState, useEffect, type FC } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PageHeader,
  SearchFilterBar,
  DataTablePagination,
  EmptyState,
} from '@/components/shared';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useDebounce } from '@/hooks/useDebounce';
import { formatRelativeTime } from '@/lib/format';

const ROLE_FILTERS = [
  { value: 'all',      label: 'All Roles' },
  { value: 'owner',    label: 'Owner' },
  { value: 'employee', label: 'Employee' },
  { value: 'client',   label: 'Client' },
  { value: 'staff',    label: 'Staff' },
];

const PAGE_LIMIT = 20;

const ActivityLogs: FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actorRole, setActorRole] = useState('all');

  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isFetching } = useActivityLogs({
    page,
    limit: PAGE_LIMIT,
    search: debouncedSearch,
    actorRole,
  });

  useEffect(() => { setPage(1); }, [debouncedSearch, actorRole]);

  const logs = data?.logs ?? [];
  const meta = data?.meta;

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Activity Logs'
        subtitle='Track all business actions across the platform'
      />

      <SearchFilterBar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); }}
        searchPlaceholder='Search by actor name, action, or target...'
        filters={
          <Select
            value={actorRole}
            onValueChange={(v) => { setActorRole(v); }}
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
        }
      />

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
                    <TableHead>Actor</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead className='text-right'>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(PAGE_LIMIT)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(5)].map((__, j) => (
                          <TableCell key={j}>
                            <div className='h-4 animate-pulse rounded bg-muted/60' />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : logs.length === 0 ? (
                    <EmptyState icon={ClipboardList} message='No activity logs match your filters.' colSpan={5} />
                  ) : (
                    logs.map((log) => (
                      <TableRow
                        key={log.id}
                        className={`border-b border-border transition-colors hover:bg-muted/50 ${isFetching ? 'opacity-60' : ''}`}
                      >
                        <TableCell>
                          <div>
                            <p className='text-sm font-medium'>{log.actorName}</p>
                            <p className='text-xs text-muted-foreground'>{log.actorEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline' className='capitalize text-xs'>
                            {log.actorRole}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-sm capitalize'>{log.action}</TableCell>
                        <TableCell className='text-sm'>{log.businessName}</TableCell>
                        <TableCell className='text-right text-xs text-muted-foreground whitespace-nowrap'>
                          {formatRelativeTime(new Date(log.createdAt))}
                        </TableCell>
                      </TableRow>
                    ))
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
    </div>
  );
};

export default ActivityLogs;
