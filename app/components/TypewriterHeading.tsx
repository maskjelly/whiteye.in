'use client'

import { useState, useEffect } from 'react'

export default function TypewriterHeading() {
  const [text, setText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const fullText = "hi, i am Whiteye!"

  // Typewriter effect
  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 150)

    return () => clearInterval(interval)
  }, [])

  // Cursor blink effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)

    return () => clearInterval(blinkInterval)
  }, [])

  return (
    <div className="relative">
      <h1 className="text-4xl font-light tracking-tight text-white inline-flex items-center">
        {text}
        <span 
          className={`ml-1 inline-block w-3 h-8 bg-white ${showCursor ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
        />
      </h1>
    </div>
  )
}
