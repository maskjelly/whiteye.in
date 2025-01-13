// components/ProjectsSection.tsx
'use client'

import { useState, useEffect } from 'react'

interface Repository {
  name: string
  description: string | null
  url: string
}

interface ProjectSectionProps {
  initialRepos: Repository[]
}

export default function ProjectsSection({ initialRepos }: ProjectSectionProps) {
  const [pinnedRepos, setPinnedRepos] = useState<Repository[]>(initialRepos)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPinnedRepos = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
          throw new Error('GitHub token is not configured')
        }

        const response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Authorization': `bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query {
                viewer {
                  pinnedItems(first: 6, types: [REPOSITORY]) {
                    nodes {
                      ... on Repository {
                        name
                        description
                        url
                      }
                    }
                  }
                }
              }
            `
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch from GitHub API')
        }

        const data = await response.json()
        
        if (data.errors) {
          throw new Error(data.errors[0]?.message || 'GitHub API error')
        }

        if (data.data?.viewer?.pinnedItems?.nodes) {
          setPinnedRepos(data.data.viewer.pinnedItems.nodes)
        } else {
          throw new Error('Unexpected response structure')
        }
      } catch (error) {
        console.error('Error fetching repos:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch repositories')
      } finally {
        setLoading(false)
      }
    }

    if (initialRepos.length === 0) {
      fetchPinnedRepos()
    }
  }, [initialRepos])

  if (error) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-light tracking-wide mb-6 border-l-4 border-black pl-4 flex items-center">
          <span className="mr-2">projects</span>
          <div className="flex-grow h-[1px] bg-black ml-4"></div>
        </h2>
        <p className="text-red-600">Error loading projects: {error}</p>
      </section>
    )
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-light tracking-wide mb-6 border-l-4 border-black pl-4 flex items-center">
        <span className="mr-2">projects</span>
        <div className="flex-grow h-[1px] bg-black ml-4"></div>
      </h2>
      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pinnedRepos.map(repo => (
            <div key={repo.name} className="border-2 border-black p-4 relative group">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-black -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-black translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-black -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-black translate-x-1 translate-y-1"></div>
              
              <div className="mb-2">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium inline-flex items-center group-hover:text-gray-700 transition-colors"
                >
                  {repo.name}
                  <svg className="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
              
              {repo.description && (
                <p className="text-sm text-gray-600 mb-3">{repo.description}</p>
              )}
              
              <div className="flex items-center space-x-2">
                <a
                  href={`${repo.url}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-black transition-colors"
                >
                  issues
                </a>
                <span className="text-gray-300">|</span>
                <a
                  href={`${repo.url}/pulls`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-black transition-colors"
                >
                  pull requests
                </a>
                <span className="text-gray-300">|</span>
                <a
                  href={`${repo.url}/stargazers`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-black transition-colors"
                >
                  stars
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}