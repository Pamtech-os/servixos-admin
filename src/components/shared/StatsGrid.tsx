import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';

export interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
}

interface StatsGridProps {
  stats: StatItem[];
}

const StatsGrid: FC<StatsGridProps> = ({ stats }: StatsGridProps) => (
  <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
    {stats.map((stat, i) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 * i, duration: 0.4 }}
      >
        <Card className='h-full'>
          <CardContent className='flex h-full items-center gap-4 p-5'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <stat.icon className={`h-5 w-5 ${stat.color || 'text-primary'}`} />
            </div>
            <div>
              <p className='text-2xl font-bold'>{stat.value}</p>
              <p className='text-xs text-muted-foreground'>{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ))}
  </div>
);

export default StatsGrid;
