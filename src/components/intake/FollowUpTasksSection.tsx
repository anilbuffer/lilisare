"use client";

import React, { useState } from "react";
import { FollowUpTask } from "@/types/intake";
import {
  Clock,
  Phone,
  FileWarning,
  Calendar,
  Building2,
  AlertTriangle,
  ArrowRight,
  ListTodo,
} from "lucide-react";

interface FollowUpTasksSectionProps {
  tasks: FollowUpTask[];
  onTaskAction: (task: FollowUpTask) => void;
  onSelectInquiryById: (inquiryId: string) => void;
}

const CATEGORY_ICONS: Record<FollowUpTask["category"], React.ElementType> = {
  "First Contact": Phone,
  "Awaiting Response": Clock,
  "Missing Docs": FileWarning,
  "Scheduling": Calendar,
  "Case Manager": Building2,
};

export function FollowUpTasksSection({
  tasks,
  onTaskAction,
  onSelectInquiryById,
}: FollowUpTasksSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedTasks = showAll ? tasks : tasks.slice(0, 4);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-50 text-amber-800 rounded-xl shrink-0">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm leading-tight">
                  Follow-up & Tasks
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {tasks.filter((t) => t.isOverdue).length} Overdue
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target first contact response &lt; 2 hrs
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-[#3D6B22] hover:text-[#1B3414] transition-colors cursor-pointer"
          >
            {showAll ? "Show Less" : `View All (${tasks.length})`}
          </button>
        </div>

        {/* Task List */}
        <div className="mt-3 space-y-2">
          {displayedTasks.map((task) => {
            const Icon = CATEGORY_ICONS[task.category] || Clock;

            return (
              <div
                key={task.id}
                className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                  task.isOverdue
                    ? "bg-rose-50/40 border-rose-200/80 hover:border-rose-300"
                    : "bg-slate-50 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-2xs"
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                      task.isOverdue
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-[#1E5622]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onSelectInquiryById(task.inquiryId)}
                      className="font-bold text-slate-900 hover:text-[#3D6B22] text-left truncate block cursor-pointer transition-colors"
                    >
                      {task.title}
                    </button>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>Assigned: <strong className="text-slate-800 font-semibold">{task.assignedCoordinator}</strong></span>
                      <span>•</span>
                      <span className={task.isOverdue ? "text-rose-700 font-semibold" : "text-slate-500"}>
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onTaskAction(task)}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                    task.isOverdue
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
                      : "bg-white hover:bg-emerald-50 text-slate-800 hover:text-[#3D6B22] border border-slate-200 shadow-2xs"
                  }`}
                >
                  <span>{task.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Prioritized by intake response SLAs</span>
        <span className="font-medium text-slate-500">Live Queue</span>
      </div>
    </div>
  );
}
