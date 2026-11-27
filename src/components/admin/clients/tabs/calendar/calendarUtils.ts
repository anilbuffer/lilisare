import { CalendarVisit } from "@/types/client";

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const SHORT_MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const DAY_NAMES_SUN = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export const SHORT_DAY_NAMES_SUN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const SHORT_DAY_NAMES_MON = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface ServiceCatalogItem {
  id: string;
  code: string;
  name: string;
  payer?: string;
  billingType: "Hourly" | "Daily" | "Fixed";
  rate: number;
  authorized: boolean;
}

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    id: "srv-t1019",
    code: "T1019",
    name: "Personal Care / ADL Support (T1019)",
    payer: "Oregon Health Plan (OHP / DHS Waiver)",
    billingType: "Hourly",
    rate: 42.0,
    authorized: true,
  },
  {
    id: "srv-s5130",
    code: "S5130",
    name: "Homemaker / Chores (S5130)",
    payer: "Oregon Health Plan (OHP / DHS Waiver)",
    billingType: "Hourly",
    rate: 36.0,
    authorized: true,
  },
  {
    id: "srv-s5150",
    code: "S5150",
    name: "Respite In-Home Care (S5150)",
    payer: "Pediatric In-Home Care",
    billingType: "Daily",
    rate: 165.0,
    authorized: true,
  },
  {
    id: "srv-sensory",
    code: "H2014",
    name: "Sensory Regulation & Behavioral Coaching",
    payer: "Pediatric In-Home Care",
    billingType: "Hourly",
    rate: 55.0,
    authorized: true,
  },
  {
    id: "srv-hygiene",
    code: "T1019-HYG",
    name: "Standby Shower & Hygiene Assistance",
    payer: "Oregon Health Plan (OHP / DHS Waiver)",
    billingType: "Hourly",
    rate: 38.0,
    authorized: true,
  },
  {
    id: "srv-rn-review",
    code: "T1001",
    name: "RN Clinical Assessment & Care Plan Review",
    payer: "LiliSare Clinical Oversight",
    billingType: "Fixed",
    rate: 125.0,
    authorized: true,
  },
  {
    id: "srv-mobility",
    code: "S5125-MOB",
    name: "Mobility Assistance & Fall Prevention",
    billingType: "Hourly",
    rate: 45.0,
    authorized: false,
  },
  {
    id: "srv-med-prompt",
    code: "H0034",
    name: "Medication Prompting & Reminders",
    billingType: "Fixed",
    rate: 35.0,
    authorized: false,
  },
  {
    id: "srv-community",
    code: "T2021",
    name: "Community Inclusion & Skill Building",
    billingType: "Hourly",
    rate: 48.0,
    authorized: false,
  },
  {
    id: "srv-livein",
    code: "T2033",
    name: "24-Hour Live-In Attendant Care (T2033)",
    billingType: "Daily",
    rate: 240.0,
    authorized: false,
  },
];

export type VisitLegendStatus =
  | "Unassigned"
  | "Verified"
  | "Removed"
  | "Completed"
  | "Scheduled"
  | "Standalone"
  | "In-Progress"
  | "Missed";

export interface StatusStyleMeta {
  label: string;
  legendKey: VisitLegendStatus;
  badgeClass: string;
  pillClass: string;
  dotClass: string;
}

