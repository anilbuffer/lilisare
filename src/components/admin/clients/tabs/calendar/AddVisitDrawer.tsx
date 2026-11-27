"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Maximize2,
  Minimize2,
  Calendar as CalendarIcon,
  DollarSign,
  StickyNote,
  FileText,
  MoreHorizontal,
  Send,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Trash2,
  Clock,
} from "lucide-react";
import { ClientRecord, CalendarVisit } from "@/types/client";
import {
  SERVICE_CATALOG,
  ServiceCatalogItem,
  computeDurationHours,
  formatDurationLabel,
} from "./calendarUtils";
import { toast } from "sonner";

type DrawerTab = "details" | "financial" | "memo" | "care-notes" | "more";

interface AddVisitDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientRecord;
  selectedDate: string; // YYYY-MM-DD
  editingVisit?: CalendarVisit | null;
  onSaveVisit: (visit: CalendarVisit, isEdit: boolean) => void;
  onDeleteVisit?: (visitId: string) => void;
}

const HOURS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"] as const;

const MODIFICATION_REASONS = [
  "New Schedule Request",
  "Caregiver Substitution",
  "Client / Family Request",
  "Authorization Update",
  "Emergency Coverage",
  "Clinical Review Adjustment",
];

const CLOCK_LOCATIONS = [
  "Any profile address",
  "Client Residential Address",
  "Community / Outing Location",
  "Telehealth / Remote Check-in",
];

const ADL_TASKS = [
  "Bathing & Personal Hygiene",
  "Dressing & Grooming",
  "Meal Preparation & Feeding",
  "Medication Reminder",
  "Mobility & Transfer Support",
  "Light Housekeeping",
];

function splitTime(timeStr: string): { hour: string; minute: string; period: "AM" | "PM" } {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hour: "12", minute: "00", period: "PM" };
  return {
    hour: String(parseInt(match[1], 10)),
    minute: MINUTES.includes(match[2]) ? match[2] : "00",
    period: match[3].toUpperCase() === "AM" ? "AM" : "PM",
  };
}

