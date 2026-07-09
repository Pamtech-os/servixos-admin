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
import ModernSpinner from '@/components/ModernSpinner';

interface EmailTarget {
  id: string;
  name: string;
}

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targets: EmailTarget[];
  onSend: (subject: string, message: string) => Promise<void>;
}

const EmailDialog: FC<EmailDialogProps> = ({ open, onOpenChange, targets, onSend }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    if (loading) return;
    setSubject('');
    setMessage('');
    onOpenChange(false);
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }
    setLoading(true);
    try {
      await onSend(subject, message);
      toast.success(`Email sent to ${targets.length} recipient${targets.length > 1 ? 's' : ''}`);
      setSubject('');
      setMessage('');
      onOpenChange(false);
    } catch {
      toast.error('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Sending to {targets.length === 1 ? targets[0].name : `${targets.length} recipients`}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          {targets.length > 1 && (
            <div className='flex flex-wrap gap-1.5 max-h-24 overflow-y-auto'>
              {targets.map((t) => (
                <Badge key={t.id} variant='outline' className='text-xs'>
                  {t.name}
                </Badge>
              ))}
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor='email-subject'>Subject</Label>
            <Input
              id='email-subject'
              placeholder='Enter email subject...'
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
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
              disabled={loading}
              className='flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSend()}
            className='gradient-bg text-primary-foreground gap-1'
            disabled={loading}
          >
            {loading ? <ModernSpinner size='sm' color='primary-foreground' /> : <Mail className='h-4 w-4' />}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailDialog;
