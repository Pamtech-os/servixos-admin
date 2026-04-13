import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Globe, Zap, Clock, CheckCircle, Monitor, Database, Cpu, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const statCards = [
  { label: 'Websites Published', value: '1,247', icon: Globe },
  { label: 'AI Queries (24h)', value: '4,512', icon: Zap },
  { label: 'Avg Response Time', value: '142ms', icon: Clock },
  { label: 'Uptime (30d)', value: '99.97%', icon: CheckCircle },
];

const systemHealth = [
  { name: 'API Gateway', icon: Monitor, status: 'operational', uptime: '99.98%' },
  { name: 'Database', icon: Database, status: 'operational', uptime: '99.99%' },
  { name: 'AI Engine', icon: Cpu, status: 'operational', uptime: '99.95%' },
  { name: 'CDN / Website Hosting', icon: Wifi, status: 'operational', uptime: '99.99%' },
];

const trafficData = [
  { time: '6am', requests: 120 },
  { time: '7am', requests: 180 },
  { time: '8am', requests: 340 },
  { time: '9am', requests: 520 },
  { time: '10am', requests: 610 },
  { time: '11am', requests: 680 },
  { time: '12pm', requests: 720 },
  { time: '1pm', requests: 650 },
  { time: '2pm', requests: 580 },
  { time: '3pm', requests: 490 },
  { time: '4pm', requests: 410 },
  { time: '5pm', requests: 320 },
  { time: '6pm', requests: 250 },
  { time: '7pm', requests: 180 },
  { time: '8pm', requests: 110 },
];

const featureAdoption = [
  { name: 'AI Advisor', uses: 4512, max: 4512 },
  { name: 'Website Builder', uses: 2340, max: 4512 },
  { name: 'Invoicing', uses: 1890, max: 4512 },
  { name: 'Job Scheduling', uses: 1560, max: 4512 },
  { name: 'CRM', uses: 1230, max: 4512 },
  { name: 'Payments', uses: 980, max: 4512 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const Analytics: FC = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Platform Analytics</h1>
        <p className='text-sm text-muted-foreground'>System performance and feature usage</p>
      </div>

      {/* Stat Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial='hidden'
            animate='visible'
            variants={fadeUp}
          >
            <Card>
              <CardContent className='p-5'>
                <div className='flex items-center justify-between mb-3'>
                  <span className='text-sm text-muted-foreground'>{stat.label}</span>
                  <stat.icon size={18} className='text-muted-foreground' />
                </div>
                <p className='text-3xl font-bold'>{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className='pb-4'>
            <CardTitle className='text-lg'>System Health</CardTitle>
            <CardDescription>All systems operational</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {systemHealth.map((sys) => (
                <div
                  key={sys.name}
                  className='flex items-center gap-3 rounded-lg border border-border p-4'
                >
                  <sys.icon size={20} className='text-muted-foreground shrink-0' />
                  <div className='min-w-0'>
                    <p className='text-sm font-medium truncate'>{sys.name}</p>
                    <div className='flex items-center gap-2 mt-0.5'>
                      <span className='inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400'>
                        <CheckCircle size={12} /> operational
                      </span>
                      <span className='text-xs text-muted-foreground'>{sys.uptime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* API Traffic & Feature Adoption */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className='h-full'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-lg'>API Traffic (Today)</CardTitle>
              <CardDescription>Requests per hour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-72'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart
                    data={trafficData}
                    margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id='trafficGrad' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='hsl(var(--primary))' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='hsl(var(--primary))' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
                    <XAxis
                      dataKey='time'
                      tick={{ fontSize: 12 }}
                      className='text-muted-foreground'
                    />
                    <YAxis tick={{ fontSize: 12 }} className='text-muted-foreground' />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    />
                    <Area
                      type='monotone'
                      dataKey='requests'
                      stroke='hsl(var(--primary))'
                      fill='url(#trafficGrad)'
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
          transition={{ delay: 0.4 }}
        >
          <Card className='h-full'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-lg'>Feature Adoption</CardTitle>
              <CardDescription>Most used platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-5'>
                {featureAdoption.map((feature) => (
                  <div key={feature.name} className='space-y-1.5'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='font-medium'>{feature.name}</span>
                      <span className='text-muted-foreground'>
                        {feature.uses.toLocaleString()} uses
                      </span>
                    </div>
                    <div className='h-2.5 w-full rounded-full bg-muted overflow-hidden'>
                      <motion.div
                        className='h-full rounded-full bg-primary'
                        initial={{ width: 0 }}
                        animate={{ width: `${(feature.uses / feature.max) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
