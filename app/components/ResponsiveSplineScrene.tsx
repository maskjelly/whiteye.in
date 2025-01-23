"use client"

import { useState, useEffect } from "react"
import { SplineScene } from "@/components/ui/splite"

export default function ResponsiveSplineScene() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsVisible(window.innerWidth >= 1024) // 1024px is the breakpoint for 'lg' in Tailwind
    }

    handleResize() // Check on initial load
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="w-[300px] h-[300px] relative">
        <div className="absolute inset-0 border-4 border-white bg-black/50 backdrop-blur-sm rounded-sm">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-orange-500 -translate-x-3 -translate-y-3 rounded-tl"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-orange-500 translate-x-3 -translate-y-3 rounded-tr"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-orange-500 -translate-x-3 translate-y-3 rounded-bl"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-orange-500 translate-x-3 translate-y-3 rounded-br"></div>
        </div>

        <span className="absolute top-4 left-4 text-sm z-10 text-orange-500">Hover over me</span>

        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full absolute top-0 left-0"
        />
      </div>
    </div>
  )
}

