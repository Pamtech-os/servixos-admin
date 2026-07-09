import { useState, useId, type FC } from 'react';
import { motion } from 'framer-motion';
import {
  Users, DollarSign, Building2, ClipboardList, CreditCard, Brain,
  Download, Trash2, Play, Pause, Clock, Calendar, Repeat,
  FileSpreadsheet, FileText, CheckCircle2, AlertCircle, Loader2,
  FileBarChart2, Plus, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';
import { formatRelativeTime } from '@/lib/format';
import { PageHeader, DataTablePagination } from '@/components/shared';
import {
  useReportStats, useReports, useSchedules,
  useGenerateReport, useDownloadReport, useDeleteReport,
  usePauseSchedule, useResumeSchedule, useRunSchedule, useDeleteSchedule,
} from '@/hooks/useReports';
import type { ReportType, ReportFormat, ReportFrequency, ReportStatus } from '@/types/reports';

// ── Constants ────────────────────────────────────────────────────────────────

const REPORT_TYPES = [
  { id: 'users' as ReportType,         label: 'Users',        description: 'Accounts, roles & status',      icon: Users,         color: 'text-primary',    bg: 'bg-primary/10' },
  { id: 'revenue' as ReportType,       label: 'Revenue',      description: 'Subscriptions & payments',      icon: DollarSign,    color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  { id: 'businesses' as ReportType,    label: 'Businesses',   description: 'Plans & registration data',     icon: Building2,     color: 'text-secondary',   bg: 'bg-secondary/10' },
  { id: 'activity_log' as ReportType,  label: 'Activity Log', description: 'Admin audit trail',             icon: ClipboardList, color: 'text-accent',      bg: 'bg-accent/10' },
  { id: 'subscriptions' as ReportType, label: 'Subscriptions',description: 'Plan distribution & churn',    icon: CreditCard,    color: 'text-violet-600',  bg: 'bg-violet-500/10' },
  { id: 'ai_usage' as ReportType,      label: 'AI Usage',     description: 'Query consumption by business', icon: Brain,        color: 'text-amber-600',   bg: 'bg-amber-500/10' },
];

const FREQ_OPTIONS: { value: ReportFrequency; label: string }[] = [
  { value: 'one_time', label: 'One-time' },
  { value: 'daily',    label: 'Daily' },
  { value: 'weekly',   label: 'Weekly' },
  { value: 'monthly',  label: 'Monthly' },
];


const FORMAT_ICON: Record<ReportFormat, typeof FileText> = {
  csv:   FileText,
  excel: FileSpreadsheet,
};

const STATUS_BADGE: Record<ReportStatus, { label: string; className: string; icon: typeof CheckCircle2; spin?: boolean }> = {
  pending:    { label: 'Pending',    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',       icon: Clock,        spin: true },
  processing: { label: 'Processing', className: 'bg-primary/10 text-primary border-primary/20',             icon: Loader2,      spin: true },
  ready:      { label: 'Ready',      className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
  failed:     { label: 'Failed',     className: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertCircle },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function isoToday() {
  return new Date().toISOString().split('T')[0];
}

function iso30DaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function typeConfig(type: string) {
  return REPORT_TYPES.find((t) => t.id === type);
}

type ActiveTab = 'history' | 'scheduled';

// ── Component ─────────────────────────────────────────────────────────────────

const Reports: FC = () => {
  // Builder state
  const [selectedType, setSelectedType] = useState<ReportType>('users');
  const [format, setFormat] = useState<ReportFormat>('excel');
  const [frequency, setFrequency] = useState<ReportFrequency>('one_time');
  const [dateFrom, setDateFrom] = useState(iso30DaysAgo());
  const [dateTo, setDateTo] = useState(isoToday());
  const [reportName, setReportName] = useState('');

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('history');
  const [historyPage, setHistoryPage] = useState(1);
  const [scheduledPage, setScheduledPage] = useState(1);

  const formId = useId();

  // Queries
  const { data: statsData } = useReportStats();
  const { data: reportsData, isLoading: reportsLoading, isFetching: reportsFetching } = useReports(historyPage);
  const { data: schedulesData, isLoading: schedulesLoading, isFetching: schedulesFetching } = useSchedules(scheduledPage);

  // Mutations
  const generateReport = useGenerateReport();
  const downloadReport = useDownloadReport();
  const deleteReport = useDeleteReport();
  const pauseSchedule = usePauseSchedule();
  const resumeSchedule = useResumeSchedule();
  const runSchedule = useRunSchedule();
  const deleteSchedule = useDeleteSchedule();

  const typeLabel = (type: string) => typeConfig(type)?.label ?? type;
  const resolvedName = reportName.trim() || `${typeLabel(selectedType)} — ${new Date(dateTo).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

  const handleGenerate = () => {
    generateReport.mutate(
      { name: resolvedName, type: selectedType, format, dateFrom, dateTo, frequency: 'one_time' },
      {
        onSuccess: () => {
          setActiveTab('history');
          setHistoryPage(1);
          toast.success('Report generation started');
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to generate report'),
      }
    );
  };

  const handleCreateSchedule = () => {
    generateReport.mutate(
      { name: resolvedName, type: selectedType, format, dateFrom, dateTo, frequency },
      {
        onSuccess: () => {
          setActiveTab('scheduled');
          setScheduledPage(1);
          setReportName('');
          toast.success(`"${resolvedName}" schedule created`);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to create schedule'),
      }
    );
  };

  const handleDownload = (id: string, name: string) => {
    downloadReport.mutate(id, {
      onError: (err) => toast.error(err instanceof Error ? err.message : `Failed to download ${name}`),
    });
  };

  const handleDeleteReport = (id: string) => {
    deleteReport.mutate(id, {
      onSuccess: () => toast.success('Report deleted'),
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to delete report'),
    });
  };

  const handlePauseResume = (id: string, isActive: boolean) => {
    const action = isActive ? pauseSchedule : resumeSchedule;
    action.mutate(id, {
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update schedule'),
    });
  };

  const handleRunNow = (id: string) => {
    runSchedule.mutate(id, {
      onSuccess: () => {
        setActiveTab('history');
        toast.success('Report run triggered');
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to run schedule'),
    });
  };

  const handleDeleteSchedule = (id: string) => {
    deleteSchedule.mutate(id, {
      onSuccess: () => toast.success('Schedule removed'),
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to delete schedule'),
    });
  };

  const statCards = [
    { label: 'Total Reports',     value: statsData?.totalReports ?? '—',    icon: FileBarChart2, color: 'text-primary',    bg: 'bg-primary/10' },
    { label: 'Ready to Download', value: statsData?.readyToDownload ?? '—', icon: Download,      color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Active Schedules',  value: statsData?.activeSchedules ?? '—', icon: Repeat,        color: 'text-secondary',   bg: 'bg-secondary/10' },
    { label: 'Report Types',      value: statsData?.reportTypes ?? '—',     icon: BarChart3,     color: 'text-accent',      bg: 'bg-accent/10' },
  ];

  const reports = reportsData?.reports ?? [];
  const reportsMeta = reportsData?.meta;
  const schedules = schedulesData?.schedules ?? [];
  const schedulesMeta = schedulesData?.meta;

  return (
    <div className='space-y-6'>
      <PageHeader title='Reports' subtitle='Generate, export, and schedule data reports' />

      {/* Stats */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.4 }}>
            <Card>
              <CardContent className='flex items-center gap-4 p-5'>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className='text-2xl font-bold'>{s.value}</p>
                  <p className='text-xs text-muted-foreground'>{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main two-column grid */}
      <div className='grid gap-6 lg:grid-cols-[400px_1fr]'>

        {/* ── Report Builder ── */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
          <Card className='h-fit'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Plus className='h-4 w-4' /> Build Report
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-5'>

              {/* Report name */}
              <div className='space-y-1.5'>
                <Label htmlFor={`${formId}-name`}>
                  Report Name <span className='font-normal text-muted-foreground'>(optional)</span>
                </Label>
                <Input
                  id={`${formId}-name`}
                  placeholder={resolvedName}
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>

              {/* Report type */}
              <div className='space-y-1.5'>
                <Label>Report Type</Label>
                <div className='grid grid-cols-2 gap-2'>
                  {REPORT_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={`flex items-center gap-2.5 rounded-lg border p-3 text-left transition-all ${
                        selectedType === t.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/40 hover:bg-muted/40'
                      }`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${t.bg}`}>
                        <t.icon className={`h-4 w-4 ${t.color}`} />
                      </div>
                      <div className='min-w-0'>
                        <p className='text-xs font-semibold leading-tight'>{t.label}</p>
                        <p className='truncate text-[10px] leading-tight text-muted-foreground'>{t.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date range */}
              <div className='space-y-1.5'>
                <Label>Date Range</Label>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <p className='mb-1 text-[11px] text-muted-foreground'>From</p>
                    <Input type='date' value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className='text-sm' />
                  </div>
                  <div>
                    <p className='mb-1 text-[11px] text-muted-foreground'>To</p>
                    <Input type='date' value={dateTo} onChange={(e) => setDateTo(e.target.value)} className='text-sm' />
                  </div>
                </div>
              </div>

              {/* Export format */}
              <div className='space-y-1.5'>
                <Label>Export Format</Label>
                <div className='flex gap-2'>
                  {(['csv', 'excel'] as ReportFormat[]).map((f) => {
                    const Icon = FORMAT_ICON[f];
                    return (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all ${
                          format === f
                            ? 'border-primary bg-primary/5 text-primary shadow-sm'
                            : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        <Icon className='h-4 w-4' />
                        {f === 'csv' ? 'CSV' : 'Excel'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Frequency */}
              <div className='space-y-1.5'>
                <Label>Frequency</Label>
                <div className='grid grid-cols-4 gap-1.5'>
                  {FREQ_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setFrequency(o.value)}
                      className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                        frequency === o.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action button */}
              {frequency === 'one_time' ? (
                <Button
                  className='gradient-bg w-full gap-2 text-primary-foreground'
                  disabled={generateReport.isPending}
                  onClick={handleGenerate}
                >
                  {generateReport.isPending
                    ? <><Loader2 className='h-4 w-4 animate-spin' /> Generating…</>
                    : <><Download className='h-4 w-4' /> Generate Report</>}
                </Button>
              ) : (
                <Button
                  className='gradient-bg w-full gap-2 text-primary-foreground'
                  disabled={generateReport.isPending}
                  onClick={handleCreateSchedule}
                >
                  {generateReport.isPending
                    ? <><Loader2 className='h-4 w-4 animate-spin' /> Creating…</>
                    : <><Repeat className='h-4 w-4' /> Create Schedule</>}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── History + Scheduled ── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className='space-y-4'
        >
          {/* Tabs */}
          <div className='flex w-fit gap-1 rounded-lg border border-border bg-muted/30 p-1'>
            {(['history', 'scheduled'] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'history'
                  ? `History${reportsMeta ? ` (${reportsMeta.total})` : ''}`
                  : `Scheduled${schedulesMeta ? ` (${schedulesMeta.total})` : ''}`}
              </button>
            ))}
          </div>

          {/* History tab */}
          {activeTab === 'history' && (
            <Card>
              <CardContent className='p-0'>
                {reportsLoading ? (
                  <div className='divide-y divide-border'>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className='flex items-center gap-3 px-4 py-3'>
                        <div className='h-9 w-9 shrink-0 animate-pulse rounded-lg bg-muted/60' />
                        <div className='flex-1 space-y-2'>
                          <div className='h-4 w-3/4 animate-pulse rounded bg-muted/60' />
                          <div className='h-3 w-1/2 animate-pulse rounded bg-muted/60' />
                        </div>
                        <div className='h-6 w-20 animate-pulse rounded-full bg-muted/60' />
                      </div>
                    ))}
                  </div>
                ) : reports.length === 0 ? (
                  <div className='flex flex-col items-center gap-3 py-16 text-center'>
                    <FileBarChart2 className='h-10 w-10 text-muted-foreground/40' />
                    <p className='text-sm text-muted-foreground'>No reports generated yet</p>
                  </div>
                ) : (
                  <div className='divide-y divide-border'>
                    {reports.map((r, i) => {
                      const sb = STATUS_BADGE[r.status];
                      const FmtIcon = FORMAT_ICON[r.format];
                      const type = typeConfig(r.type);
                      return (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.3 }}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30 ${reportsFetching ? 'opacity-70' : ''}`}
                        >
                          <div className={`hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${type?.bg ?? 'bg-muted'}`}>
                            {type ? <type.icon className={`h-4 w-4 ${type.color}`} /> : <FileBarChart2 className='h-4 w-4' />}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='truncate text-sm font-medium'>{r.name}</p>
                            <p className='truncate text-xs text-muted-foreground'>{fmtDate(r.dateFrom)} – {fmtDate(r.dateTo)}</p>
                          </div>
                          <div className='hidden md:flex flex-col items-end gap-1'>
                            <div className='flex items-center gap-1.5'>
                              <FmtIcon className='h-3.5 w-3.5 text-muted-foreground' />
                              <span className='text-xs uppercase text-muted-foreground'>{r.format}</span>
                            </div>
                            {r.rowCount != null && (
                              <span className='text-[11px] text-muted-foreground'>
                                {r.rowCount.toLocaleString()} rows{r.fileSize ? ` · ${r.fileSize}` : ''}
                              </span>
                            )}
                          </div>
                          <Badge variant='outline' className={`shrink-0 gap-1 ${sb.className}`}>
                            <sb.icon className={`h-3 w-3 ${sb.spin ? 'animate-spin' : ''}`} />
                            {sb.label}
                          </Badge>
                          <div className='flex shrink-0 items-center gap-1'>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              disabled={r.status !== 'ready' || downloadReport.isPending}
                              onClick={() => handleDownload(r.id, r.name)}
                              title='Download'
                            >
                              <Download className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-destructive hover:text-destructive'
                              disabled={deleteReport.isPending}
                              onClick={() => handleDeleteReport(r.id)}
                              title='Delete'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                          <div className='hidden lg:block shrink-0 text-right'>
                            <p className='text-xs text-muted-foreground'>{formatRelativeTime(new Date(r.createdAt))}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                {reportsMeta && reportsMeta.totalPages > 1 && (
                  <DataTablePagination
                    currentPage={reportsMeta.page}
                    totalPages={reportsMeta.totalPages}
                    startIndex={(reportsMeta.page - 1) * reportsMeta.limit + 1}
                    endIndex={Math.min(reportsMeta.page * reportsMeta.limit, reportsMeta.total)}
                    totalItems={reportsMeta.total}
                    onPageChange={setHistoryPage}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Scheduled tab */}
          {activeTab === 'scheduled' && (
            <Card>
              <CardContent className='p-0'>
                {schedulesLoading ? (
                  <div className='divide-y divide-border'>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className='flex items-center gap-3 px-4 py-3'>
                        <div className='h-9 w-9 shrink-0 animate-pulse rounded-lg bg-muted/60' />
                        <div className='flex-1 space-y-2'>
                          <div className='h-4 w-3/4 animate-pulse rounded bg-muted/60' />
                          <div className='h-3 w-1/2 animate-pulse rounded bg-muted/60' />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : schedules.length === 0 ? (
                  <div className='flex flex-col items-center gap-3 py-16 text-center'>
                    <Repeat className='h-10 w-10 text-muted-foreground/40' />
                    <p className='text-sm text-muted-foreground'>No recurring schedules yet</p>
                  </div>
                ) : (
                  <div className='divide-y divide-border'>
                    {schedules.map((s, i) => {
                      const type = typeConfig(s.type);
                      const FmtIcon = FORMAT_ICON[s.format];
                      const isActive = s.status === 'active';
                      return (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.3 }}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30 ${schedulesFetching ? 'opacity-70' : ''}`}
                        >
                          <div className={`hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${type?.bg ?? 'bg-muted'}`}>
                            {type ? <type.icon className={`h-4 w-4 ${type.color}`} /> : <FileBarChart2 className='h-4 w-4' />}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='truncate text-sm font-medium'>{s.name}</p>
                            <div className='mt-0.5 flex items-center gap-2'>
                              <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium capitalize ${
                                isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                              }`}>
                                {isActive ? <CheckCircle2 className='h-2.5 w-2.5' /> : <Pause className='h-2.5 w-2.5' />}
                                {s.status}
                              </span>
                              <span className='text-xs capitalize text-muted-foreground'>{s.frequency.replace('_', ' ')}</span>
                              <FmtIcon className='h-3 w-3 text-muted-foreground' />
                              <span className='text-[11px] uppercase text-muted-foreground'>{s.format}</span>
                            </div>
                          </div>
                          <div className='hidden md:flex flex-col items-end gap-1 text-right'>
                            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                              <Calendar className='h-3 w-3' />
                              Next: {fmtDate(s.nextRunAt)}
                            </div>
                            {s.lastRunAt && (
                              <p className='text-[11px] text-muted-foreground'>
                                Last: {formatRelativeTime(new Date(s.lastRunAt))}
                              </p>
                            )}
                          </div>
                          <div className='flex shrink-0 items-center gap-1'>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              disabled={runSchedule.isPending}
                              onClick={() => handleRunNow(s.id)}
                              title='Run now'
                            >
                              <Play className='h-4 w-4 text-emerald-600' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              disabled={pauseSchedule.isPending || resumeSchedule.isPending}
                              onClick={() => handlePauseResume(s.id, isActive)}
                              title={isActive ? 'Pause' : 'Resume'}
                            >
                              {isActive
                                ? <Pause className='h-4 w-4 text-amber-500' />
                                : <Play className='h-4 w-4 text-primary' />}
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-destructive hover:text-destructive'
                              disabled={deleteSchedule.isPending}
                              onClick={() => handleDeleteSchedule(s.id)}
                              title='Delete schedule'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                {schedulesMeta && schedulesMeta.totalPages > 1 && (
                  <DataTablePagination
                    currentPage={schedulesMeta.page}
                    totalPages={schedulesMeta.totalPages}
                    startIndex={(schedulesMeta.page - 1) * schedulesMeta.limit + 1}
                    endIndex={Math.min(schedulesMeta.page * schedulesMeta.limit, schedulesMeta.total)}
                    totalItems={schedulesMeta.total}
                    onPageChange={setScheduledPage}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
