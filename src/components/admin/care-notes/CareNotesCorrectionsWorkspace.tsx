"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CareNote, CareNoteCorrection } from "@/types/careNotes";
import {
  getCareNotesFromStorage,
  CARE_NOTES_SYNC_EVENT,
  CARE_NOTE_REVIEWERS,
  acceptCareNoteCorrection,
} from "@/lib/admin/careNotesStore";
import { CareNotesSubNav } from "./CareNotesSubNav";
import { CareNoteStatusBadge } from "./CareNotesBadges";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Check,
  Calendar,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface FlattenedCorrectionItem {
  correction: CareNoteCorrection;
  note: CareNote;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function CareNotesCorrectionsWorkspace() {
  const router = useRouter();
  const [notes, setNotes] = useState<CareNote[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "awaiting_caregiver" | "resubmitted" | "resolved">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const adminActor = CARE_NOTE_REVIEWERS[0];

  useEffect(() => {
    const load = () => {
      setNotes(getCareNotesFromStorage());
    };
    load();
    window.addEventListener(CARE_NOTES_SYNC_EVENT, load);
    return () => window.removeEventListener(CARE_NOTES_SYNC_EVENT, load);
  }, []);

  // Flatten all corrections across notes
  const allCorrections: FlattenedCorrectionItem[] = useMemo(() => {
    const list: FlattenedCorrectionItem[] = [];
    notes.forEach((note) => {
      if (note.corrections && note.corrections.length > 0) {
        note.corrections.forEach((c) => {
          list.push({ correction: c, note });
        });
      }
    });
    return list.sort((a, b) => b.correction.requestedAt.localeCompare(a.correction.requestedAt));
  }, [notes]);

  const awaitingCount = allCorrections.filter((item) => item.correction.status === "awaiting_caregiver" || item.correction.status === "open").length;
  const resubmittedCount = allCorrections.filter((item) => item.correction.status === "resubmitted").length;
  const resolvedCount = allCorrections.filter((item) => item.correction.status === "resolved").length;

  const filteredItems = useMemo(() => {
    return allCorrections.filter((item) => {
      if (activeTab === "awaiting_caregiver" && item.correction.status !== "awaiting_caregiver" && item.correction.status !== "open") {
        return false;
      }
      if (activeTab === "resubmitted" && item.correction.status !== "resubmitted") return false;
      if (activeTab === "resolved" && item.correction.status !== "resolved") return false;

      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const match =
          item.correction.id.toLowerCase().includes(t) ||
          item.note.id.toLowerCase().includes(t) ||
          item.note.clientName.toLowerCase().includes(t) ||
          item.note.caregiverName.toLowerCase().includes(t) ||
          item.correction.reason.toLowerCase().includes(t);
        if (!match) return false;
      }

      return true;
    });
  }, [allCorrections, activeTab, searchTerm]);

  const handleAcceptCorrection = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    acceptCareNoteCorrection(noteId, adminActor, "Correction accepted by Agency Admin.");
    toast.success("Caregiver correction accepted");
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-5 pb-16 px-4 sm:px-6 lg:px-8 pt-2 animate-in fade-in duration-300">
      <CareNotesSubNav
        title="Correction Requests"
        description="Track notes returned to caregivers for amendment, missing section completion, and resubmission."
      />

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Open Requests</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">{awaitingCount + resubmittedCount}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Active correction queue</div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-amber-200 bg-amber-50/20 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
            <span>Awaiting Caregiver</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-900">{awaitingCount}</div>
          <div className="text-[10px] text-amber-700 font-medium mt-0.5">With caregiver on mobile app</div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-blue-200 bg-blue-50/20 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-blue-800 font-semibold mb-1">
            <span>Resubmitted</span>
            <RefreshCw className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-900">{resubmittedCount}</div>
          <div className="text-[10px] text-blue-700 font-medium mt-0.5">Ready for Admin re-audit</div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-emerald-200 bg-emerald-50/20 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-900">{resolvedCount}</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Accepted & compliant</div>
        </div>
      </div>

      {/* Status Filter Tabs & Search Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === "all" ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20" : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
          >
            All Requests ({allCorrections.length})
          </button>
          <button
            onClick={() => setActiveTab("awaiting_caregiver")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === "awaiting_caregiver" ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20" : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
          >
            Awaiting Caregiver ({awaitingCount})
          </button>
          <button
            onClick={() => setActiveTab("resubmitted")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === "resubmitted" ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20" : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
          >
            Resubmitted ({resubmittedCount})
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === "resolved" ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20" : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search request ID, note, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Operational Table (Clean Front List) */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Note & Request ID</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Caregiver</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Correction Reason</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <p className="font-bold text-slate-800 text-sm">No correction requests found</p>
                      <p className="text-xs text-slate-500">All care notes in this category have been addressed.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map(({ correction, note }) => (
                  <tr
                    key={correction.id}
                    onClick={() => router.push(`/admin/care-notes/${note.id}`)}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  >
                    {/* Note & Request ID */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 group-hover:text-[#3D6B22] group-hover:border-[#3D6B22]/30 transition-colors">
                          {note.id}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {correction.id}
                        </span>
                      </div>
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
                      <span className="font-mono text-[11px] font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mr-2">
                        {note.serviceCode}
                      </span>
                      {note.serviceType}
                    </td>

                    {/* Correction Reason */}
                    <td className="py-4 px-4 sm:px-6 text-xs">
                      <span className="font-medium text-slate-900 truncate max-w-sm block" title={correction.reason}>
                        {correction.reason}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <CareNoteStatusBadge status={correction.status} type="correction" />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap space-x-1.5">
                      {correction.status === "resubmitted" && (
                        <button
                          onClick={(e) => handleAcceptCorrection(note.id, e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-2xs transition-all cursor-pointer"
                        >
                          <Check className="w-3 h-3" /> Accept
                        </button>
                      )}
                      <Link
                        href={`/admin/care-notes/${note.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      >
                        <span>View Note</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
