"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  ClipboardList,
  ShieldCheck,
  Edit2,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Circle,
  FileText,
  CalendarDays,
  LayoutGrid,
  Languages,
  Layers,
  X,
} from "lucide-react";
import {
  ClientRecord,
  AdlAssessmentItem,
  AdlDayKey,
  AdlDaySchedule,
  AdlFrequencyType,
  AdlTimeSlot,
} from "@/types/client";
import { toast } from "sonner";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";
import {
  ADL_CLINICAL_PRESETS,
  ADL_DAYS,
  ADL_TIME_SLOTS,
  createUniformSchedule,
  getAllColumnState,
  inferWeeklySchedule,
  summarizeWeeklySchedule,
} from "./adls/adlHelpers";
import { AdlScheduleModal } from "./adls/AdlScheduleModal";

interface ClientAdlsTabProps {
  client: ClientRecord;
  onUpdateClient?: (updated: ClientRecord) => void;
}

type AdlSubTab = "weekly-schedule" | "functional-matrix";
type CategoryFilter = "ALL" | "ADL" | "IADL";

interface ActiveCellPopover {
  adlIndex: number;
  dayKey: AdlDayKey | "all";
}

const ACUITY_RANK: Record<AdlAssessmentItem["level"], number> = {
  "Total Dependent": 5,
  "Moderate Assist": 4,
  "Minimal Assist": 3,
  Supervision: 2,
  Independent: 1,
};

