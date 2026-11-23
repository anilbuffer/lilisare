"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { InquiryRecord } from "@/types/intake";
import { convertInquiryToLiveEntities } from "@/lib/intake/intakeSync";
import {
  X,
  CheckCircle2,
  Users,
  Heart,
} from "lucide-react";
import { toast } from "sonner";

interface ConvertToOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: InquiryRecord;
  onConfirmConversion: (inquiryId: string) => void;
}

export function ConvertToOnboardingModal({
  isOpen,
  onClose,
  inquiry,
  onConfirmConversion,
}: ConvertToOnboardingModalProps) {
  const [createClient, setCreateClient] = useState(true);
  const [createCaregiver, setCreateCaregiver] = useState(
    Boolean(inquiry.familyInfo.potentialCaregiver?.name)
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key to provide a rock-solid full page overlay without fluctuation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const handleConvert = () => {
    if (!createClient && !createCaregiver) {
      toast.error("Please select at least one record to create.");
      return;
    }
    // Synchronize to live Agency Admin storage
    convertInquiryToLiveEntities(inquiry.id, { createClient, createCaregiver });
    onConfirmConversion(inquiry.id);
    toast.success(`${inquiry.familyName} converted to onboarding successfully!`);
    onClose();
  };

  const potentialCaregiverName =
    inquiry.familyInfo.potentialCaregiver?.name || "Assigned Caregiver";

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg relative bg-white rounded-2xl sm:rounded-[20px] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col my-auto max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                Convert Inquiry to Onboarding
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
        <div className="p-5 sm:p-6 space-y-4 text-xs bg-white flex-1 overflow-y-auto custom-scrollbar">
          {/* Inquiry Summary Card */}
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="text-[13px] font-bold text-slate-900 truncate">
                {inquiry.familyInfo.clientInfo.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                <span>{inquiry.careRequirements.programInterest}</span>
                <span>•</span>
                <span>{inquiry.familyInfo.householdLocation.city}, GA</span>
                <span>•</span>
                <span>{inquiry.careRequirements.hoursPerWeek} hrs/wk</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 shrink-0">
              Ready
            </span>
          </div>

          {/* Record Selection */}
          <div className="space-y-2.5 pt-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Records to Create
            </label>

            {/* Client Registration Option */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${createClient
                  ? "bg-[#3D6B22]/5 border-[#3D6B22] shadow-2xs"
                  : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
            >
              <input
                type="checkbox"
                checked={createClient}
                onChange={(e) => setCreateClient(e.target.checked)}
                className="mt-0.5 rounded text-[#3D6B22] focus:ring-[#3D6B22] accent-[#3D6B22] w-4 h-4 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#3D6B22]" />
                  <span className="font-bold text-slate-900 text-xs">
                    Client Profile
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enroll <strong>{inquiry.familyInfo.clientInfo.name}</strong> into active client onboarding and care planning.
                </p>
              </div>
            </label>

            {/* Caregiver Registration Option */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${createCaregiver
                  ? "bg-[#3D6B22]/5 border-[#3D6B22] shadow-2xs"
                  : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
            >
              <input
                type="checkbox"
                checked={createCaregiver}
                onChange={(e) => setCreateCaregiver(e.target.checked)}
                className="mt-0.5 rounded text-[#3D6B22] focus:ring-[#3D6B22] accent-[#3D6B22] w-4 h-4 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#3D6B22]" />
                  <span className="font-bold text-slate-900 text-xs">
                    Caregiver Onboarding
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Start onboarding checklist for <strong>{potentialCaregiverName}</strong> (screening, training & payroll).
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 rounded-b-2xl sm:rounded-b-[20px]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConvert}
            disabled={!createClient && !createCaregiver}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Convert to Onboarding</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
