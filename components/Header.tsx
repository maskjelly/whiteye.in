const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-end">
          <a 
            href="mailto:aaryan@whiteye.in" 
            className="text-lg tracking-widest hover:text-white transition-colors"
          >
            contact
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;