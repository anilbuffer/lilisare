"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Home,
  ShieldCheck,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Send,
  Sparkles,
  RefreshCw,
  Edit3,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Award,
  Users,
  CalendarPlus,
  Globe,
  Heart,
  HeartHandshake,
  Trash2,
} from "lucide-react";
import { CaregiverRecord, CaregiverPipelineStage, CaregiverStatus } from "@/types/caregiver";
import {
  getCaregiversFromStorage,
  saveCaregiversToStorage,
  INITIAL_CAREGIVERS,
} from "@/lib/caregivers/mockData";
import { deleteCaregiverFromStorage } from "@/lib/intake/intakeSync";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";
import { Modal } from "@/components/ui/Modal";
import {
  EIGHT_CAREGIVER_KANBAN_STAGES,
  normalizeCaregiverStage,
} from "./CaregiverManagementWorkspace";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ResponsiveDomainTabStrip } from "@/components/ui/ResponsiveDomainTabStrip";
import { toast } from "sonner";
import { CaregiverContactModal } from "./modals/CaregiverContactModal";
import { CaregiverScheduleShiftModal } from "./modals/CaregiverScheduleShiftModal";

interface CaregiverDetailViewProps {
  caregiverId: string;
  baseBackPath?: string;
}

const STAGE_SOLID_BG: Record<string, string> = {
  "New Application": "bg-rose-500",
  "Phone Screened": "bg-amber-500",
  "Interview Scheduled": "bg-purple-500",
  "Training": "bg-blue-600",
  "Hiring Decision": "bg-sky-600",
  "Offer Extended": "bg-teal-600",
  "Hired & Onboarding": "bg-[#3D6B22]",
  "Archived": "bg-slate-500",
};

