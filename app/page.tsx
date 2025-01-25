import TypewriterHeading from "./components/TypewriterHeading"
import ContributionsGraph from "./components/ContributionsGraph"
import ProjectsContainer from "./components/ProjectsContainer"
import ResponsiveSplineScene from "./components/ResponsiveSplineScrene"
import RetroPopup from "./components/RetroPopup"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-mono flex relative">
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="border-2 border-white p-4 sm:p-6 mb-8 sm:mb-12">
          <TypewriterHeading />
        </div>

        <section className="mb-8 sm:mb-12 p-4 sm:p-6 border border-gray-700 relative">
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-orange-500"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-orange-500"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-orange-500"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-orange-500"></div>
          <p className="text-base sm:text-lg mb-3">i am 19y/o || second year student, studying computer science.</p>
          <p className="text-base sm:text-lg mb-3">mainly work in deep learning/natural language processing.</p>
          <p className="text-base sm:text-lg">and also some Gen AI and web3 type stuff</p>
        </section>

        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 sm:mb-6 border-l-4 border-orange-500 pl-4 flex items-center">
            <span className="mr-2">experience</span>
            <div className="flex-grow h-[1px] bg-white ml-4"></div>
          </h2>
          <ul className="space-y-4 pl-6 border-l border-gray-700">
            <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-orange-500 before:mr-4 before:rotate-45 text-sm sm:text-base">
              2x YC Backed Engineer
            </li>
            <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-orange-500 before:mr-4 before:rotate-45 text-sm sm:text-base">
              <span className="flex flex-wrap items-center">
                Founding and Lead Engineer at
                <a
                  href="https://fnbc.com"
                  className="ml-2 relative group text-orange-500"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FnBC
                  <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-orange-500 origin-left transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
                </a>
              </span>
            </li>
            <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-orange-500 before:mr-4 before:rotate-45 text-sm sm:text-base">
              Founder and CTO of Existence . Co
            </li>
          </ul>
        </section>

        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 sm:mb-6 border-l-4 border-orange-500 pl-4 flex items-center">
            <span className="mr-2">contributions</span>
            <div className="flex-grow h-[1px] bg-white ml-4"></div>
          </h2>
          <div className="border-2 border-white relative bg-gray-900">
            <div className="absolute top-0 left-0 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-orange-500 -translate-x-1 -translate-y-1"></div>
            <div className="absolute top-0 right-0 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-orange-500 translate-x-1 -translate-y-1"></div>
            <div className="absolute bottom-0 left-0 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-orange-500 -translate-x-1 translate-y-1"></div>
            <div className="absolute bottom-0 right-0 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-orange-500 translate-x-1 translate-y-1"></div>
            <ContributionsGraph />
          </div>
        </section>

        <ProjectsContainer />
      </main>

      <aside className="w-80 border-l border-white fixed right-0 top-0 h-full overflow-y-auto flex flex-col">
        <div className="flex-1 p-4 border-b border-white">
          <div className="border-2 border-white p-2 mb-4 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-orange-500 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-orange-500 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-orange-500 -translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-orange-500 translate-x-1/2 translate-y-1/2"></div>
            <ResponsiveSplineScene />
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="border-2 border-white p-2 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-orange-500 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-orange-500 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-orange-500 -translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-orange-500 translate-x-1/2 translate-y-1/2"></div>
            <RetroPopup />
          </div>
        </div>
      </aside>

      <footer className="fixed bottom-0 left-0 right-80 py-6 sm:py-8 border-t-2 border-white bg-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center gap-6 sm:gap-8">
            <a
              href="https://github.com/maskjelly"
              className="text-sm sm:text-base text-white hover:text-orange-500 transition-colors tracking-wide relative group"
              target="_blank"
              rel="noopener noreferrer"
            >
              github
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-orange-500 origin-left transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </a>
            <span className="w-[1px] h-4 sm:h-6 bg-white"></span>
            <a
              href="https://twitter.com/LiquidZooo"
              className="text-sm sm:text-base text-white hover:text-orange-500 transition-colors tracking-wide relative group"
              target="_blank"
              rel="noopener noreferrer"
            >
              twitter
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-orange-500 origin-left transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

