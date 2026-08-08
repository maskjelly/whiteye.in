import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export type Item = {
  title: string
  href?: string
  role: string
  period?: string
  description: string
}

type SectionListProps = {
  title: string
  items: Item[]
  viewAllHref?: string
  viewAllText?: string
  showTitle?: boolean
  showSectionBorder?: boolean
}

export function SectionList({
  title,
  items,
  viewAllHref,
  viewAllText,
  showTitle = true,
  showSectionBorder = true,
}: SectionListProps) {
  return (
    <section className={`section-block animate-fade-in-up ${showSectionBorder ? "" : "border-none"}`}>
      {showTitle && (
        <div className="section-heading">
          <h2 className="section-title">{title}</h2>
          {viewAllHref && viewAllHref !== "#" && (
            <Link
              href={viewAllHref}
              className="section-link group"
            >
              {viewAllText}{" "}
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          )}
        </div>
      )}
      <div className="entry-list">
        {items.map((item) => {
          const hasLink = item.href && item.href !== "#"
          const inner = (
            <div className="entry-body">
              <div className="min-w-0">
                <h3 className="entry-title">
                  {item.title}
                </h3>
                <p className="entry-meta mt-1">
                  {item.role}
                  {item.period && (
                    <span> · {item.period}</span>
                  )}
                </p>
                <p className="entry-description">{item.description}</p>
              </div>
              {hasLink && (
                <ArrowUpRight className="entry-arrow" />
              )}
            </div>
          )

          if (hasLink) {
            return (
              <Link
                key={item.title}
                href={item.href!}
                target="_blank"
                rel="noopener noreferrer"
                className="entry-card group"
              >
                {inner}
              </Link>
            )
          }

          return (
            <div
              key={item.title}
              className="entry-card group"
            >
              {inner}
            </div>
          )
        })}
      </div>
      {viewAllHref && viewAllHref !== "#" && !showTitle && (
        <Link
          href={viewAllHref}
          className="section-link group mt-6"
        >
          {viewAllText}{" "}
          <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      )}
    </section>
  )
}
