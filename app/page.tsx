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
          Aryan
        </h1>
        <p className="text-gray-500 animate-fade-in">
          founding engineer at referrush · bangalore, india
        </p>
        <p className="text-pretty max-w-[52ch] animate-fade-in-up">
          i&apos;m a 20 y/o engineer. i love building things that stay calm under
          pressure. i enjoy security, infrastructure, and systems that are hard
          to corrupt. i live in the terminal and get pulled into rabbit holes
          easily. if i&apos;m not coding, i&apos;m probably obsessing over
          mechanical keyboards, reading about distributed systems, or finding
          bugs in things that shouldn&apos;t have them.
        </p>
      </header>

      <BlogSection />

      <div id="work">
        <SectionList
          title="work"
          items={workItems.slice(0, 3)}
          viewAllHref="#"
          viewAllText="all work"
        />
      </div>

      <div id="projects">
        <SectionList
          title="projects"
          items={projectItems}
          viewAllHref="#"
          viewAllText="all projects"
        />
      </div>

      <LinksSection />
    </>
  )
}
