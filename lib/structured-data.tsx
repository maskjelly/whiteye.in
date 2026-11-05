import profile from "@/lib/resume-data.json"

export const SITE = "https://whiteye.in"
export const PERSON_ID = `${SITE}/#person`

export function person() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: profile.name,
    givenName: "Aaryan",
    familyName: "Singh",
    url: SITE,
    email: `mailto:${profile.email}`,
    jobTitle: "Software Engineer",
    description: profile.summary,
    image: `${SITE}/opengraph-image`,
    homeLocation: { "@type": "Place", name: profile.location },
    sameAs: ["https://github.com/maskjelly", "https://x.com/aaryantwt"],
    alumniOf: { "@type": "CollegeOrUniversity", name: "University of Waterloo" },
    knowsAbout: profile.skills.flatMap((s) => s.value.split(", ")),
  }
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
