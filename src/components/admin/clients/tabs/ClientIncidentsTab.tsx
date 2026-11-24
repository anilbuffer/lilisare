"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  User,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { ClientRecord, IncidentReport } from "@/types/client";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientIncidentsTabProps {
  client: ClientRecord;
  onUpdateClient?: (updated: ClientRecord) => void;
}

export function ClientIncidentsTab({ client, onUpdateClient }: ClientIncidentsTabProps) {
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const incidents = client.incidents || [];

  const [form, setForm] = useState({
    category: "Fall" as "Fall" | "Medication Error" | "Hospitalization" | "Skin Tear / Injury" | "Behavioral Exception",
    severity: "Medium" as "Low" | "Medium" | "High" | "Critical",
    description: "",
    actionTaken: "",
    reportedBy: "Sarah Miller (Lead DSP)",
  });

  const handleFileIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) {
      toast.error("Please provide an incident description.");
      return;
    }

    const newInc: IncidentReport = {
      id: `INC-${Date.now()}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      category: form.category,
      severity: form.severity,
      description: form.description.trim(),
      actionTaken: form.actionTaken.trim() || "Immediate assessment performed; guardian notified within required state window.",
      reportedBy: form.reportedBy.trim(),
      stateReported: true,
      status: "Under Investigation",
    };

    const updated: ClientRecord = {
      ...client,
      incidents: [newInc, ...incidents],
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) onUpdateClient(updated);

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }

    setIsFileModalOpen(false);
    setForm({
      category: "Fall",
      severity: "Medium",
      description: "",
      actionTaken: "",
      reportedBy: "Sarah Miller (Lead DSP)",
    });
    toast.success(`Incident ${newInc.id} recorded and compliance report opened.`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Incident Reporting & Safety Exception Tracking
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                State Compliance
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              State waiver incident reports, fall evaluations, injury logs, and resolution investigations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsFileModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>File Incident</span>
        </button>
      </div>

      {incidents.length === 0 ? (
        <div className="bg-white rounded-xl lg:rounded-2xl p-8 sm:p-10 border border-slate-200 text-center text-slate-500 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#3D6B22] border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">No Critical Incidents Recorded</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            This client has an unblemished safety record with zero reportable state critical incidents or open compliance investigations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className=" font-bold text-xs bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded">
                    {inc.id}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {inc.category} Incident
                  </h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${inc.severity === "Low"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : inc.severity === "Critical"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                  >
                    Severity: {inc.severity}
                  </span>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#3D6B22] border border-emerald-200 self-start sm:self-auto">
                  Status: {inc.status}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                {inc.description}
              </div>

              {/* Resolution details */}
              <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Investigation & Corrective Resolution
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {inc.actionTaken}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
                <span>Reported Date: {inc.date}</span>
                <span>Investigator: <strong className="text-slate-700">{inc.reportedBy}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Incident Modal */}
      <Modal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        title="File Safety Incident Report"
        icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleFileIncident} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Incident Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
              >
                <option value="Fall">Fall</option>
                <option value="Medication Error">Medication Error</option>
                <option value="Behavioral Exception">Behavioral Exception</option>
                <option value="Skin Tear / Injury">Skin Tear / Injury</option>
                <option value="Hospitalization">Hospitalization</option>
              </select>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Severity Level
              </label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
              >
                <option value="Low">Low (No injury, minor event)</option>
                <option value="Medium">Medium (First-aid provided, family informed)</option>
                <option value="High">High (Urgent clinical review required)</option>
                <option value="Critical">Critical (Emergency services / hospitalization)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Incident Narrative Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="State exactly what occurred, time of event, witnesses present, and client response..."
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Immediate Action Taken & Corrective Resolution
            </label>
            <textarea
              rows={2}
              value={form.actionTaken}
              onChange={(e) => setForm({ ...form, actionTaken: e.target.value })}
              placeholder="First aid administered, RN on-call notified, vitals checked..."
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Reporting Staff / Investigator
            </label>
            <input
              type="text"
              required
              value={form.reportedBy}
              onChange={(e) => setForm({ ...form, reportedBy: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFileModalOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Submit Incident Report</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
