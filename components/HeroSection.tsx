'use client';

import GlassmorphismCard from './GlassmorphismCard';
import Loader from './Loader';
import { FaStar, FaCodeBranch } from 'react-icons/fa';
import { getFeaturedRepos } from '@/app/actions/route';
import { useTransition } from 'react';
import { useEffect, useState, useCallback } from 'react';

interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  topics?: string[];
}

const HeroSection = () => {
  const [repos, setRepos] = useState<Repository[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = useCallback(async () => {
    startTransition(async () => {
      const data = await getFeaturedRepos();
      if (data) {
        setRepos(data);
      } else {
        setError('Failed to load featured projects.');
      }
    });
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <section className="space-y-16">
      <div>
        <h1 className="text-7xl sm:text-8xl font-light tracking-wide mb-8">
          Aaryan singh
        </h1>
        <p className="text-3xl text-gray-300 font-light tracking-wider mb-12">
          $\`retard\`
        </p>
        <img
          src={`https://ghchart.rshah.org/maskjelly`}
          alt="GitHub Contributions"
          className="w-full md:w-[600px] h-[150px] opacity-80 hover:opacity-100 transition-opacity duration-300"
        />
      </div>

      <div className="space-y-8 text-gray-400 text-lg tracking-wide leading-relaxed">
        <p>
          i'm a 19 y/o cs undergrad student. i love building things and solving
          problems.
        </p>
        <p>
          i enjoy language design, practical computer science, and i live on the
          terminal. if i'm not coding, i'm probably doing cardio, watching
          movies, or obsessing over mechanical keyboards and robots.
        </p>
      </div>

      <div className="space-y-4">
        <a
          href="mailto:aaryan@whiteye.in"
          className=" text-2xl  hover:text-white transition-colors"
        >
          aaryan@whiteye.in
        </a>
        <div className="flex space-x-8 text-lg text-gray-400">
          <a
            href="https://github.com/maskjelly"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            github
          </a>
          <a href="#" className="hover:text-white transition-colors">
            twitter
          </a>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl tracking-widest text-gray-400">
          Featured Projects
        </h2>
        <div className="divider"></div>
        {isPending || (!repos && !error) ? (
          <Loader />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : repos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {repos.map((repo) => (
              <GlassmorphismCard key={repo.id}>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6 group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-light group-hover:text-white transition-colors">
                        {repo.name}
                      </h3>
                      <div className="flex items-center space-x-3 text-gray-500 text-sm">
                        <span className="flex items-center">
                          <FaStar className="mr-1" /> {repo.stargazers_count}
                        </span>
                        <span className="flex items-center">
                          <FaCodeBranch className="mr-1" /> {repo.forks_count}
                        </span>
                      </div>
                    </div>
                    <p className="text-base text-gray-400 leading-relaxed">
                      {repo.description || 'No description available'}
                    </p>
                    <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-500">
                      {repo.language && (
                        <span className="bg-gray-800 rounded-full px-2 py-1">
                          {repo.language}
                        </span>
                      )}
                      <span className="text-xs italic">
                        Updated {formatDate(repo.updated_at)}
                      </span>
                    </div>
                  </div>
                </a>
              </GlassmorphismCard>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default HeroSection;