"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  ArrowRight,
  Send,
  Sparkles,
  Edit3,
  Star,
  ShieldCheck,
  Award,
  Users,
  CalendarPlus,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Download,
  Plus,
  RotateCcw,
  Check,
  AlertTriangle,
  Folder,
  File,
  Eye,
  FileCheck2,
  User,
  Building,
  Navigation,
} from "lucide-react";
import {
  getAdminCaregiverProfileById,
  AdminCaregiverProfile,
} from "@/lib/caregivers/adminCaregiversData";
import { CaregiverContactModal } from "@/components/caregivers/modals/CaregiverContactModal";
import { CaregiverScheduleShiftModal } from "@/components/caregivers/modals/CaregiverScheduleShiftModal";
import { toast } from "sonner";
import { CaregiverRecord } from "@/types/caregiver";
import { getCaregiversFromStorage, INITIAL_CAREGIVERS } from "@/lib/caregivers/mockData";

interface AdminCaregiverDetailViewProps {
  caregiverId: string;
}

// 7 exact tabs matching the user's attached reference screenshots
type DetailTabType =
  | "overview"
  | "certifications"
  | "availability"
  | "performance"
  | "assigned-patients"
  | "documents"
  | "payroll";

interface TabDef {
  id: DetailTabType;
  label: string;
}

const DETAIL_TABS: TabDef[] = [
  { id: "overview", label: "Overview" },
  { id: "certifications", label: "Certifications" },
  { id: "availability", label: "Availability" },
  { id: "performance", label: "Performance" },
  { id: "assigned-patients", label: "Assigned Patients" },
  { id: "documents", label: "Documents" },
  { id: "payroll", label: "Payroll" },
];

function getStatusBadge(status: AdminCaregiverProfile["status"]) {
  switch (status) {
    case "Active":
      return { bg: "bg-emerald-500", label: "Active" };
    case "Onboarding":
      return { bg: "bg-purple-600", label: "Onboarding" };
    case "On Hold":
      return { bg: "bg-amber-500", label: "On Hold" };
    case "Inactive":
    default:
      return { bg: "bg-slate-500", label: "Inactive" };
  }
}

