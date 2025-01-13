// app/page.tsx
import Link from "next/link"
import TypewriterHeading from './components/TypewriterHeading'
import ContributionsGraph from './components/ContributionsGraph'
import ProjectsContainer from './components/ProjectsContainer'

export default async function Home() {
  return (
    <div className="min-h-screen bg-white font-mono flex flex-col">
      <main className="max-w-3xl mx-auto px-6 py-12 flex-grow">
        <div className="border-2 border-black p-6 mb-12">
          <TypewriterHeading />
        </div>

        <section className="mb-12 p-6 border border-gray-300 relative">
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-black"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-black"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-black"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-black"></div>
          <p className="text-lg mb-3">
            i am a second year student, studying computer science.
          </p>
          <p className="text-lg mb-3">mainly work in deep learning/natural language processing.</p>
          <p className="text-lg">and also some Gen AI and web3 type stuff</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-light tracking-wide mb-6 border-l-4 border-black pl-4 flex items-center">
            <span className="mr-2">experience</span>
            <div className="flex-grow h-[1px] bg-black ml-4"></div>
          </h2>
          <ul className="space-y-4 pl-6 border-l border-gray-200">
            <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-4 before:rotate-45">
              2x YC Backed Engineer
            </li>
            <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-4 before:rotate-45">
              Founding and Lead Engineer at{" "}
              <a
                href="https://fnbc.com"
                className="ml-2 relative group"
                target="_blank"
                rel="noopener noreferrer"
              >
                FnBC
                <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-black origin-left transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
              </a>
            </li>
            <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-4 before:rotate-45">
              Founder and CTO of Existence . Co
            </li>
          </ul>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-light tracking-wide mb-6 border-l-4 border-black pl-4 flex items-center">
            <span className="mr-2">contributions</span>
            <div className="flex-grow h-[1px] bg-black ml-4"></div>
          </h2>
          <div className="border-2 border-black relative bg-black">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-black -translate-x-1 -translate-y-1"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-black translate-x-1 -translate-y-1"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-black -translate-x-1 translate-y-1"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-black translate-x-1 translate-y-1"></div>
            <ContributionsGraph />
          </div>
        </section>

        <ProjectsContainer />
      </main>
      <footer className="py-8 mt-12 border-t-2 border-black">
        <div className="max-w-3xl mx-auto px-6">
          <div className="pt-8 flex justify-center gap-8">
            <a
              href="https://github.com/maskjelly"
              className="text-black hover:text-gray-700 transition-colors tracking-wide relative group"
              target="_blank"
              rel="noopener noreferrer"
            >
              github
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-black origin-left transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </a>
            <span className="w-[1px] h-6 bg-black"></span>
            <a
              href="https://twitter.com/LiquidZooo"
              className="text-black hover:text-gray-700 transition-colors tracking-wide relative group"
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