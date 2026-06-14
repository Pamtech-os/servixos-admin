import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  BarChart3,
  ClipboardList,
  FileBarChart2,
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

export const navItems: NavItem[] = [
  { label: 'Dashboard',         href: '/dashboard',    icon: LayoutDashboard },
  { label: 'Users',             href: '/users',        icon: Users },
  { label: 'Businesses',        href: '/businesses',   icon: Building2 },
  { label: 'Subscriptions',     href: '/subscriptions',icon: CreditCard },
  { label: 'Analytics',         href: '/analytics',    icon: BarChart3 },
  { label: 'Activity Logs',     href: '/activity-logs',icon: ClipboardList },
  { label: 'Reports',           href: '/reports',      icon: FileBarChart2 },
  { label: 'AI Consumption',    href: '/ai-consumption',icon: Brain },
  { label: 'Roles & Permissions',href: '/roles',       icon: Shield },
  { label: 'Support',           href: '/support',      icon: LifeBuoy },
];
