import { Outlet, Navigate } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import ModernSpinner from '@/components/ModernSpinner';

const AppLayout = () => {
  const { isAuthenticated, mustChangePassword, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <ModernSpinner size='lg' color='primary' />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to='/login' replace />;
  if (mustChangePassword) return <Navigate to='/change-password' replace />;

  return (
    <div className='min-h-screen bg-background'>
      <AppSidebar />
      <div className='md:ml-60'>
        <div className='pt-14 md:pt-0'>
          <AppHeader />
          <main>
            <div className='container mx-auto p-4 md:p-6 lg:p-8'>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
