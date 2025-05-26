'use client'
import { useTheme } from '@/context/ThemeContext';

export default function Projects() {
  const { theme } = useTheme();

  return (
    <section className={`projects ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <p>Projects</p>
      <p>Current theme: {theme}</p>
    </section>
  );
}