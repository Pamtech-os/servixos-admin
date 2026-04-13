import type { FC } from 'react';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  colSpan?: number;
}

const EmptyState: FC<EmptyStateProps> = ({ icon: Icon, message, colSpan = 1 }: EmptyStateProps) => (
  <tr>
    <td colSpan={colSpan} className='py-8 text-center text-muted-foreground'>
      <Icon className='mx-auto mb-2 h-8 w-8 opacity-40' />
      {message}
    </td>
  </tr>
);

export default EmptyState;
