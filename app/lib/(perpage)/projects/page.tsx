import Link from "next/link"

export default function Projects() {
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
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">projects</h1>
                    </header>

                    <section>
                        <div className="space-y-6 md:space-y-8">
                            <div>
                                <h3 className="text-white font-bold">create-t3-app</h3>
                                <p className="text-xs sm:text-sm text-gray-400">creator and maintainer</p>
                                <p className="text-sm sm:text-base">
                                    open-source project for initializing full-stack next.js apps. 24k+ stars, 200+ contributors
                                </p>
                            </div>

                            <div>
                                <h3 className="text-white font-bold">mini-git</h3>
                                <p className="text-xs sm:text-sm text-gray-400">creator</p>
                                <p className="text-sm sm:text-base">simplified version of git from scratch</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}
