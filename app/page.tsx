import { BlogSection } from "@/components/blog-section"
import { LinksSection } from "@/components/links-section"
import { SectionList } from "@/components/section-list"
import { projectItems } from "@/lib/project-items"
import { workItems } from "@/lib/work-items"

export default function HomePage() {
  return (
    <>
      <header className="mb-16 space-y-4">
        <h1 className="text-5xl font-semibold tracking-tight text-white text-balance mb-4 animate-fade-in">
          aaryan
        </h1>
        <p className="text-gray-500 animate-fade-in">
          20 y/o · 2x yc · founding engineer at referrush · bangalore, india
        </p>
        <p className="text-pretty max-w-[52ch] animate-fade-in-up">
          i build systems that stay calm under pressure. i care about security,
          infrastructure, and things that are hard to corrupt. i live in the
          terminal and fall into rabbit holes for a living. past lives include
          shipping an ai email indexing pipeline at a yc&apos;23 company,
          finding a sql injection in rice.edu at 17, and building developer
          tooling that people actually use. if i&apos;m not coding, i&apos;m
          obsessing over mechanical keyboards or reading about distributed
          systems.
        </p>
      </header>

      <BlogSection />

      <div id="work">
        <SectionList
          title="work"
          items={workItems}
        />
      </div>

      <div id="projects">
        <SectionList
          title="projects"
          items={projectItems}
          viewAllHref="https://github.com/maskjelly"
          viewAllText="all projects"
        />
      </div>

      <LinksSection />
    </>
  )
}
