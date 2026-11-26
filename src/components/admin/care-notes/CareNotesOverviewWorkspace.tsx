"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CareNote,
  CareNotesKpiSummary,
} from "@/types/careNotes";
import {
  getCareNotesFromStorage,
  getCareNotesKpiSummary,
  CARE_NOTES_SYNC_EVENT,
} from "@/lib/admin/careNotesStore";
import { CareNotesSubNav } from "./CareNotesSubNav";
import { CareNotesKpiCards } from "./CareNotesKpiCards";
import { CareNotesAttentionPanel } from "./CareNotesAttentionPanel";
import { CareNotesActivityChart } from "./CareNotesActivityChart";
import { CareNoteStatusBadge, CareNoteQualityIndicator } from "./CareNotesBadges";
import {
  FileText,
  ArrowRight,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Calendar,
  Eye,
  Users,
} from "lucide-react";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

interface CareNotesOverviewWorkspaceProps {
  hideSubNav?: boolean;
  onTabChange?: (tabId: string) => void;
}

export function CareNotesOverviewWorkspace({
  hideSubNav = false,
  onTabChange,
}: CareNotesOverviewWorkspaceProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<CareNote[]>([]);
  const [kpi, setKpi] = useState<CareNotesKpiSummary>(() => getCareNotesKpiSummary());
  const [selectedOffice, setSelectedOffice] = useState("All Offices");
  const [selectedProgram, setSelectedProgram] = useState("All Programs");
  const [selectedDateRange, setSelectedDateRange] = useState("Last 30 Days");

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

  // Filter notes for recent activity table
  const filteredNotes = notes.filter((n) => {
    if (selectedOffice !== "All Offices" && n.agencyName !== selectedOffice) return false;
    if (selectedProgram !== "All Programs" && n.programName !== selectedProgram) return false;
    return true;
  });

  const recentNotes = filteredNotes.slice(0, 6);

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Sub-Navigation Header & Standalone Tabs Bar */}
      {!hideSubNav && (
        <CareNotesSubNav
          title="CareNotes"
          activeTab="overview"
          onTabChange={onTabChange}
        />
      )}

      {/* KPI Summary Cards */}
      <CareNotesKpiCards kpi={kpi} onTabChange={onTabChange} />

      {/* Needs Attention Panel */}
      <CareNotesAttentionPanel notes={filteredNotes} onTabChange={onTabChange} />

      {/* Mid Section: Activity Chart + Future AI & Quality Principles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <CareNotesActivityChart />
        </div>

        {/* Core Product Principle & AI Release 2 Card */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
          <div className="max-h-[350px] overflow-y-auto pr-1 [scrollbar-width:thin]">
            <div className="flex items-center gap-3 pb-3.5 mb-3.5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22] shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">AI & Care Quality Protocol</h3>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 mb-3.5 text-xs text-emerald-950 font-medium">
              <p className="font-bold text-[#3D6B22] mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3D6B22]" /> Core Governance Principle
              </p>
              Caregiver creates and approves the final care note. Agency Admin reviews, audits and manages its quality and compliance. Admin never silently alters caregiver documentation.
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <UserCheck className="w-4 h-4 text-[#3D6B22] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">Caregiver Voice Dictation:</span> Mobile app dictation assists caregivers in recording comprehensive notes.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3D6B22] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">Configurable Pre-Validation:</span> Automated validation against program-specific documentation requirements.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#3D6B22] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">Human Approval Safeguard:</span> No automatic AI sign-offs; every consequential action creates an audit event.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Documentation Engine v2.4</span>
            <button
              type="button"
              onClick={() => {
                if (onTabChange) onTabChange("rules");
                else router.push("/admin/care-notes?tab=rules");
              }}
              className="text-xs font-bold text-[#3D6B22] hover:text-[#345C1D] inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              Manage Documentation Rules <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Care Notes Operational Table (Clean Front List) */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Care Notes</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onTabChange) onTabChange("all");
              else router.push("/admin/care-notes?tab=all");
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/20 border border-[#3D6B22]/20 rounded-xl transition-all cursor-pointer"
          >
            <span>View All Notes ({filteredNotes.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Note ID</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Caregiver</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date of Service</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentNotes.map((note) => (
                <tr
                  key={note.id}
                  onClick={() => router.push(`/admin/care-notes/${note.id}`)}
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                >
                  {/* Note ID */}
                  <td className="py-4 px-4 sm:px-6">
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

                  {/* Date of Service */}
                  <td className="py-4 px-4 sm:px-6 text-xs text-slate-600 whitespace-nowrap font-medium">
                    {note.serviceDate}
                  </td>

                  {/* Status & Quality */}
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <CareNoteStatusBadge status={note.reviewStatus} />
                      <CareNoteQualityIndicator
                        status={note.qualityStatus}
                        issueCount={note.qualityIssues?.length}
                      />
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
