"use client";

import React, { useState } from "react";
import { ClientRecord } from "@/types/client";
import { X, Calendar, Stethoscope, Clock, UserCheck } from "lucide-react";
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg relative bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Schedule Clinical Visit / RN Review
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {client.name} ({client.id}) · {client.household.name}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Visit Date *
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
                Target Time
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="01:00 PM">01:00 PM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Assigned Clinician / RN Supervisor *
            </label>
            <select
              value={clinician}
              onChange={(e) => setClinician(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            >
              <option value="Marcus Chen, RN (Clinical Supervisor)">
                Marcus Chen, RN (Clinical Supervisor)
              </option>
              <option value="Patricia Ramos, RN (Intake Clinical Assessor)">
                Patricia Ramos, RN (Intake Clinical Assessor)
              </option>
              <option value="Angela Wright, BSN, RN (Care Director)">
                Angela Wright, BSN, RN (Care Director)
              </option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Visit Purpose & Classification
            </label>
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            >
              <option value="Comprehensive In-Home RN Assessment">
                Comprehensive In-Home RN Assessment
              </option>
              <option value="Routine 60-Day Reassessment & Plan Review">
                Routine 60-Day Reassessment & Plan Review
              </option>
              <option value="Caregiver Skills & ADL Competency Review">
                Caregiver Skills & ADL Competency Review
              </option>
              <option value="Environmental Safety & Mobility Assessment">
                Environmental Safety & Mobility Assessment
              </option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Clinical Assessment Focus & Instructions
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
            <span className="font-bold text-slate-800 block mb-0.5">Visit Location:</span>
            <span>
              {client.household.address}, {client.household.city}, {client.household.state} {client.household.zip}
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
              <Calendar className="w-3.5 h-3.5" />
              <span>Confirm & Schedule Visit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
