import Link from "next/link"

export default function NotFound() {
  return (
    <div className="site-shell">
      <main className="site-main" style={{ display: "flex", alignItems: "center" }}>
        <div className="page-header" style={{ marginBlock: "4rem" }}>
          <p className="page-kicker">404</p>
          <h1 className="page-title">Nothing here.</h1>
          <p className="page-intro">The page may have moved. The command menu (⌘K) will find what you were looking for.</p>
          <div className="link-row" style={{ marginTop: "1.5rem" }}>
            <Link href="/" className="pill pill-primary">Home</Link>
            <Link href="/blog" className="pill">Writing</Link>
            <Link href="/resume" className="pill">Résumé</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
