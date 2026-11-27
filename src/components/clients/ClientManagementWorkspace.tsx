"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Kanban,
  List,
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
import { ClientRecord, ClientStatus } from "@/types/client";
import {
  getClientDiagnosis,
  getClientRiskLevel,
  getClientsFromStorage,
  saveClientsToStorage,
} from "@/lib/clients/mockData";
import { toast } from "sonner";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";

export type ClientKanbanStage = ClientStatus;

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
      id: "Active",
      title: "Active",
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
      id: "Hospitalized",
      title: "Hospitalized",
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
      id: "On Hold",
      title: "On Hold",
      icon: FileCheck2,
      badge: {
        bg: "bg-sky-50",
        text: "text-sky-800",
        border: "border-sky-200",
        dot: "bg-sky-500",
        headerBadge: "bg-sky-100 text-sky-800 border-sky-200",
      },
    },
    {
      id: "Discharged",
      title: "Discharged",
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
  if (client.status === "Discharged") return "Discharged";
  if (client.status === "Hospitalized") return "Hospitalized";
  if (client.status === "On Hold") return "On Hold";
  return "Active";
}

interface ClientManagementWorkspaceProps {
  clients: ClientRecord[];
  selectedStatusFilter: string | null;
  onSelectStatusFilter: (status: string | null) => void;
  selectedClientId: string | null;
  onSelectClient: (client: ClientRecord) => void;
  baseDetailsPath?: string;
  initialViewMode?: "kanban" | "list";
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
  baseDetailsPath = "/clients",
  initialViewMode = "list",
}: ClientManagementWorkspaceProps) {
  const router = useRouter();
  const perms = usePortalPermissions();

  const [viewMode, setViewMode] = useState<"kanban" | "list">(initialViewMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCareType, setSelectedCareType] = useState("ALL");
  const [stageOverrides, setStageOverrides] = useState<Record<string, ClientKanbanStage>>({});

  const cleanBasePath = baseDetailsPath.replace(/\/$/, "");

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
      if (selectedStatusFilter === "HIGH_RISK") {
        if (getClientRiskLevel(client) !== "High Risk") return false;
      } else if (selectedStatusFilter === "ATTENTION") {
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
        const matchesDiagnosis = getClientDiagnosis(client).toLowerCase().includes(query);
        const matchesRisk = getClientRiskLevel(client).toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesId &&
          !matchesHousehold &&
          !matchesCaregiver &&
          !matchesProgram &&
          !matchesDiagnosis &&
          !matchesRisk
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

    if (targetStage === "Discharged" && !perms.clients.canDischarge) {
      toast.error("Client discharge and case closure require Agency Admin approval.");
      setActiveMenuId(null);
      return;
    }

    const currentStage = resolveClientStage(targetClient, stageOverrides);
    if (currentStage === targetStage) return;

    setStageOverrides((prev) => ({
      ...prev,
      [clientId]: targetStage,
    }));
    const allClients = getClientsFromStorage();
    const updatedClients = allClients.map((c) =>
      c.id === clientId
        ? {
            ...c,
            status: targetStage,
            updatedAtRelative: "Just now",
          }
        : c
    );
    saveClientsToStorage(updatedClients);
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
      case "Hospitalized":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "On Hold":
        return "bg-sky-50 text-sky-800 border-sky-200";
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
      <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-5">
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
                              onClick={() => router.push(`${cleanBasePath}/${client.id}`)}
                              className={`group text-left focus:outline-none cursor-pointer w-full bg-white rounded-xl p-3 border border-slate-200 shadow-xs hover:shadow-md hover:border-[#3D6B22]/50 transition-all duration-200 relative overflow-hidden flex flex-col justify-between select-none ${isDragging ? "opacity-40 scale-95 ring-2 ring-[#3D6B22]" : ""
                                }`}
                            >
                              <div>
                                {/* Row 1: Client Name & Attention Dot */}
                                <div className="flex items-center gap-1.5 mb-1 truncate">
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

                                {/* Row 2: Primary Diagnosis */}
                                <p className="text-xs text-slate-600 truncate">
                                  {getClientDiagnosis(client)}
                                </p>

                                {/* Row 3: Risk Level & Authorized Hours */}
                                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                      getClientRiskLevel(client) === "High Risk"
                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                        : getClientRiskLevel(client) === "Medium Risk"
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    }`}
                                  >
                                    {getClientRiskLevel(client)}
                                  </span>
                                  <span className="text-[10px] text-slate-700 font-semibold shrink-0">
                                    {client.carePlan.authorizedWeeklyHours}h/wk
                                  </span>
                                </div>
                              </div>

                              {/* Footer: Coordinator + Quick Move Dropdown */}
                              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                <span className="truncate max-w-[140px] text-slate-500 text-[11px]">
                                  Coord: <span className="text-slate-700 font-medium">{client.assignedCareTeam.onboardingCoordinator?.name.split(" ")[0] || "Care Team"}</span>
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
                    <th className="py-3.5 px-4">Diagnosis</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Risk Level</th>
                    <th className="py-3.5 px-4">Assigned Caregiver / RN</th>
                    <th className="py-3.5 px-4">Next Visit</th>
                    <th className="py-3.5 px-4">Authorization</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredClients.map((client) => {
                    const stage = resolveClientStage(client, stageOverrides);
                    const stageConfig = STAGE_CONFIG_MAP.get(stage);
                    const diagnosis = getClientDiagnosis(client);
                    const riskLabel = getClientRiskLevel(client);
                    const nextVisitLabel =
                      stage === "Discharged"
                        ? "Discharged"
                        : stage === "Hospitalized"
                          ? "Paused (Inpatient)"
                          : stage === "On Hold"
                            ? "Start of Care Pending"
                            : client.carePlan?.frequency || "Scheduled";
                    const authStatus = client.authorization?.status || "Pending Renewal";

                    return (
                      <tr
                        key={client.id}
                        onClick={() => router.push(`${cleanBasePath}/${client.id}`)}
                        className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Client Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full overflow-hidden bg-emerald-100/80 border border-emerald-200/60 shrink-0 flex items-center justify-center font-bold text-[10px] text-[#3e6b2b]">
                              {client.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors whitespace-nowrap">
                              {client.name}
                            </span>
                          </div>
                        </td>

                        {/* Diagnosis */}
                        <td className="py-3 px-4">
                          <span className="text-xs font-medium text-slate-700 block max-w-[200px] truncate">
                            {diagnosis}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${stageConfig?.badge.bg ?? "bg-slate-100"
                              } ${stageConfig?.badge.text ?? "text-slate-700"} ${stageConfig?.badge.border ?? "border-slate-200"
                              }`}
                          >
                            <span>{stageConfig?.title ?? stage}</span>
                          </span>
                        </td>

                        {/* Risk */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${
                              riskLabel === "High Risk"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : riskLabel === "Medium Risk"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {riskLabel}
                          </span>
                        </td>

                        {/* Assigned Caregiver / RN */}
                        <td className="py-3 px-4">
                          {client.assignedCareTeam.primaryCaregiver ? (
                            <span className="font-semibold text-slate-800 whitespace-nowrap">
                              {client.assignedCareTeam.primaryCaregiver.name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 whitespace-nowrap">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Next Visit */}
                        <td className="py-3 px-4">
                          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                            {nextVisitLabel}
                          </span>
                        </td>

                        {/* Authorization Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${
                              authStatus === "Verified"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : authStatus === "Expiring Soon"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {authStatus}
                          </span>
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => router.push(`${cleanBasePath}/${client.id}`)}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-[#F2F8EE] hover:text-[#3D6B22] border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Details
                            </button>
                            <Link
                              href={`${cleanBasePath}/${client.id}`}
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
