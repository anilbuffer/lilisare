"use client";

import React, { useState } from "react";
import { InquiryRecord } from "@/types/intake";
import { X, Phone, Mail, Send } from "lucide-react";
import { toast } from "sonner";

interface ContactFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: InquiryRecord;
  onLogCommunication: (inquiryId: string, type: "call" | "email" | "note", note: string) => void;
}

export function ContactFamilyModal({
  isOpen,
  onClose,
  inquiry,
  onLogCommunication,
}: ContactFamilyModalProps) {
  const [commType, setCommType] = useState<"call" | "email" | "note">("call");
  const [outcome, setOutcome] = useState("Connected - Discussed Care Needs");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.error("Please enter communication notes");
      return;
    }
    const fullNote = `${outcome}: ${notes.trim()}`;
    onLogCommunication(inquiry.id, commType, fullNote);
    toast.success(`Contact logged for ${inquiry.familyInfo.primaryContact}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg relative bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Contact Family · {inquiry.familyName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Primary: {inquiry.familyInfo.primaryContact} ({inquiry.familyInfo.phone})
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
              href={`tel:${inquiry.familyInfo.phone}`}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-[#3D6B22] font-semibold transition-colors"
            >
              <Phone className="w-4 h-4 text-[#3D6B22]" />
              <span>Call {inquiry.familyInfo.phone}</span>
            </a>
            <a
              href={`mailto:${inquiry.familyInfo.email}`}
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
                className={`p-2 rounded-xl border text-center font-semibold transition-all cursor-pointer ${commType === "call" ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-2xs" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                Phone Call
              </button>
              <button
                type="button"
                onClick={() => setCommType("email")}
                className={`p-2 rounded-xl border text-center font-semibold transition-all cursor-pointer ${commType === "email" ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-2xs" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setCommType("note")}
                className={`p-2 rounded-xl border text-center font-semibold transition-all cursor-pointer ${commType === "note" ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-2xs" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                Internal Note
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Call / Conversation Outcome
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            >
              <option value="Connected - Discussed Care Needs">Connected - Discussed Care Needs</option>
              <option value="Left Voicemail">Left Voicemail</option>
              <option value="No Answer / Follow-up Needed">No Answer / Follow-up Needed</option>
              <option value="Assessment Date Agreed">Assessment Date Agreed</option>
              <option value="Requested Documents Sent">Requested Documents Sent</option>
              <option value="Family Evaluating Options">Family Evaluating Options</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Follow-up Conversation Notes *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Record family remarks, questions, care requirements discussed, and agreed next steps..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#2C5217] rounded-xl shadow-sm shadow-[#3D6B22]/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Save & Log to Timeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
