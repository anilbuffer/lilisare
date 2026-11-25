"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Kanban,
  List,
  Filter,
  FilterX,
  ChevronDown,
  Check,
  Inbox,
  Sparkles,
  PhoneCall,
  Calendar,
  GraduationCap,
  ThumbsUp,
  FileCheck2,
  CheckCircle2,
  Archive,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Users,
  Home,
  User,
  AlertTriangle,
} from "lucide-react";
import {
  CaregiverRecord,
  CaregiverPipelineStage,
  CaregiverType,
  CaregiverStatus,
  CredentialStatus,
} from "@/types/caregiver";
import { saveCaregiversToStorage } from "@/lib/caregivers/mockData";
import { toast } from "sonner";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";

interface CaregiverManagementWorkspaceProps {
  caregivers: CaregiverRecord[];
  selectedStatusFilter: string | null;
  onSelectStatusFilter: (status: string | null) => void;
  selectedCaregiverId: string | null;
  onSelectCaregiver: (caregiver: CaregiverRecord) => void;
  activeAttentionCategory: string | null;
  onClearAttentionCategory: () => void;
  baseDetailsPath?: string;
  initialViewMode?: "kanban" | "list";
}

// 8 Required Columns for the Caregiver Kanban Board
export const EIGHT_CAREGIVER_KANBAN_STAGES: {
  id: CaregiverPipelineStage;
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
      id: "New Application",
      title: "New Application",
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
      id: "Phone Screened",
      title: "Phone Screened",
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
      id: "Interview Scheduled",
      title: "Interview Scheduled",
      icon: Calendar,
      badge: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        dot: "bg-purple-500",
        headerBadge: "bg-purple-100 text-purple-800 border-purple-200",
      },
    },
    {
      id: "Training",
      title: "Training",
      icon: GraduationCap,
      badge: {
        bg: "bg-blue-50",
        text: "text-blue-800",
        border: "border-blue-200",
        dot: "bg-blue-600",
        headerBadge: "bg-blue-100 text-blue-800 border-blue-200",
      },
    },
    {
      id: "Hiring Decision",
      title: "Hiring Decision",
      icon: ThumbsUp,
      badge: {
        bg: "bg-sky-50",
        text: "text-sky-800",
        border: "border-sky-200",
        dot: "bg-sky-600",
        headerBadge: "bg-sky-100 text-sky-800 border-sky-200",
      },
    },
    {
      id: "Offer Extended",
      title: "Offer Extended",
      icon: FileCheck2,
      badge: {
        bg: "bg-teal-50",
        text: "text-teal-800",
        border: "border-teal-200",
        dot: "bg-teal-600",
        headerBadge: "bg-teal-100 text-teal-800 border-teal-200",
      },
    },
    {
      id: "Hired & Onboarding",
      title: "Hired & Onboarding",
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
      id: "Archived",
      title: "Archived",
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
  EIGHT_CAREGIVER_KANBAN_STAGES.map((col) => [col.id, col])
);

// Safely normalize or fallback caregiver records into the 8 Kanban stages
export function normalizeCaregiverStage(cg: CaregiverRecord): CaregiverPipelineStage {
  if (cg.pipelineStage) return cg.pipelineStage;
  if (cg.status === "Inactive" || cg.status === "On Hold") return "Archived";
  if (cg.status === "Active") return "Hired & Onboarding";
  if (cg.status === "Onboarding") return "Training";
  if (cg.status === "Pending") return "Phone Screened";
  return "New Application";
}

