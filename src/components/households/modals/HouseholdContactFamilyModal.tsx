"use client";

import React, { useState } from "react";
import { Household } from "@/lib/households/mockData";
import { X, Phone, Mail, Send } from "lucide-react";
import { toast } from "sonner";

interface HouseholdContactFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household;
  onLogCommunication: (householdId: string, type: "call" | "email" | "note", note: string) => void;
}

export function HouseholdContactFamilyModal({
  isOpen,
  onClose,
  household,
  onLogCommunication,
}: HouseholdContactFamilyModalProps) {
  const [commType, setCommType] = useState<"call" | "email" | "note">("call");
  const [outcome, setOutcome] = useState("Connected - Discussed Care & Scheduling");
  const [targetContact, setTargetContact] = useState<"caregiver" | "client">("caregiver");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const currentContactName =
    targetContact === "caregiver" ? household.primaryCaregiver.name : household.client.name;
  const currentContactPhone =
    targetContact === "caregiver" ? household.primaryCaregiver.phone : household.client.phone;
  const currentContactEmail =
    targetContact === "caregiver" ? household.primaryCaregiver.email : household.client.email;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.error("Please enter communication notes");
      return;
    }
    const fullNote = `${outcome} (${targetContact === "caregiver" ? "Primary Caregiver" : "Care Recipient"} ${currentContactName}): ${notes.trim()}`;
    onLogCommunication(household.id, commType, fullNote);
    toast.success(`Contact logged for ${household.name}`);
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg relative bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Contact Household · {household.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Code: {household.code} · Primary: {household.primaryCaregiver.name} ({household.primaryCaregiver.relationship})
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
          {/* Target Household Member */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Contact Person
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetContact("caregiver")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${targetContact === "caregiver"
                    ? "border-[#3D6B22] bg-[#3D6B22]/5 text-[#3D6B22] font-bold"
                    : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <span className="block text-xs">{household.primaryCaregiver.name}</span>
                <span className="block text-[11px] opacity-75 font-normal">Primary Caregiver</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetContact("client")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${targetContact === "client"
                    ? "border-[#3D6B22] bg-[#3D6B22]/5 text-[#3D6B22] font-bold"
                    : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <span className="block text-xs">{household.client.name}</span>
                <span className="block text-[11px] opacity-75 font-normal">Care Recipient</span>
              </button>
            </div>
          </div>

          {/* Quick Connect Actions */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${currentContactPhone}`}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-[#3D6B22] font-semibold transition-colors"
            >
              <Phone className="w-4 h-4 text-[#3D6B22]" />
              <span>Call ({currentContactPhone})</span>
            </a>
            <a
              href={`mailto:${currentContactEmail}`}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-[#3D6B22] font-semibold transition-colors"
            >
              <Mail className="w-4 h-4 text-[#3D6B22]" />
              <span>Send Email</span>
            </a>
          </div>

          {/* Communication Type */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Activity Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "call", label: "Phone Call" },
                { id: "email", label: "Email" },
                { id: "note", label: "Staff Note" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setCommType(opt.id as any)}
                  className={`py-2 px-3 rounded-xl border text-center font-semibold transition-colors cursor-pointer ${commType === opt.id
                      ? "border-[#3D6B22] bg-[#3D6B22] text-white shadow-[0_2px_8px_rgba(61,107,34,0.25)]"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Outcome */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Contact Outcome
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
            >
              <option value="Connected - Discussed Care & Scheduling">Connected - Discussed Care & Scheduling</option>
              <option value="Connected - Authorization Recertification">Connected - Authorization Recertification</option>
              <option value="Connected - EVV Geofence Support">Connected - EVV Geofence Support</option>
              <option value="Left Voicemail">Left Voicemail</option>
              <option value="Email Sent - Awaiting Reply">Email Sent - Awaiting Reply</option>
              <option value="No Answer">No Answer</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Conversation Details & Follow-up Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record details of the discussion, next steps, or family preferences..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white rounded-xl font-bold shadow-[0_4px_16px_rgba(61,107,34,0.25)] transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log to Timeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
