"use client";
import Link from "next/link";

export default function UpcomingProject() {
  return (
    <div className="w-full" role="dialog" aria-labelledby="popup-title">
      <div className="border-b-2 border-white p-2 flex justify-between items-center">
        <h3
          id="popup-title"
          className="text-white text-sm font-bold tracking-wider"
        >
          New Project! 
        </h3>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-white text-xs">
        An AI Customer Support agent for business frameworks focused on integrability making customer support cheap reliable and super fast
        </p>
        <Link
          href="https://usb.whiteye.in"
          className="block w-full text-center bg-gradient-to-r from-gray-700 to-gray-900 text-white py-2 text-sm font-bold tracking-wider hover:from-gray-600 hover:to-gray-800 transition-colors shadow-md"
        >
          Check out ! 
        </Link>
      </div>
    </div>
  );
}
