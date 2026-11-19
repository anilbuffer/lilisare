"use client";

import React, { useState } from "react";
import { CaregiverRecord } from "@/types/caregiver";
import { X, Phone, Mail, Send, Smartphone } from "lucide-react";
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Contact Caregiver · {caregiver.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct Phone: {caregiver.personalInfo.phone} · Classification: {caregiver.employmentClassification}
            </p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Quick Connect Actions */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${caregiver.personalInfo.phone}`}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-[#3D6B22] font-semibold transition-colors"
            >
              <Phone className="w-4 h-4 text-[#3D6B22]" />
              <span>Call {caregiver.personalInfo.phone}</span>
            </a>
            <a
              href={`mailto:${caregiver.personalInfo.email}`}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-[#3D6B22] font-semibold transition-colors"
            >
              <Mail className="w-4 h-4 text-[#3D6B22]" />
              <span>Send Email</span>
            </a>
          </div>

          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Communication Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCommType("call")}
                className={`p-2 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                  commType === "call" ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-2xs" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Phone Call
              </button>
              <button
                type="button"
                onClick={() => setCommType("email")}
                className={`p-2 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                  commType === "email" ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-2xs" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setCommType("note")}
                className={`p-2 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                  commType === "note" ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-2xs" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                App / In-Person
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Contact Reason & Outcome
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            >
              <option value="Connected - Shift Availability Confirmed">Connected - Shift Availability Confirmed</option>
              <option value="Left Voicemail / Callback Requested">Left Voicemail / Callback Requested</option>
              <option value="EVV Clock In/Out Protocol Discussed">EVV Clock In/Out Protocol Discussed</option>
              <option value="Credential Renewal Follow-Up">Credential Renewal Follow-Up</option>
              <option value="Care Plan Task Supervision">Care Plan Task Supervision</option>
              <option value="Training Module Assistance Provided">Training Module Assistance Provided</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Notes & Conversation Details *
            </label>
            <textarea
              required
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record details of conversation, scheduling agreements, or next actions..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all resize-none text-slate-800"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white font-bold rounded-xl text-xs shadow-[0_4px_16px_rgba(61,107,34,0.25)] flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log Contact to Timeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
