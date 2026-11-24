"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Building2,
  Clock,
  FileText,
  Heart,
  Home,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  User,
  AlertTriangle,
  Send,
  Calendar,
  ExternalLink,
  Activity,
  ClipboardCheck,
  ShieldAlert,
  Sparkles,
  Layers,
  PhoneCall,
  FileCheck,
  Copy,
  Check,
  Info,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  AdminIntakeReferralItem,
  ReferralStatus,
  getAdminReferralById,
  getAdminReferralsFromStorage,
  saveAdminReferralsToStorage,
} from "@/lib/intake-referrals/adminIntakeReferralsData";

interface AdminIntakeReferralDetailViewProps {
  referralId: string;
}

type TabType = "overview" | "clinical" | "contact" | "payer" | "chronology";

interface TabDef {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: User },
  { id: "clinical", label: "Clinical & Triage", icon: Stethoscope },
  { id: "contact", label: "Demographics & Contact", icon: MapPin },
  { id: "payer", label: "Payer & Source", icon: Building2 },
  { id: "chronology", label: "Activity & Notes", icon: Clock },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

const STATUS_OPTIONS: ReferralStatus[] = [
  "New Referral",
  "Clinical Assessment",
  "Documents & Auth",
  "Ready for Staffing",
  "Enrolled",
  "Archived",
];

