"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Plus,
  ExternalLink,
  Calendar,
  AlertCircle,
  Clock,
  User,
  X,
  Check,
  ArrowUpDown,
  ChevronDown,
  Flame,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

export type TaskTimeline = "Overdue" | "Today" | "Tomorrow";
export type SortOption = "priority" | "stage" | "title" | "default";

export interface LiliTask {
  id: string;
  title: string;
  timeline: TaskTimeline;
  stage: "Intake" | "Caregiver" | "Authorizations" | "EVV Dispatch" | "Care Notes" | "Compliance";
  assignee: string;
  dueText: string;
  isUrgent?: boolean;
  completed: boolean;
}

const INITIAL_TASKS: LiliTask[] = [
  // 1. Overdue
  {
    id: "task-1",
    title: "Push Case Manager authorization approval",
    timeline: "Overdue",
    stage: "Authorizations",
    assignee: "Dana J.",
    dueText: "2d overdue · Client PT-101",
    isUrgent: true,
    completed: false,
  },
  {
    id: "task-2",
    title: "Verify missing EVV clock-out location",
    timeline: "Overdue",
    stage: "EVV Dispatch",
    assignee: "Adam S.",
    dueText: "Shift #4088 · Geofence exception",
    isUrgent: true,
    completed: false,
  },

  // 2. Today
  {
    id: "task-3",
    title: "Review & sign 12 clinical shift care notes",
    timeline: "Today",
    stage: "Care Notes",
    assignee: "Sarah (RN)",
    dueText: "Due by 5:00 PM · AI wording ready",
    isUrgent: true,
    completed: false,
  },
  {
    id: "task-4",
    title: "Complete phone intake for Sterling family",
    timeline: "Today",
    stage: "Intake",
    assignee: "Intake Desk",
    dueText: "Household #108 · Pediatric waiver",
    completed: false,
  },
  {
    id: "task-5",
    title: "Adjudicate flagged background screening",
    timeline: "Today",
    stage: "Compliance",
    assignee: "Compliance Officer",
    dueText: "Caregiver CG-104 renewal",
    isUrgent: true,
    completed: false,
  },

  // 3. Tomorrow
  {
    id: "task-6",
    title: "Confirm recurring schedule for Household Chen",
    timeline: "Tomorrow",
    stage: "EVV Dispatch",
    assignee: "Adam S.",
    dueText: "Next week 40 hrs authorization",
    completed: false,
  },
  {
    id: "task-7",
    title: "Send onboarding packet to Mother Sarah",
    timeline: "Tomorrow",
    stage: "Caregiver",
    assignee: "Sue H.",
    dueText: "Household #104 · Linked relationship",
    isUrgent: true,
    completed: false,
  },
];

const STAGE_ORDER: Record<LiliTask["stage"], number> = {
  Intake: 1,
  Caregiver: 2,
  Authorizations: 3,
  "EVV Dispatch": 4,
  "Care Notes": 5,
  Compliance: 6,
};

