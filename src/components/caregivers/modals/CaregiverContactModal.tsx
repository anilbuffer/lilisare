"use client";

import React, { useState } from "react";
import { CaregiverRecord } from "@/types/caregiver";
import { X, Phone, Mail, Send } from "lucide-react";
import { toast } from "sonner";

interface CaregiverContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  caregiver: CaregiverRecord;
  onLogCommunication: (caregiverId: string, type: "call" | "email" | "note", note: string) => void;
}

export function CaregiverContactModal({
  isOpen,
  onClose,
  caregiver,
  onLogCommunication,
}: CaregiverContactModalProps) {
  const [commType, setCommType] = useState<"call" | "email" | "note">("call");
  const [outcome, setOutcome] = useState("Connected - Shift Availability Confirmed");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.error("Please enter communication notes");
      return;
    }
    const fullNote = `${outcome}: ${notes.trim()}`;
    onLogCommunication(caregiver.id, commType, fullNote);
    toast.success(`Contact logged for ${caregiver.name}`);
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg relative bg-white rounded-2xl sm:rounded-[20px] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                Contact Caregiver · {caregiver.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Direct: {caregiver.personalInfo.phone} · Classification: {caregiver.employmentClassification}
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 bg-white text-xs">
          {/* Quick Connect Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={`tel:${caregiver.personalInfo.phone}`}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50/50 hover:border-[#3D6B22]/40 text-slate-800 hover:text-[#3D6B22] font-semibold text-xs shadow-2xs transition-all"
            >
              <Phone className="w-4 h-4 text-[#3D6B22]" />
              <span className="truncate">Call {caregiver.personalInfo.phone}</span>
            </a>
            <a
              href={`mailto:${caregiver.personalInfo.email}`}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50/50 hover:border-[#3D6B22]/40 text-slate-800 hover:text-[#3D6B22] font-semibold text-xs shadow-2xs transition-all"
            >
              <Mail className="w-4 h-4 text-[#3D6B22]" />
              <span>Send Email</span>
            </a>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Communication Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCommType("call")}
                className={`py-2.5 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  commType === "call"
                    ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-[0_2px_8px_rgba(61,107,34,0.25)]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Phone Call
              </button>
              <button
                type="button"
                onClick={() => setCommType("email")}
                className={`py-2.5 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  commType === "email"
                    ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-[0_2px_8px_rgba(61,107,34,0.25)]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setCommType("note")}
                className={`py-2.5 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  commType === "note"
                    ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-[0_2px_8px_rgba(61,107,34,0.25)]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Internal Note
              </button>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Call / Conversation Outcome
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
            >
              <option value="Connected - Shift Availability Confirmed">Connected - Shift Availability Confirmed</option>
              <option value="Left Voicemail">Left Voicemail</option>
              <option value="Shift Replacement Offered">Shift Replacement Offered</option>
              <option value="Compliance / Training Follow-up">Compliance / Training Follow-up</option>
              <option value="Payroll / Timecard Resolved">Payroll / Timecard Resolved</option>
              <option value="General Supervision Note">General Supervision Note</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Conversation Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Record details of conversation, shift availability, or supervisory instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Save & Log to Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
