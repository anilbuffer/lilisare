"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "lilisare_sidebar_collapsed_v2";
// Laptops (< 1536px) and iPad Pro (1024px-1366px) default to minimized sidebar (76px).
// Large Desktop (>= 1536px) defaults to expanded sidebar (260px).
const LARGE_DESKTOP_BREAKPOINT = 1536;

// Module-level persistent state so navigation between layouts retains the exact same state without flashing or fluctuating
let currentCollapsed = false;
let isInitialized = false;
const listeners = new Set<() => void>();

function initializeState(): boolean {
  if (typeof window === "undefined") return false;
  if (isInitialized) return currentCollapsed;

  isInitialized = true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      currentCollapsed = JSON.parse(stored);
      return currentCollapsed;
    }
  } catch {}

  const isLargeDesktop = window.innerWidth >= LARGE_DESKTOP_BREAKPOINT;
  currentCollapsed = !isLargeDesktop;
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
  return false;
}

function setCollapsedState(value: boolean | ((prev: boolean) => boolean)) {
  const next = typeof value === "function" ? value(currentCollapsed) : value;
  if (next === currentCollapsed) return;
  currentCollapsed = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }
  listeners.forEach((listener) => listener());
}

export function useSidebarCollapse() {
  const isCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleCollapse = useCallback(() => {
    setCollapsedState((prev) => !prev);
  }, []);

  const setIsCollapsed = useCallback((val: boolean) => {
    setCollapsedState(val);
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
      if (localStorage.getItem(STORAGE_KEY) === null) {
        const isLarge = window.innerWidth >= LARGE_DESKTOP_BREAKPOINT;
        setCollapsedState(!isLarge);
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
