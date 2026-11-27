"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  List,
  RotateCcw,
  Search,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/hooks/useAuth";
import { resolveClinicalActor } from "@/lib/admin/clinicalAuthGuard";
import {
  CLINICAL_PROFESSIONALS,
  DEMO_TODAY,
  getClinicalDetailHref,
  getClinicalVisits,
  subscribeToClinicalSync,
} from "@/lib/admin/clinicalSupervisoryStore";
import { ClinicalVisit } from "@/types/clinicalSupervisory";
import { ClinicalSubNav } from "./ClinicalSubNav";
import { ClinicalAvatarName, ClinicalVisitStatusBadge } from "./ClinicalBadges";
import { ScheduleClinicalVisitModal } from "./ClinicalActionModals";
import { Pagination } from "@/components/ui/Pagination";

function getMonday(anchor: Date): Date {
  const d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ClinicalScheduleWorkspace() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const actor = useMemo(() => resolveClinicalActor(currentUser), [currentUser]);

  const [visits, setVisits] = useState<ClinicalVisit[]>(() => getClinicalVisits());
  const [viewType, setViewType] = useState<"calendar" | "list">("calendar");
  const [calMode, setCalMode] = useState<"day" | "week" | "month">("week");
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date(2026, 10, 26));

  // Filters (aligned with table columns: Client, Visit Type, Assigned Professional, Date & Time, Status)
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [visitTypeFilter, setVisitTypeFilter] = useState("all");
  const [profFilter, setProfFilter] = useState("all");
  const [dateScopeFilter, setDateScopeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, clientFilter, visitTypeFilter, profFilter, dateScopeFilter, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setClientFilter("all");
    setVisitTypeFilter("all");
    setProfFilter("all");
    setDateScopeFilter("all");
    setStatusFilter("all");
  };

  // Schedule Modal for Unscheduled Visits
  const [scheduleTarget, setScheduleTarget] = useState<ClinicalVisit | null>(null);
  const [pickUnscheduledOpen, setPickUnscheduledOpen] = useState(false);

  useEffect(() => {
    const load = () => setVisits(getClinicalVisits());
    const timer = window.setTimeout(load, 0);
    const unsub = subscribeToClinicalSync(load);
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, []);

  const unscheduledQueue = useMemo(
    () =>
      visits.filter(
        (v) => v.visitStatus === "Unscheduled" || v.visitStatus === "Missed"
      ),
    [visits]
  );

  const uniqueVisitTypes = useMemo(
    () => Array.from(new Set(visits.map((v) => v.visitType))).sort(),
    [visits]
  );
  const uniqueClients = useMemo(
    () => Array.from(new Set(visits.map((v) => v.clientName))).sort(),
    [visits]
  );

  const filteredVisits = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return visits.filter((v) => {
      if (q) {
        const hay = `${v.id} ${v.clientName} ${v.visitType} ${v.serviceName} ${v.programName} ${v.professionalName || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (clientFilter !== "all" && v.clientName !== clientFilter) return false;
      if (visitTypeFilter !== "all" && v.visitType !== visitTypeFilter) return false;
      if (profFilter === "unassigned" && v.professionalId) return false;
      if (
        profFilter !== "all" &&
        profFilter !== "unassigned" &&
        v.professionalId !== profFilter
      ) {
        return false;
      }
      if (dateScopeFilter !== "all") {
        const visitDate = v.scheduledDate || v.dueDate;
        if (dateScopeFilter === "today" && visitDate !== DEMO_TODAY) return false;
        if (dateScopeFilter === "upcoming" && visitDate < DEMO_TODAY) return false;
        if (dateScopeFilter === "past" && visitDate >= DEMO_TODAY) return false;
      }
      if (statusFilter !== "all" && v.visitStatus !== statusFilter) return false;
      return true;
    });
  }, [
    visits,
    searchTerm,
    clientFilter,
    visitTypeFilter,
    profFilter,
    dateScopeFilter,
    statusFilter,
  ]);

  // Calendar grid days
  const calendarDays = useMemo(() => {
    if (calMode === "day") {
      return [anchorDate];
    }
    if (calMode === "week") {
      const mon = getMonday(anchorDate);
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        return d;
      });
    }
    const first = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const mon = getMonday(first);
    return Array.from({ length: 35 }).map((_, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return d;
    });
  }, [calMode, anchorDate]);

  const shiftAnchor = (dir: -1 | 1) => {
    const next = new Date(anchorDate);
    if (calMode === "day") next.setDate(next.getDate() + dir);
    else if (calMode === "week") next.setDate(next.getDate() + dir * 7);
    else next.setMonth(next.getMonth() + dir);
    setAnchorDate(next);
  };

  return (
    <div className="w-full max-w-9xl mx-auto min-w-0 space-y-5 animate-in fade-in duration-300 pb-10">
      <ClinicalSubNav activeTab="schedule" />

      {/* Top Scheduling Controls & Sync Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewType("calendar")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewType === "calendar"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-[#3D6B22]" />
                <span>Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => setViewType("list")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewType === "list"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="w-3.5 h-3.5 text-[#3D6B22]" />
                <span>List</span>
              </button>
            </div>

            {viewType === "calendar" && (
              <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(["day", "week", "month"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCalMode(m)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      calMode === m
                        ? "bg-[#3D6B22] text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {viewType === "calendar" && (
              <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => shiftAnchor(-1)}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 cursor-pointer"
                  aria-label="Previous period"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setAnchorDate(new Date(2026, 10, 26))}
                  className="px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-white rounded-lg cursor-pointer"
                >
                  {anchorDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </button>
                <button
                  type="button"
                  onClick={() => shiftAnchor(1)}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 cursor-pointer"
                  aria-label="Next period"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/scheduling/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#3D6B22]" />
              <span>Master Scheduling Grid</span>
            </Link>
            <button
              type="button"
              onClick={() => setPickUnscheduledOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Schedule Visit ({unscheduledQueue.length} ready)</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Reset (matching ClinicalRequirementsWorkspace) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search client, visit type, assigned professional..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer w-fit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Column-Aligned Filter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          <select
            aria-label="Filter by Client"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          >
            <option value="all">All Clients</option>
            {uniqueClients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Visit Type"
            value={visitTypeFilter}
            onChange={(e) => setVisitTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          >
            <option value="all">All Visit Types</option>
            {uniqueVisitTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Assigned Professional"
            value={profFilter}
            onChange={(e) => setProfFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          >
            <option value="all">All Professionals</option>
            <option value="unassigned">Unassigned</option>
            {CLINICAL_PROFESSIONALS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Date & Time"
            value={dateScopeFilter}
            onChange={(e) => setDateScopeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past / Overdue</option>
          </select>

          <select
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          >
            <option value="all">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Missed">Missed</option>
            <option value="Unscheduled">Unscheduled</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Calendar View */}
      {viewType === "calendar" && (
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div
            className={`grid ${
              calMode === "day" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-7"
            } divide-y md:divide-y-0 md:divide-x divide-slate-200`}
          >
            {calendarDays.map((dayObj) => {
              const iso = toIso(dayObj);
              const isToday = iso === DEMO_TODAY;
              const dayVisits = filteredVisits.filter(
                (v) => (v.scheduledDate || v.dueDate) === iso
              );

              return (
                <div
                  key={iso}
                  className={`min-w-0 min-h-[150px] p-3 flex flex-col gap-2 ${
                    isToday ? "bg-[#F2F8EE]/50" : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span
                      className={`text-xs font-bold ${
                        isToday ? "text-[#3D6B22]" : "text-slate-800"
                      }`}
                    >
                      {dayObj.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: calMode === "day" ? "short" : undefined,
                        day: "numeric",
                      })}
                    </span>
                    {isToday && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#3D6B22] text-white text-[9px] font-bold uppercase tracking-wider">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 flex-1 flex flex-col">
                    {dayVisits.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-[11px] text-slate-400 italic py-6">
                        No clinical visits
                      </div>
                    ) : (
                      dayVisits.map((v) => {
                        const isCompleted = v.visitStatus === "Completed";
                        const isScheduled =
                          v.visitStatus === "Scheduled" ||
                          v.visitStatus === "Rescheduled" ||
                          v.visitStatus === "In Progress";

                        const cardStyle = isCompleted
                          ? "bg-emerald-50/55 border-emerald-200/80 hover:border-emerald-300"
                          : isScheduled
                            ? "bg-purple-50/55 border-purple-200/80 hover:border-purple-300"
                            : "bg-amber-50/60 border-amber-200/80 hover:border-amber-300";

                        const timeBadgeStyle = isCompleted
                          ? "text-[#3D6B22] border-emerald-200/90"
                          : isScheduled
                            ? "text-purple-700 border-purple-200/90"
                            : "text-amber-700 border-amber-200/90";

                        const clientInitials = v.clientName
                          .split(" ")
                          .filter(Boolean)
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase();

                        return (
                          <div
                            key={v.id}
                            onClick={() => router.push(getClinicalDetailHref(v.id))}
                            className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer space-y-2 hover:-translate-y-0.5 hover:shadow-sm ${cardStyle}`}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider bg-white/90 px-1.5 py-0.5 rounded-md border ${timeBadgeStyle}`}
                              >
                                {v.scheduledStartTime
                                  ? `${v.scheduledStartTime}–${v.scheduledEndTime}`
                                  : "Due Date"}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-600 bg-white/75 px-1.5 py-0.5 rounded-md border border-slate-200/70 truncate">
                                {v.deliveryMethod}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-emerald-100/90 border border-emerald-200/70 flex items-center justify-center text-[9px] font-bold text-[#3D6B22] shrink-0">
                                  {clientInitials}
                                </span>
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {v.clientName}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 truncate pl-6.5">
                                {v.visitType}
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between gap-1.5 text-[10px]">
                              <span
                                className={`truncate ${
                                  v.professionalName
                                    ? "font-semibold text-slate-600"
                                    : "font-bold text-[#ff6900]"
                                }`}
                              >
                                {v.professionalName || "Unassigned"}
                              </span>
                              <span className="font-mono text-slate-400 shrink-0">
                                {v.visitStatus}
                              </span>
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
      )}

      {/* Standardized Clean List View (6 Concise Columns, Zero Horizontal Scroll) */}
      {viewType === "list" && (
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Visit Type</th>
                  <th className="py-3.5 px-4">Assigned Professional</th>
                  <th className="py-3.5 px-4">Date &amp; Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px] text-slate-700">
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <p className="font-semibold text-sm text-slate-700">
                        No matching clinical or supervisory visits found
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Adjust filters or schedule a pending visit.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredVisits
                    .slice(
                      (Math.min(currentPage, Math.max(1, Math.ceil(filteredVisits.length / pageSize))) - 1) * pageSize,
                      Math.min(currentPage, Math.max(1, Math.ceil(filteredVisits.length / pageSize))) * pageSize
                    )
                    .map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => router.push(getClinicalDetailHref(v.id))}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ClinicalAvatarName
                          name={v.clientName}
                          variant="client"
                          highlightHover
                        />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap truncate max-w-[190px]">
                        {v.visitType}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ClinicalAvatarName name={v.professionalName} variant="staff" />
                      </td>
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        {v.scheduledDate
                          ? `${v.scheduledDate} ${v.scheduledStartTime || ""}`
                          : `Due ${v.dueDate}`}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ClinicalVisitStatusBadge status={v.visitStatus} />
                      </td>
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={getClinicalDetailHref(v.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 transition-colors"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={Math.min(currentPage, Math.max(1, Math.ceil(filteredVisits.length / pageSize)))}
            totalPages={Math.max(1, Math.ceil(filteredVisits.length / pageSize))}
            totalItems={filteredVisits.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            entryLabel="visits"
          />
        </div>
      )}

      {/* Pick Unscheduled Visit Modal */}
      <Modal
        isOpen={pickUnscheduledOpen}
        onClose={() => setPickUnscheduledOpen(false)}
        title="Schedule Pending Clinical Visit"
        description="Select an unscheduled or missed clinical requirement to create a linked appointment in Scheduling."
        icon={<CalendarPlus className="w-5 h-5" />}
        maxWidth="lg"
      >
        <div className="space-y-2.5">
          {unscheduledQueue.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              All active clinical visits are already scheduled or completed.
            </p>
          ) : (
            unscheduledQueue.map((uv) => (
              <div
                key={uv.id}
                className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:border-[#3D6B22]/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900">
                    {uv.clientName} · {uv.visitType}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Due {uv.dueDate} · Requires {uv.professionalQualification} ·{" "}
                    {uv.professionalName || "Unassigned"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPickUnscheduledOpen(false);
                    setScheduleTarget(uv);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#3D6B22] text-white text-xs font-bold shrink-0 cursor-pointer"
                >
                  Schedule
                </button>
              </div>
            ))
          )}
        </div>
      </Modal>

      <ScheduleClinicalVisitModal
        visit={scheduleTarget}
        actor={actor}
        onClose={() => setScheduleTarget(null)}
      />
    </div>
  );
}
