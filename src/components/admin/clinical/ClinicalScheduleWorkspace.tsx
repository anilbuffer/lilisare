"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  List,
  RefreshCw,
  UserCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import {
  FormButtonCancel,
  FormButtonPrimary,
  FormLabel,
  FormTextarea,
} from "@/components/ui/FormControls";
import { useAuth } from "@/hooks/useAuth";
import { resolveClinicalActor } from "@/lib/admin/clinicalAuthGuard";
import {
  CLINICAL_AGENCIES,
  CLINICAL_PROFESSIONALS,
  CLINICAL_PROGRAMS,
  DEMO_TODAY,
  cancelClinicalVisit,
  getClinicalDetailHref,
  getClinicalVisits,
  subscribeToClinicalSync,
} from "@/lib/admin/clinicalSupervisoryStore";
import { ClinicalVisit } from "@/types/clinicalSupervisory";
import { ClinicalSubNav } from "./ClinicalSubNav";
import { ClinicalVisitStatusBadge, DeliveryMethodBadge } from "./ClinicalBadges";
import {
  AssignProfessionalModal,
  ScheduleClinicalVisitModal,
} from "./ClinicalActionModals";

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

  // Filters
  const [profFilter, setProfFilter] = useState("all");
  const [agencyFilter, setAgencyFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [visitTypeFilter, setVisitTypeFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [scheduleTarget, setScheduleTarget] = useState<ClinicalVisit | null>(null);
  const [pickUnscheduledOpen, setPickUnscheduledOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<ClinicalVisit | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ClinicalVisit | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    const load = () => setVisits(getClinicalVisits());
    load();
    return subscribeToClinicalSync(load);
  }, []);

  const unscheduledQueue = useMemo(
    () =>
      visits.filter(
        (v) =>
          v.visitStatus === "Unscheduled" || v.visitStatus === "Missed"
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
    return visits.filter((v) => {
      if (profFilter !== "all" && v.professionalId !== profFilter) return false;
      if (agencyFilter !== "all" && v.agencyId !== agencyFilter) return false;
      if (programFilter !== "all" && v.programName !== programFilter) return false;
      if (visitTypeFilter !== "all" && v.visitType !== visitTypeFilter) return false;
      if (clientFilter !== "all" && v.clientName !== clientFilter) return false;
      if (statusFilter !== "all" && v.visitStatus !== statusFilter) return false;
      return true;
    });
  }, [
    visits,
    profFilter,
    agencyFilter,
    programFilter,
    visitTypeFilter,
    clientFilter,
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
    // Month grid (4 weeks starting from Monday of month start)
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

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTarget || !cancelReason.trim()) {
      toast.error("Cancellation reason is required.");
      return;
    }
    try {
      cancelClinicalVisit(cancelTarget.id, cancelReason.trim(), actor);
      toast.success(`Visit ${cancelTarget.id} cancelled and synced with Scheduling`);
      setCancelTarget(null);
      setCancelReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancellation failed");
    }
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

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-100">
          <select
            aria-label="Filter by Professional"
            value={profFilter}
            onChange={(e) => setProfFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Professionals</option>
            {CLINICAL_PROFESSIONALS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Agency"
            value={agencyFilter}
            onChange={(e) => setAgencyFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Agencies</option>
            {CLINICAL_AGENCIES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Program"
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Programs</option>
            {CLINICAL_PROGRAMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Visit Type"
            value={visitTypeFilter}
            onChange={(e) => setVisitTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Visit Types</option>
            {uniqueVisitTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Client"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Clients</option>
            {uniqueClients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Visit Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Rescheduled">Rescheduled</option>
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
              calMode === "day"
                ? "grid-cols-1"
                : "grid-cols-1 md:grid-cols-7"
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
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">
                      {dayObj.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: calMode === "day" ? "short" : undefined,
                        day: "numeric",
                      })}
                    </span>
                    {isToday && (
                      <span className="px-1.5 py-0.5 rounded bg-[#3D6B22] text-white text-[9px] font-bold uppercase">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    {dayVisits.length === 0 ? (
                      <div className="text-[11px] text-slate-300 italic pt-2">
                        No clinical visits
                      </div>
                    ) : (
                      dayVisits.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => router.push(getClinicalDetailHref(v.id))}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
                            v.visitStatus === "Scheduled" || v.visitStatus === "Rescheduled"
                              ? "bg-purple-50/70 border-purple-200 hover:border-purple-300"
                              : v.visitStatus === "Completed"
                                ? "bg-emerald-50/70 border-emerald-200 hover:border-emerald-300"
                                : "bg-amber-50/60 border-amber-200 hover:border-amber-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-white/80 px-1.5 py-0.5 rounded border border-purple-200/80">
                              {v.scheduledStartTime
                                ? `${v.scheduledStartTime}–${v.scheduledEndTime}`
                                : "Due Date"}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-600">
                              {v.deliveryMethod}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {v.clientName}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">
                            {v.visitType}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-500 truncate">
                            {v.professionalName || "Unassigned"}
                          </div>
                          {v.scheduledVisitId && (
                            <div className="text-[10px] font-mono text-[#3D6B22]">
                              Linked: {v.scheduledVisitId}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewType === "list" && (
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Visit ID</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Visit Type</th>
                  <th className="py-3.5 px-4">Assigned RN / Supervisor</th>
                  <th className="py-3.5 px-4">Date &amp; Time</th>
                  <th className="py-3.5 px-4">Delivery Method</th>
                  <th className="py-3.5 px-4">Scheduling Ref</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredVisits.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => router.push(getClinicalDetailHref(v.id))}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {v.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {v.clientName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      {v.visitType}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {v.professionalName || (
                        <span className="font-bold text-[#ff6900]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {v.scheduledDate
                        ? `${v.scheduledDate} ${v.scheduledStartTime || ""}`
                        : `Due ${v.dueDate}`}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <DeliveryMethodBadge method={v.deliveryMethod} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {v.scheduledVisitId ? (
                        <Link
                          href={`/admin/scheduling/${v.scheduledVisitId}/`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-[11px] font-bold text-[#3D6B22] hover:underline"
                        >
                          {v.scheduledVisitId} ↗
                        </Link>
                      ) : (
                        <span className="text-slate-400">Not Linked</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <ClinicalVisitStatusBadge status={v.visitStatus} />
                    </td>
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        {v.visitStatus !== "Completed" && v.visitStatus !== "Cancelled" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setScheduleTarget(v)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3D6B22]/10 text-[#3D6B22] hover:bg-[#3D6B22]/20 text-[11px] font-bold cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>{v.scheduledDate ? "Reschedule" : "Schedule"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setReassignTarget(v)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Reassign</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCancelTarget(v)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[11px] font-semibold text-rose-700 cursor-pointer"
                              title="Cancel visit"
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      <AssignProfessionalModal
        visit={reassignTarget}
        actor={actor}
        onClose={() => setReassignTarget(null)}
      />

      {/* Cancel Visit Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Cancel Clinical Visit"
        description={
          cancelTarget
            ? `${cancelTarget.clientName} • ${cancelTarget.visitType}`
            : undefined
        }
        icon={<XCircle className="w-5 h-5" />}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmCancel} className="space-y-4">
          <div>
            <FormLabel required>Cancellation Reason (Audited)</FormLabel>
            <FormTextarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Explain why this clinical visit is being cancelled..."
              required
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <FormButtonCancel onClick={() => setCancelTarget(null)} />
            <FormButtonPrimary type="submit">Confirm Cancellation</FormButtonPrimary>
          </div>
        </form>
      </Modal>
    </div>
  );
}
