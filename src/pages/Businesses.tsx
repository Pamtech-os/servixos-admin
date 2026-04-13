import { useState, useMemo, type FC } from 'react';
import { motion } from 'framer-motion';
import { Eye, Ban, Mail, CheckCircle2, Search } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { businesses as initialBusinesses, type Business } from '@/lib/admin-mock-data';
import { toast } from 'sonner';
import { usePagination } from '@/hooks/usePagination';
import { useSelection } from '@/hooks/useSelection';
import {
  PageHeader,
  DataTablePagination,
  SearchFilterBar,
  ConfirmDialog,
  EmailDialog,
  EmptyState,
  BulkActions,
} from '@/components/shared';

const statusConfig: Record<Business['status'], { label: string; className: string }> = {
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

const planColors: Record<Business['plan'], string> = {
  Free: 'bg-muted text-muted-foreground',
  Starter: 'bg-primary/10 text-primary',
  Pro: 'bg-secondary/10 text-secondary',
  Enterprise: 'bg-accent/10 text-accent',
};

const statuses: (Business['status'] | 'all')[] = ['all', 'active', 'suspended', 'pending'];

const Businesses: FC = () => {
  const [businessList, setBusinessList] = useState<Business[]>(initialBusinesses);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Business['status'] | 'all'>('all');
  const [detailBiz, setDetailBiz] = useState<Business | null>(null);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmIds, setConfirmIds] = useState<string[]>([]);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'reactivate'>('suspend');

  // Email dialog
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTargets, setEmailTargets] = useState<{ id: string; name: string }[]>([]);

  const filtered = useMemo(() => {
    return businessList.filter((b) => {
      const matchesSearch =
        !search ||
        b.fullName.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase()) ||
        b.businessName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [businessList, search, statusFilter]);

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
    const targets = businessList.filter((b) => ids.includes(b.id));
    setConfirmAction(targets.every((b) => b.status === 'suspended') ? 'reactivate' : 'suspend');
    setConfirmIds(ids);
    setConfirmOpen(true);
  };

  const executeStatusChange = () => {
    setBusinessList((prev) =>
      prev.map((b) =>
        confirmIds.includes(b.id)
          ? {
              ...b,
              status: b.status === 'suspended' ? ('active' as const) : ('suspended' as const),
            }
          : b
      )
    );
    clear();
    setConfirmOpen(false);
    toast.success(
      `${confirmIds.length} business(es) ${
        confirmAction === 'suspend' ? 'suspended' : 'reactivated'
      }`
    );
    if (detailBiz && confirmIds.includes(detailBiz.id)) setDetailBiz(null);
  };

  const openEmailDialog = (targets: Business[]) => {
    setEmailTargets(targets.map((t) => ({ id: t.id, name: t.businessName })));
    setEmailOpen(true);
  };

  const selectedBusinesses = businessList.filter((b) => selected.has(b.id));

  return (
    <div className='space-y-6'>
      <PageHeader title='Businesses' subtitle='Manage all registered businesses on the platform' />

      <SearchFilterBar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          resetFilters();
        }}
        searchPlaceholder='Search by name, email, or business...'
        filters={
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
                    <TableHead>User</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((biz) => (
                    <TableRow key={biz.id} className='border-b border-border transition-colors hover:bg-muted/50'>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(biz.id)}
                          onCheckedChange={() => toggle(biz.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='text-sm font-medium'>{biz.fullName}</p>
                          <p className='text-xs text-muted-foreground'>{biz.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className='text-sm font-medium'>{biz.businessName}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            planColors[biz.plan]
                          }`}
                        >
                          {biz.plan}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline' className={statusConfig[biz.status].className}>
                          {statusConfig[biz.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => setDetailBiz(biz)}
                            title='View details'
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => openEmailDialog([biz])}
                            title='Send email'
                          >
                            <Mail className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => openConfirmDialog([biz.id])}
                            title={biz.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          >
                            {biz.status === 'suspended' ? (
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
                      icon={Search}
                      message='No businesses match your filters.'
                      colSpan={6}
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

      {/* Business Detail Dialog */}
      <Dialog open={!!detailBiz} onOpenChange={(open) => !open && setDetailBiz(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Business Details</DialogTitle>
            <DialogDescription>Full details for {detailBiz?.businessName}</DialogDescription>
          </DialogHeader>
          {detailBiz && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-xs text-muted-foreground'>Full Name</Label>
                  <p className='text-sm font-medium'>{detailBiz.fullName}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Email</Label>
                  <p className='text-sm font-medium'>{detailBiz.email}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Business</Label>
                  <p className='text-sm font-medium'>{detailBiz.businessName}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Plan</Label>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      planColors[detailBiz.plan]
                    }`}
                  >
                    {detailBiz.plan}
                  </span>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Date Joined</Label>
                  <p className='text-sm font-medium'>
                    {detailBiz.dateJoined.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Status</Label>
                  <Badge variant='outline' className={statusConfig[detailBiz.status].className}>
                    {statusConfig[detailBiz.status].label}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className='gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => detailBiz && openEmailDialog([detailBiz])}
              className='gap-1'
            >
              <Mail className='h-3.5 w-3.5' /> Send Email
            </Button>
            <Button
              variant={detailBiz?.status === 'suspended' ? 'default' : 'destructive'}
              size='sm'
              onClick={() => detailBiz && openConfirmDialog([detailBiz.id])}
              className='gap-1'
            >
              {detailBiz?.status === 'suspended' ? (
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction === 'suspend' ? 'Suspend Business' : 'Reactivate Business'}
        description={`Are you sure you want to ${confirmAction} ${
          confirmIds.length === 1 ? 'this business' : `${confirmIds.length} businesses`
        }? ${
          confirmAction === 'suspend'
            ? 'They will lose access to the platform.'
            : 'They will regain access to the platform.'
        }`}
        confirmLabel={confirmAction === 'suspend' ? 'Suspend' : 'Reactivate'}
        variant={confirmAction === 'suspend' ? 'destructive' : 'default'}
        onConfirm={executeStatusChange}
      />

      <EmailDialog open={emailOpen} onOpenChange={setEmailOpen} targets={emailTargets} />
    </div>
  );
};

export default Businesses;
