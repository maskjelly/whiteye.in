"use client"

import { useEffect, useState } from "react"

// Define GitHub repository type
interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
}

// GitHub Projects Component
const GitHubProjects = () => {
  const [projects, setProjects] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://api.github.com/users/maskjelly/repos?sort=updated&per_page=6');
        
        if (!response.ok) {
          throw new Error('Failed to fetch GitHub repositories');
        }
        
        const data = await response.json() as GitHubRepo[];
        
        // Filter out forked repositories and sort by stars
        const filteredProjects = data
          .filter((repo) => !repo.fork)
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 4); // Limit to top 4 projects
        
        setProjects(filteredProjects);
      } catch (err) {
        console.error('Error fetching GitHub projects:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 md:space-y-8 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-800 rounded-md p-4 bg-black/30">
            <div className="h-5 bg-gray-800 rounded w-1/3 mb-3"></div>
            <div className="h-3 bg-gray-800 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-800 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="border border-red-800 rounded-md p-4 bg-black/30">
          <h3 className="text-white font-bold">Error loading projects</h3>
          <p className="text-sm text-gray-400">
            Could not fetch GitHub repositories. Check console for details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {projects.length === 0 ? (
        <div className="border border-gray-800 rounded-md p-4 bg-black/30">
          <h3 className="text-white font-bold">No public repositories found</h3>
          <p className="text-sm text-gray-400">
            No public non-forked repositories were found on this GitHub account.
          </p>
        </div>
      ) : (
        projects.map((project) => (
          <div 
            key={project.id} 
            className="border border-gray-800 rounded-md p-4 bg-black/30 hover:bg-black/50 transition-colors duration-200"
          >
            <a 
              href={project.html_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <h3 className="text-white font-bold flex items-center">
                {project.name}
                {project.stargazers_count > 0 && (
                  <span className="ml-2 text-xs text-yellow-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    {project.stargazers_count}
                  </span>
                )}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                {project.language || "No language specified"}
              </p>
              <p className="text-sm sm:text-base line-clamp-2">
                {project.description || "No description provided"}
              </p>
              
              {/* Repository stats */}
              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 mr-1">
                    <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 0-6 0zm6.75 3.378a.75.75 0 0 0-.75.75v3.75a.75.75 0 0 1-.75.75h-6a.75.75 0 0 1-.75-.75v-3.75a.75.75 0 0 0-.75-.75h-.75a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h10.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75h-.75z" />
                  </svg>
                  {project.forks_count} forks
                </span>
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 mr-1">
                    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                    <path fillRule="evenodd" d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0z" clipRule="evenodd" />
                  </svg>
                  Updated {new Date(project.updated_at).toLocaleDateString()}
                </span>
              </div>
            </a>
          </div>
        ))
      )}
      
      <div className="text-center mt-4">
        <a 
          href="https://github.com/maskjelly" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white text-sm inline-flex items-center"
        >
          View all projects on GitHub
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
            <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default GitHubProjects;