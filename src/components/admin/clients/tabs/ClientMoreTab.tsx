"use client";

import React, { useState } from "react";
import {
  MoreHorizontal,
  Clock,
  Download,
  Printer,
  History,
  Archive,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { ClientRecord } from "@/types/client";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientMoreTabProps {
  client: ClientRecord;
  onUpdateClient?: (updated: ClientRecord) => void;
}

export function ClientMoreTab({ client, onUpdateClient }: ClientMoreTabProps) {
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [dischargeReason, setDischargeReason] = useState("Transitioned to State Self-Directed Program");
  const [dischargeConfirmed, setDischargeConfirmed] = useState(false);

  const activities = client.activity || [];

  const handleConfirmDischarge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dischargeConfirmed) {
      toast.error("Please confirm the discharge authorization checkbox.");
      return;
    }

    const newActivity = {
      id: `ACT-${Date.now()}`,
      timestamp: "Today, Just now",
      type: "status_change" as const,
      author: "Agency Admin",
      authorRole: "Operational Administrator",
      title: "Case Discharged & Inactivated",
      details: `Case closed with reason: "${dischargeReason}". Recurring shift commitments cancelled.`,
    };

    const updated: ClientRecord = {
      ...client,
      status: "Discharged",
      agencyInfo: {
        ...client.agencyInfo,
        status: "Discharged",
      },
      activity: [newActivity, ...activities],
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) onUpdateClient(updated);

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }

    setIsDischargeModalOpen(false);
    toast.success("Client case successfully discharged and archived.");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Audit Chronology, Change Logs & Case Lifecycle
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                <ShieldCheck className="w-3 h-3 text-[#3D6B22]" /> Immutable Log
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Immutable HIPAA compliance audit history, export tools, and case closure workflows
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              window.print();
              toast.success("Printing client record...");
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Profile</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const dataStr =
                "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(client, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute(
                "download",
                `client_${client.id}_export.json`
              );
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
              toast.success("Client record exported to JSON.");
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Audit History Timeline Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3D6B22]" />
              <span>Compliance Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Tamper-evident log of changes made to this client record
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto shrink-0">
            {activities.length} Events
          </span>
        </div>

        <div className="space-y-3">
          {activities.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-colors"
            >
              <div>
                <div className="font-bold text-sm text-slate-900">{act.title}</div>
                <div className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                  {act.details}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
                  <span>Actor: <strong className="text-slate-700">{act.author}</strong></span>
                  <span>•</span>
                  <span>IP: 192.168.1.42 (Encrypted Session)</span>
                </div>
              </div>

              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
                {act.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone / Case Lifecycle Management */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-rose-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div>
            <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Case Lifecycle Governance (Agency Admin Only)</span>
            </h4>
            <p className="text-xs text-rose-700 font-medium">
              Discharge, case transfer, and historical archiving operations
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-rose-50/40 p-4 rounded-xl border border-rose-100">
          <div>
            <div className="text-sm font-bold text-rose-950">
              Discharge / Inactivate Client Case
            </div>
            <div className="text-xs text-rose-800 mt-0.5">
              Permanently stops recurring shifts and releases authorized caregiver assignments.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDischargeModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Discharge Client</span>
          </button>
        </div>
      </div>

      {/* Discharge Client Confirmation Modal */}
      <Modal
        isOpen={isDischargeModalOpen}
        onClose={() => setIsDischargeModalOpen(false)}
        title="Discharge & Archive Client Case"
        description="This action marks the client case as Inactive and terminates recurring shift schedules."
        icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmDischarge} className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Primary Discharge Reason
            </label>
            <select
              value={dischargeReason}
              onChange={(e) => setDischargeReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer"
            >
              <option value="Transitioned to State Self-Directed Program">Transitioned to State Self-Directed Program</option>
              <option value="Relocated Outside Service District">Relocated Outside Service District</option>
              <option value="Goals Achieved / Condition Improved">Goals Achieved / Condition Improved</option>
              <option value="Family Requested Service Discontinuation">Family Requested Service Discontinuation</option>
              <option value="Administrative Closure">Administrative Closure</option>
            </select>
          </div>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-rose-200 bg-rose-50/60 cursor-pointer">
            <input
              type="checkbox"
              checked={dischargeConfirmed}
              onChange={(e) => setDischargeConfirmed(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500"
            />
            <span className="text-xs text-rose-950 font-medium">
              I certify as an Agency Administrator that supervisory approval has been recorded and the client/guardian has been given formal written notification.
            </span>
          </label>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDischargeModalOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!dischargeConfirmed}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <Archive className="w-4 h-4" />
              <span>Confirm Discharge</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
