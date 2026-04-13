import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface BulkActionsProps {
  count: number;
  onClear: () => void;
  children: ReactNode;
}

const BulkActions: FC<BulkActionsProps> = ({ count, onClear, children }: BulkActionsProps) => {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-wrap items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3'
    >
      <span className='text-sm font-medium'>{count} selected</span>
      {children}
      <Button size='sm' variant='ghost' onClick={onClear}>
        Clear
      </Button>
    </motion.div>
  );
};

export default BulkActions;
