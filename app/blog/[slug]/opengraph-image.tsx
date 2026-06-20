import { ImageResponse } from "next/og"
import { getPostMeta, posts } from "@/lib/posts"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

export function generateAlt({ params }: { params: { slug: string } }) {
  const post = getPostMeta(params.slug)
  return post ? post.title : "writing"
}

export default async function OG({ params }: { params: { slug: string } }) {
  const post = getPostMeta(params.slug)
  const title = post?.title ?? "writing"
  const date = post?.date ?? ""
  const reading = post?.readingTime ?? ""

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#111",
          color: "#d1d5db",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
          <span style={{ color: "#ff6b35", fontSize: 36, marginRight: 14 }}>*</span>
          <span style={{ color: "#6b7280", fontSize: 26, letterSpacing: 1 }}>aaryan / writing</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: -1.5,
            lineHeight: 1.1,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#6b7280", marginTop: 36 }}>
          {date}
          {reading ? `  ·  ${reading} read` : ""}
        </div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 22, color: "#ff6b35" }}>
          whiteye.in/blog
        </div>
      </div>
    ),
    size
  )
}
