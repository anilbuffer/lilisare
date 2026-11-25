"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Users,
  Send,
  Printer,
  Download,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Radio,
  Clock,
  AlertCircle,
  Car,
  Maximize2,
  Sparkles,
  Trash2,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  RealTimeVisit,
  VisitStatus,
  CaregiverMatchScore,
  VisitBroadcastRecord,
  SchedulingGridSettings,
} from "@/types/scheduling";
import { ClientRecord } from "@/types/client";
import { CaregiverRecord } from "@/types/caregiver";
import { Household } from "@/lib/households/mockData";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";
import {
  getVisitsFromStorage,
  saveVisitsToStorage,
  getSyncedSchedulingContext,
  subscribeToSchedulingSync,
  ALL_VISIT_STATUSES,
  formatCompactTime,
  formatHoursShort,
  computeVisitConflicts,
  createBroadcastRecord,
} from "@/lib/scheduling/schedulingStore";
import { VISIT_STATUS_PALETTE } from "./statusPalette";
import { VisitInspectorDrawer } from "./VisitInspectorDrawer";
import { RecommendCaregiverModal } from "./RecommendCaregiverModal";
import { SendToCaregiversModal } from "./SendToCaregiversModal";
import { AddVisitModal } from "./AddVisitModal";

type MatrixViewMode =
  | "clients_with_visits"
  | "all_clients"
  | "caregivers_with_visits"
  | "all_caregivers";

interface RealTimeSchedulingWorkspaceProps {
  portal: "admin" | "intake";
}

