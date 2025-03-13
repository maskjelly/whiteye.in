# Whiteye.in - Personal Website

This is the repository for my personal website, built with Next.js.

## Overview

This project showcases my portfolio, projects, and contributions, with a focus on a clean and engaging user experience. It includes interactive elements, a retro-inspired design, and integration with GitHub API to display pinned repositories and contribution graphs.

## Technologies Used

-   **Next.js:** React framework for building server-rendered applications.
-   **TypeScript:** Static typing for improved code quality.
-   **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
-   **GitHub API:** For fetching pinned repositories and contribution data.
-   **Spline:** For interactive 3D elements.
-   **Lucide React:** Icon library.
-   **Framer Motion:** Animation library.
-   **Simplex Noise:** For creating particle effects.
-   **Vercel Analytics:** For website analytics.
-   **PDF.js:** For rendering PDF documents.

## Project Structure

├── .gitignore
├── README.md
├── app
├── components
│   ├── ContributionsGraph.tsx       # GitHub contribution graph component
│   ├── ProjectSection.tsx           # Section displaying pinned projects
│   ├── ProjectsContainer.tsx        # Container for project sections
│   ├── ResponsiveSplineScrene.tsx   # Interactive 3D spline scene
│   ├── RetroPopup.tsx               # Retro-style popup component
│   ├── TypewriterHeading.tsx        # Typewriter effect heading
│   ├── UpcomingProject.tsx          # Popup showing upcoming project
│   └── vortex.tsx                   # Particle effect component
├── favicon.ico
├── globals.css                      # Global CSS styles
├── images
│   └── mario-pixel.png             # Pixel art image
├── layout.tsx                      # Root layout component
├── page.tsx                        # Main page component
├── read
│   └── page.tsx                    # Page for reading research papers
└── roadmap
│   └── page.tsx                    # Roadmap page
├── bun.lockb
├── components.json
├── components
└── ui
├── alert-dialog.tsx
├── button.tsx
├── card.tsx
└── splite.tsx
├── eslint.config.mjs
├── lib
├── pdf.d.ts
└── utils.ts
├── next.config.js
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── public
├── .roadmap.un~
├── .widget.js.un~
├── Plan.excalidraw
├── TerminusTTF-4.46.0.ttf
├── file.svg
├── globe.svg
├── next.svg
├── papers
│   ├── AIAYN.pdf
│   ├── GPT3paper.pdf
│   ├── deepseekr1.pdf
│   └── llama3report.pdf
├── pdf.worker.min.js
├── src.txt
├── vercel.svg
├── widget.js
└── window.svg
├── tailwind.config.ts
└── tsconfig.json




## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone [repository URL]
    cd [repository directory]
    ```

2.  **Install dependencies:**

    ```bash
    bun install # or npm install, yarn install, pnpm install
    ```

3.  **Set up environment variables:**

    -   Create a `.env.local` file in the root directory.
    -   Add your GitHub personal access token:

        ```
        NEXT_PUBLIC_GITHUB_TOKEN=your_github_token
        ```

4.  **Run the development server:**

    ```bash
    bun run dev # or npm run dev, yarn run dev, pnpm run dev
    ```

5.  **Open the application in your browser:**

    Visit `http://localhost:3000` to view the website.

## Key Components

-   **`ContributionsGraph.tsx`:** Displays a GitHub contribution graph.
-   **`ProjectSection.tsx`:** Fetches and displays pinned repositories from GitHub.
-   **`ResponsiveSplineScene.tsx`:** Integrates interactive 3D elements using Spline.
-   **`RetroPopup.tsx`:** Shows a retro-style popup with links to research papers.
-   **`TypewriterHeading.tsx`:** Creates a typewriter effect for the main heading.
-   **`Vortex.tsx`:** Generates a particle effect using canvas and Simplex Noise.
-   **`read/page.tsx`:** Displays research papers using PDF.js.
-   **`roadmap/page.tsx`:** Shows the project roadmap.

## Deployment

The project is designed to be easily deployed on Vercel. You can connect your GitHub repository to Vercel and it will automatically build and deploy your application.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).









