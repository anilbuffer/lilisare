import { VisitStatus } from "@/types/scheduling";

export interface StatusStyleConfig {
  label: VisitStatus;
  /** Pill inside the 7-day shift matrix */
  pillBg: string;
  pillBorder: string;
  pillText: string;
  pillHover: string;
  /** Legend badge styling */
  legendActiveBg: string;
  legendActiveText: string;
  legendActiveBorder: string;
  legendCountBg: string;
  /** Hover card accent */
  hoverHeaderBg: string;
  dotColor: string;
  /** Badge in drawers and detail pages */
  badgeClass: string;
}

export const VISIT_STATUS_PALETTE: Record<VisitStatus, StatusStyleConfig> = {
  Unassigned: {
    label: "Unassigned",
    pillBg: "bg-[#D93829]",
    pillBorder: "border-[#B91C1C]",
    pillText: "text-white",
    pillHover: "hover:bg-[#B91C1C]",
    legendActiveBg: "bg-[#D93829]",
    legendActiveText: "text-white",
    legendActiveBorder: "border-[#B91C1C]",
    legendCountBg: "bg-black/20 text-white",
    hoverHeaderBg: "bg-[#B91C1C]",
    dotColor: "bg-[#D93829]",
    badgeClass: "bg-rose-50 text-[#B91C1C] border-rose-200",
  },
  Scheduled: {
    label: "Scheduled",
    pillBg: "bg-sky-100",
    pillBorder: "border-sky-300",
    pillText: "text-sky-900",
    pillHover: "hover:bg-sky-200/80",
    legendActiveBg: "bg-sky-600",
    legendActiveText: "text-white",
    legendActiveBorder: "border-sky-700",
    legendCountBg: "bg-black/15 text-white",
    hoverHeaderBg: "bg-sky-700",
    dotColor: "bg-sky-500",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
  },
  Verified: {
    label: "Verified",
    pillBg: "bg-[#E3F1D9]",
    pillBorder: "border-[#93C573]",
    pillText: "text-[#1E5622]",
    pillHover: "hover:bg-[#D4EBC4]",
    legendActiveBg: "bg-[#62963B]",
    legendActiveText: "text-white",
    legendActiveBorder: "border-[#3D6B22]",
    legendCountBg: "bg-black/15 text-white",
    hoverHeaderBg: "bg-[#3D6B22]",
    dotColor: "bg-[#62963B]",
    badgeClass: "bg-[#E3F1D9] text-[#1E5622] border-[#93C573]",
  },
  "In-Progress": {
    label: "In-Progress",
    pillBg: "bg-indigo-100",
    pillBorder: "border-indigo-300",
    pillText: "text-indigo-900",
    pillHover: "hover:bg-indigo-200/80",
    legendActiveBg: "bg-indigo-600",
    legendActiveText: "text-white",
    legendActiveBorder: "border-indigo-700",
    legendCountBg: "bg-black/15 text-white",
    hoverHeaderBg: "bg-indigo-700",
    dotColor: "bg-indigo-500",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  Completed: {
    label: "Completed",
    pillBg: "bg-[#3D6B22]",
    pillBorder: "border-[#2C5217]",
    pillText: "text-white",
    pillHover: "hover:bg-[#2C5217]",
    legendActiveBg: "bg-[#3D6B22]",
    legendActiveText: "text-white",
    legendActiveBorder: "border-[#2C5217]",
    legendCountBg: "bg-black/20 text-white",
    hoverHeaderBg: "bg-[#2C5217]",
    dotColor: "bg-[#3D6B22]",
    badgeClass: "bg-emerald-50 text-[#1E5622] border-emerald-200",
  },
  Missed: {
    label: "Missed",
    pillBg: "bg-amber-400",
    pillBorder: "border-amber-500",
    pillText: "text-amber-950",
    pillHover: "hover:bg-amber-500",
    legendActiveBg: "bg-amber-500",
    legendActiveText: "text-amber-950",
    legendActiveBorder: "border-amber-600",
    legendCountBg: "bg-black/15 text-amber-950",
    hoverHeaderBg: "bg-amber-600",
    dotColor: "bg-amber-500",
    badgeClass: "bg-amber-50 text-amber-900 border-amber-300",
  },
  Standalone: {
    label: "Standalone",
    pillBg: "bg-teal-100",
    pillBorder: "border-teal-300",
    pillText: "text-teal-900",
    pillHover: "hover:bg-teal-200/80",
    legendActiveBg: "bg-teal-700",
    legendActiveText: "text-white",
    legendActiveBorder: "border-teal-800",
    legendCountBg: "bg-black/15 text-white",
    hoverHeaderBg: "bg-teal-700",
    dotColor: "bg-teal-600",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
  },
};
