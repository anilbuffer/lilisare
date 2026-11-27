"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Printer,
  History,
  Target,
  CheckCircle2,
  ClipboardList,
  Sparkles,
  FileText,
  Compass,
  Calendar,
} from "lucide-react";
import { CarePlanChallenge, CarePlanItemStatus } from "@/types/client";
import { Modal } from "@/components/ui/Modal";
import {
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormButtonPrimary,
  FormButtonCancel,
} from "@/components/ui/FormControls";
import { toast } from "sonner";

interface CarePlanChallengesViewProps {
  challenges: CarePlanChallenge[];
  canEdit: boolean;
  onUpdateChallenges: (updated: CarePlanChallenge[]) => void;
}

type SectionKey = "outcomes" | "goals" | "interventions" | "evaluations";

const STATUS_OPTIONS: CarePlanItemStatus[] = [
  "In Progress",
  "Achieved",
  "Completed",
  "On Hold",
  "Discontinued",
  "Inactive",
];

function getStatusBadgeClasses(status: CarePlanItemStatus): string {
  switch (status) {
    case "In Progress":
      return "bg-sky-50 text-sky-700 border-sky-200/80";
    case "Achieved":
    case "Completed":
      return "bg-[#3D6B22]/10 text-[#3D6B22] border-[#3D6B22]/25";
    case "On Hold":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    case "Discontinued":
    case "Inactive":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function parseProgressPercent(progressStr: string): number {
  const match = progressStr.match(/([\d.]+)\s*\/\s*([\d.]+)/);
  if (!match) return 60;
  const current = parseFloat(match[1]);
  const total = parseFloat(match[2]);
  if (!total || Number.isNaN(current) || Number.isNaN(total)) return 60;
  return Math.min(100, Math.max(8, Math.round((current / total) * 100)));
}

function StatusSelectPill({
  value,
  disabled,
  onChange,
}: {
  value: CarePlanItemStatus;
  disabled?: boolean;
  onChange: (next: CarePlanItemStatus) => void;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as CarePlanItemStatus)}
        aria-label="Update item status"
        className={`appearance-none pl-2.5 pr-6 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 disabled:opacity-60 disabled:cursor-not-allowed ${getStatusBadgeClasses(
          value
        )}`}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt} value={opt} className="bg-white text-slate-800">
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3 h-3 pointer-events-none absolute right-2 text-current opacity-70" />
    </div>
  );
}

