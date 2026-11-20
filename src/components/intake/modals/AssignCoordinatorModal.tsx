"use client";

import React, { useState } from "react";
import { InquiryRecord } from "@/types/intake";
import { X, UserCheck, Check } from "lucide-react";
import { toast } from "sonner";

interface AssignCoordinatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: InquiryRecord;
  onConfirmAssignment: (inquiryId: string, coordinatorName: string, role: string) => void;
}

const COORDINATORS = [
  {
    name: "Sarah Jenkins",
    role: "Senior Intake Lead",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    workload: "18 Active Cases",
  },
  {
    name: "Elena Rostova",
    role: "Intake Coordinator",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    workload: "14 Active Cases",
  },
  {
    name: "Marcus Vance",
    role: "Intake Specialist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    workload: "16 Active Cases",
  },
];

export function AssignCoordinatorModal({
  isOpen,
  onClose,
  inquiry,
  onConfirmAssignment,
}: AssignCoordinatorModalProps) {
  const [selectedName, setSelectedName] = useState(
    inquiry.referralInfo.assignedCoordinator.name
  );

  if (!isOpen) return null;

  const handleSave = () => {
    const coord = COORDINATORS.find((c) => c.name === selectedName);
    if (coord) {
      onConfirmAssignment(inquiry.id, coord.name, coord.role);
      toast.success(`Assigned to ${coord.name}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md relative bg-white rounded-2xl sm:rounded-[20px] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                Assign Intake Coordinator
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {inquiry.familyName} · {inquiry.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-2.5 text-xs bg-white">
          <div className="mb-3">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
              <span>Select Intake Specialist</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </h4>
            <p className="text-xs text-slate-500">
              Assign an intake team member to own outreach and family onboarding SLA.
            </p>
          </div>

          {COORDINATORS.map((c) => {
            const isSelected = selectedName === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => setSelectedName(c.name)}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${isSelected
                  ? "bg-[#3D6B22]/5 border-[#3D6B22] shadow-2xs ring-2 ring-[#3D6B22]/15"
                  : "bg-slate-50/60 hover:bg-white border-slate-200 hover:border-slate-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-[13px]">{c.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{c.role}</p>
                    <span className="text-[10px] text-slate-400">{c.workload}</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-lg bg-[#3D6B22] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2.5 sm:gap-3 rounded-b-2xl sm:rounded-b-[20px]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
          >
            Update Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
