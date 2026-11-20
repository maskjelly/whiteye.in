import Link from "next/link"
import type { Metadata } from "next"
import { JsonLd, person, PERSON_ID, SITE } from "@/lib/structured-data"
import { faq } from "@/lib/faq"

export const dynamic = "force-static"

const description =
  "Aaryan Singh in short answers: I'm a remote software engineer from Assam, India. What I'm working on, what I've built, my open-source work, awards and how to reach me."

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: { canonical: "/about" },
  openGraph: { title: "About · Aaryan Singh", description, url: `${SITE}/about`, type: "profile" },
  twitter: { title: "About · Aaryan Singh", description, card: "summary_large_image" },
}

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            person(),
            {
              "@type": "AboutPage",
              "@id": `${SITE}/about#page`,
              url: `${SITE}/about`,
              name: "About · Aaryan Singh",
              description,
              mainEntity: { "@id": PERSON_ID },
              isPartOf: { "@id": `${SITE}/#website` },
              inLanguage: "en",
            },
            {
              "@type": "FAQPage",
              "@id": `${SITE}/about#faq`,
              about: { "@id": PERSON_ID },
              mainEntity: faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }}
      />
      <header className="page-header animate-fade-in-up">
        <p className="page-kicker">About</p>
        <h1 className="page-title">About me, in short answers</h1>
        <p className="page-intro">
          The questions I get asked most, answered plainly. The longer version is on the{" "}
          <Link href="/resume">résumé</Link> and the <Link href="/now">now page</Link>.
        </p>
      </header>
      <article className="prose-mono">
        {faq.map((f) => (
          <section key={f.q}>
            <h2>{f.q}</h2>
            <p>{f.a}</p>
          </section>
        ))}
      </article>
    </>
  )
}
