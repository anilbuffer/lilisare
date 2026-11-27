"use client";

import React from "react";
import { ReportCategory } from "@/lib/reports-mock-data";
import { ResponsiveDomainTabStrip } from "@/components/ui/ResponsiveDomainTabStrip";

interface ReportCategoryTabsProps {
  categories: ReportCategory[];
  activeCategory: ReportCategory;
  onSelect: (category: ReportCategory) => void;
}

export function ReportCategoryTabs({ categories, activeCategory, onSelect }: ReportCategoryTabsProps) {
  return (
    <div className="mb-4">
      <ResponsiveDomainTabStrip
        tabs={categories.map((category) => ({ id: category, label: category }))}
        activeTab={activeCategory}
        onSelectTab={onSelect}
        ariaLabel="Report categories"
      />
    </div>
  );
}
