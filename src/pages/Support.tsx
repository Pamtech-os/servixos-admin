import { useState, useRef, useEffect, type FC } from 'react';
import {
  Eye, MessageSquare, Clock, CheckCircle2, XCircle,
  Inbox, LifeBuoy, Loader2, UserCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api-client';
import {
  PageHeader,
  SearchFilterBar,
  DataTablePagination,
  EmptyState,
} from '@/components/shared';
import {
  useSupport,
  useSupportTicket,
  useSupportAdmins,
  useAssignTicket,
  useReplyTicket,
  useResolveTicket,
  useCloseTicket,
} from '@/hooks/useSupport';
import { useDebounce } from '@/hooks/useDebounce';
import { formatRelativeTime } from '@/lib/format';
import type { SupportStatusFilter, Ticket } from '@/types/support';

const STATUS_FILTERS: { value: SupportStatusFilter; label: string }[] = [
  { value: 'all',         label: 'All Status' },
  { value: 'open',        label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved',    label: 'Resolved' },
  { value: 'closed',      label: 'Closed' },
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  open:        { label: 'Open',        className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  in_progress: { label: 'In Progress', className: 'bg-primary/10 text-primary border-primary/20' },
  resolved:    { label: 'Resolved',    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  closed:      { label: 'Closed',      className: 'bg-muted text-muted-foreground border-border' },
};

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low:    { label: 'Low',    className: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', className: 'bg-amber-500/10 text-amber-600' },
  high:   { label: 'High',   className: 'bg-orange-500/10 text-orange-600' },
  urgent: { label: 'Urgent', className: 'bg-destructive/10 text-destructive' },
};

const PAGE_LIMIT = 10;

const Support: FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SupportStatusFilter>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Assign dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignAdminId, setAssignAdminId] = useState('');

  // Reply
  const [replyText, setReplyText] = useState('');
  const repliesEndRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isFetching } = useSupport({
    page, limit: PAGE_LIMIT, search: debouncedSearch, status: statusFilter,
  });
  const { data: ticket, isLoading: ticketLoading } = useSupportTicket(selectedTicketId);
  const { data: admins = [] } = useSupportAdmins();

  const assignTicket = useAssignTicket();
  const replyTicket = useReplyTicket();
  const resolveTicket = useResolveTicket();
  const closeTicket = useCloseTicket();


  useEffect(() => {
    if (ticket?.replies?.length) {
      repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket?.replies?.length]);

  const tickets = data?.tickets ?? [];
  const meta = data?.meta;
  const stats = data?.stats;

  const isClosed = ticket?.status === 'closed';

  const handleAssign = async () => {
    if (!selectedTicketId || !assignAdminId) return;
    try {
      await assignTicket.mutateAsync({ id: selectedTicketId, adminId: assignAdminId });
      toast.success('Ticket assigned');
      setAssignOpen(false);
      setAssignAdminId('');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Assign failed');
    }
  };

  const handleUnassign = async () => {
    if (!selectedTicketId) return;
    try {
      await assignTicket.mutateAsync({ id: selectedTicketId, adminId: null });
      toast.success('Ticket unassigned');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Unassign failed');
    }
  };

  const handleReply = async () => {
    if (!selectedTicketId || !replyText.trim()) return;
    try {
      await replyTicket.mutateAsync({ id: selectedTicketId, content: replyText.trim() });
      setReplyText('');
      toast.success('Reply sent');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Reply failed');
    }
  };

  const handleResolve = async () => {
    if (!selectedTicketId) return;
    try {
      await resolveTicket.mutateAsync(selectedTicketId);
      toast.success('Ticket resolved');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Resolve failed');
    }
  };

  const handleClose = async () => {
    if (!selectedTicketId) return;
    try {
      await closeTicket.mutateAsync(selectedTicketId);
      toast.success('Ticket closed');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Close failed');
    }
  };

  const statItems = [
    { label: 'Open',        value: stats?.open        ?? '—', icon: Inbox,        color: 'text-amber-600' },
    { label: 'In Progress', value: stats?.inProgress  ?? '—', icon: Clock,        color: 'text-primary' },
    { label: 'Resolved',    value: stats?.resolved    ?? '—', icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Closed',      value: stats?.closed      ?? '—', icon: XCircle,      color: 'text-muted-foreground' },
  ];

  return (
    <div className='space-y-6'>
      <PageHeader title='Support Tickets' subtitle='Manage customer support requests' />

      {/* Stats */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {statItems.map((s) => (
          <Card key={s.label}>
            <CardContent className='flex items-center gap-3 p-5'>
              <s.icon className={`h-6 w-6 ${s.color}`} />
              <div>
                <p className='text-2xl font-bold'>{s.value}</p>
                <p className='text-xs text-muted-foreground'>{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder='Search by subject or requester...'
        filters={
          <Select
            value={statusFilter}
            onValueChange={(v) => { setStatusFilter(v as SupportStatusFilter); setPage(1); }}
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

      <Card>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='font-mono text-xs'>Ticket #</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(PAGE_LIMIT)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((__, j) => (
                        <TableCell key={j}>
                          <div className='h-4 animate-pulse rounded bg-muted/60' />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : tickets.length === 0 ? (
                  <EmptyState icon={LifeBuoy} message='No tickets match your filters.' colSpan={8} />
                ) : (
                  tickets.map((t: Ticket) => {
                    const st = STATUS_CONFIG[t.status] ?? STATUS_CONFIG['open'];
                    const pr = PRIORITY_CONFIG[t.priority] ?? PRIORITY_CONFIG['low'];
                    return (
                      <TableRow
                        key={t.id}
                        className={`border-b border-border transition-colors hover:bg-muted/50 ${isFetching ? 'opacity-60' : ''}`}
                      >
                        <TableCell className='font-mono text-xs text-muted-foreground'>{t.ticketNumber}</TableCell>
                        <TableCell className='max-w-[200px]'>
                          <p className='truncate text-sm font-medium'>{t.subject}</p>
                          <p className='text-xs text-muted-foreground capitalize'>{t.category}</p>
                        </TableCell>
                        <TableCell>
                          <p className='text-sm font-medium'>{t.requesterName}</p>
                          <p className='text-xs text-muted-foreground'>{t.requesterEmail}</p>
                        </TableCell>
                        <TableCell className='text-sm'>{t.businessName}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pr.className}`}>
                            {pr.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline' className={st.className}>{st.label}</Badge>
                        </TableCell>
                        <TableCell className='text-sm text-muted-foreground'>
                          {t.assigneeName ?? <span className='italic text-xs'>Unassigned</span>}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => setSelectedTicketId(t.id)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
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

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicketId} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
        <DialogContent className='sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <span className='font-mono text-sm text-muted-foreground'>{ticket?.ticketNumber}</span>
              <span>{ticket?.subject}</span>
            </DialogTitle>
            <DialogDescription className='flex items-center gap-2 flex-wrap'>
              {ticket && (
                <>
                  <Badge variant='outline' className={STATUS_CONFIG[ticket.status]?.className}>
                    {STATUS_CONFIG[ticket.status]?.label}
                  </Badge>
                  <span className='text-xs capitalize'>{ticket.priority} priority</span>
                  <span className='text-xs'>·</span>
                  <span className='text-xs capitalize'>{ticket.category}</span>
                  <span className='text-xs'>·</span>
                  <span className='text-xs'>{ticket.businessName}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className='flex-1 overflow-y-auto space-y-4 py-2'>
            {ticketLoading ? (
              <div className='space-y-3'>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className='h-16 animate-pulse rounded-lg bg-muted/40' />
                ))}
              </div>
            ) : ticket ? (
              <>
                {/* Info row */}
                <div className='grid grid-cols-2 gap-3 rounded-lg border border-border p-3 text-sm'>
                  <div>
                    <p className='text-xs text-muted-foreground'>Requester</p>
                    <p className='font-medium'>{ticket.requesterName}</p>
                    <p className='text-xs text-muted-foreground'>{ticket.requesterEmail}</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>Assignee</p>
                    <p className='font-medium'>{ticket.assigneeName ?? 'Unassigned'}</p>
                  </div>
                  <div className='col-span-2'>
                    <p className='text-xs text-muted-foreground'>Description</p>
                    <p className='mt-0.5 text-sm whitespace-pre-wrap'>{ticket.description}</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>Opened</p>
                    <p>{formatRelativeTime(new Date(ticket.createdAt))}</p>
                  </div>
                </div>

                {/* Replies */}
                <div className='space-y-2'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    Replies ({ticket.replies?.length ?? 0})
                  </p>
                  {(ticket.replies ?? []).length === 0 ? (
                    <p className='text-sm text-muted-foreground py-2'>No replies yet.</p>
                  ) : (
                    (ticket.replies ?? []).map((reply, i) => (
                      <div
                        key={i}
                        className={`rounded-lg p-3 text-sm ${
                          reply.authorType === 'admin'
                            ? 'bg-primary/5 border border-primary/20'
                            : 'bg-muted/50 border border-border'
                        }`}
                      >
                        <div className='flex items-center justify-between mb-1'>
                          <span className={`text-xs font-medium ${reply.authorType === 'admin' ? 'text-primary' : 'text-foreground'}`}>
                            {reply.authorName}
                            {reply.authorType === 'admin' && <span className='ml-1 opacity-60'>(Admin)</span>}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {formatRelativeTime(new Date(reply.createdAt))}
                          </span>
                        </div>
                        <p className='whitespace-pre-wrap text-foreground'>{reply.content}</p>
                      </div>
                    ))
                  )}
                  <div ref={repliesEndRef} />
                </div>

                {/* Reply form */}
                {!isClosed && (
                  <div className='space-y-2'>
                    <Label className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                      <MessageSquare className='inline h-3 w-3 mr-1' />
                      Add Reply
                    </Label>
                    <Textarea
                      placeholder='Type your reply...'
                      value={replyText}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
                      rows={3}
                      className='resize-none'
                    />
                    <Button
                      size='sm'
                      onClick={() => void handleReply()}
                      disabled={!replyText.trim() || replyTicket.isPending}
                      className='gap-1'
                    >
                      {replyTicket.isPending && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
                      Send Reply
                    </Button>
                  </div>
                )}
              </>
            ) : null}
          </div>

          <DialogFooter className='flex-col sm:flex-row gap-2 border-t border-border pt-3 mt-0'>
            {/* Assign */}
            {!isClosed && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setAssignOpen(true)}
                className='gap-1'
              >
                <UserCheck className='h-3.5 w-3.5' />
                {ticket?.assigneeName ? 'Reassign' : 'Assign'}
              </Button>
            )}
            {ticket?.assigneeName && !isClosed && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => void handleUnassign()}
                disabled={assignTicket.isPending}
                className='text-muted-foreground text-xs'
              >
                Unassign
              </Button>
            )}
            <div className='flex-1' />
            {ticket?.status !== 'resolved' && ticket?.status !== 'closed' && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => void handleResolve()}
                disabled={resolveTicket.isPending}
                className='gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10'
              >
                {resolveTicket.isPending
                  ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  : <CheckCircle2 className='h-3.5 w-3.5' />}
                Resolve
              </Button>
            )}
            {ticket?.status !== 'closed' && (
              <Button
                variant='destructive'
                size='sm'
                onClick={() => void handleClose()}
                disabled={closeTicket.isPending}
                className='gap-1'
              >
                {closeTicket.isPending
                  ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  : <XCircle className='h-3.5 w-3.5' />}
                Close Ticket
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Admin Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>Select an admin to handle this ticket.</DialogDescription>
          </DialogHeader>
          <Select value={assignAdminId} onValueChange={setAssignAdminId}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select admin...' />
            </SelectTrigger>
            <SelectContent>
              {admins.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.firstName} {a.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant='outline' onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={() => void handleAssign()} disabled={!assignAdminId || assignTicket.isPending}>
              {assignTicket.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
