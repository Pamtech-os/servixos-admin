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
  Hourglass,
  UserRound,
  LineChart,
  Settings2,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

export const isNavGroup = (entry: NavEntry): entry is NavGroup => 'items' in entry;

export const isNavItemActive = (item: NavItem, pathname: string): boolean =>
  pathname === item.href || pathname.startsWith(item.href + '/');

export const navEntries: NavEntry[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Customers',
    icon: UserRound,
    items: [
      { label: 'Users',         href: '/users',         icon: Users },
      { label: 'Businesses',    href: '/businesses',    icon: Building2 },
      { label: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
      { label: 'Waitlist',      href: '/waitlist',      icon: Hourglass },
    ],
  },
  {
    label: 'Insights',
    icon: LineChart,
    items: [
      { label: 'Analytics',      href: '/analytics',      icon: BarChart3 },
      { label: 'Reports',        href: '/reports',        icon: FileBarChart2 },
      { label: 'Activity Logs',  href: '/activity-logs',  icon: ClipboardList },
      { label: 'AI Consumption', href: '/ai-consumption', icon: Brain },
    ],
  },
  {
    label: 'Administration',
    icon: Settings2,
    items: [
      { label: 'Roles & Permissions', href: '/roles',   icon: Shield },
      { label: 'Support',             href: '/support', icon: LifeBuoy },
    ],
  },
];
