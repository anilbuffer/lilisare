"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "lilisare_sidebar_user_override_v4";
export const LARGE_DESKTOP_BREAKPOINT = 1366;

// Module-level persistent state so navigation between layouts retains the exact same state without flashing or fluctuating
let currentCollapsed = false;
let isInitialized = false;
let lastBreakpointMode: "desktop" | "laptop" | null = null;
const listeners = new Set<() => void>();

function getBreakpointMode(): "desktop" | "laptop" {
  if (typeof window === "undefined") return "desktop";
  return window.innerWidth > LARGE_DESKTOP_BREAKPOINT ? "desktop" : "laptop";
}

function initializeState(): boolean {
  if (typeof window === "undefined") return false;
  if (isInitialized) return currentCollapsed;

  isInitialized = true;
  const mode = getBreakpointMode();
  lastBreakpointMode = mode;

  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${mode}`);
    if (stored !== null) {
      currentCollapsed = JSON.parse(stored);
      return currentCollapsed;
    }
  } catch {}

  // Defaults:
  // Large Desktop (> 1366px) -> expanded (currentCollapsed = false)
  // Laptop / Compact Desktop (<= 1366px) -> collapsed mini-rail (currentCollapsed = true)
  currentCollapsed = mode === "laptop";
  return currentCollapsed;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): boolean {
  if (typeof window !== "undefined" && !isInitialized) {
    initializeState();
  }
  return currentCollapsed;
}

function getServerSnapshot(): boolean {
  return false; // Server renders expanded baseline
}

function setCollapsedState(value: boolean | ((prev: boolean) => boolean), persistUserOverride = false) {
  const next = typeof value === "function" ? value(currentCollapsed) : value;
  if (next === currentCollapsed && isInitialized) return;
  currentCollapsed = next;
  isInitialized = true;

  if (persistUserOverride && typeof window !== "undefined") {
    try {
      const mode = getBreakpointMode();
      localStorage.setItem(`${STORAGE_KEY}_${mode}`, JSON.stringify(next));
    } catch {}
  }
  listeners.forEach((listener) => listener());
}

export function useSidebarCollapse() {
  const isCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleCollapse = useCallback(() => {
    setCollapsedState((prev) => !prev, true);
  }, []);

  const setIsCollapsed = useCallback((val: boolean) => {
    setCollapsedState(val, true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapse();
      }
    };

    const handleResize = () => {
      if (typeof window === "undefined") return;
      const newMode = getBreakpointMode();
      if (newMode !== lastBreakpointMode) {
        lastBreakpointMode = newMode;
        // User crossed viewport boundary between laptop and large desktop!
        // Check if user set an explicit manual override for this mode:
        try {
          const stored = localStorage.getItem(`${STORAGE_KEY}_${newMode}`);
          if (stored !== null) {
            setCollapsedState(JSON.parse(stored), false);
            return;
          }
        } catch {}
        // Default: desktop -> expanded (false), laptop -> collapsed (true)
        setCollapsedState(newMode === "laptop", false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [toggleCollapse]);

  return {
    isCollapsed,
    setIsCollapsed,
    toggleCollapse,
  };
}
