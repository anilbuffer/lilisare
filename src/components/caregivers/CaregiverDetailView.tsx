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
} from "lucide-react";
import { CaregiverRecord } from "@/types/caregiver";
import { getCaregiversFromStorage, INITIAL_CAREGIVERS } from "@/lib/caregivers/mockData";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";

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
    setCaregiver((prev) => (prev ? { ...prev, status: newStatus } : null));
    setIsStatusDropdownOpen(false);
    toast.success(`Caregiver status updated to ${newStatus}`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setCaregiver((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        activityHistory: {
          ...prev.activityHistory,
          recentUpdates: [
            {
              id: `ACT-${Date.now()}`,
              timestamp: "Just now",
              relativeTime: "Just now",
              title: "Staff Coordination Note Added",
              description: newNote.trim(),
              actor: "Agency Admin",
              type: "profile" as const,
            },
            ...prev.activityHistory.recentUpdates,
          ],
        },
      };
    });

    setNewNote("");
    toast.success("Caregiver note logged to timeline");
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

      {/* 01. Hero Identity & Actions Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] border border-slate-200 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar Box with Floating Status Badge */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#1B3414]/10 to-emerald-100/60 text-[#1B3414] border-2 border-white shadow-[0_6px_24px_rgba(0,0,0,0.06)] flex items-center justify-center text-2xl font-extrabold overflow-hidden">
              {caregiver.avatarUrl ? (
                <img src={caregiver.avatarUrl} alt={caregiver.name} className="w-full h-full object-cover" />
              ) : (
                caregiverInitials
              )}
            </div>
            <div className="absolute -bottom-2 -right-2">
              <span
                className={`border-2 border-white shadow-xs font-semibold text-white whitespace-nowrap px-2.5 py-0.5 text-[10px] rounded-full uppercase tracking-wider ${
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

            {/* Program & Safety Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 text-[#1E5622] border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {caregiver.relationship.relationshipToClient}
              </span>
              <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                DOB: {caregiver.personalInfo.dob}
              </span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                EVV Compliance: {caregiver.evvVisitHistory.overallComplianceRate}%
              </span>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                {caregiver.availabilityAssignments.assignedClient
                  ? `Assigned: ${caregiver.availabilityAssignments.assignedClient.name}`
                  : "Unassigned"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Column */}
        <div className="flex flex-col items-start lg:items-end justify-between gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
          <div className="flex items-center gap-2 self-stretch lg:self-auto justify-between lg:justify-end">
            <span className="text-xs font-semibold text-slate-500">Credential Status</span>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-100 text-[#1E5622] border border-emerald-200 font-bold rounded-full">
              100% Compliant
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => toast.success("Caregiver dossier exported as encrypted PDF")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Dossier</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print View</span>
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
                    Update Roster Status
                  </div>
                  {(["Active", "Onboarding", "Pending", "On Hold"] as CaregiverRecord["status"][]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                          caregiver.status === st
                            ? "font-semibold text-[#3D6B22] bg-emerald-50/50"
                            : "text-slate-800"
                        }`}
                      >
                        <span>{st}</span>
                        {caregiver.status === st && <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Edit Caregiver Primary CTA */}
            <Link
              href={`/caregivers/${caregiver.id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1B3414] hover:bg-[#274C1D] active:scale-[0.98] transition-all rounded-xl shadow-[0_4px_16px_rgba(27,52,20,0.25)] hover:shadow-[0_6px_24px_rgba(27,52,20,0.35)] cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#93C573]" />
              <span>Edit Profile</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>

      {/* 02. Floating Pill Navigation Bar */}
      <div className="flex items-center gap-1 p-1.5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-2xl overflow-x-auto no-scrollbar border border-slate-200/90 w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap rounded-xl flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-[#1B3414] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#93C573]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 03. Tab Content Modules */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {/* Left Column (2 cols): Personal Demographics & Connected Journeys */}
          <div className="lg:col-span-2 space-y-5">
            {/* Personal Details Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <User className="w-4.5 h-4.5 text-[#3D6B22]" />
                Caregiver Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Full Legal Name</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{caregiver.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Preferred Name</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                    {caregiver.personalInfo.preferredName || "None"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Birth / Gender</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {caregiver.personalInfo.dob} ({caregiver.personalInfo.gender})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Languages Spoken</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {caregiver.personalInfo.languages.join(", ")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Social Security Number</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {showMaskedSsn
                        ? caregiver.personalInfo.maskedIdentifiers.ssnMasked
                        : "•••-••-••••"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMaskedSsn(!showMaskedSsn)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showMaskedSsn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block">Residential Address</span>
                  <span className="font-medium text-slate-800 mt-0.5 block flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {caregiver.personalInfo.address.street}, {caregiver.personalInfo.address.city},{" "}
                      {caregiver.personalInfo.address.state} {caregiver.personalInfo.address.zip}
                    </span>
                  </span>
                </div>
              </div>
            </Card>

            {/* Three Connected Journeys Card (RULES.md #L96) */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Sparkles className="w-4.5 h-4.5 text-[#3D6B22]" />
                Three Connected Journeys (Workforce Synchronization)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                {/* 1. Client Care Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-slate-500">
                    <span>1. Client Care</span>
                    <span className="text-emerald-700 font-bold">Connected</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium truncate">
                    {caregiver.availabilityAssignments.assignedClient
                      ? caregiver.availabilityAssignments.assignedClient.name
                      : "Unassigned"}
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-[#3D6B22] h-1.5 rounded-full"
                      style={{ width: caregiver.availabilityAssignments.assignedClient ? "100%" : "30%" }}
                    />
                  </div>
                </div>

                {/* 2. Caregiver Workforce Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-slate-500">
                    <span>2. Caregiver Workforce</span>
                    <span className="text-emerald-700 font-bold">{caregiver.status}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium truncate">
                    {caregiver.type} • {caregiver.employmentClassification}
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-[#3D6B22] h-1.5 rounded-full"
                      style={{ width: caregiver.status === "Active" ? "100%" : "65%" }}
                    />
                  </div>
                </div>

                {/* 3. Agency Operations Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-slate-500">
                    <span>3. Agency Ops</span>
                    <span className="text-emerald-700 font-bold">Compliant</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium truncate">
                    EVV: {caregiver.evvVisitHistory.overallComplianceRate}% verified
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-[#3D6B22] h-1.5 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (1 col): Contact Details & Emergency Contacts */}
          <div className="space-y-5">
            {/* Contact Information Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Phone className="w-4 h-4 text-[#3D6B22]" />
                Direct Communication
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Telephone</span>
                  <a href={`tel:${caregiver.personalInfo.phone}`} className="font-semibold text-[#3D6B22] hover:underline flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {caregiver.personalInfo.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <a href={`mailto:${caregiver.personalInfo.email}`} className="font-semibold text-[#3D6B22] hover:underline flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {caregiver.personalInfo.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Branch</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{caregiver.branch} Branch</span>
                </div>
              </div>
            </Card>

            {/* Emergency Contact */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  Emergency Contact
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Designated
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Contact:</span>
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
          {/* Linked Household Details */}
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
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
                <span className="text-slate-500">Relationship to Client:</span>
                <span className="font-semibold text-slate-800">{caregiver.relationship.relationshipToClient}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Verification Status:</span>
                <span className="font-bold text-emerald-700">{caregiver.relationship.relationshipVerificationStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Residence Address:</span>
                <span className="font-medium text-slate-800">{caregiver.relationship.linkedHousehold.address}</span>
              </div>
            </div>
          </Card>

          {/* Assigned Client Workload */}
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {caregiver.availabilityAssignments.assignedClient ? (
                    caregiver.availabilityAssignments.assignedClient.name.charAt(0)
                  ) : (
                    <Users className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {caregiver.availabilityAssignments.assignedClient
                      ? caregiver.availabilityAssignments.assignedClient.name
                      : "Unassigned"}
                  </h3>
                  <span className="text-[11px] text-slate-500">Assigned Client Workload</span>
                </div>
              </div>
              {caregiver.availabilityAssignments.assignedClient && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {caregiver.availabilityAssignments.assignedClient.scheduledWeeklyHours} hrs/wk
                </span>
              )}
            </div>

            {caregiver.availabilityAssignments.assignedClient ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Authorized Hours:</span>
                  <span className="font-semibold text-slate-800">
                    {caregiver.availabilityAssignments.assignedClient.weeklyAuthorizedHours} hrs/wk
                  </span>
                </div>
                <div className="pt-2">
                  <Link
                    href={`/clients/${caregiver.availabilityAssignments.assignedClient.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline"
                  >
                    <span>Open Client Chart</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                No active client assigned to this caregiver file yet.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 03: Credentials & Screening */}
      {activeTab === "credentials" && (
        <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-[#3D6B22]" />
                Credentials, Certifications & Background Checks
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                CPR, First Aid, TB clearance, OIG exclusion screening, and state background checks
              </p>
            </div>
            <button
              type="button"
              onClick={() => toast.success("Upload credential triggered")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Credential</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {caregiver.documentsCredentials.items.map((cred) => (
              <div key={cred.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-800">{cred.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Issuer: {cred.issuer} • Issue: {cred.issueDate} • Expires: {cred.expiryDate || "Does Not Expire"}
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    cred.status === "Verified"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : cred.status === "Expired"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-[#3D6B22]" />
              Electronic Visit Verification (EVV) Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Overall Compliance</span>
                <span className="font-extrabold text-[#3D6B22] text-xl mt-0.5 block">
                  {caregiver.evvVisitHistory.overallComplianceRate}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">GPS Telemetry Match</span>
                <span className="font-extrabold text-slate-900 text-xl mt-0.5 block">
                  {caregiver.evvVisitHistory.gpsVerificationRate}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Completed Shifts</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {caregiver.evvVisitHistory.totalVisitsCompleted} visits
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Missed Clock-Out Exceptions</span>
                <span className="font-bold text-emerald-700 mt-0.5 block">
                  {caregiver.evvVisitHistory.missedClockOutCount} exceptions
                </span>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-blue-600" />
              Recent EVV Shifts Logged
            </h3>
            <div className="space-y-2.5 text-xs">
              {caregiver.evvVisitHistory.recentVisits.slice(0, 3).map((vst) => (
                <div key={vst.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{vst.date}</span>
                    <span className="text-slate-500 block text-[11px] font-mono">
                      {vst.clockIn} → {vst.clockOut} ({Math.floor(vst.durationMinutes / 60)}h {vst.durationMinutes % 60}m)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E3F1D9] text-[#1E5622]">
                    ✓ {vst.gpsStatus}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 05: Timeline & Activity Notes */}
      {activeTab === "timeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {/* Note Form */}
          <div className="lg:col-span-1">
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <FileText className="w-4 h-4 text-[#3D6B22]" />
                Log Caregiver Note
              </h3>
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  rows={4}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record supervisor review, training milestone, or caregiver check-in..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all resize-none"
                />
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1B3414] hover:bg-[#274C1D] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Note to Timeline</span>
                </button>
              </form>
            </Card>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Clock className="w-4 h-4 text-[#3D6B22]" />
                Caregiver Activity & History
              </h3>
              <div className="relative pl-6 space-y-5 border-l-2 border-slate-100">
                {caregiver.activityHistory.recentUpdates.map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#3D6B22]" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 text-xs">{item.title}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{item.relativeTime}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                      Logged by {item.actor} ({item.type})
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
