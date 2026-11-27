"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CareNote, CareNotesKpiSummary } from "@/types/careNotes";
import {
  INITIAL_CARE_NOTES,
  getCareNotesFromStorage,
  getCareNotesKpiSummary,
  CARE_NOTES_SYNC_EVENT,
  CARE_NOTE_REVIEWERS,
  assignCareNoteReviewer,
} from "@/lib/admin/careNotesStore";
import { CareNotesSubNav } from "./CareNotesSubNav";
import { CareNoteStatusBadge, CareNoteQualityIndicator } from "./CareNotesBadges";
import {
  Inbox,
  Clock,
  AlertTriangle,
  UserCheck,
  UserX,
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

interface CareNotesReviewQueueWorkspaceProps {
  hideSubNav?: boolean;
  onTabChange?: (tabId: string) => void;
}

export function CareNotesReviewQueueWorkspace({
  hideSubNav = false,
  onTabChange,
}: CareNotesReviewQueueWorkspaceProps = {}) {
  const router = useRouter();
  const [notes, setNotes] = useState<CareNote[]>([]);
  const [kpi, setKpi] = useState<CareNotesKpiSummary>(() => getCareNotesKpiSummary(INITIAL_CARE_NOTES));
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedReviewerFilter, setSelectedReviewerFilter] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState("All Programs");
  const [selectedOffice, setSelectedOffice] = useState("All Offices");

  useEffect(() => {
    const load = () => {
      const data = getCareNotesFromStorage();
      setNotes(data);
      setKpi(getCareNotesKpiSummary(data));
    };
    load();
    window.addEventListener(CARE_NOTES_SYNC_EVENT, load);
    return () => window.removeEventListener(CARE_NOTES_SYNC_EVENT, load);
  }, []);

  // Filter for notes waiting for review or escalated
  const queueNotes = useMemo(() => {
    return notes
      .filter((n) => {
        const inQueue = n.reviewStatus === "pending_review" || n.reviewStatus === "in_review" || n.reviewStatus === "escalated";
        if (!inQueue) return false;

        if (selectedOffice !== "All Offices" && n.agencyName !== selectedOffice) return false;
        if (selectedProgram !== "All Programs" && n.programName !== selectedProgram) return false;
        if (selectedPriority !== "all" && n.priority !== selectedPriority) return false;

        if (selectedReviewerFilter === "me" && n.assignedReviewerId !== "REV-1") return false;
        if (selectedReviewerFilter === "unassigned" && n.assignedReviewerId) return false;
        if (selectedReviewerFilter !== "all" && selectedReviewerFilter !== "me" && selectedReviewerFilter !== "unassigned") {
          if (n.assignedReviewerId !== selectedReviewerFilter) return false;
        }

        if (searchTerm.trim()) {
          const t = searchTerm.toLowerCase();
          const match =
            n.id.toLowerCase().includes(t) ||
            n.clientName.toLowerCase().includes(t) ||
            n.caregiverName.toLowerCase().includes(t) ||
            n.serviceType.toLowerCase().includes(t) ||
            n.visitId.toLowerCase().includes(t);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priorityWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        const weightDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        if (weightDiff !== 0) return weightDiff;
        return (a.submittedAt || a.serviceDate).localeCompare(b.submittedAt || b.serviceDate);
      });
  }, [notes, selectedOffice, selectedProgram, selectedPriority, selectedReviewerFilter, searchTerm]);

  const getReviewAge = (submittedAt: string | null, serviceDate: string) => {
    if (!submittedAt) return "Missing Submission";
    if (submittedAt.includes("2026-11-26")) return "Today (< 8h)";
    if (submittedAt.includes("2026-11-25")) return "1 day ago";
    if (submittedAt.includes("2026-11-24")) return "2 days ago";
    if (submittedAt.includes("2026-11-23")) return "3 days ago";
    return "3+ days ago";
  };

  const handleQuickAssign = (noteId: string, reviewerId: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    const reviewer = CARE_NOTE_REVIEWERS.find((r) => r.id === reviewerId);
    if (!reviewer) return;
    const adminActor = CARE_NOTE_REVIEWERS[0];
    assignCareNoteReviewer(noteId, reviewer.id, reviewer.name, adminActor);
    toast.success(`Assigned ${noteId} to ${reviewer.name}`);
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 animate-in fade-in duration-300">
      {!hideSubNav && (
        <CareNotesSubNav
          title="CareNotes Review Queue"
          description="Priority operational queue for Agency Admin to review, audit, and verify submitted caregiver documentation."
          activeTab="review"
          onTabChange={onTabChange}
        />
      )}

      {/* Queue Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <button
          onClick={() => {
            setSelectedPriority("all");
            setSelectedReviewerFilter("all");
          }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${selectedPriority === "all" && selectedReviewerFilter === "all"
            ? "bg-white border-[#3D6B22] shadow-sm ring-1 ring-[#3D6B22]/20"
            : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
            }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">{kpi.pendingReviewCount}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Total in queue</div>
        </button>

        <button
          onClick={() => setSelectedPriority("high")}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${selectedPriority === "high"
            ? "bg-white border-rose-500 shadow-sm ring-1 ring-rose-500/20"
            : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
            }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>High / Urgent Priority</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">{kpi.highPriorityCount}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">Immediate attention</div>
        </button>

        <button
          onClick={() => setSelectedReviewerFilter("me")}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${selectedReviewerFilter === "me"
            ? "bg-white border-[#3D6B22] shadow-sm ring-1 ring-[#3D6B22]/20"
            : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
            }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Assigned to Me</span>
            <UserCheck className="w-4 h-4 text-[#3D6B22]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">{kpi.assignedToMeCount}</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Dana Jenkins, MSW</div>
        </button>

        <button
          onClick={() => setSelectedReviewerFilter("unassigned")}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${selectedReviewerFilter === "unassigned"
            ? "bg-white border-amber-500 shadow-sm ring-1 ring-amber-500/20"
            : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
            }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Unassigned</span>
            <UserX className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">{kpi.unassignedCount}</div>
          <div className="text-[10px] text-amber-700 font-medium mt-0.5">Needs reviewer routing</div>
        </button>

        <button
          onClick={() => setSelectedPriority("all")}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-left transition-all col-span-2 sm:col-span-1 shadow-2xs cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Clinical Escalated</span>
            <ShieldAlert className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">{kpi.clinicalEscalatedCount}</div>
          <div className="text-[10px] text-purple-600 font-medium mt-0.5">RN supervisory triage</div>
        </button>
      </div>

      {/* Filter & Search Bar with Office/Program Dropdowns */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search in review queue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <select
            value={selectedOffice}
            onChange={(e) => setSelectedOffice(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          >
            <option value="All Offices">All Offices</option>
            <option value="Columbus Metro Office">Columbus Metro</option>
            <option value="Cleveland North Branch">Cleveland North</option>
            <option value="Cincinnati Regional">Cincinnati Regional</option>
          </select>

          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          >
            <option value="All Programs">All Programs</option>
            <option value="Medicaid HCBS Waiver">Medicaid HCBS</option>
            <option value="Ohio PASSPORT Waiver">Ohio PASSPORT</option>
            <option value="IHSS Attendant Program">IHSS Attendant</option>
            <option value="DODD Supported Living">DODD Living</option>
            <option value="Private Duty & Skilled Nursing">Skilled Nursing</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={selectedReviewerFilter}
            onChange={(e) => setSelectedReviewerFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          >
            <option value="all">All Reviewers</option>
            <option value="me">Assigned to Me</option>
            <option value="unassigned">Unassigned Only</option>
            <option value="REV-2">Carlos Mendez, RN</option>
            <option value="REV-3">Sarah Alverez</option>
          </select>
        </div>
      </div>

      {/* Queue Table (Clean Front List) */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center shrink-0">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Active Review Worklist</h3>
              <span className="text-xs text-slate-400 font-medium">({queueNotes.length} notes awaiting action)</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium">Sorted by: Priority & Submission Age</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Note ID</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Caregiver</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Wait Time</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queueNotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto text-[#3D6B22] mb-2">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">Review queue is all clear!</p>
                      <p className="text-xs text-slate-500">No notes waiting in this review category.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                queueNotes.map((note) => {
                  const waitTime = getReviewAge(note.submittedAt, note.serviceDate);
                  return (
                    <tr
                      key={note.id}
                      onClick={() => router.push(`/admin/care-notes/${note.id}`)}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    >
                      {/* Priority Badge */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        {note.priority === "urgent" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                            Urgent
                          </span>
                        )}
                        {note.priority === "high" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            High
                          </span>
                        )}
                        {note.priority === "medium" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Medium
                          </span>
                        )}
                        {note.priority === "low" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            Low
                          </span>
                        )}
                      </td>

                      {/* Note ID */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 group-hover:text-[#3D6B22] group-hover:border-[#3D6B22]/30 transition-colors">
                          {note.id}
                        </span>
                      </td>

                      {/* Client */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-[#3D6B22] font-bold text-[10px] shrink-0 shadow-2xs">
                            {getInitials(note.clientName)}
                          </div>
                          <span className="font-semibold text-xs text-slate-900 group-hover:text-[#3D6B22] transition-colors whitespace-nowrap">
                            {note.clientName}
                          </span>
                        </div>
                      </td>

                      {/* Caregiver */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 font-bold text-[10px] shrink-0">
                            {getInitials(note.caregiverName)}
                          </div>
                          <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
                            {note.caregiverName}
                          </span>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-4 px-4 sm:px-6 text-xs text-slate-700 font-medium whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 mr-2">
                          {note.serviceCode}
                        </span>
                        {note.serviceType}
                      </td>

                      {/* Wait Time */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <span className="text-slate-700 font-semibold flex items-center gap-1.5 text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {waitTime}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/care-notes/${note.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                        >
                          <span>Audit & Review</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
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
    </div>
  );
}
