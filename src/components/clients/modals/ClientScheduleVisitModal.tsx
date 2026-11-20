"use client";

import React, { useState } from "react";
import { ClientRecord } from "@/types/client";
import { X, Calendar, Stethoscope } from "lucide-react";
import { toast } from "sonner";

interface ClientScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientRecord;
  onConfirmSchedule: (
    clientId: string,
    details: {
      scheduledDate: string;
      scheduledTime: string;
      clinician: string;
      type: string;
      notes: string;
    }
  ) => void;
}

export function ClientScheduleVisitModal({
  isOpen,
  onClose,
  client,
  onConfirmSchedule,
}: ClientScheduleVisitModalProps) {
  const [date, setDate] = useState("2026-11-22");
  const [time, setTime] = useState("10:30 AM");
  const [clinician, setClinician] = useState("Marcus Chen, RN (Clinical Supervisor)");
  const [visitType, setVisitType] = useState("Comprehensive In-Home RN Assessment");
  const [notes, setNotes] = useState("Review client ADL performance, environmental safety, and verify caregiver tasks.");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSchedule(client.id, {
      scheduledDate: date,
      scheduledTime: time,
      clinician,
      type: visitType,
      notes,
    });
    toast.success(`Visit scheduled for ${client.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg relative bg-white rounded-2xl sm:rounded-[20px] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                Schedule Clinical Visit / RN Review
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {client.name} ({client.id}) · {client.household.name}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Visit Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Target Time <span className="text-red-500">*</span>
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
              >
                <option value="08:00 AM">08:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="01:00 PM">01:00 PM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Assigned Clinician
            </label>
            <select
              value={clinician}
              onChange={(e) => setClinician(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
            >
              <option value="Marcus Chen, RN (Clinical Supervisor)">Marcus Chen, RN (Clinical Supervisor)</option>
              <option value="Dr. Rachel Adams, MD">Dr. Rachel Adams, MD (Medical Director)</option>
              <option value="Alisha Vance, LPN (Field Nurse)">Alisha Vance, LPN (Field Nurse)</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Visit Purpose & Classification
            </label>
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
            >
              <option value="Comprehensive In-Home RN Assessment">Comprehensive In-Home RN Assessment</option>
              <option value="60-Day Supervisory Evaluation (Medicaid / CCSP)">60-Day Supervisory Evaluation (Medicaid / CCSP)</option>
              <option value="SFC Health & Safety Oversight Visit">SFC Health & Safety Oversight Visit</option>
              <option value="Post-Hospitalization Discharge Review">Post-Hospitalization Discharge Review</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Clinical Special Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clinical instructions, risk flags, or items requiring verification..."
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
              <Calendar className="w-3.5 h-3.5" />
              <span>Confirm & Schedule Visit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
