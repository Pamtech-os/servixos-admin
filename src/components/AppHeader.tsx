import { memo, type FC } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AppHeader: FC = () => {
  const { auth } = useAuth();
  const initials = auth.userEmail ? auth.userEmail.substring(0, 2).toUpperCase() : 'AD';

  return (
    <header className='sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm px-4 py-3 md:px-6'>
      <div className='text-sm font-medium text-muted-foreground'>Admin Panel</div>
      <div className='flex items-center gap-3'>
        <div className='hidden sm:block text-right'>
          <p className='text-sm font-semibold'>{auth.userEmail || 'Admin'}</p>
          <p className='text-xs text-muted-foreground'>Administrator</p>
        </div>
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-primary-foreground'>
          {initials}
        </div>
      </div>
    </header>
  );
};

export default memo(AppHeader);
