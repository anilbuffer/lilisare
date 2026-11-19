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
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

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
    <div className="bg-[#FFFFFF] border border-[#D5DFDA] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#D5DFDA]/60">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#111C16] tracking-tight">
              Follow-up & Tasks
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#9A5B00] border border-[#FDE68A]">
              {tasks.filter((t) => t.isOverdue).length} Overdue
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-[#3D6B22] hover:text-[#2C5217] transition-colors cursor-pointer"
          >
            {showAll ? "Show Less" : `View All (${tasks.length})`}
          </button>
        </div>

        {/* Task List */}
        <div className="mt-3 space-y-2.5">
          {displayedTasks.map((task) => {
            const Icon = CATEGORY_ICONS[task.category] || Clock;

            return (
              <div
                key={task.id}
                className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                  task.isOverdue
                    ? "bg-[#FEF2F2]/60 border-[#FECACA] hover:border-[#FF6E61]"
                    : "bg-[#F7F9F8] border-[#D5DFDA] hover:border-[#93C573]"
                }`}
              >
                {/* Left: Icon & Info */}
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                      task.isOverdue
                        ? "bg-[#FEE2E2] text-[#B91C1C]"
                        : "bg-[#E3F1D9] text-[#1E5622]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onSelectInquiryById(task.inquiryId)}
                      className="font-bold text-[#111C16] hover:text-[#3D6B22] text-left truncate block cursor-pointer transition-colors"
                    >
                      {task.title}
                    </button>
                    <div className="flex items-center gap-2 text-[11px] text-[#4A5D52] mt-0.5">
                      <span>Assigned: <strong className="text-[#111C16]">{task.assignedCoordinator}</strong></span>
                      <span>•</span>
                      <span className={task.isOverdue ? "text-[#B91C1C] font-semibold" : "text-[#4A5D52]"}>
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action CTA */}
                <button
                  type="button"
                  onClick={() => onTaskAction(task)}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                    task.isOverdue
                      ? "bg-[#D93829] hover:bg-[#B91C1C] text-white shadow-xs"
                      : "bg-[#FFFFFF] hover:bg-[#F2F8EE] text-[#111C16] hover:text-[#3D6B22] border border-[#D5DFDA]"
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

      <div className="mt-3 pt-2 text-[11px] text-[#74877C] flex items-center justify-between">
        <span>Prioritized by intake response SLAs</span>
        <span className="font-medium text-[#4A5D52]">Target first response &lt; 2 hrs</span>
      </div>
    </div>
  );
}
