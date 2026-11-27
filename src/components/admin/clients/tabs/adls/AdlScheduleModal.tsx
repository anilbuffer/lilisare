"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  ClipboardList,
  Circle,
  Target,
  Languages,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormButtonPrimary,
  FormButtonCancel,
} from "@/components/ui/FormControls";
import {
  AdlAssessmentItem,
  AdlDayKey,
  AdlFrequencyType,
  AdlTimeSlot,
  AdlWeeklySchedule,
} from "@/types/client";
import {
  ADL_DAYS,
  ADL_GROUP_OPTIONS,
  ADL_LEVEL_OPTIONS,
  ADL_TIME_SLOTS,
  createUniformSchedule,
  inferWeeklySchedule,
  summarizeWeeklySchedule,
} from "./adlHelpers";

interface AdlScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem: AdlAssessmentItem | null;
  onSave: (item: AdlAssessmentItem) => void;
}

export function AdlScheduleModal({
  isOpen,
  onClose,
  initialItem,
  onSave,
}: AdlScheduleModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"ADL" | "IADL">("ADL");
  const [group, setGroup] = useState<string>("Personal Care & Hygiene");
  const [level, setLevel] = useState<AdlAssessmentItem["level"]>("Minimal Assist");
  const [instructions, setInstructions] = useState("");
  const [instructionsEs, setInstructionsEs] = useState("");
  const [schedule, setSchedule] = useState<AdlWeeklySchedule>(
    createUniformSchedule("always")
  );
  const [selectedDay, setSelectedDay] = useState<AdlDayKey | "all">("all");

  useEffect(() => {
    if (!isOpen) return;
    if (initialItem) {
      setName(initialItem.name);
      setCategory(initialItem.category);
      setGroup(
        initialItem.group ||
        (initialItem.category === "ADL"
          ? "Personal Care & Hygiene"
          : "Household & Community")
      );
      setLevel(initialItem.level);
      setInstructions(initialItem.instructions || "");
      setInstructionsEs(initialItem.instructionsEs || "");
      setSchedule(inferWeeklySchedule(initialItem));
    } else {
      setName("");
      setCategory("ADL");
      setGroup("Personal Care & Hygiene");
      setLevel("Minimal Assist");
      setInstructions("");
      setInstructionsEs("");
      setSchedule(createUniformSchedule("always"));
    }
    setSelectedDay("all");
  }, [isOpen, initialItem]);

  const applyFrequencyToTarget = (
    type: AdlFrequencyType,
    times?: AdlTimeSlot[]
  ) => {
    const nextCell =
      type === "specific_times"
        ? { type, times: times && times.length > 0 ? times : (["Morning"] as AdlTimeSlot[]) }
        : { type };

    if (selectedDay === "all") {
      setSchedule(createUniformSchedule(type, nextCell.times));
    } else {
      setSchedule((prev) => ({
        ...prev,
        [selectedDay]: nextCell,
      }));
    }
  };

  const toggleTimeSlot = (slot: AdlTimeSlot) => {
    const current =
      selectedDay === "all" ? schedule.mon : schedule[selectedDay];
    const existing = current.times || [];
    const nextTimes = existing.includes(slot)
      ? existing.filter((t) => t !== slot)
      : [...existing, slot];

    const finalTimes: AdlTimeSlot[] =
      nextTimes.length > 0 ? nextTimes : ["Morning"];
    applyFrequencyToTarget("specific_times", finalTimes);
  };

  const activeCell =
    selectedDay === "all" ? schedule.mon : schedule[selectedDay];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialItem?.id || `ADL-${Date.now()}`,
      name: name.trim(),
      category,
      group,
      level,
      frequency: summarizeWeeklySchedule(schedule),
      instructions: instructions.trim(),
      instructionsEs: instructionsEs.trim() || undefined,
      weeklySchedule: schedule,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialItem ? `Edit ADL: ${initialItem.name}` : "Add Activity of Daily Living"}
      icon={<ClipboardList className="w-5 h-5" />}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Core Task Info */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <span>ADL Task & Clinical Classification</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <FormLabel required>ADL Name</FormLabel>
              <FormInput
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Bathing & Showering, Meal Preparation, Medication Reminders"
              />
            </div>

            <div>
              <FormLabel>Domain Type</FormLabel>
              <FormSelect
                value={category}
                onChange={(e) => setCategory(e.target.value as "ADL" | "IADL")}
              >
                <option value="ADL">ADL (Basic Personal Care)</option>
                <option value="IADL">IADL (Instrumental Support)</option>
              </FormSelect>
            </div>

            <div>
              <FormLabel>Assistance Level</FormLabel>
              <FormSelect
                value={level}
                onChange={(e) =>
                  setLevel(e.target.value as AdlAssessmentItem["level"])
                }
              >
                {ADL_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </FormSelect>
            </div>

            <div className="sm:col-span-2">
              <FormLabel>Care Group / Category</FormLabel>
              <FormSelect
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                {ADL_GROUP_OPTIONS.map((grp) => (
                  <option key={grp} value={grp}>
                    {grp}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>
        </div>

        {/* Section 2: Weekly Schedule Builder */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <span>Weekly Care Schedule (Mon – Sun)</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>

          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-3.5">
            {/* Day Selector Tabs */}
            <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedDay("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedDay === "all"
                  ? "bg-[#3D6B22] text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
              >
                ALL DAYS
              </button>
              {ADL_DAYS.map((day) => {
                const dayType = schedule[day.key].type;
                const isSelected = selectedDay === day.key;
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => setSelectedDay(day.key)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${isSelected
                      ? "bg-[#3D6B22] text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <span>{day.short}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isSelected
                        ? "bg-white"
                        : dayType === "always"
                          ? "bg-[#3D6B22]"
                          : dayType === "as_needed"
                            ? "bg-sky-500"
                            : dayType === "specific_times"
                              ? "bg-amber-500"
                              : "bg-slate-300"
                        }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Frequency Mode Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {
                  type: "always" as const,
                  label: "Always",
                  icon: CheckCircle2,
                  activeClass:
                    "bg-[#3D6B22]/10 border-[#3D6B22] text-[#3D6B22]",
                },
                {
                  type: "as_needed" as const,
                  label: "As needed",
                  icon: Target,
                  activeClass: "bg-sky-50 border-sky-500 text-sky-700",
                },
                {
                  type: "specific_times" as const,
                  label: "Specific times",
                  icon: Clock,
                  activeClass: "bg-amber-50 border-amber-500 text-amber-800",
                },
                {
                  type: "never" as const,
                  label: "Never",
                  icon: Circle,
                  activeClass: "bg-slate-100 border-slate-400 text-slate-700",
                },
              ].map((opt) => {
                const Icon = opt.icon;
                const isActive = activeCell.type === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() =>
                      applyFrequencyToTarget(
                        opt.type,
                        opt.type === "specific_times"
                          ? activeCell.times || ["Morning"]
                          : undefined
                      )
                    }
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${isActive
                      ? opt.activeClass
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Time Slots Picker when Specific Times */}
            {activeCell.type === "specific_times" && (
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">
                  Time Windows:
                </span>
                {ADL_TIME_SLOTS.map((slot) => {
                  const checked = (activeCell.times || []).includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleTimeSlot(slot)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${checked
                        ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Bilingual Instructions */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <Languages className="w-3.5 h-3.5 text-slate-400" />
            <span>Caregiver Instructions (English & Spanish)</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <FormLabel>Instructions (English)</FormLabel>
              <FormTextarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., Ensure 3 meals a day and serve water with fiber supplement powder"
                className="resize-none"
              />
            </div>

            <div>
              <FormLabel>Instructions in Spanish (Optional)</FormLabel>
              <FormTextarea
                rows={3}
                value={instructionsEs}
                onChange={(e) => setInstructionsEs(e.target.value)}
                placeholder="e.g., Asegúrese de comer 3 comidas al día..."
                className="resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <FormButtonCancel type="button" onClick={onClose}>
            Cancel
          </FormButtonCancel>
          <FormButtonPrimary type="submit">
            <CheckCircle2 className="w-4 h-4" />
            <span>{initialItem ? "Save ADL Changes" : "Add ADL to Care Plan"}</span>
          </FormButtonPrimary>
        </div>
      </form>
    </Modal>
  );
}
