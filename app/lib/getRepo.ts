// src/lib/github-actions.ts
'use server';

import { cache } from 'react';

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

export const GetFeaturedRepos = cache(async (): Promise<Repository[]> => {
  const githubToken = process.env.GITHUB_TOKEN; // Make sure you have this in your .env file
  const username = 'maskjelly'; // Replace with your GitHub username
  const apiUrl = `https://api.github.com/users/${username}/repos?sort=stars`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: githubToken ? `token ${githubToken}` : '',
      },
      next: {
        revalidate: 3600, // Optional: Revalidate cache every hour
      },
    });

    if (!response.ok) {
      console.error(`GitHub API Error: ${response.status}`);
      return []; // Or throw an error if you prefer
    }

    const repos: Repository[] = await response.json();
    return repos.slice(0, 4); // Return the top 4 starred repos
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return []; // Or throw an error
  }
});