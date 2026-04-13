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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { revenueData, recentActivities, getAdminStats } from '@/lib/admin-mock-data';

type DatePreset = 'today' | '7days' | '30days';

const PortalDashboard: FC = () => {
  const [datePreset, setDatePreset] = useState<DatePreset>('30days');
  const stats = getAdminStats();

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers.value,
      change: stats.totalUsers.change,
      changeType: stats.totalUsers.changeType,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Monthly Revenue',
      value: stats.monthlyRevenue.value,
      change: stats.monthlyRevenue.change,
      changeType: stats.monthlyRevenue.changeType,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Active Businesses',
      value: stats.activeBusinesses.value,
      change: stats.activeBusinesses.change,
      changeType: stats.activeBusinesses.changeType,
      icon: Building2,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      label: 'AI Queries Today',
      value: stats.aiQueriesToday.value,
      change: stats.aiQueriesToday.change,
      changeType: stats.aiQueriesToday.changeType,
      icon: BrainCircuit,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ];

  const activityIcons: Record<string, typeof FileText> = {
    business: Building2,
    payment: Banknote,
    ai: Cpu,
    user: Users,
    system: Settings,
    invoice: Receipt,
  };

  const presets: { label: string; value: DatePreset }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7days' },
    { label: 'Last 30 Days', value: '30days' },
  ];

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
        <div className='flex gap-2'>
          {presets.map((p) => (
            <Button
              key={p.value}
              variant={datePreset === p.value ? 'default' : 'outline'}
              size='sm'
              onClick={() => setDatePreset(p.value)}
              className={datePreset === p.value ? 'gradient-bg text-primary-foreground' : ''}
            >
              {p.label}
            </Button>
          ))}
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
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>{card.label}</p>
                  <p className='text-2xl font-bold'>{card.value}</p>
                  <div className='flex items-center gap-1 mt-1'>
                    {card.changeType === 'up' ? (
                      <TrendingUp className='h-3 w-3 text-emerald-500' />
                    ) : (
                      <TrendingDown className='h-3 w-3 text-destructive' />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        card.changeType === 'up' ? 'text-emerald-500' : 'text-destructive'
                      }`}
                    >
                      {card.change}
                    </span>
                  </div>
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
              <CardTitle>Revenue (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='hsl(217, 91%, 60%)' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='hsl(217, 91%, 60%)' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='hsl(220, 13%, 88%)'
                      opacity={0.3}
                    />
                    <XAxis dataKey='month' stroke='hsl(220, 10%, 46%)' fontSize={12} />
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
              <CardTitle>Growth % (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={revenueData}>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='hsl(220, 13%, 88%)'
                      opacity={0.3}
                    />
                    <XAxis dataKey='month' stroke='hsl(220, 10%, 46%)' fontSize={12} />
                    <YAxis
                      stroke='hsl(220, 10%, 46%)'
                      fontSize={12}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [`${Number(value ?? 0)}%`, 'Growth']}
                    />
                    <Bar dataKey='growth' fill='hsl(270, 70%, 60%)' radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
            <div className='space-y-3'>
              {recentActivities.map((activity, i) => {
                const Icon = activityIcons[activity.type] || FileText;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.05, duration: 0.3 }}
                    className='flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50'
                  >
                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
                      <Icon className='h-4 w-4 text-primary' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate'>{activity.description}</p>
                    </div>
                    <span className='shrink-0 text-xs text-muted-foreground'>
                      {activity.timestamp}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PortalDashboard;
