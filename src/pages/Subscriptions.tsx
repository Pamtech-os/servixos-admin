import { type FC } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp, TrendingDown, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { PageHeader, StatsGrid } from '@/components/shared';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { formatRelativeTime } from '@/lib/format';
import type { PlanChangeType } from '@/types/subscriptions';

const PLAN_CHANGE_CONFIG: Record<PlanChangeType, { label: string; className: string }> = {
  upgrade:    { label: 'Upgrade',    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  downgrade:  { label: 'Downgrade',  className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  conversion: { label: 'Conversion', className: 'bg-primary/10 text-primary border-primary/20' },
  churn:      { label: 'Churn',      className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const PLAN_COLORS: Record<string, string> = {
  starter: 'hsl(217, 91%, 60%)',
  growth:  'hsl(174, 72%, 50%)',
  pro:     'hsl(270, 70%, 60%)',
};

const Subscriptions: FC = () => {
  const { data, isLoading } = useSubscriptions();

  const stats = data?.stats;

  const mrrGrowthUp = (stats?.mrrGrowthPercent ?? 0) >= 0;
  const mrrGrowthLabel = stats
    ? `${mrrGrowthUp ? '+' : ''}${stats.mrrGrowthPercent.toFixed(1)}% MoM`
    : '—';

  const statItems = [
    { label: 'MRR',            value: stats ? `$${stats.mrr.toLocaleString()}`                   : '—', icon: DollarSign, color: 'text-emerald-600' },
    { label: 'MRR Growth',     value: stats ? mrrGrowthLabel                                      : '—', icon: mrrGrowthUp ? TrendingUp : TrendingDown, color: mrrGrowthUp ? 'text-emerald-600' : 'text-destructive' },
    { label: 'Paid Subscribers', value: stats ? stats.paidSubscribers.toLocaleString()            : '—', icon: Users,      color: 'text-primary' },
    { label: 'New This Month', value: stats ? stats.newPaidSubscribersThisMonth.toLocaleString()  : '—', icon: UserPlus,   color: 'text-secondary' },
  ];

  const mrrChartData = (data?.mrrHistory ?? []).map((p) => ({ month: p.label, value: p.value }));
  const planChartData = (data?.planDistribution ?? []).map((p) => ({
    plan: p.plan.charAt(0).toUpperCase() + p.plan.slice(1),
    count: p.count,
    percentage: p.percentage,
    fill: PLAN_COLORS[p.plan.toLowerCase()] ?? 'hsl(217, 91%, 60%)',
  }));

  return (
    <div className='space-y-6'>
      <PageHeader title='Subscriptions' subtitle='Revenue, plans, and subscriber analytics' />

      <StatsGrid stats={statItems} />

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* MRR History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Monthly Recurring Revenue</CardTitle>
              <CardDescription>MRR trend over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[260px]'>
                {isLoading ? (
                  <div className='h-full animate-pulse rounded-lg bg-muted/40' />
                ) : (
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={mrrChartData}>
                      <defs>
                        <linearGradient id='mrrGradient' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='5%' stopColor='hsl(217, 91%, 60%)' stopOpacity={0.3} />
                          <stop offset='95%' stopColor='hsl(217, 91%, 60%)' stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' opacity={0.4} />
                      <XAxis dataKey='month' tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`, 'MRR']}
                      />
                      <Area
                        type='monotone'
                        dataKey='value'
                        stroke='hsl(217, 91%, 60%)'
                        fill='url(#mrrGradient)'
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Plan Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Plan Distribution</CardTitle>
              <CardDescription>Active subscribers by plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[260px]'>
                {isLoading ? (
                  <div className='h-full animate-pulse rounded-lg bg-muted/40' />
                ) : (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={planChartData} layout='vertical' margin={{ left: 16 }}>
                      <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' opacity={0.4} horizontal={false} />
                      <XAxis type='number' tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis type='category' dataKey='plan' tick={{ fontSize: 13, fill: 'hsl(var(--foreground))' }} width={60} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(v, _name, props) => [
                          `${Number(v)} (${props.payload.percentage}%)`,
                          'Subscribers',
                        ]}
                      />
                      <Bar dataKey='count' radius={[0, 6, 6, 0]}>
                        {planChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Plan Changes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Recent Plan Changes</CardTitle>
            <CardDescription>Upgrades, conversions, downgrades, and churn</CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className='text-right'>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(5)].map((__, j) => (
                        <TableCell key={j}>
                          <div className='h-4 animate-pulse rounded bg-muted/60' />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (data?.recentPlanChanges ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='py-8 text-center text-muted-foreground'>
                      No recent plan changes.
                    </TableCell>
                  </TableRow>
                ) : (
                  (data?.recentPlanChanges ?? []).map((pc, i) => {
                    const cfg = PLAN_CHANGE_CONFIG[pc.type];
                    return (
                      <TableRow key={i} className='border-b border-border transition-colors hover:bg-muted/50'>
                        <TableCell className='font-medium'>{pc.businessName}</TableCell>
                        <TableCell className='capitalize text-muted-foreground'>{pc.fromPlan}</TableCell>
                        <TableCell className='capitalize'>{pc.toPlan}</TableCell>
                        <TableCell>
                          <Badge variant='outline' className={cfg.className}>{cfg.label}</Badge>
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {formatRelativeTime(new Date(pc.createdAt))}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Subscriptions;
