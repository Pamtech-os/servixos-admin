import { useMemo, type FC } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users } from 'lucide-react';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

function getMonthName(offset: number): string {
  const d = new Date(currentYear, currentMonth - offset, 1);
  return d.toLocaleString('default', { month: 'short' });
}

const mrrData = [
  { month: getMonthName(5), mrr: 38200 },
  { month: getMonthName(4), mrr: 42100 },
  { month: getMonthName(3), mrr: 45800 },
  { month: getMonthName(2), mrr: 49300 },
  { month: getMonthName(1), mrr: 53600 },
  { month: getMonthName(0), mrr: 58400 },
];

const planDistribution = [
  { name: 'Starter', value: 1420, percentage: '50%' },
  { name: 'Pro', value: 1180, percentage: '41%' },
  { name: 'Growth', value: 247, percentage: '9%' },
];

const PLAN_COLORS = ['hsl(217, 91%, 60%)', 'hsl(270, 70%, 60%)', 'hsl(174, 72%, 50%)'];

interface PlanChange {
  id: string;
  business: string;
  change: string;
  type: 'upgrade' | 'conversion' | 'churn';
  date: string;
}

const recentPlanChanges: PlanChange[] = [
  {
    id: 'pc1',
    business: "Mike's Plumbing",
    change: 'Starter → Pro',
    type: 'upgrade',
    date: 'Today',
  },
  {
    id: 'pc2',
    business: 'Green Lawn Care',
    change: 'Trial → Starter',
    type: 'conversion',
    date: 'Yesterday',
  },
  {
    id: 'pc3',
    business: 'Sparkle Maids',
    change: 'Pro → Cancelled',
    type: 'churn',
    date: '2 days ago',
  },
  {
    id: 'pc4',
    business: 'Elite Electric',
    change: 'Starter → Pro',
    type: 'upgrade',
    date: '3 days ago',
  },
  {
    id: 'pc5',
    business: 'Tech Repair Hub',
    change: 'Trial → Starter',
    type: 'conversion',
    date: '4 days ago',
  },
];

const typeConfig: Record<PlanChange['type'], { label: string; className: string }> = {
  upgrade: {
    label: 'upgrade',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  conversion: { label: 'conversion', className: 'bg-primary/10 text-primary border-primary/20' },
  churn: { label: 'churn', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

interface CustomTooltipContentProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltipContent: FC<CustomTooltipContentProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className='rounded-lg border border-border bg-card px-3 py-2 shadow-md'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='text-sm font-semibold'>${payload[0].value.toLocaleString()}</p>
    </div>
  );
};

const Subscriptions: FC = () => {
  const statCards = useMemo(
    () => [
      { label: 'Monthly Recurring Revenue', value: '$58,400', change: '+8.9%', icon: DollarSign },
      { label: 'Paid Subscribers', value: '2,847', change: '+124 this month', icon: Users },
    ],
    []
  );

  return (
    <div className='space-y-6'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className='text-2xl font-bold'>Subscriptions</h1>
        <p className='text-muted-foreground'>Revenue, plans, and subscriber analytics</p>
      </motion.div>

      {/* Stat Cards */}
      <div className='grid gap-4 sm:grid-cols-2'>
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
          >
            <Card className='card-shadow'>
              <CardContent className='flex items-center gap-4 p-6'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl gradient-bg text-primary-foreground'>
                  <card.icon className='h-6 w-6' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>{card.label}</p>
                  <p className='text-2xl font-bold'>{card.value}</p>
                  <p className='text-xs text-emerald-600'>{card.change}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* MRR Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card className='card-shadow'>
            <CardHeader>
              <CardTitle className='text-base'>Monthly Recurring Revenue</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[280px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={mrrData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
                    <XAxis
                      dataKey='month'
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltipContent />} />
                    <Bar dataKey='mrr' fill='hsl(217, 91%, 60%)' radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Plan Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Card className='card-shadow'>
            <CardHeader>
              <CardTitle className='text-base'>Plan Distribution</CardTitle>
              <CardDescription>Active subscriber breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[280px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey='value'
                      label={({ name, percent }) =>
                        `${name} (${Math.round((percent ?? 0) * 100)}%)`
                      }
                    >
                      {planDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PLAN_COLORS[index]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip
                      formatter={(value) => Number(value ?? 0).toLocaleString()}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
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
        <Card className='card-shadow'>
          <CardHeader>
            <CardTitle className='text-base'>Recent Plan Changes</CardTitle>
            <CardDescription>Upgrades, conversions, and cancellations</CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className='text-right'>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPlanChanges.map((pc) => (
                  <TableRow key={pc.id} className='border-b border-border transition-colors hover:bg-muted/50'>
                    <TableCell className='font-medium'>{pc.business}</TableCell>
                    <TableCell className='text-muted-foreground'>{pc.change}</TableCell>
                    <TableCell>
                      <Badge variant='outline' className={typeConfig[pc.type].className}>
                        {typeConfig[pc.type].label}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right text-muted-foreground'>{pc.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Subscriptions;
