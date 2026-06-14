import { memo, type FC } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AppHeader: FC = () => {
  const { admin } = useAuth();

  const displayName = admin ? `${admin.firstName} ${admin.lastName}` : 'Admin';
  const initials = admin
    ? `${admin.firstName[0]}${admin.lastName[0]}`.toUpperCase()
    : 'AD';

  return (
    <header className='sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm px-4 py-3 md:px-6'>
      <div className='text-sm font-medium text-muted-foreground'>Admin Panel</div>
      <div className='flex items-center gap-3'>
        <div className='hidden sm:block text-right'>
          <p className='text-sm font-semibold'>{displayName}</p>
          <p className='text-xs text-muted-foreground'>{admin?.email ?? 'Administrator'}</p>
        </div>
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-primary-foreground'>
          {initials}
        </div>
      </div>
    </header>
  );
};

export default memo(AppHeader);
