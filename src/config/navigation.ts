import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  BarChart3,
  ClipboardList,
  Key,
  Brain,
  Shield,
  LifeBuoy,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Central navigation config. To add a new page:
 * 1. Add an entry here
 * 2. Create the page component
 * 3. Add a lazy route in App.tsx
 */
export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Businesses', href: '/businesses', icon: Building2 },
  { label: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Activity Logs', href: '/activity-logs', icon: ClipboardList },
  { label: 'API Keys', href: '/api-keys', icon: Key },
  { label: 'AI Consumption', href: '/ai-consumption', icon: Brain },
  { label: 'Roles & Permissions', href: '/roles', icon: Shield },
  { label: 'Support', href: '/support', icon: LifeBuoy },
];
