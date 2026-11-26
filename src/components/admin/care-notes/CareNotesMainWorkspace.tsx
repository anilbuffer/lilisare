"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CareNotesSubNav } from "./CareNotesSubNav";
import { CareNotesOverviewWorkspace } from "./CareNotesOverviewWorkspace";
import { CareNotesAllWorkspace } from "./CareNotesAllWorkspace";
import { CareNotesReviewQueueWorkspace } from "./CareNotesReviewQueueWorkspace";
import { CareNotesCorrectionsWorkspace } from "./CareNotesCorrectionsWorkspace";
import { CareNotesRulesWorkspace } from "./CareNotesRulesWorkspace";
import { CareNotesTemplatesWorkspace } from "./CareNotesTemplatesWorkspace";
import { CareNotesReportsWorkspace } from "./CareNotesReportsWorkspace";
import { CareNotesAuditWorkspace } from "./CareNotesAuditWorkspace";

interface CareNotesMainWorkspaceProps {
  initialTab?: string;
}

export function CareNotesMainWorkspace({ initialTab = "overview" }: CareNotesMainWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<string>(urlTab || initialTab || "overview");

  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`/admin/care-notes?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 01. Single Rock-Solid Dynamic Space-Aware Header & Tab Navigation Bar */}
      <CareNotesSubNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* 02. In-Page Tab Views (Swapped seamlessly without route URLs or page reloads) */}
      <div className="w-full">
        {activeTab === "overview" && (
          <CareNotesOverviewWorkspace hideSubNav onTabChange={handleTabChange} />
        )}
        {activeTab === "all" && (
          <CareNotesAllWorkspace hideSubNav onTabChange={handleTabChange} />
        )}
        {activeTab === "review" && (
          <CareNotesReviewQueueWorkspace hideSubNav onTabChange={handleTabChange} />
        )}
        {activeTab === "corrections" && (
          <CareNotesCorrectionsWorkspace hideSubNav onTabChange={handleTabChange} />
        )}
        {activeTab === "rules" && (
          <CareNotesRulesWorkspace hideSubNav onTabChange={handleTabChange} />
        )}
        {activeTab === "templates" && (
          <CareNotesTemplatesWorkspace hideSubNav onTabChange={handleTabChange} />
        )}
        {activeTab === "reports" && (
          <CareNotesReportsWorkspace hideSubNav onTabChange={handleTabChange} />
        )}
        {activeTab === "audit" && (
          <CareNotesAuditWorkspace hideSubNav onTabChange={handleTabChange} />
        )}
      </div>
    </div>
  );
}
