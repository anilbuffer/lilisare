"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InquiryRecord, InquiryStage } from "@/types/intake";
import {
  Search,
  Kanban,
  List,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Check,
  Filter,
  FilterX,
  Inbox,
  Sparkles,
  PhoneCall,
  MessageSquare,
  FileCheck2,
  ThumbsUp,
  CheckCircle2,
  Archive,
  GripVertical,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import {
  saveIntakeInquiriesToStorage,
  getIntakeInquiriesFromStorage,
  convertInquiryToLiveEntities,
  syncInquiryStageToAdmin,
} from "@/lib/intake/intakeSync";

interface InquiryManagementWorkspaceProps {
  inquiries: InquiryRecord[];
  selectedStageFilter: InquiryStage | null;
  onSelectStageFilter: (stage: InquiryStage | null) => void;
  urgentOnly?: boolean;
  baseDetailsPath?: string;
}

// 7 Required Columns for the Kanban Board
export const SEVEN_KANBAN_STAGES: {
  id: InquiryStage;
  title: string;
  icon: React.ElementType;
  badge: {
    bg: string;
    text: string;
    border: string;
    dot: string;
    headerBadge: string;
  };
}[] = [
    {
      id: "New Inquiry",
      title: "New Inquiry",
      icon: Sparkles,
      badge: {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        dot: "bg-rose-500",
        headerBadge: "bg-rose-100 text-rose-800 border-rose-200",
      },
    },
    {
      id: "Contacted",
      title: "Contacted",
      icon: PhoneCall,
      badge: {
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
        dot: "bg-amber-500",
        headerBadge: "bg-amber-100 text-amber-800 border-amber-200",
      },
    },
    {
      id: "Needs Discussion",
      title: "Needs Discussion",
      icon: MessageSquare,
      badge: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        dot: "bg-purple-500",
        headerBadge: "bg-purple-100 text-purple-800 border-purple-200",
      },
    },
    {
      id: "CMA Coordination",
      title: "CMA Coordination",
      icon: FileCheck2,
      badge: {
        bg: "bg-sky-50",
        text: "text-sky-800",
        border: "border-sky-200",
        dot: "bg-sky-600",
        headerBadge: "bg-sky-100 text-sky-800 border-sky-200",
      },
    },
    {
      id: "Family Decision",
      title: "Family Decision",
      icon: ThumbsUp,
      badge: {
        bg: "bg-teal-50",
        text: "text-teal-800",
        border: "border-teal-200",
        dot: "bg-teal-600",
        headerBadge: "bg-teal-100 text-teal-800 border-teal-200",
      },
    },
    {
      id: "Converted",
      title: "Converted",
      icon: CheckCircle2,
      badge: {
        bg: "bg-[#E3F1D9]",
        text: "text-[#1E5622]",
        border: "border-[#3D6B22]/20",
        dot: "bg-[#3D6B22]",
        headerBadge: "bg-[#E8F2E4] text-[#1E5622] border-[#93C573]/30",
      },
    },
    {
      id: "Closed",
      title: "Closed",
      icon: Archive,
      badge: {
        bg: "bg-slate-100",
        text: "text-slate-600",
        border: "border-slate-200",
        dot: "bg-slate-400",
        headerBadge: "bg-slate-200 text-slate-700 border-slate-300",
      },
    },
  ];

const STAGE_CONFIG_MAP = new Map(
  SEVEN_KANBAN_STAGES.map((col) => [col.id, col])
);

// Normalizes legacy or aliased stage names into one of the 7 Kanban stages
export function normalizeStage(stage: InquiryStage): InquiryStage {
  if (stage === "New Lead") return "New Inquiry";
  if (stage === "In Assessment") return "Needs Discussion";
  if (stage === "CM Coordination") return "CMA Coordination";
  return stage;
}

