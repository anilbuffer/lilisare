"use client";

import React, { useState } from "react";
import { Household } from "@/lib/households/mockData";
import { X, Calendar, Stethoscope, Clock, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface HouseholdScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household;
  onConfirmSchedule: (
    householdId: string,
    details: {
      scheduledDate: string;
      scheduledTime: string;
      clinician: string;
      type: string;
      notes: string;
    }
  ) => void;
}

export function HouseholdScheduleVisitModal({
  isOpen,
  onClose,
  household,
  onConfirmSchedule,
}: HouseholdScheduleVisitModalProps) {
  const [date, setDate] = useState("2026-11-23");
  const [time, setTime] = useState("10:00 AM");
  const [clinician, setClinician] = useState("Marcus Chen, RN (Field Clinical Supervisor)");
  const [visitType, setVisitType] = useState("60-Day In-Home Supervisory & EVV Review");
  const [notes, setNotes] = useState(
    "Verify care recipient condition, review EVV timesheets with primary caregiver, and audit active authorization goals."
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSchedule(household.id, {
      scheduledDate: date,
      scheduledTime: time,
      clinician,
      type: visitType,
      notes,
    });
    toast.success(`Visit scheduled for ${household.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg relative bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Schedule Household Visit
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {household.name} · {household.address}, {household.city}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Household Context */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Care Recipient & Caregiver</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {household.client.name} & {household.primaryCaregiver.name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Program</span>
              <span className="font-semibold text-emerald-800 mt-0.5 block">
                {household.program}
              </span>
            </div>
          </div>

          {/* Visit Type */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Visit Purpose / Type
            </label>
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
            >
              <option value="60-Day In-Home Supervisory & EVV Review">
                60-Day In-Home Supervisory & EVV Review
              </option>
              <option value="Annual Re-assessment & Care Plan Re-certification">
                Annual Re-assessment & Care Plan Re-certification
              </option>
              <option value="Unscheduled Quality Assurance & Safety Audit">
                Unscheduled Quality Assurance & Safety Audit
              </option>
              <option value="Caregiver Training & Competency Verification">
                Caregiver Training & Competency Verification
              </option>
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Visit Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Target Time Window
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
              >
                <option value="09:00 AM">09:00 AM – 10:30 AM</option>
                <option value="10:00 AM">10:00 AM – 11:30 AM</option>
                <option value="01:00 PM">01:00 PM – 02:30 PM</option>
                <option value="03:00 PM">03:00 PM – 04:30 PM</option>
              </select>
            </div>
          </div>

          {/* Clinician / Field Supervisor */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Assigned Field Supervisor / Clinician
            </label>
            <div className="relative">
              <select
                value={clinician}
                onChange={(e) => setClinician(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
              >
                <option value="Marcus Chen, RN (Field Clinical Supervisor)">
                  Marcus Chen, RN (Field Clinical Supervisor)
                </option>
                <option value="Elena Rostova, RN (Lead Clinical Assessor)">
                  Elena Rostova, RN (Lead Clinical Assessor)
                </option>
                <option value="David Miller, LPN (Quality Assurance)">
                  David Miller, LPN (Quality Assurance)
                </option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Clinical & Dispatch Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              <Calendar className="w-3.5 h-3.5" />
              <span>Confirm & Dispatch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
