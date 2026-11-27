"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Plus,
  ShieldCheck,
  Radio,
  Navigation,
  Compass,
  CalendarDays,
  Eye,
  EyeOff,
  Printer,
  Mail,
  Send,
  Settings,
  Bookmark,
  Lightbulb,
  Edit3,
  X,
} from "lucide-react";
import { ClientRecord, CalendarVisit } from "@/types/client";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { AddVisitDrawer } from "./calendar/AddVisitDrawer";
import {
  MONTH_NAMES,
  SHORT_MONTH_NAMES,
  DAY_NAMES_SUN,
  SHORT_DAY_NAMES_SUN,
  SHORT_DAY_NAMES_MON,
  STATUS_STYLE_MAP,
  VisitLegendStatus,
  getVisitStatusMeta,
  toDateKey,
  getStartOfWeek,
  getEndOfWeek,
  computeDurationHours,
  getHolidayName,
} from "./calendar/calendarUtils";

interface ClientCalendarTabProps {
  client: ClientRecord;
  onUpdateClient?: (updated: ClientRecord) => void;
  onOpenScheduleVisit?: () => void;
}

const REFERENCE_TODAY_KEY = "2026-11-24";

export function ClientCalendarTab({
  client,
  onUpdateClient,
}: ClientCalendarTabProps) {
  // Primary view state: month (default matching reference), week, or day
  const [selectedView, setSelectedView] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 10, 24));
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [telemetryVisit, setTelemetryVisit] = useState<CalendarVisit | null>(null);

  // Local visits state synced with client.calendarVisits
  const [localVisits, setLocalVisits] = useState<CalendarVisit[]>(
    () => client.calendarVisits || []
  );

  useEffect(() => {
    setLocalVisits(client.calendarVisits || []);
  }, [client.calendarVisits]);

  // Add/Edit Visit Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerDateKey, setDrawerDateKey] = useState<string>(REFERENCE_TODAY_KEY);
  const [editingVisit, setEditingVisit] = useState<CalendarVisit | null>(null);

  // Calendar Preferences & Toolbar Toggles
  const [showDetails, setShowDetails] = useState(true);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [startOnMonday, setStartOnMonday] = useState(true);
  const [showWeeklySummary, setShowWeeklySummary] = useState(true);
  const [showHolidays, setShowHolidays] = useState(true);

  const selectedDateKey = toDateKey(currentDate);
  const weekStart = useMemo(
    () => getStartOfWeek(currentDate, startOnMonday),
    [currentDate, startOnMonday]
  );
  const weekEnd = useMemo(
    () => getEndOfWeek(currentDate, startOnMonday),
    [currentDate, startOnMonday]
  );

  const weekdayHeaders = startOnMonday ? SHORT_DAY_NAMES_MON : SHORT_DAY_NAMES_SUN;

  // Dynamic Navigation Header Label for Week / Day
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
      return `Week of ${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
    }
    const dayName = DAY_NAMES_SUN[currentDate.getDay()];
    const month = SHORT_MONTH_NAMES[currentDate.getMonth()];
    return `${dayName}, ${month} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  }, [selectedView, currentDate, weekStart, weekEnd]);

  // Navigation Handlers
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (selectedView === "month") next.setMonth(next.getMonth() - 1);
      else if (selectedView === "week") next.setDate(next.getDate() - 7);
      else next.setDate(next.getDate() - 1);
      return next;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (selectedView === "month") next.setMonth(next.getMonth() + 1);
      else if (selectedView === "week") next.setDate(next.getDate() + 7);
      else next.setDate(next.getDate() + 1);
      return next;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 10, 24));
  };

  const handleMonthChange = (monthIdx: number) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), monthIdx, 1));
  };

  const handleYearChange = (year: number) => {
    setCurrentDate((prev) => new Date(year, prev.getMonth(), 1));
  };

  // Filtered Visits for Agenda List & Cells
  const matchesFilter = (visit: CalendarVisit) => {
    if (filterStatus === "All") return true;
    const meta = getVisitStatusMeta(visit);
    return meta.legendKey === filterStatus || visit.status === filterStatus;
  };

  const filteredVisits = useMemo(() => {
    return localVisits.filter((visit) => {
      if (!matchesFilter(visit)) return false;

      if (selectedView === "day") {
        return visit.date === selectedDateKey;
      }
      if (selectedView === "week") {
        const startKey = toDateKey(weekStart);
        const endKey = toDateKey(weekEnd);
        return visit.date >= startKey && visit.date <= endKey;
      }
      // In Month view, if user clicked a specific day that has visits or selected date, show selected day or month visits
      const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
      return visit.date.startsWith(yearMonth);
    });
  }, [localVisits, filterStatus, selectedView, selectedDateKey, weekStart, weekEnd, currentDate]);

  // 7 Days of the Active Week for Week Strip
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + idx);
      const key = toDateKey(d);
      const dayVisits = localVisits.filter((v) => v.date === key && matchesFilter(v));
      return {
        date: d,
        key,
        dayName: SHORT_DAY_NAMES_SUN[d.getDay()],
        dayNumber: d.getDate(),
        visitsCount: dayVisits.length,
        isSelected: selectedDateKey === key,
        isToday: key === REFERENCE_TODAY_KEY,
      };
    });
  }, [weekStart, selectedDateKey, localVisits, filterStatus]);

  // Month Grid Weeks (each week has 7 days + weekly summary stats S/B/P/U)
  const monthWeeks = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const gridStart = getStartOfWeek(firstDayOfMonth, startOnMonday);
    const gridEnd = getEndOfWeek(lastDayOfMonth, startOnMonday);

    const weeks: Array<{
      weekKey: string;
      days: Array<{
        date: Date;
        key: string;
        dayNumber: number;
        monthShort: string;
        isFirstOfMonth: boolean;
        isCurrentMonth: boolean;
        isSelected: boolean;
        isToday: boolean;
        holiday: string | null;
        visits: CalendarVisit[];
      }>;
      summary: {
        sHours: number; sCount: number;
        bHours: number; bCount: number;
        pHours: number; pCount: number;
        uHours: number; uCount: number;
      };
    }> = [];

    const cursor = new Date(gridStart);
    while (cursor <= gridEnd) {
      const weekDaysArr: typeof weeks[number]["days"] = [];
      let sHours = 0, sCount = 0;
      let bHours = 0, bCount = 0;
      let pHours = 0, pCount = 0;
      let uHours = 0, uCount = 0;

      for (let i = 0; i < 7; i++) {
        const d = new Date(cursor);
        const key = toDateKey(d);
        const dayVisits = localVisits.filter((v) => v.date === key && matchesFilter(v));

        for (const v of dayVisits) {
          const hrs = Math.round(computeDurationHours(v.startTime, v.endTime));
          const meta = getVisitStatusMeta(v);
          if (meta.legendKey === "Unassigned") {
            uHours += hrs;
            uCount += 1;
          } else if (meta.legendKey === "Completed" || meta.legendKey === "Verified") {
            bHours += hrs;
            bCount += 1;
          } else if (meta.legendKey === "In-Progress") {
            pHours += hrs;
            pCount += 1;
          } else if (meta.legendKey !== "Removed") {
            sHours += hrs;
            sCount += 1;
          }
        }

        weekDaysArr.push({
          date: d,
          key,
          dayNumber: d.getDate(),
          monthShort: SHORT_MONTH_NAMES[d.getMonth()],
          isFirstOfMonth: d.getDate() === 1,
          isCurrentMonth: d.getMonth() === month,
          isSelected: selectedDateKey === key,
          isToday: key === REFERENCE_TODAY_KEY,
          holiday: showHolidays ? getHolidayName(d) : null,
          visits: dayVisits,
        });

        cursor.setDate(cursor.getDate() + 1);
      }

      weeks.push({
        weekKey: weekDaysArr[0].key,
        days: weekDaysArr,
        summary: { sHours, sCount, bHours, bCount, pHours, pCount, uHours, uCount },
      });
    }

    return weeks;
  }, [currentDate, startOnMonday, localVisits, filterStatus, selectedDateKey, showHolidays]);

  // Open Add Visit Drawer
  const openNewVisitDrawer = (targetKey?: string) => {
    const key = targetKey || selectedDateKey;
    setEditingVisit(null);
    setDrawerDateKey(key);
    setIsDrawerOpen(true);
  };

  const openEditVisitDrawer = (visit: CalendarVisit) => {
    setEditingVisit(visit);
    setDrawerDateKey(visit.date);
    setIsDrawerOpen(true);
  };

  const handleSaveVisit = (visit: CalendarVisit, isEdit: boolean) => {
    const updatedVisits = isEdit
      ? localVisits.map((v) => (v.id === visit.id ? visit : v))
      : [visit, ...localVisits];

    setLocalVisits(updatedVisits);
    if (onUpdateClient) {
      onUpdateClient({
        ...client,
        calendarVisits: updatedVisits,
      });
    }
    toast.success(
      isEdit
        ? `Updated visit on ${visit.date}`
        : `Visit scheduled for ${visit.date} (${visit.startTime} – ${visit.endTime})`
    );
    setIsDrawerOpen(false);
    setEditingVisit(null);
  };

  const handleDeleteVisit = (visitId: string) => {
    const updatedVisits = localVisits.filter((v) => v.id !== visitId);
    setLocalVisits(updatedVisits);
    if (onUpdateClient) {
      onUpdateClient({
        ...client,
        calendarVisits: updatedVisits,
      });
    }
    toast.success("Visit removed from calendar");
    setIsDrawerOpen(false);
    setEditingVisit(null);
  };

  const legendItems: Array<{ key: VisitLegendStatus; label: string; badgeClass: string }> = [
    { key: "Unassigned", ...STATUS_STYLE_MAP.Unassigned },
    { key: "Verified", ...STATUS_STYLE_MAP.Verified },
    { key: "Removed", ...STATUS_STYLE_MAP.Removed },
    { key: "Completed", ...STATUS_STYLE_MAP.Completed },
    { key: "Scheduled", ...STATUS_STYLE_MAP.Scheduled },
    { key: "Standalone", ...STATUS_STYLE_MAP.Standalone },
    { key: "In-Progress", ...STATUS_STYLE_MAP["In-Progress"] },
    { key: "Missed", ...STATUS_STYLE_MAP.Missed },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* =========================================================================
          MAIN SPLIT WORKSPACE (Calendar Left + Add Visit Drawer Right on lg+)
         ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-start gap-4">
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* =====================================================================
              CALENDAR CARD CONTAINER
             ===================================================================== */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
            {/* TOP TOOLBAR (Matches Reference Image + Modern LiliSare Trends) */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
              {/* Left: Title + Live EVV Pill */}
              <div className="flex items-center justify-between xl:justify-start gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                        Calendar
                      </h2>
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                        <Radio className="w-2.5 h-2.5 animate-pulse" /> EVV Live
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile-only Add Visit button */}
                <button
                  type="button"
                  onClick={() => openNewVisitDrawer()}
                  className="xl:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-sm shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD A VISIT</span>
                </button>
              </div>

              {/* Center: < [Month v] [Year v] > >> */}
              <div className="flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1 bg-slate-50/80 border border-slate-200 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                    title={`Previous ${selectedView}`}
                    aria-label={`Previous ${selectedView}`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <select
                    value={currentDate.getMonth()}
                    onChange={(e) => handleMonthChange(Number(e.target.value))}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3D6B22] cursor-pointer"
                    aria-label="Select Month"
                  >
                    {SHORT_MONTH_NAMES.map((m, idx) => (
                      <option key={m} value={idx}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <select
                    value={currentDate.getFullYear()}
                    onChange={(e) => handleYearChange(Number(e.target.value))}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3D6B22] cursor-pointer"
                    aria-label="Select Year"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                    title={`Next ${selectedView}`}
                    aria-label={`Next ${selectedView}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleToday}
                    className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-[#3D6B22] transition-all cursor-pointer"
                    title="Jump to Today (Nov 24, 2026)"
                    aria-label="Jump to Today"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>

                {/* View Switcher Pill: Month | Week | Day */}
                <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs">
                  {(["month", "week", "day"] as const).map((view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setSelectedView(view)}
                      className={`px-2.5 py-1 font-bold rounded-lg capitalize transition-all cursor-pointer ${
                        selectedView === view
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Utility Icons + ADD A VISIT CTA */}
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <div className="flex items-center gap-1 bg-slate-50/80 border border-slate-200 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setShowDetails((p) => !p)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                    title={showDetails ? "Hide legend & totals" : "Show legend & totals"}
                  >
                    {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.info("Preparing printable calendar view...");
                      window.print();
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                    title="Print Calendar"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      toast.success(
                        `Schedule summary emailed to ${client.primaryContact?.name || "Primary Contact"}`
                      )
                    }
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                    title="Email Schedule"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      toast.success("Calendar schedule pushed to assigned Caregivers")
                    }
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                    title="Send to Caregivers"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrefsOpen(true)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#3D6B22] hover:bg-white transition-all cursor-pointer"
                    title="Calendar Preferences"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => openNewVisitDrawer()}
                  className="hidden xl:inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD A VISIT</span>
                </button>
              </div>
            </div>

            {/* =================================================================
                VIEW 01: MONTH VIEW (8-Column Grid with Weekly Summary Column)
               ================================================================= */}
            {selectedView === "month" && (
              <div className="space-y-3">
                {/* DESKTOP / TABLET GRID (md+) */}
                <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200">
                  {/* Column Headers */}
                  <div
                    className={`grid ${
                      showWeeklySummary
                        ? "grid-cols-[repeat(7,minmax(0,1fr))_108px]"
                        : "grid-cols-7"
                    } bg-slate-50 border-b border-slate-200 text-center`}
                  >
                    {weekdayHeaders.map((day) => (
                      <div
                        key={day}
                        className="py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200 last:border-r-0"
                      >
                        {day}
                      </div>
                    ))}
                    {showWeeklySummary && (
                      <div className="py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100/80">
                        Weekly
                      </div>
                    )}
                  </div>

                  {/* Week Rows */}
                  <div className="divide-y divide-slate-200">
                    {monthWeeks.map((week) => (
                      <div
                        key={week.weekKey}
                        className={`grid ${
                          showWeeklySummary
                            ? "grid-cols-[repeat(7,minmax(0,1fr))_108px]"
                            : "grid-cols-7"
                        }`}
                      >
                        {week.days.map((cell, idx) => {
                          const isDraftTarget =
                            isDrawerOpen && !editingVisit && drawerDateKey === cell.key;

                          return (
                            <div
                              key={cell.key}
                              onClick={() => setCurrentDate(cell.date)}
                              onDoubleClick={() => openNewVisitDrawer(cell.key)}
                              className={`group relative min-h-[96px] lg:min-h-[108px] p-1.5 border-r border-slate-200 transition-colors cursor-pointer flex flex-col gap-1 ${
                                cell.isSelected
                                  ? "bg-emerald-50/50 ring-1 ring-inset ring-[#3D6B22]/40"
                                  : cell.holiday
                                    ? "bg-slate-200/60"
                                    : cell.isCurrentMonth
                                      ? "bg-white hover:bg-slate-50/80"
                                      : "bg-slate-50/70 text-slate-400"
                              }`}
                            >
                              {/* Day Number + Holiday + Quick Add Button */}
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex items-center gap-1 min-w-0">
                                  {cell.holiday && (
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight truncate">
                                      {cell.holiday}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 ml-auto shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentDate(cell.date);
                                      openNewVisitDrawer(cell.key);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md bg-[#3D6B22]/10 text-[#3D6B22] hover:bg-[#3D6B22] hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                    title={`Add visit on ${cell.key}`}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <span
                                    className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                                      cell.isToday
                                        ? "bg-[#3D6B22] text-white"
                                        : cell.isSelected
                                          ? "text-[#3D6B22] font-extrabold"
                                          : cell.isCurrentMonth
                                            ? "text-slate-700"
                                            : "text-slate-400"
                                    }`}
                                  >
                                    {(cell.isFirstOfMonth || (idx === 0 && week === monthWeeks[0])) &&
                                    !cell.isToday
                                      ? `${cell.monthShort} ${cell.dayNumber}`
                                      : cell.dayNumber}
                                  </span>
                                </div>
                              </div>

                              {/* Draft "NEW VISIT" Pill when Add Visit Drawer is open for this day */}
                              {isDraftTarget && (
                                <div className="px-2 py-1 rounded-lg bg-[#3D6B22]/15 border border-[#3D6B22]/40 text-[#3D6B22] shadow-xs flex items-center gap-1.5 text-[10px] font-extrabold tracking-tight animate-in zoom-in-95 duration-150">
                                  <Bookmark className="w-3 h-3 fill-[#3D6B22] shrink-0" />
                                  <span className="truncate">NEW VISIT</span>
                                </div>
                              )}

                              {/* Visit Pills */}
                              <div className="space-y-1 overflow-hidden">
                                {cell.visits.slice(0, 3).map((visit) => {
                                  const meta = getVisitStatusMeta(visit);
                                  return (
                                    <button
                                      key={visit.id}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditVisitDrawer(visit);
                                      }}
                                      className={`w-full text-left px-1.5 py-0.5 rounded-md border text-[10px] font-semibold truncate transition-all cursor-pointer flex items-center gap-1 ${meta.pillClass}`}
                                      title={`${visit.startTime} - ${visit.endTime} | ${visit.caregiverName} | ${visit.serviceType}`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dotClass}`} />
                                      <span className="truncate">
                                        {visit.startTime.replace(":00 ", "")} {visit.caregiverName === "Unassigned" ? "Open" : visit.caregiverName.split(" ")[0]}
                                      </span>
                                    </button>
                                  );
                                })}
                                {cell.visits.length > 3 && (
                                  <div className="text-[10px] font-bold text-[#3D6B22] pl-1">
                                    +{cell.visits.length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Weekly Summary Column (S / B / P / U) */}
                        {showWeeklySummary && (
                          <div className="bg-slate-100/80 p-2 flex flex-col justify-center gap-1 text-[10px] font-bold text-slate-700">
                            <div className="flex items-center justify-between gap-1">
                              <span title="Scheduled Hours / Visits">
                                S <span className="font-semibold text-slate-600">{week.summary.sHours}/{week.summary.sCount}</span>
                              </span>
                              <span title="Billed / Completed Hours / Visits">
                                B <span className="font-semibold text-[#3D6B22]">{week.summary.bHours}/{week.summary.bCount}</span>
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <span title="In-Progress / Pending Hours / Visits">
                                P <span className="font-semibold text-blue-700">{week.summary.pHours}/{week.summary.pCount}</span>
                              </span>
                              <span title="Unassigned Hours / Visits">
                                U <span className="font-semibold text-rose-600">{week.summary.uHours}/{week.summary.uCount}</span>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* MOBILE MINI-MONTH GRID (< md) */}
                <div className="md:hidden space-y-3">
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 uppercase">
                    {weekdayHeaders.map((d) => (
                      <div key={d} className="py-1">
                        {d.slice(0, 2)}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {monthWeeks.flatMap((w) => w.days).map((cell) => {
                      const hasDraft =
                        isDrawerOpen && !editingVisit && drawerDateKey === cell.key;
                      return (
                        <button
                          key={cell.key}
                          type="button"
                          onClick={() => setCurrentDate(cell.date)}
                          className={`h-11 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                            cell.isSelected
                              ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-sm"
                              : cell.isToday
                                ? "bg-emerald-50 text-[#3D6B22] border-[#3D6B22]/40 font-extrabold"
                                : cell.isCurrentMonth
                                  ? "bg-white text-slate-800 border-slate-200"
                                  : "bg-slate-50 text-slate-300 border-slate-100"
                          }`}
                        >
                          <span className="text-xs font-bold leading-none">{cell.dayNumber}</span>
                          <div className="flex items-center gap-0.5 h-1.5">
                            {hasDraft && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                            )}
                            {cell.visits.slice(0, 3).map((v) => (
                              <span
                                key={v.id}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  cell.isSelected ? "bg-white" : getVisitStatusMeta(v).dotClass
                                }`}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================
                VIEW 02: WEEK VIEW (Interactive 7-Day Strip)
               ================================================================= */}
            {selectedView === "week" && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-600">{calendarTitle}</div>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
                  {weekDays.map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setCurrentDate(day.date)}
                      className={`p-2 sm:p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1 ${
                        day.isSelected
                          ? "bg-emerald-50/80 border-[#3D6B22] shadow-sm ring-1 ring-[#3D6B22]/30"
                          : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80"
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
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#3D6B22] text-white">
                          {day.visitsCount}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* =================================================================
                VIEW 03: DAY VIEW (Focused Agenda Header)
               ================================================================= */}
            {selectedView === "day" && (
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Daily Agenda Schedule</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{calendarTitle}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-[#3D6B22] border border-[#3D6B22]/20 shadow-2xs">
                  {filteredVisits.length} {filteredVisits.length === 1 ? "Shift" : "Shifts"}
                </span>
              </div>
            )}

            {/* =================================================================
                STATUS LEGEND & TIP BAR (Matches Reference Image)
               ================================================================= */}
            {showDetails && (
              <div className="pt-2 space-y-2.5">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex flex-wrap items-center gap-2">
                    {legendItems.map((item) => {
                      const isActiveFilter = filterStatus === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() =>
                            setFilterStatus((prev) => (prev === item.key ? "All" : item.key))
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                            item.badgeClass
                          } ${
                            isActiveFilter
                              ? "ring-2 ring-offset-1 ring-[#3D6B22] scale-[1.03]"
                              : "opacity-90 hover:opacity-100"
                          }`}
                          title={`Filter by ${item.label}`}
                        >
                          <span>{item.label}</span>
                          {item.key === "Missed" && <Clock className="w-3 h-3" />}
                        </button>
                      );
                    })}

                    {filterStatus !== "All" && (
                      <button
                        type="button"
                        onClick={() => setFilterStatus("All")}
                        className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        Clear Filter
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 px-1">
                  <button
                    type="button"
                    onClick={() => setIsPrefsOpen(true)}
                    className="inline-flex items-center gap-1.5 hover:text-[#3D6B22] transition-colors cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      <strong className="text-slate-700">Tip:</strong> Use Preferences to customize the calendar
                    </span>
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Double-click any day cell to schedule a visit
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* =====================================================================
              VISITS AGENDA LIST (Responsive Cards with Edit & GPS Telemetry)
             ===================================================================== */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Scheduled Visits ({filteredVisits.length})
              </h3>
              <span className="text-xs text-slate-500 font-medium">{calendarTitle}</span>
            </div>

            {filteredVisits.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
                <CalendarDays className="w-9 h-9 text-slate-300 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    No visits found for this period
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                    Click &ldquo;ADD A VISIT&rdquo; or double-click any date cell to schedule a new caregiver shift.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openNewVisitDrawer()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add a Visit</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredVisits.map((visit) => {
                  const meta = getVisitStatusMeta(visit);
                  return (
                    <div
                      key={visit.id}
                      className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                              {visit.title}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.badgeClass}`}
                            >
                              {visit.status}
                            </span>
                            {visit.evvVerified && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                                <ShieldCheck className="w-3 h-3" />
                                <span>EVV Verified</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 text-xs text-slate-600 flex-wrap">
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
                            <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                              {visit.serviceType}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditVisitDrawer(visit)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTelemetryVisit(visit)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3D6B22] bg-emerald-50/70 hover:bg-emerald-100/70 border border-[#3D6B22]/20 rounded-xl transition-all cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>GPS Telemetry</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================================
            RIGHT-HAND ADD / EDIT VISIT SPLIT PANEL
           ===================================================================== */}
        <AddVisitDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setEditingVisit(null);
          }}
          client={client}
          selectedDate={drawerDateKey}
          editingVisit={editingVisit}
          onSaveVisit={handleSaveVisit}
          onDeleteVisit={handleDeleteVisit}
        />
      </div>

      {/* =========================================================================
          CALENDAR PREFERENCES MODAL
         ========================================================================= */}
      <Modal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
        title="Calendar Preferences"
        description="Customize your LiliSare scheduling grid layout and indicators"
        icon={<Settings className="w-5 h-5" />}
        maxWidth="md"
        footer={
          <button
            type="button"
            onClick={() => setIsPrefsOpen(false)}
            className="inline-flex items-center justify-center px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all cursor-pointer"
          >
            Done
          </button>
        }
      >
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-800">Start Week on Monday</div>
              <div className="text-[11px] text-slate-500">
                Display Mon – Sun columns instead of Sun – Sat
              </div>
            </div>
            <input
              type="checkbox"
              checked={startOnMonday}
              onChange={(e) => setStartOnMonday(e.target.checked)}
              className="w-4 h-4 accent-[#3D6B22] rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-800">Show Weekly Summary Column</div>
              <div className="text-[11px] text-slate-500">
                Display S / B / P / U weekly hours & visit totals
              </div>
            </div>
            <input
              type="checkbox"
              checked={showWeeklySummary}
              onChange={(e) => setShowWeeklySummary(e.target.checked)}
              className="w-4 h-4 accent-[#3D6B22] rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-800">Highlight Federal Holidays</div>
              <div className="text-[11px] text-slate-500">
                Show holiday badges on applicable calendar dates
              </div>
            </div>
            <input
              type="checkbox"
              checked={showHolidays}
              onChange={(e) => setShowHolidays(e.target.checked)}
              className="w-4 h-4 accent-[#3D6B22] rounded cursor-pointer"
            />
          </label>
        </div>
      </Modal>

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
                <span className="font-bold text-slate-800">44.0462° N, 123.0220° W</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Geofence Proximity
                </span>
                <span className="font-bold text-[#3D6B22]">18 meters (Inside 50m zone)</span>
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
                <span className="font-bold text-slate-800">{telemetryVisit.serviceType}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Verified Location: {client.residentialAddress?.address || "742 Evergreen Terrace"},{" "}
                {client.residentialAddress?.city || "Springfield"}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
