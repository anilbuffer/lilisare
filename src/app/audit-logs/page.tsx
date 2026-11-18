"use client";

import React, { useState } from "react";
import { History, ShieldCheck, Download, Search, Filter, AlertTriangle, Eye, Edit, UserCheck, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    role: string;
    email: string;
  };
  action: "VIEW_PHI" | "UPDATE_AUTH" | "ACTIVATE_CAREGIVER" | "EXPORT_PAYROLL" | "LOGIN_MFA";
  target: string;
  ipAddress: string;
  status: "SUCCESS" | "FLAGGED";
  details: string;
}

const MOCK_AUDIT_LOGS: AuditEntry[] = [
  {
    id: "aud-901",
    timestamp: "2026-11-18 22:45:10",
    actor: { name: "Sarah Jenkins", role: "Agency Admin", email: "sarah.j@lilisare.com" },
    action: "ACTIVATE_CAREGIVER",
    target: "Mother A (Sarah Miller)",
    ipAddress: "192.168.1.42",
    status: "SUCCESS",
    details: "Caregiver activated for Child A (Leo Miller) after 100% credential and authorization verification.",
  },
  {
    id: "aud-902",
    timestamp: "2026-11-18 22:30:14",
    actor: { name: "Sarah Jenkins", role: "Agency Admin", email: "sarah.j@lilisare.com" },
    action: "UPDATE_AUTH",
    target: "Child A (Leo Miller) - Auth #AUTH-8821",
    ipAddress: "192.168.1.42",
    status: "SUCCESS",
    details: "Service authorization approved for 40 hrs/wk from Case Manager Dana Jenkins.",
  },
  {
    id: "aud-903",
    timestamp: "2026-11-18 21:15:02",
    actor: { name: "Maria Santos, CNA", role: "Caregiver", email: "maria.s@lilisare.com" },
    action: "VIEW_PHI",
    target: "Eleanor Ruth Whitfield (MRN-88491)",
    ipAddress: "73.189.44.12",
    status: "SUCCESS",
    details: "Viewed care plan and allergy list prior to scheduled visit.",
  },
  {
    id: "aud-904",
    timestamp: "2026-11-18 20:50:33",
    actor: { name: "Robert Taylor", role: "Billing Specialist", email: "r.taylor@lilisare.com" },
    action: "EXPORT_PAYROLL",
    target: "ADP Run Batch #ADP-2026-W46",
    ipAddress: "192.168.1.58",
    status: "SUCCESS",
    details: "Exported 38 scrubbed caregiver timesheets to ADP Payroll. PHI excluded per HIPAA protocol.",
  },
  {
    id: "aud-905",
    timestamp: "2026-11-18 19:12:00",
    actor: { name: "Dana Jenkins", role: "Case Manager (External)", email: "dana.jenkins@dhs.state.gov" },
    action: "LOGIN_MFA",
    target: "Case Manager Portal Session",
    ipAddress: "165.206.12.9",
    status: "SUCCESS",
    details: "External portal login verified via TOTP Authenticator MFA.",
  },
];

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const matchesSearch =
      log.actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#1B3414] text-[#93C573] rounded-xl">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs & Security Trail</h1>
            <p className="text-xs text-slate-500">
              HIPAA & COPPA Compliance: Immutable logging of user actions, authorization adjustments, and PHI access.
            </p>
          </div>
        </div>

        <button 
          onClick={() => alert("Audit log export generated (CSV, SHA-256 signed).")}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-[#3D6B22]" /> Export Signed Audit Trail
        </button>
      </div>

      {/* Security Alert Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-2xl flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="text-xs text-emerald-900">
          <strong>HIPAA Audit Guard Active:</strong> All audit records are encrypted at rest with AES-256 and replicated to an immutable AWS S3 Glacier vault. No PHI is exposed in external logging streams.
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by actor, target, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]"
          >
            <option value="ALL">All Actions</option>
            <option value="VIEW_PHI">View PHI</option>
            <option value="UPDATE_AUTH">Update Auth</option>
            <option value="ACTIVATE_CAREGIVER">Activate Caregiver</option>
            <option value="EXPORT_PAYROLL">Export Payroll</option>
            <option value="LOGIN_MFA">MFA Logins</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{log.actor.name}</div>
                    <div className="text-[10px] text-slate-400">{log.actor.role}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {log.target}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.ipAddress}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <ShieldCheck className="w-3.5 h-3.5" /> Success
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
