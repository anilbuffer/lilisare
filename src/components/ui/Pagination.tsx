"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  entryLabel?: string;
  className?: string;
  variant?: "table-footer" | "standalone-card";
}

/**
 * Computes the page list with intelligent ellipsis sliding window.
 */
function getVisiblePageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

/**
 * Global standardized pagination component for all LiliSare list views and tables.
 * Layout:
 * Left:  Showing 1 to 10 of 128 entries
 * Right: < Previous [1] [2] [3] [4] [5] Next >
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  entryLabel = "entries",
  className = "",
  variant = "table-footer",
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);
  const pages = getVisiblePageNumbers(currentPage, safeTotalPages);

  const containerBaseClass =
    variant === "standalone-card"
      ? "bg-white rounded-xl lg:rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500"
      : "p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white";

  return (
    <div className={`${containerBaseClass} ${className}`}>
      {/* Left: Summary Count */}
      <div className="text-xs text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-800">{startIndex}</span> to{" "}
        <span className="font-bold text-slate-800">{endIndex}</span> of{" "}
        <span className="font-bold text-slate-800">{totalItems}</span> {entryLabel}
      </div>

      {/* Right: Previous, Numeric Pages, Next */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-end">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {/* Page Buttons with Ellipsis */}
        {pages.map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 font-bold"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = currentPage === pageNum;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                isActive
                  ? "bg-[#3D6B22] text-white shadow-xs font-bold"
                  : "border border-slate-200 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 font-semibold shadow-2xs"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
          disabled={currentPage >= safeTotalPages || safeTotalPages <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs transition-all"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
