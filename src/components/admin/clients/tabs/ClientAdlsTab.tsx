"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  Plus,
  HelpCircle,
  ShieldCheck,
  Edit2,
} from "lucide-react";
import { ClientRecord, AdlAssessmentItem } from "@/types/client";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientAdlsTabProps {
  client: ClientRecord;
  onUpdateClient?: (updated: ClientRecord) => void;
}

export function ClientAdlsTab({ client, onUpdateClient }: ClientAdlsTabProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const adls = client.adls || [];
  const [editedAdls, setEditedAdls] = useState<AdlAssessmentItem[]>(adls);

  const handleOpenModal = () => {
    setEditedAdls(JSON.parse(JSON.stringify(adls)));
    setIsUpdateModalOpen(true);
  };

  const handleLevelChange = (idx: number, newLevel: AdlAssessmentItem["level"]) => {
    const next = [...editedAdls];
    next[idx] = { ...next[idx], level: newLevel };
    setEditedAdls(next);
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ClientRecord = {
      ...client,
      adls: editedAdls,
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) onUpdateClient(updated);

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }

    setIsUpdateModalOpen(false);
    toast.success("ADL Functional Independence Matrix updated successfully.");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Activities of Daily Living (ADLs & IADLs)
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                <ShieldCheck className="w-3 h-3 text-[#3D6B22]" /> Standard Assessment
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Standardized functional independence scale, transfer assistance needs, and caregiver duties
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Update Assessment</span>
        </button>
      </div>

      {/* ADLs Grid Container */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Functional Independence Matrix
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Categorized assistance requirements for daily personal care
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {adls.length} Assessed Tasks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adls.map((item, idx) => {
            const isTotal = item.level === "Total Dependent";
            const isModerate = item.level === "Moderate Assist";
            const isMinimal = item.level === "Minimal Assist";
            const isSupervision = item.level === "Supervision";

            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className=" text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isTotal
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : isModerate
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : isMinimal
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-emerald-50 text-[#3D6B22] border border-emerald-200"
                        }`}
                    >
                      {item.level}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2.5">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.instructions}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
                  <span>Assistance Level</span>
                  <span className="font-bold text-slate-700">{item.level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reassess ADLs Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Reassess Functional ADL Matrix"
        icon={<ClipboardList className="w-5 h-5 text-[#3D6B22]" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAssessment} className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
            {editedAdls.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{item.name}</div>
                  <div className="text-[11px] text-slate-500">{item.category}</div>
                </div>

                <select
                  value={item.level}
                  onChange={(e) => handleLevelChange(idx, e.target.value as any)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 cursor-pointer"
                >
                  <option value="Total Dependent">Total Dependent</option>
                  <option value="Moderate Assist">Moderate Assist</option>
                  <option value="Minimal Assist">Minimal Assist</option>
                  <option value="Supervision">Supervision</option>
                  <option value="Independent">Independent</option>
                </select>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save ADL Assessment</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
