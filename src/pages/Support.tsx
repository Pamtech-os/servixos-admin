import { useState, useMemo, type FC } from 'react';
import {
  Eye,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  Users,
  LifeBuoy,
} from 'lucide-react';
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
import { toast } from 'sonner';
import { formatRelativeTime } from '@/lib/format';
import { usePagination } from '@/hooks/usePagination';
import {
  PageHeader,
  StatsGrid,
  DataTablePagination,
  SearchFilterBar,
  EmptyState,
} from '@/components/shared';

// ─── Types ──────────────────────────────────────────────────────
type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Ticket {
  id: string;
  subject: string;
  requester: string;
  requesterEmail: string;
  businessName: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  description: string;
}

// ─── Mock Data ──────────────────────────────────────────────────
const now = Date.now();
const hr = 3600000;
const day = 86400000;

const initialTickets: Ticket[] = [
  {
    id: 'T-1001',
    subject: 'Unable to access API dashboard',
    requester: 'John Carter',
    requesterEmail: 'john@technova.io',
    businessName: 'TechNova Inc.',
    status: 'open',
    priority: 'high',
    assignee: 'Maria Lopez',
    category: 'Technical',
    createdAt: new Date(now - hr * 2),
    updatedAt: new Date(now - hr * 1),
    description: 'Getting a 403 error when trying to access the API keys section.',
  },
  {
    id: 'T-1002',
    subject: 'Billing discrepancy on last invoice',
    requester: 'Emily Zhang',
    requesterEmail: 'emily@cloudbase.io',
    businessName: 'CloudBase Technologies',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'James Wilson',
    category: 'Billing',
    createdAt: new Date(now - hr * 8),
    updatedAt: new Date(now - hr * 3),
    description: 'Invoice shows $420 but expected $380 based on our plan.',
  },
  {
    id: 'T-1003',
    subject: 'Request to increase AI query limit',
    requester: 'Marcus Thompson',
    requesterEmail: 'marcus@designcraft.co',
    businessName: 'DesignCraft Studio',
    status: 'open',
    priority: 'medium',
    assignee: 'Unassigned',
    category: 'Account',
    createdAt: new Date(now - hr * 12),
    updatedAt: new Date(now - hr * 12),
    description: 'We need to increase our daily AI query limit from 5,000 to 10,000.',
  },
  {
    id: 'T-1004',
    subject: 'Two-factor authentication not working',
    requester: 'Priya Sharma',
    requesterEmail: 'priya@servix.solutions',
    businessName: 'Servix Solutions',
    status: 'resolved',
    priority: 'high',
    assignee: 'Maria Lopez',
    category: 'Technical',
    createdAt: new Date(now - day * 1),
    updatedAt: new Date(now - hr * 6),
    description: '2FA codes are not being accepted, locked out of account.',
  },
  {
    id: 'T-1005',
    subject: 'Need help with webhook setup',
    requester: 'Alex Rivera',
    requesterEmail: 'alex@stellar.llc',
    businessName: 'Stellar Dynamics LLC',
    status: 'open',
    priority: 'low',
    assignee: 'Unassigned',
    category: 'Technical',
    createdAt: new Date(now - day * 1.5),
    updatedAt: new Date(now - day * 1.5),
    description: 'Looking for guidance on setting up webhooks for order notifications.',
  },
  {
    id: 'T-1006',
    subject: 'Account suspension inquiry',
    requester: 'Laura Bennett',
    requesterEmail: 'laura@pixelwave.co',
    businessName: 'PixelWave Creative',
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'Sarah Chen',
    category: 'Account',
    createdAt: new Date(now - hr * 4),
    updatedAt: new Date(now - hr * 2),
    description: 'Our account was suspended without notice. Need immediate resolution.',
  },
  {
    id: 'T-1007',
    subject: 'Feature request: bulk export',
    requester: "Ryan O'Brien",
    requesterEmail: 'ryan@dataflow.ai',
    businessName: 'DataFlow AI',
    status: 'closed',
    priority: 'low',
    assignee: 'David Kim',
    category: 'Feature Request',
    createdAt: new Date(now - day * 5),
    updatedAt: new Date(now - day * 2),
    description: 'Would like the ability to bulk export analytics data as CSV.',
  },
  {
    id: 'T-1008',
    subject: 'Slow dashboard loading times',
    requester: 'Tom Fischer',
    requesterEmail: 'tom@buildright.dev',
    businessName: 'BuildRight Dev',
    status: 'open',
    priority: 'high',
    assignee: 'Maria Lopez',
    category: 'Technical',
    createdAt: new Date(now - hr * 6),
    updatedAt: new Date(now - hr * 5),
    description: 'Dashboard takes 10+ seconds to load, especially analytics page.',
  },
  {
    id: 'T-1009',
    subject: 'Subscription downgrade process',
    requester: 'Nina Kowalski',
    requesterEmail: 'nina@brightpath.io',
    businessName: 'BrightPath Analytics',
    status: 'resolved',
    priority: 'medium',
    assignee: 'James Wilson',
    category: 'Billing',
    createdAt: new Date(now - day * 3),
    updatedAt: new Date(now - day * 1),
    description: 'Want to downgrade from Enterprise to Pro plan effective next billing cycle.',
  },
  {
    id: 'T-1010',
    subject: 'Data migration assistance',
    requester: 'Wei Chen',
    requesterEmail: 'wei@quantumedge.ai',
    businessName: 'QuantumEdge AI',
    status: 'in_progress',
    priority: 'high',
    assignee: 'David Kim',
    category: 'Technical',
    createdAt: new Date(now - day * 2),
    updatedAt: new Date(now - hr * 10),
    description: 'Need help migrating data from our legacy system to Servix OS.',
  },
  {
    id: 'T-1011',
    subject: 'Custom domain setup issues',
    requester: 'Chloe Dubois',
    requesterEmail: 'chloe@luxeinterior.com',
    businessName: 'Luxe Interior Design',
    status: 'open',
    priority: 'medium',
    assignee: 'Unassigned',
    category: 'Technical',
    createdAt: new Date(now - hr * 18),
    updatedAt: new Date(now - hr * 18),
    description: 'DNS records configured but custom domain still not working.',
  },
  {
    id: 'T-1012',
    subject: 'Partnership inquiry',
    requester: 'Nathan Brooks',
    requesterEmail: 'nathan@skyline.build',
    businessName: 'Skyline Construction',
    status: 'open',
    priority: 'low',
    assignee: 'Sarah Chen',
    category: 'General',
    createdAt: new Date(now - day * 4),
    updatedAt: new Date(now - day * 3),
    description: 'Interested in discussing a partnership/reseller arrangement.',
  },
  {
    id: 'T-1013',
    subject: 'Payment method update failed',
    requester: 'Carlos Mendez',
    requesterEmail: 'carlos@quickship.co',
    businessName: 'QuickShip Logistics',
    status: 'resolved',
    priority: 'medium',
    assignee: 'James Wilson',
    category: 'Billing',
    createdAt: new Date(now - day * 2),
    updatedAt: new Date(now - hr * 20),
    description: 'Cannot update credit card on file — getting a payment processing error.',
  },
  {
    id: 'T-1014',
    subject: 'Employee onboarding guide needed',
    requester: 'Liam Nguyen',
    requesterEmail: 'liam@codeforge.dev',
    businessName: 'CodeForge Studios',
    status: 'closed',
    priority: 'low',
    assignee: 'Maria Lopez',
    category: 'General',
    createdAt: new Date(now - day * 7),
    updatedAt: new Date(now - day * 5),
    description: 'Looking for documentation on how to onboard team members properly.',
  },
  {
    id: 'T-1015',
    subject: 'API rate limiting causing failures',
    requester: 'Oliver Grant',
    requesterEmail: 'oliver@securelock.io',
    businessName: 'SecureLock Systems',
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'David Kim',
    category: 'Technical',
    createdAt: new Date(now - hr * 3),
    updatedAt: new Date(now - hr * 1),
    description:
      'Hitting rate limits during peak hours, causing integration failures for our clients.',
  },
];