export function AddVisitDrawer({
  isOpen,
  onClose,
  client,
  selectedDate,
  editingVisit,
  onSaveVisit,
  onDeleteVisit,
}: AddVisitDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("details");
  const [isExpanded, setIsExpanded] = useState(false);

  // Form states
  const [reason, setReason] = useState("New Schedule Request");
  const [date, setDate] = useState(selectedDate);
  const [startHour, setStartHour] = useState("12");
  const [startMin, setStartMin] = useState("00");
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("PM");

  const [endHour, setEndHour] = useState("1");
  const [endMin, setEndMin] = useState("00");
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("PM");

  const [clockInLocation, setClockInLocation] = useState("Any profile address");
  const [clockOutLocation, setClockOutLocation] = useState("Same as clock in");
  const [caregiverId, setCaregiverId] = useState<string>("unassigned");

  // Service section
  const [isServiceOpen, setIsServiceOpen] = useState(true);
  const [serviceTypeFilter, setServiceTypeFilter] = useState<"All" | "Daily" | "Hourly" | "Fixed">("Hourly");
  const [selectedService, setSelectedService] = useState<ServiceCatalogItem>(SERVICE_CATALOG[0]);

  // Financial / Memo / Care Notes / More
  const [billableRateOverride, setBillableRateOverride] = useState<string>("");
  const [isOvertime, setIsOvertime] = useState(false);
  const [memo, setMemo] = useState("");
  const [careNotes, setCareNotes] = useState("");
  const [selectedAdls, setSelectedAdls] = useState<string[]>([
    "Bathing & Personal Hygiene",
    "Meal Preparation & Feeding",
  ]);
  const [isStandalone, setIsStandalone] = useState(false);
  const [evvRequired, setEvvRequired] = useState(true);
  const [visitStatus, setVisitStatus] = useState<CalendarVisit["status"]>("Scheduled");

  // Caregiver options derived from client's care team + agency roster
  const caregiverOptions = useMemo(() => {
    const list: Array<{ id: string; name: string; role: string }> = [
      { id: "unassigned", name: "Unassigned", role: "Open Shift" },
    ];
    if (client.assignedCareTeam?.primaryCaregiver) {
      list.push({
        id: client.assignedCareTeam.primaryCaregiver.id,
        name: client.assignedCareTeam.primaryCaregiver.name,
        role: "Primary Caregiver",
      });
    }
    if (client.assignedCareTeam?.backupCaregiver) {
      list.push({
        id: client.assignedCareTeam.backupCaregiver.id,
        name: client.assignedCareTeam.backupCaregiver.name,
        role: "Backup Caregiver",
      });
    }
    // Ensure agency caregivers are available for selection
    const defaults = [
      { id: "CG-302", name: "Wilson Martin", role: "W-2 Family / Agency Aide" },
      { id: "CG-305", name: "Sarah Jenkins", role: "Respite Care Specialist" },
      { id: "CG-308", name: "Marcus Chen, RN", role: "Clinical Supervisor" },
    ];
    for (const d of defaults) {
      if (!list.some((c) => c.id === d.id)) {
        list.push(d);
      }
    }
    return list;
  }, [client]);

  // Sync form when opening or switching editingVisit / selectedDate
  useEffect(() => {
    if (!isOpen) return;
    if (editingVisit) {
      setDate(editingVisit.date);
      const s = splitTime(editingVisit.startTime);
      const e = splitTime(editingVisit.endTime);
      setStartHour(s.hour);
      setStartMin(s.minute);
      setStartPeriod(s.period);
      setEndHour(e.hour);
      setEndMin(e.minute);
      setEndPeriod(e.period);
      setCaregiverId(editingVisit.caregiverName === "Unassigned" ? "unassigned" : editingVisit.caregiverId || "unassigned");
      setReason(editingVisit.reasonForModification || "New Schedule Request");
      setClockInLocation(editingVisit.clockInLocation || "Any profile address");
      setClockOutLocation(editingVisit.clockOutLocation || "Same as clock in");
      setMemo(editingVisit.memo || "");
      setCareNotes(editingVisit.careNotes || "");
      setIsStandalone(Boolean(editingVisit.isStandalone));
      setEvvRequired(editingVisit.evvVerified);
      setVisitStatus(editingVisit.status);
      const foundService = SERVICE_CATALOG.find(
        (srv) => srv.name === editingVisit.serviceType || srv.code === editingVisit.serviceType
      );
      if (foundService) {
        setSelectedService(foundService);
        setServiceTypeFilter(foundService.billingType);
      }
      setBillableRateOverride(editingVisit.rate ? String(editingVisit.rate) : "");
    } else {
      setDate(selectedDate);
      setStartHour("12");
      setStartMin("00");
      setStartPeriod("PM");
      setEndHour("1");
      setEndMin("00");
      setEndPeriod("PM");
      setCaregiverId("unassigned");
      setReason("New Schedule Request");
      setClockInLocation("Any profile address");
      setClockOutLocation("Same as clock in");
      setMemo("");
      setCareNotes("");
      setIsStandalone(false);
      setEvvRequired(true);
      setVisitStatus("Scheduled");
      setSelectedService(SERVICE_CATALOG[0]);
      setServiceTypeFilter("Hourly");
      setBillableRateOverride("");
    }
    setActiveTab("details");
  }, [isOpen, editingVisit, selectedDate]);

  const startTimeStr = `${startHour.padStart(2, "0")}:${startMin} ${startPeriod}`;
  const endTimeStr = `${endHour.padStart(2, "0")}:${endMin} ${endPeriod}`;
  const durationLabel = formatDurationLabel(startTimeStr, endTimeStr);
  const durationHours = computeDurationHours(startTimeStr, endTimeStr);

  const filteredServices = useMemo(() => {
    if (serviceTypeFilter === "All") return SERVICE_CATALOG;
    return SERVICE_CATALOG.filter((s) => s.billingType === serviceTypeFilter);
  }, [serviceTypeFilter]);

  const effectiveRate = billableRateOverride
    ? parseFloat(billableRateOverride) || selectedService.rate
    : selectedService.rate;

  const estimatedTotal =
    selectedService.billingType === "Hourly"
      ? effectiveRate * durationHours * (isOvertime ? 1.5 : 1)
      : effectiveRate;

  if (!isOpen) return null;

  const handleRecommendCaregiver = () => {
    const primary = caregiverOptions.find((c) => c.id !== "unassigned");
    if (primary) {
      setCaregiverId(primary.id);
      toast.success(`Recommended ${primary.name} (${primary.role}) based on availability & proximity`);
    }
  };

  const handleSendToCaregivers = () => {
    toast.success("Open shift broadcast sent to eligible caregivers via LiliSare Mobile");
  };

  const handleSave = () => {
    const chosenCaregiver = caregiverOptions.find((c) => c.id === caregiverId);
    const isUnassigned = !chosenCaregiver || chosenCaregiver.id === "unassigned";

    const computedStatus: CalendarVisit["status"] = isStandalone
      ? "Standalone"
      : isUnassigned
        ? "Unassigned"
        : visitStatus === "Unassigned"
          ? "Scheduled"
          : visitStatus;

    const visitPayload: CalendarVisit = {
      id: editingVisit?.id || `VIS-${Date.now().toString().slice(-5)}`,
      title: `${selectedService.code} — ${client.preferredName || client.name}`,
      date,
      startTime: startTimeStr,
      endTime: endTimeStr,
      caregiverName: isUnassigned ? "Unassigned" : chosenCaregiver.name,
      caregiverId: isUnassigned ? "UNASSIGNED" : chosenCaregiver.id,
      serviceType: selectedService.name,
      status: computedStatus,
      evvVerified: evvRequired && !isUnassigned && (computedStatus === "Completed" || computedStatus === "Verified"),
      billingType: selectedService.billingType,
      rate: effectiveRate,
      clockInLocation,
      clockOutLocation,
      reasonForModification: reason,
      memo,
      careNotes: careNotes || selectedAdls.join(", "),
      isStandalone,
    };

    onSaveVisit(visitPayload, Boolean(editingVisit));
  };

  const toggleAdl = (task: string) => {
    setSelectedAdls((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    );
  };

  const drawerTabs: Array<{ id: DrawerTab; label: string; icon: React.ReactNode }> = [
    { id: "details", label: "Details", icon: <CalendarIcon className="w-4 h-4" /> },
    { id: "financial", label: "Financial", icon: <DollarSign className="w-4 h-4" /> },
    { id: "memo", label: "Memo", icon: <StickyNote className="w-4 h-4" /> },
    { id: "care-notes", label: "Care Notes", icon: <FileText className="w-4 h-4" /> },
    { id: "more", label: "More", icon: <MoreHorizontal className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile / Tablet Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-150"
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 lg:static lg:z-auto bg-white border-l border-slate-200 lg:border lg:rounded-2xl shadow-2xl lg:shadow-[0_4px_24px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden transition-all duration-200 ${
          isExpanded
            ? "w-full sm:w-[540px] lg:w-[520px] xl:w-[580px]"
            : "w-full sm:w-[400px] lg:w-[360px] xl:w-[390px]"
        } shrink-0 max-h-screen lg:max-h-[calc(100vh-140px)]`}
        aria-label={editingVisit ? "Edit Visit Panel" : "Add Visit Panel"}
      >
        {/* Top Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {editingVisit ? "Edit Visit" : "Add Visit"}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isExpanded ? "Collapse panel" : "Expand panel"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-lg shadow-sm shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              SAVE
            </button>
          </div>
        </div>

        {/* Sub-Navigation Icon Tabs */}
        <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50/60 shrink-0">
          {drawerTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-1 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-[#3D6B22] text-[#3D6B22] bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60"
                }`}
              >
                {tab.icon}
                <span className="truncate max-w-full">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {/* ===============================================================
              TAB 1: DETAILS
             =============================================================== */}
          {activeTab === "details" && (
            <div className="space-y-4">
              {/* Reason for modification */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Reason for modification
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
                >
                  {MODIFICATION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
                />
              </div>

              {/* Start & End Time + Duration */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/40">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
                      Start
                    </span>
                    <div className="flex items-center gap-1">
                      <select
                        value={startHour}
                        onChange={(e) => setStartHour(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                        aria-label="Start hour"
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="text-slate-400 text-xs">:</span>
                      <select
                        value={startMin}
                        onChange={(e) => setStartMin(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                        aria-label="Start minute"
                      >
                        {MINUTES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={startPeriod}
                        onChange={(e) => setStartPeriod(e.target.value as "AM" | "PM")}
                        className="bg-transparent text-xs font-bold text-[#3D6B22] focus:outline-none cursor-pointer ml-auto"
                        aria-label="Start AM/PM"
                      >
                        {PERIODS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/40">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
                      End
                    </span>
                    <div className="flex items-center gap-1">
                      <select
                        value={endHour}
                        onChange={(e) => setEndHour(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                        aria-label="End hour"
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="text-slate-400 text-xs">:</span>
                      <select
                        value={endMin}
                        onChange={(e) => setEndMin(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                        aria-label="End minute"
                      >
                        {MINUTES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={endPeriod}
                        onChange={(e) => setEndPeriod(e.target.value as "AM" | "PM")}
                        className="bg-transparent text-xs font-bold text-[#3D6B22] focus:outline-none cursor-pointer ml-auto"
                        aria-label="End AM/PM"
                      >
                        {PERIODS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <Clock className="w-3 h-3 text-[#3D6B22]" />
                  <span>DURATION</span>
                  <span className="text-slate-900 bg-emerald-50 border border-[#3D6B22]/20 px-2 py-0.5 rounded-md">
                    {durationLabel}
                  </span>
                </div>
              </div>

              {/* Clock In / Out Locations */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-semibold text-[#3D6B22] block mb-1">
                    Clock In Location
                  </label>
                  <select
                    value={clockInLocation}
                    onChange={(e) => setClockInLocation(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3D6B22]"
                  >
                    {CLOCK_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#3D6B22] block mb-1">
                    Clock Out Location
                  </label>
                  <select
                    value={clockOutLocation}
                    onChange={(e) => setClockOutLocation(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3D6B22]"
                  >
                    <option value="Same as clock in">Same as clock in</option>
                    {CLOCK_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Caregiver Selector + Quick Actions */}
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl border border-[#3D6B22]/30 bg-emerald-50/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#3D6B22] uppercase tracking-wider">
                      Caregiver
                    </span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <select
                    value={caregiverId}
                    onChange={(e) => setCaregiverId(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    {caregiverOptions.map((cg) => (
                      <option key={cg.id} value={cg.id}>
                        {cg.name} {cg.id !== "unassigned" ? `(${cg.role})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleSendToCaregivers}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#3D6B22] hover:text-[#345C1D] hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>SEND TO CAREGIVERS</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRecommendCaregiver}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#3D6B22] hover:text-[#345C1D] hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>RECOMMEND</span>
                  </button>
                </div>
              </div>

              {/* Service Collapsible Section */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setIsServiceOpen((prev) => !prev)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-[#3D6B22]">Service</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#3D6B22] text-white">
                      {selectedService.billingType}
                    </span>
                  </div>
                  {isServiceOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {/* Currently Selected Service Summary */}
                <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-emerald-50/30">
                  <div className="flex items-center gap-2 min-w-0">
                    {selectedService.authorized ? (
                      <ShieldCheck className="w-4 h-4 text-[#3D6B22] shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {selectedService.name}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 shrink-0">
                    ${selectedService.rate.toFixed(2)}
                  </span>
                </div>

                {isServiceOpen && (
                  <div className="p-3 space-y-3">
                    {/* Filter by type */}
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#3D6B22] mb-2">
                        <span>Filter by type</span>
                        <Info className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(["All", "Daily", "Hourly", "Fixed"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setServiceTypeFilter(type)}
                            className={`py-1.5 px-2 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              serviceTypeFilter === type
                                ? "bg-[#3D6B22] text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Services List */}
                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                      {filteredServices.map((srv) => {
                        const isSelected = selectedService.id === srv.id;
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => setSelectedService(srv)}
                            className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                              isSelected
                                ? "bg-emerald-50/70 border-[#3D6B22] ring-1 ring-[#3D6B22]/25"
                                : "bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                            }`}
                          >
                            <div className="flex items-start gap-2 min-w-0">
                              {srv.authorized ? (
                                <ShieldCheck className="w-4 h-4 text-[#3D6B22] shrink-0 mt-0.5" />
                              ) : (
                                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              )}
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-800 leading-snug">
                                  {srv.name}
                                </div>
                                {!srv.authorized && (
                                  <div className="text-[10px] font-medium text-rose-600 mt-0.5">
                                    No authorization found for this service.
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-700 shrink-0">
                              ${srv.rate.toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===============================================================
              TAB 2: FINANCIAL
             =============================================================== */}
          {activeTab === "financial" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-[#3D6B22]/20 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#3D6B22]">
                  Billing & Payer Summary
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {client.authorization?.payer || "State Medicaid Waiver (DHS)"}
                </div>
                <div className="text-[11px] text-slate-600">
                  Auth #: {client.authorization?.authNumber || "AUTH-2026-9812"} · Remaining:{" "}
                  {client.authorization?.unitsRemaining ?? 140} units
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Billable Rate ($ / {selectedService.billingType})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder={selectedService.rate.toFixed(2)}
                    value={billableRateOverride}
                    onChange={(e) => setBillableRateOverride(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#3D6B22]"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Estimated Total
                  </span>
                  <span className="text-sm font-extrabold text-[#3D6B22]">
                    ${estimatedTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Overtime / Holiday Multiplier (1.5x)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Apply premium billing rate for holiday or overtime coverage
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isOvertime}
                  onChange={(e) => setIsOvertime(e.target.checked)}
                  className="w-4 h-4 accent-[#3D6B22] rounded cursor-pointer"
                />
              </label>
            </div>
          )}

          {/* ===============================================================
              TAB 3: MEMO
             =============================================================== */}
          {activeTab === "memo" && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Scheduling Memo & Caregiver Instructions
                </label>
                <textarea
                  rows={5}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Enter gate codes, parking notes, or special shift instructions for the caregiver..."
                  className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] resize-none"
                />
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                Memos are visible to the assigned caregiver in the LiliSare Mobile App prior to clock-in.
              </div>
            </div>
          )}

          {/* ===============================================================
              TAB 4: CARE NOTES
             =============================================================== */}
          {activeTab === "care-notes" && (
            <div className="space-y-3.5">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                  Required ADL Tasks for This Visit
                </span>
                <div className="space-y-1.5">
                  {ADL_TASKS.map((task) => {
                    const checked = selectedAdls.includes(task);
                    return (
                      <button
                        key={task}
                        type="button"
                        onClick={() => toggleAdl(task)}
                        className={`w-full px-3 py-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          checked
                            ? "bg-emerald-50/70 border-[#3D6B22]/30 text-[#3D6B22]"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{task}</span>
                        {checked && <CheckCircle2 className="w-4 h-4 text-[#3D6B22]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Clinical Care Note Prompt
                </label>
                <textarea
                  rows={3}
                  value={careNotes}
                  onChange={(e) => setCareNotes(e.target.value)}
                  placeholder="Specific clinical observations required at clock-out..."
                  className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#3D6B22] resize-none"
                />
              </div>
            </div>
          )}

          {/* ===============================================================
              TAB 5: MORE
             =============================================================== */}
          {activeTab === "more" && (
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Visit Status Override
                </label>
                <select
                  value={visitStatus}
                  onChange={(e) => setVisitStatus(e.target.value as CalendarVisit["status"])}
                  className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3D6B22]"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Verified">Verified</option>
                  <option value="Missed">Missed</option>
                  <option value="Removed">Removed</option>
                </select>
              </div>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Standalone Visit</div>
                  <div className="text-[11px] text-slate-500">
                    One-off visit outside recurring weekly schedule template
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isStandalone}
                  onChange={(e) => setIsStandalone(e.target.checked)}
                  className="w-4 h-4 accent-[#3D6B22] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">EVV GPS Verification Required</div>
                  <div className="text-[11px] text-slate-500">
                    Enforce 21st Century Cures Act geofence clock-in
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={evvRequired}
                  onChange={(e) => setEvvRequired(e.target.checked)}
                  className="w-4 h-4 accent-[#3D6B22] rounded cursor-pointer"
                />
              </label>

              {editingVisit && onDeleteVisit && (
                <button
                  type="button"
                  onClick={() => onDeleteVisit(editingVisit.id)}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Visit from Calendar</span>
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
