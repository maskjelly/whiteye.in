import ProjectSection from './ProjectSection'

export default async function ProjectsContainer() {
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
    next: { revalidate: 3600 } // Revalidate every hour
  })

  const data = await response.json()
  const pinnedRepos = data.data?.viewer?.pinnedItems?.nodes || []

  return <ProjectSection initialRepos={pinnedRepos} />
}
