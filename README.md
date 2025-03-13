# Whiteye.in - Personal Website 🚀

This is the repository for my personal website, crafted with Next.js and a sprinkle of creativity. ✨

## Overview 🌟

This project is a digital canvas showcasing my portfolio, projects, and contributions. It's designed with a focus on a clean, engaging user experience, featuring interactive elements, a retro-inspired aesthetic, and seamless integration with the GitHub API.

## Technologies Used 🛠️

-   **Next.js:** The React framework that powers the web. ⚛️
-   **TypeScript:** Adding static typing for robust code. 🔒
-   **Tailwind CSS:** For rapid UI development with utility-first classes. 🎨
-   **GitHub API:** Fetching pinned repositories and contribution magic. 📊
-   **Spline:** Bringing interactive 3D elements to life. 🌐
-   **Lucide React:** A beautiful icon library for that extra touch. 🖼️
-   **Framer Motion:** Animating the web with style. 🎬
-   **Simplex Noise:** Creating mesmerizing particle effects. 🌀
-   **Vercel Analytics:** Keeping track of website insights. 📈
-   **PDF.js:** Rendering PDF documents within the browser. 📄

## Project Structure 📂

```
├── .gitignore
├── README.md
├── app/
│   ├── components/
│   │   ├── ContributionsGraph.tsx
│   │   ├── ProjectSection.tsx
│   │   ├── ProjectsContainer.tsx
│   │   ├── ResponsiveSplineScrene.tsx
│   │   ├── RetroPopup.tsx
│   │   ├── TypewriterHeading.tsx
│   │   ├── UpcomingProject.tsx
│   │   └── vortex.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── images/
│   │   └── mario-pixel.png
│   ├── layout.tsx
│   ├── page.tsx
│   ├── read/
│   │   └── page.tsx
│   └── roadmap/
│       └── page.tsx
├── bun.lockb
├── components.json
├── components/
│   └── ui/
│       ├── alert-dialog.tsx
│       ├── button.tsx
│       ├── card.tsx
│       └── splite.tsx
├── eslint.config.mjs
├── lib/
│   ├── pdf.d.ts
│   └── utils.ts
├── next.config.js
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── public/
│   ├── .roadmap.un~
│   ├── .widget.js.un~
│   ├── Plan.excalidraw
│   ├── TerminusTTF-4.46.0.ttf
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── papers/
│   │   ├── AIAYN.pdf
│   │   ├── GPT3paper.pdf
│   │   ├── deepseekr1.pdf
│   │   └── llama3report.pdf
│   ├── pdf.worker.min.js
│   ├── src.txt
│   ├── vercel.svg
│   ├── widget.js
│   └── window.svg
├── tailwind.config.ts
└── tsconfig.json
```




## Getting Started 🏁

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

    Visit `http://localhost:3000` to see the magic! ✨

## Key Components 🧩

-   **`ContributionsGraph.tsx`:** Visualizes your GitHub contributions. 📈
-   **`ProjectSection.tsx`:** Showcases your pinned repositories. 📌
-   **`ResponsiveSplineScene.tsx`:** Adds interactive 3D elements. 🌐
-   **`RetroPopup.tsx`:** A nostalgic popup with research paper links. 🕹️
-   **`TypewriterHeading.tsx`:** Creates a dynamic heading effect. ⌨️
-   **`Vortex.tsx`:** Generates a stunning particle vortex. 🌀
-   **`read/page.tsx`:** Lets you read research papers directly. 📚
-   **`roadmap/page.tsx`:** Outlines the project's journey. 🗺️

## Deployment 🚀

Deploying to Vercel is a breeze! Connect your GitHub repo, and Vercel will handle the rest. ☁️

## Contributing 🤝

Contributions are always welcome! If you spot an issue or have ideas for improvements, feel free to open an issue or submit a pull request. Let's build something amazing together! 🌟

## License 📜

This project is licensed under the [MIT License](LICENSE).








