import { useState, type FC } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const now = new Date();
const getMonth = (offset: number) =>
  new Date(now.getFullYear(), now.getMonth() - offset, 1).toLocaleString('default', {
    month: 'short',
  });

const monthlyUsage = [
  { month: getMonth(5), queries: 820000 },
  { month: getMonth(4), queries: 940000 },
  { month: getMonth(3), queries: 1050000 },
  { month: getMonth(2), queries: 1120000 },
  { month: getMonth(1), queries: 1200000 },
  { month: getMonth(0), queries: 1340000 },
];

const dailyUsage = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(Date.now() - (13 - i) * 86400000);
  return {
    day: `${d.getMonth() + 1}/${d.getDate()}`,
    queries: Math.floor(35000 + Math.random() * 20000),
  };
});

const modelDistribution = [
  { name: 'GPT-4o', value: 45, color: 'hsl(217, 91%, 60%)' },
  { name: 'GPT-4o-mini', value: 30, color: 'hsl(270, 70%, 60%)' },
  { name: 'Claude 3.5', value: 15, color: 'hsl(174, 72%, 50%)' },
  { name: 'Gemini Pro', value: 10, color: 'hsl(40, 90%, 55%)' },
];

interface BusinessUsage {
  id: string;
  businessName: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  queriesUsed: number;
  queryLimit: number;
  costEstimate: number;
  status: 'normal' | 'warning' | 'exceeded';
}

const businessUsageData: BusinessUsage[] = [
  {
    id: '1',
    businessName: 'TechNova Inc.',
    plan: 'Enterprise',
    queriesUsed: 185000,
    queryLimit: 250000,
    costEstimate: 2405,
    status: 'normal',
  },
  {
    id: '2',
    businessName: 'CloudBase Technologies',
    plan: 'Pro',
    queriesUsed: 92000,
    queryLimit: 100000,
    costEstimate: 1196,
    status: 'warning',
  },
  {
    id: '3',
    businessName: 'DesignCraft Studio',
    plan: 'Pro',
    queriesUsed: 78000,
    queryLimit: 100000,
    costEstimate: 1014,
    status: 'normal',
  },
  {
    id: '4',
    businessName: 'Servix Solutions',
    plan: 'Enterprise',
    queriesUsed: 210000,
    queryLimit: 250000,
    costEstimate: 2730,
    status: 'normal',
  },
  {
    id: '5',
    businessName: 'Stellar Dynamics LLC',
    plan: 'Starter',
    queriesUsed: 24500,
    queryLimit: 25000,
    costEstimate: 318,
    status: 'warning',
  },
  {
    id: '6',
    businessName: 'DataFlow AI',
    plan: 'Pro',
    queriesUsed: 105000,
    queryLimit: 100000,
    costEstimate: 1365,
    status: 'exceeded',
  },
  {
    id: '7',
    businessName: 'QuantumEdge AI',
    plan: 'Enterprise',
    queriesUsed: 240000,
    queryLimit: 250000,
    costEstimate: 3120,
    status: 'warning',
  },
  {
    id: '8',
    businessName: 'BrightPath Analytics',
    plan: 'Enterprise',
    queriesUsed: 145000,
    queryLimit: 250000,
    costEstimate: 1885,
    status: 'normal',
  },
  {
    id: '9',
    businessName: 'CodeForge Studios',
    plan: 'Pro',
    queriesUsed: 55000,
    queryLimit: 100000,
    costEstimate: 715,
    status: 'normal',
  },
  {
    id: '10',
    businessName: 'FreshByte Apps',
    plan: 'Starter',
    queriesUsed: 26000,
    queryLimit: 25000,
    costEstimate: 338,
    status: 'exceeded',
  },
  {
    id: '11',
    businessName: 'BuildRight Dev',
    plan: 'Pro',
    queriesUsed: 67000,
    queryLimit: 100000,
    costEstimate: 871,
    status: 'normal',
  },
  {
    id: '12',
    businessName: 'MegaCorp Industries',
    plan: 'Enterprise',
    queriesUsed: 198000,
    queryLimit: 250000,
    costEstimate: 2574,
    status: 'normal',
  },
];

