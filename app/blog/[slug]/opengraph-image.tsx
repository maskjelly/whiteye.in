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
          backgroundColor: "#f3efe4",
          color: "#242119",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
          <span style={{ color: "#244b80", fontSize: 24, letterSpacing: 2 }}>AARYAN / WRITING</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 500,
            color: "#242119",
            letterSpacing: -1.5,
            lineHeight: 1.1,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#716a5d", marginTop: 36 }}>
          {date}
          {reading ? `  ·  ${reading} read` : ""}
        </div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 22, color: "#244b80" }}>
          whiteye.in/blog
        </div>
      </div>
    ),
    size
  )
}
