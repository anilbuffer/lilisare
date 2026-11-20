"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "lilisare_sidebar_collapsed_v2";
// Laptops (< 1536px) and iPad Pro (1024px-1366px) default to minimized sidebar (76px).
// Large Desktop (>= 1536px) defaults to expanded sidebar (260px).
const LARGE_DESKTOP_BREAKPOINT = 1536;

export function useSidebarCollapse() {
  // Default to true (minimized) for safe initial load on laptops and tablets
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if the user previously explicitly set a preference
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      try {
        setIsCollapsed(JSON.parse(stored));
        return;
      } catch {
        // Fallback to screen-size based default
      }
    }

    // Default by screen size:
    // Laptop / Pro iPad (< 1536px): minimized sidebar (isCollapsed: true)
    // Large Desktop (>= 1536px): expanded sidebar (isCollapsed: false)
    const isLargeDesktop = window.innerWidth >= LARGE_DESKTOP_BREAKPOINT;
    setIsCollapsed(!isLargeDesktop);

    const handleResize = () => {
      // Only auto-adjust if user hasn't explicitly saved a preference
      if (localStorage.getItem(STORAGE_KEY) === null) {
        const desktop = window.innerWidth >= LARGE_DESKTOP_BREAKPOINT;
        setIsCollapsed(!desktop);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapse();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCollapse]);

  return {
    isCollapsed,
    setIsCollapsed,
    toggleCollapse,
  };
}
