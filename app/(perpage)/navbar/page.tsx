'use client'
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const { theme } = useTheme();

  return (
    <nav className={`navbar ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <p>Navbar</p>
      <p>Current theme: {theme}</p>
    </nav>
  );
}