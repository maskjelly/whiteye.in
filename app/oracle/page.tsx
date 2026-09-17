import type { Metadata } from "next"
import { OracleClient } from "@/components/oracle-client"
import "./oracle.css"

export const metadata: Metadata = {
  title: "oracle",
  description:
    "whiteye oracle — ask any yes/no question and get a verdict. yes or no, nothing else.",
  alternates: { canonical: "/oracle" },
  openGraph: {
    title: "whiteye oracle",
    description: "ask a yes/no question. get a verdict. nothing else.",
    url: "https://whiteye.in/oracle",
    siteName: "aaryan",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "whiteye oracle",
    description: "ask a yes/no question. get a verdict. nothing else.",
    card: "summary_large_image",
    creator: "@aaryantwt",
  },
}

export default function OraclePage() {
  return <OracleClient />
}
