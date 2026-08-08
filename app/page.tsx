import { BlogSection } from "@/components/blog-section"
import { LinksSection } from "@/components/links-section"
import { SectionList } from "@/components/section-list"
import { projectItems } from "@/lib/project-items"
import { workItems } from "@/lib/work-items"

export default function HomePage() {
  return (
    <>
      <header className="home-hero">
        <p className="eyebrow animate-fade-in">engineer · bangalore</p>
        <h1 className="display-title animate-fade-in">
          aaryan.
        </h1>
        <p className="hero-copy animate-fade-in-up">
          i make software and write about the parts that break.
        </p>
        <p className="hero-note animate-fade-in-up">
          currently at referrush · two-time yc alum.
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
          items={projectItems.slice(0, 3)}
          viewAllHref="https://github.com/maskjelly"
          viewAllText="all projects"
        />
      </div>

      <LinksSection />
    </>
  )
}
