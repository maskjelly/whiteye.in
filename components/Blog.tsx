import GlassmorphismCard from './GlassmorphismCard';
import { FileText, BookOpen } from 'lucide-react';

const Blog = () => {
  return (
    <section id="blog" className="py-12">
      <h2 className="text-2xl font-bold mb-8 flex items-center space-x-2">
        <span className="text-emerald-400">$</span> 
        <span className="text-emerald-400">ls</span> 
        <span>Blog_Reading</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassmorphismCard className="p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <FileText className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium mb-2">How I built my own VCS like GIT in C</h3>
              <div className="text-gray-400 text-sm mb-3">
                [under work 4/26/2025]
              </div>
              <p className="text-gray-300 mb-4">
                A deep dive into version control systems and how I built my own implementation in C.
              </p>
              <div className="pt-4 border-t border-white/10">
                <span className="text-xs text-gray-400">
                  C • Version Control • Systems Programming
                </span>
              </div>
            </div>
          </div>
        </GlassmorphismCard>
        
        <GlassmorphismCard className="p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <BookOpen className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium mb-2">"Must Read" Collection</h3>
              <div className="text-gray-400 text-sm mb-3">
                [under work 4/26/2025]
              </div>
              <p className="text-gray-300 mb-4">
                A little collection of cool research papers on computer science, programming languages, and more.
              </p>
              <div className="pt-4 border-t border-white/10">
                <span className="text-xs text-gray-400">
                  Research • Computer Science • Papers
                </span>
              </div>
            </div>
          </div>
        </GlassmorphismCard>
      </div>
    </section>
  );
};

export default Blog;