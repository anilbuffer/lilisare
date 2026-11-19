"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Household } from "@/lib/households/mockData";
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
  ExternalLink,
  RefreshCw,
  BadgeCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";

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
        author: "Agency Admin",
        role: "Staff",
        timestamp: "Just now",
        title: "Staff Coordination Note Added",
        details: newNote.trim(),
      },
      ...prev,
    ]);

    setNewNote("");
    toast.success("Household note logged to timeline");
  };

  const handleStatusChange = (newStatus: Household["authStatus"]) => {
    setHousehold((prev) => ({
      ...prev,
      authStatus: newStatus,
    }));
    setIsStatusDropdownOpen(false);
    toast.success(`Authorization status updated to ${newStatus}`);
  };

  const householdInitials = household.name
    .replace(/^The\s+/i, "")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-16 animate-in fade-in duration-300">
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

      {/* 01. Hero Identity & Actions Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] border border-slate-200 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar Box with Floating Status Badge */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#1B3414]/10 to-emerald-100/60 text-[#1B3414] border-2 border-white shadow-[0_6px_24px_rgba(0,0,0,0.06)] flex items-center justify-center text-2xl font-extrabold">
              {householdInitials}
            </div>
            <div className="absolute -bottom-2 -right-2">
              <span
                className={`border-2 border-white shadow-xs font-semibold text-white whitespace-nowrap px-2.5 py-0.5 text-[10px] rounded-full uppercase tracking-wider ${
                  household.authStatus === "Approved"
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

          {/* Heading & Badges */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {household.code}
              </span>
              {household.triJourneyStatus.bottleneckMessage && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                  Bottleneck Active
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200">
                {household.triJourneyStatus.clientStage}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              {household.name}
            </h1>

            {/* Metadata Line */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mb-3">
              <span className="font-medium text-slate-700">
                Client: <strong className="text-slate-900 font-semibold">{household.client.name}</strong>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="font-medium text-slate-700">
                Caregiver: <strong className="text-slate-900 font-semibold">{household.primaryCaregiver.name}</strong>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {household.city}, {household.state} {household.zip}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {household.phone}
              </span>
            </div>

            {/* Program & Safety Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 text-[#1E5622] border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {household.program}
              </span>
              <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                Auth: {household.scheduledHoursPerWeek} / {household.authorizedHoursPerWeek} hrs/wk
              </span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                EVV Compliance: {household.evvComplianceRate}%
              </span>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                Last Visit: {household.lastVisitDate}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Column */}
        <div className="flex flex-col items-start lg:items-end justify-between gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
          <div className="flex items-center gap-2 self-stretch lg:self-auto justify-between lg:justify-end">
            <span className="text-xs font-semibold text-slate-500">Service Units</span>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-100 text-[#1E5622] border border-emerald-200 font-bold rounded-full">
              {household.scheduledHoursPerWeek} / {household.authorizedHoursPerWeek} hrs verified
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <a
              href={`tel:${household.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#3D6B22]" />
              <span>Contact Family</span>
            </a>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Summary</span>
            </button>

            {/* Advance Status Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>{household.authStatus}</span>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                    Update Auth Status
                  </div>
                  {(["Approved", "Pending Review", "Expiring Soon", "Expired"] as Household["authStatus"][]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                          household.authStatus === st
                            ? "font-semibold text-[#3D6B22] bg-emerald-50/50"
                            : "text-slate-800"
                        }`}
                      >
                        <span>{st}</span>
                        {household.authStatus === st && <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Authorizations Primary CTA */}
            <Link
              href="/billing/authorizations"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1B3414] hover:bg-[#274C1D] active:scale-[0.98] transition-all rounded-xl shadow-[0_4px_16px_rgba(27,52,20,0.25)] hover:shadow-[0_6px_24px_rgba(27,52,20,0.35)] cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#93C573]" />
              <span>Manage Auth</span>
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
          {/* Left Column (2 cols): Residence & Three Connected Journeys */}
          <div className="lg:col-span-2 space-y-5">
            {/* Household Demographics & Residence */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Home className="w-4.5 h-4.5 text-[#3D6B22]" />
                Household Residence & Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Household Name</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{household.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Household Code</span>
                  <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{household.code}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Physical Residence Address</span>
                  <span className="font-medium text-slate-800 mt-0.5 block flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{household.address}, {household.city}, {household.state} {household.zip}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Primary Telephone</span>
                  <a href={`tel:${household.phone}`} className="font-medium text-[#3D6B22] hover:underline flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {household.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Service Program</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{household.program}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">EVV Verification Rate</span>
                  <span className="font-semibold text-emerald-700 mt-0.5 block">{household.evvComplianceRate}% compliant</span>
                </div>
              </div>
            </Card>

            {/* Three Connected Journeys Tracker (RULES.md #L96) */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Sparkles className="w-4.5 h-4.5 text-[#3D6B22]" />
                Three Connected Journeys (LiliSare Operational Flow)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                {/* 1. Client Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-slate-500">
                    <span>1. Client Care</span>
                    <span className="text-emerald-700">{household.triJourneyStatus.clientStage}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {household.client.name} ({household.client.relationship})
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-[#3D6B22] h-1.5 rounded-full"
                      style={{ width: household.triJourneyStatus.clientStage === "Care Active" ? "100%" : "70%" }}
                    />
                  </div>
                </div>

                {/* 2. Caregiver Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-slate-500">
                    <span>2. Caregiver Workforce</span>
                    <span className="text-emerald-700">{household.triJourneyStatus.caregiverStage}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {household.primaryCaregiver.name} ({household.primaryCaregiver.relationship})
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-[#3D6B22] h-1.5 rounded-full"
                      style={{ width: household.triJourneyStatus.caregiverStage === "Active" ? "100%" : "60%" }}
                    />
                  </div>
                </div>

                {/* 3. Agency Operations Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-slate-500">
                    <span>3. Agency Ops</span>
                    <span className="text-emerald-700">{household.triJourneyStatus.opsStage}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    Auth: {household.scheduledHoursPerWeek} / {household.authorizedHoursPerWeek} hrs verified
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
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
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-[#3D6B22]" />
                Assigned Case Manager
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Case Manager</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{household.caseManager.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Waiver Agency</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block">{household.caseManager.agency}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Telephone</span>
                  <a href={`tel:${household.caseManager.phone}`} className="font-semibold text-[#3D6B22] hover:underline flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {household.caseManager.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  <a href={`mailto:${household.caseManager.email}`} className="font-semibold text-[#3D6B22] hover:underline flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {household.caseManager.email}
                  </a>
                </div>
              </div>
            </Card>

            {/* Quick Action Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-2.5">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Connected Records
              </h3>
              <Link
                href="/clients"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#F2F8EE] border border-slate-200 transition-colors text-xs font-semibold text-slate-800 group"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{household.client.name} (Client Chart)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#3D6B22] transition-colors" />
              </Link>
              <Link
                href="/caregivers"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#F2F8EE] border border-slate-200 transition-colors text-xs font-semibold text-slate-800 group"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-600" />
                  <span>{household.primaryCaregiver.name} (Caregiver File)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#3D6B22] transition-colors" />
              </Link>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 02: Family & Care Team */}
      {activeTab === "family" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
          {/* Client Member Card */}
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
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
                href="/clients"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline"
              >
                <span>View Full Client Chart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* Primary Caregiver Member Card */}
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
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
                href="/caregivers"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline"
              >
                <span>View Full Caregiver File</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 03: Authorizations & Case Management */}
      {activeTab === "authorizations" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-[#3D6B22]" />
              Service Authorization Parameters
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Authorized Hours</span>
                <span className="font-extrabold text-slate-900 text-lg mt-0.5 block">{household.authorizedHoursPerWeek} hrs/wk</span>
              </div>
              <div>
                <span className="text-slate-500 block">Scheduled Active Hours</span>
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
            </div>
          </Card>

          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
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
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
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

          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5 text-[#93C573]" />
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
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-3">
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

          {/* Timeline History */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
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
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                      Logged by {n.author} ({n.role})
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
