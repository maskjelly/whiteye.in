import React from "react";
import ContributionsGraph from "./components/ContributionsGraph";
import ProjectsContainer from "./components/ProjectsContainer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black font-['Terminus',_monospace] text-base leading-relaxed p-4 sm:p-6">
      {/* Header */}
      <header className="mb-8 border-b border-gray-300 pb-2">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm tracking-wider">
            [working on shit i dont even understand]
          </span>
          <span className="text-xs sm:text-sm tracking-wider underline text-blue-800">
            <a href="https://src.whiteye.in">
              [Directory to learn NN/Karpathy's trade]
            </a>
          </span>
          <span>
            <a href="/roadmap" className="underline">
              [current vision map]
            </a>
          </span>
          <span className="text-gray-600 text-xs sm:text-sm">
            aaryan@whiteye.in
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto">
        {/* Bio */}
        <section className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            aaryan singh | maskjelly |
          </h1>
          <p className="text-sm sm:text-base text-gray-700 mb-2">
            @ student + working on Data Engine for robots
          </p>
          <p className="text-sm sm:text-base leading-relaxed">
            i’m a 19 y/o cs undergrad student. i love building things and solving
            problems. i enjoy language design, theoretical computer science, and
            i live on the terminal. if i’m not coding, i’m probably doing cardio,
            watching movies, or obsessing over mechanical keyboards and robots .
          </p>
        </section>

        {/* Work */}
        <section className="mb-8">
          <div className="text-center mb-4">
            <span className="text-xs sm:text-sm font-mono text-gray-800 tracking-wider">
              {"-".repeat(10)} Experience {"-".repeat(10)}
            </span>
          </div>
          <h2 className="text-xs sm:text-sm uppercase mb-3 text-gray-800 tracking-wider">
            * work
          </h2>
          <ul className="list-none pl-0 text-sm sm:text-base text-gray-800">
            <li className="mb-4">
              <strong className="block">Hacked rice.edu</strong>
              <span className="text-gray-600 text-xs sm:text-sm">
                <span className="text-gray-600 text-xs sm:text-sm">
                  infiltrated their database and sent them an audit
                </span>
              </span>
              <p className="mt-1 leading-relaxed">
                Engineered (under bounty , im not a bad guy) hack against rice.edu's systems and gained access to their database | reported and audited their website for free for further securtiy access and flaws [everything was reported safely and nothing was used for exploits]
                              </p>
            </li>
            <li className="mb-4">
              <strong className="block">2x YC backed engineer</strong>
              <span className="text-gray-600 text-xs sm:text-sm">
                <span className="text-gray-600 text-xs sm:text-sm">
                  @O1Visa and @Fridaymail
                </span>
              </span>
              <p className="mt-1 leading-relaxed">
                Mostly did work on backend management | onBoarding | Database management |
              </p>
            </li>
            <li>
              <strong className="block">FnBC</strong>
              <span className="text-gray-600 text-xs sm:text-sm">
                full-stack engineer (nov 2023 - jan 2024)
              </span>
              <p className="mt-1 leading-relaxed">
                contributed to a large-scale t3 stack app, worked on real-time
                presence and chat features and multiple client workspaces .
              </p>
            </li>
          </ul>
        </section>

        {/* Projects */}
        {/* <section className="mb-8">
          <div className="text-center mb-4">
            <span className="text-xs sm:text-sm font-mono text-gray-800 tracking-wider">
              {"-".repeat(10)} Projects {"-".repeat(10)}
            </span>
          </div>
          <h2 className="text-xs sm:text-sm uppercase mb-3 text-gray-800 tracking-wider">
            * projects
          </h2>
          <ul className="list-none pl-0 text-sm sm:text-base text-gray-800">
            <li className="mb-4">
              <strong className="block">[current] DataEngine </strong>
              <span className="text-gray-600 text-xs sm:text-sm">
                creator and maintainer with a small team
              </span>
              <p className="mt-1 leading-relaxed">
                Data Engine for robots to get trained on simulation of real world events to get them preped at relatively NULL COST and TIME WASTE .
                The ultimate robotics AI environment .
              </p>
            </li>
            <li className="mb-4">
              <strong className="block">PunkMail</strong>

              <span className="text-gray-600 text-xs sm:text-sm">creator</span>
              <p className="mt-1 leading-relaxed">
                Mass emailer for business \ B2C maily \
              </p>
            </li>
            <li>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <a
                    href="#"
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    all projects
                  </a>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-black">Currently under work</AlertDialogTitle>
                    <AlertDialogDescription>
                      Some stuff under work
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-black boundary">Cancel</AlertDialogCancel>
                    <AlertDialogAction>Ok</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          </ul>
        </section> */}
        <section className="mb-9">
          <h1 className="text-xs sm:text-sm uppercase mb-3 text-gray-800 tracking-wider">
            * projects
          </h1>
          <ProjectsContainer />
        </section>

        
        {/* Blog Section */}
        <section className="mb-8">
          {/* Retro Divider */}
          <div className="text-center mb-4">
            <span className="text-xs sm:text-sm font-mono text-gray-800 tracking-wider">
              {"-".repeat(10)} Blog {"-".repeat(10)}
            </span>
          </div>

          <h2 className="text-xs sm:text-sm uppercase mb-3 text-gray-800 tracking-wider">
            * blog
          </h2>
          <ul className="list-none pl-0 text-sm sm:text-base text-gray-800">
            <li className="mb-2">
              <strong className="block">How I built my own VCS like GIT in C</strong>
              <span className="text-gray-600 text-xs sm:text-sm">
                [under work {new Date().toLocaleDateString()}]
              </span>
            </li>
            <li className="mb-2">
              <strong className="block">More coming...</strong>
              <span className="text-gray-600 text-xs sm:text-sm"></span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <div className="text-center mb-4">
            <span className="text-xs sm:text-sm font-mono text-gray-800 tracking-wider">
              {"-".repeat(10)} my "Must Read" collection {"-".repeat(10)}
            </span>
          </div>
          <h2 className="text-xs sm:text-sm uppercase mb-3 text-gray-800 tracking-wider">
            * MUST READ FOR NERDS
          </h2>
          <ul className="list-none pl-0 text-sm sm:text-base text-gray-800">
            <li className="mb-2">
              <strong className="block">
                {''}
                <a href="/read" className="underline">
                  A little collection i am building up of cool researchpapers that i like
                </a>
              </strong>
              <span className="text-gray-600 text-xs sm:text-sm">
                [under work {new Date().toLocaleDateString()}]
              </span>
            </li>
          </ul>
        </section>
        {/* Contributions */}
        <section className="mb-8">
          <h2 className="text-xs sm:text-sm uppercase mb-3 text-gray-800 tracking-wider">
            * github contributions
          </h2>
          <div className="border border-gray-300 p-2 bg-gray-50">
            <ContributionsGraph />
          </div>
        </section>

        {/* Links */}
        <section className="mb-8">
          <h2 className="text-xs sm:text-sm uppercase mb-3 text-gray-800 tracking-wider">
            * links
          </h2>
          <p className="text-sm sm:text-base text-gray-800">
            <a
              href="mailto:x.com"
              className="underline text-blue-600 hover:text-blue-800"
            >
              email
            </a>{" "}
            |
            <a
              href="https://twitter.com/LiquidZooo"
              className="underline text-blue-600 hover:text-blue-800 ml-1"
            >
              twitter
            </a>{" "}
            |
            <a
              href="https://github.com/maskjelly"
              className="underline text-blue-600 hover:text-blue-800 ml-1"
            >
              github
            </a>{" "}
          </p>
        </section>
      </main>
    </div>
  );
}
