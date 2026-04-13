import { useState, useEffect, type FC } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle: FC = () => {
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

  const toggle = () => {
    setDark((prev) => !prev);
  };

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      className='absolute right-4 top-4 z-20 rounded-full border border-border bg-card/80 p-2.5 text-muted-foreground shadow-md backdrop-blur-sm transition-colors hover:text-foreground'
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </motion.button>
  );
};

export default ThemeToggle;
