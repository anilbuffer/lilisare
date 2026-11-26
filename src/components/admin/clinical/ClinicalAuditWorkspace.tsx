"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Lock, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  exportClinicalCsv,
  getClinicalAuditEvents,
  getClinicalDetailHref,
  subscribeToClinicalSync,
} from "@/lib/admin/clinicalSupervisoryStore";
import { ClinicalAuditEvent } from "@/types/clinicalSupervisory";
import { ClinicalSubNav } from "./ClinicalSubNav";

export function ClinicalAuditWorkspace() {
  const [events, setEvents] = useState<ClinicalAuditEvent[]>(() =>
    getClinicalAuditEvents()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const load = () => setEvents(getClinicalAuditEvents());
    load();
    return subscribeToClinicalSync(load);
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
      <div className="p-4 bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#3D6B22] border border-emerald-200/80 flex items-center justify-center shrink-0">
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
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
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

      {/* Audit Table */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1140px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Event ID</th>
                <th className="py-3.5 px-3">Date and Time</th>
                <th className="py-3.5 px-3">User</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Related Client</th>
                <th className="py-3.5 px-3">Related Visit</th>
                <th className="py-3.5 px-3">Action</th>
                <th className="py-3.5 px-3">Previous Value</th>
                <th className="py-3.5 px-3">New Value</th>
                <th className="py-3.5 px-4">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                    {evt.id}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                    {evt.timestamp}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {evt.performedBy}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                    {evt.performedByRole}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                    {evt.relatedClientId !== "SYSTEM" ? (
                      <Link
                        href={`/admin/clients/${evt.relatedClientId}/`}
                        className="hover:text-[#3D6B22] hover:underline"
                      >
                        {evt.relatedClientName}
                      </Link>
                    ) : (
                      evt.relatedClientName
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-mono whitespace-nowrap">
                    {evt.relatedVisitId ? (
                      <Link
                        href={getClinicalDetailHref(evt.relatedVisitId)}
                        className="font-bold text-[#3D6B22] hover:underline"
                      >
                        {evt.relatedVisitId}
                      </Link>
                    ) : (
                      <span className="text-slate-500">{evt.entityId}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-[10px] font-bold text-slate-700">
                      {evt.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 max-w-[150px] truncate">
                    {evt.previousValue}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-800 max-w-[160px] truncate">
                    {evt.newValue}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={evt.reason}>
                    {evt.reason}
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
