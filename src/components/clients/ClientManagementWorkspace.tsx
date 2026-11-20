"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Kanban,
  List,
  Users,
  FilterX,
  ChevronRight,
  ShieldAlert,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Home,
  Heart,
  ChevronDown,
  Check,
  Filter,
  Sparkles,
  FileCheck2,
  CheckCircle2,
  Clock,
  Archive,
  Inbox,
  UserCheck,
} from "lucide-react";
import { ClientRecord } from "@/types/client";
import { toast } from "sonner";

export type ClientKanbanStage =
  | "Registration"
  | "Onboarding"
  | "Pending Auth"
  | "Active"
  | "On Hold / Discharged";

export const CLIENT_KANBAN_STAGES: {
  id: ClientKanbanStage;
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
      id: "Registration",
      title: "Registration",
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
      id: "Onboarding",
      title: "Onboarding",
      icon: Clock,
      badge: {
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
        dot: "bg-amber-500",
        headerBadge: "bg-amber-100 text-amber-800 border-amber-200",
      },
    },
    {
      id: "Pending Auth",
      title: "Pending Auth",
      icon: FileCheck2,
      badge: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        dot: "bg-purple-500",
        headerBadge: "bg-purple-100 text-purple-800 border-purple-200",
      },
    },
    {
      id: "Active",
      title: "Active Care",
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
      id: "On Hold / Discharged",
      title: "On Hold / Inactive",
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
  CLIENT_KANBAN_STAGES.map((col) => [col.id, col])
);

export function resolveClientStage(
  client: ClientRecord,
  overrides: Record<string, ClientKanbanStage>
): ClientKanbanStage {
  if (overrides[client.id]) {
    return overrides[client.id];
  }
  if (client.status === "Discharged" || client.status === "On Hold") {
    return "On Hold / Discharged";
  }
  if (client.readiness?.authorization === "Pending" || client.readiness?.authorization === "Missing") {
    return "Pending Auth";
  }
  if (client.status === "Onboarding") {
    return "Onboarding";
  }
  if (client.status === "Active") {
    return "Active";
  }
  return "Registration";
}

interface ClientManagementWorkspaceProps {
  clients: ClientRecord[];
  selectedStatusFilter: string | null;
  onSelectStatusFilter: (status: string | null) => void;
  selectedClientId: string | null;
  onSelectClient: (client: ClientRecord) => void;
}

const CARE_TYPE_OPTIONS = [
  { id: "ALL", label: "All Care Types" },
  { id: "Family Care", label: "Family Care" },
  { id: "Live-In Care", label: "Live-In Care" },
  { id: "Family Friend Care", label: "Family Friend Care" },
];

const formatShortProgram = (program?: string): string => {
  if (!program) return "General Care";
  if (program.includes("CCSP")) return "CCSP Waiver";
  if (program.includes("SOURCE")) return "SOURCE Waiver";
  if (program.includes("Private Pay")) return "Private Pay";
  if (program.includes("VA")) return "VA Aid & Attend";
  if (program.includes("GAPP")) return "GAPP Pediatric";
  return program.split("(")[0].trim() || program;
};

