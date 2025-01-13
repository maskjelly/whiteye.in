// components/TerminalCursor.tsx
'use client'

import { useState, useEffect } from 'react'

export default function TerminalCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const moveToRandomPosition = () => {
      // Get viewport dimensions
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      // Calculate new random position within viewport
      const newX = Math.floor(Math.random() * (viewportWidth - 50)) // Subtract cursor width
      const newY = Math.floor(Math.random() * (viewportHeight - 50)) // Subtract cursor height
      
      setPosition({ x: newX, y: newY })
    }

    // Initial position
    moveToRandomPosition()

    // Move cursor every 3 seconds
    const interval = setInterval(moveToRandomPosition, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="fixed pointer-events-none w-[12px] h-[24px] bg-black animate-blink z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: 'all 0.3s ease-in-out',
      }}
    />
  )
}
