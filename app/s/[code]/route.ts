import { NextRequest, NextResponse } from "next/server"

const BASE = process.env.RUSHORT_BASE ?? "https://45.196.196.251/rushort"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  if (!/^[0-9A-Za-z]{1,11}$/.test(code)) {
    return new NextResponse("no such link", { status: 404 })
  }
  const upstream = await fetch(`${BASE}/${code}`, {
    redirect: "manual",
  })
  const location = upstream.headers.get("location")
  if (upstream.status === 302 && location) {
    return NextResponse.redirect(location, 302)
  }
  return new NextResponse("no such link", { status: 404 })
}
