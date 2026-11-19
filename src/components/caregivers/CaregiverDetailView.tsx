"use client";

import React, { useState, useEffect } from "react";
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
  Printer,
  ChevronRight,
  ArrowRight,
  Send,
  Sparkles,
  RefreshCw,
  Download,
  Edit3,
  Lock,
  Eye,
  EyeOff,
  Upload,
  AlertTriangle,
  Award,
  GraduationCap,
  Users,
  CalendarPlus,
  Globe,
} from "lucide-react";
import { CaregiverRecord } from "@/types/caregiver";
import { getCaregiversFromStorage, saveCaregiversToStorage, INITIAL_CAREGIVERS } from "@/lib/caregivers/mockData";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { CaregiverContactModal } from "./modals/CaregiverContactModal";
import { CaregiverScheduleShiftModal } from "./modals/CaregiverScheduleShiftModal";

interface CaregiverDetailViewProps {
  caregiverId: string;
}

export function CaregiverDetailView({ caregiverId }: CaregiverDetailViewProps) {
  const router = useRouter();
  const [caregiver, setCaregiver] = useState<CaregiverRecord | null>(null);
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
        <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">Loading Caregiver Profile...</p>
      </div>
    );
  }

  const handleStatusChange = (newStatus: CaregiverRecord["status"]) => {
    const updated: CaregiverRecord = {
      ...caregiver,
      status: newStatus,
      activityHistory: {
        ...caregiver.activityHistory,
        recentUpdates: [
          {
            id: `ACT-${Date.now()}`,
            timestamp: new Date().toISOString(),
            relativeTime: "Just now",
            title: `Status Changed to ${newStatus}`,
            description: `Caregiver workforce status manually updated to ${newStatus}.`,
            actor: "Agency Admin",
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

    toast.success(`Caregiver status updated to ${newStatus}`);
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
      actor: "Agency Admin",
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
    caregiverId: string,
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
    caregiverId: string,
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
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-16 animate-in fade-in duration-300">
      {/* Back Navigation Button */}
      <div>
        <Link
          href="/caregivers"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Caregivers Directory</span>
        </Link>
      </div>

      {/* 01. PatientHeader Style: Hero Identity & Actions Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] border border-slate-200 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar Box with Floating Status Badge */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#3D6B22]/10 to-emerald-100/60 text-[#3D6B22] border-2 border-white shadow-[0_6px_24px_rgba(0,0,0,0.06)] flex items-center justify-center text-2xl font-extrabold overflow-hidden">
              {caregiver.avatarUrl ? (
                <img src={caregiver.avatarUrl} alt={caregiver.name} className="w-full h-full object-cover" />
              ) : (
                caregiverInitials
              )}
            </div>
            <div className="absolute -bottom-2 -right-2">
              <span
                className={`border-2 border-white shadow-sm font-semibold text-white whitespace-nowrap px-2.5 py-0.5 text-[10px] rounded-full uppercase tracking-wider ${
                  caregiver.status === "Active"
                    ? "bg-[#3D6B22]"
                    : caregiver.status === "Onboarding"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              >
                {caregiver.status}
              </span>
            </div>
          </div>

          {/* Heading & Badges */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {caregiver.id}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {caregiver.employmentClassification}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200">
                {caregiver.type}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              {caregiver.name}
            </h1>

            {/* Metadata Line */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mb-3">
              <span className="font-medium text-slate-700">
                Household: <strong className="text-slate-900 font-semibold">{caregiver.relationship.linkedHousehold.name}</strong>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1 text-slate-600">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {caregiver.branch} Branch
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Hired {caregiver.hireDate}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {caregiver.personalInfo.phone}
              </span>
            </div>

            {/* Program & Info Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand" className="bg-emerald-50 text-[#1E5622] border-emerald-200 text-xs font-semibold px-2.5 py-0.5">
                {caregiver.relationship.relationshipToClient}
              </Badge>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] uppercase font-bold px-2 py-0.5 border">
                DOB: {caregiver.personalInfo.dob}
              </Badge>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] uppercase font-bold px-2 py-0.5 border flex items-center gap-1">
                <Globe className="w-3 h-3" />
                EVV Compliance: {caregiver.evvVisitHistory.overallComplianceRate}%
              </Badge>
              <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] uppercase font-bold px-2 py-0.5 border">
                {caregiver.availabilityAssignments.assignedClient
                  ? `Assigned: ${caregiver.availabilityAssignments.assignedClient.name}`
                  : "Unassigned"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Controls Column */}
        <div className="flex flex-col items-start lg:items-end justify-between gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
          <div className="flex items-center gap-2 self-stretch lg:self-auto justify-between lg:justify-end">
            <span className="text-xs font-semibold text-slate-500">Compliance Readiness</span>
            <Badge variant="success" className="text-xs px-2.5 py-0.5 bg-emerald-100 text-[#1E5622] border-emerald-200 font-semibold">
              100% Compliant
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Contact Caregiver Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#3D6B22]" />
              <span>Contact Caregiver</span>
            </button>

            {/* Schedule Shift Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-sky-700" />
              <span>Schedule Shift</span>
            </button>

            {/* Advance Status Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>{caregiver.status}</span>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                    Update Workforce Status
                  </div>
                  {(["Active", "Onboarding", "Inactive", "Terminated"] as CaregiverRecord["status"][]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                        caregiver.status === st
                          ? "font-semibold text-[#3D6B22] bg-emerald-50/50"
                          : "text-slate-800"
                      }`}
                    >
                      <span>{st}</span>
                      {caregiver.status === st && <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Edit Profile Primary CTA */}
            <Link
              href={`/caregivers/${caregiver.id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#2C5217] active:scale-[0.98] transition-all rounded-xl shadow-[0_4px_16px_rgba(61,107,34,0.25)] hover:shadow-[0_6px_24px_rgba(61,107,34,0.35)] cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-white" />
              <span>Edit Profile</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>

      {/* 02. PatientTabs Style: Floating Pill Navigation Bar */}
      <div className="flex items-center gap-1 p-1.5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-2xl overflow-x-auto no-scrollbar border border-slate-200/90 w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#3D6B22] text-white shadow-[0_4px_12px_rgba(61,107,34,0.25)]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 03. Tab Content Modules */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          <div className="lg:col-span-2 space-y-5">
            {/* Personal Information & Demographics Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <User className="w-4.5 h-4.5 text-[#3D6B22]" />
                Personal Profile & Identifiers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Full Name</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{caregiver.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Preferred Name</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{caregiver.personalInfo.preferredName || caregiver.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Birth & Gender</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">{caregiver.personalInfo.dob} · {caregiver.personalInfo.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Languages Spoken</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">{caregiver.personalInfo.languages.join(", ")}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Direct Telephone</span>
                  <a href={`tel:${caregiver.personalInfo.phone}`} className="font-semibold text-[#3D6B22] hover:underline flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {caregiver.personalInfo.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Email Address</span>
                  <a href={`mailto:${caregiver.personalInfo.email}`} className="font-semibold text-[#3D6B22] hover:underline flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {caregiver.personalInfo.email}
                  </a>
                </div>
              </div>

              {/* Masked Identifiers */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Encrypted Tax & Government Identifiers
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMaskedSsn(!showMaskedSsn)}
                    className="text-[11px] font-semibold text-[#3D6B22] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showMaskedSsn ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showMaskedSsn ? "Hide Identifiers" : "Show Identifiers"}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">SSN Masked</span>
                    <span className="font-mono text-xs text-slate-800 font-bold">
                      {showMaskedSsn ? "123-45-6789" : caregiver.personalInfo.maskedIdentifiers.ssnMasked}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Driver&apos;s License</span>
                    <span className="font-mono text-xs text-slate-800 font-bold">
                      {caregiver.personalInfo.maskedIdentifiers.driversLicenseMasked}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">TIN / W-9 Status</span>
                    <span className="font-mono text-xs text-slate-800 font-bold">
                      {caregiver.personalInfo.maskedIdentifiers.taxIdMasked}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Three Connected Journeys Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Sparkles className="w-4.5 h-4.5 text-[#3D6B22]" />
                Three Connected Journeys (Workforce Synchronization)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                {/* 1. Caregiver Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-slate-500">
                    <span>1. Caregiver Status</span>
                    <span className="text-emerald-700 font-bold">{caregiver.status}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium truncate">
                    {caregiver.type} ({caregiver.employmentClassification})
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-[#3D6B22] h-1.5 rounded-full"
                      style={{ width: caregiver.status === "Active" ? "100%" : "70%" }}
                    />
                  </div>
                </div>

                {/* 2. Client Pairing Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-slate-500">
                    <span>2. Client Link</span>
                    <span className="text-emerald-700 font-bold">
                      {caregiver.availabilityAssignments.assignedClient ? "Assigned" : "Available"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium truncate">
                    {caregiver.availabilityAssignments.assignedClient
                      ? caregiver.availabilityAssignments.assignedClient.name
                      : "Open for dispatch"}
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-[#3D6B22] h-1.5 rounded-full"
                      style={{ width: caregiver.availabilityAssignments.assignedClient ? "100%" : "30%" }}
                    />
                  </div>
                </div>

                {/* 3. Agency Operations Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-slate-500">
                    <span>3. EVV & Hours</span>
                    <span className="text-emerald-700 font-bold">{caregiver.evvVisitHistory.overallComplianceRate}% EVV</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium truncate">
                    {caregiver.availabilityAssignments.weeklyCapacityHours} hrs/wk capacity
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-[#3D6B22] h-1.5 rounded-full"
                      style={{ width: `${caregiver.evvVisitHistory.overallComplianceRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            {/* Primary Residence & Emergency Contact Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-[#3D6B22]" />
                Primary Residence
              </h3>
              <div className="space-y-2.5 text-xs">
                <p className="font-medium text-slate-800">
                  {caregiver.personalInfo.address.street}
                </p>
                <p className="font-medium text-slate-800">
                  {caregiver.personalInfo.address.city}, {caregiver.personalInfo.address.state} {caregiver.personalInfo.address.zip}
                </p>
                <span className="text-[11px] text-slate-400 block pt-1 border-t border-slate-100">
                  Assigned Branch Area: {caregiver.branch}
                </span>
              </div>
            </Card>

            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  Emergency Contact
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  24/7 Response
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-bold text-slate-800">{caregiver.personalInfo.emergencyContact.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Relationship:</span>
                  <span className="font-semibold text-slate-700">{caregiver.personalInfo.emergencyContact.relationship}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Telephone:</span>
                  <span className="font-mono font-bold text-slate-900">{caregiver.personalInfo.emergencyContact.phone}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 02: Household & Assignments */}
      {activeTab === "household" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1E5622] flex items-center justify-center font-bold text-sm">
                  <Home className="w-5 h-5 text-[#3D6B22]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{caregiver.relationship.linkedHousehold.name}</h3>
                  <span className="font-mono text-xs text-slate-500">{caregiver.relationship.linkedHousehold.code}</span>
                </div>
              </div>
              <Link
                href="/households"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#3D6B22] hover:underline"
              >
                <span>Household Hub</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Telephone:</span>
                <span className="font-medium text-slate-800">{caregiver.relationship.linkedHousehold.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Residence Address:</span>
                <span className="font-medium text-slate-800">
                  {caregiver.relationship.linkedHousehold.address}, {caregiver.relationship.linkedHousehold.city}, {caregiver.relationship.linkedHousehold.state}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block mb-1">Caregiving Scope & Boundaries:</span>
                <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  {caregiver.relationship.caregivingBoundaries || "Assigned authorized in-home hours and respite support."}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
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
                  <span className="font-mono font-bold text-slate-900">
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
                Caregiver currently has no designated client assigned. Dispatch to client from the Clients Workspace.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 03: Credentials & Screening */}
      {activeTab === "credentials" && (
        <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-[#3D6B22]" />
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
                      Category: {cred.category} · Issuer: {cred.issuer} {cred.expiryDate ? `· Expiry: ${cred.expiryDate}` : ""}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    cred.status === "Verified"
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
        <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-[#3D6B22]" />
                Electronic Visit Verification (EVV) Log
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time GPS geofence clock-in/out records, task completions, and supervisor scrub logs
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {caregiver.evvVisitHistory.overallComplianceRate}% Audit Match
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Total Completed Shifts</span>
              <strong className="text-slate-900 text-sm font-bold">{caregiver.evvVisitHistory.totalVisitsCompleted} Visits</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[11px]">GPS Verification Rate</span>
              <strong className="text-emerald-700 text-sm font-bold">{caregiver.evvVisitHistory.gpsVerificationRate}%</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Missed Clock-Outs</span>
              <strong className="text-slate-900 text-sm font-bold">{caregiver.evvVisitHistory.missedClockOutCount}</strong>
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
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2.5 border-b border-slate-100">
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
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#3D6B22] hover:bg-[#345C1D] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_16px_rgba(61,107,34,0.25)] cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Note to Timeline</span>
                </button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Clock className="w-4 h-4 text-[#3D6B22]" />
                Caregiver Workforce History & Activity
              </h3>
              <div className="relative pl-6 space-y-5 border-l-2 border-slate-100">
                {caregiver.activityHistory.recentUpdates.map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#3D6B22]" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 text-xs">{item.title}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{item.relativeTime || item.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">
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
    </div>
  );
}
