import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const DataTablePagination: FC<DataTablePaginationProps> = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPageChange,
}: DataTablePaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className='flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
      <p className='text-sm text-muted-foreground'>
        Showing {startIndex}–{endIndex} of {totalItems}
      </p>
      <div className='flex items-center gap-2 flex-wrap'>
        <Button
          variant='outline'
          size='sm'
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i + 1}
            variant={currentPage === i + 1 ? 'default' : 'outline'}
            size='sm'
            onClick={() => onPageChange(i + 1)}
            className={`hidden sm:inline-flex ${
              currentPage === i + 1 ? 'gradient-bg text-primary-foreground !inline-flex' : ''
            }`}
          >
            {i + 1}
          </Button>
        ))}
        <span className='text-sm text-muted-foreground sm:hidden'>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant='outline'
          size='sm'
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
};

export default DataTablePagination;
