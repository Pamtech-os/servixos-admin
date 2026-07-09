import type { FC, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import ModernSpinner from '@/components/ModernSpinner';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'destructive' | 'default';
  onConfirm: () => void;
  icon?: ReactNode;
  loading?: boolean;
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'destructive',
  onConfirm,
  icon,
  loading = false,
}) => (
  <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
    <DialogContent className='sm:max-w-sm'>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'>
          {icon || <AlertTriangle className='h-5 w-5 text-amber-500' />}
          {title}
        </DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter className='gap-2'>
        <Button variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>
          Cancel
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={loading} className='gap-1.5'>
          {loading && <ModernSpinner size='sm' color={variant === 'destructive' ? 'primary-foreground' : 'primary'} />}
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ConfirmDialog;
