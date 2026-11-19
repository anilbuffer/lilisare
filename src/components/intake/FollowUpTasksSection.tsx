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
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm leading-tight">
              Follow-up & Tasks
            </h3>
            {tasks.filter((t) => t.isOverdue).length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {tasks.filter((t) => t.isOverdue).length} Overdue
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-[#3D6B22] hover:text-[#1B3414] transition-colors cursor-pointer"
          >
            {showAll ? "Show Less" : `View All (${tasks.length})`}
          </button>
        </div>

        {/* Clean Task List */}
        <div className="mt-3 space-y-2">
          {displayedTasks.map((task) => {
            const Icon = CATEGORY_ICONS[task.category] || Clock;

            return (
              <div
                key={task.id}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${
                  task.isOverdue
                    ? "bg-rose-50/30 border-rose-200/80 hover:border-rose-300"
                    : "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
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
                      className="font-bold text-slate-900 hover:text-[#3D6B22] text-left truncate block cursor-pointer transition-colors leading-tight"
                    >
                      {task.title.replace(/Â·/g, "·")}
                    </button>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                      <span className={task.isOverdue ? "text-rose-600 font-semibold" : ""}>
                        {task.dueDate}
                      </span>
                      <span>·</span>
                      <span className="truncate">{task.assignedCoordinator}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onTaskAction(task)}
                  className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-all ${
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
    </div>
  );
}