function getMondayOfWeek(anchor: Date): Date {
  const d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function RealTimeSchedulingWorkspace({ portal }: RealTimeSchedulingWorkspaceProps) {
  const router = useRouter();
  const perms = usePortalPermissions(portal);

  // RBAC rules:
  // Agency Admin -> full CRUD + financial visibility
  // Intake Coordinator -> operational scheduling permissions, no delete of billed/completed, no bill/pay dollar visibility
  const canViewFinancials = perms.isAdmin;
  const canEditFinancials = perms.isAdmin;
  const canDeleteVisits = perms.isAdmin;

  // Live synced entities
  const [visits, setVisits] = useState<RealTimeVisit[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverRecord[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Week date state (anchored to Nov 23, 2026 Monday of the current week 2026-11-25)
  const [weekStart, setWeekStart] = useState<Date>(() =>
    getMondayOfWeek(new Date(2026, 10, 25))
  );

  // Legend status toggles & Include Removed
  const [visibleStatuses, setVisibleStatuses] = useState<Record<VisitStatus, boolean>>({
    Unassigned: true,
    Scheduled: true,
    Verified: true,
    Standalone: true,
    Completed: true,
    "In-Progress": true,
    Missed: true,
  });
  const [includeRemoved, setIncludeRemoved] = useState(false);

  // Toolbar controls
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<MatrixViewMode>("clients_with_visits");
  const [openVisitsOnly, setOpenVisitsOnly] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SchedulingGridSettings>({
    density: "comfortable",
    timeFormat: "12h",
    showConflictBadges: true,
    showTravelMetrics: true,
    highlightToday: true,
    showFinancialSummary: true,
  });

  // Inspector & Modals
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [hoveredVisitId, setHoveredVisitId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDefaults, setAddModalDefaults] = useState<{
    clientId?: string;
    caregiverId?: string;
    date?: string;
  }>({});
  const [recommendVisit, setRecommendVisit] = useState<RealTimeVisit | null>(null);
  const [broadcastVisit, setBroadcastVisit] = useState<RealTimeVisit | null>(null);

  // Initial load + cross-portal real-time sync subscription
  useEffect(() => {
    const loadAll = () => {
      const ctx = getSyncedSchedulingContext();
      setClients(ctx.clients);
      setCaregivers(ctx.caregivers);
      setHouseholds(ctx.households);
      const rawVisits = getVisitsFromStorage();
      // Compute dynamic conflicts cleanly
      const enriched = rawVisits.map((v) => ({
        ...v,
        conflicts: computeVisitConflicts(v, rawVisits),
      }));
      setVisits(enriched);
    };

    queueMicrotask(() => {
      loadAll();
      setIsHydrated(true);
    });

    const unsub = subscribeToSchedulingSync(() => {
      loadAll();
    });
    return unsub;
  }, []);

  // 7-day columns for active week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + idx);
      const iso = toIsoDate(d);
      const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.getDate();
      const isToday = iso === "2026-11-25";
      return { date: d, iso, label: `${weekday} ${dayNum}`, isToday };
    });
  }, [weekStart]);

  const weekRangeLabel = useMemo(() => {
    const first = weekDays[0].date;
    const last = weekDays[6].date;
    const fStr = first.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const lStr = last.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fStr} – ${lStr}`;
  }, [weekDays]);

  const weekStartIso = weekDays[0].iso;
  const weekEndIso = weekDays[6].iso;

  // Visits within the active week (respecting includeRemoved + search, BEFORE legend status filter, so Legend counters stay accurate)
  const weekBaseVisits = useMemo(() => {
    return visits.filter((v) => {
      if (!includeRemoved && v.isRemoved) return false;
      if (v.date < weekStartIso || v.date > weekEndIso) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${v.id} ${v.clientName} ${v.caregiverName || "unassigned"} ${v.serviceCode} ${v.serviceName} ${v.householdName} ${v.clientRegion}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [visits, includeRemoved, weekStartIso, weekEndIso, searchQuery]);

  // Legend status counts
  const legendCounts = useMemo(() => {
    const counts: Record<VisitStatus, number> = {
      Unassigned: 0,
      Scheduled: 0,
      Verified: 0,
      Standalone: 0,
      Completed: 0,
      "In-Progress": 0,
      Missed: 0,
    };
    weekBaseVisits.forEach((v) => {
      counts[v.status] = (counts[v.status] || 0) + 1;
    });
    return counts;
  }, [weekBaseVisits]);

  // Final filtered visits displayed in the 7-day matrix
  const visibleVisits = useMemo(() => {
    return weekBaseVisits.filter((v) => {
      if (!visibleStatuses[v.status]) return false;
      if (openVisitsOnly && v.status !== "Unassigned") return false;
      return true;
    });
  }, [weekBaseVisits, visibleStatuses, openVisitsOnly]);

  // Sticky Weekly KPI Summary
  const weeklyKpis = useMemo(() => {
    const activeSet = visibleVisits.filter((v) => !v.isRemoved);
    const uniqueClients = new Set(activeSet.map((v) => v.clientId)).size;
    const uniqueCaregivers = new Set(
      activeSet.map((v) => v.caregiverId).filter(Boolean)
    ).size;
    const billable = activeSet.reduce((acc, v) => acc + v.billableHours, 0);
    const payable = activeSet.reduce((acc, v) => acc + v.payableHours, 0);
    const scheduled = activeSet.reduce((acc, v) => acc + v.scheduledHours, 0);
    const verifiedCount = activeSet.filter((v) => v.evvStatus === "Verified").length;
    return {
      visits: activeSet.length,
      caregivers: uniqueCaregivers,
      clients: uniqueClients,
      billable: Math.round(billable * 100) / 100,
      payable: Math.round(payable * 100) / 100,
      scheduled: Math.round(scheduled * 100) / 100,
      verifiedCount,
    };
  }, [visibleVisits]);

  // Sticky Daily KPI Summaries
  const dailyKpis = useMemo(() => {
    const map: Record<
      string,
      {
        visits: number;
        caregivers: number;
        clients: number;
        billable: number;
        payable: number;
        scheduled: number;
        verifiedCount: number;
      }
    > = {};
    weekDays.forEach((d) => {
      const dayVisits = visibleVisits.filter((v) => v.date === d.iso && !v.isRemoved);
      map[d.iso] = {
        visits: dayVisits.length,
        caregivers: new Set(dayVisits.map((v) => v.caregiverId).filter(Boolean)).size,
        clients: new Set(dayVisits.map((v) => v.clientId)).size,
        billable:
          Math.round(dayVisits.reduce((acc, v) => acc + v.billableHours, 0) * 100) / 100,
        payable:
          Math.round(dayVisits.reduce((acc, v) => acc + v.payableHours, 0) * 100) / 100,
        scheduled:
          Math.round(dayVisits.reduce((acc, v) => acc + v.scheduledHours, 0) * 100) / 100,
        verifiedCount: dayVisits.filter((v) => v.evvStatus === "Verified").length,
      };
    });
    return map;
  }, [visibleVisits, weekDays]);

  // Matrix Rows (Clients OR Caregivers depending on viewMode)
  const isCaregiverMatrix =
    viewMode === "caregivers_with_visits" || viewMode === "all_caregivers";

  const matrixRows = useMemo(() => {
    if (!isCaregiverMatrix) {
      const allClientRows = clients.map((c) => {
        const clientVisits = visibleVisits.filter((v) => v.clientId === c.id);
        const totalHours = clientVisits.reduce((acc, v) => acc + v.scheduledHours, 0);
        return {
          id: c.id,
          name: c.name,
          subtitle: c.household?.name || c.careType,
          totalHours: Math.round(totalHours * 100) / 100,
          authCap: c.carePlan?.authorizedWeeklyHours || 40,
          visits: clientVisits,
        };
      });

      const filtered =
        viewMode === "clients_with_visits"
          ? allClientRows.filter((r) => r.visits.length > 0)
          : allClientRows;

      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Caregiver rows (+ Unassigned row at top if any open shifts)
    const unassignedVisits = visibleVisits.filter((v) => !v.caregiverId);
    const cgRows = caregivers.map((cg) => {
      const cgVisits = visibleVisits.filter((v) => v.caregiverId === cg.id);
      const totalHours = cgVisits.reduce((acc, v) => acc + v.scheduledHours, 0);
      return {
        id: cg.id,
        name: cg.name,
        subtitle: `${cg.type} · ${cg.employmentClassification}`,
        totalHours: Math.round(totalHours * 100) / 100,
        authCap: cg.availabilityAssignments?.weeklyCapacityHours || 40,
        visits: cgVisits,
      };
    });

    const filteredCg =
      viewMode === "caregivers_with_visits"
        ? cgRows.filter((r) => r.visits.length > 0)
        : cgRows;

    const sorted = filteredCg.sort((a, b) => a.name.localeCompare(b.name));
    if (unassignedVisits.length > 0) {
      return [
        {
          id: "__UNASSIGNED__",
          name: "Unassigned Open Shifts",
          subtitle: "Needs Immediate Coverage",
          totalHours:
            Math.round(
              unassignedVisits.reduce((acc, v) => acc + v.scheduledHours, 0) * 100
            ) / 100,
          authCap: 0,
          visits: unassignedVisits,
        },
        ...sorted,
      ];
    }
    return sorted;
  }, [isCaregiverMatrix, viewMode, clients, caregivers, visibleVisits]);

  // CRUD & Sync Handlers
  const persistVisits = (nextVisits: RealTimeVisit[]) => {
    const withConflicts = nextVisits.map((v) => ({
      ...v,
      conflicts: computeVisitConflicts(v, nextVisits),
    }));
    setVisits(withConflicts);
    saveVisitsToStorage(withConflicts);
  };

  const handleSaveVisit = (updated: RealTimeVisit) => {
    const auditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      actor: perms.actorName,
      actorRole: perms.roleLabel,
      action: "Schedule Updated",
      reason: updated.modificationReason,
      details: `Updated ${updated.date} (${updated.startTime}–${updated.endTime}), Status: ${updated.status}, Caregiver: ${updated.caregiverName || "Unassigned"}.`,
    };
    const next = visits.map((v) =>
      v.id === updated.id
        ? { ...updated, auditTrail: [auditEntry, ...(updated.auditTrail || [])] }
        : v
    );
    persistVisits(next);
    toast.success(`Visit ${updated.id} saved & synced across portals`);
  };

  const handleCreateVisit = (newVisit: RealTimeVisit) => {
    persistVisits([newVisit, ...visits]);
    setSelectedVisitId(newVisit.id);
  };

  const handleDeleteOrRemoveVisit = (visitId: string) => {
    const target = visits.find((v) => v.id === visitId);
    if (!target) return;

    if (canDeleteVisits) {
      const next = visits.filter((v) => v.id !== visitId);
      persistVisits(next);
      if (selectedVisitId === visitId) setSelectedVisitId(null);
      toast.success(`Visit ${visitId} deleted from schedule`);
    } else {
      // Intake Coordinator soft-removes with audit entry
      const next = visits.map((v) =>
        v.id === visitId
          ? {
            ...v,
            isRemoved: true,
            isModifiedFromSchedule: true,
            modificationReason: "Removed by Intake Coordinator",
            auditTrail: [
              {
                id: `aud-${Date.now()}`,
                timestamp: new Date().toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                actor: perms.actorName,
                actorRole: perms.roleLabel,
                action: "Visit Marked Removed",
                details: "Soft-removed from active grid (enable INCLUDE REMOVED to view).",
              },
              ...(v.auditTrail || []),
            ],
          }
          : v
      );
      persistVisits(next);
      if (selectedVisitId === visitId) setSelectedVisitId(null);
      toast.info(`Visit ${visitId} marked removed (check INCLUDE REMOVED to restore)`);
    }
  };

  const handleDuplicateVisit = (source: RealTimeVisit) => {
    const baseDate = new Date(`${source.date}T12:00:00`);
    baseDate.setDate(baseDate.getDate() + 1);
    const nextDate = toIsoDate(baseDate);
    const num = Math.floor(500 + Math.random() * 450);
    const clone: RealTimeVisit = {
      ...source,
      id: `VIS-${num + 1000}`,
      shiftNumber: `#${num}`,
      date: nextDate,
      status: source.caregiverId ? "Scheduled" : "Unassigned",
      isRemoved: false,
      evvStatus: "Not Started",
      careNoteStatus: "Pending",
      clockInActual: undefined,
      clockOutActual: undefined,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          actor: perms.actorName,
          actorRole: perms.roleLabel,
          action: "Visit Duplicated",
          details: `Cloned from ${source.id} onto ${nextDate}.`,
        },
      ],
    };
    persistVisits([clone, ...visits]);
    setSelectedVisitId(clone.id);
    toast.success(`Duplicated ${source.id} to ${nextDate} as ${clone.id}`);
  };

  const handleAssignFromRecommend = (visitId: string, match: CaregiverMatchScore) => {
    const cg = caregivers.find((c) => c.id === match.caregiverId);
    const next = visits.map((v) => {
      if (v.id !== visitId) return v;
      return {
        ...v,
        caregiverId: match.caregiverId,
        caregiverName: match.caregiverName,
        caregiverAdmin: "Dana Jenkins, MSW",
        caregiverClass: `${match.type} (${match.employmentClassification})`,
        caregiverRegion: match.region,
        status: "Scheduled" as VisitStatus,
        isModifiedFromSchedule: true,
        modificationReason: "Matched via Smart Recommender",
        travelMinutes: match.travelMinutes,
        distanceMiles: match.distanceMiles,
        auditTrail: [
          {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            actor: perms.actorName,
            actorRole: perms.roleLabel,
            action: "Caregiver Assigned via RECOMMEND",
            details: `Assigned ${match.caregiverName} (${match.overallScore}% match, ${match.distanceMiles} mi).`,
          },
          ...(v.auditTrail || []),
        ],
      };
    });
    persistVisits(next);
    toast.success(
      `Assigned ${cg?.name || match.caregiverName} (${match.overallScore}% match) to ${visitId}`
    );
  };

  const handleSendBroadcast = (
    visitId: string,
    caregiverIds: string[],
    caregiverNames: string[],
    channel: VisitBroadcastRecord["channel"],
    urgency: VisitBroadcastRecord["urgency"],
    message: string
  ) => {
    const record = createBroadcastRecord(
      caregiverIds,
      caregiverNames,
      perms.actorName,
      channel,
      urgency,
      message
    );
    const next = visits.map((v) => {
      if (v.id !== visitId) return v;
      return {
        ...v,
        broadcasts: [record, ...(v.broadcasts || [])],
        auditTrail: [
          {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            actor: perms.actorName,
            actorRole: perms.roleLabel,
            action: `Broadcast Sent (${channel})`,
            details: `Sent shift offer to ${caregiverNames.length} caregiver(s): ${caregiverNames.join(", ")}.`,
          },
          ...(v.auditTrail || []),
        ],
      };
    });
    persistVisits(next);
    toast.success(`Shift broadcast sent to ${caregiverIds.length} active caregiver(s)`);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setOpenVisitsOnly(false);
    setIncludeRemoved(false);
    setVisibleStatuses({
      Unassigned: true,
      Scheduled: true,
      Verified: true,
      Standalone: true,
      Completed: true,
      "In-Progress": true,
      Missed: true,
    });
    toast.success("All scheduling filters cleared");
  };

  const allLegendHidden = Object.values(visibleStatuses).every((v) => !v);
  const toggleAllLegend = () => {
    const nextVal = allLegendHidden;
    setVisibleStatuses({
      Unassigned: nextVal,
      Scheduled: nextVal,
      Verified: nextVal,
      Standalone: nextVal,
      Completed: nextVal,
      "In-Progress": nextVal,
      Missed: nextVal,
    });
  };

  const handleExportCsv = () => {
    const headers = [
      "Visit ID",
      "Date",
      "Start",
      "End",
      "Hours",
      "Status",
      "Client",
      "Household",
      "Caregiver",
      "Service Code",
      "Service Name",
      "EVV Status",
      "Care Note Status",
      ...(canViewFinancials ? ["Bill Rate", "Pay Rate", "Est Billable"] : []),
    ];
    const rows = visibleVisits.map((v) => [
      v.id,
      v.date,
      v.startTime,
      v.endTime,
      v.scheduledHours,
      v.status,
      `"${v.clientName}"`,
      `"${v.householdName}"`,
      `"${v.caregiverName || "UNASSIGNED"}"`,
      v.serviceCode,
      `"${v.serviceName}"`,
      v.evvStatus,
      v.careNoteStatus,
      ...(canViewFinancials
        ? [v.billRate.toFixed(2), v.payRate.toFixed(2), (v.billRate * v.billableHours).toFixed(2)]
        : []),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lilisare-schedule-${weekStartIso}-to-${weekEndIso}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${visibleVisits.length} visits to CSV`);
  };

  const selectedVisit = useMemo(
    () => visits.find((v) => v.id === selectedVisitId) || null,
    [visits, selectedVisitId]
  );

  if (!isHydrated) {
    return (
      <div className="w-full max-w-[1600px] mx-auto py-16 text-center text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold">Synchronizing Real-Time Scheduling Grid...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1680px] mx-auto space-y-4 pb-10 animate-in fade-in duration-200">
      <div className="w-full space-y-3.5">
        {/* ================================================================= */}
        {/* 01. TOP CONTROL SURFACE (Real Time View & Toolbar)                */}
        {/* ================================================================= */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Title + LIVE */}
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Real Time View
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#E3F1D9] text-[#1E5622] border border-[#93C573]">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22] animate-pulse" />
                <Radio className="w-3 h-3" />
                <span>LIVE</span>
              </span>
            </div>

            {/* Right: Connected Workflows & Add visit */}
            <div className="flex items-center gap-2">
              <Link
                href="/admin/evv-visits/"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-[#3D6B22]" />
                <span>EVV Monitoring</span>
              </Link>
              <Link
                href="/admin/caregivers/"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-[#3D6B22]" />
                <span>Caregivers</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setAddModalDefaults({ date: weekDays[2]?.iso || "2026-11-25" });
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] shadow-sm shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add a visit</span>
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* 02. TOOLBAR ROW                                                   */}
          {/* ================================================================= */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex items-center">
                {isSearchOpen || searchQuery ? (
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:bg-white focus-within:border-[#3D6B22] focus-within:ring-2 focus-within:ring-[#3D6B22]/20 transition-all">
                    <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search client, caregiver, code..."
                      className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none w-44 sm:w-56"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchOpen(false);
                      }}
                      className="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <span>Search</span>
                  </button>
                )}
              </div>

              {/* Clients / Caregivers View Toggle */}
              <div className="relative">
                <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
                  <Users className="w-3.5 h-3.5 text-[#3D6B22] mr-1.5 shrink-0" />
                  <select
                    aria-label="Matrix view mode"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as MatrixViewMode)}
                    className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-1"
                  >
                    <option value="clients_with_visits">Clients with visits</option>
                    <option value="all_clients">All Clients</option>
                    <option value="caregivers_with_visits">Caregivers with visits</option>
                    <option value="all_caregivers">All Caregivers</option>
                  </select>
                </div>
              </div>

              {/* Open Visits quick toggle */}
              <button
                type="button"
                onClick={() => setOpenVisitsOnly(!openVisitsOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${openVisitsOnly
                  ? "bg-[#D93829] text-white border-[#B91C1C] shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open visits</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${openVisitsOnly
                    ? "bg-white/20 text-white"
                    : "bg-rose-50 text-[#D93829] border border-rose-200"
                    }`}
                >
                  {legendCounts.Unassigned}
                </span>
              </button>

              {/* Print */}
              <button
                type="button"
                onClick={() => {
                  toast.info("Preparing print view for Real-Time Schedule...");
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Print</span>
              </button>

              {/* Export */}
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Settings */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${isSettingsOpen
                    ? "bg-[#F2F8EE] text-[#3D6B22] border-[#93C573]"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Settings</span>
                </button>

                {isSettingsOpen && (
                  <div className="absolute right-0 sm:left-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-[0_14px_40px_rgba(0,0,0,0.14)] z-50 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#3D6B22]" />
                        Grid Display Settings
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSettingsOpen(false)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">Row Density</span>
                        <select
                          value={settings.density}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              density: e.target.value as "comfortable" | "compact",
                            }))
                          }
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold"
                        >
                          <option value="comfortable">Comfortable</option>
                          <option value="compact">Compact</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">Time Format</span>
                        <select
                          value={settings.timeFormat}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              timeFormat: e.target.value as "12h" | "24h",
                            }))
                          }
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold"
                        >
                          <option value="12h">12h (8a-4p)</option>
                          <option value="24h">24h (08:00-16:00)</option>
                        </select>
                      </div>

                      <label className="flex items-center justify-between pt-1 cursor-pointer">
                        <span className="font-medium text-slate-700">
                          Show Conflict Badges
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.showConflictBadges}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              showConflictBadges: e.target.checked,
                            }))
                          }
                          className="rounded border-slate-300 text-[#3D6B22]"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-medium text-slate-700">
                          Highlight Today Column
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.highlightToday}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              highlightToday: e.target.checked,
                            }))
                          }
                          className="rounded border-slate-300 text-[#3D6B22]"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Filters (situated just right of the Settings button) */}
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-[11px] font-extrabold text-[#3D6B22] hover:text-[#2C5217] uppercase tracking-wider hover:underline cursor-pointer px-1.5 py-1.5 transition-colors"
              >
                CLEAR FILTERS
              </button>
            </div>

            {/* Week Quick Navigation */}
            <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const prev = new Date(weekStart);
                  prev.setDate(prev.getDate() - 7);
                  setWeekStart(prev);
                }}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
                title="Previous Week"
                aria-label="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setWeekStart(getMondayOfWeek(new Date(2026, 10, 25)))}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-white transition-colors cursor-pointer"
              >
                {weekRangeLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = new Date(weekStart);
                  next.setDate(next.getDate() + 7);
                  setWeekStart(next);
                }}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
                title="Next Week"
                aria-label="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 02B. FULL-WIDTH INTERACTIVE LEGEND (Directly Above Grid)          */}
        {/* ================================================================= */}
        <div className="w-full bg-white rounded-xl lg:rounded-2xl px-4 py-3 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 shrink-0 text-xs">
            <span className="font-bold text-slate-800">Legend</span>
            <button
              type="button"
              onClick={toggleAllLegend}
              className="text-[11px] font-extrabold text-[#3D6B22] hover:underline uppercase tracking-wide cursor-pointer"
            >
              {allLegendHidden ? "SHOW ALL" : "HIDE ALL"}
            </button>
            <span className="h-3.5 w-px bg-slate-200 hidden sm:inline-block" />
            <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeRemoved}
                onChange={(e) => setIncludeRemoved(e.target.checked)}
                className="rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]"
              />
              <span>INCLUDE REMOVED</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {ALL_VISIT_STATUSES.map((st) => {
              const pal = VISIT_STATUS_PALETTE[st];
              const isOn = visibleStatuses[st];
              const count = legendCounts[st] || 0;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() =>
                    setVisibleStatuses((prev) => ({ ...prev, [st]: !prev[st] }))
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${isOn
                    ? `${pal.legendActiveBg} ${pal.legendActiveText} ${pal.legendActiveBorder} shadow-2xs`
                    : "bg-white text-slate-400 border-slate-200 opacity-65 hover:opacity-100"
                    }`}
                >
                  {st === "Missed" ? (
                    <Clock className="w-3 h-3 shrink-0" />
                  ) : (
                    <Check
                      className={`w-3 h-3 shrink-0 ${isOn ? "opacity-100" : "opacity-30"}`}
                    />
                  )}
                  <span>{st}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${isOn ? pal.legendCountBg : "bg-slate-100 text-slate-500"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 03. 7-DAY SHIFT MATRIX + STICKY WEEKLY / DAILY KPI SUMMARY ROW   */}
        {/* ================================================================= */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[980px] text-left">
              <thead className="sticky top-0 z-20 bg-white">
                {/* Column Headers */}
                <tr className="border-b border-slate-200 bg-slate-50/90">
                  <th className="sticky left-0 z-30 bg-slate-50/95 backdrop-blur-sm border-r border-slate-200 px-3.5 py-2.5 w-[205px] min-w-[205px]">
                    <button
                      type="button"
                      onClick={() =>
                        setViewMode((m) =>
                          m.startsWith("clients")
                            ? "caregivers_with_visits"
                            : "clients_with_visits"
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#3D6B22] hover:text-[#2C5217] cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{isCaregiverMatrix ? "Caregivers" : "Clients"}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </th>

                  {weekDays.map((day) => (
                    <th
                      key={day.iso}
                      className={`px-2.5 py-2.5 text-center border-r border-slate-200 last:border-r-0 min-w-[128px] ${settings.highlightToday && day.isToday
                        ? "bg-[#F2F8EE] text-[#1E5622]"
                        : "text-slate-700"
                        }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                        <span>{day.label}</span>
                        {settings.highlightToday && day.isToday && (
                          <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-[#3D6B22] text-white">
                            Today
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>

                {/* Sticky Weekly / Daily KPI Summary Row */}
                <tr className="border-b-2 border-slate-200 bg-[#F7F9F8] text-[10px]">
                  {/* Weekly KPI Summary Cell */}
                  <th className="sticky left-0 z-30 bg-[#F2F8EE]/90 backdrop-blur-sm border-r border-slate-200 px-3 py-2 font-normal align-top">
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1.5">
                      <div>
                        <div className="text-[9px] font-medium text-slate-500 uppercase">
                          Visits
                        </div>
                        <div className="text-xs font-extrabold text-slate-900">
                          {weeklyKpis.visits}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-medium text-slate-500 uppercase">
                          Caregivers
                        </div>
                        <div className="text-xs font-extrabold text-slate-900">
                          {weeklyKpis.caregivers}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-medium text-slate-500 uppercase">
                          Clients
                        </div>
                        <div className="text-xs font-extrabold text-slate-900">
                          {weeklyKpis.clients}
                        </div>
                      </div>

                      {canViewFinancials ? (
                        <>
                          <div>
                            <div className="text-[9px] font-medium text-slate-500 uppercase">
                              Billable
                            </div>
                            <div className="text-[11px] font-bold text-[#3D6B22]">
                              {weeklyKpis.billable} hrs
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] font-medium text-slate-500 uppercase">
                              Payable
                            </div>
                            <div className="text-[11px] font-bold text-slate-700">
                              {weeklyKpis.payable} hrs
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] font-medium text-slate-500 uppercase">
                              Scheduled
                            </div>
                            <div className="text-[11px] font-bold text-slate-900">
                              {weeklyKpis.scheduled} hrs
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <div className="text-[9px] font-medium text-slate-500 uppercase">
                              EVV Ready
                            </div>
                            <div className="text-[11px] font-bold text-[#3D6B22]">
                              {weeklyKpis.verifiedCount}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] font-medium text-slate-500 uppercase">
                              Open
                            </div>
                            <div className="text-[11px] font-bold text-[#D93829]">
                              {legendCounts.Unassigned}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] font-medium text-slate-500 uppercase">
                              Scheduled
                            </div>
                            <div className="text-[11px] font-bold text-slate-900">
                              {weeklyKpis.scheduled} hrs
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </th>

                  {/* Daily KPI Summary Cells */}
                  {weekDays.map((day) => {
                    const k = dailyKpis[day.iso];
                    return (
                      <th
                        key={`kpi-${day.iso}`}
                        className={`border-r border-slate-200 last:border-r-0 px-2.5 py-2 font-normal align-top ${settings.highlightToday && day.isToday
                          ? "bg-[#F2F8EE]/70"
                          : ""
                          }`}
                      >
                        <div className="grid grid-cols-3 gap-x-1 gap-y-1.5 text-left">
                          <div>
                            <div className="text-[9px] font-medium text-slate-500">
                              Visits
                            </div>
                            <div className="text-[11px] font-bold text-slate-800">
                              {k?.visits || 0}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] font-medium text-slate-500">
                              Caregivers
                            </div>
                            <div className="text-[11px] font-bold text-slate-800">
                              {k?.caregivers || 0}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] font-medium text-slate-500">
                              Clients
                            </div>
                            <div className="text-[11px] font-bold text-slate-800">
                              {k?.clients || 0}
                            </div>
                          </div>

                          {canViewFinancials ? (
                            <>
                              <div>
                                <div className="text-[9px] font-medium text-slate-500">
                                  Billable
                                </div>
                                <div className="text-[10px] font-bold text-[#3D6B22]">
                                  {k?.billable || 0}h
                                </div>
                              </div>
                              <div>
                                <div className="text-[9px] font-medium text-slate-500">
                                  Payable
                                </div>
                                <div className="text-[10px] font-bold text-slate-700">
                                  {k?.payable || 0}h
                                </div>
                              </div>
                              <div>
                                <div className="text-[9px] font-medium text-slate-500">
                                  Scheduled
                                </div>
                                <div className="text-[10px] font-bold text-slate-900">
                                  {k?.scheduled || 0}h
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <div className="text-[9px] font-medium text-slate-500">
                                  EVV
                                </div>
                                <div className="text-[10px] font-bold text-[#3D6B22]">
                                  {k?.verifiedCount || 0}
                                </div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-[9px] font-medium text-slate-500">
                                  Scheduled
                                </div>
                                <div className="text-[10px] font-bold text-slate-900">
                                  {k?.scheduled || 0} hrs
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {matrixRows.map((row) => (
                  <tr
                    key={row.id}
                    className="group/row hover:bg-slate-50/40 transition-colors"
                  >
                    {/* Sticky Left Entity Cell */}
                    <td className="sticky left-0 z-10 bg-white group-hover/row:bg-slate-50/95 border-r border-slate-200 px-3.5 py-3 align-middle">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          {row.id === "__UNASSIGNED__" ? (
                            <div className="text-xs font-extrabold text-[#D93829] truncate">
                              {row.name}
                            </div>
                          ) : (
                            <Link
                              href={
                                isCaregiverMatrix
                                  ? `/${portal}/caregivers/${row.id}/`
                                  : `/${portal}/clients/${row.id}/`
                              }
                              className="text-xs font-bold text-slate-900 hover:text-[#3D6B22] hover:underline truncate block"
                            >
                              {row.name}{" "}
                              <span className="font-semibold text-slate-400">
                                ({row.totalHours})
                              </span>
                            </Link>
                          )}
                          <div className="text-[10px] font-medium text-slate-400 truncate mt-0.5">
                            {row.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 7 Day Cells */}
                    {weekDays.map((day) => {
                      const cellVisits = row.visits
                        .filter((v) => v.date === day.iso)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime));

                      return (
                        <td
                          key={`${row.id}-${day.iso}`}
                          className={`group/cell relative border-r border-slate-200 last:border-r-0 align-top transition-colors ${settings.density === "compact" ? "p-1.5" : "p-2"
                            } ${settings.highlightToday && day.isToday
                              ? "bg-[#F2F8EE]/35"
                              : "bg-white"
                            }`}
                        >
                          <div className="space-y-1.5 min-h-[38px]">
                            {cellVisits.map((visit) => {
                              const pal = VISIT_STATUS_PALETTE[visit.status];
                              const isSelected = selectedVisitId === visit.id;
                              const isHovered = hoveredVisitId === visit.id;
                              const hasConflict =
                                settings.showConflictBadges &&
                                (visit.conflicts.length > 0 ||
                                  visit.isModifiedFromSchedule);

                              return (
                                <div
                                  key={visit.id}
                                  className="relative"
                                  onMouseEnter={() => setHoveredVisitId(visit.id)}
                                  onMouseLeave={() =>
                                    setHoveredVisitId((prev) =>
                                      prev === visit.id ? null : prev
                                    )
                                  }
                                >
                                  {/* Shift Pill */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedVisitId(visit.id)}
                                    className={`w-full text-left px-2 py-1 rounded-full border text-[10px] font-semibold flex items-center justify-between gap-1.5 transition-all cursor-pointer ${pal.pillBg
                                      } ${pal.pillBorder} ${pal.pillText} ${pal.pillHover
                                      } ${isSelected
                                        ? "ring-2 ring-[#3D6B22] ring-offset-1 shadow-sm scale-[1.01]"
                                        : "shadow-2xs"
                                      } ${visit.isRemoved ? "opacity-55 line-through" : ""}`}
                                  >
                                    <span className="inline-flex items-center gap-1 min-w-0 truncate">
                                      {hasConflict && (
                                        <AlertCircle className="w-3 h-3 shrink-0 opacity-90" />
                                      )}
                                      <span className="truncate">
                                        {formatCompactTime(
                                          visit.startTime,
                                          settings.timeFormat
                                        )}
                                        -
                                        {formatCompactTime(
                                          visit.endTime,
                                          settings.timeFormat
                                        )}{" "}
                                        {isCaregiverMatrix
                                          ? visit.clientName
                                          : visit.caregiverName || "UNASSIGNED"}
                                      </span>
                                    </span>
                                    {!visit.caregiverId && (
                                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-1 rounded bg-black/15 shrink-0">
                                        OPEN
                                      </span>
                                    )}
                                  </button>

                                  {/* Rich Floating Hover Card (matching Reference Image) */}
                                  {isHovered && (
                                    <div
                                      className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-60 rounded-xl shadow-[0_14px_38px_rgba(0,0,0,0.22)] border border-slate-200 overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-100"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div
                                        className={`p-3 text-white space-y-1.5 ${pal.hoverHeaderBg}`}
                                      >
                                        <div className="text-[11px] font-bold opacity-95 truncate">
                                          {visit.modificationReason &&
                                            visit.modificationReason !==
                                            "None / Original Schedule"
                                            ? visit.modificationReason
                                            : `${visit.status} · ${visit.shiftNumber}`}
                                        </div>

                                        {settings.showTravelMetrics && (
                                          <div className="flex items-center gap-1.5 text-[11px] opacity-90">
                                            <Car className="w-3.5 h-3.5 shrink-0" />
                                            <span>
                                              0:{String(visit.travelMinutes).padStart(2, "0")}{" "}
                                              / {visit.distanceMiles} mi
                                            </span>
                                          </div>
                                        )}

                                        <div className="flex items-center justify-between text-xs font-extrabold">
                                          <span>
                                            {formatCompactTime(
                                              visit.startTime,
                                              settings.timeFormat
                                            )}{" "}
                                            –{" "}
                                            {formatCompactTime(
                                              visit.endTime,
                                              settings.timeFormat
                                            )}
                                          </span>
                                          <span>
                                            {formatHoursShort(visit.scheduledHours)}
                                          </span>
                                        </div>

                                        <div className="text-[11px] leading-snug opacity-95">
                                          <div className="font-bold">
                                            {visit.serviceCode} · {visit.serviceName}
                                          </div>
                                          <div className="font-extrabold uppercase tracking-wide mt-0.5">
                                            {visit.caregiverName || "UNASSIGNED"}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Quick Action Bar */}
                                      <div className="bg-white px-2.5 py-2 flex items-center justify-between border-t border-slate-100">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            router.push(
                                              `/${portal}/scheduling/${visit.id}/`
                                            )
                                          }
                                          className="p-1.5 rounded-lg text-slate-600 hover:text-[#3D6B22] hover:bg-[#F2F8EE] transition-colors cursor-pointer"
                                          title="Open Full-Page Visit Detail"
                                        >
                                          <Maximize2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setRecommendVisit(visit)}
                                          className="p-1.5 rounded-lg text-slate-600 hover:text-[#3D6B22] hover:bg-[#F2F8EE] transition-colors cursor-pointer"
                                          title="Recommend Caregivers"
                                        >
                                          <Sparkles className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setBroadcastVisit(visit)}
                                          className="p-1.5 rounded-lg text-slate-600 hover:text-[#0F5E6E] hover:bg-sky-50 transition-colors cursor-pointer"
                                          title="Send to Caregivers"
                                        >
                                          <Send className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeleteOrRemoveVisit(visit.id)
                                          }
                                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                          title={
                                            canDeleteVisits
                                              ? "Delete Visit"
                                              : "Remove Visit"
                                          }
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {/* Quick + Add in cell on hover */}
                            {row.id !== "__UNASSIGNED__" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAddModalDefaults({
                                    clientId: !isCaregiverMatrix ? row.id : undefined,
                                    caregiverId: isCaregiverMatrix ? row.id : undefined,
                                    date: day.iso,
                                  });
                                  setIsAddModalOpen(true);
                                }}
                                className="opacity-0 group-hover/cell:opacity-100 w-full py-0.5 rounded-lg border border-dashed border-slate-300 text-[10px] font-bold text-slate-400 hover:text-[#3D6B22] hover:border-[#93C573] hover:bg-[#F2F8EE]/60 transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add</span>
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {matrixRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-xs text-slate-500"
                    >
                      <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-700">
                        No visits match the active filters for {weekRangeLabel}.
                      </p>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#3D6B22] hover:underline cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 04. CENTERED VISIT INSPECTOR MODAL OVERLAY                        */}
      {/* ================================================================= */}
      {selectedVisit && (
        <VisitInspectorDrawer
          key={selectedVisit.id}
          visit={selectedVisit}
          portal={portal}
          clients={clients}
          caregivers={caregivers}
          households={households}
          canDelete={canDeleteVisits}
          canViewFinancials={canViewFinancials}
          canEditFinancials={canEditFinancials}
          onClose={() => setSelectedVisitId(null)}
          onSave={handleSaveVisit}
          onDelete={handleDeleteOrRemoveVisit}
          onDuplicate={handleDuplicateVisit}
          onOpenRecommend={(v) => setRecommendVisit(v)}
          onOpenBroadcast={(v) => setBroadcastVisit(v)}
        />
      )}

      {/* ================================================================= */}
      {/* 05. WORKFLOW MODALS (Add Visit, Recommend, Send to Caregivers)    */}
      {/* ================================================================= */}
      {isAddModalOpen && (
        <AddVisitModal
          key={`${addModalDefaults.clientId || ""}-${addModalDefaults.caregiverId || ""}-${addModalDefaults.date || ""}`}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCreateVisit={handleCreateVisit}
          clients={clients}
          caregivers={caregivers}
          defaultClientId={addModalDefaults.clientId}
          defaultCaregiverId={addModalDefaults.caregiverId}
          defaultDate={addModalDefaults.date}
          actorName={perms.actorName}
          actorRole={perms.roleLabel}
          canViewFinancials={canViewFinancials}
        />
      )}

      {recommendVisit && (
        <RecommendCaregiverModal
          key={recommendVisit.id}
          isOpen={true}
          onClose={() => setRecommendVisit(null)}
          visit={recommendVisit}
          caregivers={caregivers}
          allVisits={visits}
          clients={clients}
          onAssignCaregiver={handleAssignFromRecommend}
        />
      )}

      {broadcastVisit && (
        <SendToCaregiversModal
          key={broadcastVisit.id}
          isOpen={true}
          onClose={() => setBroadcastVisit(null)}
          visit={broadcastVisit}
          caregivers={caregivers}
          allVisits={visits}
          clients={clients}
          onSendBroadcast={handleSendBroadcast}
        />
      )}
    </div>
  );
}
