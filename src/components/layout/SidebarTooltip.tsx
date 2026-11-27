"use client";

import React, { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export interface SidebarTooltipData {
  label: string;
  top: number;
  left: number;
  isActive?: boolean;
}

/**
 * Manages hover/focus tooltip coordinates for collapsed mini-rail sidebar items,
 * rendering via portal so overflow-clipped scroll containers never crop tooltips.
 */
export function useSidebarTooltip(isCollapsed: boolean) {
  const [tooltip, setTooltip] = useState<SidebarTooltipData | null>(null);

  useEffect(() => {
    if (!isCollapsed) {
      setTooltip(null);
    }
  }, [isCollapsed]);

  const showTooltip = useCallback(
    (
      e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>,
      label: string,
      isActive?: boolean
    ) => {
      if (!isCollapsed) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        label,
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
        isActive,
      });
    },
    [isCollapsed]
  );

  const hideTooltip = useCallback(() => {
    setTooltip(null);
  }, []);

  return { tooltip: isCollapsed ? tooltip : null, showTooltip, hideTooltip };
}

/**
 * Portal-rendered tooltip styled with LiliSare's forest-green and sage brand tokens.
 */
export function SidebarTooltip({ tooltip }: { tooltip: SidebarTooltipData | null }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {tooltip && (
        <motion.div
          role="tooltip"
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -4 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          style={{ top: tooltip.top, left: tooltip.left }}
          className="fixed -translate-y-1/2 z-[100] pointer-events-none hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#14280E] text-white text-xs font-semibold tracking-wide rounded-xl border border-[#3D6B22]/80 shadow-[0_8px_24px_rgba(14,29,10,0.35)] whitespace-nowrap"
        >
          <span
            aria-hidden="true"
            className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-[#14280E] border-l border-b border-[#3D6B22]/80"
          />
          {tooltip.isActive && (
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 rounded-full bg-[#93C573] shrink-0 relative z-10"
            />
          )}
          <span className="relative z-10">{tooltip.label}</span>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
