"use client";

import React, { useState } from "react";
import { InquiryRecord } from "@/types/intake";
import { convertInquiryToLiveEntities } from "@/lib/intake/intakeSync";
import {
  X,
  CheckCircle2,
  Users,
  Heart,
  ShieldCheck,
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

  if (!isOpen) return null;

  const handleConvert = () => {
    // Synchronize to live Agency Admin storage
    convertInquiryToLiveEntities(inquiry.id, { createClient, createCaregiver });
    onConfirmConversion(inquiry.id);
    toast.success(`${inquiry.familyName} qualified, converted, and synced with Agency Admin!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl relative bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1E5622] border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Convert Inquiry to Onboarding
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {inquiry.id} · {inquiry.familyName}
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
        <div className="p-6 space-y-4 text-xs">
          {/* Architectural Notice */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-[#1E5622] leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Three Connected Journeys Integration</span>
            </div>
            <p className="text-[11px] text-emerald-900">
              Intake qualifies the initial family inquiry. Converting advances this household into active Client and Caregiver Onboarding workflows while maintaining a unified case record.
            </p>
          </div>

          {/* Qualified Summary */}
          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>Inquiry Qualification Summary</span>
              <span className="text-[11px] text-[#3D6B22] font-bold">Ready for Conversion</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>
                <span>Client to register:</span>{" "}
                <strong className="text-slate-900">{inquiry.familyInfo.clientInfo.name}</strong>
              </div>
              <div>
                <span>Program:</span>{" "}
                <strong className="text-slate-900">{inquiry.careRequirements.programInterest}</strong>
              </div>
              <div>
                <span>Service Location:</span>{" "}
                <strong className="text-slate-900">{inquiry.familyInfo.householdLocation.city}, GA</strong>
              </div>
              <div>
                <span>Approved Hours:</span>{" "}
                <strong className="text-slate-900">{inquiry.careRequirements.hoursPerWeek} hrs/week</strong>
              </div>
            </div>
          </div>

          {/* Journey Transition Targets */}
          <div className="space-y-2.5">
            <span className="font-bold text-slate-900 block">
              Generate Linked Workflows:
            </span>

            {/* Journey 1: Client Onboarding */}
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={createClient}
                onChange={(e) => setCreateClient(e.target.checked)}
                className="mt-0.5 rounded text-[#3D6B22] focus:ring-[#3D6B22]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#3D6B22]" />
                  <span className="font-bold text-slate-900">
                    Client Registration (Client Journey)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Create new Client Profile for <strong>{inquiry.familyInfo.clientInfo.name}</strong> in the Patients portal with medical history and service authorization setup.
                </p>
              </div>
            </label>

            {/* Journey 2: Caregiver Onboarding */}
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={createCaregiver}
                onChange={(e) => setCreateCaregiver(e.target.checked)}
                className="mt-0.5 rounded text-[#3D6B22] focus:ring-[#3D6B22]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-600" />
                  <span className="font-bold text-slate-900">
                    Caregiver Registration (Caregiver Journey)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Initiate onboarding checklist for family or assigned caregiver{" "}
                  <strong>({inquiry.familyInfo.potentialCaregiver?.name || "In-Home Caregiver"})</strong> including screening, training, and ADP payroll.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConvert}
            className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#2C5217] rounded-xl shadow-sm shadow-[#3D6B22]/20 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Confirm & Convert to Onboarding</span>
          </button>
        </div>
      </div>
    </div>
  );
}
