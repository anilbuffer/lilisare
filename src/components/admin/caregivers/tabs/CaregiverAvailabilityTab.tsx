"use client";

import React, { useState } from "react";
import {
  Clock,
  Calendar,
  Check,
  X,
  Save,
  AlertCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { AdminCaregiverProfile, CaregiverAvailabilityBlock } from "@/lib/caregivers/adminCaregiversData";
import { toast } from "sonner";

interface CaregiverAvailabilityTabProps {
  profile: AdminCaregiverProfile;
}

const DEFAULT_DAYS: CaregiverAvailabilityBlock[] = [
  { day: "Monday", isAvailable: true, morning: true, afternoon: true, evening: false, night: false },
  { day: "Tuesday", isAvailable: true, morning: true, afternoon: true, evening: false, night: false },
  { day: "Wednesday", isAvailable: true, morning: true, afternoon: true, evening: true, night: false },
  { day: "Thursday", isAvailable: true, morning: true, afternoon: true, evening: false, night: false },
  { day: "Friday", isAvailable: true, morning: true, afternoon: true, evening: true, night: false },
  { day: "Saturday", isAvailable: false, morning: false, afternoon: false, evening: false, night: false },
  { day: "Sunday", isAvailable: false, morning: false, afternoon: false, evening: false, night: false },
];

export function CaregiverAvailabilityTab({ profile }: CaregiverAvailabilityTabProps) {
  const [blocks, setBlocks] = useState<CaregiverAvailabilityBlock[]>(
    profile.availabilityBlocks || DEFAULT_DAYS
  );
  const [isSaving, setIsSaving] = useState(false);

  // Compute total weekly available slots
  const totalSlots = blocks.reduce((acc, b) => {
    let slots = 0;
    if (b.isAvailable) {
      if (b.morning) slots += 4;
      if (b.afternoon) slots += 5;
      if (b.evening) slots += 4;
      if (b.night) slots += 11;
    }
    return acc + slots;
  }, 0);

  const toggleDayAvailable = (index: number) => {
    setBlocks((prev) => {
      const updated = [...prev];
      const target = updated[index];
      const nextVal = !target.isAvailable;
      updated[index] = {
        ...target,
        isAvailable: nextVal,
        morning: nextVal,
        afternoon: nextVal,
        evening: false,
        night: false,
      };
      return updated;
    });
  };

  const toggleSlot = (
    index: number,
    slot: "morning" | "afternoon" | "evening" | "night"
  ) => {
    setBlocks((prev) => {
      const updated = [...prev];
      const target = updated[index];
      updated[index] = {
        ...target,
        [slot]: !target[slot],
        isAvailable: true,
      };
      return updated;
    });
  };

  const handleApplyPreset = (preset: "standard" | "weekdays" | "all") => {
    if (preset === "standard") {
      setBlocks(DEFAULT_DAYS);
      toast.info("Applied Standard Schedule (Mon-Fri 8am-5pm)");
    } else if (preset === "weekdays") {
      setBlocks((prev) =>
        prev.map((d, i) =>
          i < 5
            ? { ...d, isAvailable: true, morning: true, afternoon: true, evening: true, night: false }
            : { ...d, isAvailable: false, morning: false, afternoon: false, evening: false, night: false }
        )
      );
      toast.info("Applied Full Weekdays (Mon-Fri 8am-9pm)");
    } else if (preset === "all") {
      setBlocks((prev) =>
        prev.map((d) => ({
          ...d,
          isAvailable: true,
          morning: true,
          afternoon: true,
          evening: true,
          night: false,
        }))
      );
      toast.info("Applied All 7 Days Available");
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Caregiver availability blocks updated successfully.");
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 01. Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Weekly Recurring Availability Blocks
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                ~{totalSlots} hrs / week potential
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Shift time bands configured for auto-dispatch and smart caregiver matching algorithms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleApplyPreset("standard")}
              className="px-2.5 py-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white font-medium transition-colors cursor-pointer"
            >
              Standard 40h
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset("weekdays")}
              className="px-2.5 py-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white font-medium transition-colors cursor-pointer"
            >
              All Weekdays
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Availability"}</span>
          </button>
        </div>
      </div>

      {/* 02. Grid of 7 Days Matrix */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Day of Week</th>
                <th className="py-3.5 px-4 text-center">Day Status</th>
                <th className="py-3.5 px-4 text-center">Morning (8am – 12pm)</th>
                <th className="py-3.5 px-4 text-center">Afternoon (12pm – 5pm)</th>
                <th className="py-3.5 px-4 text-center">Evening (5pm – 9pm)</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Night (9pm – 8am)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {blocks.map((block, idx) => (
                <tr key={block.day} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${block.isAvailable ? "bg-[#3D6B22]" : "bg-slate-300"}`} />
                      <span>{block.day}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleDayAvailable(idx)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        block.isAvailable
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/60"
                      }`}
                    >
                      {block.isAvailable ? "Available" : "Unavailable"}
                    </button>
                  </td>

                  {/* Morning */}
                  <td className="py-4 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSlot(idx, "morning")}
                      disabled={!block.isAvailable}
                      className={`w-8 h-8 rounded-xl border inline-flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        block.morning
                          ? "bg-[#3D6B22] border-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20 scale-105"
                          : "bg-white border-slate-200 text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {block.morning && <Check className="w-4 h-4 stroke-[2.5]" />}
                    </button>
                  </td>

                  {/* Afternoon */}
                  <td className="py-4 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSlot(idx, "afternoon")}
                      disabled={!block.isAvailable}
                      className={`w-8 h-8 rounded-xl border inline-flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        block.afternoon
                          ? "bg-[#3D6B22] border-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20 scale-105"
                          : "bg-white border-slate-200 text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {block.afternoon && <Check className="w-4 h-4 stroke-[2.5]" />}
                    </button>
                  </td>

                  {/* Evening */}
                  <td className="py-4 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSlot(idx, "evening")}
                      disabled={!block.isAvailable}
                      className={`w-8 h-8 rounded-xl border inline-flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        block.evening
                          ? "bg-[#3D6B22] border-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20 scale-105"
                          : "bg-white border-slate-200 text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {block.evening && <Check className="w-4 h-4 stroke-[2.5]" />}
                    </button>
                  </td>

                  {/* Night */}
                  <td className="py-4 px-4 sm:px-6 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSlot(idx, "night")}
                      disabled={!block.isAvailable}
                      className={`w-8 h-8 rounded-xl border inline-flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        block.night
                          ? "bg-[#3D6B22] border-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20 scale-105"
                          : "bg-white border-slate-200 text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {block.night && <Check className="w-4 h-4 stroke-[2.5]" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
