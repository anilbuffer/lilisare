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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Schedule Caregiver Shift
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {caregiver.name} ({caregiver.id}) · {caregiver.employmentClassification}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Assigned Client / Household *
            </label>
            <select
              value={selectedClientName}
              onChange={(e) => setSelectedClientName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            >
              {INITIAL_CLIENTS.map((cl) => (
                <option key={cl.id} value={cl.name}>
                  {cl.name} ({cl.id}) – {cl.household.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Shift Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Start Time
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              >
                <option value="07:00 AM">07:00 AM</option>
                <option value="08:00 AM">08:00 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                End Time
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              >
                <option value="01:00 PM">01:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
                <option value="08:00 PM">08:00 PM</option>
                <option value="10:00 PM">10:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Service Type & Program
            </label>
            <select
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            >
              <option value="ADL Personal Care & Standby Supervision">
                ADL Personal Care & Standby Supervision
              </option>
              <option value="Respite Care / Family Relief">
                Respite Care / Family Relief
              </option>
              <option value="Attendant Care & Meal Preparation">
                Attendant Care & Meal Preparation
              </option>
              <option value="Community Inclusion & Transportation">
                Community Inclusion & Transportation
              </option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Shift Instructions & EVV Verification Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all resize-none text-slate-800"
            />
          </div>

          {/* Household Context */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 text-slate-600">
            <span className="font-bold text-slate-800 block mb-0.5">Assigned Service Location:</span>
            <span>
              {caregiver.relationship.linkedHousehold.address}, {caregiver.relationship.linkedHousehold.city}, {caregiver.relationship.linkedHousehold.state}
            </span>
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
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm & Dispatch Shift</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
