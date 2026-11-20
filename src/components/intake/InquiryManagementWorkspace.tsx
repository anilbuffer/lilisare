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
  Users,
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
} from "lucide-react";
import { toast } from "sonner";

interface InquiryManagementWorkspaceProps {
  inquiries: InquiryRecord[];
  selectedStageFilter: InquiryStage | null;
  onSelectStageFilter: (stage: InquiryStage | null) => void;
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
  baseDetailsPath = "/intake/pipeline",
}: InquiryManagementWorkspaceProps) {
  const router = useRouter();

  // Internal mutable state for drag & drop or quick stage movements
  const [items, setItems] = useState<InquiryRecord[]>(initialInquiries);
  useEffect(() => {
    setItems(initialInquiries);
  }, [initialInquiries]);

  // View Mode: Supports both a proper Kanban board view and a List view
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [tabFilter, setTabFilter] = useState<string>("ALL");

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

  // Filtered inquiries based on search and stage filter
  const filteredInquiries = useMemo(() => {
    return items.filter((item) => {
      const itemStage = normalizeStage(item.stage);

      if (currentStage && itemStage !== currentStage) {
        return false;
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
  }, [items, currentStage, searchQuery]);

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

    setItems((prev) =>
      prev.map((i) => (i.id === inquiryId ? { ...i, stage: targetStage } : i))
    );

    setActiveMenuId(null);
    toast.success(`Moved ${targetItem.familyName} to "${targetStage}"`);
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
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-5">
        {/* Workspace Header & Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Inquiry Management
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
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          STAGE_CONFIG_MAP.get(currentStage)?.badge.dot || "bg-slate-400"
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
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isStageDropdownOpen ? "rotate-180" : ""
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
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        !currentStage
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
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
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

            {/* View Mode Toggle: Kanban Board vs List View */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "kanban"
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "list"
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

        {/* Main Content Area: Kanban Board vs List View */}
        {viewMode === "kanban" ? (
          /* PROPER KANBAN BOARD VIEW (7 Columns with clear lane contrast) */
          <div className="w-full overflow-x-auto pb-3 pt-1 no-scrollbar sm:scrollbar-thin">
            <div className="flex gap-4 min-w-[1450px] items-start">
              {SEVEN_KANBAN_STAGES.map((col) => {
                const columnInquiries = filteredInquiries.filter(
                  (i) => normalizeStage(i.stage) === col.id
                );
                const isDragOver = dragOverStage === col.id;
                const isFilteredStage = currentStage === col.id;
                const Icon = col.icon;

                return (
                  <div
                    key={col.id}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`w-[305px] shrink-0 flex flex-col rounded-2xl border transition-all duration-300 ${
                      isDragOver
                        ? "bg-emerald-50/70 border-[#3D6B22] ring-2 ring-[#3D6B22]/30 shadow-md"
                        : isFilteredStage
                        ? "bg-[#EEF4F0] border-[#3D6B22]/60 ring-1 ring-[#3D6B22]/20"
                        : "bg-[#F4F7F5] border-slate-200/80"
                    }`}
                  >
                    {/* Column Lane Header */}
                    <div className="p-3.5 border-b border-slate-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${col.badge.dot}`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 truncate">
                          {col.title}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold border shrink-0 bg-white ${col.badge.text} ${col.badge.border} shadow-2xs`}
                      >
                        {columnInquiries.length}
                      </span>
                    </div>

                    {/* Card List Stack */}
                    <div className="p-3 space-y-3 min-h-[440px] flex flex-col">
                      {columnInquiries.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-slate-300/80 rounded-2xl text-center bg-white/40">
                          <Inbox className="w-6 h-6 text-slate-300 mb-1" />
                          <span className="text-xs font-medium text-slate-400">
                            No inquiries
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Drag card here
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
                              className={`group text-left focus:outline-none cursor-pointer w-full bg-white backdrop-blur-xl rounded-2xl p-4 border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:border-[#3D6B22]/60 transition-all duration-300 relative overflow-hidden flex flex-col justify-between select-none ${
                                isDragging ? "opacity-40 scale-95 ring-2 ring-[#3D6B22]" : ""
                              }`}
                            >
                              {/* Card Body matching KPI Card structure */}
                              <div>
                                {/* Top Row: Title + Animated Icon Container (exact KPI DNA) */}
                                <div className="flex items-start justify-between gap-2 mb-2.5">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors leading-snug truncate">
                                        {inquiry.familyName}
                                      </h4>
                                      {isUrgent && (
                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200/60 shrink-0">
                                          Urgent
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                                      <span className="font-mono font-medium text-slate-500">
                                        {inquiry.id}
                                      </span>
                                      <span>•</span>
                                      <span className="truncate">{inquiry.branch}</span>
                                    </div>
                                  </div>

                                  {/* Icon container styled exactly like KPI Strip icon */}
                                  <div
                                    className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shrink-0 ${
                                      isUrgent
                                        ? "bg-rose-100 text-rose-700"
                                        : col.badge.headerBadge
                                    }`}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                </div>

                                {/* Loved One Snippet Box */}
                                <div className="py-2 px-2.5 bg-slate-50/90 rounded-xl border border-slate-100 mb-2.5 flex items-center justify-between text-xs">
                                  <span className="text-slate-500 text-[11px] flex items-center gap-1.5 shrink-0">
                                    <Users className="w-3.5 h-3.5 text-[#3D6B22] shrink-0" />
                                    Loved One:
                                  </span>
                                  <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                                    {inquiry.familyInfo.clientInfo.name}{" "}
                                    <span className="text-slate-400 font-normal">
                                      ({inquiry.familyInfo.clientInfo.age}y)
                                    </span>
                                  </span>
                                </div>

                                {/* Tags Row */}
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className="text-[10px] font-semibold bg-[#E3F1D9] text-[#1E5622] px-2 py-0.5 rounded-lg border border-[#3D6B22]/20 truncate">
                                    {formatShortProgram(inquiry.careRequirements.programInterest)}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200/60 shrink-0">
                                    {inquiry.careRequirements.hoursPerWeek} hrs/wk
                                  </span>
                                </div>
                              </div>

                              {/* Card Footer: Coordinator/Date + Stage Dropdown & Hover ArrowUpRight */}
                              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                <span className="truncate max-w-[130px] text-slate-500 font-medium">
                                  {inquiry.referralInfo.assignedCoordinator.name.split(" ")[0]} ·{" "}
                                  {inquiry.dateReceived}
                                </span>

                                <div
                                  className="flex items-center gap-1.5 shrink-0"
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
                                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>

                                    {activeMenuId === inquiry.id && (
                                      <div className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
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

                                  {/* ArrowUpRight with hover reveal matching KPI card */}
                                  <div className="inline-flex items-center gap-0.5 font-semibold text-xs text-[#3D6B22]">
                                    <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-60 group-hover:opacity-100 group-hover:text-[#3D6B22] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                  </div>
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
          <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 pl-6">Family & Loved One</th>
                    <th className="py-3.5 px-3">Inquiry ID</th>
                    <th className="py-3.5 px-3">Program</th>
                    <th className="py-3.5 px-3">Hours</th>
                    <th className="py-3.5 px-3">Stage</th>
                    <th className="py-3.5 px-3">Coordinator</th>
                    <th className="py-3.5 px-3">Received</th>
                    <th className="py-3.5 px-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredInquiries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-medium text-slate-700">
                          No inquiries found
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Try adjusting your search query or stage filter.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredInquiries.map((inquiry) => {
                      const normStage = normalizeStage(inquiry.stage);
                      const colConfig =
                        STAGE_CONFIG_MAP.get(normStage) || SEVEN_KANBAN_STAGES[0];
                      const detailsHref = getDetailsHref(inquiry.id);

                      return (
                        <tr
                          key={inquiry.id}
                          onClick={() => handleRowClick(inquiry.id)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4 pl-6">
                            <Link
                              href={detailsHref}
                              className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors block text-xs"
                            >
                              {inquiry.familyName}
                            </Link>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {inquiry.familyInfo.clientInfo.name} (
                              {inquiry.familyInfo.clientInfo.age}y) • {inquiry.branch}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-mono font-medium text-slate-700">
                            {inquiry.id}
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="text-[11px] font-medium bg-[#E3F1D9] text-[#1E5622] px-2.5 py-0.5 rounded-full border border-[#3D6B22]/20 inline-block">
                              {formatShortProgram(
                                inquiry.careRequirements.programInterest
                              )}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-semibold text-slate-800">
                            {inquiry.careRequirements.hoursPerWeek} hrs/wk
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

                          <td className="py-3.5 px-3 text-slate-700">
                            <div className="font-medium text-slate-800">
                              {inquiry.referralInfo.assignedCoordinator.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {inquiry.source}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                            {inquiry.dateReceived}
                          </td>

                          <td
                            className="py-3.5 px-4 pr-6 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              href={detailsHref}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-[#F2F8EE] border border-slate-200 hover:border-[#3D6B22]/40 text-slate-700 hover:text-[#3D6B22] rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                            >
                              <span>Details</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#3D6B22]" />
                            </Link>
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
