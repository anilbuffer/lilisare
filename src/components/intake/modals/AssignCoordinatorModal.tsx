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
      <div className="w-full max-w-md bg-[#FFFFFF] rounded-2xl border border-[#D5DFDA] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D5DFDA] bg-[#F7F9F8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E3F1D9] text-[#1E5622] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111C16]">
                Assign Intake Coordinator
              </h2>
              <p className="text-xs text-[#4A5D52]">
                {inquiry.familyName} · {inquiry.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#D5DFDA] flex items-center justify-center text-[#74877C] hover:text-[#111C16] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-2.5 text-xs">
          {COORDINATORS.map((c) => {
            const isSelected = selectedName === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => setSelectedName(c.name)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#F2F8EE] border-[#3D6B22] shadow-xs ring-2 ring-[#3D6B22]/15"
                    : "bg-[#FFFFFF] hover:bg-[#F7F9F8] border-[#D5DFDA]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#D5DFDA]"
                  />
                  <div>
                    <h3 className="font-bold text-[#111C16]">{c.name}</h3>
                    <p className="text-[11px] text-[#4A5D52]">{c.role}</p>
                    <span className="text-[10px] text-[#74877C]">{c.workload}</span>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-[#3D6B22]" />}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D5DFDA] bg-[#F7F9F8] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-[#4A5D52] hover:text-[#111C16]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#2C5217] rounded-xl shadow-xs"
          >
            Update Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
