"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import Link from "next/link"

export default function RetroPopup() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="w-full" role="dialog" aria-labelledby="popup-title">
      <div className="border-b-2 border-white p-2 flex justify-between items-center">
        <h3 id="popup-title" className="text-white text-sm font-bold tracking-wider">
          RESEARCH PAPERS FOR AI
        </h3>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-white text-xs">Collection of Research Papers for Understanding of AI and how they work</p>
        <div className="w-full h-24 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden shadow-inner">
          <div className="w-16 h-16 bg-gradient-to-tr from-gray-400 to-gray-600 shadow-lg transform rotate-45"></div>
        </div>
        <Link
          href="/read"
          className="block w-full text-center bg-gradient-to-r from-gray-700 to-gray-900 text-white py-2 text-sm font-bold tracking-wider hover:from-gray-600 hover:to-gray-800 transition-colors shadow-md"
        >
          EXPLORE NOW
        </Link>
      </div>
    </div>
  )
}

