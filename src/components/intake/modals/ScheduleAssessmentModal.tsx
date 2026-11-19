"use client";

import React, { useState } from "react";
import { InquiryRecord } from "@/types/intake";
import { X, Calendar, Clock, Stethoscope, CheckCircle2, User } from "lucide-react";
import { toast } from "sonner";

interface ScheduleAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: InquiryRecord;
  onConfirmSchedule: (
    inquiryId: string,
    details: {
      scheduledDate: string;
      scheduledTime: string;
      assessor: string;
      type: string;
      notes: string;
    }
  ) => void;
}

export function ScheduleAssessmentModal({
  isOpen,
  onClose,
  inquiry,
  onConfirmSchedule,
}: ScheduleAssessmentModalProps) {
  const [date, setDate] = useState("2026-11-22");
  const [time, setTime] = useState("10:30 AM");
  const [assessor, setAssessor] = useState("Marcus Chen, RN (Clinical Supervisor)");
  const [assessmentType, setAssessmentType] = useState("Comprehensive In-Home RN Assessment");
  const [notes, setNotes] = useState("Review mobility, medication list, and home environment safety.");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSchedule(inquiry.id, {
      scheduledDate: date,
      scheduledTime: time,
      assessor,
      type: assessmentType,
      notes,
    });
    toast.success(`RN assessment scheduled for ${inquiry.familyInfo.clientInfo.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#FFFFFF] rounded-2xl border border-[#D5DFDA] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D5DFDA] bg-[#F7F9F8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111C16]">
                Schedule Clinical Assessment
              </h2>
              <p className="text-xs text-[#4A5D52]">
                {inquiry.familyName} · Client: {inquiry.familyInfo.clientInfo.name}
              </p>
            </div>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#111C16] block mb-1">
                Assessment Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#111C16] block mb-1">
                Target Time
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
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
            <label className="font-semibold text-[#111C16] block mb-1">
              Assigned Clinical Assessor
            </label>
            <select
              value={assessor}
              onChange={(e) => setAssessor(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
            >
              <option value="Marcus Chen, RN (Clinical Supervisor)">Marcus Chen, RN (Clinical Supervisor)</option>
              <option value="Dr. Rachel Adams, MD">Dr. Rachel Adams, MD (Medical Director)</option>
              <option value="Sarah Jenkins (Senior Intake Lead)">Sarah Jenkins (Senior Intake Lead)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-[#111C16] block mb-1">
              Assessment Type
            </label>
            <select
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
            >
              <option value="Comprehensive In-Home RN Assessment">Comprehensive In-Home RN Assessment</option>
              <option value="SFC Home Safety & Health Verification">SFC Home Safety & Health Verification</option>
              <option value="Pediatric GAPP Clinical Evaluation">Pediatric GAPP Clinical Evaluation</option>
              <option value="Virtual Intake Discovery Interview">Virtual Intake Discovery Interview</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-[#111C16] block mb-1">
              Clinical Special Instructions
            </label>
            <textarea
              rows={2}
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
              <Calendar className="w-3.5 h-3.5" />
              <span>Confirm Assessment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
