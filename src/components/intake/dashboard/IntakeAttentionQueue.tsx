"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  X,
  Check,
  ArrowUpDown,
  ChevronDown,
  PhoneCall,
  UserCheck,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { InquiryRecord } from "@/types/intake";

export type TaskTimeline = "Overdue" | "Today" | "Tomorrow";
export type SortOption = "priority" | "stage" | "title" | "default";

export interface IntakeTaskItem {
  id: string;
  title: string;
  timeline: TaskTimeline;
  stage: "Intake" | "Caregiver" | "Authorizations" | "Clinical" | "Compliance";
  assignee: string;
  dueText: string;
  isUrgent?: boolean;
  completed: boolean;
  inquiry?: InquiryRecord;
}

const STAGE_ORDER: Record<IntakeTaskItem["stage"], number> = {
  Intake: 1,
  Caregiver: 2,
  Authorizations: 3,
  Clinical: 4,
  Compliance: 5,
};

interface IntakeAttentionQueueProps {
  inquiries: InquiryRecord[];
  onContact: (inquiry: InquiryRecord) => void;
  onSchedule: (inquiry: InquiryRecord) => void;
  onConvert: (inquiry: InquiryRecord) => void;
}

export function IntakeAttentionQueue({
  inquiries,
  onContact,
  onSchedule,
  onConvert,
}: IntakeAttentionQueueProps) {
  // Base initial tasks derived from real intake inquiries and coordinator action items
  const [tasks, setTasks] = useState<IntakeTaskItem[]>([]);
  const [filterUser, setFilterUser] = useState<"all" | "my">("all");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dropdown outside click handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSortOpen]);

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

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newTimeline, setNewTimeline] = useState<TaskTimeline>("Today");
  const [newStage, setNewStage] = useState<IntakeTaskItem["stage"]>("Intake");
  const [newAssignee, setNewAssignee] = useState("Sarah (You)");
  const [newDueText, setNewDueText] = useState("");
  const [newIsUrgent, setNewIsUrgent] = useState(false);

  // Sync tasks from inquiries on change
  useEffect(() => {
    const generated: IntakeTaskItem[] = [];

    // Overdue: Hospital discharges and urgent triage referrals
    const urgentInquiries = inquiries.filter(
      (i) => i.source === "Hospital Discharge" || i.urgency === "Immediate" || i.urgency === "Urgent"
    );
    urgentInquiries.forEach((inq, idx) => {
      generated.push({
        id: `inq-overdue-${inq.id}`,
        title: `Rapid SLA Triage: ${inq.familyName} (${inq.familyInfo.clientInfo.name})`,
        timeline: idx === 0 ? "Overdue" : "Today",
        stage: "Intake",
        assignee: "Sarah (You)",
        dueText: inq.source === "Hospital Discharge" ? "Hospital Discharge · 15m SLA" : `${inq.urgency} Referral · ${inq.id}`,
        isUrgent: true,
        completed: inq.stage === "Converted",
        inquiry: inq,
      });
    });

    // Today: New inquiries awaiting first contact
    const newLeads = inquiries.filter((i) => i.stage === "New Inquiry" || i.stage === "New Lead");
    newLeads.forEach((inq, idx) => {
      if (!generated.some((g) => g.inquiry?.id === inq.id)) {
        generated.push({
          id: `inq-today-${inq.id}`,
          title: `Initial Phone Contact: ${inq.familyInfo.primaryContact}`,
          timeline: "Today",
          stage: "Intake",
          assignee: idx % 2 === 0 ? "Sarah (You)" : "Sue H.",
          dueText: `${inq.familyName} · ${inq.familyInfo.phone}`,
          isUrgent: false,
          completed: false,
          inquiry: inq,
        });
      }
    });

    // Today & Tomorrow: Clinical Assessments and Auth followups
    const needsDiscussion = inquiries.filter(
      (i) => i.stage === "Needs Discussion" || i.assessmentStatus === "Scheduled"
    );
    needsDiscussion.forEach((inq, idx) => {
      if (!generated.some((g) => g.inquiry?.id === inq.id)) {
        generated.push({
          id: `inq-assess-${inq.id}`,
          title: inq.assessmentStatus === "Scheduled"
            ? `Confirm RN Clinical Assessment: ${inq.familyInfo.clientInfo.name}`
            : `Book In-Home Clinical RN Assessment: ${inq.familyInfo.clientInfo.name}`,
          timeline: idx === 0 ? "Today" : "Tomorrow",
          stage: "Clinical",
          assignee: inq.assessmentDetails?.assessor || "Marcus Chen, RN",
          dueText: `${inq.assessmentDetails?.scheduledDate || "Tomorrow"} · ${inq.assessmentDetails?.assessor || "Marcus Chen, RN"}`,
          isUrgent: inq.urgency === "Urgent",
          completed: false,
          inquiry: inq,
        });
      }
    });

    // Cross-department operational triage tasks so the intake queue reflects full agency collaboration
    generated.push(
      {
        id: "task-auth-sample",
        title: "Follow up with DHS Case Manager on waiver authorization",
        timeline: "Overdue",
        stage: "Authorizations",
        assignee: "Dana J.",
        dueText: "Household #108 · Pending 5d",
        isUrgent: true,
        completed: false,
      },
      {
        id: "task-cg-sample",
        title: "Verify family caregiver background screening clearance",
        timeline: "Today",
        stage: "Caregiver",
        assignee: "Sue H.",
        dueText: "Linked to Household Miller",
        isUrgent: false,
        completed: false,
      },
      {
        id: "task-comp-sample",
        title: "Submit Medicaid intake packet for pediatric referral",
        timeline: "Tomorrow",
        stage: "Compliance",
        assignee: "Sarah (You)",
        dueText: "Child health services",
        isUrgent: false,
        completed: false,
      }
    );

    setTasks(generated);
  }, [inquiries]);

  const handleToggleTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: IntakeTaskItem = {
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

  const getStageBadge = (stage: IntakeTaskItem["stage"]) => {
    switch (stage) {
      case "Intake":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/60";
      case "Caregiver":
        return "bg-purple-50 text-purple-700 border-purple-200/60";
      case "Authorizations":
        return "bg-amber-50 text-amber-800 border-amber-200/60";
      case "Clinical":
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
    title: "Task Name (A-Z)",
    default: "Default",
  };

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

  const sortTaskList = (list: IntakeTaskItem[]) => {
    return [...list].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (sortBy === "priority") {
        if (Boolean(a.isUrgent) !== Boolean(b.isUrgent)) {
          return a.isUrgent ? -1 : 1;
        }
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "stage") {
        const stageDiff = (STAGE_ORDER[a.stage] || 99) - (STAGE_ORDER[b.stage] || 99);
        if (stageDiff !== 0) return stageDiff;
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (Boolean(a.isUrgent) !== Boolean(b.isUrgent)) {
        return a.isUrgent ? -1 : 1;
      }
      return 0;
    });
  };

  const overdueList = sortTaskList(filteredTasks.filter((t) => t.timeline === "Overdue"));
  const todayList = sortTaskList(filteredTasks.filter((t) => t.timeline === "Today"));
  const tomorrowList = sortTaskList(filteredTasks.filter((t) => t.timeline === "Tomorrow"));

  return (
    <Card className="relative bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Header Bar (Identical to Agency Admin Dashboard Task Card UI) */}
      <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Needs Your Attention
        </h3>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter: All vs My Tasks */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterUser("all")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${filterUser === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterUser("my")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${filterUser === "my"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              My Tasks
            </button>
          </div>

          {/* Sort Dropdown Menu */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
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
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      sortBy === opt.key
                        ? "bg-[#3D6B22]/10 text-[#3D6B22] font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
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
            href="/intake/pipeline"
            className="text-xs font-semibold text-[#3D6B22] hover:text-[#274C1D] flex items-center gap-1 transition-colors pl-1"
          >
            All <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3-Column Horizontal Grid (Overdue • Today • Tomorrow) */}
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
                  {filterUser === "my" ? "No overdue tasks assigned to you." : "No overdue tasks."}
                </div>
              ) : (
                overdueList.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 bg-white border border-slate-200/90 rounded-xl transition-all hover:border-slate-300 hover:shadow-xs flex items-start gap-2.5 ${task.completed ? "opacity-50 bg-slate-50" : ""
                      }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleToggleTask(task.id, e)}
                      className="mt-0.5 text-slate-300 hover:text-[#3D6B22] shrink-0 cursor-pointer"
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
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mt-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
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
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 shrink-0 ml-auto bg-slate-100 px-1.5 py-0.5 rounded-md">
                          <User className="w-2.5 h-2.5 text-slate-400" />
                          <span>{task.assignee}</span>
                        </span>
                      </div>

                      {/* Quick 1-click action buttons if linked to inquiry */}
                      {task.inquiry && !task.completed && (
                        <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => onContact(task.inquiry!)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 hover:text-[#3D6B22] bg-slate-100 hover:bg-[#F2F8EE] px-2 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            <PhoneCall className="w-3 h-3 text-[#3D6B22]" />
                            <span>Contact</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSchedule(task.inquiry!)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            <Calendar className="w-3 h-3 text-sky-600" />
                            <span>Assess</span>
                          </button>
                          {task.inquiry.stage !== "Converted" && (
                            <button
                              type="button"
                              onClick={() => onConvert(task.inquiry!)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#1B3414] hover:bg-[#274C1D] px-2 py-1 rounded-md transition-colors cursor-pointer ml-auto"
                            >
                              <UserCheck className="w-3 h-3 text-[#93C573]" />
                              <span>Convert</span>
                            </button>
                          )}
                        </div>
                      )}
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
                  {filterUser === "my" ? "No tasks for today assigned to you." : "No tasks for today."}
                </div>
              ) : (
                todayList.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 bg-white border border-slate-200/90 rounded-xl transition-all hover:border-slate-300 hover:shadow-xs flex items-start gap-2.5 ${task.completed ? "opacity-50 bg-slate-50" : ""
                      }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleToggleTask(task.id, e)}
                      className="mt-0.5 text-slate-300 hover:text-[#3D6B22] shrink-0 cursor-pointer"
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
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mt-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
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
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 shrink-0 ml-auto bg-slate-100 px-1.5 py-0.5 rounded-md">
                          <User className="w-2.5 h-2.5 text-slate-400" />
                          <span>{task.assignee}</span>
                        </span>
                      </div>

                      {/* Quick 1-click action buttons if linked to inquiry */}
                      {task.inquiry && !task.completed && (
                        <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => onContact(task.inquiry!)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 hover:text-[#3D6B22] bg-slate-100 hover:bg-[#F2F8EE] px-2 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            <PhoneCall className="w-3 h-3 text-[#3D6B22]" />
                            <span>Contact</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSchedule(task.inquiry!)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            <Calendar className="w-3 h-3 text-sky-600" />
                            <span>Assess</span>
                          </button>
                          {task.inquiry.stage !== "Converted" && (
                            <button
                              type="button"
                              onClick={() => onConvert(task.inquiry!)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#1B3414] hover:bg-[#274C1D] px-2 py-1 rounded-md transition-colors cursor-pointer ml-auto"
                            >
                              <UserCheck className="w-3 h-3 text-[#93C573]" />
                              <span>Convert</span>
                            </button>
                          )}
                        </div>
                      )}
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
                  {filterUser === "my" ? "No tasks for tomorrow assigned to you." : "No tasks for tomorrow."}
                </div>
              ) : (
                tomorrowList.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 bg-white border border-slate-200/90 rounded-xl transition-all hover:border-slate-300 hover:shadow-xs flex items-start gap-2.5 ${task.completed ? "opacity-50 bg-slate-50" : ""
                      }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleToggleTask(task.id, e)}
                      className="mt-0.5 text-slate-300 hover:text-[#3D6B22] shrink-0 cursor-pointer"
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
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mt-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
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
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 shrink-0 ml-auto bg-slate-100 px-1.5 py-0.5 rounded-md">
                          <User className="w-2.5 h-2.5 text-slate-400" />
                          <span>{task.assignee}</span>
                        </span>
                      </div>

                      {/* Quick 1-click action buttons if linked to inquiry */}
                      {task.inquiry && !task.completed && (
                        <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => onContact(task.inquiry!)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 hover:text-[#3D6B22] bg-slate-100 hover:bg-[#F2F8EE] px-2 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            <PhoneCall className="w-3 h-3 text-[#3D6B22]" />
                            <span>Contact</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSchedule(task.inquiry!)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            <Calendar className="w-3 h-3 text-sky-600" />
                            <span>Assess</span>
                          </button>
                          {task.inquiry.stage !== "Converted" && (
                            <button
                              type="button"
                              onClick={() => onConvert(task.inquiry!)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#1B3414] hover:bg-[#274C1D] px-2 py-1 rounded-md transition-colors cursor-pointer ml-auto"
                            >
                              <UserCheck className="w-3 h-3 text-[#93C573]" />
                              <span>Convert</span>
                            </button>
                          )}
                        </div>
                      )}
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
            className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-[20px] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col my-auto max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base tracking-tight leading-tight">Add Intake Priority Task</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Create an intake SLA or outreach follow-up item</p>
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
                  placeholder="e.g. Call hospital discharge planner for PT-101"
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
                    Assignee
                  </label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
                  >
                    <option value="Sarah (You)">Sarah (You)</option>
                    <option value="Marcus Chen, RN">Marcus Chen, RN</option>
                    <option value="Dana J.">Dana J. (Authorizations)</option>
                    <option value="Sue H.">Sue H. (Compliance)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    LiliSare Stage
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as IntakeTaskItem["stage"])}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
                  >
                    <option value="Intake">Intake</option>
                    <option value="Caregiver">Caregiver</option>
                    <option value="Authorizations">Authorizations</option>
                    <option value="Clinical">Clinical</option>
                    <option value="Compliance">Compliance</option>
                  </select>
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
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="intakeUrgentCheck"
                  checked={newIsUrgent}
                  onChange={(e) => setNewIsUrgent(e.target.checked)}
                  className="rounded text-[#3D6B22] focus:ring-[#3D6B22] accent-[#3D6B22] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="intakeUrgentCheck" className="text-slate-700 font-medium text-xs cursor-pointer select-none">
                  Mark as High Priority / Urgent SLA
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