export function CaregiverManagementWorkspace({
  caregivers: initialCaregivers,
  selectedStatusFilter,
  onSelectStatusFilter,
  selectedCaregiverId,
  onSelectCaregiver,
  activeAttentionCategory,
  onClearAttentionCategory,
  baseDetailsPath = "/caregivers",
  initialViewMode = "list",
}: CaregiverManagementWorkspaceProps) {
  const router = useRouter();
  const perms = usePortalPermissions();

  // Internal mutable state for drag & drop or quick stage movements
  const [items, setItems] = useState<CaregiverRecord[]>(initialCaregivers);
  useEffect(() => {
    setItems(initialCaregivers);
  }, [initialCaregivers]);

  // View Mode: Supports both a proper Kanban board view and a List view (default: list view for fast scanning)
  const [viewMode, setViewMode] = useState<"kanban" | "list">(initialViewMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [tabFilter, setTabFilter] = useState<string>("ALL");

  // Drag and drop state
  const [draggedCaregiverId, setDraggedCaregiverId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<CaregiverPipelineStage | null>(null);

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
    selectedStatusFilter || (tabFilter !== "ALL" ? (tabFilter as CaregiverPipelineStage) : null);

  // Filtered Caregivers based on search, stage, and attention category
  const filteredCaregivers = useMemo(() => {
    return items.filter((cg) => {
      const stage = normalizeCaregiverStage(cg);

      // 1. Attention category filter (if triggered from top Attention section)
      if (activeAttentionCategory) {
        if (activeAttentionCategory === "expired_credentials") {
          const hasExpired =
            cg.documentsCredentials?.overallStatus === "Expired" ||
            cg.documentsCredentials?.items?.some((i) => i.status === "Expired") ||
            cg.status === "On Hold";
          if (!hasExpired) return false;
        } else if (activeAttentionCategory === "screening_pending") {
          const hasPendingScreening =
            cg.verificationChecklist?.screening !== "Cleared" ||
            cg.screeningTraining?.backgroundCheck?.status !== "Cleared" ||
            cg.status === "Pending";
          if (!hasPendingScreening) return false;
        } else if (activeAttentionCategory === "training_incomplete") {
          const hasTrainingIncomplete =
            cg.verificationChecklist?.training !== "Complete" ||
            cg.screeningTraining?.overallTrainingStatus !== "Complete";
          if (!hasTrainingIncomplete) return false;
        } else if (activeAttentionCategory === "missing_documents") {
          const hasMissing =
            cg.verificationChecklist?.cprFirstAid === "Missing" ||
            cg.documentsCredentials?.overallStatus === "Missing" ||
            cg.documentsCredentials?.items?.some((i) => i.status === "Missing");
          if (!hasMissing) return false;
        } else if (activeAttentionCategory === "ALL_ATTENTION") {
          const needsAnyAttention =
            cg.status === "On Hold" ||
            cg.status === "Pending" ||
            cg.documentsCredentials?.overallStatus === "Expired" ||
            cg.documentsCredentials?.overallStatus === "Missing" ||
            cg.verificationChecklist?.screening !== "Cleared" ||
            cg.verificationChecklist?.training !== "Complete";
          if (!needsAnyAttention) return false;
        }
      }

      // 2. Stage filter
      if (currentStage && currentStage !== "ALL") {
        if (stage !== currentStage) {
          return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = cg.name.toLowerCase().includes(query);
        const matchesId = cg.id.toLowerCase().includes(query);
        const matchesHousehold =
          cg.relationship?.linkedHousehold?.name?.toLowerCase().includes(query) ?? false;
        const matchesClient =
          cg.availabilityAssignments?.assignedClient?.name?.toLowerCase().includes(query) ?? false;
        const matchesBranch = cg.branch?.toLowerCase().includes(query) ?? false;
        const matchesType = cg.type?.toLowerCase().includes(query) ?? false;

        if (
          !matchesName &&
          !matchesId &&
          !matchesHousehold &&
          !matchesClient &&
          !matchesBranch &&
          !matchesType
        ) {
          return false;
        }
      }

      return true;
    });
  }, [items, currentStage, searchQuery, activeAttentionCategory]);

  // Counts per stage for tabs, headers, and counters
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    EIGHT_CAREGIVER_KANBAN_STAGES.forEach((col) => {
      counts[col.id] = 0;
    });
    items.forEach((item) => {
      const norm = normalizeCaregiverStage(item);
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

  // Move caregiver between stages (used by drag & drop and quick menu)
  const handleMoveStage = (caregiverId: string, targetStage: CaregiverPipelineStage) => {
    const targetItem = items.find((i) => i.id === caregiverId);
    if (!targetItem) return;

    if (
      (targetStage === "Hired & Onboarding" || targetStage === "Archived") &&
      !perms.caregivers.canActivate
    ) {
      toast.error("Caregiver activation and archiving require Agency Admin approval.");
      setActiveMenuId(null);
      return;
    }

    const currentNormalized = normalizeCaregiverStage(targetItem);
    if (currentNormalized === targetStage) return;

    const updated = items.map((i) => {
      if (i.id === caregiverId) {
        // Also update status intuitively if moving into Hired or Archived
        let newStatus: CaregiverStatus = i.status;
        if (targetStage === "Hired & Onboarding") newStatus = "Active";
        else if (targetStage === "Archived") newStatus = "Inactive";
        else if (targetStage === "Training") newStatus = "Onboarding";
        else if (targetStage === "New Application" || targetStage === "Phone Screened") newStatus = "Pending";

        return { ...i, pipelineStage: targetStage, status: newStatus };
      }
      return i;
    });

    setItems(updated);
    saveCaregiversToStorage(updated);
    setActiveMenuId(null);
    toast.success(`Moved ${targetItem.name} to "${targetStage}"`);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCaregiverId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stage: CaregiverPipelineStage) => {
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

  const handleDrop = (e: React.DragEvent, targetStage: CaregiverPipelineStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const caregiverId = e.dataTransfer.getData("text/plain") || draggedCaregiverId;
    if (caregiverId) {
      handleMoveStage(caregiverId, targetStage);
    }
    setDraggedCaregiverId(null);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setTabFilter("ALL");
    onSelectStatusFilter(null);
    onClearAttentionCategory();
  };

  const getTypeBadge = (type: CaregiverType) => {
    switch (type) {
      case "Family Caregiver":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Live-In Caregiver":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "Family Friend":
        return "bg-purple-50 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <section aria-label="Caregiver Management Workspace">
      {/* Unified Outer Container Card strictly matching Intake & Referrals (/intake/pipeline/) */}
      <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-5">
        {/* Workspace Header & Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Caregiver Management
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search caregiver, ID, household..."
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
                title="Filter caregivers by stage"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400 font-normal hidden sm:inline">Stage:</span>
                <span className="flex items-center gap-1.5 font-bold text-slate-900 truncate max-w-[130px]">
                  {currentStage && currentStage !== "ALL" ? (
                    <>
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${STAGE_CONFIG_MAP.get(currentStage as CaregiverPipelineStage)?.badge.dot ||
                          "bg-slate-400"
                          }`}
                      />
                      <span className="truncate">{currentStage}</span>
                    </>
                  ) : (
                    "All Stages"
                  )}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 shrink-0">
                  {currentStage && currentStage !== "ALL"
                    ? stageCounts[currentStage] || 0
                    : items.length}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isStageDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isStageDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100">
                    <span>Filter by Stage</span>
                    {currentStage && currentStage !== "ALL" && (
                      <button
                        type="button"
                        onClick={() => {
                          setTabFilter("ALL");
                          onSelectStatusFilter(null);
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
                        onSelectStatusFilter(null);
                        setIsStageDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${!currentStage || currentStage === "ALL"
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
                        {(!currentStage || currentStage === "ALL") && (
                          <Check className="w-3.5 h-3.5 text-[#3D6B22]" />
                        )}
                      </div>
                    </button>

                    {/* 8 Configured Stage Options */}
                    {EIGHT_CAREGIVER_KANBAN_STAGES.map((col) => {
                      const isSelected = currentStage === col.id;
                      const count = stageCounts[col.id] || 0;

                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            setTabFilter(col.id);
                            onSelectStatusFilter(col.id);
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

            {/* View Mode Toggle: Kanban Board vs List View */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === "kanban"
                  ? "bg-white text-[#3D6B22] shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
                  }`}
                title="Kanban Board View (8 Columns)"
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

        {/* Active Attention Banner if filtering by attention category */}
        {activeAttentionCategory && (
          <div className="flex items-center justify-between bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-800 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>
                Filtering:{" "}
                {activeAttentionCategory === "expired_credentials"
                  ? "Expired Credentials"
                  : activeAttentionCategory === "screening_pending"
                    ? "Screening Pending"
                    : activeAttentionCategory === "training_incomplete"
                      ? "Training Incomplete"
                      : activeAttentionCategory === "missing_documents"
                        ? "Missing Documents"
                        : "All Issues"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClearAttentionCategory}
              className="text-rose-700 hover:text-rose-950 hover:underline font-bold text-xs cursor-pointer ml-2"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Main Content Area: Kanban Board vs List View */}
        {viewMode === "kanban" ? (
          /* PROPER KANBAN BOARD VIEW (8 Columns with clean, scannable cards) */
          <div className="w-full overflow-x-auto pb-3 pt-1 no-scrollbar sm:scrollbar-thin">
            <div className="flex gap-3.5 min-w-[1680px] items-start">
              {EIGHT_CAREGIVER_KANBAN_STAGES.map((col) => {
                const columnCaregivers = filteredCaregivers.filter(
                  (c) => normalizeCaregiverStage(c) === col.id
                );
                const isDragOver = dragOverStage === col.id;
                const isFilteredStage = currentStage === col.id;

                return (
                  <div
                    key={col.id}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`w-[280px] shrink-0 flex flex-col rounded-2xl border transition-all duration-300 ${isDragOver
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
                        {columnCaregivers.length}
                      </span>
                    </div>

                    {/* Card List Stack */}
                    <div className="p-2.5 space-y-2.5 min-h-[440px] flex flex-col">
                      {columnCaregivers.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-slate-300/70 rounded-xl text-center bg-white/40">
                          <Inbox className="w-5 h-5 text-slate-300 mb-1" />
                          <span className="text-xs font-medium text-slate-400">
                            No caregivers
                          </span>
                        </div>
                      ) : (
                        columnCaregivers.map((cg) => {
                          const isDragging = draggedCaregiverId === cg.id;
                          const hasAttention =
                            cg.status === "On Hold" ||
                            cg.documentsCredentials?.overallStatus === "Expired" ||
                            cg.documentsCredentials?.overallStatus === "Missing" ||
                            cg.verificationChecklist?.screening !== "Cleared";
                          const hours =
                            cg.availabilityAssignments?.scheduledWeeklyHours ||
                            cg.availabilityAssignments?.weeklyCapacityHours ||
                            40;
                          const detailsHref = getDetailsHref(cg.id);

                          return (
                            <div
                              key={cg.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, cg.id)}
                              onClick={() => router.push(detailsHref)}
                              className={`group text-left focus:outline-none cursor-pointer w-full bg-white rounded-xl p-3 border border-slate-200 shadow-xs hover:shadow-md hover:border-[#3D6B22]/50 transition-all duration-200 relative overflow-hidden flex flex-col justify-between select-none ${isDragging ? "opacity-40 scale-95 ring-2 ring-[#3D6B22]" : ""
                                }`}
                            >
                              <div>
                                {/* Top Row: Name & Attention Badge */}
                                <div className="flex items-start justify-between gap-1.5 mb-1">
                                  <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#3D6B22] transition-colors leading-tight truncate flex-1">
                                    {cg.name}
                                  </h4>
                                  {hasAttention && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                                      Action Req
                                    </span>
                                  )}
                                </div>

                                {/* Subtitle: Linked Household */}
                                <p className="text-xs text-slate-500 truncate">
                                  Household: <span className="text-slate-700 font-medium">{cg.relationship?.linkedHousehold?.name || "Unlinked"}</span>
                                </p>

                                {/* Tags: Scheduled Capacity */}
                                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    Scheduled Capacity
                                  </span>
                                  <span className="text-[10px] text-slate-700 font-semibold shrink-0">
                                    {hours}h/wk
                                  </span>
                                </div>
                              </div>

                              {/* Footer: Hire Date + Quick Move Stage dropdown + ArrowUpRight */}
                              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                <span className="truncate max-w-[140px] text-slate-500 text-[11px]">
                                  Hire Date: <span className="text-slate-700 font-medium">{cg.hireDate || "Recent"}</span>
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
                                        setActiveMenuId(activeMenuId === cg.id ? null : cg.id)
                                      }
                                      title="Move to another stage"
                                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>

                                    {activeMenuId === cg.id && (
                                      <div className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                                          Move Stage
                                        </div>
                                        {EIGHT_CAREGIVER_KANBAN_STAGES.map((s) => {
                                          const isCurrent = normalizeCaregiverStage(cg) === s.id;
                                          return (
                                            <button
                                              key={s.id}
                                              type="button"
                                              onClick={() => handleMoveStage(cg.id, s.id)}
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
          /* LIST VIEW strictly matching /intake/pipeline */
          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 pl-6">Caregiver</th>
                    <th className="py-3.5 px-3">Household</th>
                    <th className="py-3.5 px-3">Hours</th>
                    <th className="py-3.5 px-3">Stage</th>
                    <th className="py-3.5 px-3">Hire Date</th>
                    <th className="py-3.5 px-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredCaregivers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-medium text-slate-700">No caregivers found</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Try adjusting your search query or stage filter.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCaregivers.map((cg) => {
                      const normStage = normalizeCaregiverStage(cg);
                      const colConfig =
                        STAGE_CONFIG_MAP.get(normStage) || EIGHT_CAREGIVER_KANBAN_STAGES[0];
                      const detailsHref = getDetailsHref(cg.id);
                      const hours =
                        cg.availabilityAssignments?.scheduledWeeklyHours ||
                        cg.availabilityAssignments?.weeklyCapacityHours ||
                        40;

                      return (
                        <tr
                          key={cg.id}
                          onClick={() => handleRowClick(cg.id)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          {/* Caregiver Name & Avatar */}
                          <td className="py-3.5 px-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                {cg.avatarUrl ? (
                                  <img
                                    src={cg.avatarUrl}
                                    alt={cg.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <Link
                                href={detailsHref}
                                onClick={(e) => e.stopPropagation()}
                                className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors text-xs"
                              >
                                {cg.name}
                              </Link>
                            </div>
                          </td>

                          {/* Household */}
                          <td className="py-3.5 px-3 font-medium text-slate-800 text-xs truncate max-w-[150px]">
                            {cg.relationship?.linkedHousehold?.name || "Unlinked"}
                          </td>

                          {/* Hours */}
                          <td className="py-3.5 px-3 font-semibold text-slate-800">
                            {hours} hrs/wk
                          </td>

                          {/* Stage (Interactive Dropdown Select) */}
                          <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={normStage}
                              onChange={(e) =>
                                handleMoveStage(cg.id, e.target.value as CaregiverPipelineStage)
                              }
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3D6B22] ${colConfig.badge.bg} ${colConfig.badge.text} ${colConfig.badge.border}`}
                            >
                              {EIGHT_CAREGIVER_KANBAN_STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.title}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Hire Date */}
                          <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                            {cg.hireDate || "—"}
                          </td>

                          {/* Action Link */}
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
