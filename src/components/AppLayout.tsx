import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import AppHeader from '@/components/AppHeader';

const AppLayout = () => {
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
