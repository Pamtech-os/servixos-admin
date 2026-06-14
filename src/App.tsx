import type { FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ChangePassword from '@/pages/ChangePassword';
import PortalDashboard from '@/pages/PortalDashboard';
import Users from '@/pages/Users';
import Businesses from '@/pages/Businesses';
import Subscriptions from '@/pages/Subscriptions';
import Analytics from '@/pages/Analytics';
import ActivityLogs from '@/pages/ActivityLogs';
import Reports from '@/pages/Reports';
import AiConsumption from '@/pages/AiConsumption';
import RolesPermissions from '@/pages/RolesPermissions';
import Support from '@/pages/Support';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const App: FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/change-password' element={<ChangePassword />} />
            <Route element={<AppLayout />}>
              <Route path='/dashboard' element={<PortalDashboard />} />
              <Route path='/users' element={<Users />} />
              <Route path='/activity-logs' element={<ActivityLogs />} />
              <Route path='/businesses' element={<Businesses />} />
              <Route path='/subscriptions' element={<Subscriptions />} />
              <Route path='/analytics' element={<Analytics />} />
              <Route path='/reports' element={<Reports />} />
              <Route path='/ai-consumption' element={<AiConsumption />} />
              <Route path='/roles' element={<RolesPermissions />} />
              <Route path='/support' element={<Support />} />
            </Route>
            <Route path='/' element={<Navigate to='/login' replace />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