export function NeedsYourAttentionCard() {
  const [tasks, setTasks] = useState<LiliTask[]>(INITIAL_TASKS);
  const [filterUser, setFilterUser] = useState<"all" | "my">("all");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key to provide a rock-solid full page overlay without fluctuation
  useEffect(() => {
    if (!isAddModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAddModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isAddModalOpen]);

  // New task form
  const [newTitle, setNewTitle] = useState("");
  const [newTimeline, setNewTimeline] = useState<TaskTimeline>("Today");
  const [newStage, setNewStage] = useState<LiliTask["stage"]>("Intake");
  const [newAssignee, setNewAssignee] = useState("Sarah (You)");
  const [newDueText, setNewDueText] = useState("");
  const [newIsUrgent, setNewIsUrgent] = useState(false);

  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (filterUser === "my") {
      list = list.filter(
        (t) =>
          t.assignee.toLowerCase().includes("sarah") ||
          t.assignee.toLowerCase().includes("you")
      );
    }
    return list;
  }, [tasks, filterUser]);

  // Sorter helper
  const sortTaskList = (list: LiliTask[]) => {
    return [...list].sort((a, b) => {
      // Completed items always sink to the bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      if (sortBy === "priority") {
        if (Boolean(a.isUrgent) !== Boolean(b.isUrgent)) {
          return a.isUrgent ? -1 : 1;
        }
        return 0;
      }

      if (sortBy === "stage") {
        return STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage];
      }

      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }

      return 0; // default order
    });
  };

  const overdueList = sortTaskList(filteredTasks.filter((t) => t.timeline === "Overdue"));
  const todayList = sortTaskList(filteredTasks.filter((t) => t.timeline === "Today"));
  const tomorrowList = sortTaskList(filteredTasks.filter((t) => t.timeline === "Tomorrow"));

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: LiliTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      timeline: newTimeline,
      stage: newStage,
      assignee: newAssignee,
      dueText: newDueText.trim() || `${newStage} Task`,
      isUrgent: newIsUrgent,
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setNewTitle("");
    setNewDueText("");
    setNewIsUrgent(false);
    setIsAddModalOpen(false);
  };

  const getStageBadge = (stage: LiliTask["stage"]) => {
    switch (stage) {
      case "Intake":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/60";
      case "Caregiver":
        return "bg-purple-50 text-purple-700 border-purple-200/60";
      case "Authorizations":
        return "bg-amber-50 text-amber-800 border-amber-200/60";
      case "EVV Dispatch":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "Care Notes":
        return "bg-teal-50 text-teal-800 border-teal-200/60";
      case "Compliance":
        return "bg-rose-50 text-rose-700 border-rose-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const sortLabels: Record<SortOption, string> = {
    priority: "Urgent First",
    stage: "LiliSare Stage",
    title: "Name (A-Z)",
    default: "Default",
  };

  return (
    <Card className="relative bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Tasks
        </h3>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Filter: All vs My Tasks */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterUser("all")}
              className={`px-3 py-1 rounded-lg transition-all ${filterUser === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterUser("my")}
              className={`px-3 py-1 rounded-lg transition-all ${filterUser === "my"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              My Tasks
            </button>
          </div>

          {/* Sort Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              title="Change sort order across Overdue, Today and Tomorrow"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline text-slate-400 font-normal">Sort:</span>
              <span className="text-slate-900 font-semibold">{sortLabels[sortBy]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Sort Lists By
                </div>
                {[
                  { key: "priority", label: "Urgent First" },
                  { key: "stage", label: "LiliSare Stage" },
                  { key: "title", label: "Task Name (A-Z)" },
                  { key: "default", label: "Default" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.key as SortOption);
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.key && <Check className="w-3.5 h-3.5 text-[#3D6B22]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Task Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#93C573]" />
            <span>Add</span>
          </button>

          <Link
            href="/clinical/visit-notes"
            className="text-xs font-semibold text-[#3D6B22] hover:text-[#274C1D] flex items-center gap-1 transition-colors pl-1"
          >
            All <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3-Column Horizontal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/40">

        {/* Column 1: Overdue */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Overdue
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                {overdueList.filter((t) => !t.completed).length}
              </span>
            </div>

            <div className="space-y-2.5">
              {overdueList.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  No overdue tasks.
                </div>
              ) : (
                overdueList.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-3 bg-white border border-slate-200/90 rounded-xl transition-all hover:border-slate-300 hover:shadow-xs cursor-pointer flex items-start gap-2.5 ${task.completed ? "opacity-50 bg-slate-50" : ""
                      }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-slate-300 hover:text-[#3D6B22] shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#3D6B22]" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <div
                          className={`text-xs font-semibold text-slate-900 leading-snug ${task.completed ? "line-through text-slate-400" : ""
                            }`}
                        >
                          {task.title}
                        </div>
                        {task.isUrgent && !task.completed && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700 shrink-0">
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getStageBadge(
                            task.stage
                          )} shrink-0`}
                        >
                          {task.stage}
                        </span>
                        <span className="text-[11px] text-rose-600 font-medium truncate">
                          {task.dueText}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Today */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3D6B22]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Today
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F2E4] text-[#1E5622] border border-[#93C573]/30">
                {todayList.filter((t) => !t.completed).length}
              </span>
            </div>

            <div className="space-y-2.5">
              {todayList.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  No tasks for today.
                </div>
              ) : (
                todayList.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-3 bg-white border border-slate-200/90 rounded-xl transition-all hover:border-slate-300 hover:shadow-xs cursor-pointer flex items-start gap-2.5 ${task.completed ? "opacity-50 bg-slate-50" : ""
                      }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-slate-300 hover:text-[#3D6B22] shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#3D6B22]" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <div
                          className={`text-xs font-semibold text-slate-900 leading-snug ${task.completed ? "line-through text-slate-400" : ""
                            }`}
                        >
                          {task.title}
                        </div>
                        {task.isUrgent && !task.completed && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getStageBadge(
                            task.stage
                          )} shrink-0`}
                        >
                          {task.stage}
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal truncate">
                          {task.dueText}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Tomorrow */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Tomorrow
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
                {tomorrowList.filter((t) => !t.completed).length}
              </span>
            </div>

            <div className="space-y-2.5">
              {tomorrowList.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  No tasks for tomorrow.
                </div>
              ) : (
                tomorrowList.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-3 bg-white border border-slate-200/90 rounded-xl transition-all hover:border-slate-300 hover:shadow-xs cursor-pointer flex items-start gap-2.5 ${task.completed ? "opacity-50 bg-slate-50" : ""
                      }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-slate-300 hover:text-[#3D6B22] shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#3D6B22]" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <div
                          className={`text-xs font-semibold text-slate-900 leading-snug ${task.completed ? "line-through text-slate-400" : ""
                            }`}
                        >
                          {task.title}
                        </div>
                        {task.isUrgent && !task.completed && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getStageBadge(
                            task.stage
                          )} shrink-0`}
                        >
                          {task.stage}
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal truncate">
                          {task.dueText}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Add Task Modal (Full Page Overlay Portaled to document.body) */}
      {mounted && isAddModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-[20px] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col my-auto max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base tracking-tight leading-tight">Add New Action Item</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Create a priority task for agency operations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 sm:p-6 space-y-4 text-xs bg-white flex-1 overflow-y-auto custom-scrollbar">
              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Call case manager for authorization renewal"
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Timeline
                  </label>
                  <select
                    value={newTimeline}
                    onChange={(e) => setNewTimeline(e.target.value as TaskTimeline)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
                  >
                    <option value="Overdue">Overdue</option>
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                  </select>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    LiliSare Stage
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as LiliTask["stage"])}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
                  >
                    <option value="Intake">Intake</option>
                    <option value="Caregiver">Caregiver</option>
                    <option value="Authorizations">Authorizations</option>
                    <option value="EVV Dispatch">EVV Dispatch</option>
                    <option value="Care Notes">Care Notes</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Reference / Due Context
                </label>
                <input
                  type="text"
                  value={newDueText}
                  onChange={(e) => setNewDueText(e.target.value)}
                  placeholder="e.g. Household #108 · Urgent SLA"
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgentCheck"
                  checked={newIsUrgent}
                  onChange={(e) => setNewIsUrgent(e.target.checked)}
                  className="rounded text-[#3D6B22] focus:ring-[#3D6B22] accent-[#3D6B22] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="urgentCheck" className="text-slate-700 font-medium text-xs cursor-pointer select-none">
                  Mark as High Priority / Urgent
                </label>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </Card>
  );
}