export function ClientManagementWorkspace({
  clients,
  selectedStatusFilter,
  onSelectStatusFilter,
  selectedClientId,
  onSelectClient,
}: ClientManagementWorkspaceProps) {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCareType, setSelectedCareType] = useState("ALL");
  const [stageOverrides, setStageOverrides] = useState<Record<string, ClientKanbanStage>>({});

  // Dropdown & interactive drag states
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const stageDropdownRef = useRef<HTMLDivElement>(null);
  const [draggedClientId, setDraggedClientId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ClientKanbanStage | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        stageDropdownRef.current &&
        !stageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStageDropdownOpen(false);
      }
      if (activeMenuId) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuId]);

  // Determine active stage filter
  const currentStageFilter: ClientKanbanStage | null =
    selectedStatusFilter &&
      CLIENT_KANBAN_STAGES.some((s) => s.id === selectedStatusFilter)
      ? (selectedStatusFilter as ClientKanbanStage)
      : null;

  // Filter clients by search, tab status, care type, and stage filter
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const stage = resolveClientStage(client, stageOverrides);

      // Selected stage dropdown / tab filter
      if (selectedStatusFilter === "ATTENTION") {
        if (!client.attentionItems || client.attentionItems.length === 0) return false;
      } else if (selectedStatusFilter && selectedStatusFilter !== "ALL") {
        if (stage !== selectedStatusFilter) {
          return false;
        }
      }

      // Care type filter
      if (selectedCareType !== "ALL" && client.careType !== selectedCareType) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = client.name.toLowerCase().includes(query);
        const matchesId = client.id.toLowerCase().includes(query);
        const matchesHousehold = client.household.name.toLowerCase().includes(query);
        const matchesCaregiver =
          client.assignedCareTeam.primaryCaregiver?.name.toLowerCase().includes(query) ?? false;
        const matchesProgram = client.carePlan.program.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesId &&
          !matchesHousehold &&
          !matchesCaregiver &&
          !matchesProgram
        ) {
          return false;
        }
      }

      return true;
    });
  }, [clients, selectedStatusFilter, selectedCareType, searchQuery, stageOverrides]);

  const isFiltered =
    searchQuery !== "" || selectedCareType !== "ALL" || (selectedStatusFilter !== null && selectedStatusFilter !== "ALL");

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCareType("ALL");
    onSelectStatusFilter(null);
  };

  // Move client between Kanban stages (via drag & drop or quick menu)
  const handleMoveStage = (clientId: string, targetStage: ClientKanbanStage) => {
    const targetClient = clients.find((c) => c.id === clientId);
    if (!targetClient) return;

    const currentStage = resolveClientStage(targetClient, stageOverrides);
    if (currentStage === targetStage) return;

    setStageOverrides((prev) => ({
      ...prev,
      [clientId]: targetStage,
    }));
    setActiveMenuId(null);
    toast.success(`Moved ${targetClient.name} to "${targetStage}"`);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedClientId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stage: ClientKanbanStage) => {
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

  const handleDrop = (e: React.DragEvent, targetStage: ClientKanbanStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const clientId = e.dataTransfer.getData("text/plain") || draggedClientId;
    if (clientId) {
      handleMoveStage(clientId, targetStage);
    }
    setDraggedClientId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20";
      case "Onboarding":
        return "bg-[#FEF3C7] text-[#9A5B00] border-[#9A5B00]/20";
      case "On Hold":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "Discharged":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getCareTypeBadge = (careType: string) => {
    switch (careType) {
      case "Family Care":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Live-In Care":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "Family Friend Care":
        return "bg-purple-50 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <section aria-label="Client Management Workspace">
      {/* Outer Card container matching IntakeReferralWorkspace */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-5">
        {/* Workspace Header & Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Client Management
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search client, ID, household, caregiver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all shadow-xs"
              />
            </div>

            {/* Care Type Filter */}
            <div className="relative">
              <select
                value={selectedCareType}
                onChange={(e) => setSelectedCareType(e.target.value)}
                className="text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all cursor-pointer"
              >
                {CARE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage Filter Dropdown matching Intake */}
            <div className="relative" ref={stageDropdownRef}>
              <button
                type="button"
                onClick={() => setIsStageDropdownOpen(!isStageDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
                title="Filter clients by stage"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400 font-normal hidden sm:inline">Stage:</span>
                <span className="flex items-center gap-1.5 font-bold text-slate-900 truncate max-w-[130px]">
                  {currentStageFilter ? (
                    <>
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${STAGE_CONFIG_MAP.get(currentStageFilter)?.badge.dot || "bg-slate-400"
                          }`}
                      />
                      <span className="truncate">
                        {STAGE_CONFIG_MAP.get(currentStageFilter)?.title}
                      </span>
                    </>
                  ) : (
                    "All Stages"
                  )}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isStageDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isStageDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100">
                    <span>Filter by Stage</span>
                    {selectedStatusFilter && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectStatusFilter(null);
                          setIsStageDropdownOpen(false);
                        }}
                        className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectStatusFilter(null);
                        setIsStageDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${!selectedStatusFilter || selectedStatusFilter === "ALL"
                        ? "bg-slate-50 font-bold text-slate-900"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      <span>All Stages</span>
                      {(!selectedStatusFilter || selectedStatusFilter === "ALL") && (
                        <Check className="w-3.5 h-3.5 text-[#3D6B22]" />
                      )}
                    </button>

                    {CLIENT_KANBAN_STAGES.map((s) => {
                      const isSelected = selectedStatusFilter === s.id;
                      const count = clients.filter(
                        (c) => resolveClientStage(c, stageOverrides) === s.id
                      ).length;

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            onSelectStatusFilter(s.id);
                            setIsStageDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${isSelected
                            ? "bg-slate-50 font-bold text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${s.badge.dot}`} />
                            <span>{s.title}</span>
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* View Mode Switcher: Kanban vs List (strictly matching Intake) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === "kanban"
                  ? "bg-white text-[#3D6B22] shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
                  }`}
                title="Kanban Board View"
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

            {isFiltered && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                title="Clear all active filters"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area: Proper Kanban Board View vs List View */}
        {viewMode === "kanban" ? (
          /* KANBAN BOARD VIEW (5 Columns with clean, scannable client cards) */
          <div className="w-full overflow-x-auto pb-3 pt-1 no-scrollbar sm:scrollbar-thin">
            <div className="flex gap-3.5 min-w-[1250px] items-start">
              {CLIENT_KANBAN_STAGES.map((col) => {
                const columnClients = filteredClients.filter(
                  (c) => resolveClientStage(c, stageOverrides) === col.id
                );
                const isDragOver = dragOverStage === col.id;
                const isFilteredStage = selectedStatusFilter === col.id;

                return (
                  <div
                    key={col.id}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`w-[275px] shrink-0 flex flex-col rounded-2xl border transition-all duration-300 ${isDragOver
                      ? "bg-emerald-50/70 border-[#3D6B22] ring-2 ring-[#3D6B22]/30 shadow-md"
                      : isFilteredStage
                        ? "bg-[#EEF4F0] border-[#3D6B22]/60 ring-1 ring-[#3D6B22]/20"
                        : "bg-[#F8FAF9] border-slate-200/80"
                      }`}
                  >
                    {/* Lane Header */}
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
                        {columnClients.length}
                      </span>
                    </div>

                    {/* Cards Stack */}
                    <div className="p-2.5 space-y-2.5 min-h-[440px] flex flex-col">
                      {columnClients.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-slate-300/70 rounded-xl text-center bg-white/40">
                          <Inbox className="w-5 h-5 text-slate-300 mb-1" />
                          <span className="text-xs font-medium text-slate-400">
                            No clients in stage
                          </span>
                        </div>
                      ) : (
                        columnClients.map((client) => {
                          const isDragging = draggedClientId === client.id;
                          const hasAttention =
                            client.attentionItems && client.attentionItems.length > 0;

                          return (
                            <div
                              key={client.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, client.id)}
                              onClick={() => router.push(`/clients/${client.id}`)}
                              className={`group text-left focus:outline-none cursor-pointer w-full bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#3D6B22]/50 transition-all duration-200 relative overflow-hidden flex flex-col justify-between select-none ${isDragging ? "opacity-40 scale-95 ring-2 ring-[#3D6B22]" : ""
                                }`}
                            >
                              <div>
                                {/* Row 1: Client Name, ID & Attention Dot */}
                                <div className="flex items-start justify-between gap-1.5 mb-1">
                                  <div className="flex items-center gap-1.5 truncate flex-1">
                                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#3D6B22] transition-colors leading-tight truncate">
                                      {client.name}
                                    </h4>
                                    {hasAttention && (
                                      <span
                                        className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
                                        title="Needs Attention"
                                      />
                                    )}
                                  </div>
                                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                    {client.id}
                                  </span>
                                </div>

                                {/* Row 2: Connected Household & Age */}
                                <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                  <Home className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{client.household.name}</span>
                                  <span className="text-slate-400 font-normal">
                                    · Age {client.age}
                                  </span>
                                </p>

                                {/* Row 3: Care Arrangement / Primary Caregiver */}
                                <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border truncate max-w-[130px] ${getCareTypeBadge(
                                      client.careType
                                    )}`}
                                  >
                                    {client.careType}
                                  </span>

                                  {client.assignedCareTeam.primaryCaregiver ? (
                                    <span className="text-[10px] font-medium text-slate-600 truncate max-w-[110px] flex items-center gap-1">
                                      <Users className="w-3 h-3 text-slate-400 shrink-0" />
                                      {client.assignedCareTeam.primaryCaregiver.name.split(" ")[0]}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-rose-600">
                                      Unassigned
                                    </span>
                                  )}
                                </div>

                                {/* Row 4: Program Tag + Hours */}
                                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                                  <span className="text-[10px] font-medium text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md truncate max-w-[155px]">
                                    {formatShortProgram(client.carePlan.program)}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                                    {client.carePlan.authorizedWeeklyHours}h/wk
                                  </span>
                                </div>
                              </div>

                              {/* Footer: Coordinator/Update + Quick Move Dropdown */}
                              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                <span className="truncate max-w-[130px] text-slate-400 text-[11px]">
                                  {client.assignedCareTeam.onboardingCoordinator?.name.split(" ")[0] || "Coordinator"} · {client.updatedAtRelative}
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
                                          activeMenuId === client.id ? null : client.id
                                        )
                                      }
                                      title="Move to another stage"
                                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>

                                    {activeMenuId === client.id && (
                                      <div className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                                          Move Stage
                                        </div>
                                        {CLIENT_KANBAN_STAGES.map((s) => {
                                          const isCurrent =
                                            resolveClientStage(client, stageOverrides) === s.id;
                                          return (
                                            <button
                                              key={s.id}
                                              type="button"
                                              onClick={() =>
                                                handleMoveStage(client.id, s.id)
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
          /* LIST VIEW (Clean, scannable table view matching Intake List view) */
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Household</th>
                    <th className="py-3.5 px-4">Care Arrangement</th>
                    <th className="py-3.5 px-4">Assigned Caregiver</th>
                    <th className="py-3.5 px-4">Readiness</th>
                    <th className="py-3.5 px-4">Stage</th>
                    <th className="py-3.5 px-4">Updated</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredClients.map((client) => {
                    const stage = resolveClientStage(client, stageOverrides);
                    const stageConfig = STAGE_CONFIG_MAP.get(stage);
                    const hasAttention =
                      client.attentionItems && client.attentionItems.length > 0;

                    return (
                      <tr
                        key={client.id}
                        onClick={() => router.push(`/clients/${client.id}`)}
                        className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Client Name & ID */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {client.avatarUrl ? (
                                <img
                                  src={client.avatarUrl}
                                  alt={client.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-600 bg-slate-200">
                                  {client.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                                <span>{client.name}</span>
                                {hasAttention && (
                                  <span title="Needs Attention" className="text-amber-600">
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {client.id} • Age {client.age}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Household */}
                        <td className="py-3 px-3.5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                              {client.household.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {client.household.code}
                            </span>
                          </div>
                        </td>

                        {/* Care Arrangement */}
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCareTypeBadge(
                              client.careType
                            )}`}
                          >
                            {client.careType}
                          </span>
                        </td>

                        {/* Caregiver */}
                        <td className="py-3 px-3.5">
                          {client.assignedCareTeam.primaryCaregiver ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800">
                                {client.assignedCareTeam.primaryCaregiver.name}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {client.assignedCareTeam.primaryCaregiver.relationship.split("(")[0]}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Care Readiness */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              title={`Profile: ${client.readiness.clientProfile}`}
                              className={`w-2 h-2 rounded-full ${client.readiness.clientProfile === "Complete"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                                }`}
                            />
                            <span
                              title={`Care: ${client.readiness.careArrangement}`}
                              className={`w-2 h-2 rounded-full ${client.readiness.careArrangement === "Complete"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                                }`}
                            />
                            <span
                              title={`Docs: ${client.readiness.documents}`}
                              className={`w-2 h-2 rounded-full ${client.readiness.documents === "Verified"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                                }`}
                            />
                            <span
                              title={`Auth: ${client.readiness.authorization}`}
                              className={`w-2 h-2 rounded-full ${client.readiness.authorization === "Verified"
                                ? "bg-emerald-500"
                                : client.readiness.authorization === "Expiring"
                                  ? "bg-rose-500"
                                  : "bg-amber-500"
                                }`}
                            />
                            <span className="text-[11px] font-mono font-bold text-slate-600 ml-1">
                              {client.readiness.overallScore ?? 85}%
                            </span>
                          </div>
                        </td>

                        {/* Stage Badge */}
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${stageConfig?.badge.bg ?? "bg-slate-100"
                              } ${stageConfig?.badge.text ?? "text-slate-700"} ${stageConfig?.badge.border ?? "border-slate-200"
                              }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${stageConfig?.badge.dot ?? "bg-slate-400"
                                }`}
                            />
                            <span>{stageConfig?.title ?? stage}</span>
                          </span>
                        </td>

                        {/* Updated */}
                        <td className="py-3 px-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                          {client.updatedAtRelative}
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3 px-3.5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => router.push(`/clients/${client.id}`)}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-[#F2F8EE] hover:text-[#3D6B22] border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                            <Link
                              href={`/clients/${client.id}`}
                              className="p-1.5 text-slate-400 hover:text-[#3D6B22] transition-colors rounded-xl hover:bg-[#F2F8EE]"
                              title="Full Profile"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
