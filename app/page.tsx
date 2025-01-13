// app/page.tsx
import TypewriterHeading from './components/TypewriterHeading'
import ContributionsGraph from './components/ContributionsGraph'
import ProjectsContainer from './components/ProjectsContainer'
import { SplineScene } from "@/components/ui/splite";

export default async function Home() {
  return (
    <div className="min-h-screen bg-white font-mono flex flex-col relative">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12 flex-grow">
        <div className="border-2 border-black p-4 sm:p-6 mb-8 sm:mb-12">
          <TypewriterHeading />
        </div>

        <section className="mb-8 sm:mb-12 p-4 sm:p-6 border border-gray-300 relative">
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-black"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-black"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-black"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-black"></div>
          <p className="text-base sm:text-lg mb-3">
            i am 19y/o || second year student, studying computer science.
          </p>
          <p className="text-base sm:text-lg mb-3">mainly work in deep learning/natural language processing.</p>
          <p className="text-base sm:text-lg">and also some Gen AI and web3 type stuff</p>
        </section>

        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 sm:mb-6 border-l-4 border-black pl-4 flex items-center">
            <span className="mr-2">experience</span>
            <div className="flex-grow h-[1px] bg-black ml-4"></div>
          </h2>
          <ul className="space-y-4 pl-6 border-l border-gray-200">
            <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-4 before:rotate-45 text-sm sm:text-base">
              2x YC Backed Engineer
            </li>
            <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-4 before:rotate-45 text-sm sm:text-base">
              <span className="flex flex-wrap items-center">
                Founding and Lead Engineer at
                <a
                  href="https://fnbc.com"
                  className="ml-2 relative group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FnBC
                  <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-black origin-left transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
                </a>
              </span>
            </li>
            <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-4 before:rotate-45 text-sm sm:text-base">
              Founder and CTO of Existence . Co
            </li>
          </ul>
        </section>
        
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 sm:mb-6 border-l-4 border-black pl-4 flex items-center">
            <span className="mr-2">contributions</span>
            <div className="flex-grow h-[1px] bg-black ml-4"></div>
          </h2>
          <div className="border-2 border-black relative bg-black">
            <div className="absolute top-0 left-0 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-black -translate-x-1 -translate-y-1"></div>
            <div className="absolute top-0 right-0 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-black translate-x-1 -translate-y-1"></div>
            <div className="absolute bottom-0 left-0 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-black -translate-x-1 translate-y-1"></div>
            <div className="absolute bottom-0 right-0 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-black translate-x-1 translate-y-1"></div>
            <ContributionsGraph />
          </div>
        </section>

        <ProjectsContainer />
      </main>

      {/* 3D Scene fixed to bottom right - hidden on mobile */}
      <div className="hidden lg:block fixed bottom-8 right-8 pointer-events-none z-50">
        <div className="w-[300px] xl:w-[700px] h-[300px] xl:h-[700px] relative">
          {/* Border container with darker border */}
          <div className="absolute inset-0 border-4 border-black bg-white/50 backdrop-blur-sm rounded-sm">
            {/* Smooth corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-black -translate-x-3 -translate-y-3 rounded-tl"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-black translate-x-3 -translate-y-3 rounded-tr"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-black -translate-x-3 translate-y-3 rounded-bl"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-black translate-x-3 translate-y-3 rounded-br"></div>
          </div>
          
          <span className="pointer-events-auto absolute top-4 left-4 text-sm sm:text-base z-10">Hover over me</span>

          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full absolute top-0 left-0 pointer-events-auto"
          />
        </div>
      </div>

      <footer className="py-6 sm:py-8 mt-8 sm:mt-12 border-t-2 border-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center gap-6 sm:gap-8">
            <a
              href="https://github.com/maskjelly"
              className="text-sm sm:text-base text-black hover:text-gray-700 transition-colors tracking-wide relative group"
              target="_blank"
              rel="noopener noreferrer"
            >
              github
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-black origin-left transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </a>
            <span className="w-[1px] h-4 sm:h-6 bg-black"></span>
            <a
              href="https://twitter.com/LiquidZooo"
              className="text-sm sm:text-base text-black hover:text-gray-700 transition-colors tracking-wide relative group"
              target="_blank"
              rel="noopener noreferrer"
            >
              twitter
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-black origin-left transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}