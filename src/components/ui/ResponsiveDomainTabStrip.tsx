"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";

export interface DomainTabItem<T extends string = string> {
  id: T;
  label: string;
  minWidth?: number;
  badge?: string;
}

interface ResponsiveDomainTabStripProps<T extends string> {
  tabs: DomainTabItem<T>[];
  activeTab: T;
  onSelectTab: (tabId: T) => void;
  ariaLabel?: string;
}

const DEFAULT_MORE_MIN_WIDTH = 112;

/**
 * Space-aware responsive tab strip matching AdminClientDetailView and AdminCaregiverDetailView.
 * Dynamically measures tab widths via ResizeObserver and collapses overflow tabs into a MORE dropdown.
 */
export function ResponsiveDomainTabStrip<T extends string>({
  tabs,
  activeTab,
  onSelectTab,
  ariaLabel = "Domain navigation tabs",
}: ResponsiveDomainTabStripProps<T>) {
  const tabStripRef = useRef<HTMLDivElement>(null);
  const measureContainerRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(tabs.length);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMoreOpen(false);
      }
    }
    if (isMoreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMoreOpen]);

  useEffect(() => {
    const calculateOverflow = () => {
      if (!tabStripRef.current) return;

      const containerWidth = tabStripRef.current.clientWidth;
      const availableWidth = containerWidth - 20;
      if (availableWidth <= 0) return;

      const measureChildren = measureContainerRef.current
        ? (Array.from(measureContainerRef.current.children) as HTMLElement[])
        : [];

      const moreMeasureEl =
        measureChildren.length > 0
          ? measureChildren[measureChildren.length - 1]
          : null;
      const measuredMoreWidth = moreMeasureEl
        ? moreMeasureEl.getBoundingClientRect().width
        : 0;
      const moreWidth = Math.max(measuredMoreWidth, DEFAULT_MORE_MIN_WIDTH);

      const tabElements = measureChildren.slice(0, tabs.length);
      const tabWidths = tabs.map((tab, idx) => {
        const measured = tabElements[idx]?.getBoundingClientRect().width || 0;
        return Math.max(measured, tab.minWidth || 96);
      });

      const GAP = 4;
      const totalAllWidth = tabWidths.reduce(
        (acc, w, idx) => acc + w + (idx > 0 ? GAP : 0),
        0
      );

      if (availableWidth >= totalAllWidth + 16) {
        setVisibleCount(tabs.length);
        return;
      }

      const maxTabsWidth = availableWidth - moreWidth - GAP;
      let currentWidth = 0;
      let count = 0;
      for (let i = 0; i < tabWidths.length; i++) {
        const nextWidth = currentWidth + (count > 0 ? GAP : 0) + tabWidths[i];
        if (nextWidth <= maxTabsWidth) {
          currentWidth = nextWidth;
          count++;
        } else {
          break;
        }
      }

      setVisibleCount(Math.min(tabs.length - 1, Math.max(1, count)));
    };

    calculateOverflow();

    const resizeObserver = new ResizeObserver(() => {
      calculateOverflow();
    });

    if (tabStripRef.current) {
      resizeObserver.observe(tabStripRef.current);
    }

    window.addEventListener("resize", calculateOverflow);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateOverflow);
    };
  }, [tabs]);

  const visibleTabs = tabs.slice(0, visibleCount);
  const collapsedTabs = tabs.slice(visibleCount);
  const activeCollapsedTab = collapsedTabs.find((t) => t.id === activeTab);
  const isMoreActive = Boolean(activeCollapsedTab);

  return (
    <div className="relative">
      {/* Hidden measurement row for pixel-perfect overflow calculation */}
      <div
        ref={measureContainerRef}
        aria-hidden="true"
        className="absolute -top-[9999px] -left-[9999px] invisible pointer-events-none flex items-center gap-1 opacity-0 z-[-1]"
      >
        {tabs.map((tab) => (
          <div
            key={`measure-${tab.id}`}
            className="px-3 sm:px-3.5 py-2 text-xs font-bold tracking-wide whitespace-nowrap rounded-xl flex items-center gap-1.5 shrink-0"
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold">
                {tab.badge}
              </span>
            )}
          </div>
        ))}
        <div className="px-3 sm:px-3.5 py-2 text-xs font-bold tracking-wide whitespace-nowrap rounded-xl flex items-center gap-1.5 border shrink-0">
          <span>MORE ({tabs.length})</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Dynamic Space-Aware Tab Navigation Strip */}
      <div
        ref={tabStripRef}
        role="tablist"
        aria-label={ariaLabel}
        className="relative w-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-2xl border border-slate-200 p-1.5 flex items-center gap-1 flex-nowrap overflow-visible"
      >
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                onSelectTab(tab.id);
                setIsMoreOpen(false);
              }}
              className={`relative shrink-0 px-3 sm:px-3.5 py-2 text-xs font-bold tracking-wide transition-all whitespace-nowrap rounded-xl cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/30"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {collapsedTabs.length > 0 && (
          <div ref={moreDropdownRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`px-3 sm:px-3.5 py-2 text-xs font-bold tracking-wide transition-all whitespace-nowrap rounded-xl cursor-pointer flex items-center gap-1.5 ${
                isMoreActive
                  ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/30"
                  : isMoreOpen
                    ? "bg-slate-100 text-slate-900 border border-slate-300"
                    : "text-slate-700 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 hover:text-slate-900"
              }`}
              aria-expanded={isMoreOpen}
              aria-label="More navigation domains"
            >
              <span>
                {isMoreActive && activeCollapsedTab
                  ? `MORE: ${activeCollapsedTab.label}`
                  : `MORE (${collapsedTabs.length})`}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isMoreOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isMoreOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 max-w-[calc(100vw-32px)] bg-white rounded-2xl border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 p-2 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Additional Domains</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                    {collapsedTabs.length} tabs
                  </span>
                </div>

                <div className="py-1 max-h-80 overflow-y-auto space-y-0.5">
                  {collapsedTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          onSelectTab(tab.id);
                          setIsMoreOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          isActive
                            ? "bg-[#3D6B22] text-white shadow-xs"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>{tab.label}</span>
                        </div>
                        {tab.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
