import { useState, type FC } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  Building2,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Receipt,
  Banknote,
  Cpu,
  Settings,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useDashboardStats } from '@/hooks/useDashboard';
import { formatRelativeTime } from '@/lib/format';
import type { DashboardStats, DashboardPeriod, ActivityEntry } from '@/types/dashboard';

type DatePreset = 'default' | DashboardPeriod;

const PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: 'default',    label: 'Last 6 Months' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'last7days',  label: 'Last 7 Days' },
  { value: 'today',      label: 'Today' },
];

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  invoice:  Receipt,
  payment:  Banknote,
  ai:       Cpu,
  user:     Users,
  business: Building2,
  system:   Settings,
};

function deriveRevenueGrowth(stats: DashboardStats): string {
  const h = stats.revenueHistory;
  if (h.length < 2) return 'N/A';
  const prev = h[h.length - 2].value;
  const curr = h[h.length - 1].value;
  if (prev === 0) return curr > 0 ? '+∞%' : 'N/A';
  const pct = ((curr - prev) / prev) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

const PortalDashboard: FC = () => {
  const [preset, setPreset] = useState<DatePreset>('default');

  const period = preset === 'default' ? undefined : preset;
  const isPeriod = !!period;

  const {
    data: stats,
    isLoading: statsLoading,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useDashboardStats(period);

  const revenueChartData =
    stats?.revenueHistory.map((p) => ({ label: p.label, revenue: p.value })) ?? [];
  const growthChartData =
    stats?.growthHistory.map((p) => ({ label: p.label, growth: p.value })) ?? [];

  const revenueGrowth = stats ? deriveRevenueGrowth(stats) : null;
  const revenueGrowthUp = revenueGrowth ? !revenueGrowth.startsWith('-') : true;

  const statCards = [
    {
      label: isPeriod ? 'New Signups'      : 'Total Users',
      value: stats ? stats.totalUsers.toLocaleString() : null,
      change: null,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: isPeriod ? 'Period Revenue'   : 'Monthly Revenue',
      value: stats ? `$${stats.monthlyRevenue.toLocaleString()}` : null,
      change: revenueGrowth ? { value: revenueGrowth, up: revenueGrowthUp } : null,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      label: isPeriod ? 'New Businesses'   : 'Active Businesses',
      value: stats ? stats.activeBusinesses.toLocaleString() : null,
      change: null,
      icon: Building2,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      label: 'AI Queries Today',
      value: '—',
      change: null,
      icon: BrainCircuit,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ];

  const growthChartTitle = isPeriod ? 'New Businesses' : 'Business Growth %';
  const growthYFormatter = isPeriod
    ? (v: number) => String(v)
    : (v: number) => `${v}%`;
  const growthTooltipFormatter = isPeriod
    ? (value: unknown) => [`${Number(value ?? 0)}`, 'New Businesses']
    : (value: unknown) => [`${Number(value ?? 0)}%`, 'Growth'];

  return (
    <div className='space-y-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'
      >
        <div>
          <h1 className='text-2xl font-bold'>Dashboard</h1>
          <p className='text-muted-foreground'>Servix OS admin overview</p>
        </div>

        <div className='flex items-center gap-2'>
          <Select value={preset} onValueChange={(v) => setPreset(v as DatePreset)}>
            <SelectTrigger className='w-40'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRESET_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant='outline'
            size='sm'
            onClick={() => void refetchStats()}
            disabled={statsFetching}
            className='px-2'
          >
            <RefreshCw size={15} className={statsFetching ? 'animate-spin' : ''} />
          </Button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Card className='h-full border border-border'>
              <CardContent className='flex h-full items-center gap-4 p-6'>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>{card.label}</p>
                  {statsLoading && card.value === null ? (
                    <div className='mt-1 h-7 w-20 animate-pulse rounded bg-muted/60' />
                  ) : (
                    <p className='text-2xl font-bold'>{card.value}</p>
                  )}
                  {card.change && (
                    <div className='mt-1 flex items-center gap-1'>
                      {card.change.up ? (
                        <TrendingUp className='h-3 w-3 text-emerald-500' />
                      ) : (
                        <TrendingDown className='h-3 w-3 text-destructive' />
                      )}
                      <span className={`text-xs font-medium ${card.change.up ? 'text-emerald-500' : 'text-destructive'}`}>
                        {card.change.value}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue & Growth Charts */}
      <div className='grid gap-4 lg:grid-cols-2'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-[300px]'>
                {statsLoading ? (
                  <div className='h-full animate-pulse rounded-lg bg-muted/40' />
                ) : (
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='5%' stopColor='hsl(217, 91%, 60%)' stopOpacity={0.3} />
                          <stop offset='95%' stopColor='hsl(217, 91%, 60%)' stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' stroke='hsl(220, 13%, 88%)' opacity={0.3} />
                      <XAxis dataKey='label' stroke='hsl(220, 10%, 46%)' fontSize={12} />
                      <YAxis
                        stroke='hsl(220, 10%, 46%)'
                        fontSize={12}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, 'Revenue']}
                      />
                      <Area
                        type='monotone'
                        dataKey='revenue'
                        stroke='hsl(217, 91%, 60%)'
                        fill='url(#revenueGradient)'
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{growthChartTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-[300px]'>
                {statsLoading ? (
                  <div className='h-full animate-pulse rounded-lg bg-muted/40' />
                ) : (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={growthChartData}>
                      <CartesianGrid strokeDasharray='3 3' stroke='hsl(220, 13%, 88%)' opacity={0.3} />
                      <XAxis dataKey='label' stroke='hsl(220, 10%, 46%)' fontSize={12} />
                      <YAxis
                        stroke='hsl(220, 10%, 46%)'
                        fontSize={12}
                        tickFormatter={growthYFormatter}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={growthTooltipFormatter}
                      />
                      <Bar dataKey='growth' fill='hsl(270, 70%, 60%)' radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className='space-y-3'>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className='h-14 animate-pulse rounded-lg bg-muted/40' />
                ))}
              </div>
            ) : (
              <div className='space-y-3'>
                {(stats?.recentActivities ?? []).map((activity: ActivityEntry, i: number) => {
                  const Icon = CATEGORY_ICONS[activity.category] ?? FileText;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.04, duration: 0.3 }}
                      className='flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50'
                    >
                      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
                        <Icon className='h-4 w-4 text-primary' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium truncate capitalize'>
                          {activity.actorName} {activity.action} {activity.category}
                        </p>
                      </div>
                      <span className='shrink-0 text-xs text-muted-foreground'>
                        {formatRelativeTime(new Date(activity.createdAt))}
                      </span>
                    </motion.div>
                  );
                })}
                {(stats?.recentActivities ?? []).length === 0 && (
                  <p className='text-sm text-muted-foreground py-2'>No recent activity.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PortalDashboard;
