import { useState, useEffect, type FC } from 'react';
import { motion } from 'framer-motion';
import { Eye, Ban, Mail, CheckCircle2, Building2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api-client';
import { useDebounce } from '@/hooks/useDebounce';
import { useSelection } from '@/hooks/useSelection';
import {
  useBusinesses, useToggleSuspendBusiness,
  useBulkToggleSuspendBusinesses, useSendBusinessEmail,
} from '@/hooks/useBusinesses';
import {
  PageHeader, DataTablePagination, SearchFilterBar,
  ConfirmDialog, EmailDialog, EmptyState, BulkActions,
} from '@/components/shared';
import type { ApiBusiness, BusinessStatusFilter } from '@/types/businesses';

const STATUS_CONFIG = {
  active:    { label: 'Active',    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  suspended: { label: 'Suspended', className: 'bg-destructive/10 text-destructive border-destructive/20' },
} as const;

const PLAN_COLORS: Record<string, string> = {
  free:       'bg-muted text-muted-foreground',
  starter:    'bg-primary/10 text-primary',
  pro:        'bg-secondary/10 text-secondary',
  enterprise: 'bg-accent/10 text-accent',
};

const STATUS_FILTERS: { value: BusinessStatusFilter; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];
const PAGE_LIMIT = 10;

function bizStatus(b: ApiBusiness): 'active' | 'suspended' {
  return b.isSuspended === true ? 'suspended' : 'active';
}

const Businesses: FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BusinessStatusFilter>('all');
  const [detailBiz, setDetailBiz] = useState<ApiBusiness | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmIds, setConfirmIds] = useState<string[]>([]);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'reactivate'>('suspend');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTargets, setEmailTargets] = useState<{ id: string; name: string }[]>([]);

  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isFetching } = useBusinesses({
    page, limit: PAGE_LIMIT, search: debouncedSearch, status: statusFilter,
  });

  const toggleSuspend = useToggleSuspendBusiness();
  const bulkToggle = useBulkToggleSuspendBusinesses();
  const sendEmail = useSendBusinessEmail();

  const businesses = data?.businesses ?? [];
  const meta = data?.meta;

  const { selected, toggle, toggleAll, clear, isAllSelected } = useSelection(businesses);

  useEffect(() => { clear(); }, [page, clear]);

  const resetFilters = () => { setPage(1); clear(); };

  const openConfirmDialog = (ids: string[], currentList: ApiBusiness[]) => {
    const targets = currentList.filter((b) => ids.includes(b.id));
    const allSuspended = targets.every((b) => b.isSuspended);
    setConfirmAction(allSuspended ? 'reactivate' : 'suspend');
    setConfirmIds(ids);
    setConfirmOpen(true);
  };

  const executeStatusChange = async () => {
    setConfirmLoading(true);
    try {
      if (confirmIds.length === 1) {
        await toggleSuspend.mutateAsync({ id: confirmIds[0], action: confirmAction });
      } else {
        await bulkToggle.mutateAsync(confirmIds);
      }
      clear();
      setConfirmOpen(false);
      if (detailBiz && confirmIds.includes(detailBiz.id)) setDetailBiz(null);
      toast.success(
        `${confirmIds.length} business${confirmIds.length > 1 ? 'es' : ''} ${confirmAction === 'suspend' ? 'suspended' : 'reactivated'}`
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Action failed');
    } finally {
      setConfirmLoading(false);
    }
  };

  const openEmailDialog = (targets: ApiBusiness[]) => {
    setEmailTargets(targets.map((b) => ({ id: b.id, name: b.name })));
    setEmailOpen(true);
  };

  const handleSendEmail = async (subject: string, message: string) => {
    await sendEmail.mutateAsync({ ids: emailTargets.map((t) => t.id), subject, message });
  };

  const selectedBusinesses = businesses.filter((b) => selected.has(b.id));

  return (
    <div className='space-y-6'>
      <PageHeader title='Businesses' subtitle='Manage all registered businesses on the platform' />

      <SearchFilterBar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); resetFilters(); }}
        searchPlaceholder='Search by name or owner email...'
        filters={
          <Select
            value={statusFilter}
            onValueChange={(v) => { setStatusFilter(v as BusinessStatusFilter); resetFilters(); }}
          >
            <SelectTrigger className='w-40'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <BulkActions count={selected.size} onClear={clear}>
        <Button
          size='sm'
          variant='outline'
          onClick={() => openConfirmDialog(Array.from(selected), businesses)}
          className='gap-1'
        >
          <Ban className='h-3.5 w-3.5' /> Toggle Suspend
        </Button>
        <Button
          size='sm'
          variant='outline'
          onClick={() => openEmailDialog(selectedBusinesses)}
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
                    <TableHead>Owner</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
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
                  ) : businesses.length === 0 ? (
                    <EmptyState icon={Building2} message='No businesses match your filters.' colSpan={7} />
                  ) : (
                    businesses.map((biz) => {
                      const status = bizStatus(biz);
                      const planKey = (biz.subscription?.plan ?? '').toLowerCase();
                      return (
                        <TableRow
                          key={biz.id}
                          className={`border-b border-border transition-colors hover:bg-muted/50 ${isFetching ? 'opacity-60' : ''}`}
                        >
                          <TableCell>
                            <Checkbox checked={selected.has(biz.id)} onCheckedChange={() => toggle(biz.id)} />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className='text-sm font-medium'>{biz.ownerFirstName} {biz.ownerLastName}</p>
                              <p className='text-xs text-muted-foreground'>{biz.ownerEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell className='text-sm font-medium'>{biz.name}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PLAN_COLORS[planKey] ?? 'bg-muted text-muted-foreground'}`}>
                              {planKey.charAt(0).toUpperCase() + planKey.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline' className={STATUS_CONFIG[status].className}>
                              {STATUS_CONFIG[status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            {new Date(biz.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex items-center justify-end gap-1'>
                              <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => setDetailBiz(biz)} title='View'>
                                <Eye className='h-4 w-4' />
                              </Button>
                              <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => openEmailDialog([biz])} title='Email'>
                                <Mail className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost' size='icon' className='h-8 w-8'
                                onClick={() => openConfirmDialog([biz.id], businesses)}
                                title={biz.isSuspended ? 'Reactivate' : 'Suspend'}
                              >
                                {biz.isSuspended
                                  ? <CheckCircle2 className='h-4 w-4 text-emerald-600' />
                                  : <Ban className='h-4 w-4 text-destructive' />}
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

      {/* Business Detail Dialog */}
      <Dialog open={!!detailBiz} onOpenChange={(open) => !open && setDetailBiz(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Business Details</DialogTitle>
            <DialogDescription>{detailBiz?.name}</DialogDescription>
          </DialogHeader>
          {detailBiz && (() => {
            const status = bizStatus(detailBiz);
            const detailPlanKey = (detailBiz.subscription?.plan ?? '').toLowerCase();
            return (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Business</Label>
                    <p className='text-sm font-medium'>{detailBiz.name}</p>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Plan</Label>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PLAN_COLORS[detailPlanKey] ?? 'bg-muted text-muted-foreground'}`}>
                      {detailPlanKey.charAt(0).toUpperCase() + detailPlanKey.slice(1)}
                    </span>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Owner</Label>
                    <p className='text-sm font-medium'>{detailBiz.ownerFirstName} {detailBiz.ownerLastName}</p>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Owner Email</Label>
                    <p className='text-sm font-medium break-all'>{detailBiz.ownerEmail}</p>
                  </div>
                  {detailBiz.categoryName && (
                    <div>
                      <Label className='text-xs text-muted-foreground'>Category</Label>
                      <p className='text-sm font-medium'>{detailBiz.categoryName}</p>
                    </div>
                  )}
                  <div>
                    <Label className='text-xs text-muted-foreground'>Subscription</Label>
                    <p className='text-sm font-medium capitalize'>{detailBiz.subscription?.status ?? '—'}</p>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Created</Label>
                    <p className='text-sm font-medium'>
                      {new Date(detailBiz.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Status</Label>
                    <Badge variant='outline' className={STATUS_CONFIG[status].className}>
                      {STATUS_CONFIG[status].label}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })()}
          <DialogFooter className='gap-2'>
            <Button variant='outline' size='sm' onClick={() => detailBiz && openEmailDialog([detailBiz])} className='gap-1'>
              <Mail className='h-3.5 w-3.5' /> Send Email
            </Button>
            <Button
              variant={detailBiz?.isSuspended ? 'default' : 'destructive'}
              size='sm'
              onClick={() => detailBiz && openConfirmDialog([detailBiz.id], businesses)}
              className='gap-1'
            >
              {detailBiz?.isSuspended
                ? <><CheckCircle2 className='h-3.5 w-3.5' /> Reactivate</>
                : <><Ban className='h-3.5 w-3.5' /> Suspend</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction === 'suspend' ? 'Suspend Business(es)' : 'Reactivate Business(es)'}
        description={`Are you sure you want to ${confirmAction} ${
          confirmIds.length === 1 ? 'this business' : `${confirmIds.length} businesses`
        }? ${confirmAction === 'suspend'
          ? 'All staff accounts will also be deactivated.'
          : 'All staff accounts will be restored.'}`}
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
    </div>
  );
};

export default Businesses;
