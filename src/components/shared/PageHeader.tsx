import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, action }: PageHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'
  >
    <div>
      <h1 className='text-2xl font-bold'>{title}</h1>
      {subtitle && <p className='text-muted-foreground'>{subtitle}</p>}
    </div>
    {action}
  </motion.div>
);

export default PageHeader;
