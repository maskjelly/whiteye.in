"use client"

import Spline from "@splinetool/react-spline"

export default function ResponsiveSplineScene() {
  return (
    <div className="w-full h-48 relative">
      <span className="absolute top-2 left-2 text-xs z-10 text-orange-500">Hover over me</span>
      <Spline
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
        className="w-full h-full absolute top-0 left-0"
      />
    </div>
  )
}

