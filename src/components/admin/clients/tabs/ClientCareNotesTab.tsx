"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileCheck2,
  FilePlus2,
  HeartPulse,
  MessageSquarePlus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { ClientRecord } from "@/types/client";
import { PortalRole } from "../AdminClientDetailView";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientCareNotesTabProps {
  client: ClientRecord;
  userRole?: PortalRole;
  onUpdateClient?: (updated: ClientRecord) => void;
}

type CareNoteItem = NonNullable<ClientRecord["careNotes"]>[number];
type ApprovalFilter = "All" | "Pending Review" | "Needs Attention" | "Approved";
type EvvFilter = "All" | "Verified GPS" | "Exception" | "Manual Sign-off";

export function ClientCareNotesTab({
  client,
  userRole = "admin",
  onUpdateClient,
}: ClientCareNotesTabProps) {
  const careNotes = client.careNotes || [];
  const canApproveNotes = userRole === "admin" || userRole === "clinical";

  const [searchQuery, setSearchQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>("All");
  const [evvFilter, setEvvFilter] = useState<EvvFilter>("All");

  // Modal States
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [flagTargetNote, setFlagTargetNote] = useState<CareNoteItem | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [addendumTargetNote, setAddendumTargetNote] = useState<CareNoteItem | null>(null);
  const [addendumText, setAddendumText] = useState("");

  // New Supervisory / Missing Note Form
  const defaultCaregiver =
    client.assignedCareTeam?.primaryCaregiver?.name || "Sarah Miller";
  const defaultService =
    client.carePlan?.approvedServices?.[0] || "Personal Care / ADL Support";

  const [newNoteForm, setNewNoteForm] = useState({
    noteType: "RN Supervisory Visit" as
      | "Shift Care Note"
      | "RN Supervisory Visit"
      | "Missing Note Backfill",
    caregiverName: defaultCaregiver,
    visitDate: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    service: defaultService,
    clockIn: "09:00 AM (Manual Sign-off)",
    clockOut: "10:00 AM (Manual Sign-off)",
    evvLocationStatus: "Manual Sign-off" as
      | "Verified GPS"
      | "Exception"
      | "Manual Sign-off",
    adlsText: (client.carePlan?.adlSupportNeeds || []).slice(0, 3).join(", "),
    bp: "",
    pulse: "",
    temp: "",
    notes: "",
    autoApprove: true,
  });

  // Persist helper
  const persistCareNotes = (updatedNotes: CareNoteItem[]) => {
    const updated: ClientRecord = {
      ...client,
      careNotes: updatedNotes,
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) {
      onUpdateClient(updated);
    }

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }
  };

  // KPIs
  const metrics = useMemo(() => {
    const total = careNotes.length;
    const pending = careNotes.filter(
      (n) => n.supervisorApproval === "Pending Review"
    ).length;
    const attention = careNotes.filter(
      (n) =>
        n.supervisorApproval === "Needs Attention" ||
        n.evvLocationStatus === "Exception"
    ).length;
    const billingReady = careNotes.filter(
      (n) =>
        n.supervisorApproval === "Approved" &&
        n.evvLocationStatus !== "Exception"
    ).length;
    return { total, pending, attention, billingReady };
  }, [careNotes]);

  // Filtered list
  const filteredNotes = useMemo(() => {
    return careNotes.filter((note) => {
      if (approvalFilter !== "All" && note.supervisorApproval !== approvalFilter) {
        return false;
      }
      if (evvFilter !== "All" && note.evvLocationStatus !== evvFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = [
          note.caregiverName,
          note.service,
          note.visitDate,
          note.notes,
          ...(note.adlsCompleted || []),
          note.flaggedReason || "",
          note.reviewComment || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [careNotes, approvalFilter, evvFilter, searchQuery]);

  const nowStamp = () =>
    new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  // Actions
  const handleApproveAllPending = () => {
    if (metrics.pending === 0) {
      toast.info("No pending care notes require sign-off.");
      return;
    }
    const stamp = nowStamp();
    const updatedNotes = careNotes.map((n) =>
      n.supervisorApproval === "Pending Review"
        ? {
            ...n,
            supervisorApproval: "Approved" as const,
            reviewedBy: userRole === "clinical" ? "RN Supervisor" : "Agency Admin",
            reviewedAt: stamp,
          }
        : n
    );
    persistCareNotes(updatedNotes);
    toast.success(
      `RN / Admin Sign-Off Complete: ${metrics.pending} pending care note${
        metrics.pending > 1 ? "s" : ""
      } approved.`
    );
  };

  const handleApproveSingleNote = (noteId: string) => {
    const stamp = nowStamp();
    const updatedNotes = careNotes.map((n) =>
      n.id === noteId
        ? {
            ...n,
            supervisorApproval: "Approved" as const,
            evvLocationStatus:
              n.evvLocationStatus === "Exception"
                ? ("Manual Sign-off" as const)
                : n.evvLocationStatus,
            reviewedBy: userRole === "clinical" ? "RN Supervisor" : "Agency Admin",
            reviewedAt: stamp,
            flaggedReason: undefined,
          }
        : n
    );
    persistCareNotes(updatedNotes);
    toast.success("Care note approved & cleared for billing audit.");
  };

  const handleConfirmFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagTargetNote || !flagReason.trim()) {
      toast.error("Please enter a reason or correction instruction.");
      return;
    }
    const stamp = nowStamp();
    const updatedNotes = careNotes.map((n) =>
      n.id === flagTargetNote.id
        ? {
            ...n,
            supervisorApproval: "Needs Attention" as const,
            flaggedReason: flagReason.trim(),
            reviewedBy: userRole === "clinical" ? "RN Supervisor" : "Agency Admin",
            reviewedAt: stamp,
          }
        : n
    );
    persistCareNotes(updatedNotes);
    toast.warning(
      `Correction requested from ${flagTargetNote.caregiverName}. Note flagged as Needs Attention.`
    );
    setFlagTargetNote(null);
    setFlagReason("");
  };

  const handleSaveAddendum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addendumTargetNote || !addendumText.trim()) {
      toast.error("Please enter your clinical or supervisory addendum.");
      return;
    }
    const stamp = nowStamp();
    const updatedNotes = careNotes.map((n) =>
      n.id === addendumTargetNote.id
        ? {
            ...n,
            reviewComment: addendumText.trim(),
            reviewedBy: userRole === "clinical" ? "RN Supervisor" : "Agency Admin",
            reviewedAt: stamp,
          }
        : n
    );
    persistCareNotes(updatedNotes);
    toast.success("Supervisory addendum saved to shift record.");
    setAddendumTargetNote(null);
    setAddendumText("");
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteForm.notes.trim()) {
      toast.error("Please enter clinical observations or visit summary.");
      return;
    }

    const adls = newNoteForm.adlsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const hasVitals =
      newNoteForm.bp.trim() || newNoteForm.pulse.trim() || newNoteForm.temp.trim();

    const created: CareNoteItem = {
      id: `CN-${client.id}-${Date.now().toString().slice(-4)}`,
      visitDate: newNoteForm.visitDate.trim() || "Today",
      caregiverName: newNoteForm.caregiverName.trim() || defaultCaregiver,
      caregiverId:
        newNoteForm.noteType === "RN Supervisory Visit" ? "RN-008" : "CG-ADMIN",
      service: newNoteForm.service.trim() || defaultService,
      clockIn: newNoteForm.clockIn.trim() || "09:00 AM",
      clockOut: newNoteForm.clockOut.trim() || "10:00 AM",
      adlsCompleted: adls.length > 0 ? adls : ["Supervisory Care Plan Review"],
      vitals: hasVitals
        ? {
            bp: newNoteForm.bp.trim() || undefined,
            pulse: newNoteForm.pulse.trim()
              ? Number(newNoteForm.pulse.trim())
              : undefined,
            temp: newNoteForm.temp.trim() || undefined,
          }
        : undefined,
      notes: newNoteForm.notes.trim(),
      supervisorApproval:
        newNoteForm.autoApprove && canApproveNotes
          ? "Approved"
          : "Pending Review",
      evvLocationStatus: newNoteForm.evvLocationStatus,
      noteType: newNoteForm.noteType,
      reviewedBy:
        newNoteForm.autoApprove && canApproveNotes
          ? userRole === "clinical"
            ? "RN Supervisor"
            : "Agency Admin"
          : undefined,
      reviewedAt:
        newNoteForm.autoApprove && canApproveNotes ? nowStamp() : undefined,
    };

    persistCareNotes([created, ...careNotes]);
    setIsLogModalOpen(false);
    setNewNoteForm((prev) => ({
      ...prev,
      bp: "",
      pulse: "",
      temp: "",
      notes: "",
    }));
    toast.success(`${created.noteType} recorded for ${client.name}.`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                EVV Shift Care Notes & Clinical Monitoring
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                <CheckCircle2 className="w-3 h-3 text-[#3D6B22]" /> Real-time Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Review shift documentation, verify EVV clock-in/out & ADLs, flag missing details, and issue RN/Admin sign-off
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Link
            href="/admin/care-notes"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900"
          >
            <span>Agency Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          {canApproveNotes && (
            <button
              type="button"
              onClick={() => setIsLogModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              <FilePlus2 className="w-3.5 h-3.5 text-[#3D6B22]" />
              <span>Log Supervisory / Missing Note</span>
            </button>
          )}

          {canApproveNotes ? (
            <button
              type="button"
              onClick={handleApproveAllPending}
              disabled={metrics.pending === 0}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 ${
                metrics.pending > 0
                  ? "text-white bg-[#3D6B22] hover:bg-[#345C1D] shadow-md shadow-[#3D6B22]/20 active:scale-95 cursor-pointer"
                  : "text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {metrics.pending > 0
                  ? `Approve Pending (${metrics.pending})`
                  : "All Pending Approved"}
              </span>
            </button>
          ) : (
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
              RN Review Required for Approval
            </span>
          )}
        </div>
      </div>

      {/* 4-Card Clinical & Audit KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => setApprovalFilter("All")}
          className={`text-left bg-white rounded-xl lg:rounded-2xl p-4 border shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-pointer ${
            approvalFilter === "All"
              ? "border-[#3D6B22]/40 ring-1 ring-[#3D6B22]/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Shift Logs
            </span>
            <Stethoscope className="w-4 h-4 text-[#3D6B22]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {metrics.total}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Recorded visits
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setApprovalFilter("Pending Review")}
          className={`text-left bg-white rounded-xl lg:rounded-2xl p-4 border shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-pointer ${
            approvalFilter === "Pending Review"
              ? "border-amber-400 ring-1 ring-amber-300/40"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pending RN Sign-Off
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                metrics.pending > 0 ? "text-amber-700" : "text-slate-900"
              }`}
            >
              {metrics.pending}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {metrics.pending > 0 ? "Awaiting review" : "Queue clear"}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setApprovalFilter("Needs Attention")}
          className={`text-left bg-white rounded-xl lg:rounded-2xl p-4 border shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-pointer ${
            approvalFilter === "Needs Attention"
              ? "border-rose-400 ring-1 ring-rose-300/40"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Exceptions / Flagged
            </span>
            <AlertTriangle
              className={`w-4 h-4 ${
                metrics.attention > 0 ? "text-rose-600" : "text-slate-400"
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                metrics.attention > 0 ? "text-rose-700" : "text-slate-900"
              }`}
            >
              {metrics.attention}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {metrics.attention > 0 ? "Needs follow-up" : "No exceptions"}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setApprovalFilter("Approved")}
          className={`text-left bg-white rounded-xl lg:rounded-2xl p-4 border shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-pointer ${
            approvalFilter === "Approved"
              ? "border-[#3D6B22]/40 ring-1 ring-[#3D6B22]/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Billing & Audit Ready
            </span>
            <FileCheck2 className="w-4 h-4 text-[#3D6B22]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#3D6B22]">
              {metrics.billingReady}
              <span className="text-sm font-semibold text-slate-400">
                /{metrics.total}
              </span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Approved & EVV clear
            </span>
          </div>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search caregiver, service, ADLs, or clinical notes..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(
            ["All", "Pending Review", "Needs Attention", "Approved"] as ApprovalFilter[]
          ).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setApprovalFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                approvalFilter === status
                  ? "bg-[#3D6B22] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              }`}
            >
              {status}
            </button>
          ))}

          <select
            aria-label="Filter by EVV Status"
            value={evvFilter}
            onChange={(e) => setEvvFilter(e.target.value as EvvFilter)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
          >
            <option value="All">All EVV Statuses</option>
            <option value="Verified GPS">Verified GPS</option>
            <option value="Exception">EVV Exception</option>
            <option value="Manual Sign-off">Manual Sign-off</option>
          </select>
        </div>
      </div>

      {/* Care Notes Timeline */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-xl lg:rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <p className="text-slate-600 font-semibold text-sm">
              {careNotes.length === 0
                ? "No care notes have been logged for this client yet."
                : "No care notes match your current filters."}
            </p>
            {careNotes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setApprovalFilter("All");
                  setEvvFilter("All");
                }}
                className="text-xs font-bold text-[#3D6B22] hover:underline cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isBillingReady =
              note.supervisorApproval === "Approved" &&
              note.evvLocationStatus !== "Exception";

            return (
              <div
                key={note.id}
                className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-4"
              >
                {/* Top Row: Date, Caregiver, Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#3D6B22] border border-emerald-200 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                      {note.caregiverName
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {note.caregiverName}
                        </span>
                        {note.noteType && note.noteType !== "Shift Care Note" && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {note.noteType}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        {note.visitDate} •{" "}
                        <span className="text-slate-700 font-semibold">
                          {note.service}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        note.supervisorApproval === "Approved"
                          ? "bg-emerald-50 text-[#3D6B22] border-emerald-200"
                          : note.supervisorApproval === "Needs Attention"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {note.supervisorApproval}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        note.evvLocationStatus === "Exception"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : note.evvLocationStatus === "Manual Sign-off"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {note.evvLocationStatus === "Exception" ? (
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                      ) : (
                        <ShieldCheck className="w-3 h-3 text-[#3D6B22]" />
                      )}
                      <span>{note.evvLocationStatus}</span>
                    </span>

                    {isBillingReady && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50/70 text-emerald-800 border border-emerald-200/80">
                        <FileCheck2 className="w-3 h-3" />
                        <span>Billing Ready</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* EVV Shift Timing & Vitals Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-[#3D6B22]" />
                      <span className="font-semibold text-slate-500">In:</span>
                      <span className="font-bold text-slate-800">
                        {note.clockIn || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-500">Out:</span>
                      <span className="font-bold text-slate-800">
                        {note.clockOut || "—"}
                      </span>
                    </div>
                  </div>

                  {note.vitals &&
                    (note.vitals.bp ||
                      note.vitals.pulse ||
                      note.vitals.temp) && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                          Vitals:
                        </span>
                        {note.vitals.bp && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">
                            BP {note.vitals.bp}
                          </span>
                        )}
                        {note.vitals.pulse && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">
                            HR {note.vitals.pulse} bpm
                          </span>
                        )}
                        {note.vitals.temp && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">
                            Temp {note.vitals.temp}
                          </span>
                        )}
                      </div>
                    )}
                </div>

                {/* Tasks Performed */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Completed Care Tasks & ADLs
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(note.adlsCompleted || []).map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200/80 text-slate-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes Body / Observations */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Caregiver Shift Summary & Clinical Observations
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic">
                    &ldquo;{note.notes}&rdquo;
                  </p>
                </div>

                {/* Flagged / Review Callout */}
                {(note.flaggedReason || note.reviewComment || note.reviewedBy) && (
                  <div
                    className={`rounded-xl p-3.5 border text-xs space-y-1 ${
                      note.supervisorApproval === "Needs Attention" ||
                      note.flaggedReason
                        ? "bg-rose-50/70 border-rose-200 text-rose-900"
                        : "bg-emerald-50/50 border-emerald-200/80 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold flex items-center gap-1.5">
                        {note.supervisorApproval === "Needs Attention" ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-[#3D6B22]" />
                        )}
                        <span>
                          {note.supervisorApproval === "Needs Attention"
                            ? "Correction / Review Required"
                            : "RN / Admin Verification"}
                        </span>
                      </span>
                      {note.reviewedBy && (
                        <span className="text-[11px] font-medium opacity-80">
                          {note.reviewedBy}
                          {note.reviewedAt ? ` • ${note.reviewedAt}` : ""}
                        </span>
                      )}
                    </div>
                    {note.flaggedReason && (
                      <p className="font-medium leading-relaxed">
                        {note.flaggedReason}
                      </p>
                    )}
                    {note.reviewComment && (
                      <p className="text-slate-700 leading-relaxed">
                        <span className="font-semibold">Addendum: </span>
                        {note.reviewComment}
                      </p>
                    )}
                  </div>
                )}

                {/* Agency Admin Action Footer */}
                {canApproveNotes && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Record ID: {note.id}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setAddendumTargetNote(note);
                          setAddendumText(note.reviewComment || "");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {note.reviewComment ? "Edit Addendum" : "Add Addendum"}
                        </span>
                      </button>

                      {note.supervisorApproval !== "Needs Attention" && (
                        <button
                          type="button"
                          onClick={() => {
                            setFlagTargetNote(note);
                            setFlagReason(note.flaggedReason || "");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-all cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Flag / Request Correction</span>
                        </button>
                      )}

                      {note.supervisorApproval !== "Approved" && (
                        <button
                          type="button"
                          onClick={() => handleApproveSingleNote(note.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-sm shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Sign Off</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal 1: Log Supervisory / Missing Care Note */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Supervisory or Missing Care Note"
        description={`Record an RN supervisory home visit or backfill a missing shift note for ${client.name}`}
        icon={<FilePlus2 className="w-5 h-5" />}
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="log-care-note-form"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Care Note</span>
            </button>
          </div>
        }
      >
        <form
          id="log-care-note-form"
          onSubmit={handleCreateNote}
          className="space-y-4"
        >
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>Visit & Documentation Type</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Documentation Type
              </label>
              <select
                value={newNoteForm.noteType}
                onChange={(e) =>
                  setNewNoteForm((f) => ({
                    ...f,
                    noteType: e.target.value as typeof f.noteType,
                  }))
                }
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
              >
                <option value="RN Supervisory Visit">RN Supervisory Visit</option>
                <option value="Missing Note Backfill">
                  Missing Shift Note Backfill
                </option>
                <option value="Shift Care Note">Shift Care Note</option>
              </select>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Caregiver / Clinician Name
              </label>
              <input
                type="text"
                value={newNoteForm.caregiverName}
                onChange={(e) =>
                  setNewNoteForm((f) => ({
                    ...f,
                    caregiverName: e.target.value,
                  }))
                }
                placeholder="e.g. Evelyn Vance, RN"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Visit Date
              </label>
              <input
                type="text"
                value={newNoteForm.visitDate}
                onChange={(e) =>
                  setNewNoteForm((f) => ({ ...f, visitDate: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                EVV Verification Status
              </label>
              <select
                value={newNoteForm.evvLocationStatus}
                onChange={(e) =>
                  setNewNoteForm((f) => ({
                    ...f,
                    evvLocationStatus: e.target.value as typeof f.evvLocationStatus,
                  }))
                }
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
              >
                <option value="Manual Sign-off">Manual Sign-off</option>
                <option value="Verified GPS">Verified GPS</option>
                <option value="Exception">Exception</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Service Delivered
              </label>
              <input
                type="text"
                value={newNoteForm.service}
                onChange={(e) =>
                  setNewNoteForm((f) => ({ ...f, service: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Clock-In Time
              </label>
              <input
                type="text"
                value={newNoteForm.clockIn}
                onChange={(e) =>
                  setNewNoteForm((f) => ({ ...f, clockIn: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Clock-Out Time
              </label>
              <input
                type="text"
                value={newNoteForm.clockOut}
                onChange={(e) =>
                  setNewNoteForm((f) => ({ ...f, clockOut: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 pt-1">
            <span>Tasks, Vitals & Observations</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Completed ADLs / Tasks (comma-separated)
            </label>
            <input
              type="text"
              value={newNoteForm.adlsText}
              onChange={(e) =>
                setNewNoteForm((f) => ({ ...f, adlsText: e.target.value }))
              }
              placeholder="e.g. Bathing supervision, Meal prep, Inhaler check"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                BP (optional)
              </label>
              <input
                type="text"
                value={newNoteForm.bp}
                onChange={(e) =>
                  setNewNoteForm((f) => ({ ...f, bp: e.target.value }))
                }
                placeholder="102/66"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Pulse (bpm)
              </label>
              <input
                type="number"
                value={newNoteForm.pulse}
                onChange={(e) =>
                  setNewNoteForm((f) => ({ ...f, pulse: e.target.value }))
                }
                placeholder="82"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Temp
              </label>
              <input
                type="text"
                value={newNoteForm.temp}
                onChange={(e) =>
                  setNewNoteForm((f) => ({ ...f, temp: e.target.value }))
                }
                placeholder="98.4°F"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Clinical Observations & Visit Summary
            </label>
            <textarea
              rows={3}
              required
              value={newNoteForm.notes}
              onChange={(e) =>
                setNewNoteForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Document client condition, care plan adherence, and any guardian or caregiver follow-up..."
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={newNoteForm.autoApprove}
              onChange={(e) =>
                setNewNoteForm((f) => ({ ...f, autoApprove: e.target.checked }))
              }
              className="rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]"
            />
            <span>Immediately apply RN / Admin Sign-Off upon saving</span>
          </label>
        </form>
      </Modal>

      {/* Modal 2: Flag / Request Correction */}
      <Modal
        isOpen={Boolean(flagTargetNote)}
        onClose={() => setFlagTargetNote(null)}
        title="Flag Care Note & Request Correction"
        description={
          flagTargetNote
            ? `${flagTargetNote.caregiverName} • ${flagTargetNote.visitDate}`
            : undefined
        }
        icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setFlagTargetNote(null)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="flag-care-note-form"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Flag as Needs Attention</span>
            </button>
          </div>
        }
      >
        <form
          id="flag-care-note-form"
          onSubmit={handleConfirmFlag}
          className="space-y-4"
        >
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Correction Reason / Action Required
            </label>
            <textarea
              rows={3}
              required
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="e.g. Missing afternoon ADL documentation, or EVV clock-out geofence exception needs guardian verification..."
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>
        </form>
      </Modal>

      {/* Modal 3: Add RN / Admin Addendum */}
      <Modal
        isOpen={Boolean(addendumTargetNote)}
        onClose={() => setAddendumTargetNote(null)}
        title="RN / Admin Clinical Addendum"
        description={
          addendumTargetNote
            ? `Appends supervisory context to ${addendumTargetNote.caregiverName}'s shift note without altering original caregiver text`
            : undefined
        }
        icon={<MessageSquarePlus className="w-5 h-5" />}
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setAddendumTargetNote(null)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="addendum-care-note-form"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Addendum</span>
            </button>
          </div>
        }
      >
        <form
          id="addendum-care-note-form"
          onSubmit={handleSaveAddendum}
          className="space-y-4"
        >
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Supervisory / Clinical Review Note
            </label>
            <textarea
              rows={3}
              required
              value={addendumText}
              onChange={(e) => setAddendumText(e.target.value)}
              placeholder="e.g. Verified with guardian via phone; clock-out delay due to sensory transition. Cleared for payroll & billing."
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
