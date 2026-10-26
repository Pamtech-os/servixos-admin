import { useState, useEffect, memo, type FC } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, X, Moon, Sun, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  navEntries,
  isNavGroup,
  isNavItemActive,
  type NavGroup,
  type NavItem,
} from '@/config/navigation';
import servixLogo from '@/assets/servix-logo.png';

const SidebarLogo = memo(() => (
  <div className='flex items-center gap-2 px-4 py-5'>
    <img src={servixLogo} alt='Servix OS' className='h-8 w-8' />
    <span className='font-display text-lg font-bold'>Servix OS</span>
  </div>
));
SidebarLogo.displayName = 'SidebarLogo';

interface NavLinkItemProps {
  item: NavItem;
  active: boolean;
  nested?: boolean;
  onNavigate: () => void;
}

const NavLinkItem: FC<NavLinkItemProps> = ({ item, active, nested, onNavigate }) => (
  <Link
    to={item.href}
    onClick={onNavigate}
    aria-current={active ? 'page' : undefined}
    className={`flex items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
      nested ? 'py-2' : 'py-2.5'
    } ${
      active
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`}
  >
    <item.icon size={nested ? 16 : 18} />
    {item.label}
  </Link>
);

interface NavGroupMenuProps {
  group: NavGroup;
  pathname: string;
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

const NavGroupMenu: FC<NavGroupMenuProps> = ({ group, pathname, open, onToggle, onNavigate }) => {
  const containsActive = group.items.some((item) => isNavItemActive(item, pathname));
  const panelId = `nav-group-${group.label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div>
      <button
        type='button'
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${
          containsActive && !open ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <group.icon size={18} />
        <span className='flex-1 text-left'>{group.label}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className='overflow-hidden'
          >
            <div className='ml-5 mt-1 space-y-1 border-l border-border pl-2'>
              {group.items.map((item) => (
                <NavLinkItem
                  key={item.href}
                  item={item}
                  active={isNavItemActive(item, pathname)}
                  nested
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Explicit open/closed choices; groups without one default to open when they hold the active route
  const [groupToggles, setGroupToggles] = useState<Record<string, boolean>>({});
  const [dark, setDark] = useState(
    () =>
      typeof window !== 'undefined' &&
      (() => {
        const stored = localStorage.getItem('theme');
        return (
          stored === 'dark' ||
          (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
        );
      })()
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleTheme = () => {
    setDark((prev) => !prev);
  };

  const closeMobile = () => setMobileOpen(false);

  const resolveGroupOpen = (group: NavGroup, toggles: Record<string, boolean>) =>
    toggles[group.label] ?? group.items.some((item) => isNavItemActive(item, location.pathname));

  const isGroupOpen = (group: NavGroup) => resolveGroupOpen(group, groupToggles);

  const toggleGroup = (group: NavGroup) =>
    setGroupToggles((prev) => ({ ...prev, [group.label]: !resolveGroupOpen(group, prev) }));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navContent = (
    <div className='flex h-full flex-col'>
      <SidebarLogo />
      <nav className='flex-1 space-y-1 overflow-y-auto px-3 py-4'>
        {navEntries.map((entry) =>
          isNavGroup(entry) ? (
            <NavGroupMenu
              key={entry.label}
              group={entry}
              pathname={location.pathname}
              open={isGroupOpen(entry)}
              onToggle={() => toggleGroup(entry)}
              onNavigate={closeMobile}
            />
          ) : (
            <NavLinkItem
              key={entry.href}
              item={entry}
              active={isNavItemActive(entry, location.pathname)}
              onNavigate={closeMobile}
            />
          )
        )}
      </nav>
      <div className='space-y-1 border-t border-border px-3 py-4'>
        <button
          onClick={toggleTheme}
          className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-destructive/10'
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className='fixed left-0 top-0 z-40 hidden h-screen w-60 border-r border-border bg-card md:block'>
        {navContent}
      </aside>

      <div className='fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden'>
        <SidebarLogo />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className='rounded-lg p-2 text-foreground'
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-50 bg-background/60 backdrop-blur-sm md:hidden'
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className='fixed left-0 top-0 z-50 h-screen w-60 border-r border-border bg-card md:hidden'
            >
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppSidebar;
