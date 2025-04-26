// import Header from './components/Header';
import HeroSection from '@/components/HeroSection';
import Experience from '@/components/Experience';
import { ThemeProvider } from '@/context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen font-serif text-[#e5e5e5] relative">
        <div className="hero-background"></div>
        {/* Removed the general overlay div */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <main className="grid grid-cols-1 lg:grid-cols-2 gap-24 pt-40 pb-16">
              <HeroSection />
              <Experience />
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;