export function AdminCaregiverDetailView({ caregiverId }: AdminCaregiverDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DetailTabType>("overview");
  const [profile, setProfile] = useState<AdminCaregiverProfile | null>(null);
  const [rawRecord, setRawRecord] = useState<CaregiverRecord | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Load consistent caregiver profile by ID
  useEffect(() => {
    setIsMounted(true);
    const loadedProfile = getAdminCaregiverProfileById(caregiverId);
    setProfile(loadedProfile);

    // Also look up raw record for modal compatibility
    const all = getCaregiversFromStorage();
    let found = all.find((c) => c.id.toLowerCase() === caregiverId.toLowerCase());
    if (!found) {
      found =
        INITIAL_CAREGIVERS.find((c) => c.id.toLowerCase() === caregiverId.toLowerCase()) ||
        INITIAL_CAREGIVERS[0];
    }
    setRawRecord(found);
  }, [caregiverId]);

  if (!isMounted || !profile) {
    return (
      <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">Loading Caregiver Profile...</p>
      </div>
    );
  }

  const initials = profile.name
    .replace(/^The\s+/i, "")
    .slice(0, 2)
    .toUpperCase();

  const statusBadge = getStatusBadge(profile.status);

  // Helper callbacks
  const handleLogCommunication = (
    _id: string,
    type: "call" | "email" | "note",
    noteText: string
  ) => {
    toast.success(`Communication logged: ${type.toUpperCase()} recorded for ${profile.name}`);
  };

  const handleScheduleShift = (
    _id: string,
    shift: { clientName: string; date: string; startTime: string; endTime: string }
  ) => {
    toast.success(`Shift scheduled for ${shift.clientName} with ${profile.name} on ${shift.date}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-16 animate-in fade-in duration-200">
      {/* 01. Back Navigation Link */}
      <div>
        <Link
          href="/admin/caregivers"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Caregivers Directory</span>
        </Link>
      </div>

      {/* 02. Caregiver Hero Identity Card (Consistent with List/Grid Roster) */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar Box with Initials & Dynamic Status Badge */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20 flex items-center justify-center text-xl font-bold">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs border-2 border-white ${statusBadge.bg}`}
              >
                {statusBadge.label}
              </span>
            </div>
          </div>

          {/* Heading & Meta Subtitle */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
              {profile.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{profile.role}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{profile.rating.toFixed(1)} Rating</span>
              </span>
              <span>•</span>
              <span>{profile.tenure}</span>
              <span>•</span>
              <span className="font-semibold text-slate-600">{profile.branch}</span>
            </div>

            {/* Contact Details Row */}
            <div className="flex items-center gap-4 flex-wrap text-xs text-slate-600 mt-2">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.phone}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.email}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#1B3414] hover:bg-[#274C1D] rounded-xl shadow-md shadow-[#1B3414]/20 transition-all cursor-pointer active:scale-95"
          >
            <CalendarPlus className="w-4 h-4 text-[#93C573]" />
            <span>Schedule Shift</span>
          </button>

          <button
            type="button"
            onClick={() => setIsContactModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>Send Message</span>
          </button>

          <Link
            href={`/admin/caregivers/${profile.id}/edit`}
            className="p-2.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
            title="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 03. 7 Clean and Simple Pill Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-2xs gap-1">
          {DETAIL_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all whitespace-nowrap cursor-pointer ${isActive
                    ? "bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/30 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW (Consistent with List/Grid Data)
         ========================================================================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {/* Left 2 Columns */}
          <div className="lg:col-span-2 space-y-5">
            {/* Contact & Personal + Employment Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Contact & Personal Card */}
              <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Contact & Personal
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Phone</span>
                    <span className="text-slate-800 font-semibold">{profile.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Email</span>
                    <span className="text-slate-800 font-semibold">{profile.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Address</span>
                    <span className="text-slate-800 font-semibold">{profile.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Emergency Contact</span>
                    <span className="text-slate-800 font-semibold">{profile.emergencyContact}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Languages Spoken</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {profile.languages.map((lang) => (
                        <span
                          key={lang}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Details Card */}
              <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Employment Details
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Hire Date</span>
                    <span className="text-slate-800 font-semibold">{profile.hireDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Employment Type</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] font-bold text-[11px] border border-emerald-200/80">
                      {profile.employmentType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Pay Rate</span>
                    <span className="text-slate-800 font-bold">{profile.payRate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Assigned Patients</span>
                    <span className="text-slate-800 font-bold">
                      {profile.activePatients}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Assigned Branch</span>
                    <span className="text-slate-800 font-semibold">{profile.branch}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Specializations Card */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Skills & Specializations
              </h3>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {profile.skills.map((skill, index) => {
                  const colors = [
                    "bg-rose-50 text-rose-700 border-rose-200/80",
                    "bg-sky-50 text-sky-700 border-sky-200/80",
                    "bg-purple-50 text-purple-700 border-purple-200/80",
                    "bg-pink-50 text-pink-700 border-pink-200/80",
                    "bg-emerald-50 text-emerald-700 border-emerald-200/80",
                    "bg-amber-50 text-amber-700 border-amber-200/80",
                  ];
                  const colorClass = colors[index % colors.length];
                  return (
                    <span
                      key={skill}
                      className={`px-3 py-1 rounded-full font-semibold border ${colorClass}`}
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity Timeline Card */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Recent Activity
              </h3>
              <div className="space-y-3.5">
                {profile.recentActivity.map((act) => (
                  <div key={act.title} className="flex items-start gap-3 text-xs">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${act.type === "shift"
                          ? "bg-emerald-500"
                          : act.type === "schedule"
                            ? "bg-amber-500"
                            : "bg-purple-500"
                        }`}
                    />
                    <div>
                      <p className="font-bold text-slate-900">{act.title}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Compliance Snapshot & Background Checks */}
          <div className="space-y-5">
            {/* Compliance Snapshot (Adapts to caregiver's actual complianceRate) */}
            <div className="bg-[#111827] text-white rounded-xl lg:rounded-2xl p-6 shadow-md border border-slate-800 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Compliance Snapshot
              </h3>

              <div className="flex items-center gap-4">
                {/* Circular ring */}
                <div
                  className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center shrink-0 ${profile.complianceRate >= 90
                      ? "border-emerald-500/30 text-emerald-400"
                      : profile.complianceRate >= 70
                        ? "border-amber-500/30 text-amber-400"
                        : "border-rose-500/30 text-rose-400"
                    }`}
                >
                  <div className="text-center">
                    <span className="text-lg font-extrabold text-white">
                      {profile.complianceRate}%
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Overall Score</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {profile.complianceRate === 100
                      ? "Fully compliant and up to date."
                      : profile.complianceRate >= 70
                        ? "Near compliance • Review required."
                        : "Action required • Incomplete documents."}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${profile.complianceRate >= 70
                          ? "text-emerald-400"
                          : "text-amber-400"
                        }`}
                    />
                    <span className="font-medium text-slate-200">Background Check</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {profile.complianceRate >= 70
                      ? "Cleared • Renew 2027"
                      : "Pending Live-Scan Review"}
                  </span>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${profile.complianceRate >= 90
                          ? "text-emerald-400"
                          : "text-rose-400"
                        }`}
                    />
                    <span className="font-medium text-slate-200">TB Screening</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {profile.complianceRate >= 90
                      ? "Negative • Renew Dec 2026"
                      : "Annual Screen Due"}
                  </span>
                </div>
              </div>
            </div>

            {/* Background & Screening Card */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#3D6B22]" />
                  <span>Background & Screening</span>
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    toast.success("Screening checks re-verified with state registries.")
                  }
                  className="text-xs font-semibold text-[#3D6B22] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Run Checks</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Check 1 */}
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Criminal Background Check</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Provider: Checkr • Last run: Jul 15, 2026
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Clear
                  </span>
                </div>

                {/* Check 2 */}
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">OIG/SAM Exclusion List</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Monthly Medicaid Requirement
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Pending
                  </span>
                </div>

                {/* Check 3 */}
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">State Nurse Aide Registry</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Automated Sync</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CERTIFICATIONS (Consistent with caregiver clinical role)
         ========================================================================= */}
      {activeTab === "certifications" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Certifications & Credentials
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active licenses, CPR cards, and clinical credentials for {profile.name}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Redirecting to LiliSare Training & Compliance Center")}
              className="text-xs font-bold text-[#3D6B22] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Training Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Licenses Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary License matching caregiver role */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{profile.licenseName}</h4>
                  <p className="text-xs text-slate-500 font-medium">{profile.licenseIssuer}</p>
                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <p>
                      License #: <span className="font-semibold text-slate-800">{profile.licenseNumber}</span>
                    </p>
                    <p>
                      Expires: <span className="font-semibold text-slate-800">{profile.licenseExpires}</span>
                    </p>
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active
              </span>
            </div>

            {/* CPR / First Aid Card */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">BLS/CPR & First Aid</h4>
                  <p className="text-xs text-slate-500 font-medium">American Heart Association</p>
                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <p>
                      Issued: <span className="font-semibold text-slate-800">2025-01-10</span>
                    </p>
                    <p>
                      Expires: <span className="font-semibold text-slate-800">{profile.licenseExpires}</span>
                    </p>
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active
              </span>
            </div>
          </div>

          {/* Policy & Regulatory Acknowledgments Section */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Policy & Regulatory Acknowledgments
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Staff compliance checklist for required agency policies and codes of conduct.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  1 Overdue
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  4 / 5 Signed
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">Agency Code of Conduct</span>
                    <span className="text-slate-400 ml-2">v3.2 • Corporate Governance</span>
                    <p className="text-[11px] text-emerald-600 mt-0.5">✓ Signed on Jul 21, 2025</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("Opening signed copy")}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Signed Copy</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">HIPAA Privacy & Security Policy</span>
                    <span className="text-slate-400 ml-2">v4.1 • Regulatory Compliance</span>
                    <p className="text-[11px] text-emerald-600 mt-0.5">✓ Signed on Jul 21, 2025</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("Opening signed copy")}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Signed Copy</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/30 border border-rose-200/80">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">
                      Emergency Response & Evacuation Plan
                    </span>
                    <span className="text-slate-400 ml-2">v2.0 • Safety & Emergency</span>
                    <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
                      ⚠️ Overdue (Required by Jul 10, 2026)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast.success(`Signature reminder email & SMS sent to ${profile.name}`)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B3414] hover:bg-[#274C1D] text-white font-bold cursor-pointer transition-all"
                >
                  <Send className="w-3 h-3 text-[#93C573]" />
                  <span>Send Signature Reminder</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">
                      Infection Prevention & PPE Protocol
                    </span>
                    <span className="text-slate-400 ml-2">v3.0 • Clinical Protocols</span>
                    <p className="text-[11px] text-emerald-600 mt-0.5">✓ Signed on May 06, 2025</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("Opening signed copy")}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Signed Copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: AVAILABILITY
         ========================================================================= */}
      {activeTab === "availability" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Weekly Availability Grid
                </h3>
                <button
                  type="button"
                  onClick={() => toast.info("Opening availability editor")}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs cursor-pointer"
                >
                  Edit Availability
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 text-left font-bold text-slate-600">Shift</th>
                      <th className="py-2.5 px-2">Mon</th>
                      <th className="py-2.5 px-2">Tue</th>
                      <th className="py-2.5 px-2">Wed</th>
                      <th className="py-2.5 px-2">Thu</th>
                      <th className="py-2.5 px-2">Fri</th>
                      <th className="py-2.5 px-2">Sat</th>
                      <th className="py-2.5 px-2">Sun</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 text-left font-semibold text-slate-700">
                        Morning (6am–2pm)
                      </td>
                      <td className="py-3"><div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">✓</div></td>
                      <td className="py-3"><div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">✓</div></td>
                      <td className="py-3"><div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">✓</div></td>
                      <td className="py-3"><div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">✓</div></td>
                      <td className="py-3"><div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">✓</div></td>
                      <td className="py-3 text-slate-300 font-medium">—</td>
                      <td className="py-3 text-slate-300 font-medium">—</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-left font-semibold text-slate-700">
                        Afternoon (2pm–10pm)
                      </td>
                      <td className="py-3"><div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">✓</div></td>
                      <td className="py-3"><div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">✓</div></td>
                      <td className="py-3"><div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">✓</div></td>
                      <td className="py-3"><div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">✓</div></td>
                      <td className="py-3"><div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">✓</div></td>
                      <td className="py-3 text-slate-300 font-medium">—</td>
                      <td className="py-3 text-slate-300 font-medium">—</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-left font-semibold text-slate-700">
                        Night (10pm–6am)
                      </td>
                      <td className="py-3 text-slate-300 font-medium">—</td>
                      <td className="py-3 text-slate-300 font-medium">—</td>
                      <td className="py-3 text-slate-300 font-medium">—</td>
                      <td className="py-3 text-slate-300 font-medium">—</td>
                      <td className="py-3 text-slate-300 font-medium">—</td>
                      <td className="py-3"><div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">✓</div></td>
                      <td className="py-3 text-slate-300 font-medium">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center">
                    ✓
                  </span>
                  <span>Available</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-slate-300 font-bold">—</span>
                  <span>Unavailable</span>
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Preferred Zones & Regions
              </h3>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-[#1E5622] font-semibold border border-emerald-200">
                  <Navigation className="w-3 h-3" />
                  <span>{profile.branch}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-[#1E5622] font-semibold border border-emerald-200">
                  <Navigation className="w-3 h-3" />
                  <span>Downtown Metro</span>
                </span>
                <button
                  type="button"
                  onClick={() => toast.info("Add region modal")}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-slate-600 font-semibold border border-dashed border-slate-300 hover:border-slate-400 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Region</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Upcoming Shifts
                </h3>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="text-xs font-semibold text-[#3D6B22] hover:underline cursor-pointer"
                >
                  Schedule New
                </button>
              </div>

              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No upcoming shifts scheduled.
              </div>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Time-Off Requests
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Aug 15 - Aug 20, 2026</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Vacation</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Pending
                  </span>
                </div>

                <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Jun 05, 2026</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Personal Day</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Approved
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PERFORMANCE
         ========================================================================= */}
      {activeTab === "performance" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1B3414] text-white rounded-xl lg:rounded-2xl p-5 shadow-sm space-y-1">
              <p className="text-xs font-semibold text-emerald-300">Overall Rating</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold">{profile.rating.toFixed(1)}</span>
                <span className="text-xs text-white/70">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 pt-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
              <p className="text-xs font-semibold text-slate-500">Punctuality</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">98.5%</p>
              <p className="text-[11px] text-emerald-600 font-semibold pt-1">
                ~* +1.2% this month
              </p>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
              <p className="text-xs font-semibold text-slate-500">Care Quality (Patient)</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                {profile.rating.toFixed(1)}/5
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold pt-1">
                ~* +0.1 vs agency avg
              </p>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
              <p className="text-xs font-semibold text-slate-500">Communication</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">4.7/5</p>
              <p className="text-[11px] text-slate-400 font-medium pt-1">
                Consistent with last month
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Performance Trend
              </h3>
              <div className="h-44 w-full flex flex-col justify-end">
                <svg className="w-full h-32 overflow-visible" viewBox="0 0 500 120">
                  <defs>
                    <linearGradient id="gradientTrendAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3D6B22" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3D6B22" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 20 80 Q 100 70, 180 65 T 340 55 T 480 30 L 480 120 L 20 120 Z"
                    fill="url(#gradientTrendAdmin)"
                  />
                  <path
                    d="M 20 80 Q 100 70, 180 65 T 340 55 T 480 30"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />
                  <circle cx="480" cy="30" r="4" fill="#10b981" />
                </svg>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Recent Patient Feedback
                </h3>
                <button
                  type="button"
                  onClick={() => toast.info("Opening all patient reviews")}
                  className="text-xs font-semibold text-[#3D6B22] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </div>
                    <span className="text-[11px] text-slate-400">2 days ago</span>
                  </div>
                  <p className="text-slate-700 italic">
                    &quot;{profile.name} is wonderful with my family. Always patient, courteous, and on time.&quot;
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500">
                    — Family of Client
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Incident History
            </h3>
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <ShieldCheck className="w-7 h-7 mx-auto text-slate-300" />
              <p>No incidents reported for this caregiver.</p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: ASSIGNED PATIENTS (Matches directory activePatients exactly)
         ========================================================================= */}
      {activeTab === "assigned-patients" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Assigned Patients ({profile.activePatients})
            </h2>
            <Link
              href="/admin/clients"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1B3414] hover:bg-[#274C1D] rounded-xl shadow-md shadow-[#1B3414]/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#93C573]" />
              <span>Assign Patient</span>
            </Link>
          </div>

          {/* If caregiver has assigned patients */}
          {profile.assignedPatientsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {profile.assignedPatientsList.map((pt) => (
                <div
                  key={pt.id}
                  className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-3.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E8F2E4] text-[#1E5622] font-bold text-xs flex items-center justify-center shrink-0">
                        {pt.avatarInitials}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{pt.name}</h4>
                        <p className="text-xs text-slate-500">{pt.address}</p>
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Schedule:</span>
                        <span className="font-semibold text-slate-800">{pt.schedule}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Risk Level:</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${pt.riskLevel === "High"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                        >
                          {pt.riskLevel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Since:</span>
                        <span className="font-semibold text-slate-800">{pt.since}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/admin/clients/${pt.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3D6B22] hover:text-[#274C1D] hover:underline pt-2 border-t border-slate-100"
                  >
                    <span>View Patient Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            /* Clean Onboarding / Empty State for caregivers without active patients */
            <div className="bg-white rounded-xl lg:rounded-2xl p-8 border border-slate-200 shadow-2xs text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                No Patients Assigned ({profile.status})
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {profile.name} is currently in {profile.status} status. Patients can be linked once credential onboarding and scheduling authorizations are completed.
              </p>
              <Link
                href="/admin/clients"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#1E5622] bg-[#E8F2E4] hover:bg-[#d8ebd0] rounded-xl transition-all"
              >
                <span>Browse Client Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Visit History Summary Card */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Visit History Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl">
                <p className="text-xs font-medium text-slate-500">Total Visits Completed</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {profile.activePatients > 0 ? "142" : "0"}
                </p>
              </div>

              <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                <p className="text-xs font-medium text-emerald-800">On-Time Arrival Rate</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {profile.activePatients > 0 ? "98%" : "N/A"}
                </p>
              </div>

              <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl">
                <p className="text-xs font-medium text-slate-500">Missed/Cancelled</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {profile.activePatients > 0 ? "3" : "0"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">In the last 90 days</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: DOCUMENTS
         ========================================================================= */}
      {activeTab === "documents" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Caregiver Documents
            </h2>
            <button
              type="button"
              onClick={() => toast.info("Opening document upload dialog")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1B3414] hover:bg-[#274C1D] rounded-xl shadow-md shadow-[#1B3414]/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#93C573]" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Folder className="w-4 h-4 text-emerald-600" />
                <span>Onboarding & Contracts</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <FileText className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      Employment_Agreement_Signed.pdf
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Jan 15, 2023 • 2.4 MB</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <FileText className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      Code_of_Conduct_Ack.pdf
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Jan 16, 2023 • 1.1 MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Folder className="w-4 h-4 text-emerald-600" />
                <span>Tax & Financial</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <FileText className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">W4_2026.pdf</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Jan 05, 2026 • 0.8 MB</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <FileText className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      Direct_Deposit_Form.pdf
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Jan 15, 2023 • 1.2 MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Folder className="w-4 h-4 text-emerald-600" />
                <span>Licenses & Identifications</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <File className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {profile.licenseName.replace(/\s+/g, "_")}.pdf
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">May 02, 2022 • 3.5 MB</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <FileText className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">Driver_License.pdf</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Jan 15, 2023 • 1.5 MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: PAYROLL (Matches caregiver specific hours and pay rate)
         ========================================================================= */}
      {activeTab === "payroll" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111827] text-white rounded-xl lg:rounded-2xl p-5 shadow-sm space-y-1 relative overflow-hidden">
              <DollarSign className="absolute -right-2 -bottom-2 w-24 h-24 text-slate-800/60 pointer-events-none" />
              <p className="text-xs font-semibold text-slate-400">Current Period Earnings</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {profile.payroll.periodEarnings}
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold pt-1">
                Rate: {profile.payRate} • {profile.employmentType}
              </p>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-sky-600 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Hours (Current Period)</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                {profile.payroll.hours} <span className="text-sm font-semibold text-slate-400">hrs</span>
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Regular: {profile.payroll.regularHours} hrs • Overtime: {profile.payroll.overtimeHours} hrs
              </p>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Next Pay Date</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                {profile.payroll.nextPayDate}
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Direct deposit to account ending in 1234
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Recent Pay Stubs
                </h3>
                <button
                  type="button"
                  onClick={() => toast.info("Opening all pay stubs")}
                  className="text-xs font-semibold text-[#3D6B22] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="font-bold text-slate-900">Jul 01 - Jul 15, 2026</p>
                      <p className="text-[11px] text-slate-400">Paid on Jul 20, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-extrabold text-slate-900">{profile.payroll.periodEarnings}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                        Processing
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success("Downloading pay stub PDF")}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="font-bold text-slate-900">Jun 16 - Jun 30, 2026</p>
                      <p className="text-[11px] text-slate-400">Paid on Jul 05, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-extrabold text-slate-900">$1,320.50</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        Paid
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success("Downloading pay stub PDF")}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Mileage Log
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-400 font-medium">
                    <span>Date / Route</span>
                    <span>Miles / Reimb.</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="font-bold text-slate-800">Jul 14</p>
                      <p className="text-[11px] text-slate-500">Patient A to Patient B</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">12.5 Miles</p>
                      <p className="text-[11px] text-emerald-600 font-semibold">$8.12</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Bonuses & Adjustments
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <div>
                      <p className="font-bold text-slate-900">Weekend Shift Premium</p>
                      <p className="text-[11px] text-slate-500">Jul 11, 2026</p>
                    </div>
                    <span className="font-bold text-emerald-700">+$50.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals for Shift Scheduling and Communication */}
      {rawRecord && (
        <>
          <CaregiverContactModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            caregiver={rawRecord}
            onLogCommunication={handleLogCommunication}
          />

          <CaregiverScheduleShiftModal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            caregiver={rawRecord}
            onScheduleShift={handleScheduleShift}
          />
        </>
      )}
    </div>
  );
}
