"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import GitHubProjects from "@/app/(perpage)/projects/page"

// Improved Animation component for the name with better performance
const AnimatedText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState(text)
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        if (isComplete) return

        const targetChars = text.split("")
        let currentChars = Array(text.length).fill(" ")
        let animationFrames: number[] = []

        // Initialize with spaces for immediate rendering
        setDisplayedText(currentChars.join(""))

        // Create animation frames for each character
        targetChars.forEach((targetChar, index) => {
            // Prepare character animation
            const alphabet = "abcdefghijklmnopqrstuvwxyzAS "
            const charIterations = 3 + Math.floor(Math.random() * 5) // Fewer iterations for speed
            const startDelay = 10 + Math.random() * 50 + index * 20 // Staggered start for natural effect

            // Schedule each character animation
            let iteration = 0

            const animateChar = () => {
                if (iteration >= charIterations) {
                    // Final iteration - set the target character
                    currentChars[index] = targetChar
                    setDisplayedText(currentChars.join(""))
                    return
                }

                // Generate random character
                const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)]
                currentChars[index] = randomChar
                setDisplayedText(currentChars.join(""))

                iteration++
                // Schedule next iteration (faster animation)
                const frameId = window.setTimeout(
                    animateChar,
                    20 + Math.random() * 30
                )
                animationFrames.push(frameId)
            }

            // Start this character's animation after its delay
            const startTimerId = window.setTimeout(animateChar, startDelay)
            animationFrames.push(startTimerId)
        })

        // Set a timer to mark animation as complete
        const completionTimer = window.setTimeout(() => {
            setDisplayedText(text)
            setIsComplete(true)
        }, text.length * 80 + 300)

        return () => {
            // Clean up all timers on unmount
            animationFrames.forEach(frameId => window.clearTimeout(frameId))
            window.clearTimeout(completionTimer)
        }
    }, [text])

    return <span>{displayedText || text}</span>
}

export default function Home() {
    const [animationStarted, setAnimationStarted] = useState(false)

    useEffect(() => {
        // Start animation immediately after component mounts
        setAnimationStarted(true)
    }, [])

    return (
        <main className="min-h-screen backdrop-blur-[2px] p-4 sm:p-6 md:p-8 w-full relative z-[1]">

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
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            {animationStarted ? (
                                <AnimatedText text="Aryan Singh" />
                            ) : (
                                <span className="inline-flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </span>
                            )}
                        </h1>

                        <div className="space-y-2">
                            <p className="flex items-center gap-2 text-sm sm:text-base">
                                <span>📍</span> Bangalore, india
                            </p>
                            <p className="flex items-center gap-2 text-sm sm:text-base">
                                <span>👨‍💻</span> \*retard\*
                            </p>
                        </div>
                    </header>

                    <div>
                        <p className="leading-relaxed text-sm sm:text-base">
                            i'm a 19 y/o cs undergrad student. i love building things and solving problems.
                            i enjoy language design, practical computer science, and i live on the terminal. if i'm not coding, i'm probably doing cardio, watching movies, or obsessing over mechanical keyboards and robots.
                        </p>
                    </div>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                            <span className="text-red-500 mr-2">*</span>work
                        </h2>

                        <div className="space-y-6 md:space-y-8">
                            <div>
                                <h3 className="text-white font-bold">Rice University Security Audit</h3>
                                <p className="text-xs sm:text-sm text-gray-400">Bounty Hacker</p>
                                <p className="text-sm sm:text-base">
                                    Engineered (under bounty) hack against rice.edu's systems and gained access to every inch of their database | reported and audited their website for for further security access and flaws
                                </p>
                            </div>

                            <div>
                                <h3 className="text-white font-bold">2x YCombinator Dev</h3>
                                <p className="text-xs sm:text-sm text-gray-400">O1Visa & Fridaymail</p>
                                <p className="text-sm sm:text-base">
                                    Built directory and worked on re-designing backend for scale. Worked on NextFaster making AGENTIC directories for onboarding new users
                                </p>
                                <br />
                                <p>
                                    Built in-house email ranking engine tagging mails with AI and lifetime context for LLM's with MEM0 and custom vector updates per clients - Redis for client performance.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-white font-bold">FnBC</h3>
                                <p className="text-xs sm:text-sm text-gray-400">full-stack engineer (nov 2023 - jan 2024)</p>
                                <p className="text-sm sm:text-base">
                                    Worked with 22+ clients building or maintaining theere MVP and business ports.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                            <span className="text-red-500 mr-2">*</span>projects
                        </h2>
                        <GitHubProjects />
                        <div className="space-y-6 md:space-y-8">
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}
