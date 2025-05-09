import Link from "next/link"

export default function Blog() {
  return (
    <main className="min-h-screen bg-black text-gray-300 p-4 sm:p-6 md:p-8 w-full">
      <div className="max-w-3xl mx-auto">
        <nav className="mb-8 md:mb-12 overflow-x-auto whitespace-nowrap">
          <ul className="flex gap-4">
            <li>
              [
              <Link href="/" className="text-gray-300 hover:text-white">
                h
              </Link>
              ] home
            </li>
            <li>
              [
              <Link href="/blog" className="text-gray-300 hover:text-white">
                b
              </Link>
              ] blog
            </li>
            <li>
              [
              <Link href="/projects" className="text-gray-300 hover:text-white">
                p
              </Link>
              ] projects
            </li>
          </ul>
        </nav>

        <div className="space-y-6 md:space-y-8">
          <header>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">blog</h1>
          </header>

          <p className="text-sm sm:text-base">No blog posts yet. Check back soon!</p>
        </div>
      </div>
    </main>
  )
}
