import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    document.documentElement.className = initialTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'glass glass-hover p-3 rounded-xl transition-all duration-300',
        'hover:scale-105 active:scale-95'
      )}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </button>
  );
}
