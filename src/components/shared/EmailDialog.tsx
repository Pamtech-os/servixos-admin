import { useState, type FC } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';

interface EmailTarget {
  id: string;
  name: string;
}

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targets: EmailTarget[];
}

const EmailDialog: FC<EmailDialogProps> = ({ open, onOpenChange, targets }: EmailDialogProps) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }
    toast.success(`Email sent to ${targets.length} recipient(s)`);
    setTitle('');
    setMessage('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Sending to {targets.length === 1 ? targets[0].name : `${targets.length} recipients`}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          {targets.length > 1 && (
            <div className='flex flex-wrap gap-1.5'>
              {targets.map((t) => (
                <Badge key={t.id} variant='outline' className='text-xs'>
                  {t.name}
                </Badge>
              ))}
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor='email-title'>Email Title</Label>
            <Input
              id='email-title'
              placeholder='Enter email subject...'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email-message'>Message</Label>
            <textarea
              id='email-message'
              placeholder='Type your message here...'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className='flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} className='gradient-bg text-primary-foreground gap-1'>
            <Mail className='h-4 w-4' /> Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailDialog;
