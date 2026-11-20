"use client";

import React, { useState } from "react";
import { CaregiverRecord } from "@/types/caregiver";
import { X, Calendar, Clock, User, FileText, CheckCircle2 } from "lucide-react";
import { INITIAL_CLIENTS } from "@/lib/clients/mockData";
import { toast } from "sonner";

interface CaregiverScheduleShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  caregiver: CaregiverRecord;
  onScheduleShift: (
    caregiverId: string,
    shift: {
      clientName: string;
      date: string;
      startTime: string;
      endTime: string;
      type: string;
      notes: string;
    }
  ) => void;
}

export function CaregiverScheduleShiftModal({
  isOpen,
  onClose,
  caregiver,
  onScheduleShift,
}: CaregiverScheduleShiftModalProps) {
  const [selectedClientName, setSelectedClientName] = useState(
    caregiver.availabilityAssignments.assignedClient?.name || INITIAL_CLIENTS[0]?.name || "Leo Miller"
  );
  const [date, setDate] = useState("2026-11-22");
  const [startTime, setStartTime] = useState("08:00 AM");
  const [endTime, setEndTime] = useState("04:00 PM");
  const [shiftType, setShiftType] = useState("ADL Personal Care & Standby Supervision");
  const [notes, setNotes] = useState("Regular scheduled shift. Verify EVV GPS clock-in at client household.");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onScheduleShift(caregiver.id, {
      clientName: selectedClientName,
      date,
      startTime,
      endTime,
      type: shiftType,
      notes,
    });
    toast.success(`Care shift scheduled for ${caregiver.name} with ${selectedClientName}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg relative bg-white rounded-2xl sm:rounded-[20px] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                Schedule Caregiver Shift
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {caregiver.name} ({caregiver.id}) · {caregiver.employmentClassification}
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
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Assigned Client (Household Recipient) <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClientName}
              onChange={(e) => setSelectedClientName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
            >
              {INITIAL_CLIENTS.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.id}) · {c.careType} ({c.household.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Shift Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Start Time <span className="text-red-500">*</span>
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
              >
                <option value="06:00 AM">06:00 AM</option>
                <option value="07:00 AM">07:00 AM</option>
                <option value="08:00 AM">08:00 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
              </select>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                End Time <span className="text-red-500">*</span>
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
              >
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
                <option value="08:00 PM">08:00 PM</option>
                <option value="10:00 PM">10:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Service Activity & Authorization Line
            </label>
            <select
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
            >
              <option value="ADL Personal Care & Standby Supervision">ADL Personal Care & Standby Supervision</option>
              <option value="Structured Family Caregiving Daily Care (SFC)">Structured Family Caregiving Daily Care (SFC)</option>
              <option value="Companionship & Meal Preparation">Companionship & Meal Preparation</option>
              <option value="Respite Care Services">Respite Care Services</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              EVV & Household Shift Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide specific care tasks, medication reminders, or safety requirements..."
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
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm & Dispatch Shift</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