// ─── Config ─────────────────────────────────────────────────────
const statusConfig: Record<TicketStatus, { label: string; className: string; icon: typeof Clock }> =
  {
    open: { label: 'Open', className: 'bg-primary/10 text-primary border-primary/20', icon: Inbox },
    in_progress: {
      label: 'In Progress',
      className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      icon: Clock,
    },
    resolved: {
      label: 'Resolved',
      className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: CheckCircle2,
    },
    closed: {
      label: 'Closed',
      className: 'bg-muted text-muted-foreground border-border',
      icon: XCircle,
    },
  };

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', className: 'bg-primary/10 text-primary' },
  high: { label: 'High', className: 'bg-amber-500/10 text-amber-600' },
  urgent: { label: 'Urgent', className: 'bg-destructive/10 text-destructive' },
};

const assignees = ['Unassigned', 'Maria Lopez', 'James Wilson', 'Sarah Chen', 'David Kim'];

// ─── Component ──────────────────────────────────────────────────
const Support: FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTicketId, setAssignTicketId] = useState('');

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        !ticketSearch ||
        t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.requester.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.id.toLowerCase().includes(ticketSearch.toLowerCase());
      const matchStatus = ticketStatusFilter === 'all' || t.status === ticketStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, ticketSearch, ticketStatusFilter]);

  const {
    currentPage,
    totalPages,
    paginated,
    setCurrentPage,
    startIndex,
    endIndex,
    totalItems,
    resetPage,
  } = usePagination(filteredTickets);

  const ticketStats = {
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  };

  const updateTicketStatus = (id: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date() } : t))
    );
    toast.success(`Ticket ${id} marked as ${statusConfig[status].label}`);
    if (detailTicket?.id === id) {
      setDetailTicket((prev) => (prev ? { ...prev, status, updatedAt: new Date() } : null));
    }
  };

  const handleReply = () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    toast.success(`Reply sent for ticket ${detailTicket?.id}`);
    setReplyOpen(false);
    setReplyMessage('');
  };

  const handleAssign = (assignee: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === assignTicketId ? { ...t, assignee, updatedAt: new Date() } : t))
    );
    if (detailTicket?.id === assignTicketId) {
      setDetailTicket((prev) => (prev ? { ...prev, assignee } : null));
    }
    toast.success(`Ticket ${assignTicketId} assigned to ${assignee}`);
    setAssignOpen(false);
  };

  const stats = [
    { label: 'Open', value: ticketStats.open, icon: Inbox, color: 'text-primary' },
    { label: 'In Progress', value: ticketStats.inProgress, icon: Clock, color: 'text-amber-600' },
    {
      label: 'Resolved',
      value: ticketStats.resolved,
      icon: CheckCircle2,
      color: 'text-emerald-600',
    },
    { label: 'Closed', value: ticketStats.closed, icon: XCircle, color: 'text-muted-foreground' },
  ];

  return (
    <div className='space-y-6'>
      <PageHeader title='Support' subtitle='Manage support tickets' />

      <StatsGrid stats={stats} />

      <SearchFilterBar
        searchValue={ticketSearch}
        onSearchChange={(v) => {
          setTicketSearch(v);
          resetPage();
        }}
        searchPlaceholder='Search tickets by ID, subject, or requester...'
        filters={
          <div className='flex gap-2 flex-wrap'>
            {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((s) => (
              <Button
                key={s}
                variant={ticketStatusFilter === s ? 'default' : 'outline'}
                size='sm'
                onClick={() => {
                  setTicketStatusFilter(s);
                  resetPage();
                }}
                className={ticketStatusFilter === s ? 'gradient-bg text-primary-foreground' : ''}
              >
                {s === 'all' ? 'All' : statusConfig[s].label}
              </Button>
            ))}
          </div>
        }
      />

      {/* Table */}
      <Card>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((ticket) => (
                  <TableRow key={ticket.id} className='border-b border-border transition-colors hover:bg-muted/50'>
                    <TableCell className='text-sm font-mono text-muted-foreground'>
                      {ticket.id}
                    </TableCell>
                    <TableCell>
                      <p className='text-sm font-medium max-w-[200px] truncate'>{ticket.subject}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className='text-sm font-medium'>{ticket.requester}</p>
                        <p className='text-xs text-muted-foreground'>{ticket.businessName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          priorityConfig[ticket.priority].className
                        }`}
                      >
                        {priorityConfig[ticket.priority].label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline' className={statusConfig[ticket.status].className}>
                        {statusConfig[ticket.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {ticket.assignee}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {formatRelativeTime(ticket.updatedAt)}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => setDetailTicket(ticket)}
                          title='View details'
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => {
                            setAssignTicketId(ticket.id);
                            setAssignOpen(true);
                          }}
                          title='Assign'
                        >
                          <Users className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <EmptyState
                    icon={LifeBuoy}
                    message='No tickets match your filters.'
                    colSpan={8}
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

      {/* Ticket Detail Dialog */}
      <Dialog open={!!detailTicket} onOpenChange={(open) => !open && setDetailTicket(null)}>
        <DialogContent className='sm:max-w-lg' onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <span className='font-mono text-muted-foreground'>{detailTicket?.id}</span>
              {detailTicket && (
                <Badge variant='outline' className={statusConfig[detailTicket.status].className}>
                  {statusConfig[detailTicket.status].label}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>{detailTicket?.subject}</DialogDescription>
          </DialogHeader>
          {detailTicket && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-xs text-muted-foreground'>Requester</Label>
                  <p className='text-sm font-medium'>{detailTicket.requester}</p>
                  <p className='text-xs text-muted-foreground'>{detailTicket.requesterEmail}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Business</Label>
                  <p className='text-sm font-medium'>{detailTicket.businessName}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Priority</Label>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      priorityConfig[detailTicket.priority].className
                    }`}
                  >
                    {priorityConfig[detailTicket.priority].label}
                  </span>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Assignee</Label>
                  <p className='text-sm font-medium'>{detailTicket.assignee}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Category</Label>
                  <p className='text-sm font-medium'>{detailTicket.category}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Created</Label>
                  <p className='text-sm font-medium'>
                    {formatRelativeTime(detailTicket.createdAt)}
                  </p>
                </div>
              </div>
              <div>
                <Label className='text-xs text-muted-foreground'>Description</Label>
                <p className='mt-1 text-sm rounded-lg bg-muted p-3'>{detailTicket.description}</p>
              </div>
            </div>
          )}
          <DialogFooter className='gap-2 flex-wrap'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setAssignTicketId(detailTicket?.id || '');
                setAssignOpen(true);
              }}
              className='gap-1'
            >
              <Users className='h-3.5 w-3.5' /> Assign
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setReplyMessage('');
                setReplyOpen(true);
              }}
              className='gap-1'
            >
              <MessageSquare className='h-3.5 w-3.5' /> Reply
            </Button>
            {detailTicket &&
              detailTicket.status !== 'resolved' &&
              detailTicket.status !== 'closed' && (
                <Button
                  size='sm'
                  onClick={() => updateTicketStatus(detailTicket.id, 'resolved')}
                  className='gradient-bg text-primary-foreground gap-1'
                >
                  <CheckCircle2 className='h-3.5 w-3.5' /> Resolve
                </Button>
              )}
            {detailTicket && detailTicket.status === 'resolved' && (
              <Button
                size='sm'
                variant='outline'
                onClick={() => updateTicketStatus(detailTicket.id, 'closed')}
                className='gap-1'
              >
                <XCircle className='h-3.5 w-3.5' /> Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className='sm:max-w-md' onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Reply to {detailTicket?.id}</DialogTitle>
            <DialogDescription>Send a response to {detailTicket?.requester}</DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            <Label htmlFor='reply-msg'>Message</Label>
            <textarea
              id='reply-msg'
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={5}
              placeholder='Type your reply...'
              className='flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setReplyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReply} className='gradient-bg text-primary-foreground'>
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className='sm:max-w-xs' onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>Select a team member to assign {assignTicketId}</DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            {assignees.map((a) => (
              <Button
                key={a}
                variant='outline'
                className='w-full justify-start'
                onClick={() => handleAssign(a)}
              >
                {a}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
