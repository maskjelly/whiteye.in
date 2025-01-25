"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { Vortex } from "./vortex";

export default function RetroPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="w-full" role="dialog" aria-labelledby="popup-title">
      <div className="border-b-2 border-white p-2 flex justify-between items-center">
        <h3
          id="popup-title"
          className="text-white text-sm font-bold tracking-wider"
        >
          RESEARCH PAPERS FOR AI
        </h3>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-white text-xs">
          Collection of Research Papers for Understanding of AI and how they
          work
        </p>
        <div className="w-full h-24 overflow-hidden">
          <Vortex
            particleCount={250} // Increase particle count
            baseHue={0} // Start with a bright color (red/blue)
            rangeY={100} // Increase vertical spread
            baseSpeed={1} // Faster movement
            rangeSpeed={1.5} // More speed variation
            baseRadius={1} // Larger base particle size
            rangeRadius={1} // More size variation
            backgroundColor="transparent"
          />
        </div>
        <Link
          href="/read"
          className="block w-full text-center bg-gradient-to-r from-gray-700 to-gray-900 text-white py-2 text-sm font-bold tracking-wider hover:from-gray-600 hover:to-gray-800 transition-colors shadow-md"
        >
          EXPLORE NOW
        </Link>
      </div>
    </div>
  );
}