const AiConsumption: FC = () => {
  const [search, setSearch] = useState('');

  const filtered = businessUsageData.filter((b) =>
    b.businessName.toLowerCase().includes(search.toLowerCase())
  );

  const totalQueries = 1340000;
  const totalCost = businessUsageData.reduce((s, b) => s + b.costEstimate, 0);
  const exceededCount = businessUsageData.filter((b) => b.status === 'exceeded').length;
  const warningCount = businessUsageData.filter((b) => b.status === 'warning').length;

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>AI Consumption</h1>
        <p className='text-sm text-muted-foreground'>
          Track AI usage across businesses and manage costs
        </p>
      </div>

      {/* Stat cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[
          {
            label: 'Total Queries (This Month)',
            value: totalQueries.toLocaleString(),
            icon: Brain,
            change: '+11.7%',
            color: 'text-primary',
          },
          {
            label: 'Estimated Cost',
            value: `$${totalCost.toLocaleString()}`,
            icon: TrendingUp,
            change: '+8.2%',
            color: 'text-primary',
          },
          {
            label: 'Near Limit',
            value: warningCount.toString(),
            icon: AlertTriangle,
            change: 'Warning',
            color: 'text-yellow-500',
          },
          {
            label: 'Exceeded Limit',
            value: exceededCount.toString(),
            icon: AlertTriangle,
            change: 'Action needed',
            color: 'text-destructive',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className='h-full'>
              <CardContent className='flex h-full items-center gap-4 p-5'>
                <div className='rounded-lg bg-primary/10 p-2.5'>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>{stat.label}</p>
                  <p className='text-2xl font-bold text-foreground'>{stat.value}</p>
                  <p className={`text-xs ${stat.color}`}>{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className='h-full'>
            <CardHeader>
              <CardTitle className='text-lg'>Monthly AI Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={280}>
                <BarChart data={monthlyUsage}>
                  <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
                  <XAxis dataKey='month' stroke='hsl(var(--muted-foreground))' fontSize={12} />
                  <YAxis
                    stroke='hsl(var(--muted-foreground))'
                    fontSize={12}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => Number(value ?? 0).toLocaleString()}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey='queries' fill='hsl(217, 91%, 60%)' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className='h-full'>
            <CardHeader>
              <CardTitle className='text-lg'>Daily Query Trend (14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={280}>
                <LineChart data={dailyUsage}>
                  <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
                  <XAxis dataKey='day' stroke='hsl(var(--muted-foreground))' fontSize={12} />
                  <YAxis
                    stroke='hsl(var(--muted-foreground))'
                    fontSize={12}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => Number(value ?? 0).toLocaleString()}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Line
                    type='monotone'
                    dataKey='queries'
                    stroke='hsl(270, 70%, 60%)'
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Model distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Model Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={250}>
              <PieChart>
                <Pie
                  data={modelDistribution}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={100}
                  dataKey='value'
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {modelDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    color: 'hsl(var(--foreground))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Business usage table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='text-lg'>Business AI Usage</CardTitle>
            <div className='relative w-64'>
              <Search
                className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                size={16}
              />
              <Input
                placeholder='Search business...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-9'
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Queries Used</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Est. Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((b) => {
                    const pct = Math.round((b.queriesUsed / b.queryLimit) * 100);
                    return (
                      <TableRow key={b.id}>
                        <TableCell className='font-medium text-foreground'>
                          {b.businessName}
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>{b.plan}</Badge>
                        </TableCell>
                        <TableCell className='text-foreground'>
                          {b.queriesUsed.toLocaleString()}
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {b.queryLimit.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <div className='h-2 w-20 rounded-full bg-muted'>
                              <div
                                className={`h-2 rounded-full ${
                                  pct > 100
                                    ? 'bg-destructive'
                                    : pct > 90
                                    ? 'bg-yellow-500'
                                    : 'bg-primary'
                                }`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className='text-xs text-muted-foreground'>{pct}%</span>
                          </div>
                        </TableCell>
                        <TableCell className='text-foreground'>
                          ${b.costEstimate.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              b.status === 'exceeded'
                                ? 'destructive'
                                : b.status === 'warning'
                                ? 'outline'
                                : 'default'
                            }
                            className='capitalize'
                          >
                            {b.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AiConsumption;
