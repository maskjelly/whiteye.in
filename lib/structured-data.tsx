import profile from "@/lib/resume-data.json"

export const SITE = "https://whiteye.in"
export const PERSON_ID = `${SITE}/#person`

const socialAlt = "Aaryan Singh. Software engineer: consumer products at scale, systems in Rust, open source."
export const SOCIAL_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, type: "image/png", alt: socialAlt }
// Built by scripts/build-og-animation.py; the first frame is a complete card for platforms that do not animate.
export const HOME_SOCIAL_IMAGE = { url: "/og.png", width: 1200, height: 630, type: "image/png", alt: "Aaryan Singh, engineer, 20" }
export const ANIMATED_SOCIAL_IMAGE = { url: "/og.gif", width: 1200, height: 630, type: "image/gif", alt: "Aaryan Singh, engineer, 20" }

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
    alternateName: ["maskjelly", "whiteye"],
    nationality: { "@type": "Country", name: "India" },
    hasOccupation: {
      "@type": "Occupation",
      name: "Software Engineer",
      occupationLocation: { "@type": "Country", name: "India" },
      skills: "High-scale consumer products, Rust, systems programming, open source",
    },
    award: [
      "National Math Olympiad silver medal, three times (ages 15 to 17)",
      "IITM NexHack, 2nd place (2023)",
      "IPSC Web Development, 4th in India",
    ],
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