function StatusGlyph({
  cell,
  compact = false,
}: {
  cell: AdlDaySchedule;
  compact?: boolean;
}) {
  if (cell.type === "always") {
    return (
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#3D6B22] text-white shadow-2xs"
        title="Always"
      >
        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
      </span>
    );
  }

  if (cell.type === "as_needed") {
    return (
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-sky-600 bg-sky-50 text-sky-600"
        title="As needed"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
      </span>
    );
  }

  if (cell.type === "specific_times") {
    const times = cell.times && cell.times.length > 0 ? cell.times : ["Morning"];
    return (
      <div
        className="flex flex-col items-center gap-0.5"
        title={`Specific times: ${times.join(", ")}`}
      >
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 border border-amber-300 text-amber-700">
          <Clock className="w-3.5 h-3.5" />
        </span>
        {!compact && (
          <span className="text-[10px] font-medium text-slate-500 leading-tight text-center max-w-[64px] truncate">
            {times.join(", ")}
          </span>
        )}
      </div>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-slate-300 bg-white text-slate-300"
      title="Never"
    >
      <Circle className="w-3 h-3 opacity-0" />
    </span>
  );
}

function getCellSurfaceClass(type: AdlFrequencyType): string {
  switch (type) {
    case "always":
      return "bg-[#3D6B22]/6 border-[#3D6B22]/20 hover:bg-[#3D6B22]/12 hover:border-[#3D6B22]/40";
    case "as_needed":
      return "bg-sky-50/70 border-sky-200/80 hover:bg-sky-100/70 hover:border-sky-300";
    case "specific_times":
      return "bg-amber-50/60 border-amber-200/80 hover:bg-amber-100/60 hover:border-amber-300";
    default:
      return "bg-slate-50/50 border-slate-200/60 hover:bg-slate-100/70 hover:border-slate-300";
  }
}

function getLevelBadgeClass(level: AdlAssessmentItem["level"]) {
  switch (level) {
    case "Total Dependent":
      return "bg-rose-50 text-rose-800 border-rose-200";
    case "Moderate Assist":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "Minimal Assist":
      return "bg-sky-50 text-sky-800 border-sky-200";
    default:
      return "bg-[#3D6B22]/10 text-[#3D6B22] border-[#3D6B22]/20";
  }
}

function resolveGroupName(item: AdlAssessmentItem): string {
  if (item.group) return item.group;
  const n = item.name.toLowerCase();
  if (n.includes("bath") || n.includes("dress") || n.includes("shav") || n.includes("bladder") || n.includes("toilet")) {
    return "Personal Care & Hygiene";
  }
  if (n.includes("exercise") || n.includes("transfer") || n.includes("ambul") || n.includes("walk")) {
    return "Mobility & Exercise";
  }
  if (n.includes("meal") || n.includes("eat") || n.includes("nutri")) {
    return "Nutrition & Hydration";
  }
  if (n.includes("med")) {
    return "Medication & Health";
  }
  return item.category === "IADL" ? "Household & Community" : "Uncategorized";
}

export function ClientAdlsTab({ client, onUpdateClient }: ClientAdlsTabProps) {
  const adls = client.adls || [];

  const [activeSubTab, setActiveSubTab] = useState<AdlSubTab>("weekly-schedule");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [groupByDomain, setGroupByDomain] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedInstructions, setExpandedInstructions] = useState<Record<number, boolean>>({});

  // Modal & Dropdown state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Cell Quick-Edit Popover (Desktop & Mobile)
  const [activePopover, setActivePopover] = useState<ActiveCellPopover | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setIsAddMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const persistAdls = (nextAdls: AdlAssessmentItem[], successMsg?: string) => {
    const updated: ClientRecord = {
      ...client,
      adls: nextAdls,
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) onUpdateClient(updated);

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }

    if (successMsg) toast.success(successMsg);
  };

  // Clinical KPI Metrics
  const kpiStats = useMemo(() => {
    const adlCount = adls.filter((a) => a.category === "ADL").length;
    const iadlCount = adls.filter((a) => a.category === "IADL").length;
    const bilingualCount = adls.filter((a) => Boolean(a.instructionsEs?.trim())).length;

    let highestLevel: AdlAssessmentItem["level"] = "Independent";
    for (const a of adls) {
      if (ACUITY_RANK[a.level] > ACUITY_RANK[highestLevel]) {
        highestLevel = a.level;
      }
    }

    const dailyScheduledCount = adls.filter((a) => {
      const sched = inferWeeklySchedule(a);
      return ADL_DAYS.some((d) => sched[d.key].type !== "never");
    }).length;

    return {
      adlCount,
      iadlCount,
      bilingualCount,
      highestLevel,
      dailyScheduledCount,
    };
  }, [adls]);

  // Filtered & sorted list with original index preserved
  const filteredAdls = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return adls
      .map((item, originalIndex) => ({
        item,
        originalIndex,
        domainGroup: resolveGroupName(item),
      }))
      .filter(({ item, domainGroup }) => {
        if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.instructions.toLowerCase().includes(q) ||
          (item.instructionsEs || "").toLowerCase().includes(q) ||
          domainGroup.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (groupByDomain && a.domainGroup !== b.domainGroup) {
          return a.domainGroup.localeCompare(b.domainGroup);
        }
        const cmp = a.item.name.localeCompare(b.item.name);
        return sortAsc ? cmp : -cmp;
      });
  }, [adls, categoryFilter, searchQuery, sortAsc, groupByDomain]);

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setIsAddMenuOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (originalIndex: number) => {
    setEditingIndex(originalIndex);
    setActivePopover(null);
    setIsModalOpen(true);
  };

  const handleAddPreset = (presetIndex: number) => {
    const preset = ADL_CLINICAL_PRESETS[presetIndex];
    if (!preset) return;

    const newItem: AdlAssessmentItem = {
      id: `ADL-${Date.now()}`,
      name: preset.name,
      category: preset.category,
      group: preset.group,
      level: preset.level,
      frequency: summarizeWeeklySchedule(preset.weeklySchedule),
      instructions: preset.instructions,
      instructionsEs: preset.instructionsEs,
      weeklySchedule: preset.weeklySchedule,
    };

    persistAdls([newItem, ...adls], `Added "${preset.name}" to ADL schedule.`);
    setIsAddMenuOpen(false);
  };

  const handleSaveModal = (savedItem: AdlAssessmentItem) => {
    if (editingIndex !== null) {
      const next = [...adls];
      next[editingIndex] = savedItem;
      persistAdls(next, `Updated "${savedItem.name}" ADL schedule.`);
    } else {
      persistAdls([savedItem, ...adls], `Added "${savedItem.name}" to ADL schedule.`);
    }
  };

  const handleDeleteAdl = (originalIndex: number) => {
    const target = adls[originalIndex];
    const next = adls.filter((_, idx) => idx !== originalIndex);
    persistAdls(next, `Removed "${target?.name || "ADL"}" from care schedule.`);
  };

  const handleUpdateDayCell = (
    originalIndex: number,
    dayKey: AdlDayKey | "all",
    type: AdlFrequencyType,
    times?: AdlTimeSlot[]
  ) => {
    const target = adls[originalIndex];
    if (!target) return;

    const currentSchedule = inferWeeklySchedule(target);
    const nextCell: AdlDaySchedule =
      type === "specific_times"
        ? { type, times: times && times.length > 0 ? times : (["Morning"] as AdlTimeSlot[]) }
        : { type };

    const nextSchedule =
      dayKey === "all"
        ? createUniformSchedule(type, nextCell.times)
        : { ...currentSchedule, [dayKey]: nextCell };

    const next = [...adls];
    next[originalIndex] = {
      ...target,
      weeklySchedule: nextSchedule,
      frequency: summarizeWeeklySchedule(nextSchedule),
    };

    persistAdls(next);
    if (type !== "specific_times") {
      setActivePopover(null);
    }
  };

  const handleToggleTimeSlotInPopover = (
    originalIndex: number,
    dayKey: AdlDayKey | "all",
    slot: AdlTimeSlot
  ) => {
    const target = adls[originalIndex];
    if (!target) return;
    const schedule = inferWeeklySchedule(target);
    const currentCell = dayKey === "all" ? schedule.mon : schedule[dayKey];
    const currentTimes = currentCell.times || [];
    const nextTimes = currentTimes.includes(slot)
      ? currentTimes.filter((t) => t !== slot)
      : [...currentTimes, slot];

    handleUpdateDayCell(
      originalIndex,
      dayKey,
      "specific_times",
      nextTimes.length > 0 ? nextTimes : (["Morning"] as AdlTimeSlot[])
    );
  };

  const cardOutlineClass =
    "bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top LiliSare Header Card */}
      <div className={`${cardOutlineClass} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Activities of Daily Living
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                {adls.length}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                <ShieldCheck className="w-3 h-3 text-[#3D6B22]" /> Agency Care Matrix
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Weekly caregiver ADL/IADL schedule, bilingual shift instructions, and functional independence tracking
            </p>
          </div>
        </div>

        {/* ADD ADL Split Dropdown */}
        <div className="relative w-full sm:w-auto" ref={addMenuRef}>
          <div className="flex w-full sm:inline-flex sm:w-auto rounded-xl shadow-md shadow-[#3D6B22]/20">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-l-xl transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ADD ADL</span>
            </button>
            <button
              type="button"
              aria-label="Add ADL options"
              onClick={() => setIsAddMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center px-3 py-2.5 text-white bg-[#345C1D] hover:bg-[#2b4d18] border-l border-white/20 rounded-r-xl transition-all cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {isAddMenuOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-64 bg-white rounded-xl border border-slate-200 shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-40 py-1.5 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="w-full px-3.5 py-2 text-left text-xs font-bold text-[#3D6B22] hover:bg-[#3D6B22]/5 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Custom ADL Task...</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <div className="px-3.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick-Add Clinical Presets
              </div>
              {ADL_CLINICAL_PRESETS.map((preset, idx) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleAddPreset(idx)}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="font-semibold truncate">{preset.name}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                    {preset.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3-Card Clinical ADL Overview Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        <div className={cardOutlineClass}>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Care Tasks
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {kpiStats.dailyScheduledCount} of {adls.length} Scheduled
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 px-2 py-0.5 rounded-full shrink-0">
              {kpiStats.adlCount} ADL • {kpiStats.iadlCount} IADL
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Synced with EVV caregiver shift checklists
          </div>
        </div>

        <div className={cardOutlineClass}>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Highest Assistance Tier
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {kpiStats.highestLevel}
            </span>
            <span
              className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getLevelBadgeClass(
                kpiStats.highestLevel
              )}`}
            >
              Acuity Peak
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Drives caregiver skill & HHA matching
          </div>
        </div>

        <div className={cardOutlineClass}>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Bilingual Shift Readiness
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span className="text-base sm:text-lg font-bold text-[#3D6B22]">
              {kpiStats.bilingualCount} / {adls.length} Tasks
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full shrink-0">
              <Languages className="w-3 h-3" /> EN / ES
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            English & Spanish caregiver directives
          </div>
        </div>
      </div>

      {/* Responsive Tab Navigation & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="ADL View Modes"
          className="bg-white rounded-xl lg:rounded-2xl p-1.5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] grid grid-cols-2 sm:inline-flex gap-1.5 w-full sm:w-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === "weekly-schedule"}
            onClick={() => setActiveSubTab("weekly-schedule")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "weekly-schedule"
                ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
            <span>Weekly Schedule</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === "functional-matrix"}
            onClick={() => setActiveSubTab("functional-matrix")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "functional-matrix"
                ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
            <span>Functional Matrix</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                activeSubTab === "functional-matrix"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {adls.length}
            </span>
          </button>
        </div>

        {/* Search, Grouping & Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setGroupByDomain((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              groupByDomain
                ? "bg-[#3D6B22]/10 text-[#3D6B22] border-[#3D6B22]/25"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Grouped</span>
          </button>

          <div className="inline-flex bg-white rounded-xl p-1 border border-slate-200 shadow-2xs">
            {(["ALL", "ADL", "IADL"] as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {showSearchInput ? (
            <div className="relative flex-1 sm:flex-initial min-w-[210px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ADLs or instructions..."
                className="w-full pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchInput(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSearchInput(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 shadow-2xs transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: WEEKLY SCHEDULE MATRIX */}
      {activeSubTab === "weekly-schedule" && (
        <div className="space-y-4">
          {filteredAdls.length === 0 ? (
            <div className="bg-white rounded-xl lg:rounded-2xl p-10 border border-slate-200 text-center space-y-3">
              <ClipboardList className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-800">
                No ADL tasks match your filter
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Add a new Activity of Daily Living or clear your search filter to view the weekly care schedule.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Matrix Table (lg+ clean simple layout) */}
              <div className="hidden lg:block bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-visible">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 pl-5 pr-3 min-w-[240px]">
                          <button
                            type="button"
                            onClick={() => setSortAsc((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            <span>ADL Service</span>
                          </button>
                        </th>
                        {ADL_DAYS.map((d) => (
                          <th key={d.key} className="py-3 px-1 text-center w-[64px]">
                            {d.short}
                          </th>
                        ))}
                        <th className="py-3 px-1 text-center w-[64px] border-l border-slate-200/70">
                          ALL
                        </th>
                        <th className="py-3 pr-4 pl-2 text-right w-[72px]">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredAdls.map(({ item, originalIndex, domainGroup }, idx) => {
                        const prevGroup =
                          idx > 0 ? filteredAdls[idx - 1].domainGroup : null;
                        const showGroupHeader =
                          groupByDomain && domainGroup !== prevGroup;

                        const schedule = inferWeeklySchedule(item);
                        const allState = getAllColumnState(schedule);
                        const hasInstructions = Boolean(
                          item.instructions?.trim() || item.instructionsEs?.trim()
                        );
                        const isExpanded = expandedInstructions[originalIndex] ?? false;

                        return (
                          <React.Fragment key={item.id || `${item.name}-${originalIndex}`}>
                            {showGroupHeader && (
                              <tr className="bg-slate-50/50 border-y border-slate-100">
                                <td
                                  colSpan={10}
                                  className="py-1.5 px-5 text-[10px] font-bold uppercase tracking-wider text-slate-500"
                                >
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3D6B22]" />
                                    <span>{domainGroup}</span>
                                  </span>
                                </td>
                              </tr>
                            )}

                            <tr className="group relative hover:bg-slate-50/60 transition-colors align-middle">
                              {/* Clean Concise Name + Toggleable Instructions */}
                              <td className="py-3 pl-5 pr-3">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEdit(originalIndex)}
                                      className="text-sm font-bold text-slate-900 hover:text-[#3D6B22] transition-colors text-left cursor-pointer"
                                    >
                                      {item.name}
                                    </button>
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {item.category}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLevelBadgeClass(
                                        item.level
                                      )}`}
                                    >
                                      {item.level}
                                    </span>
                                    {hasInstructions && (
                                      <button
                                        type="button"
                                        title={isExpanded ? "Hide instructions" : "View EN / ES instructions"}
                                        onClick={() =>
                                          setExpandedInstructions((prev) => ({
                                            ...prev,
                                            [originalIndex]: !isExpanded,
                                          }))
                                        }
                                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                                          isExpanded
                                            ? "bg-[#3D6B22]/10 text-[#3D6B22]"
                                            : "text-slate-400 hover:text-[#3D6B22] hover:bg-slate-100"
                                        }`}
                                      >
                                        <FileText className="w-3 h-3" />
                                        <span>{isExpanded ? "Hide Note" : "Note"}</span>
                                      </button>
                                    )}
                                  </div>

                                  {isExpanded && hasInstructions && (
                                    <div className="pt-1.5 pl-2.5 border-l-2 border-[#3D6B22]/30 space-y-1 max-w-md">
                                      {item.instructions && (
                                        <p className="text-xs text-slate-600 leading-snug">
                                          {item.instructions}
                                        </p>
                                      )}
                                      {item.instructionsEs && (
                                        <p className="text-xs text-slate-500 italic leading-snug">
                                          <span className="font-semibold not-italic text-slate-400 mr-1">
                                            ES:
                                          </span>
                                          {item.instructionsEs}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* MON - SUN Clean Icon Cells */}
                              {ADL_DAYS.map((day) => {
                                const cell = schedule[day.key];
                                const isPopoverOpen =
                                  activePopover?.adlIndex === originalIndex &&
                                  activePopover?.dayKey === day.key;

                                return (
                                  <td key={day.key} className="py-2.5 px-1 text-center relative">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActivePopover(
                                          isPopoverOpen
                                            ? null
                                            : { adlIndex: originalIndex, dayKey: day.key }
                                        )
                                      }
                                      className="inline-flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                      <StatusGlyph cell={cell} />
                                    </button>

                                    {isPopoverOpen && (
                                      <DayQuickPopover
                                        title={`${item.name} — ${day.full}`}
                                        cell={cell}
                                        onSelectType={(type) =>
                                          handleUpdateDayCell(originalIndex, day.key, type)
                                        }
                                        onToggleTime={(slot) =>
                                          handleToggleTimeSlotInPopover(
                                            originalIndex,
                                            day.key,
                                            slot
                                          )
                                        }
                                        onClose={() => setActivePopover(null)}
                                      />
                                    )}
                                  </td>
                                );
                              })}

                              {/* ALL Column */}
                              <td className="py-2.5 px-1 text-center border-l border-slate-100 relative">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const isPopoverOpen =
                                      activePopover?.adlIndex === originalIndex &&
                                      activePopover?.dayKey === "all";
                                    setActivePopover(
                                      isPopoverOpen
                                        ? null
                                        : { adlIndex: originalIndex, dayKey: "all" }
                                    );
                                  }}
                                  title="Set all 7 days"
                                  className="inline-flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                  <StatusGlyph cell={allState.cell} />
                                </button>

                                {activePopover?.adlIndex === originalIndex &&
                                  activePopover?.dayKey === "all" && (
                                    <DayQuickPopover
                                      title={`${item.name} — All 7 Days`}
                                      cell={allState.cell}
                                      onSelectType={(type) =>
                                        handleUpdateDayCell(originalIndex, "all", type)
                                      }
                                      onToggleTime={(slot) =>
                                        handleToggleTimeSlotInPopover(
                                          originalIndex,
                                          "all",
                                          slot
                                        )
                                      }
                                      onClose={() => setActivePopover(null)}
                                    />
                                  )}
                              </td>

                              {/* Actions */}
                              <td className="py-2.5 pr-4 pl-2 text-right relative">
                                <div className="inline-flex items-center justify-end gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(originalIndex)}
                                    title="Edit ADL"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-[#3D6B22]/10 transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAdl(originalIndex)}
                                    title="Remove ADL"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile & Tablet Responsive Cards (< lg) */}
              <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredAdls.map(({ item, originalIndex, domainGroup }) => {
                  const schedule = inferWeeklySchedule(item);
                  const allState = getAllColumnState(schedule);
                  const mobileSelectedDay =
                    activePopover?.adlIndex === originalIndex
                      ? activePopover.dayKey
                      : null;

                  return (
                    <div
                      key={item.id || `${item.name}-${originalIndex}`}
                      className={`${cardOutlineClass} space-y-3.5 relative overflow-hidden`}
                    >
                      {(item.instructions || item.instructionsEs) && (
                        <span
                          aria-hidden="true"
                          className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-[#3D6B22] border-l-[12px] border-l-transparent"
                        />
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 px-2 py-0.5 rounded-full">
                              {domainGroup}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {item.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLevelBadgeClass(
                                item.level
                              )}`}
                            >
                              {item.level}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {item.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(originalIndex)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#3D6B22] hover:bg-[#3D6B22]/10 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAdl(originalIndex)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {(item.instructions || item.instructionsEs) && (
                        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 space-y-1.5">
                          {item.instructions && (
                            <p className="text-xs text-slate-700 leading-relaxed">
                              <span className="font-bold text-slate-500 uppercase text-[10px] mr-1.5">
                                Instructions:
                              </span>
                              {item.instructions}
                            </p>
                          )}
                          {item.instructionsEs && (
                            <p className="text-xs text-slate-600 italic leading-relaxed">
                              <span className="font-bold text-slate-500 not-italic uppercase text-[10px] mr-1.5">
                                ES:
                              </span>
                              {item.instructionsEs}
                            </p>
                          )}
                        </div>
                      )}

                      {/* 7-Day + ALL Interactive Pill Strip */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {ADL_DAYS.map((day) => {
                          const cell = schedule[day.key];
                          const isSelected = mobileSelectedDay === day.key;
                          return (
                            <button
                              key={day.key}
                              type="button"
                              onClick={() =>
                                setActivePopover(
                                  isSelected
                                    ? null
                                    : { adlIndex: originalIndex, dayKey: day.key }
                                )
                              }
                              className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? "ring-2 ring-[#3D6B22] border-[#3D6B22] bg-white"
                                  : getCellSurfaceClass(cell.type)
                              }`}
                            >
                              <span className="text-[10px] font-bold text-slate-600">
                                {day.short}
                              </span>
                              <StatusGlyph cell={cell} compact />
                              {cell.type === "specific_times" && (
                                <span className="text-[9px] font-bold text-amber-900 truncate max-w-full px-1">
                                  {(cell.times || ["Morning"])[0]}
                                </span>
                              )}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() =>
                            setActivePopover(
                              mobileSelectedDay === "all"
                                ? null
                                : { adlIndex: originalIndex, dayKey: "all" }
                            )
                          }
                          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                            mobileSelectedDay === "all"
                              ? "ring-2 ring-[#3D6B22] border-[#3D6B22] bg-white"
                              : "bg-slate-100/80 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-[10px] font-bold text-slate-700">
                            ALL
                          </span>
                          <StatusGlyph cell={allState.cell} compact />
                        </button>
                      </div>

                      {/* Inline Mobile Quick-Edit Drawer */}
                      {mobileSelectedDay && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-800">
                              Set{" "}
                              {mobileSelectedDay === "all"
                                ? "All 7 Days"
                                : ADL_DAYS.find((d) => d.key === mobileSelectedDay)?.full}
                            </span>
                            <button
                              type="button"
                              onClick={() => setActivePopover(null)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {(
                              [
                                { type: "always", label: "Always" },
                                { type: "as_needed", label: "As needed" },
                                { type: "specific_times", label: "Specific times" },
                                { type: "never", label: "Never" },
                              ] as const
                            ).map((opt) => {
                              const currentCell =
                                mobileSelectedDay === "all"
                                  ? allState.cell
                                  : schedule[mobileSelectedDay];
                              return (
                                <button
                                  key={opt.type}
                                  type="button"
                                  onClick={() =>
                                    handleUpdateDayCell(
                                      originalIndex,
                                      mobileSelectedDay,
                                      opt.type
                                    )
                                  }
                                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                                    currentCell.type === opt.type
                                      ? "bg-white border-[#3D6B22] text-[#3D6B22]"
                                      : "bg-white/70 border-slate-200 text-slate-700"
                                  }`}
                                >
                                  <StatusGlyph cell={{ type: opt.type }} compact />
                                  <span>{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {(mobileSelectedDay === "all"
                            ? allState.cell.type
                            : schedule[mobileSelectedDay].type) === "specific_times" && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {ADL_TIME_SLOTS.map((slot) => {
                                const currentCell =
                                  mobileSelectedDay === "all"
                                    ? allState.cell
                                    : schedule[mobileSelectedDay];
                                const active = (currentCell.times || []).includes(slot);
                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() =>
                                      handleToggleTimeSlotInPopover(
                                        originalIndex,
                                        mobileSelectedDay,
                                        slot
                                      )
                                    }
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer ${
                                      active
                                        ? "bg-[#3D6B22] text-white border-[#3D6B22]"
                                        : "bg-white text-slate-600 border-slate-200"
                                    }`}
                                  >
                                    {slot}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend Bar */}
              <div className="flex justify-end">
                <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] px-4 py-3 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-6 w-full sm:w-auto">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <StatusGlyph cell={{ type: "always" }} compact />
                    <span>Always</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <StatusGlyph cell={{ type: "as_needed" }} compact />
                    <span>As needed</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <StatusGlyph cell={{ type: "specific_times", times: ["Morning"] }} compact />
                    <span>Specific times</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <StatusGlyph cell={{ type: "never" }} compact />
                    <span>Never</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: FUNCTIONAL INDEPENDENCE MATRIX */}
      {activeSubTab === "functional-matrix" && (
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Functional Independence Matrix
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Categorized assistance requirements for daily personal care
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {filteredAdls.length} Assessed Tasks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAdls.map(({ item, originalIndex }) => (
              <div
                key={item.id || `${item.name}-${originalIndex}`}
                onClick={() => handleOpenEdit(originalIndex)}
                className={`${cardOutlineClass} cursor-pointer flex flex-col justify-between space-y-3.5`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getLevelBadgeClass(
                        item.level
                      )}`}
                    >
                      {item.level}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2.5">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.instructions || "Standard caregiver assistance protocol."}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
                  <span>Schedule</span>
                  <span className="font-bold text-[#3D6B22]">
                    {summarizeWeeklySchedule(inferWeeklySchedule(item))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit ADL Schedule Modal */}
      <AdlScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialItem={editingIndex !== null ? adls[editingIndex] : null}
        onSave={handleSaveModal}
      />
    </div>
  );
}

interface DayQuickPopoverProps {
  title: string;
  cell: AdlDaySchedule;
  onSelectType: (type: AdlFrequencyType) => void;
  onToggleTime: (slot: AdlTimeSlot) => void;
  onClose: () => void;
}

function DayQuickPopover({
  title,
  cell,
  onSelectType,
  onToggleTime,
  onClose,
}: DayQuickPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1.5 w-56 bg-white rounded-xl border border-slate-200 shadow-[0_14px_34px_rgba(0,0,0,0.14)] p-3 text-left animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
        <span className="text-[11px] font-bold text-slate-800 truncate">
          {title}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1">
        {(
          [
            { type: "always", label: "Always" },
            { type: "as_needed", label: "As needed" },
            { type: "specific_times", label: "Specific times" },
            { type: "never", label: "Never" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.type}
            type="button"
            onClick={() => onSelectType(opt.type)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              cell.type === opt.type
                ? "bg-[#3D6B22]/10 text-[#3D6B22]"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <StatusGlyph cell={{ type: opt.type }} compact />
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {cell.type === "specific_times" && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Times
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ADL_TIME_SLOTS.map((slot) => {
              const active = (cell.times || []).includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onToggleTime(slot)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                    active
                      ? "bg-[#3D6B22] text-white border-[#3D6B22]"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