export function AdminIntakeReferralDetailView({
  referralId,
}: AdminIntakeReferralDetailViewProps) {
  const router = useRouter();
  const [referral, setReferral] = useState<AdminIntakeReferralItem | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [noteCategory, setNoteCategory] = useState<
    "Coordination" | "Clinical" | "Payer" | "Family"
  >("Coordination");
  const [noteFilter, setNoteFilter] = useState<string>("All");
  const [notesList, setNotesList] = useState<
    Array<{ author: string; role: string; time: string; text: string; category: string }>
  >([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const item = getAdminReferralById(referralId);
    if (item) {
      setReferral(item);
      setNotesList([
        {
          author: item.assignedCoordinator || "Maria Santos, BSN",
          role: "Intake Coordinator & Triage RN",
          time: `${item.daysInPipeline} days ago`,
          category: "Clinical",
          text: item.triageNotes,
        },
        {
          author: "Discharge Navigator (UPMC)",
          role: "Hospital Referral Source",
          time: item.receivedDate,
          category: "Payer",
          text: `Inbound referral submitted with complete clinical packet: H&P, Surgical Report (s/p Right Hip ORIF), and CMS-485 Face-to-Face Physician Order. Prior Auth AUTH-2026-PA-88419 confirmed active with UPMC CHC.`,
        },
        {
          author: "System Intake Gateway",
          role: "Automated Ingestion",
          time: item.receivedDate,
          category: "Coordination",
          text: `Inbound referral ingested from ${item.referralSource}. Initial triage priority designated as ${item.priority}. Assigned to ${item.assignedCoordinator}.`,
        },
      ]);
    }
  }, [referralId]);

  if (!isMounted) {
    return (
      <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">Loading Referral Profile...</p>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="w-full max-w-7xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Referral Record Not Found</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The requested referral identifier &quot;{referralId}&quot; could not be retrieved from the active directory.
        </p>
        <Link
          href="/admin/intake-referrals"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Referrals Directory</span>
        </Link>
      </div>
    );
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUpdateStatus = (newStatus: ReferralStatus) => {
    const all = getAdminReferralsFromStorage();
    const updated = all.map((r) => (r.id === referral.id ? { ...r, status: newStatus } : r));
    saveAdminReferralsToStorage(updated);
    setReferral({ ...referral, status: newStatus });
    setIsStatusDropdownOpen(false);
    toast.success(`Referral status updated to ${newStatus}`);

    setNotesList((prev) => [
      {
        author: "Agency Executive",
        role: "Agency Administrator",
        time: "Just now",
        category: "Coordination",
        text: `Pipeline status manually updated to ${newStatus}.`,
      },
      ...prev,
    ]);
  };

  const handleConvertToClient = () => {
    const all = getAdminReferralsFromStorage();
    const updated = all.map((r) =>
      r.id === referral.id ? { ...r, status: "Enrolled" as ReferralStatus } : r
    );
    saveAdminReferralsToStorage(updated);
    setReferral({ ...referral, status: "Enrolled" });
    toast.success(`${referral.patientName} successfully admitted as Active Client`);

    setNotesList((prev) => [
      {
        author: "Agency Executive",
        role: "Agency Administrator",
        time: "Just now",
        category: "Coordination",
        text: "Client admitted into active home care service roster. Household profile and care schedule initiated.",
      },
      ...prev,
    ]);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setNotesList((prev) => [
      {
        author: "Agency Administrator",
        role: "Executive Staff",
        time: "Just now",
        category: noteCategory,
        text: newNote.trim(),
      },
      ...prev,
    ]);
    setNewNote("");
    toast.success("Coordination note added to chronology");
  };

  const initials = getInitials(referral.patientName);

  const filteredNotes =
    noteFilter === "All"
      ? notesList
      : notesList.filter((n) => n.category.toLowerCase() === noteFilter.toLowerCase());

  return (
    <div className="w-full max-w-9xl mx-auto space-y-4 pb-16 animate-in fade-in duration-200">
      {/* 01. Back Navigation Button */}
      <div>
        <Link
          href="/admin/intake-referrals"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Referrals Directory</span>
        </Link>
      </div>

      {/* 02. Hero Identity & Actions Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
          {/* Avatar Box with Floating Priority Badge */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20 flex items-center justify-center text-xl font-black shadow-2xs">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <span
                className={`border-2 border-white shadow-xs font-bold text-white whitespace-nowrap px-2 py-0.5 text-[10px] rounded-full tracking-wide ${referral.priority === "Urgent"
                  ? "bg-rose-600"
                  : referral.priority === "High"
                    ? "bg-amber-600"
                    : "bg-[#3D6B22]"
                  }`}
              >
                {referral.priority}
              </span>
            </div>
          </div>

          {/* Clean Heading without Cluttered Subtext */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate sm:overflow-visible sm:whitespace-normal">
                {referral.patientName}
              </h1>
              <span className=" font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded text-xs border border-slate-200/70">
                {referral.id}
              </span>
            </div>

            <div className="mt-1 text-xs text-slate-500 font-medium">
              Received: {referral.receivedDate} ({referral.daysInPipeline}d in pipeline)
            </div>
          </div>
        </div>

        {/* Action Controls Column */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto shrink-0 border-t xl:border-t-0 pt-3.5 xl:pt-0 border-slate-100">
          {/* Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>{referral.status}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                  Update Stage
                </div>
                {STATUS_OPTIONS.map((stg) => (
                  <button
                    key={stg}
                    onClick={() => handleUpdateStatus(stg)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${referral.status === stg
                      ? "font-semibold text-[#3D6B22] bg-emerald-50/50"
                      : "text-slate-800"
                      }`}
                  >
                    <span>{stg}</span>
                    {referral.status === stg && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admit to Client CTA */}
          {referral.status !== "Enrolled" ? (
            <button
              onClick={handleConvertToClient}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#345C1D] active:scale-[0.98] transition-all rounded-xl shadow-[0_2px_8px_rgba(61,107,34,0.2)] hover:shadow-[0_4px_12px_rgba(61,107,34,0.25)] cursor-pointer whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Admit as Active Client</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Client Enrolled</span>
            </span>
          )}
        </div>
      </div>

      {/* 03. Clean Tab Navigation Bar */}
      <div className="flex items-center gap-1 p-1 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-2xl overflow-x-auto no-scrollbar border border-slate-200 w-full">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap rounded-xl cursor-pointer flex items-center gap-2 ${isActive
                ? "bg-[#EAF5E9] text-[#2B5E1A] border border-[#3D6B22]/20 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#3D6B22]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 04. Tab Content Panes */}

      {/* =========================================================================
          TAB 1: OVERVIEW
         ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Stats Cards (Consistent with Global UI Card Standardization) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Card 1: Patient Demographics */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-normal text-slate-400">Patient Demographics</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {referral.age}yo {referral.gender}
              </div>
            </div>

            {/* Card 2: Benefit Program */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-normal text-slate-400">Benefit Program</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate" title={referral.program}>
                {referral.program}
              </div>
            </div>

            {/* Card 3: Assigned Coordinator */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-normal text-slate-400">Assigned Coordinator</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#3D6B22]">
                  <Stethoscope className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate" title={referral.assignedCoordinator}>
                {referral.assignedCoordinator}
              </div>
            </div>

            {/* Card 4: Target Capacity */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-normal text-slate-400">Target Capacity</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {referral.estimatedHoursPerWeek} hrs/week
              </div>
            </div>
          </div>

          {/* Overview Two-Column Information Architecture */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
            {/* Left Column (8 cols): Clinical & Operational Directives */}
            <div className="lg:col-span-8 space-y-4">
              {/* Card 1: Clinical Profile & Diagnostic Overview */}
              <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#E8F2E4] flex items-center justify-center text-[#1E5622]">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Clinical Profile & Diagnostic Summary
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#1E5622] bg-[#E8F2E4] px-2.5 py-0.5 rounded-full border border-[#3D6B22]/20">
                    Acuity: Level 3
                  </span>
                </div>

                {/* Primary Diagnosis Box */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#3D6B22]" />
                      <span>Primary Clinical Diagnosis</span>
                    </span>
                    <span className="text-[10px]  font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      ICD-10 Verified
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-900 font-bold leading-relaxed">
                    {referral.primaryDiagnosis}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white text-slate-600 border border-slate-200">
                      S/P Right Hip ORIF (S72.001A)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white text-slate-600 border border-slate-200">
                      Vascular Dementia (F01.50)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white text-slate-600 border border-slate-200">
                      Fall Risk High (Z91.81)
                    </span>
                  </div>
                </div>

                {/* Triage Directives */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider text-slate-500">
                    Intake Assessment & Triage Directives
                  </span>
                  <div className="p-4 bg-white rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium shadow-2xs">
                    {referral.triageNotes}
                  </div>
                </div>

                {/* Requested Services */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider text-slate-500">
                    Requested In-Home Service Lines
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {referral.requestedServices.map((svc) => (
                      <div
                        key={svc}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#E8F2E4] text-[#1E5622] flex items-center justify-center shrink-0">
                          <Heart className="w-4 h-4 text-[#3D6B22]" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">{svc}</span>
                          <span className="text-[10px] text-slate-400 font-medium">Authorized Care</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: Intake Readiness & Milestone Checklist */}
              <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#E8F2E4] flex items-center justify-center text-[#1E5622]">
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Intake Readiness & Admission Milestones
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    4 of 6 Completed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-slate-900 font-bold block">Referral Packet Ingestion</strong>
                      <span className="text-slate-500 text-[11px]">Discharge summary & Face-to-Face verified</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-slate-900 font-bold block">Payer Eligibility Verified</strong>
                      <span className="text-slate-500 text-[11px]">UPMC CHC active waiver coverage on file</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-slate-900 font-bold block">Clinical Triage & Risk Review</strong>
                      <span className="text-slate-500 text-[11px]">Assigned to Maria Santos, BSN</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-slate-900 font-bold block">Prior Authorization Confirmed</strong>
                      <span className="text-slate-500 text-[11px]">AUTH-2026-PA-88419 (35 hrs/wk)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60">
                    <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-slate-900 font-bold block">In-Home Clinical Assessment</strong>
                      <span className="text-slate-500 text-[11px]">Scheduled for Nov 24, 2026 at 10:00 AM</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-slate-700 font-bold block">Caregiver Staffing Roster</strong>
                      <span className="text-slate-500 text-[11px]">Pending aide matching for 35 hrs/wk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Connected Records & Operational Cards */}
            <div className="lg:col-span-4 space-y-4">
              {/* Connected Records Container */}
              <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#E8F2E4] flex items-center justify-center text-[#1E5622]">
                      <Home className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Connected Records
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-[#3D6B22] bg-[#E8F2E4] px-2 py-0.5 rounded-full border border-[#3D6B22]/20">
                    Three Journeys
                  </span>
                </div>

                {/* 1. Household Hub Action Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Household Hub
                    </span>
                    <span className="text-[11px]  font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {referral.householdCode || "HH-1002"}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">Whitfield Family Household</div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    214 Maple Ridge Lane · 2 Members · 1 Assigned Caregiver
                  </p>
                  {referral.householdCode ? (
                    <Link
                      href={`/admin/households/${referral.householdCode.toLowerCase()}`}
                      className="inline-flex items-center justify-between w-full px-3.5 py-2 text-xs font-bold text-[#1E5622] bg-white hover:bg-[#E8F2E4] border border-slate-200 hover:border-[#3D6B22]/30 rounded-xl shadow-2xs transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Home className="w-3.5 h-3.5 text-[#3D6B22]" />
                        <span>Open Household Hub</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#3D6B22] group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No linked household recorded</span>
                  )}
                </div>

                {/* 2. Client Profile Action Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Client Profile
                    </span>
                    <span className="text-[11px]  font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {referral.clientId || "CL-1002"}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{referral.patientName}</div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Direct client chart with care plans, medication administration, and clinical notes.
                  </p>
                  {referral.clientId ? (
                    <Link
                      href={`/admin/clients/${referral.clientId}`}
                      className="inline-flex items-center justify-between w-full px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 rounded-xl shadow-2xs transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#3D6B22]" />
                        <span>View Client Profile</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ) : (
                    <button
                      onClick={handleConvertToClient}
                      className="inline-flex items-center justify-center w-full px-3.5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-2xs transition-all cursor-pointer"
                    >
                      <span>Generate Client Profile</span>
                    </button>
                  )}
                </div>

                {/* 3. Assigned Lead Coordinator Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Assigned Coordinator
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active Lead
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{referral.assignedCoordinator}</div>
                  <div className="text-[11px] text-slate-500">Lead Intake RN & Triage Navigator</div>
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <a
                      href="tel:(555) 882-9011"
                      className="text-[#3D6B22] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Direct</span>
                    </a>
                    <span className="text-slate-300">·</span>
                    <a
                      href="mailto:maria.santos@lilisare.com"
                      className="text-[#3D6B22] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>

                {/* 4. Insurance & Payer Quick Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Insurance & Payer
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Active Auth</span>
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{referral.payerName}</div>
                  <div className="text-[11px] text-slate-500 ">Prior Auth: AUTH-2026-PA-88419</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CLINICAL & TRIAGE
         ========================================================================= */}
      {activeTab === "clinical" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            {/* Functional ADL & Mobility Matrix */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E8F2E4] flex items-center justify-center text-[#1E5622]">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    ADL & Mobility Directives
                  </h3>
                </div>
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  Priority: {referral.priority}
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    task: "Bathing & Personal Hygiene",
                    req: "Hands-on assistance required with shower chair & transfer bench",
                    status: "Total Assist",
                    badge: "ADL-01",
                  },
                  {
                    task: "Bed Mobility & Transfers",
                    req: "Standby assist with gait belt (Right leg non-weight bearing x 3 weeks)",
                    status: "Standby Guard",
                    badge: "ADL-02",
                  },
                  {
                    task: "Medication Reminders",
                    req: "Supervised self-administration and blister-pack verification",
                    status: "Prompting",
                    badge: "IADL-01",
                  },
                  {
                    task: "Meal Prep & Hydration",
                    req: "Heart-healthy meal preparation and minimum 1500ml daily fluid prompting",
                    status: "Full Prep",
                    badge: "IADL-02",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs"
                  >
                    <div className="space-y-0.5 max-w-[70%]">
                      <span className="font-bold text-slate-900 block">{item.task}</span>
                      <span className="text-slate-500 block text-[11px] leading-tight">{item.req}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-[#1E5622] bg-[#E8F2E4] px-2 py-0.5 rounded border border-[#3D6B22]/20 block mb-1">
                        {item.status}
                      </span>
                      <span className=" text-[9px] font-bold text-slate-400">
                        {item.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clinical Precaution Alert */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-3 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-bold block text-amber-950 mb-0.5">
                    Fall Risk & Surgical Precaution (Right Hip ORIF):
                  </strong>
                  Patient has a high Morse Fall Risk score (65). Walker must be utilized for all ambulatory
                  transfers. No hip flexion beyond 90 degrees. Caregiver must verify gait belt application.
                </div>
              </div>
            </div>

            {/* Supervisory Assessment Protocol & Nursing Oversight */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E8F2E4] flex items-center justify-center text-[#1E5622]">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Supervisory Nursing Oversight
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Lead RN: <strong className="text-slate-800">{referral.assignedCoordinator}</strong>
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Protocol 1 */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Initial In-Home Clinical OASIS
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Scheduled Nov 24
                    </span>
                  </div>
                  <div className="font-bold text-slate-900">
                    Comprehensive In-Home Intake OASIS & Home Safety Assessment
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Mandatory in-person RN clinical assessment to establish baseline vital signs, surgical site
                    inspection, and develop individualized aide care plan.
                  </p>
                </div>

                {/* Protocol 2 */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Caregiver Staffing Competencies
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Match Required
                    </span>
                  </div>
                  <div className="font-bold text-slate-900">
                    Certified Aide with Dementia & Orthopedic Transfer Competency
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Caregiver must hold active transfer competency certification, experience with surgical recovery,
                    and calm demeanor for mild cognitive re-direction.
                  </p>
                </div>

                {/* Protocol 3 */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      State Mandated Supervisory Cycle
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5">Every 60 Calendar Days</div>
                    <div className="text-[11px] text-slate-500">Unannounced on-site caregiver observation</div>
                  </div>
                  <span className="text-xs font-semibold text-[#1E5622] bg-[#E8F2E4] px-2.5 py-1 rounded-lg border border-[#3D6B22]/20">
                    Mandated
                  </span>
                </div>
              </div>

              {/* DME & Assistive Devices */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Durable Medical Equipment (DME) in Residence
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white text-slate-700 border border-slate-200">
                    Front-Wheeled Walker
                  </span>
                  <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white text-slate-700 border border-slate-200">
                    Shower Chair with Back
                  </span>
                  <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white text-slate-700 border border-slate-200">
                    Raised Toilet Seat with Arms
                  </span>
                  <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white text-slate-700 border border-slate-200">
                    Gait Belt
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: DEMOGRAPHICS & CONTACT
         ========================================================================= */}
      {activeTab === "contact" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            {/* Patient Legal Identity & Family Contacts */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E8F2E4] flex items-center justify-center text-[#1E5622]">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Patient Identity & Family Contacts
                  </h3>
                </div>
                <span className="text-xs text-slate-500  font-bold">
                  {referral.id}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Full Legal Name</span>
                  <span className="font-bold text-slate-900">{referral.patientName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Age & Gender</span>
                  <span className="font-bold text-slate-900">{referral.age} years old ({referral.gender})</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Primary Telephone</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${referral.phone}`}
                      className="font-bold text-[#3D6B22] hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{referral.phone}</span>
                    </a>
                    <button
                      onClick={() => handleCopy(referral.phone, "Phone")}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      title="Copy phone"
                    >
                      {copiedField === "Phone" ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Email Address</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${referral.email}`}
                      className="font-bold text-[#3D6B22] hover:underline flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{referral.email}</span>
                    </a>
                    <button
                      onClick={() => handleCopy(referral.email, "Email")}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      title="Copy email"
                    >
                      {copiedField === "Email" ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Primary Language</span>
                  <span className="font-bold text-slate-900">English (Preferred)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Responsible Family / POA</span>
                  <span className="font-bold text-slate-900">Robert Whitfield (Son, Healthcare POA)</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 font-medium">POA Direct Line</span>
                  <a
                    href="tel:(555) 341-9920"
                    className="font-bold text-[#3D6B22] hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>(555) 341-9920</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Service Residence & EVV Geofence Parameters */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E8F2E4] flex items-center justify-center text-[#1E5622]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Service Residence & EVV Geofence
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  GPS Active
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Physical Address</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-right">{referral.address}</span>
                    <button
                      onClick={() => handleCopy(`${referral.address}, ${referral.city}, PA ${referral.zip}`, "Address")}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      title="Copy address"
                    >
                      {copiedField === "Address" ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">City, State, Zip</span>
                  <span className="font-bold text-slate-900">{referral.city}, PA {referral.zip}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Residence Classification</span>
                  <span className="font-bold text-slate-900">Single Family Home (1st Floor Accessible)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">EVV Perimeter Radius</span>
                  <span className="font-bold text-emerald-700">150 Meters Geofence Enforced</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Access Instructions</span>
                  <span className="font-bold text-slate-800">Key safe on side porch (Code on file)</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 font-medium">Environmental Hazards / Pets</span>
                  <span className="font-bold text-slate-900">No pets · Non-smoking household</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PAYER & SOURCE
         ========================================================================= */}
      {activeTab === "payer" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            {/* Inbound Referral Partner Information */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E8F2E4] flex items-center justify-center text-[#1E5622]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Inbound Referral Partner
                  </h3>
                </div>
                <span className="text-xs font-semibold text-[#1E5622] bg-[#E8F2E4] px-2.5 py-0.5 rounded-full border border-[#3D6B22]/20">
                  Hospital Partner
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Referring Organization</span>
                  <span className="font-bold text-slate-900">{referral.referralSource}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Discharge Contact Person</span>
                  <span className="font-bold text-slate-900">
                    {referral.referralSourceContact || "Dr. Karen Vance, Discharge Navigator"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Direct Telephone & Fax</span>
                  <span className="font-bold text-slate-900">(412) 555-8290 · Fax: (412) 555-8299</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Transmission Interface</span>
                  <span className="font-bold text-slate-900">Direct EHR Inbound API (FHIR Standard)</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 font-medium">Referral Ingestion Date</span>
                  <span className="font-bold text-slate-900">{referral.receivedDate} ({referral.daysInPipeline} days elapsed)</span>
                </div>
              </div>

              {/* Ingestion Packet Checklist */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Received Clinical Packet Documents
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Discharge Summary</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PT Rehab Evaluation</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CMS-485 Face-to-Face</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Medication List (MAR)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payer Authorization & Benefit Status */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E8F2E4] flex items-center justify-center text-[#1E5622]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Payer Authorization Details
                  </h3>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Coverage Active
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Primary Payer Name</span>
                  <span className="font-bold text-slate-900">{referral.payerName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Funding Stream</span>
                  <span className="font-bold text-slate-900">{referral.program}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Prior Authorization Code</span>
                  <span className=" font-bold text-[#3D6B22]">AUTH-2026-PA-88419</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Authorized Care Level</span>
                  <span className="font-bold text-slate-900">{referral.estimatedHoursPerWeek} Hours / Week</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Service Billing Code</span>
                  <span className=" font-bold text-slate-800">T1019 (Personal Care Assistance)</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 font-medium">Patient Liability (Co-Pay)</span>
                  <span className="font-bold text-emerald-700">$0.00 / Fully Covered State Waiver</span>
                </div>
              </div>

              {/* Coverage Effective Period */}
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/60 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Authorization Validity Window
                  </span>
                  <strong className="text-slate-900 font-bold block mt-0.5">
                    Nov 22, 2026 — May 21, 2027 (180 Days)
                  </strong>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: CHRONOLOGY & ACTIVITY LOG
         ========================================================================= */}
      {activeTab === "chronology" && (
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E8F2E4] flex items-center justify-center text-[#1E5622]">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Intake Chronology & Coordination Log
              </h3>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {["All", "Coordination", "Clinical", "Payer"].map((flt) => (
                <button
                  key={flt}
                  type="button"
                  onClick={() => setNoteFilter(flt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${noteFilter === flt
                    ? "bg-[#3D6B22] text-white shadow-2xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70"
                    }`}
                >
                  {flt}
                </button>
              ))}
            </div>
          </div>

          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="space-y-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Add Coordination Note</span>
              <div className="flex items-center gap-1.5">
                {(["Coordination", "Clinical", "Payer", "Family"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNoteCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${noteCategory === cat
                      ? "bg-[#3D6B22] text-white shadow-2xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Log an administrative, clinical, or family outreach note..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
              rows={3}
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#345C1D] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer shadow-md shadow-[#3D6B22]/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Coordination Note</span>
              </button>
            </div>
          </form>

          {/* Timeline List */}
          <div className="space-y-3 pt-2">
            {filteredNotes.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-slate-900 font-bold">{item.author}</strong>
                    <span className="text-[11px] text-slate-400">({item.role})</span>
                    {item.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{item.time}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
