"use client";

import React from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Heart,
  Plus,
  ShieldCheck,
  Activity,
  MessageSquare,
  Lock,
  Sparkles,
} from "lucide-react";
import { ClientRecord } from "@/types/client";
import { PortalRole } from "../AdminClientDetailView";
import { toast } from "sonner";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientCareNotesTabProps {
  client: ClientRecord;
  userRole?: PortalRole;
  onUpdateClient?: (updated: ClientRecord) => void;
}

export function ClientCareNotesTab({
  client,
  userRole = "admin",
  onUpdateClient,
}: ClientCareNotesTabProps) {
  const careNotes = client.careNotes || [];
  const canApproveNotes = userRole === "admin" || userRole === "clinical";

  const handleApproveAllNotes = () => {
    const updatedNotes = careNotes.map((n) => ({
      ...n,
      supervisorApproval: "Approved" as const,
    }));

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

    toast.success("RN Sign-Off Complete: All shift care notes approved and recorded.");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                EVV Shift Care Notes & Clinical Logs
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                <CheckCircle2 className="w-3 h-3 text-[#3D6B22]" /> Real-time Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Shift documentation, task completion records, and notes submitted upon caregiver clock-out
            </p>
          </div>
        </div>

        {canApproveNotes ? (
          <button
            type="button"
            onClick={handleApproveAllNotes}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approve Notes (RN Sign-Off)</span>
          </button>
        ) : (
          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
            RN Review Required for Approval
          </span>
        )}
      </div>

      {/* Care Notes Timeline */}
      <div className="space-y-4">
        {careNotes.length === 0 ? (
          <div className="bg-white rounded-xl lg:rounded-2xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
            No care notes have been logged for this client yet.
          </div>
        ) : (
          careNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-4"
            >
              {/* Top Row: Date, Caregiver, Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#3D6B22] border border-emerald-200 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                    {note.caregiverName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {note.caregiverName}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      {note.visitDate} • <span className=" text-slate-600">{note.service}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${note.supervisorApproval === "Approved"
                        ? "bg-emerald-50 text-[#3D6B22] border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                  >
                    {note.supervisorApproval}
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    <ShieldCheck className="w-3 h-3 text-[#3D6B22]" />
                    <span>{note.evvLocationStatus}</span>
                  </span>
                </div>
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
                  "{note.notes}"
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
