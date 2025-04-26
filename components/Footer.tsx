import { useEffect, useState } from 'react';
import { Github, Twitter, Mail, ArrowUp } from 'lucide-react';

const Footer = () => {
  const [date, setDate] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <footer className="py-12 border-t border-white/10 mt-12">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-gray-400 text-sm">
            © {date.getFullYear()} aaryan singh | maskjelly
          </p>
        </div>
        
        <div className="flex space-x-6">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-emerald-400 transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-emerald-400 transition-colors"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a 
            href="mailto:aaryan@whiteye.in"
            className="text-gray-400 hover:text-emerald-400 transition-colors"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </div>
      
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-2 bg-emerald-400/20 rounded-full border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/30 transition-all duration-300"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </footer>
  );
};

export default Footer;