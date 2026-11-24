"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  ShieldCheck,
  Radio,
  FileText,
  Navigation,
  Smartphone,
  Compass,
  X,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { ClientRecord, CalendarVisit } from "@/types/client";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";

interface ClientCalendarTabProps {
  client: ClientRecord;
  onOpenScheduleVisit?: () => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SHORT_MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const SHORT_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Helper to format date as YYYY-MM-DD
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Get the Sunday of the week for a given date
function getStartOfWeek(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay(); // 0 is Sunday
  copy.setDate(copy.getDate() - day);
  return copy;
}

// Get the Saturday of the week for a given date
function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

export function ClientCalendarTab({ client, onOpenScheduleVisit }: ClientCalendarTabProps) {
  // Primary view state: month, week, or day
  const [selectedView, setSelectedView] = useState<"month" | "week" | "day">("week");
  // Active reference date: initialized to Nov 24, 2026 (matching system reference data)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 10, 24));
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [telemetryVisit, setTelemetryVisit] = useState<CalendarVisit | null>(null);

  const visits = useMemo(() => client.calendarVisits || [], [client.calendarVisits]);

  // Compute Week Range for current reference date
  const weekStart = useMemo(() => getStartOfWeek(currentDate), [currentDate]);
  const weekEnd = useMemo(() => getEndOfWeek(currentDate), [currentDate]);

  // Dynamic Navigation Header Label
  const calendarTitle = useMemo(() => {
    if (selectedView === "month") {
      return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (selectedView === "week") {
      const startMonth = SHORT_MONTH_NAMES[weekStart.getMonth()];
      const endMonth = SHORT_MONTH_NAMES[weekEnd.getMonth()];
      const startDay = weekStart.getDate();
      const endDay = weekEnd.getDate();
      const year = weekEnd.getFullYear();

      if (startMonth === endMonth) {
        return `Week of ${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
      }
      return `Week of ${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
    }
    // Day View
    const dayName = DAY_NAMES[currentDate.getDay()];
    const month = SHORT_MONTH_NAMES[currentDate.getMonth()];
    return `${dayName}, ${month} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  }, [selectedView, currentDate, weekStart, weekEnd]);

  // Previous Navigation Handler
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (selectedView === "month") {
        next.setMonth(next.getMonth() - 1);
      } else if (selectedView === "week") {
        next.setDate(next.getDate() - 7);
      } else {
        next.setDate(next.getDate() - 1);
      }
      return next;
    });
  };

  // Next Navigation Handler
  const handleNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (selectedView === "month") {
        next.setMonth(next.getMonth() + 1);
      } else if (selectedView === "week") {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + 1);
      }
      return next;
    });
  };

  // Jump to Today
  const handleToday = () => {
    setCurrentDate(new Date(2026, 10, 24));
  };

  // Filtered Visits based on active view and date range
  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      // 1. Status Filter
      if (filterStatus !== "All" && visit.status !== filterStatus) {
        return false;
      }

      // 2. Date Range Filter based on view
      if (selectedView === "day") {
        const targetKey = toDateKey(currentDate);
        return visit.date === targetKey;
      }

      if (selectedView === "week") {
        const startKey = toDateKey(weekStart);
        const endKey = toDateKey(weekEnd);
        return visit.date >= startKey && visit.date <= endKey;
      }

      // Month View
      const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
      return visit.date.startsWith(yearMonth);
    });
  }, [visits, filterStatus, selectedView, currentDate, weekStart, weekEnd]);

  // 7 Days of the Active Week for Week Strip
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + idx);
      const key = toDateKey(d);
      const dayVisits = visits.filter((v) => v.date === key);
      const isSelected = toDateKey(currentDate) === key;
      const isToday = key === "2026-11-24";

      return {
        date: d,
        key,
        dayName: SHORT_DAY_NAMES[d.getDay()],
        dayNumber: d.getDate(),
        visitsCount: dayVisits.length,
        isSelected,
        isToday,
      };
    });
  }, [weekStart, currentDate, visits]);

  // Month Grid Calculation for Month View
  const monthGridDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: Array<{
      date: Date;
      key: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
      visitsCount: number;
    }> = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const key = toDateKey(d);
      const dayVisits = visits.filter((v) => v.date === key);
      days.push({
        date: d,
        key,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isSelected: toDateKey(currentDate) === key,
        isToday: key === "2026-11-24",
        visitsCount: dayVisits.length,
      });
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(year, month, day);
      const key = toDateKey(d);
      const dayVisits = visits.filter((v) => v.date === key);
      days.push({
        date: d,
        key,
        dayNumber: day,
        isCurrentMonth: true,
        isSelected: toDateKey(currentDate) === key,
        isToday: key === "2026-11-24",
        visitsCount: dayVisits.length,
      });
    }

    // Next month padding to fill complete grid of rows
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      const key = toDateKey(d);
      const dayVisits = visits.filter((v) => v.date === key);
      days.push({
        date: d,
        key,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isSelected: toDateKey(currentDate) === key,
        isToday: key === "2026-11-24",
        visitsCount: dayVisits.length,
      });
    }

    return days;
  }, [currentDate, visits]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* =========================================================================
          TOP CONTROLS BANNER
         ========================================================================= */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Service Calendar & EVV Shifts
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 shrink-0">
                <Radio className="w-3 h-3 text-[#3D6B22] animate-pulse" /> Live Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Electronic Visit Verification (EVV) timestamps, GPS geo-fencing, and shift schedules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Switcher Pill: Month | Week | Day (Matches User Attachment) */}
          <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs shadow-2xs">
            {(["month", "week", "day"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setSelectedView(view)}
                className={`px-3 py-1 font-bold rounded-lg capitalize transition-all cursor-pointer ${
                  selectedView === view
                    ? "bg-white text-slate-900 shadow-sm shadow-slate-900/5 font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                aria-pressed={selectedView === view}
              >
                {view}
              </button>
            ))}
          </div>

          {onOpenScheduleVisit && (
            <button
              type="button"
              onClick={onOpenScheduleVisit}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Shift</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          CALENDAR MAIN CONTAINER
         ========================================================================= */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-5">
        {/* Navigation Strip & Filter Legend (Exact Match to User Attachment) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          {/* < Today > Buttons & Dynamic Date Title */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-lg hover:bg-slate-100/80 text-slate-700 transition-colors cursor-pointer"
                title={`Previous ${selectedView}`}
                aria-label={`Previous ${selectedView}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-3 py-1 text-xs font-bold text-slate-800 hover:bg-slate-100/80 rounded-lg transition-colors cursor-pointer"
                title="Jump to current date"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-lg hover:bg-slate-100/80 text-slate-700 transition-colors cursor-pointer"
                title={`Next ${selectedView}`}
                aria-label={`Next ${selectedView}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              {calendarTitle}
            </h3>
          </div>

          {/* Status Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {["All", "In-Progress", "Scheduled", "Completed"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === status
                    ? "bg-[#3D6B22] text-white shadow-2xs font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================================
            VIEW 01: WEEK VIEW (Interactive 7-Day Day Selector Strip + Shifts List)
           ========================================================================= */}
        {selectedView === "week" && (
          <div className="space-y-5">
            {/* 7-Day Interactive Week Selector Strip */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
              {weekDays.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setCurrentDate(day.date)}
                  className={`p-2 sm:p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1 ${
                    day.isSelected
                      ? "bg-emerald-50/70 border-[#3D6B22] shadow-sm ring-1 ring-[#3D6B22]/30"
                      : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                      day.isSelected ? "text-[#3D6B22]" : "text-slate-500"
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span
                    className={`text-sm sm:text-lg font-extrabold ${
                      day.isSelected
                        ? "text-[#3D6B22]"
                        : day.isToday
                        ? "text-slate-900 underline decoration-[#3D6B22] decoration-2 underline-offset-4"
                        : "text-slate-800"
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                  {day.visitsCount > 0 ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#3D6B22] text-white shadow-2xs">
                      {day.visitsCount} {day.visitsCount === 1 ? "shift" : "shifts"}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">—</span>
                  )}
                </button>
              ))}
            </div>

            {/* Visits Header for the Selected Day in the Week */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-bold text-slate-700">
                Scheduled Shifts ({filteredVisits.length})
              </span>
              <span className="text-slate-500 font-medium">
                Click any day above to jump directly to that date
              </span>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 02: MONTH VIEW (Full 7-Column Calendar Month Grid)
           ========================================================================= */}
        {selectedView === "month" && (
          <div className="space-y-4">
            {/* Weekday column headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-500 uppercase tracking-wider pb-1">
              {SHORT_DAY_NAMES.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Month Day Cells Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {monthGridDays.map((cell) => (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => {
                    setCurrentDate(cell.date);
                    // Single click focuses the date; toast gives quick feedback
                    if (cell.visitsCount > 0) {
                      toast.info(`${cell.visitsCount} shift(s) on ${cell.key}`);
                    }
                  }}
                  onDoubleClick={() => {
                    setCurrentDate(cell.date);
                    setSelectedView("day");
                  }}
                  className={`min-h-[70px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                    cell.isSelected
                      ? "bg-emerald-50/70 border-[#3D6B22] ring-1 ring-[#3D6B22]/30 shadow-xs"
                      : cell.isCurrentMonth
                      ? "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      : "bg-slate-50/50 border-slate-100 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        cell.isSelected
                          ? "text-[#3D6B22] font-extrabold"
                          : cell.isToday
                          ? "w-6 h-6 rounded-full bg-[#3D6B22] text-white flex items-center justify-center font-bold"
                          : cell.isCurrentMonth
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cell.visitsCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#3D6B22] shrink-0 sm:hidden" />
                    )}
                  </div>

                  {cell.visitsCount > 0 && (
                    <div className="hidden sm:block mt-1">
                      <span className="inline-block w-full text-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#3D6B22]/15 text-[#3D6B22] border border-[#3D6B22]/20 truncate">
                        {cell.visitsCount} {cell.visitsCount === 1 ? "Shift" : "Shifts"}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="text-center text-xs text-slate-400 pt-1">
              Tip: Double-click any day to switch directly to its daily hourly schedule.
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 03: DAY VIEW (Focused Agenda Timeline for Selected Day)
           ========================================================================= */}
        {selectedView === "day" && (
          <div className="space-y-3">
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Daily Agenda Schedule
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {calendarTitle}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-[#3D6B22] border border-[#3D6B22]/20 shadow-2xs">
                {filteredVisits.length} {filteredVisits.length === 1 ? "Shift Scheduled" : "Shifts Scheduled"}
              </span>
            </div>
          </div>
        )}

        {/* =========================================================================
            VISIT SHIFTS LIST (Shared across views with EVV GPS Telemetry Action)
           ========================================================================= */}
        <div className="space-y-3.5 pt-2">
          {filteredVisits.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
              <CalendarDays className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  No shifts found for this time period
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                  There are no scheduled or completed caregiver shifts matching your active status filter in {calendarTitle}.
                </p>
              </div>
              {onOpenScheduleVisit && (
                <button
                  type="button"
                  onClick={onOpenScheduleVisit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule Shift Now</span>
                </button>
              )}
            </div>
          ) : (
            filteredVisits.map((visit) => {
              const isInProgress = visit.status === "In-Progress";
              const isCompleted = visit.status === "Completed";
              const isScheduled = visit.status === "Scheduled";

              return (
                <div
                  key={visit.id}
                  className={`p-4 sm:p-4.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isInProgress
                      ? "bg-emerald-50/50 border-[#3D6B22]/30 shadow-xs ring-1 ring-[#3D6B22]/20"
                      : isCompleted
                      ? "bg-slate-50/70 border-slate-200 hover:bg-slate-50"
                      : "bg-blue-50/40 border-blue-200/80 hover:bg-blue-50/60"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs ${
                        isInProgress
                          ? "bg-[#3D6B22] text-white"
                          : isCompleted
                          ? "bg-slate-200 text-slate-700"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                          {visit.title}
                        </h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isInProgress
                              ? "bg-emerald-600 text-white animate-pulse"
                              : isCompleted
                              ? "bg-slate-200 text-slate-700"
                              : "bg-blue-100 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {visit.status}
                        </span>
                        {visit.evvVerified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                            <ShieldCheck className="w-3 h-3 text-[#3D6B22]" />
                            <span>EVV GPS Verified</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                        <span className="font-semibold text-slate-800">{visit.date}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-semibold text-slate-700">
                          {visit.startTime} – {visit.endTime}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <strong className="text-slate-900">{visit.caregiverName}</strong>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                          {visit.serviceType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setTelemetryVisit(visit)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#3D6B22]" />
                      <span>GPS Telemetry</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =========================================================================
          GPS TELEMETRY INSPECTION MODAL
         ========================================================================= */}
      {telemetryVisit && (
        <Modal
          isOpen={!!telemetryVisit}
          onClose={() => setTelemetryVisit(null)}
          title={`EVV Telemetry: ${telemetryVisit.caregiverName}`}
          description={`Shift Verification Details for ${telemetryVisit.date} (${telemetryVisit.startTime} – ${telemetryVisit.endTime})`}
          icon={<Compass className="w-5 h-5" />}
          maxWidth="lg"
          footer={
            <button
              type="button"
              onClick={() => setTelemetryVisit(null)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Close Telemetry
            </button>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#3D6B22]" />
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    21st Century Cures Act EVV Compliant
                  </div>
                  <div className="text-xs text-slate-600">
                    Cryptographically authenticated GPS clock-in telemetry received.
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#3D6B22] bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                Pass (99.4%)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Clock-in Coordinates
                </span>
                <span className="font-mono font-bold text-slate-800">
                  44.0462° N, 123.0220° W
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Geofence Proximity
                </span>
                <span className="font-bold text-[#3D6B22]">
                  18 meters (Inside 50m zone)
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Assigned Device
                </span>
                <span className="font-medium text-slate-800">
                  Samsung Galaxy XCover 5 (LiliSare Mobile v2.4.1)
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Service Billing Code
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {telemetryVisit.serviceType}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Verified Location: {client.residentialAddress?.address || "742 Evergreen Terrace"}, {client.residentialAddress?.city || "Springfield"}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