export function CaregiverDetailView({
  caregiverId,
  baseBackPath = "/caregivers",
}: CaregiverDetailViewProps) {
  const router = useRouter();
  const perms = usePortalPermissions();
  const [caregiver, setCaregiver] = useState<CaregiverRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "household" | "credentials" | "evv" | "timeline"
  >("overview");
  const [showMaskedSsn, setShowMaskedSsn] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const all = getCaregiversFromStorage();
    let found = all.find((c) => c.id.toLowerCase() === caregiverId.toLowerCase());
    if (!found) {
      found =
        INITIAL_CAREGIVERS.find((c) => c.id.toLowerCase() === caregiverId.toLowerCase()) ||
        INITIAL_CAREGIVERS[0];
    }
    setCaregiver(found);
  }, [caregiverId]);

  if (!isMounted || !caregiver) {
    return (
      <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
        <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">Loading Caregiver Profile...</p>
      </div>
    );
  }

  const currentStage = normalizeCaregiverStage(caregiver);
  const solidBg = STAGE_SOLID_BG[currentStage] || "bg-[#3D6B22]";

  const handleStageChange = (newStage: CaregiverPipelineStage) => {
    if ((newStage === "Hired & Onboarding" || newStage === "Archived") && !perms.caregivers.canActivate) {
      toast.error("Caregiver activation and archiving require Agency Admin approval.");
      setIsStatusDropdownOpen(false);
      return;
    }

    let newStatus: CaregiverStatus = caregiver.status;
    if (newStage === "Hired & Onboarding") newStatus = "Active";
    else if (newStage === "Archived") newStatus = "Inactive";
    else if (newStage === "Training") newStatus = "Onboarding";
    else if (newStage === "New Application" || newStage === "Phone Screened") newStatus = "Pending";

    const updated: CaregiverRecord = {
      ...caregiver,
      pipelineStage: newStage,
      status: newStatus,
      activityHistory: {
        ...caregiver.activityHistory,
        recentUpdates: [
          {
            id: `ACT-${Date.now()}`,
            timestamp: new Date().toISOString(),
            relativeTime: "Just now",
            title: `Pipeline Stage Updated to "${newStage}"`,
            description: `Caregiver candidate progressed to stage "${newStage}".`,
            actor: perms.actorName,
            type: "profile" as const,
          },
          ...caregiver.activityHistory.recentUpdates,
        ],
      },
    };

    setCaregiver(updated);
    setIsStatusDropdownOpen(false);

    const all = getCaregiversFromStorage();
    const index = all.findIndex((c) => c.id === caregiver.id);
    if (index !== -1) {
      all[index] = updated;
      saveCaregiversToStorage(all);
    }

    toast.success(`Pipeline stage updated to "${newStage}"`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newLog = {
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      relativeTime: "Just now",
      title: "Staff Coordination Note Added",
      description: newNote.trim(),
      actor: "HR Coordinator",
      type: "profile" as const,
    };

    const updated: CaregiverRecord = {
      ...caregiver,
      activityHistory: {
        ...caregiver.activityHistory,
        recentUpdates: [newLog, ...caregiver.activityHistory.recentUpdates],
      },
    };

    setCaregiver(updated);
    setNewNote("");

    const all = getCaregiversFromStorage();
    const index = all.findIndex((c) => c.id === caregiver.id);
    if (index !== -1) {
      all[index] = updated;
      saveCaregiversToStorage(all);
    }

    toast.success("Caregiver note logged to timeline");
  };

  const handleLogCommunication = (
    _id: string,
    type: "call" | "email" | "note",
    noteText: string
  ) => {
    const newLog = {
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      relativeTime: "Just now",
      title:
        type === "call"
          ? "Phone Contact Logged"
          : type === "email"
            ? "Email Sent to Caregiver"
            : "Communication Note Added",
      description: noteText,
      actor: "HR Coordinator",
      type: "profile" as const,
    };

    const updated: CaregiverRecord = {
      ...caregiver,
      activityHistory: {
        ...caregiver.activityHistory,
        recentUpdates: [newLog, ...caregiver.activityHistory.recentUpdates],
      },
    };

    setCaregiver(updated);

    const all = getCaregiversFromStorage();
    const index = all.findIndex((c) => c.id === caregiver.id);
    if (index !== -1) {
      all[index] = updated;
      saveCaregiversToStorage(all);
    }
  };

  const handleScheduleShift = (
    _id: string,
    shift: {
      clientName: string;
      date: string;
      startTime: string;
      endTime: string;
      type: string;
      notes: string;
    }
  ) => {
    const newLog = {
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      relativeTime: "Just now",
      title: `Care Shift Scheduled with ${shift.clientName}`,
      description: `${shift.date} from ${shift.startTime} to ${shift.endTime} (${shift.type}). Notes: ${shift.notes}`,
      actor: "Staff Scheduler",
      type: "assignment" as const,
    };

    const updated: CaregiverRecord = {
      ...caregiver,
      activityHistory: {
        ...caregiver.activityHistory,
        recentUpdates: [newLog, ...caregiver.activityHistory.recentUpdates],
      },
    };

    setCaregiver(updated);

    const all = getCaregiversFromStorage();
    const index = all.findIndex((c) => c.id === caregiver.id);
    if (index !== -1) {
      all[index] = updated;
      saveCaregiversToStorage(all);
    }
  };

  const tabs = [
    { id: "overview" as const, label: "Overview & Profile", icon: User },
    { id: "household" as const, label: "Household & Assignments", icon: Home },
    { id: "credentials" as const, label: "Credentials & Screening", icon: ShieldCheck },
    { id: "evv" as const, label: "EVV & Visit History", icon: Calendar },
    { id: "timeline" as const, label: "Timeline & Activity Notes", icon: Clock },
  ];

  const caregiverInitials = caregiver.name
    .replace(/^The\s+/i, "")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full max-w-9xl mx-auto space-y-4 pb-16 animate-in fade-in duration-300">
      {/* Back Navigation Button matching /intake/pipeline */}
      <div>
        <Link
          href={baseBackPath}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Caregivers Directory</span>
        </Link>
      </div>

      {/* 01. PatientHeader Style: Hero Identity & Actions Card (Identical to /intake/pipeline/INQ-1042/) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
          {/* Avatar Box with Floating Stage Badge */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center text-xl font-bold overflow-hidden">
              {caregiver.avatarUrl ? (
                <img
                  src={caregiver.avatarUrl}
                  alt={caregiver.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                caregiverInitials
              )}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <span
                className={`border-2 border-white shadow-xs font-medium text-white whitespace-nowrap px-2 py-0.5 text-[10px] rounded-full tracking-wide ${solidBg}`}
              >
                {currentStage}
              </span>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-1 truncate sm:overflow-visible sm:whitespace-normal">
              {caregiver.name}
            </h1>

            {/* Metadata Line */}
            <p className="text-xs text-slate-600">
              Household:{" "}
              <strong className="text-slate-800 font-semibold">
                {caregiver.relationship?.linkedHousehold?.name || "Unlinked Household"}
              </strong>
            </p>
          </div>
        </div>

        {/* Primary Action Control */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Primary CTA: Edit Profile */}
          <Link
            href={`${baseBackPath}/${caregiver.id}/edit`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <span>Edit Profile</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </Link>
        </div>
      </div>

      {/* 01b. Secondary Caregiver Actions Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Caregiver Quick Actions</h2>
          <p className="text-xs text-slate-500 mt-0.5">Schedule shifts or manage caregiver record lifecycle</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-sky-700" />
            <span>Schedule Shift</span>
          </button>

          {perms.caregivers.canDelete && (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* 02. Space-Aware Responsive Tab Strip (Auto-Collapsing "More" Dropdown) */}
      <ResponsiveDomainTabStrip
        tabs={tabs.map((t) => ({ id: t.id, label: t.label }))}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        ariaLabel="Caregiver details navigation"
      />

      {/* 03. Tab Content Modules */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {/* Left Column (2 cols): Profile & Assignment Demographics */}
          <div className="lg:col-span-2 space-y-5">
            {/* Personal Profile & Demographics Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#3D6B22]" />
                  Caregiver Personal Profile & Contact
                </h3>
                <div className="flex items-center gap-2">
                  <span className=" text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {caregiver.id}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                    {caregiver.type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Full Legal Name
                  </span>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {caregiver.name}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Preferred Name
                  </span>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {caregiver.personalInfo.preferredName || caregiver.name}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Date of Birth & Gender
                  </span>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {caregiver.personalInfo.dob} · {caregiver.personalInfo.gender}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Languages Spoken
                  </span>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {caregiver.personalInfo.languages.join(", ")}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Direct Telephone
                  </span>
                  <a
                    href={`tel:${caregiver.personalInfo.phone}`}
                    className="text-sm font-semibold text-[#3D6B22] hover:underline flex items-center gap-1.5 mt-0.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {caregiver.personalInfo.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${caregiver.personalInfo.email}`}
                    className="text-sm font-semibold text-[#3D6B22] hover:underline flex items-center gap-1.5 mt-0.5 truncate"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {caregiver.personalInfo.email}
                  </a>
                </div>
              </div>

              {/* Residence & Branch */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Primary Residence
                  </span>
                  <p className="text-xs font-medium text-slate-700 flex items-start gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {caregiver.personalInfo.address.street},{" "}
                      {caregiver.personalInfo.address.city},{" "}
                      {caregiver.personalInfo.address.state}{" "}
                      {caregiver.personalInfo.address.zip}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Assigned Service Branch
                  </span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {caregiver.branch} Branch (Hire: {caregiver.hireDate})
                  </p>
                </div>
              </div>

              {/* Masked Identifiers */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-xs">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Encrypted Tax & Identity Records
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMaskedSsn(!showMaskedSsn)}
                    className="text-[11px] font-semibold text-[#3D6B22] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showMaskedSsn ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                    <span>{showMaskedSsn ? "Hide Identifiers" : "Show Identifiers"}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                      SSN Masked
                    </span>
                    <span className=" text-xs text-slate-800 font-bold">
                      {showMaskedSsn
                        ? "123-45-6789"
                        : caregiver.personalInfo.maskedIdentifiers.ssnMasked}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                      Driver&apos;s License
                    </span>
                    <span className=" text-xs text-slate-800 font-bold">
                      {caregiver.personalInfo.maskedIdentifiers.driversLicenseMasked}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                      TIN / W-9 Status
                    </span>
                    <span className=" text-xs text-slate-800 font-bold">
                      {caregiver.personalInfo.maskedIdentifiers.taxIdMasked}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Care Recipient & Assignment Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#3D6B22]" />
                  Care Recipient & Work Assignment
                </h3>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#1E5622] border border-emerald-200/70">
                  {caregiver.employmentClassification}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-4">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Assigned Care Recipient
                  </span>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {caregiver.availabilityAssignments.assignedClient
                      ? caregiver.availabilityAssignments.assignedClient.name
                      : "Unassigned (Available)"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Relationship to Client
                  </span>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {caregiver.relationship.relationshipToClient}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Authorized Hours / Week
                  </span>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {caregiver.availabilityAssignments.weeklyCapacityHours} hrs/wk
                  </span>
                </div>
              </div>

              {/* Boundaries & Schedule Details */}
              <div className="mt-4 pt-3.5 border-t border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">
                  Caregiving Scope & Household Permissions
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70 leading-relaxed">
                  {caregiver.relationship.caregivingBoundaries ||
                    "Authorized in-home activities of daily living (ADL), sensory assistance, and scheduled companionship hours."}
                </p>
              </div>
            </Card>

            {/* Quick Coordination Note Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                <FileText className="w-4 h-4 text-[#3D6B22]" />
                Log Staff Coordination Note
              </h3>
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record scheduling updates, supervision check-ins, or credential notes..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all resize-none text-slate-800 placeholder:text-slate-400"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3D6B22] hover:bg-[#2C5217] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-[0_2px_8px_rgba(61,107,34,0.2)] cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Note to Timeline</span>
                  </button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column (1 col): Household & Compliance & Actions matching INQ-1042 */}
          <div className="space-y-5">
            {/* Recruitment Stage & Direct Contact Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] relative z-30">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#3D6B22]" />
                  Recruitment Stage & Actions
                </h3>
                <span
                  className={`shadow-2xs font-semibold text-white whitespace-nowrap px-2.5 py-0.5 text-[10px] rounded-full tracking-wide ${solidBg}`}
                >
                  {currentStage}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">
                    Current Pipeline Stage
                  </span>
                  <div className="relative" ref={statusDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                      className="w-full inline-flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-800">{currentStage}</span>
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    {isStatusDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                          Advance Pipeline Stage
                        </div>
                        <div className="max-h-56 overflow-y-auto py-1">
                          {EIGHT_CAREGIVER_KANBAN_STAGES.map((stg) => (
                            <button
                              key={stg.id}
                              onClick={() => handleStageChange(stg.id)}
                              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${currentStage === stg.id
                                ? "font-semibold text-[#3D6B22] bg-emerald-50/50"
                                : "text-slate-800"
                                }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${stg.badge.dot}`} />
                                <span>{stg.title}</span>
                              </span>
                              {currentStage === stg.id && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#3D6B22]" />
                    <span>Contact Caregiver</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Linked Household Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Home className="w-4 h-4 text-[#3D6B22]" />
                  Linked Household
                </h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200/70">
                  {caregiver.relationship.linkedHousehold.code}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Household Name
                  </span>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {caregiver.relationship.linkedHousehold.name}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Household Address
                  </span>
                  <span className="text-xs text-slate-700 block">
                    {caregiver.relationship.linkedHousehold.address}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Household Phone
                  </span>
                  <a
                    href={`tel:${caregiver.relationship.linkedHousehold.phone}`}
                    className="text-xs font-semibold text-[#3D6B22] hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {caregiver.relationship.linkedHousehold.phone}
                  </a>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={`/households/${caregiver.relationship.linkedHousehold.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#3D6B22] hover:underline"
                  >
                    <span>View Household Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>

            {/* Workforce Compliance Readiness Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#3D6B22]" />
                  Compliance & Verification
                </h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-[#1E5622] border border-emerald-200">
                  {caregiver.evvVisitHistory.overallComplianceRate}% Match
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Identity Record</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {caregiver.verificationChecklist.identity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">State Background Check</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {caregiver.verificationChecklist.screening}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">CPR & First Aid BLS</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {caregiver.verificationChecklist.cprFirstAid}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Required Training</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {caregiver.verificationChecklist.training}
                  </span>
                </div>
              </div>
            </Card>

            {/* Emergency Contact Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-500" />
                  Emergency Contact
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  24/7 Primary
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Contact Person</span>
                  <span className="font-semibold text-slate-800">
                    {caregiver.personalInfo.emergencyContact.name} (
                    {caregiver.personalInfo.emergencyContact.relationship})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Emergency Phone</span>
                  <a
                    href={`tel:${caregiver.personalInfo.emergencyContact.phone}`}
                    className=" font-bold text-[#3D6B22] hover:underline"
                  >
                    {caregiver.personalInfo.emergencyContact.phone}
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 02: Household & Assignments */}
      {activeTab === "household" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1E5622] flex items-center justify-center font-bold text-sm">
                  <Home className="w-5 h-5 text-[#3D6B22]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {caregiver.relationship.linkedHousehold.name}
                  </h3>
                  <span className=" text-xs text-slate-500">
                    {caregiver.relationship.linkedHousehold.code}
                  </span>
                </div>
              </div>
              <Link
                href={`/households/${caregiver.relationship.linkedHousehold.id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#3D6B22] hover:underline"
              >
                <span>Household Hub</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Telephone:</span>
                <span className="font-medium text-slate-800">
                  {caregiver.relationship.linkedHousehold.phone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Residence Address:</span>
                <span className="font-medium text-slate-800">
                  {caregiver.relationship.linkedHousehold.address},{" "}
                  {caregiver.relationship.linkedHousehold.city},{" "}
                  {caregiver.relationship.linkedHousehold.state}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block mb-1">Caregiving Scope & Boundaries:</span>
                <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {caregiver.relationship.caregivingBoundaries ||
                    "Assigned authorized in-home hours and respite support."}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {caregiver.availabilityAssignments.assignedClient
                      ? caregiver.availabilityAssignments.assignedClient.name
                      : "Unassigned Client"}
                  </h3>
                  <span className="text-[11px] text-slate-500">Designated Care Recipient</span>
                </div>
              </div>
              {caregiver.availabilityAssignments.assignedClient && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {caregiver.availabilityAssignments.weeklyCapacityHours} hrs/wk
                </span>
              )}
            </div>

            {caregiver.availabilityAssignments.assignedClient ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Client Relationship:</span>
                  <span className="font-semibold text-slate-800">
                    {caregiver.relationship.relationshipToClient}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Client ID:</span>
                  <span className=" font-bold text-slate-900">
                    {caregiver.availabilityAssignments.assignedClient.id}
                  </span>
                </div>
                <div className="pt-2">
                  <Link
                    href={`/clients/${caregiver.availabilityAssignments.assignedClient.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline"
                  >
                    <span>View Client File</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                Caregiver currently has no designated client assigned.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 03: Credentials & Screening */}
      {activeTab === "credentials" && (
        <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3D6B22]" />
                Workforce Credentials & Background Check
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Identity verification, BLS CPR, State DHS BCU, and OIG/SAM Exclusion checks
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1E5622] border border-emerald-200">
              Verified Compliant
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {caregiver.documentsCredentials.items.map((cred) => (
              <div key={cred.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{cred.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Category: {cred.category} · Issuer: {cred.issuer}{" "}
                      {cred.expiryDate ? `· Expiry: ${cred.expiryDate}` : ""}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${cred.status === "Verified"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                >
                  {cred.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 04: EVV & Visit History */}
      {activeTab === "evv" && (
        <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#3D6B22]" />
                Electronic Visit Verification (EVV) Log
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time GPS geofence clock-in/out records and compliance logs
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {caregiver.evvVisitHistory.overallComplianceRate}% Audit Match
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Total Completed Shifts</span>
              <strong className="text-slate-900 text-sm font-bold">
                {caregiver.evvVisitHistory.totalVisitsCompleted} Visits
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[11px]">GPS Verification Rate</span>
              <strong className="text-emerald-700 text-sm font-bold">
                {caregiver.evvVisitHistory.gpsVerificationRate}%
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Missed Clock-Outs</span>
              <strong className="text-slate-900 text-sm font-bold">
                {caregiver.evvVisitHistory.missedClockOutCount}
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[11px]">EVV Protocol</span>
              <strong className="text-slate-900 text-sm font-bold">Mobile App GPS</strong>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 05: Timeline & Activity Notes */}
      {activeTab === "timeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          <div className="lg:col-span-1">
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <FileText className="w-4 h-4 text-[#3D6B22]" />
                Log Caregiver Note
              </h3>
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  rows={4}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record scheduling updates, supervision check-ins, or credential notes..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all resize-none text-slate-800"
                />
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#3D6B22] hover:bg-[#2C5217] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-[0_2px_8px_rgba(61,107,34,0.2)] cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Note to Timeline</span>
                </button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Clock className="w-4 h-4 text-[#3D6B22]" />
                Caregiver Workforce History & Activity
              </h3>
              <div className="relative pl-6 space-y-5 border-l-2 border-slate-100">
                {caregiver.activityHistory.recentUpdates.map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#3D6B22]" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800 text-xs">{item.title}</span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.relativeTime || item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1 ">
                      Logged by {item.actor}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      <CaregiverContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        caregiver={caregiver}
        onLogCommunication={handleLogCommunication}
      />
      <CaregiverScheduleShiftModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        caregiver={caregiver}
        onScheduleShift={handleScheduleShift}
      />

      {perms.caregivers.canDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Caregiver Record"
          description="Permanent deletion removes this caregiver across both Agency Admin and Intake directories."
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          maxWidth="sm"
        >
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-slate-900">{caregiver.name}</strong> ({caregiver.id})?
          </p>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                deleteCaregiverFromStorage(caregiver.id);
                setIsDeleteModalOpen(false);
                toast.success(`Caregiver ${caregiver.name} permanently deleted.`);
                router.push(baseBackPath);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
