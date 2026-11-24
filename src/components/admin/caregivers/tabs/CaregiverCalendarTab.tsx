"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  User,
  ShieldCheck,
  Eye,
  Filter,
  X,
  FileText,
} from "lucide-react";
import { AdminCaregiverProfile } from "@/lib/caregivers/adminCaregiversData";
import { toast } from "sonner";

interface CaregiverCalendarTabProps {
  profile: AdminCaregiverProfile;
  onOpenScheduleModal?: () => void;
}

const WEEKS = [
  "Nov 16 – Nov 22, 2026",
  "Nov 23 – Nov 29, 2026",
  "Nov 30 – Dec 06, 2026",
  "Dec 07 – Dec 13, 2026",
];

export function CaregiverCalendarTab({
  profile,
  onOpenScheduleModal,
}: CaregiverCalendarTabProps) {
  const [weekIndex, setWeekIndex] = useState(1);
  const currentWeek = WEEKS[weekIndex];

  const [selectedShift, setSelectedShift] = useState<{
    id: string;
    client: string;
    clientId: string;
    date: string;
    time: string;
    hours: number;
    service: string;
    status: string;
    evvStatus: string;
    location: string;
  } | null>(null);

  const sampleShifts = [
    {
      id: "SH-101",
      client: profile.assignedPatientsList[0]?.name || "Eleanor Ruth Whitfield",
      clientId: profile.assignedPatientsList[0]?.id || "CL-1002",
      date: "Monday, Nov 24, 2026",
      time: "08:00 AM – 12:00 PM",
      hours: 4.0,
      service: "Personal Care & ADL",
      status: "Scheduled",
      evvStatus: "Pending Clock-In",
      location: "214 Maple Ridge Lane, Brentwood, TN",
    },
    {
      id: "SH-102",
      client: profile.assignedPatientsList[0]?.name || "Eleanor Ruth Whitfield",
      clientId: profile.assignedPatientsList[0]?.id || "CL-1002",
      date: "Wednesday, Nov 26, 2026",
      time: "08:00 AM – 12:00 PM",
      hours: 4.0,
      service: "Personal Care & ADL",
      status: "Scheduled",
      evvStatus: "Authorized GPS",
      location: "214 Maple Ridge Lane, Brentwood, TN",
    },
    {
      id: "SH-103",
      client: profile.assignedPatientsList[1]?.name || "Johnathan Doe",
      clientId: profile.assignedPatientsList[1]?.id || "CL-1004",
      date: "Friday, Nov 28, 2026",
      time: "01:00 PM – 05:00 PM",
      hours: 4.0,
      service: "Homemaker & Meal Prep",
      status: "Scheduled",
      evvStatus: "Pending",
      location: "88 Oak Lane, Brentwood, TN",
    },
  ];

  const handlePrevWeek = () => {
    if (weekIndex > 0) {
      setWeekIndex(weekIndex - 1);
      toast.info(`Switched schedule to ${WEEKS[weekIndex - 1]}`);
    }
  };

  const handleNextWeek = () => {
    if (weekIndex < WEEKS.length - 1) {
      setWeekIndex(weekIndex + 1);
      toast.info(`Switched schedule to ${WEEKS[weekIndex + 1]}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 01. Top Header & Schedule Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Caregiver Shift & Visit Calendar
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Real-time scheduling, EVV verification timestamps, and authorized hours
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevWeek}
              disabled={weekIndex === 0}
              className="p-1.5 hover:bg-white rounded-lg transition-colors cursor-pointer text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 font-mono">
              {currentWeek}
            </span>
            <button
              type="button"
              onClick={handleNextWeek}
              disabled={weekIndex === WEEKS.length - 1}
              className="p-1.5 hover:bg-white rounded-lg transition-colors cursor-pointer text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenScheduleModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Shift</span>
          </button>
        </div>
      </div>

      {/* 02. Weekly Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Scheduled Shifts
          </span>
          <span className="text-lg font-bold text-slate-900 mt-0.5 block">
            {sampleShifts.length} Visits
          </span>
        </div>
        <div className="p-4 bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Committed Hours
          </span>
          <span className="text-lg font-bold text-[#1E5622] mt-0.5 block">
            12.0 hrs
          </span>
        </div>
        <div className="p-4 bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            EVV Compliance
          </span>
          <span className="text-lg font-bold text-emerald-700 mt-0.5 block">
            100% Verified
          </span>
        </div>
        <div className="p-4 bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Assigned Patients
          </span>
          <span className="text-lg font-bold text-slate-900 mt-0.5 block">
            {profile.assignedPatientsList?.length || 2} Clients
          </span>
        </div>
      </div>

      {/* 03. Shifts List / Timeline */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Visits for {currentWeek}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Showing {sampleShifts.length} planned shifts
          </span>
        </div>

        {sampleShifts.map((shift) => {
          const clientInitials = shift.client
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={shift.id}
              onClick={() => setSelectedShift(shift)}
              className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#3D6B22] font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  {clientInitials}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-[#1E5622] transition-colors">
                      {shift.client}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                      {shift.clientId}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {shift.status}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {shift.service}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      {shift.date}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {shift.time} ({shift.hours} hrs)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {shift.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 pl-15 sm:pl-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3D6B22]" />
                  <span>EVV: {shift.evvStatus}</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedShift(shift);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 04. Functional Shift Detail Modal */}
      {selectedShift && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#3D6B22] flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Shift Visit Specification</h3>
                  <p className="text-xs text-slate-500 font-medium">Identifier: {selectedShift.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedShift(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedShift.client} ({selectedShift.clientId})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Assigned Caregiver:</span>
                  <span className="font-bold text-slate-900">{profile.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Scheduled Window:</span>
                  <span className="font-semibold text-slate-800">{selectedShift.date} • {selectedShift.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Service Authorized:</span>
                  <span className="font-semibold text-slate-800">{selectedShift.service} ({selectedShift.hours} hrs)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold text-slate-800">{selectedShift.location}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-slate-700 space-y-1">
                <span className="font-bold text-emerald-900 block">EVV Telephony & GPS Telemetry:</span>
                <p>Status: <span className="font-bold text-emerald-800">{selectedShift.evvStatus}</span>. Real-time geo-fence radius matches patient home coordinates within 45 feet.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  toast.success(`Dispatched shift reminder to ${profile.name}`);
                  setSelectedShift(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs cursor-pointer"
              >
                Send Reminder
              </button>
              <button
                type="button"
                onClick={() => setSelectedShift(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