export function CarePlanChallengesView({
  challenges,
  canEdit,
  onUpdateChallenges,
}: CarePlanChallengesViewProps) {
  const [showInactive, setShowInactive] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [expandedChallenges, setExpandedChallenges] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    challenges.forEach((c) => {
      initial[c.id] = true;
    });
    return initial;
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAddChallengeOpen, setIsAddChallengeOpen] = useState(false);
  const [newChallengeTitle, setNewChallengeTitle] = useState("");
  const [newChallengeStatus, setNewChallengeStatus] = useState<CarePlanItemStatus>("In Progress");

  const [quickAddTarget, setQuickAddTarget] = useState<{
    challengeId: string;
    section: SectionKey;
  } | null>(null);
  const [quickAddDesc, setQuickAddDesc] = useState("");
  const [quickAddBaseline, setQuickAddBaseline] = useState("2. Minimal");
  const [quickAddTargetLevel, setQuickAddTargetLevel] = useState("4. Supervised");
  const [quickAddProgress, setQuickAddProgress] = useState("1.0 / 4");
  const [quickAddTargetDate, setQuickAddTargetDate] = useState("2027-02-28");
  const [quickAddFrequency, setQuickAddFrequency] = useState("Daily");
  const [quickAddInstructions, setQuickAddInstructions] = useState("");
  const [quickAddStatus, setQuickAddStatus] = useState<CarePlanItemStatus>("In Progress");

  const todayFormatted = () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const isSectionExpanded = (challengeId: string, section: SectionKey) => {
    const key = `${challengeId}:${section}`;
    return expandedSections[key] !== false;
  };

  const toggleSection = (challengeId: string, section: SectionKey) => {
    const key = `${challengeId}:${section}`;
    setExpandedSections((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const toggleChallenge = (challengeId: string) => {
    setExpandedChallenges((prev) => ({
      ...prev,
      [challengeId]: prev[challengeId] === false ? true : false,
    }));
  };

  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      if (
        !showInactive &&
        (c.isActive === false || c.status === "Inactive" || c.status === "Discontinued")
      ) {
        return false;
      }
      if (statusFilter !== "All" && c.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [challenges, showInactive, statusFilter]);

  const filterItemsByActive = <T extends { status: CarePlanItemStatus; isActive?: boolean }>(
    items: T[]
  ) => {
    if (showInactive) return items;
    return items.filter(
      (item) =>
        item.isActive !== false && item.status !== "Inactive" && item.status !== "Discontinued"
    );
  };

  const handleUpdateChallengeStatus = (challengeId: string, nextStatus: CarePlanItemStatus) => {
    const updated = challenges.map((c) =>
      c.id === challengeId
        ? { ...c, status: nextStatus, isActive: nextStatus !== "Inactive" }
        : c
    );
    onUpdateChallenges(updated);
    toast.success(`Care domain status updated to ${nextStatus}`);
  };

  const handleUpdateItemStatus = (
    challengeId: string,
    section: SectionKey,
    itemId: string,
    nextStatus: CarePlanItemStatus
  ) => {
    const dateNow = todayFormatted();
    const updated = challenges.map((c) => {
      if (c.id !== challengeId) return c;
      return {
        ...c,
        [section]: c[section].map((item: any) =>
          item.id === itemId
            ? {
              ...item,
              status: nextStatus,
              effectiveDate: dateNow,
              isActive: nextStatus !== "Inactive",
            }
            : item
        ),
      };
    });
    onUpdateChallenges(updated);
    toast.success(`Status updated to ${nextStatus}`);
  };

  const handleAddChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChallengeTitle.trim()) return;
    const newId = `CHG-${Date.now()}`;
    const created: CarePlanChallenge = {
      id: newId,
      title: newChallengeTitle.trim(),
      status: newChallengeStatus,
      isActive: true,
      outcomes: [],
      goals: [],
      interventions: [],
      evaluations: [],
    };
    onUpdateChallenges([...challenges, created]);
    setExpandedChallenges((prev) => ({ ...prev, [newId]: true }));
    setNewChallengeTitle("");
    setNewChallengeStatus("In Progress");
    setIsAddChallengeOpen(false);
    toast.success("New Care Plan domain added.");
  };

  const handleQuickAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTarget || !quickAddDesc.trim()) return;
    const { challengeId, section } = quickAddTarget;
    const dateNow = todayFormatted();
    const itemId = `${section.slice(0, 3).toUpperCase()}-${Date.now()}`;

    const updated = challenges.map((c) => {
      if (c.id !== challengeId) return c;
      if (section === "outcomes") {
        return {
          ...c,
          outcomes: [
            ...c.outcomes,
            {
              id: itemId,
              description: quickAddDesc.trim(),
              status: quickAddStatus,
              effectiveDate: dateNow,
              isActive: true,
            },
          ],
        };
      }
      if (section === "goals") {
        return {
          ...c,
          goals: [
            ...c.goals,
            {
              id: itemId,
              description: quickAddDesc.trim(),
              currentProgress: quickAddProgress,
              baseline: quickAddBaseline,
              target: quickAddTargetLevel,
              targetDate: quickAddTargetDate,
              status: quickAddStatus,
              effectiveDate: dateNow,
              isActive: true,
            },
          ],
        };
      }
      if (section === "interventions") {
        return {
          ...c,
          interventions: [
            ...c.interventions,
            {
              id: itemId,
              description: quickAddDesc.trim(),
              frequency: quickAddFrequency,
              instructions: quickAddInstructions.trim() || "Follow standard care protocol.",
              status: quickAddStatus,
              effectiveDate: dateNow,
              isActive: true,
            },
          ],
        };
      }
      return {
        ...c,
        evaluations: [
          ...c.evaluations,
          {
            id: itemId,
            description: quickAddDesc.trim(),
            status: quickAddStatus,
            effectiveDate: dateNow,
            isActive: true,
          },
        ],
      };
    });

    onUpdateChallenges(updated);
    setQuickAddTarget(null);
    setQuickAddDesc("");
    setQuickAddInstructions("");
    toast.success(`Added new entry to ${section}.`);
  };

  return (
    <div className="space-y-4">
      {/* LiliSare Control Bar */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Clinical Care Domains & Milestones
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Structured outcomes, measurable goals, nursing interventions, and RN evaluations
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-[#3D6B22]" />
            <span>Progress History</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Show inactive toggle */}
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2">
            <span>Inactive</span>
            <button
              type="button"
              role="switch"
              aria-checked={showInactive}
              onClick={() => setShowInactive((v) => !v)}
              className={`relative inline-flex h-4.5 w-8 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer ${showInactive ? "bg-[#3D6B22]" : "bg-slate-300"
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition duration-200 ${showInactive ? "translate-x-3.5" : "translate-x-0"
                  }`}
              />
            </button>
          </label>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => setIsAddChallengeOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Domain</span>
            </button>
          )}
        </div>
      </div>

      {/* Domain Accordion Cards */}
      {filteredChallenges.length === 0 ? (
        <div className="bg-white rounded-xl lg:rounded-2xl p-8 border border-slate-200 text-center space-y-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <Target className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No Care Plan domains match this filter</p>
          <p className="text-xs text-slate-500">
            Adjust your status filter or add a new clinical care domain.
          </p>
        </div>
      ) : (
        filteredChallenges.map((challenge) => {
          const isOpen = expandedChallenges[challenge.id] !== false;
          const visibleOutcomes = filterItemsByActive(challenge.outcomes);
          const visibleGoals = filterItemsByActive(challenge.goals);
          const visibleInterventions = filterItemsByActive(challenge.interventions);
          const visibleEvaluations = filterItemsByActive(challenge.evaluations);

          return (
            <div
              key={challenge.id}
              className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all duration-200 overflow-hidden"
            >
              {/* Domain Header */}
              <div className="px-4 sm:px-5 py-4 bg-gradient-to-r from-slate-50/80 via-white to-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleChallenge(challenge.id)}
                  className="flex items-center gap-3 text-left cursor-pointer group min-w-0 flex-1"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center shrink-0">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors truncate">
                      {challenge.title}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>{visibleOutcomes.length} Outcomes</span>
                      <span className="text-slate-300">•</span>
                      <span>{visibleGoals.length} Goals</span>
                      <span className="text-slate-300">•</span>
                      <span>{visibleInterventions.length} Interventions</span>
                    </div>
                  </div>
                </button>

                <StatusSelectPill
                  value={challenge.status}
                  disabled={!canEdit}
                  onChange={(next) => handleUpdateChallengeStatus(challenge.id, next)}
                />
              </div>

              {/* Nested Clinical Sub-Sections */}
              {isOpen && (
                <div className="p-4 sm:p-5 space-y-4 bg-white">
                  {/* 1. OUTCOMES */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/30 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSection(challenge.id, "outcomes")}
                        className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        {isSectionExpanded(challenge.id, "outcomes") ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <Compass className="w-3.5 h-3.5 text-[#3D6B22]" />
                        <span>Clinical Outcomes</span>
                        <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] font-bold">
                          {visibleOutcomes.length}
                        </span>
                      </button>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            setQuickAddTarget({ challengeId: challenge.id, section: "outcomes" })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/15 border border-[#3D6B22]/20 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>

                    {isSectionExpanded(challenge.id, "outcomes") && (
                      <div className="divide-y divide-slate-100 bg-white">
                        {visibleOutcomes.length === 0 ? (
                          <div className="px-4 py-3 text-xs text-slate-400 italic">
                            No outcomes recorded yet.
                          </div>
                        ) : (
                          visibleOutcomes.map((item) => (
                            <div
                              key={item.id}
                              className="px-4 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-700 hover:bg-slate-50/50 transition-colors"
                            >
                              <p className="leading-relaxed flex-1 font-medium text-slate-800">
                                {item.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 shrink-0">
                                <StatusSelectPill
                                  value={item.status}
                                  disabled={!canEdit}
                                  onChange={(next) =>
                                    handleUpdateItemStatus(challenge.id, "outcomes", item.id, next)
                                  }
                                />
                                <span className="text-[11px] font-medium text-slate-500 inline-flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {item.effectiveDate}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2. GOALS */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/30 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSection(challenge.id, "goals")}
                        className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        {isSectionExpanded(challenge.id, "goals") ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <Target className="w-3.5 h-3.5 text-[#3D6B22]" />
                        <span>Measurable Goals</span>
                        <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] font-bold">
                          {visibleGoals.length}
                        </span>
                      </button>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            setQuickAddTarget({ challengeId: challenge.id, section: "goals" })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/15 border border-[#3D6B22]/20 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>

                    {isSectionExpanded(challenge.id, "goals") && (
                      <div className="divide-y divide-slate-100 bg-white">
                        {visibleGoals.length === 0 ? (
                          <div className="px-4 py-3 text-xs text-slate-400 italic">
                            No measurable goals recorded yet.
                          </div>
                        ) : (
                          visibleGoals.map((goal) => {
                            const pct =
                              goal.status === "Achieved" || goal.status === "Completed"
                                ? 100
                                : parseProgressPercent(goal.currentProgress);
                            return (
                              <div
                                key={goal.id}
                                className="p-4 space-y-3 hover:bg-slate-50/40 transition-colors"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                                  <p className="text-xs sm:text-[13px] leading-relaxed font-semibold text-slate-800 flex-1">
                                    {goal.description}
                                  </p>
                                  <div className="flex items-center gap-2.5 shrink-0">
                                    <StatusSelectPill
                                      value={goal.status}
                                      disabled={!canEdit}
                                      onChange={(next) =>
                                        handleUpdateItemStatus(
                                          challenge.id,
                                          "goals",
                                          goal.id,
                                          next
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                {/* Progress Bar & Benchmark Metrics */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center bg-slate-50/70 rounded-xl p-3 border border-slate-100">
                                  <div className="lg:col-span-5 space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-semibold text-slate-500">
                                        Current Progress
                                      </span>
                                      <span className="font-bold text-[#3D6B22]">
                                        {goal.currentProgress} ({pct}%)
                                      </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-[#3D6B22] rounded-full transition-all duration-500"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                                    <div>
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                                        Baseline
                                      </span>
                                      <span className="font-semibold text-slate-700">
                                        {goal.baseline}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                                        Target
                                      </span>
                                      <span className="font-bold text-slate-900">
                                        {goal.target}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                                        Target Date
                                      </span>
                                      <span className="font-medium text-slate-700">
                                        {goal.targetDate}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                                        Effective
                                      </span>
                                      <span className="font-medium text-slate-600">
                                        {goal.effectiveDate}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. INTERVENTIONS */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/30 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSection(challenge.id, "interventions")}
                        className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        {isSectionExpanded(challenge.id, "interventions") ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <ClipboardList className="w-3.5 h-3.5 text-[#3D6B22]" />
                        <span>Nursing & Caregiver Interventions</span>
                        <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] font-bold">
                          {visibleInterventions.length}
                        </span>
                      </button>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            setQuickAddTarget({
                              challengeId: challenge.id,
                              section: "interventions",
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/15 border border-[#3D6B22]/20 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>

                    {isSectionExpanded(challenge.id, "interventions") && (
                      <div className="divide-y divide-slate-100 bg-white">
                        {visibleInterventions.length === 0 ? (
                          <div className="px-4 py-3 text-xs text-slate-400 italic">
                            No interventions recorded yet.
                          </div>
                        ) : (
                          visibleInterventions.map((item) => (
                            <div
                              key={item.id}
                              className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs hover:bg-slate-50/40 transition-colors"
                            >
                              <div className="space-y-1 flex-1">
                                <p className="font-semibold text-slate-800 leading-relaxed">
                                  {item.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                                    {item.frequency}
                                  </span>
                                  <span>•</span>
                                  <span>{item.instructions}</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 shrink-0">
                                <StatusSelectPill
                                  value={item.status}
                                  disabled={!canEdit}
                                  onChange={(next) =>
                                    handleUpdateItemStatus(
                                      challenge.id,
                                      "interventions",
                                      item.id,
                                      next
                                    )
                                  }
                                />
                                <span className="text-[11px] font-medium text-slate-500 inline-flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {item.effectiveDate}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* 4. EVALUATION */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/30 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSection(challenge.id, "evaluations")}
                        className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        {isSectionExpanded(challenge.id, "evaluations") ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <FileText className="w-3.5 h-3.5 text-[#3D6B22]" />
                        <span>Clinical Evaluation</span>
                        <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] font-bold">
                          {visibleEvaluations.length}
                        </span>
                      </button>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            setQuickAddTarget({
                              challengeId: challenge.id,
                              section: "evaluations",
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/15 border border-[#3D6B22]/20 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>

                    {isSectionExpanded(challenge.id, "evaluations") && (
                      <div className="divide-y divide-slate-100 bg-white">
                        {visibleEvaluations.length === 0 ? (
                          <div className="px-4 py-3 text-xs text-slate-400 italic">
                            No clinical evaluations recorded yet.
                          </div>
                        ) : (
                          visibleEvaluations.map((ev) => (
                            <div
                              key={ev.id}
                              className="px-4 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-700 hover:bg-slate-50/40 transition-colors"
                            >
                              <p className="leading-relaxed flex-1 font-medium text-slate-800">
                                {ev.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 shrink-0">
                                <StatusSelectPill
                                  value={ev.status}
                                  disabled={!canEdit}
                                  onChange={(next) =>
                                    handleUpdateItemStatus(
                                      challenge.id,
                                      "evaluations",
                                      ev.id,
                                      next
                                    )
                                  }
                                />
                                <span className="text-[11px] font-medium text-slate-500 inline-flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {ev.effectiveDate}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Add Domain Modal */}
      <Modal
        isOpen={isAddChallengeOpen}
        onClose={() => setIsAddChallengeOpen(false)}
        title="Add Care Plan Domain"
        description="Define a new person-centered clinical domain for this Plan of Care"
        icon={<Sparkles className="w-5 h-5" />}
        maxWidth="lg"
      >
        <form onSubmit={handleAddChallenge} className="space-y-4">
          <div>
            <FormLabel required>Care Domain Title</FormLabel>
            <FormInput
              required
              value={newChallengeTitle}
              onChange={(e) => setNewChallengeTitle(e.target.value)}
              placeholder="e.g. Enhance Sensory Regulation & Community Transitions"
            />
          </div>
          <div>
            <FormLabel>Initial Status</FormLabel>
            <FormSelect
              value={newChallengeStatus}
              onChange={(e) => setNewChallengeStatus(e.target.value as CarePlanItemStatus)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </FormSelect>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <FormButtonCancel onClick={() => setIsAddChallengeOpen(false)} />
            <FormButtonPrimary type="submit">
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Domain</span>
            </FormButtonPrimary>
          </div>
        </form>
      </Modal>

      {/* Quick Add Item Modal */}
      <Modal
        isOpen={Boolean(quickAddTarget)}
        onClose={() => setQuickAddTarget(null)}
        title={`Add ${quickAddTarget?.section === "outcomes"
            ? "Clinical Outcome"
            : quickAddTarget?.section === "goals"
              ? "Measurable Goal"
              : quickAddTarget?.section === "interventions"
                ? "Nursing Intervention"
                : "Clinical Evaluation"
          }`}
        icon={<Target className="w-5 h-5" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleQuickAddItem} className="space-y-4">
          <div>
            <FormLabel required>Description</FormLabel>
            <FormTextarea
              required
              rows={3}
              value={quickAddDesc}
              onChange={(e) => setQuickAddDesc(e.target.value)}
              placeholder="Enter clear, measurable clinical statement..."
            />
          </div>

          {quickAddTarget?.section === "goals" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <FormLabel>Baseline</FormLabel>
                <FormInput
                  value={quickAddBaseline}
                  onChange={(e) => setQuickAddBaseline(e.target.value)}
                  placeholder="e.g. 2. Minimal"
                />
              </div>
              <div>
                <FormLabel>Target</FormLabel>
                <FormInput
                  value={quickAddTargetLevel}
                  onChange={(e) => setQuickAddTargetLevel(e.target.value)}
                  placeholder="e.g. 4. Supervised"
                />
              </div>
              <div>
                <FormLabel>Current Progress</FormLabel>
                <FormInput
                  value={quickAddProgress}
                  onChange={(e) => setQuickAddProgress(e.target.value)}
                  placeholder="e.g. 2.0 / 4"
                />
              </div>
              <div>
                <FormLabel>Target Date</FormLabel>
                <FormInput
                  type="date"
                  value={quickAddTargetDate}
                  onChange={(e) => setQuickAddTargetDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {quickAddTarget?.section === "interventions" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <FormLabel>Frequency</FormLabel>
                <FormInput
                  value={quickAddFrequency}
                  onChange={(e) => setQuickAddFrequency(e.target.value)}
                  placeholder="e.g. Daily (Mon–Fri)"
                />
              </div>
              <div>
                <FormLabel>Instructions</FormLabel>
                <FormInput
                  value={quickAddInstructions}
                  onChange={(e) => setQuickAddInstructions(e.target.value)}
                  placeholder="e.g. Use visual cue cards prior to task"
                />
              </div>
            </div>
          )}

          <div>
            <FormLabel>Initial Status</FormLabel>
            <FormSelect
              value={quickAddStatus}
              onChange={(e) => setQuickAddStatus(e.target.value as CarePlanItemStatus)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </FormSelect>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <FormButtonCancel onClick={() => setQuickAddTarget(null)} />
            <FormButtonPrimary type="submit">
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Entry</span>
            </FormButtonPrimary>
          </div>
        </form>
      </Modal>

      {/* Goals Progress History Modal */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Goals Progress History"
        description="Chronological audit of clinical goal baselines, targets, and status updates"
        icon={<History className="w-5 h-5" />}
        maxWidth="2xl"
      >
        <div className="space-y-3">
          {challenges.flatMap((c) =>
            c.goals.map((g) => (
              <div
                key={g.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-[#3D6B22] uppercase tracking-wider">
                    {c.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClasses(
                      g.status
                    )}`}
                  >
                    {g.status}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-800">{g.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span>
                    Baseline: <strong className="text-slate-700">{g.baseline}</strong>
                  </span>
                  <span>
                    Current: <strong className="text-[#3D6B22]">{g.currentProgress}</strong>
                  </span>
                  <span>
                    Target: <strong className="text-slate-700">{g.target}</strong>
                  </span>
                  <span>Effective: {g.effectiveDate}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
