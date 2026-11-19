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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1E5622] border border-emerald-200 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Assign Intake Coordinator
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {inquiry.familyName} · {inquiry.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-2 text-xs">
          {COORDINATORS.map((c) => {
            const isSelected = selectedName === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => setSelectedName(c.name)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${isSelected
                  ? "bg-emerald-50/50 border-[#3D6B22] shadow-2xs ring-2 ring-[#3D6B22]/15"
                  : "bg-slate-50/70 hover:bg-white border-slate-200 hover:border-slate-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900">{c.name}</h3>
                    <p className="text-[11px] text-slate-500">{c.role}</p>
                    <span className="text-[10px] text-slate-400">{c.workload}</span>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-[#3D6B22]" />}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#2C5217] rounded-xl shadow-sm shadow-[#3D6B22]/20 cursor-pointer"
          >
            Update Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
