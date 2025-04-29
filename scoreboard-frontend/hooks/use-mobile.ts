"use client"

import { useState, useEffect } from "react"

/**
 * Hook to detect if the current viewport is mobile-sized
 * @param breakpoint The width threshold in pixels to consider as mobile (default: 768)
 * @returns Boolean indicating if the viewport is mobile-sized
 */
export function useIsMobile(breakpoint = 768) {
  // Default to false during SSR
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === "undefined") return

    // Function to check if the viewport is mobile-sized
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Initial check
    checkMobile()

    // Set up event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Clean up event listener
    return () => window.removeEventListener("resize", checkMobile)
  }, [breakpoint])

  return isMobile
}
