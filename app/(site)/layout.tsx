import { Navbar } from "@/components/navbar"
import { SiteChrome } from "@/components/site-chrome"
import { posts } from "@/lib/posts"

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="site-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="site-main" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Aaryan Singh</span>
        <nav className="site-footer-links" aria-label="Footer">
          <a href="/feed.xml">RSS</a>
          <a href="/llms.txt">llms.txt</a>
          <a href="https://github.com/maskjelly/whiteye.in" rel="noopener">Source</a>
          <a href="/xp">XP desktop</a>
        </nav>
      </footer>
      <SiteChrome posts={posts.map((p) => ({ slug: p.slug, title: p.title }))} />
    </div>
  )
}
