"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Household, getHouseholdsFromStorage, saveHouseholdsToStorage } from "@/lib/households/mockData";
import {
  ArrowLeft,
  Home,
  Users,
  Heart,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  ArrowRight,
  Send,
  Building2,
  Sparkles,
  RefreshCw,
  CalendarPlus,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";
import { HouseholdContactFamilyModal } from "./modals/HouseholdContactFamilyModal";
import { HouseholdScheduleVisitModal } from "./modals/HouseholdScheduleVisitModal";

interface HouseholdDetailViewProps {
  initialHousehold: Household;
  backHref?: string;
  backLabel?: string;
}

export function HouseholdDetailView({
  initialHousehold,
  backHref = "/households",
  backLabel = "Back to Households Hub",
}: HouseholdDetailViewProps) {
  const router = useRouter();
  const [household, setHousehold] = useState<Household>(initialHousehold);
  const [activeTab, setActiveTab] = useState<
    "overview" | "family" | "authorizations" | "evv" | "timeline"
  >("overview");
  const [newNote, setNewNote] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Sync from localStorage if present
  React.useEffect(() => {
    const all = getHouseholdsFromStorage();
    const found = all.find(
      (h) =>
        h.id.toLowerCase() === initialHousehold.id.toLowerCase() ||
        h.code.toLowerCase() === initialHousehold.code.toLowerCase()
    );
    if (found) {
      setHousehold(found);
    }
  }, [initialHousehold.id, initialHousehold.code]);

  // Modals styled identically to /intake/pipeline/INQ-1042/
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const [notes, setNotes] = useState<
    { id: string; author: string; role: string; timestamp: string; title: string; details: string }[]
  >([
    {
      id: "n-1",
      author: "Dana Jenkins, MSW",
      role: "Case Manager",
      timestamp: "Today, 11:30 AM",
      title: "Quarterly Authorization Re-certification Logged",
      details: `Service authorization renewed for ${household.authorizedHoursPerWeek} hrs/wk under ${household.program}. Family confirmed schedule adherence.`,
    },
    {
      id: "n-2",
      author: "Coordination Ops",
      role: "Staff",
      timestamp: "Yesterday, 3:15 PM",
      title: "EVV Geofence Verified",
      details: `Home visit recorded with 100% GPS EVV verification. Caregiver ${household.primaryCaregiver.name} completed all scheduled tasks.`,
    },
    {
      id: "n-3",
      author: "Intake Coordinator",
      role: "Staff",
      timestamp: "2 weeks ago",
      title: "Household Connected Unit Created",
      details: `Household registered with care recipient ${household.client.name} and primary caregiver ${household.primaryCaregiver.name}.`,
    },
  ]);

  const tabs = [
    { id: "overview" as const, label: "Overview & Tri-Journey", icon: Home },
    { id: "family" as const, label: "Family & Care Team", icon: Users },
    { id: "authorizations" as const, label: "Authorizations & CM", icon: ShieldCheck },
    { id: "evv" as const, label: "EVV & Scheduling", icon: Calendar },
    { id: "timeline" as const, label: "Timeline & Activity Notes", icon: Clock },
  ];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setNotes((prev) => [
      {
        id: `n-${Date.now()}`,
        author: "Agency Operations",
        role: "Staff Coordinator",
        timestamp: "Just now",
        title: "Staff Coordination Note Added",
        details: newNote.trim(),
      },
      ...prev,
    ]);

    setNewNote("");
    toast.success("Household note logged to timeline");
  };

  const handleLogCommunication = (
    householdId: string,
    type: "call" | "email" | "note",
    noteText: string
  ) => {
    const newEntry = {
      id: `n-${Date.now()}`,
      author: "Coordination Specialist",
      role: "Operations Staff",
      timestamp: "Just now",
      title:
        type === "call"
          ? "Phone Contact Logged"
          : type === "email"
            ? "Email Sent to Household"
            : "Coordination Note Logged",
      details: noteText,
    };

    setNotes((prev) => [newEntry, ...prev]);
    toast.success("Communication logged to timeline");
  };

  const handleConfirmSchedule = (
    householdId: string,
    details: {
      scheduledDate: string;
      scheduledTime: string;
      clinician: string;
      type: string;
      notes: string;
    }
  ) => {
    const newEntry = {
      id: `n-${Date.now()}`,
      author: details.clinician,
      role: "Clinical Supervisor",
      timestamp: "Just now",
      title: `${details.type} Scheduled`,
      details: `Scheduled for ${details.scheduledDate} at ${details.scheduledTime}. Focus: ${details.notes}`,
    };

    setNotes((prev) => [newEntry, ...prev]);
  };

  const handleStatusChange = (newStatus: Household["authStatus"]) => {
    const updated = {
      ...household,
      authStatus: newStatus,
    };
    setHousehold(updated);
    setIsStatusDropdownOpen(false);

    const all = getHouseholdsFromStorage();
    const idx = all.findIndex((h) => h.id === household.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveHouseholdsToStorage(all);
    }

    toast.success(`Authorization status updated to ${newStatus}`);
  };

  const householdInitials = household.name
    .replace(/^The\s+/i, "")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-16 animate-in fade-in duration-300">
      {/* Back Navigation Button */}
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* 01. Hero Identity & Actions Card (Aligned with /intake/pipeline/INQ-1042/) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] border border-slate-200 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar Box with Floating Status Badge */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#1B3414]/10 to-emerald-100/60 text-[#1B3414] border-2 border-white shadow-[0_6px_24px_rgba(0,0,0,0.06)] flex items-center justify-center text-2xl font-extrabold">
              {householdInitials}
            </div>
            <div className="absolute -bottom-2 -right-2">
              <span
                className={`border-2 border-white shadow-xs font-semibold text-white whitespace-nowrap px-2.5 py-0.5 text-[10px] rounded-full uppercase tracking-wider ${household.authStatus === "Approved"
                  ? "bg-[#3D6B22]"
                  : household.authStatus === "Expiring Soon"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                  }`}
              >
                {household.authStatus}
              </span>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {household.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              <span>
                Client: <strong className="text-slate-900 font-semibold">{household.client.name}</strong>
              </span>
              <span className="text-slate-300">·</span>
              <span>
                Caregiver: <strong className="text-slate-900 font-semibold">{household.primaryCaregiver.name}</strong>
              </span>
              <span className="text-slate-300">·</span>
              <span>
                Program: <strong className="text-slate-900 font-semibold">{household.program}</strong>
              </span>
              <span className="text-slate-300">·</span>
              <span>
                Weekly Hours: <strong className="text-slate-900 font-semibold">{household.scheduledHoursPerWeek} / {household.authorizedHoursPerWeek} hrs/wk</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Column */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-3.5 lg:pt-0 border-slate-100 self-center">
          {/* Schedule Visit CTA - Opens interactive modal */}
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer whitespace-nowrap"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-sky-700" />
            <span>Schedule Visit</span>
          </button>

          {/* Authorizations Primary CTA */}
          <Link
            href="/billing/authorizations"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] active:scale-[0.98] transition-all rounded-xl shadow-[0_4px_16px_rgba(61,107,34,0.25)] hover:shadow-[0_6px_24px_rgba(61,107,34,0.35)] cursor-pointer whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Manage Auth</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {/* 02. Floating Pill Navigation Bar (Identical to /intake/pipeline/INQ-1042/) */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${isActive
                ? "bg-[#3D6B22] text-white shadow-[0_4px_16px_rgba(61,107,34,0.25)]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
          {/* Left Column (2 cols): Residence & Three Connected Journeys */}
          <div className="lg:col-span-2 space-y-5">
            {/* Household Demographics & Residence */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Home className="w-4 h-4 text-[#3D6B22]" />
                  Household Residence & Contact
                </h3>
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#1E5622] bg-[#E3F1D9] hover:bg-[#d5eac8] rounded-lg transition-colors cursor-pointer"
                >
                  <Phone className="w-3 h-3" />
                  <span>Contact</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Household Name</span>
                  <span className="text-sm font-semibold text-slate-800 block">{household.name}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Household Code</span>
                  <span className=" text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/70 inline-block mt-0.5">
                    {household.code}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Physical Residence Address</span>
                  <p className="text-xs font-medium text-slate-700 flex items-start gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{household.address}, {household.city}, {household.state} {household.zip}</span>
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Primary Telephone</span>
                  <a href={`tel:${household.phone}`} className="text-sm font-semibold text-[#3D6B22] hover:underline flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {household.phone}
                  </a>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-y-3 gap-x-4">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Service Program</span>
                  <span className="text-xs font-semibold text-slate-800 block">{household.program}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Authorized Hours & Auth</span>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="text-xs font-semibold text-slate-800">{household.scheduledHoursPerWeek} / {household.authorizedHoursPerWeek} hrs/wk</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${household.authStatus === "Approved"
                      ? "bg-[#E3F1D9] text-[#1E5622] border-[#3D6B22]/20"
                      : household.authStatus === "Expiring Soon"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : household.authStatus === "Expired"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                      {household.authStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">EVV Compliance</span>
                  <span className="text-xs font-semibold text-emerald-700 block">{household.evvComplianceRate}% compliant</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Last Recorded Visit</span>
                  <span className="text-xs font-medium text-slate-700 block">{household.lastVisitDate}</span>
                </div>
              </div>
            </Card>

            {/* Three Connected Journeys Tracker (RULES.md #L96) */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#3D6B22]" />
                  Three Connected Journeys (LiliSare Operational Flow)
                </h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-[#1E5622] border border-emerald-200/70">
                  Synchronized
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. Client Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">1. Client Care</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200/70">
                      {household.triJourneyStatus.clientStage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold">
                    {household.client.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {household.client.relationship || "Care Recipient"}
                  </p>
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#3D6B22] h-1.5 rounded-full"
                      style={{ width: household.triJourneyStatus.clientStage === "Care Active" ? "100%" : "70%" }}
                    />
                  </div>
                </div>

                {/* 2. Caregiver Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">2. Caregiver Workforce</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200/70">
                      {household.triJourneyStatus.caregiverStage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold">
                    {household.primaryCaregiver.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {household.primaryCaregiver.relationship || "Primary Caregiver"}
                  </p>
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#3D6B22] h-1.5 rounded-full"
                      style={{ width: household.triJourneyStatus.caregiverStage === "Active" ? "100%" : "60%" }}
                    />
                  </div>
                </div>

                {/* 3. Agency Operations Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">3. Agency Ops</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200/70">
                      {household.triJourneyStatus.opsStage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold">
                    Auth: {household.scheduledHoursPerWeek} / {household.authorizedHoursPerWeek} hrs
                  </p>
                  <p className="text-[11px] text-slate-500">
                    EVV Verified Schedule
                  </p>
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#3D6B22] h-1.5 rounded-full"
                      style={{ width: household.authStatus === "Approved" ? "100%" : "50%" }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (1 col): Case Manager Card & Quick Action Card */}
          <div className="space-y-5">
            {/* Case Manager Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#3D6B22]" />
                  Assigned Case Manager
                </h3>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md">
                  Waiver Agency
                </span>
              </div>

              {/* Case Manager Profile */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#1E5622] font-semibold flex items-center justify-center text-sm shrink-0">
                  {household.caseManager.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{household.caseManager.name}</p>
                  <p className="text-xs text-slate-500 truncate">{household.caseManager.agency}</p>
                </div>
              </div>

              {/* Details Breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Telephone</span>
                  <a href={`tel:${household.caseManager.phone}`} className="text-xs font-semibold text-[#3D6B22] hover:underline flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {household.caseManager.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Email Address</span>
                  <a href={`mailto:${household.caseManager.email}`} className="text-xs font-semibold text-[#3D6B22] hover:underline flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {household.caseManager.email}
                  </a>
                </div>
              </div>
            </Card>

            {/* Quick Action Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#3D6B22]" />
                  Connected Records
                </h3>
              </div>
              <div className="space-y-2.5">
                <Link
                  href={`/clients/${household.client.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 hover:border-[#3D6B22]/50 hover:bg-[#F2F8EE]/40 transition-all text-xs font-semibold text-slate-800 group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-semibold text-xs shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-800 group-hover:text-[#1E5622] transition-colors">{household.client.name}</span>
                      <span className="block text-[11px] font-normal text-slate-400">Client Chart</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#3D6B22] group-hover:translate-x-0.5 transition-all" />
                </Link>
                <Link
                  href={`/caregivers/${household.primaryCaregiver.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 hover:border-[#3D6B22]/50 hover:bg-[#F2F8EE]/40 transition-all text-xs font-semibold text-slate-800 group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-semibold text-xs shrink-0">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-800 group-hover:text-[#1E5622] transition-colors">{household.primaryCaregiver.name}</span>
                      <span className="block text-[11px] font-normal text-slate-400">Caregiver File</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#3D6B22] group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 02: Family & Care Team */}
      {activeTab === "family" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
          {/* Client Member Card */}
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {household.client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{household.client.name}</h3>
                  <span className="text-[11px] text-slate-500">Care Recipient (Client)</span>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {household.client.status}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Relationship:</span>
                <span className="font-semibold text-slate-800">{household.client.relationship}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Telephone:</span>
                <span className="font-medium text-slate-800">{household.client.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-800">{household.client.email}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Link
                href={`/clients/${household.client.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline"
              >
                <span>View Dedicated Client Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* Primary Caregiver Member Card */}
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1E5622] flex items-center justify-center font-bold text-sm">
                  {household.primaryCaregiver.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{household.primaryCaregiver.name}</h3>
                  <span className="text-[11px] text-slate-500">Designated Primary Caregiver</span>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {household.primaryCaregiver.status}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Role & Relationship:</span>
                <span className="font-semibold text-slate-800">{household.primaryCaregiver.relationship}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Telephone:</span>
                <span className="font-medium text-slate-800">{household.primaryCaregiver.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-800">{household.primaryCaregiver.email}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Link
                href={`/caregivers/${household.primaryCaregiver.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline"
              >
                <span>View Dedicated Caregiver Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 03: Authorizations & Case Management */}
      {activeTab === "authorizations" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-[#3D6B22]" />
              Service Authorization Parameters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Care Program</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{household.program}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Authorized Weekly Hours</span>
                <span className="font-extrabold text-slate-900 text-lg mt-0.5 block">{household.authorizedHoursPerWeek} hrs/wk</span>
              </div>
              <div>
                <span className="text-slate-500 block">Scheduled Weekly Hours</span>
                <span className="font-extrabold text-slate-900 text-lg mt-0.5 block">{household.scheduledHoursPerWeek} hrs/wk</span>
              </div>
              <div>
                <span className="text-slate-500 block">Auth Expiry Date</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{household.authExpiry}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Status</span>
                <span className="font-bold text-emerald-700 mt-0.5 block">{household.authStatus}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Fulfillment Rate</span>
                <span className="font-bold text-[#3D6B22] mt-0.5 block">
                  {Math.round((household.scheduledHoursPerWeek / household.authorizedHoursPerWeek) * 100)}% Fulfilled
                </span>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-[#3D6B22]" />
              Case Manager & State Agency
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Assigned Official</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{household.caseManager.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">State Agency</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{household.caseManager.agency}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Direct Telephone</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{household.caseManager.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Direct Email</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{household.caseManager.email}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 04: EVV & Scheduling */}
      {activeTab === "evv" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-[#3D6B22]" />
              Electronic Visit Verification (EVV)
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Compliance Rate:</span>
                <span className="font-extrabold text-emerald-700 text-base">{household.evvComplianceRate}% Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last Recorded Visit:</span>
                <span className="font-semibold text-slate-800">{household.lastVisitDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Geofence Compliance:</span>
                <span className="font-semibold text-slate-800">100% Home GPS Location Match</span>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-blue-600" />
              Scheduling Dispatch & Calendar
            </h3>
            <p className="text-xs text-slate-500">
              Weekly shifts are planned with caregiver {household.primaryCaregiver.name} across authorized hours.
            </p>
            <div className="pt-2">
              <Link
                href="/scheduling"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_16px_rgba(61,107,34,0.25)]"
              >
                <Calendar className="w-3.5 h-3.5 text-white" />
                <span>Open Shift Scheduler</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 05: Timeline & Activity Notes */}
      {activeTab === "timeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {/* Note Logging Form */}
          <div className="lg:col-span-1">
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <FileText className="w-4 h-4 text-[#3D6B22]" />
                Log Coordination Note
              </h3>
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  rows={4}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record coordination update, visit check-in, or case manager follow-up..."
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

          {/* Timeline History */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Clock className="w-4 h-4 text-[#3D6B22]" />
                Household Activity History
              </h3>
              <div className="relative pl-6 space-y-5 border-l-2 border-slate-100">
                {notes.map((n) => (
                  <div key={n.id} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#3D6B22]" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 text-xs">{n.title}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.details}</p>
                    <span className="text-[10px] text-slate-400 block mt-1 ">
                      Logged by {n.author} ({n.role})
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Interactive Modals styled identically to /intake/pipeline/INQ-1042/ */}
      <HouseholdContactFamilyModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        household={household}
        onLogCommunication={handleLogCommunication}
      />
      <HouseholdScheduleVisitModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        household={household}
        onConfirmSchedule={handleConfirmSchedule}
      />
    </div>
  );
}