const formatShortProgram = (program: string): string => {
  if (program.includes("CCSP")) return "CCSP Waiver";
  if (program.includes("SOURCE")) return "SOURCE Waiver";
  if (program.includes("Private Pay")) return "Private Pay";
  if (program.includes("VA")) return "VA Benefits";
  if (program.includes("GAPP")) return "GAPP Pediatric";
  if (program.includes("SFC")) return "Medicaid SFC";
  return program.split("(")[0].trim() || program;
};

export function InquiryManagementWorkspace({
  inquiries: initialInquiries,
  selectedStageFilter,
  onSelectStageFilter,
  urgentOnly = false,
  baseDetailsPath = "/intake/pipeline",
}: InquiryManagementWorkspaceProps) {
  const router = useRouter();

  // Internal mutable state for drag & drop or quick stage movements
  const [items, setItems] = useState<InquiryRecord[]>(initialInquiries);
  useEffect(() => {
    setItems(initialInquiries);
  }, [initialInquiries]);

  // View Mode: Supports both a proper Kanban board view and a List view
  const [viewMode, setViewMode] = useState<"kanban" | "list">("list");
  const [pipelineTab, setPipelineTab] = useState<"OPEN" | "CONVERTED" | "ARCHIVED">("OPEN");
  const [searchQuery, setSearchQuery] = useState("");
  const [tabFilter, setTabFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");

  // Sync pipelineTab when KPI selects Converted or Urgent
  useEffect(() => {
    if (selectedStageFilter === "Converted") {
      setPipelineTab("CONVERTED");
    } else if (selectedStageFilter === "Closed") {
      setPipelineTab("ARCHIVED");
    } else if (urgentOnly) {
      setPipelineTab("OPEN");
    }
  }, [selectedStageFilter, urgentOnly]);

  // Drag and drop state
  const [draggedInquiryId, setDraggedInquiryId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<InquiryStage | null>(null);

  // Quick move active dropdown
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Stage filter dropdown open state
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const stageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        stageDropdownRef.current &&
        !stageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStageDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentStage =
    selectedStageFilter || (tabFilter !== "ALL" ? (tabFilter as InquiryStage) : null);

  // Filtered inquiries based on pipelineTab, search, stage, priority, and source
  const filteredInquiries = useMemo(() => {
    return items.filter((item) => {
      const itemStage = normalizeStage(item.stage);

      if (pipelineTab === "OPEN") {
        if (itemStage === "Converted" || itemStage === "Closed") return false;
      } else if (pipelineTab === "CONVERTED") {
        if (itemStage !== "Converted") return false;
      } else if (pipelineTab === "ARCHIVED") {
        if (itemStage !== "Closed") return false;
      }

      if (urgentOnly && item.urgency !== "Urgent" && item.urgency !== "Immediate") {
        return false;
      }

      if (currentStage && itemStage !== currentStage) {
        return false;
      }

      if (priorityFilter !== "ALL") {
        const isUrgentItem = item.urgency === "Urgent" || item.urgency === "Immediate";
        if (priorityFilter === "Urgent" && !isUrgentItem) return false;
        if (priorityFilter === "Standard" && isUrgentItem) return false;
      }

      if (sourceFilter !== "ALL") {
        const src = `${item.source} ${item.referralInfo?.source || ""} ${item.referralInfo?.organization || ""}`.toLowerCase();
        if (sourceFilter === "Hospital" && !src.includes("hospital") && !src.includes("discharge")) return false;
        if (sourceFilter === "Physician" && !src.includes("physician") && !src.includes("doctor") && !src.includes("clinic")) return false;
        if (sourceFilter === "Family" && !src.includes("family") && !src.includes("self") && !src.includes("phone") && !src.includes("web")) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesFamily = item.familyName.toLowerCase().includes(query);
        const matchesClient = item.familyInfo.clientInfo.name.toLowerCase().includes(query);
        const matchesContact = item.familyInfo.primaryContact.toLowerCase().includes(query);
        const matchesSource = item.source.toLowerCase().includes(query);
        const matchesProgram = item.careRequirements.programInterest.toLowerCase().includes(query);
        const matchesCoordinator = item.referralInfo.assignedCoordinator.name.toLowerCase().includes(query);
        if (
          !matchesId &&
          !matchesFamily &&
          !matchesClient &&
          !matchesContact &&
          !matchesSource &&
          !matchesProgram &&
          !matchesCoordinator
        ) {
          return false;
        }
      }

      return true;
    });
  }, [items, pipelineTab, urgentOnly, currentStage, priorityFilter, sourceFilter, searchQuery]);

  const tabCounts = useMemo(() => {
    let open = 0;
    let converted = 0;
    let archived = 0;
    items.forEach((item) => {
      const s = normalizeStage(item.stage);
      if (s === "Converted") converted += 1;
      else if (s === "Closed") archived += 1;
      else open += 1;
    });
    return { open, converted, archived };
  }, [items]);

  // Counts per stage for tabs and headers
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SEVEN_KANBAN_STAGES.forEach((col) => {
      counts[col.id] = 0;
    });
    items.forEach((item) => {
      const norm = normalizeStage(item.stage);
      if (counts[norm] !== undefined) {
        counts[norm] += 1;
      }
    });
    return counts;
  }, [items]);

  const getDetailsHref = (id: string) => {
    const cleanPath = baseDetailsPath.replace(/\/$/, "");
    return `${cleanPath}/${id}/`;
  };

  const handleRowClick = (id: string) => {
    router.push(getDetailsHref(id));
  };

  // Move inquiry between stages (used by drag & drop and quick menu)
  const handleMoveStage = (inquiryId: string, targetStage: InquiryStage) => {
    const targetItem = items.find((i) => i.id === inquiryId);
    if (!targetItem) return;

    const currentNormalized = normalizeStage(targetItem.stage);
    if (currentNormalized === targetStage) return;

    if (targetStage === "Converted") {
      convertInquiryToLiveEntities(inquiryId);
      const reloaded = getIntakeInquiriesFromStorage();
      setItems(reloaded);
      setActiveMenuId(null);
      toast.success(
        `Converted ${targetItem.familyName} and synchronized with Agency Admin (Client, Caregiver, & Household created)!`
      );
    } else {
      const updated = items.map((i) =>
        i.id === inquiryId ? { ...i, stage: targetStage } : i
      );
      setItems(updated);
      saveIntakeInquiriesToStorage(updated);
      syncInquiryStageToAdmin(inquiryId, targetStage);
      setActiveMenuId(null);
      toast.success(`Moved ${targetItem.familyName} to "${targetStage}"`);
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedInquiryId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stage: InquiryStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: InquiryStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const inquiryId = e.dataTransfer.getData("text/plain") || draggedInquiryId;
    if (inquiryId) {
      handleMoveStage(inquiryId, targetStage);
    }
    setDraggedInquiryId(null);
  };

  return (
    <section aria-label="Inquiry Management Workspace">
      {/* Unified Outer Container Card matching KPI and Dashboard container style (elevated, no mix with page BG) */}
      <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-5">
        {/* Workspace Header & Toolbar */}
        <div className="space-y-3 pb-4 border-b border-slate-100">
          {/* Pipeline Tabs: Open Pipeline vs Converted vs Archived */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-1 overflow-x-auto">
            {[
              { key: "OPEN" as const, label: "Open Pipeline", count: tabCounts.open },
              { key: "CONVERTED" as const, label: "Converted", count: tabCounts.converted },
              { key: "ARCHIVED" as const, label: "Archived / Closed", count: tabCounts.archived },
            ].map((tab) => {
              const isActive = pipelineTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setPipelineTab(tab.key);
                    setTabFilter("ALL");
                    onSelectStageFilter(null);
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${isActive
                    ? "border-[#3D6B22] text-[#3D6B22]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive
                      ? "bg-[#3D6B22]/10 text-[#3D6B22]"
                      : "bg-slate-100 text-slate-600"
                      }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Intake & Referral Pipeline
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Input */}
              <div className="relative w-full sm:w-64 md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search inquiry, family, coordinator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all shadow-xs"
                />
              </div>

              {/* Stage Filter Dropdown */}
              <div className="relative" ref={stageDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsStageDropdownOpen(!isStageDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  title="Filter inquiries by stage"
                >
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-400 font-normal hidden sm:inline">Stage:</span>
                  <span className="flex items-center gap-1.5 font-bold text-slate-900 truncate max-w-[130px]">
                    {currentStage ? (
                      <>
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${STAGE_CONFIG_MAP.get(currentStage)?.badge.dot || "bg-slate-400"
                            }`}
                        />
                        <span className="truncate">{currentStage}</span>
                      </>
                    ) : (
                      "All Stages"
                    )}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 shrink-0">
                    {currentStage ? stageCounts[currentStage] || 0 : items.length}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isStageDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {isStageDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100">
                      <span>Filter by Stage</span>
                      {currentStage && (
                        <button
                          type="button"
                          onClick={() => {
                            setTabFilter("ALL");
                            onSelectStageFilter(null);
                            setIsStageDropdownOpen(false);
                          }}
                          className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="py-1 max-h-72 overflow-y-auto">
                      {/* All Stages Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setTabFilter("ALL");
                          onSelectStageFilter(null);
                          setIsStageDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${!currentStage
                          ? "bg-slate-50 font-bold text-slate-900"
                          : "text-slate-700 hover:bg-slate-50"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                          <span>All Stages</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {items.length}
                          </span>
                          {!currentStage && <Check className="w-3.5 h-3.5 text-[#3D6B22]" />}
                        </div>
                      </button>

                      {/* 7 Configured Stage Options */}
                      {SEVEN_KANBAN_STAGES.map((col) => {
                        const isSelected = currentStage === col.id;
                        const count = stageCounts[col.id] || 0;

                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => {
                              setTabFilter(col.id);
                              onSelectStageFilter(col.id);
                              setIsStageDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${isSelected
                              ? "bg-slate-50 font-bold text-slate-900"
                              : "text-slate-700 hover:bg-slate-50"
                              }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${col.badge.dot}`} />
                              <span className="truncate">{col.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${col.badge.headerBadge}`}
                              >
                                {count}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#3D6B22]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter by Priority"
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20"
              >
                <option value="ALL">Priority: All</option>
                <option value="Urgent">Urgent / Immediate</option>
                <option value="Standard">Normal</option>
              </select>

              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                aria-label="Filter by Source"
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20"
              >
                <option value="ALL">Source: All</option>
                <option value="Hospital">Hospital Discharge</option>
                <option value="Physician">Physician / Clinic</option>
                <option value="Family">Family / Self</option>
              </select>

              {/* View Mode Toggle: Kanban Board vs List View */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("kanban")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === "kanban"
                    ? "bg-white text-[#3D6B22] shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                    }`}
                  title="Kanban Board View (7 Columns)"
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Kanban</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === "list"
                    ? "bg-white text-[#3D6B22] shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                    }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area: Kanban Board vs List View */}
        {viewMode === "kanban" ? (
          /* PROPER KANBAN BOARD VIEW (7 Columns with clean, scannable cards) */
          <div className="w-full overflow-x-auto pb-3 pt-1 no-scrollbar sm:scrollbar-thin">
            <div className="flex gap-3.5 min-w-[1400px] items-start">
              {SEVEN_KANBAN_STAGES.map((col) => {
                const columnInquiries = filteredInquiries.filter(
                  (i) => normalizeStage(i.stage) === col.id
                );
                const isDragOver = dragOverStage === col.id;
                const isFilteredStage = currentStage === col.id;

                return (
                  <div
                    key={col.id}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`w-[290px] shrink-0 flex flex-col rounded-2xl border transition-all duration-300 ${isDragOver
                      ? "bg-emerald-50/70 border-[#3D6B22] ring-2 ring-[#3D6B22]/30 shadow-md"
                      : isFilteredStage
                        ? "bg-[#EEF4F0] border-[#3D6B22]/60 ring-1 ring-[#3D6B22]/20"
                        : "bg-[#F8FAF9] border-slate-200/80"
                      }`}
                  >
                    {/* Column Lane Header */}
                    <div className="p-3 border-b border-slate-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${col.badge.dot}`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 truncate">
                          {col.title}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 bg-white ${col.badge.text} ${col.badge.border} shadow-2xs`}
                      >
                        {columnInquiries.length}
                      </span>
                    </div>

                    {/* Card List Stack */}
                    <div className="p-2.5 space-y-2.5 min-h-[440px] flex flex-col">
                      {columnInquiries.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-slate-300/70 rounded-xl text-center bg-white/40">
                          <Inbox className="w-5 h-5 text-slate-300 mb-1" />
                          <span className="text-xs font-medium text-slate-400">
                            No inquiries
                          </span>
                        </div>
                      ) : (
                        columnInquiries.map((inquiry) => {
                          const isDragging = draggedInquiryId === inquiry.id;
                          const isUrgent =
                            inquiry.urgency === "Urgent" || inquiry.urgency === "Immediate";

                          return (
                            <div
                              key={inquiry.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, inquiry.id)}
                              onClick={() => router.push(getDetailsHref(inquiry.id))}
                              className={`group text-left focus:outline-none cursor-pointer w-full bg-white rounded-xl p-3 border border-slate-200 shadow-xs hover:shadow-md hover:border-[#3D6B22]/50 transition-all duration-200 relative overflow-hidden flex flex-col justify-between select-none ${isDragging ? "opacity-40 scale-95 ring-2 ring-[#3D6B22]" : ""
                                }`}
                            >
                              <div>
                                {/* Top Row: Family Name + Urgent Chip */}
                                <div className="flex items-start justify-between gap-1.5 mb-1">
                                  <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#3D6B22] transition-colors leading-tight truncate flex-1">
                                    {inquiry.familyName}
                                  </h4>
                                  {isUrgent && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                                      Urgent
                                    </span>
                                  )}
                                </div>

                                {/* Loved One: Eleanor Miller (78y) */}
                                <p className="text-xs text-slate-500 truncate">
                                  {inquiry.familyInfo.clientInfo.name}
                                  <span className="text-slate-400 font-normal"> ({inquiry.familyInfo.clientInfo.age}y)</span>
                                </p>

                                {/* Tags: Care Volume */}
                                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    Requested Volume
                                  </span>
                                  <span className="text-[10px] text-slate-700 font-semibold shrink-0">
                                    {inquiry.careRequirements.hoursPerWeek}h/wk
                                  </span>
                                </div>
                              </div>

                              {/* Footer: Coordinator + Quick Actions */}
                              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                <span className="truncate max-w-[140px] text-slate-500 text-[11px]">
                                  Coord: <span className="text-slate-700 font-medium">{inquiry.referralInfo.assignedCoordinator.name.split(" ")[0]}</span>
                                </span>

                                <div
                                  className="flex items-center gap-1 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* Quick Move Stage dropdown */}
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActiveMenuId(
                                          activeMenuId === inquiry.id ? null : inquiry.id
                                        )
                                      }
                                      title="Move to another stage"
                                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>

                                    {activeMenuId === inquiry.id && (
                                      <div className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                                          Move Stage
                                        </div>
                                        {SEVEN_KANBAN_STAGES.map((s) => {
                                          const isCurrent =
                                            normalizeStage(inquiry.stage) === s.id;
                                          return (
                                            <button
                                              key={s.id}
                                              type="button"
                                              onClick={() =>
                                                handleMoveStage(inquiry.id, s.id)
                                              }
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                                            >
                                              <span className="flex items-center gap-1.5">
                                                <span
                                                  className={`w-1.5 h-1.5 rounded-full ${s.badge.dot}`}
                                                />
                                                <span>{s.title}</span>
                                              </span>
                                              {isCurrent && (
                                                <Check className="w-3.5 h-3.5 text-[#3D6B22]" />
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>

                                  {/* ArrowUpRight hover indicator */}
                                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 opacity-60 group-hover:opacity-100 group-hover:text-[#3D6B22] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 pl-5">Prospect</th>
                    <th className="py-3.5 px-3">Referral Source</th>
                    <th className="py-3.5 px-3">Referral Date</th>
                    <th className="py-3.5 px-3">Payer / Program</th>
                    <th className="py-3.5 px-3">Requested Services</th>
                    <th className="py-3.5 px-3">Priority</th>
                    <th className="py-3.5 px-3">Stage</th>
                    <th className="py-3.5 px-3">Coordinator / RN</th>
                    <th className="py-3.5 px-4 pr-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredInquiries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-medium text-slate-700">
                          No referrals found
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Try adjusting your search query or filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredInquiries.map((inquiry) => {
                      const normStage = normalizeStage(inquiry.stage);
                      const colConfig =
                        STAGE_CONFIG_MAP.get(normStage) || SEVEN_KANBAN_STAGES[0];
                      const detailsHref = getDetailsHref(inquiry.id);
                      const priorityLabel =
                        inquiry.urgency === "Immediate" || inquiry.urgency === "Urgent"
                          ? "Urgent"
                          : "Normal";

                      return (
                        <tr
                          key={inquiry.id}
                          onClick={() => handleRowClick(inquiry.id)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4 pl-5">
                            <Link
                              href={detailsHref}
                              className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors block text-xs whitespace-nowrap"
                            >
                              {inquiry.familyInfo.clientInfo.name || inquiry.familyName}
                            </Link>
                          </td>

                          <td className="py-3.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                            {inquiry.referralInfo?.organization || inquiry.source}
                          </td>

                          <td className="py-3.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                            {inquiry.dateReceived}
                          </td>

                          <td className="py-3.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                            {formatShortProgram(inquiry.careRequirements.programInterest)}
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20 whitespace-nowrap">
                              {inquiry.careRequirements.careType || "In-Home Care"} · {inquiry.careRequirements.hoursPerWeek}h/wk
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${priorityLabel === "Urgent"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                            >
                              {priorityLabel}
                            </span>
                          </td>

                          <td
                            className="py-3.5 px-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={normStage}
                              onChange={(e) =>
                                handleMoveStage(
                                  inquiry.id,
                                  e.target.value as InquiryStage
                                )
                              }
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3D6B22] ${colConfig.badge.bg} ${colConfig.badge.text} ${colConfig.badge.border}`}
                            >
                              {SEVEN_KANBAN_STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.title}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="py-3.5 px-3 text-slate-800 font-medium whitespace-nowrap">
                            {inquiry.referralInfo.assignedCoordinator.name}
                          </td>

                          <td
                            className="py-3.5 px-4 pr-5 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {normStage === "Converted" && inquiry.onboardingStatus?.clientProfileId ? (
                                <Link
                                  href={`/intake/clients/${inquiry.onboardingStatus.clientProfileId}`}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                                >
                                  <span>Client Profile</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              ) : (
                                <Link
                                  href={detailsHref}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-[#F2F8EE] border border-slate-200 hover:border-[#3D6B22]/40 text-slate-700 hover:text-[#3D6B22] rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                                >
                                  <span>Details</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-[#3D6B22]" />
                                </Link>
                              )}
                              <Link
                                href={`${detailsHref.replace(/\/$/, "")}/edit`}
                                title="Edit Inquiry"
                                className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 hover:bg-emerald-50/60 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
