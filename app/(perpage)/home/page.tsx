'use client'
import { useTheme } from '@/context/ThemeContext';

export default function Home() {
  const { theme } = useTheme();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className={`my-component ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
        <p>This is some text.</p>
        <p>Current theme: {theme}</p>
      </div>
    </main>
  );
}