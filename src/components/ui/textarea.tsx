import { cn } from '@/lib/utils';

const Textarea = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<'textarea'>) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[80px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
);
Textarea.displayName = 'Textarea';

export { Textarea };
