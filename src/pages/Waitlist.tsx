import { useMemo, useState, type FC } from 'react';
import { motion } from 'framer-motion';
import { Users, Rocket, Lightbulb, Briefcase, Compass, Download, Loader2, X, Hourglass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  StatsGrid,
  SearchFilterBar,
  DataTablePagination,
  EmptyState,
  type StatItem,
} from '@/components/shared';
import { useWaitlist, useExportWaitlist } from '@/hooks/useWaitlist';
import { useDebounce } from '@/hooks/useDebounce';
import { formatRelativeTime } from '@/lib/format';
import { toast } from '@/lib/toast';
import { WAITLIST_PERSONAS, type WaitlistFilters, type WaitlistPersona } from '@/types/waitlist';

const PERSONA_META: Record<WaitlistPersona, { label: string; icon: typeof Users; color: string }> = {
  aspiring_founder: { label: 'Aspiring Founder', icon: Rocket,    color: 'text-violet-600' },
  has_idea:         { label: 'Has an Idea',      icon: Lightbulb, color: 'text-amber-600' },
  business_owner:   { label: 'Business Owner',   icon: Briefcase, color: 'text-emerald-600' },
  exploring:        { label: 'Exploring',        icon: Compass,   color: 'text-sky-600' },
};

const PAGE_LIMIT = 20;
const SEARCH_MAX = 100;

const INITIAL_FILTERS: WaitlistFilters = { search: '', persona: 'all', dateFrom: '', dateTo: '' };

const formatShare = (count: number, total: number): string =>
  total > 0 ? `${Math.round((count / total) * 100)}%` : '0%';

const Waitlist: FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<WaitlistFilters>(INITIAL_FILTERS);

  const debouncedSearch = useDebounce(filters.search, 350);
  const activeFilters: WaitlistFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const { data, isLoading, isFetching } = useWaitlist({ page, limit: PAGE_LIMIT, ...activeFilters });
  const exportWaitlist = useExportWaitlist();

  const entries = data?.entries ?? [];
  const meta = data?.meta;
  const stats = data?.stats;

  const statItems = useMemo<StatItem[]>(() => {
    const total = stats?.total ?? 0;
    return [
      { label: 'Total Signups', value: stats ? total.toLocaleString() : '—', icon: Users },
      ...WAITLIST_PERSONAS.map((p) => ({
        label: stats ? `${PERSONA_META[p].label} · ${formatShare(stats[p], total)}` : PERSONA_META[p].label,
        value: stats ? stats[p].toLocaleString() : '—',
        icon: PERSONA_META[p].icon,
        color: PERSONA_META[p].color,
      })),
    ];
  }, [stats]);

  const hasFilters =
    filters.search !== '' || filters.persona !== 'all' || filters.dateFrom !== '' || filters.dateTo !== '';

  const updateFilter = <K extends keyof WaitlistFilters>(key: K, value: WaitlistFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const handleExport = () => {
    exportWaitlist.mutate(activeFilters, {
      onSuccess: () => toast.success('Waitlist export downloaded'),
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to export waitlist'),
    });
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Waitlist'
        subtitle='Pre-launch signups and who they are'
        action={
          <Button
            variant='outline'
            onClick={handleExport}
            disabled={exportWaitlist.isPending || meta?.total === 0}
            className='gap-2'
          >
            {exportWaitlist.isPending
              ? <><Loader2 className='h-4 w-4 animate-spin' /> Exporting...</>
              : <><Download className='h-4 w-4' /> Export CSV</>}
          </Button>
        }
      />

      <StatsGrid stats={statItems} className='grid grid-cols-2 gap-4 lg:grid-cols-5' />

      <SearchFilterBar
        searchValue={filters.search}
        onSearchChange={(v) => updateFilter('search', v.slice(0, SEARCH_MAX))}
        searchPlaceholder='Search by first name or email...'
        filters={
          <>
            <Select
              value={filters.persona}
              onValueChange={(v) => updateFilter('persona', v as WaitlistFilters['persona'])}
            >
              <SelectTrigger className='w-44'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Personas</SelectItem>
                {WAITLIST_PERSONAS.map((p) => (
                  <SelectItem key={p} value={p}>{PERSONA_META[p].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type='date'
              aria-label='Joined from'
              value={filters.dateFrom}
              max={filters.dateTo || undefined}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className='w-40'
            />
            <Input
              type='date'
              aria-label='Joined to'
              value={filters.dateTo}
              min={filters.dateFrom || undefined}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className='w-40'
            />
            {hasFilters && (
              <Button variant='ghost' onClick={resetFilters} className='gap-1'>
                <X className='h-4 w-4' /> Clear
              </Button>
            )}
          </>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Describes Them</TableHead>
                    <TableHead className='text-right'>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(10)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(4)].map((__, j) => (
                          <TableCell key={j}>
                            <div className='h-4 animate-pulse rounded bg-muted/60' />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : entries.length === 0 ? (
                    <EmptyState
                      icon={Hourglass}
                      message={hasFilters ? 'No signups match your filters.' : 'No waitlist signups yet.'}
                      colSpan={4}
                    />
                  ) : (
                    entries.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className={`border-b border-border transition-colors hover:bg-muted/50 ${isFetching ? 'opacity-60' : ''}`}
                      >
                        <TableCell className='text-sm font-medium'>{entry.firstName}</TableCell>
                        <TableCell className='text-sm text-muted-foreground'>{entry.email}</TableCell>
                        <TableCell>
                          <Badge variant='outline' className='text-xs'>
                            {PERSONA_META[entry.persona]?.label ?? entry.persona}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className='text-right text-xs text-muted-foreground whitespace-nowrap'
                          title={new Date(entry.createdAt).toLocaleString()}
                        >
                          {formatRelativeTime(new Date(entry.createdAt))}
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

export default Waitlist;
