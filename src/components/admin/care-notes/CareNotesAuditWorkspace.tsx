"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { CareNoteAuditEvent } from "@/types/careNotes";
import {
  getCareNoteAuditEventsFromStorage,
  CARE_NOTES_SYNC_EVENT,
} from "@/lib/admin/careNotesStore";
import { CareNotesSubNav } from "./CareNotesSubNav";
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  User,
  ArrowRight,
  Eye,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function CareNotesAuditWorkspace() {
  const [events, setEvents] = useState<CareNoteAuditEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const reloadEvents = () => {
    setEvents(getCareNoteAuditEventsFromStorage());
  };

  useEffect(() => {
    reloadEvents();
    window.addEventListener(CARE_NOTES_SYNC_EVENT, reloadEvents);
    return () => window.removeEventListener(CARE_NOTES_SYNC_EVENT, reloadEvents);
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (actionFilter !== "all" && e.action !== actionFilter) return false;
      if (roleFilter !== "all" && !e.role.toLowerCase().includes(roleFilter.toLowerCase())) return false;
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const match =
          e.noteId.toLowerCase().includes(t) ||
          e.clientName.toLowerCase().includes(t) ||
          e.caregiverName.toLowerCase().includes(t) ||
          e.user.toLowerCase().includes(t) ||
          (e.reason && e.reason.toLowerCase().includes(t)) ||
          e.action.toLowerCase().includes(t);
        if (!match) return false;
      }
      return true;
    });
  }, [events, actionFilter, roleFilter, searchTerm]);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-16">
      <CareNotesSubNav
        title="Documentation Audit Trail"
        description="Immutable, tamper-evident log of all care note submissions, review decisions, corrections, escalations, and rule modifications."
      />

      <div className="max-w-9xl mx-auto space-y-5 px-4 sm:px-6 lg:px-8 pt-2 animate-in fade-in duration-300">
        {/* Compliance Notice Banner */}
        <div className="p-4 bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#3D6B22] border border-emerald-200/80 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">Immutable Audit Governance:</span>{" "}
              <span className="text-slate-500 font-medium text-xs">
                Records are cryptographically sequenced. Audit history cannot be altered or purged by any user role. Full change diffs are preserved in each note's detail dossier.
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200/80">
            <Lock className="w-3.5 h-3.5 text-slate-400" /> Read-Only Ledger
          </span>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search Note ID, client, caregiver, user, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            >
              <option value="all">All Actions</option>
              <option value="NOTE_APPROVED">Note Approved</option>
              <option value="NOTE_REVIEWED">Note Reviewed</option>
              <option value="CORRECTION_REQUESTED">Correction Requested</option>
              <option value="CORRECTION_ACCEPTED">Correction Accepted</option>
              <option value="NOTE_RESUBMITTED">Note Resubmitted</option>
              <option value="FLAGGED_FOR_CLINICAL_REVIEW">Flagged for Clinical</option>
              <option value="FLAGGED_FOR_COMPLIANCE_REVIEW">Flagged for Compliance</option>
              <option value="REVIEWER_ASSIGNED">Reviewer Assigned</option>
              <option value="RULE_UPDATED">Rule Updated</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Agency Operations Admin</option>
              <option value="caregiver">Caregiver</option>
              <option value="clinical">Clinical Supervisor (RN)</option>
              <option value="compliance">Compliance Auditor</option>
              <option value="rule">Rule Engine (Automated)</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table - Clean Front List */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Note ID</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action Event</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actor & Role</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Activity Detail</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-500 whitespace-nowrap text-xs">
                      {evt.timestamp}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      {evt.noteId.startsWith("CN-") ? (
                        <Link
                          href={`/admin/care-notes/${evt.noteId}`}
                          className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 transition-colors"
                        >
                          {evt.noteId}
                        </Link>
                      ) : (
                        <span className="font-mono text-xs font-semibold text-slate-600">
                          {evt.noteId}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-[#3D6B22] font-bold text-[10px] shrink-0">
                          {getInitials(evt.clientName)}
                        </div>
                        <span className="font-semibold text-xs text-slate-800 whitespace-nowrap">
                          {evt.clientName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {evt.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-700 whitespace-nowrap">
                      <div className="font-semibold text-xs text-slate-900">{evt.user}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{evt.role}</div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-600 text-xs max-w-sm truncate" title={evt.reason || `${evt.previousValue ? `${evt.previousValue} → ` : ""}${evt.newValue || ""}`}>
                      {evt.reason || (evt.newValue ? `Changed to: ${evt.newValue}` : "-")}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      {evt.noteId.startsWith("CN-") ? (
                        <Link
                          href={`/admin/care-notes/${evt.noteId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
                        >
                          <span>View Note</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">System</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
