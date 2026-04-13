import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  delay?: number;
}

const SearchFilterBar: FC<SearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  delay = 0.1,
}: SearchFilterBarProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className='flex flex-col gap-3 sm:flex-row sm:items-center'
  >
    <div className='relative flex-1'>
      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className='pl-9'
      />
    </div>
    {filters && <div className='flex gap-2 flex-wrap'>{filters}</div>}
  </motion.div>
);

export default SearchFilterBar;
