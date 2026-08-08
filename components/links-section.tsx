import Link from "next/link"

const links = [
  { title: "email", href: "mailto:aaryan@whiteye.in" },
  { title: "x.com", href: "https://twitter.com/aaryantwt" },
  { title: "github", href: "https://github.com/maskjelly" },
  { title: "uses", href: "/uses" },
  { title: "rss", href: "/feed.xml" },
]

function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("//")
}

export function LinksSection() {
  return (
    <section className="section-block animate-fade-in-up">
      <h2 className="section-title mb-6">elsewhere</h2>
      <div className="link-row">
        {links.map((link, index) =>
          isInternal(link.href) ? (
            <Link
              key={index}
              href={link.href}
              className="quiet-link"
            >
              {link.title}
            </Link>
          ) : (
            <a
              key={index}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="quiet-link"
            >
              {link.title}
            </a>
          )
        )}
      </div>
    </section>
  )
}
