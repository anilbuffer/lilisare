"use client";

import React, { useState } from "react";
import { InquiryRecord } from "@/types/intake";
import { X, Phone, Mail, MessageSquare, Send, Check } from "lucide-react";
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
      <div className="w-full max-w-lg bg-[#FFFFFF] rounded-2xl border border-[#D5DFDA] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D5DFDA] bg-[#F7F9F8] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#111C16]">
              Contact Family · {inquiry.familyName}
            </h2>
            <p className="text-xs text-[#4A5D52] mt-0.5">
              Primary: {inquiry.familyInfo.primaryContact} ({inquiry.familyInfo.phone})
            </p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Quick Connect Actions */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${inquiry.familyInfo.phone}`}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#D5DFDA] bg-[#FFFFFF] hover:bg-[#F2F8EE] text-[#111C16] hover:text-[#3D6B22] font-semibold transition-colors"
            >
              <Phone className="w-4 h-4 text-[#3D6B22]" />
              <span>Call {inquiry.familyInfo.phone}</span>
            </a>
            <a
              href={`mailto:${inquiry.familyInfo.email}`}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#D5DFDA] bg-[#FFFFFF] hover:bg-[#F2F8EE] text-[#111C16] hover:text-[#3D6B22] font-semibold transition-colors"
            >
              <Mail className="w-4 h-4 text-[#3D6B22]" />
              <span>Send Email</span>
            </a>
          </div>

          <div>
            <label className="font-semibold text-[#111C16] block mb-1">
              Communication Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCommType("call")}
                className={`p-2 rounded-xl border text-center font-medium transition-all ${
                  commType === "call" ? "bg-[#3D6B22] text-white border-[#3D6B22]" : "bg-[#F7F9F8] text-[#4A5D52] border-[#D5DFDA]"
                }`}
              >
                Phone Call
              </button>
              <button
                type="button"
                onClick={() => setCommType("email")}
                className={`p-2 rounded-xl border text-center font-medium transition-all ${
                  commType === "email" ? "bg-[#3D6B22] text-white border-[#3D6B22]" : "bg-[#F7F9F8] text-[#4A5D52] border-[#D5DFDA]"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setCommType("note")}
                className={`p-2 rounded-xl border text-center font-medium transition-all ${
                  commType === "note" ? "bg-[#3D6B22] text-white border-[#3D6B22]" : "bg-[#F7F9F8] text-[#4A5D52] border-[#D5DFDA]"
                }`}
              >
                Internal Note
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#111C16] block mb-1">
              Call / Conversation Outcome
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
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
            <label className="font-semibold text-[#111C16] block mb-1">
              Follow-up Conversation Notes *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Record family remarks, questions, care requirements discussed, and agreed next steps..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#D5DFDA]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-[#4A5D52] hover:text-[#111C16]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#2C5217] rounded-xl shadow-xs"
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
