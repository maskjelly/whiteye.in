import Link from "next/link"

export default function Navbar() {
    return (
        <main className="backdrop-blur-[2px] p-4 sm:p-6 md:p-8 w-full relative z-[1]">

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
            </div>
        </main>
    )
}