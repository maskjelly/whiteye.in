import Link from "next/link"

export default function NotFound() {
  return (
    <div className="page-header">
      <div>
        <p className="page-kicker">404</p>
        <h1 className="page-title">nothing here.</h1>
        <Link
          href="/"
          className="back-link inline-block mt-8"
        >
          return home
        </Link>
      </div>
    </div>
  )
}