export const STATUS_STYLE_MAP: Record<VisitLegendStatus, StatusStyleMeta> = {
  Unassigned: {
    label: "UNASSIGNED",
    legendKey: "Unassigned",
    badgeClass: "bg-rose-500 text-white border-rose-600 shadow-xs",
    pillClass: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80",
    dotClass: "bg-rose-500",
  },
  Verified: {
    label: "Verified",
    legendKey: "Verified",
    badgeClass: "bg-lime-100 text-lime-800 border-lime-300",
    pillClass: "bg-lime-50 text-lime-800 border-lime-300 hover:bg-lime-100/80",
    dotClass: "bg-lime-500",
  },
  Removed: {
    label: "REMOVED",
    legendKey: "Removed",
    badgeClass: "bg-red-800/80 text-white border-red-900/30",
    pillClass: "bg-red-50/80 text-red-800 border-red-200 line-through opacity-75",
    dotClass: "bg-red-700",
  },
  Completed: {
    label: "Completed",
    legendKey: "Completed",
    badgeClass: "bg-emerald-500/20 text-[#3D6B22] border-[#3D6B22]/30",
    pillClass: "bg-emerald-50 text-[#3D6B22] border-[#3D6B22]/25 hover:bg-emerald-100/70",
    dotClass: "bg-[#3D6B22]",
  },
  Scheduled: {
    label: "Scheduled",
    legendKey: "Scheduled",
    badgeClass: "bg-sky-400/25 text-sky-800 border-sky-300",
    pillClass: "bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100/70",
    dotClass: "bg-sky-500",
  },
  Standalone: {
    label: "Standalone",
    legendKey: "Standalone",
    badgeClass: "bg-teal-600 text-white border-teal-700",
    pillClass: "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100/70",
    dotClass: "bg-teal-600",
  },
  "In-Progress": {
    label: "In-Progress",
    legendKey: "In-Progress",
    badgeClass: "bg-blue-500/20 text-blue-800 border-blue-300",
    pillClass: "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100/80",
    dotClass: "bg-blue-500",
  },
  Missed: {
    label: "Missed",
    legendKey: "Missed",
    badgeClass: "bg-amber-400/30 text-amber-900 border-amber-400",
    pillClass: "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100/70",
    dotClass: "bg-amber-500",
  },
};

export function getVisitStatusMeta(visit: CalendarVisit): StatusStyleMeta {
  if (visit.status === "Unassigned" || visit.caregiverName === "Unassigned") {
    return STATUS_STYLE_MAP.Unassigned;
  }
  if (visit.status === "Removed" || visit.status === "Cancelled") {
    return STATUS_STYLE_MAP.Removed;
  }
  if (visit.status === "Standalone" || visit.isStandalone) {
    return STATUS_STYLE_MAP.Standalone;
  }
  if (visit.status === "Verified") {
    return STATUS_STYLE_MAP.Verified;
  }
  if (visit.status === "Missed") {
    return STATUS_STYLE_MAP.Missed;
  }
  if (visit.status === "In-Progress") {
    return STATUS_STYLE_MAP["In-Progress"];
  }
  if (visit.status === "Completed") {
    return visit.evvVerified ? STATUS_STYLE_MAP.Verified : STATUS_STYLE_MAP.Completed;
  }
  return STATUS_STYLE_MAP.Scheduled;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function getStartOfWeek(date: Date, startOnMonday = true): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay(); // 0 = Sun, 1 = Mon
  const diff = startOnMonday ? (day === 0 ? -6 : 1 - day) : -day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

export function getEndOfWeek(date: Date, startOnMonday = true): Date {
  const start = getStartOfWeek(date, startOnMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

export function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + mins;
}

export function computeDurationHours(startTime: string, endTime: string): number {
  let diff = parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime);
  if (diff <= 0) diff += 24 * 60;
  return Math.round((diff / 60) * 100) / 100;
}

export function formatDurationLabel(startTime: string, endTime: string): string {
  let diff = parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime);
  if (diff <= 0) diff += 24 * 60;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// US Federal Holidays helper for calendar cell badges
export function getHolidayName(date: Date): string | null {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dow = date.getDay();

  if (m === 1 && d === 1) return "NEW YEAR'S DAY";
  if (m === 7 && d === 4) return "INDEPENDENCE DAY";
  if (m === 11 && d === 11) return "VETERANS DAY";
  if (m === 12 && d === 25) return "CHRISTMAS DAY";
  // Thanksgiving: 4th Thursday of November
  if (m === 11 && dow === 4 && d >= 22 && d <= 28) return "THANKSGIVING";
  // Memorial Day: Last Monday of May
  if (m === 5 && dow === 1 && d >= 25) return "MEMORIAL DAY";
  // Labor Day: 1st Monday of September
  if (m === 9 && dow === 1 && d <= 7) return "LABOR DAY";
  return null;
}
