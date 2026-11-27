"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, Lock, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  exportClinicalCsv,
  getClinicalAuditEventDetailHref,
  getClinicalAuditEvents,
  subscribeToClinicalSync,
} from "@/lib/admin/clinicalSupervisoryStore";
import { ClinicalAuditEvent } from "@/types/clinicalSupervisory";
import { ClinicalSubNav } from "./ClinicalSubNav";
import { ClinicalAvatarName } from "./ClinicalBadges";

export function ClinicalAuditWorkspace() {
  const router = useRouter();
  const [events, setEvents] = useState<ClinicalAuditEvent[]>(() =>
    getClinicalAuditEvents()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const load = () => setEvents(getClinicalAuditEvents());
    const timer = window.setTimeout(load, 0);
    const unsub = subscribeToClinicalSync(load);
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, []);

  const uniqueActions = useMemo(
    () => Array.from(new Set(events.map((e) => e.action))).sort(),
    [events]
  );

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (actionFilter !== "all" && e.action !== actionFilter) return false;
      if (
        roleFilter !== "all" &&
        !e.performedByRole.toLowerCase().includes(roleFilter.toLowerCase())
      ) {
        return false;
      }
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const hay = `${e.id} ${e.entityId} ${e.relatedClientName} ${e.performedBy} ${e.action} ${e.reason}`.toLowerCase();
        if (!hay.includes(t)) return false;
      }
      return true;
    });
  }, [events, actionFilter, roleFilter, searchTerm]);

  const handleExportAudit = () => {
    exportClinicalCsv(
      filtered.map((e) => ({
        EventID: e.id,
        DateTime: e.timestamp,
        User: e.performedBy,
        Role: e.performedByRole,
        RelatedClient: e.relatedClientName,
        RelatedVisit: e.relatedVisitId || e.entityId,
        Action: e.action,
        PreviousValue: e.previousValue,
        NewValue: e.newValue,
        Reason: e.reason,
      })),
      "lilisare-clinical-audit-history.csv"
    );
    toast.success(`Exported ${filtered.length} immutable audit records`);
  };

  return (
    <div className="w-full max-w-9xl mx-auto min-w-0 space-y-5 animate-in fade-in duration-300 pb-10">
      <ClinicalSubNav activeTab="audit" onExport={handleExportAudit} />

      {/* Read-only Governance Banner */}
      <div className="p-4 sm:p-5 bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900">
              Read-Only Operational &amp; Clinical Audit Trail:
            </span>{" "}
            <span className="text-slate-600">
              All requirement edits, assignments, schedules, documentation requests, clinical sign-offs, escalations, and rule changes are logged immutably. No user role may edit or delete historical audit events.
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5 text-slate-400" /> Read-Only Ledger
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Event ID, client, user, reason..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <select
            aria-label="Filter by Action"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>
                {a.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">All Roles</option>
            <option value="admin">Agency Administrator</option>
            <option value="rn">RN / Clinical Supervisor</option>
          </select>

          <button
            type="button"
            onClick={handleExportAudit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Standardized Clean Audit Table (5 Concise Columns, Zero Horizontal Scroll) */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date &amp; Time</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Related Record</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px] text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No audit events match the active filters.
                  </td>
                </tr>
              ) : (
                filtered.map((evt) => {
                  const detailHref = getClinicalAuditEventDetailHref(evt);
                  return (
                    <tr
                      key={evt.id}
                      onClick={() => router.push(detailHref)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {evt.timestamp}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ClinicalAvatarName
                          name={evt.performedBy}
                          variant="staff"
                          highlightHover
                        />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-[10px] font-bold text-slate-700">
                          {evt.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap max-w-[220px]">
                        <ClinicalAvatarName
                          name={evt.relatedClientName}
                          variant={evt.relatedClientId === "SYSTEM" ? "staff" : "client"}
                        />
                      </td>
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={detailHref}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 transition-colors"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
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
