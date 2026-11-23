"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Home,
  Shield,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  User,
  Heart,
  Globe,
  Activity,
  Pill,
  Brain,
  Play,
  Volume2,
  FileText,
  Receipt,
  MessageSquare,
  History,
  ClipboardList,
  Sparkles,
  Download,
  Plus,
  RefreshCw,
  ChevronDown,
  UserCheck,
  Building2,
  Check,
  Send,
  AlertCircle,
  Stethoscope,
  HeartHandshake,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Award,
  Pause,
  Upload,
} from "lucide-react";
import { getClientById, getClientsFromStorage, saveClientsToStorage } from "@/lib/clients/mockData";
import { ClientRecord, ClientStatus, ClientActivityLog } from "@/types/client";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";
import { ClientContactFamilyModal } from "@/components/clients/modals/ClientContactFamilyModal";
import { ClientScheduleVisitModal } from "@/components/clients/modals/ClientScheduleVisitModal";

interface AdminClientDetailViewProps {
  clientId: string;
}

// 9 Exact Tabs matching user reference
type ActiveTabType =
  | "overview"
  | "care-plan"
  | "visits"
  | "medications"
  | "documents"
  | "billing"
  | "communication"
  | "chronology"
  | "assessments";

interface TabDef {
  id: ActiveTabType;
  label: string;
  icon: React.ElementType;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: User },
  { id: "care-plan", label: "Care Plan", icon: Heart },
  { id: "visits", label: "Visits", icon: Calendar },
  { id: "medications", label: "Medications", icon: Pill },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "communication", label: "Communication", icon: MessageSquare },
  { id: "chronology", label: "Chronology", icon: Clock },
  { id: "assessments", label: "Assessments", icon: ClipboardList },
];

export function AdminClientDetailView({ clientId }: AdminClientDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [client, setClient] = useState<ClientRecord | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTabType>("overview");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [newQuickNote, setNewQuickNote] = useState("");

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  useEffect(() => {
    const found = getClientById(clientId);
    if (found) {
      setClient(found);
    }
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const match = TABS.find((t) => t.id === tabParam.toLowerCase());
      if (match) setActiveTab(match.id);
    }
  }, [clientId, searchParams]);

  if (!client) {
    return (
      <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Client Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          Client ID &quot;{clientId}&quot; does not exist or has been removed.
        </p>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#3D6B22] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients Directory</span>
        </Link>
      </div>
    );
  }

  const clientInitials = client.name
    .replace(/^The\s+/i, "")
    .slice(0, 2)
    .toUpperCase();

  const handleUpdateStatus = (newStatus: ClientStatus) => {
    const updated: ClientRecord = {
      ...client,
      status: newStatus,
      updatedAtRelative: "Just now",
      activity: [
        {
          id: `act-${Date.now()}`,
          timestamp: "Just now",
          type: "status_change",
          author: "Agency Executive",
          authorRole: "Agency Administrator",
          title: `Status Changed to ${newStatus}`,
          details: `Client status was manually transitioned to ${newStatus} by Agency Admin.`,
        },
        ...client.activity,
      ],
    };
    setClient(updated);
    setIsStatusDropdownOpen(false);

    const all = getClientsFromStorage();
    const index = all.findIndex((c) => c.id === client.id);
    if (index !== -1) {
      all[index] = updated;
      saveClientsToStorage(all);
    }
    toast.success(`Client status updated to ${newStatus}`);
  };

  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuickNote.trim()) return;

    const newLog: ClientActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: "Just now",
      type: "note",
      author: "Agency Administrator",
      authorRole: "Executive Staff",
      title: "Administrative Coordination Note",
      details: newQuickNote.trim(),
    };

    const updated: ClientRecord = {
      ...client,
      activity: [newLog, ...client.activity],
    };

    setClient(updated);
    setNewQuickNote("");

    const all = getClientsFromStorage();
    const index = all.findIndex((c) => c.id === client.id);
    if (index !== -1) {
      all[index] = updated;
      saveClientsToStorage(all);
    }

    toast.success("Note recorded to client activity feed");
  };

  const handleLogCommunication = (
    clientId: string,
    type: "call" | "email" | "note",
    noteText: string
  ) => {
    const newLog: ClientActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: "Just now",
      type: type === "call" ? "call" : type === "email" ? "email" : "note",
      author: "Agency Admin",
      authorRole: "Executive Staff",
      title:
        type === "call"
          ? "Family Phone Call Logged"
          : type === "email"
            ? "Email Communication Recorded"
            : "Family Coordination Note",
      details: noteText,
    };

    const updated: ClientRecord = {
      ...client,
      activity: [newLog, ...client.activity],
    };

    setClient(updated);

    const all = getClientsFromStorage();
    const index = all.findIndex((c) => c.id === client.id);
    if (index !== -1) {
      all[index] = updated;
      saveClientsToStorage(all);
    }
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-4 pb-16 animate-in fade-in duration-300">
      {/* =========================================================================
          BACK NAVIGATION (Matching /intake/pipeline/INQ-1042/ exactly)
         ========================================================================= */}
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Clients Directory</span>
        </Link>
      </div>

      {/* =========================================================================
          01. HERO IDENTITY & ACTIONS CARD (Matching INQ-1042 PatientHeader Style)
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
          {/* Avatar Box with Floating Status Badge */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center text-xl font-bold shadow-2xs">
              {clientInitials}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <span
                className={`border-2 border-white shadow-xs font-bold text-white whitespace-nowrap px-2 py-0.5 text-[10px] rounded-full tracking-wide ${client.status === "Active"
                  ? "bg-[#3D6B22]"
                  : (client.status as string) === "Hospitalized"
                    ? "bg-amber-500"
                    : "bg-slate-500"
                  }`}
              >
                {client.status}
              </span>
            </div>
          </div>

          {/* Client Heading: Client Name & ID on row 1, Program Name directly below */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate sm:overflow-visible sm:whitespace-normal">
                {client.name}
              </h1>
              <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200/70">
                {client.id}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
                {client.carePlan.program.split("(")[0].trim()}
              </span>
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
              <span>{client.status}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                  Update Status
                </div>
                {(["Active", "Onboarding", "On Hold", "Discharged"] as ClientStatus[]).map((stg) => (
                  <button
                    key={stg}
                    onClick={() => handleUpdateStatus(stg)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${client.status === stg ? "font-semibold text-[#3D6B22] bg-emerald-50/50" : "text-slate-800"
                      }`}
                  >
                    <span>{stg}</span>
                    {client.status === stg && <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Edit Profile */}
          <Link
            href={`/admin/clients/${client.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit</span>
          </Link>

          {/* Primary Action Button (Matching INQ-1042 Primary CTA) */}
          {client.household.code && (
            <Link
              href={`/admin/households/${client.household.code.toLowerCase()}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#2C5217] active:scale-[0.98] transition-all rounded-xl shadow-[0_2px_8px_rgba(61,107,34,0.2)] hover:shadow-[0_4px_12px_rgba(61,107,34,0.25)] cursor-pointer whitespace-nowrap"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Household Hub</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
            </Link>
          )}
        </div>
      </div>


      {/* =========================================================================
          02. CLEAN TAB NAVIGATION BAR (Matching User Reference Exactly)
         ========================================================================= */}
      <div className="flex items-center gap-1 p-1 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-2xl overflow-x-auto no-scrollbar border border-slate-200 w-full">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap rounded-xl cursor-pointer ${isActive
                ? "bg-[#EAF5E9] text-[#2B5E1A] border border-[#3D6B22]/20 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          03. TAB 1: OVERVIEW (Matching User Reference + INQ-1042 Card Structure)
         ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* ---------------------------------------------------------------
                LEFT SECTION (8 Cols): Demographics, Insurance, Risk Summary
               --------------------------------------------------------------- */}
            <div className="lg:col-span-8 space-y-5">
              {/* Demographics and Insurance Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Demographics Card */}
                <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#3D6B22]" />
                        <span>Demographics</span>
                      </h3>
                    </div>

                    {/* Key-Value Fields */}
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-[11px] font-medium text-slate-400">DOB & Age</span>
                        <span className="text-sm font-semibold text-slate-800">
                          {client.dob} ({client.age} years old)
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-[11px] font-medium text-slate-400">Gender</span>
                        <span className="text-sm font-semibold text-slate-800">{client.gender}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-[11px] font-medium text-slate-400">Residence Address</span>
                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 text-right max-w-[200px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{client.household.address}, {client.household.city}, {client.household.state}</span>
                        </span>
                      </div>
                      {client.household.code && (
                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                          <span className="text-[11px] font-medium text-slate-400">Household</span>
                          <Link
                            href={`/admin/households/${client.household.code.toLowerCase()}`}
                            className="text-xs font-bold text-[#3D6B22] hover:underline flex items-center gap-1"
                          >
                            <Home className="w-3 h-3 text-[#3D6B22]" />
                            <span>{client.household.name} ({client.household.code})</span>
                          </Link>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-[11px] font-medium text-slate-400">Language</span>
                        <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          {client.primaryLanguage || "English"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-[11px] font-medium text-slate-400">Phone</span>
                        <a
                          href={`tel:${client.primaryContact.phone}`}
                          className="text-sm font-semibold text-[#3D6B22] hover:underline flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {client.primaryContact.phone || "(610) 555-0148"}
                        </a>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[11px] font-medium text-slate-400">Email</span>
                        <a
                          href={`mailto:${client.primaryContact.email}`}
                          className="text-sm font-semibold text-[#3D6B22] hover:underline flex items-center gap-1.5 truncate max-w-[180px]"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {client.primaryContact.email || "meg.wcho@gmail.com"}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contacts Section */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                      Emergency Contacts
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">
                            {client.emergencyContact?.name || 'Margaret "Meg" Whitfield-Cho'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {client.emergencyContact?.relationship || "Daughter / POA"}
                          </div>
                        </div>
                        <a
                          href={`tel:${client.emergencyContact?.phone || "(610) 555-0192"}`}
                          className="inline-flex items-center gap-1 text-[#3D6B22] hover:text-[#2C5217] font-semibold text-xs bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100"
                        >
                          <Phone className="w-3 h-3 text-[#3D6B22]" />
                          <span>{client.emergencyContact?.phone || "(610) 555-0192"}</span>
                        </a>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div>
                          <div className="font-semibold text-slate-900">
                            {client.primaryContact?.name || "David Whitfield"}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {client.primaryContact?.relationship || "Son"}
                          </div>
                        </div>
                        <a
                          href={`tel:${client.primaryContact?.phone || "(215) 555-0873"}`}
                          className="inline-flex items-center gap-1 text-[#3D6B22] hover:text-[#2C5217] font-semibold text-xs bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100"
                        >
                          <Phone className="w-3 h-3 text-[#3D6B22]" />
                          <span>{client.primaryContact?.phone || "(215) 555-0873"}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 2. Insurance Card */}
                <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#3D6B22]" />
                        <span>Insurance</span>
                      </h3>
                    </div>

                    {/* Primary Payer Box */}
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 mb-2.5">
                      <div className="text-[11px] font-medium text-slate-400 mb-0.5">
                        Primary Payer
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {client.authorization?.payer || "Medicare Part A & B"}
                      </div>
                    </div>

                    {/* Secondary Payer Box */}
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 mb-3.5">
                      <div className="text-[11px] font-medium text-slate-400 mb-0.5">
                        Secondary Payer
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        AARP Supplemental
                      </div>
                    </div>

                    {/* Key Values */}
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-[11px] font-medium text-slate-400">Policy Number</span>
                        <span className="text-sm font-bold text-slate-800 font-mono">
                          {client.authorization?.authNumber || "MCR-9842100"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-[11px] font-medium text-slate-400">Group Number</span>
                        <span className="text-sm font-bold text-slate-800 font-mono">GRP-120</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[11px] font-medium text-slate-400">Authorization Status</span>
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Approved
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 3. Risk Summary Card (Spanning width under Demographics & Insurance) */}
              <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="pb-3 mb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    Risk Summary
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Fall Risk */}
                  <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto mb-2 shadow-2xs">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-medium text-slate-600 mb-0.5">
                      Fall Risk
                    </div>
                    <div className="text-xl font-bold text-rose-600 mb-1">
                      High
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Last Assessed: 2026-06-15
                    </div>
                  </div>

                  {/* Medication Risk */}
                  <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mx-auto mb-2 shadow-2xs">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-medium text-slate-600 mb-0.5">
                      Medication Risk
                    </div>
                    <div className="text-xl font-bold text-amber-600 mb-1">
                      Medium
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Last Assessed: 2026-06-15
                    </div>
                  </div>

                  {/* Cognitive Status */}
                  <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-2 shadow-2xs">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-medium text-slate-600 mb-0.5">
                      Cognitive Status
                    </div>
                    <div className="text-xl font-bold text-emerald-600 mb-1">
                      Low
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Last Assessed: 2026-01-10
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* ---------------------------------------------------------------
                RIGHT SECTION (4 Cols): Quick Actions, Care Team & Recent Activity
               --------------------------------------------------------------- */}
            <div className="lg:col-span-4 space-y-5">
              {/* Quick Actions Card */}
              <Card className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#3D6B22]" />
                    <span>Quick Actions</span>
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400">
                    Direct Coordination
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-[#3D6B22] bg-emerald-50/80 hover:bg-emerald-100/70 border border-emerald-200/70 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#3D6B22]" />
                    <span>Contact Family</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100/70 border border-blue-200/70 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Schedule</span>
                  </button>
                </div>
              </Card>

              {/* 1. Care Team Card */}
              <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3.5">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    Care Team
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Primary Care Physician */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#3D6B22] font-bold text-xs shrink-0">
                      PP
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        Dr. Amanda Chen
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Primary Care Physician • NPI: 1982739102
                      </div>
                    </div>
                  </div>

                  {/* Case Manager */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#3D6B22] font-bold text-xs shrink-0">
                      CM
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {client.assignedCareTeam?.caseManager?.name || "Sarah Jenkins, MSW"}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Case Manager • {client.assignedCareTeam?.caseManager?.agency || "State Human Services"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Caregivers Section */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Primary Caregivers
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs shrink-0">
                        MS
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {client.assignedCareTeam?.primaryCaregiver?.name || "Maria Santos, CNA"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {client.assignedCareTeam?.primaryCaregiver?.relationship || "Primary Field Caregiver (W-2)"}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/admin/caregivers/${client.assignedCareTeam?.primaryCaregiver?.id || "cg-102"}`}
                      className="text-[#3D6B22] hover:text-[#2C5217] p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                      title="View Caregiver Profile"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </Card>

              {/* 2. Recent Activity Card with Audio Recording Player & Quick Note */}
              <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#3D6B22]" />
                    <span>Recent Activity</span>
                  </h3>
                </div>

                {/* Timeline Items */}
                <div className="space-y-4 text-xs">
                  {/* Item 1: Inbound Call */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          Inbound Call - Robert Rigby (Son)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Jul 9, 7:45 PM
                      </div>

                      {/* Working Audio Player Box */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsPlayingAudio(!isPlayingAudio);
                            toast.info(isPlayingAudio ? "Audio playback paused" : "Playing recorded call...");
                          }}
                          className="w-7 h-7 rounded-full bg-[#3D6B22] text-white flex items-center justify-center hover:bg-[#2C5217] transition-all shrink-0 cursor-pointer shadow-xs"
                        >
                          {isPlayingAudio ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="bg-[#3D6B22] h-full transition-all duration-300"
                              style={{ width: isPlayingAudio ? "65%" : "25%" }}
                            />
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-medium text-slate-600">
                          Audio Recording • 03:45
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Item 2: Visit Completed */}
                  <div className="flex items-start gap-3 pt-2.5 border-t border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        EVV Shift verified by David Kim
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Jul 9, 4:00 PM • GPS Geofence Match (0.02 mi)
                      </div>
                    </div>
                  </div>

                  {/* Item 3: SMS */}
                  <div className="flex items-start gap-3 pt-2.5 border-t border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="font-bold text-slate-900">
                        SMS from Jessica Smith
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Jul 9, 2:50 PM
                      </div>
                      <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-2.5 text-slate-700 text-xs italic">
                        &quot;Client is experiencing mild discomfort in left leg today.&quot;
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Add Admin Note Form */}
                <form onSubmit={handleAddQuickNote} className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={newQuickNote}
                      onChange={(e) => setNewQuickNote(e.target.value)}
                      placeholder="Add an admin coordination note..."
                      className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!newQuickNote.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3D6B22] disabled:text-slate-300 hover:text-[#2C5217] cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          04. TAB 2: CARE PLAN (Comprehensive Clinical Schedule & ADL Matrix)
         ========================================================================= */}
      {activeTab === "care-plan" && (
        <Card className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Comprehensive Clinical Care Plan</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Service authorizations, weekly schedule caps, and approved ADL clinical tasks.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#1E5622] border border-emerald-200/70">
              Active Authorization (Payer Approved)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Program & Waiver</span>
              <span className="text-sm font-bold text-slate-900 block">{client.carePlan.program}</span>
            </div>
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Authorized Weekly Hours</span>
              <span className="text-sm font-bold text-[#3D6B22] block">
                {client.carePlan.authorizedWeeklyHours} hrs / week
              </span>
            </div>
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Scheduled Hours</span>
              <span className="text-sm font-bold text-slate-900 block">
                {client.carePlan.scheduledWeeklyHours} hrs / week
              </span>
            </div>
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Frequency & Shift Pattern</span>
              <span className="text-sm font-bold text-slate-900 block">
                {client.carePlan.frequency || "Mon - Fri, 8:00 AM - 3:00 PM"}
              </span>
            </div>
          </div>

          {/* ADL Tasks Matrix */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Approved Activities of Daily Living (ADL & IADL Tasks)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: "Personal Hygiene & Showering", status: "Hands-on Support", code: "ADL-01" },
                { name: "Bed Mobility & Position Changes", status: "Assistance Required", code: "ADL-02" },
                { name: "Transfer Assistance (Sit-to-Stand)", status: "Standby Guard", code: "ADL-03" },
                { name: "Nutritional Meal Prep & Feeding Support", status: "Full Preparation", code: "IADL-01" },
                { name: "Medication Reminders & Logging", status: "Prompt & Record", code: "IADL-02" },
                { name: "Sensory Regulation & Behavioral Coaching", status: "Ongoing Protocol", code: "BEH-01" },
              ].map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3D6B22] shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">{task.name}</div>
                      <div className="text-[11px] text-slate-500">{task.status}</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {task.code}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Precautions Banner */}
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/70 text-xs space-y-1">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Special Instructions & Medical Precautions</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Client exhibits high fall risk during unassisted nighttime transfers. Non-skid footwear mandatory. Allergies: Penicillin, Codeine. Standby shower chair required for all hygiene tasks.
            </p>
          </div>
        </Card>
      )}

      {/* =========================================================================
          05. TAB 3: VISITS (Real-Time EVV Shifts & Geofence Adherence)
         ========================================================================= */}
      {activeTab === "visits" && (
        <Card className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Electronic Visit Verification (EVV) Log</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                GPS-verified caregiver clock-in/out timestamps, shift tasks, and aggregator sync status.
              </p>
            </div>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3D6B22] hover:bg-[#2C5217] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Shift</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Date & Time</th>
                  <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Caregiver</th>
                  <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Clock-In / Out</th>
                  <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">GPS Verification</th>
                  <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Tasks Done</th>
                  <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-[11px] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { date: "Jul 9, 2026", shift: "8:00 AM – 4:00 PM", caregiver: "Maria Santos, CNA", in: "7:58 AM", out: "4:02 PM", gps: "Matched (0.01 mi)", tasks: "6 / 6", status: "Verified" },
                  { date: "Jul 8, 2026", shift: "8:00 AM – 4:00 PM", caregiver: "Maria Santos, CNA", in: "8:00 AM", out: "4:00 PM", gps: "Matched (0.02 mi)", tasks: "6 / 6", status: "Verified" },
                  { date: "Jul 7, 2026", shift: "8:00 AM – 4:00 PM", caregiver: "David Kim", in: "7:55 AM", out: "4:05 PM", gps: "Matched (0.01 mi)", tasks: "5 / 6", status: "Verified" },
                  { date: "Jul 6, 2026", shift: "8:00 AM – 4:00 PM", caregiver: "Maria Santos, CNA", in: "8:02 AM", out: "4:00 PM", gps: "Matched (0.02 mi)", tasks: "6 / 6", status: "Verified" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{row.date}</div>
                      <div className="text-[11px] text-slate-400">{row.shift}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{row.caregiver}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {row.in} → {row.out}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[#3D6B22] font-medium text-[11px]">
                        <MapPin className="w-3 h-3" />
                        {row.gps}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{row.tasks} completed</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#1E5622] border border-emerald-200">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================================================
          06. TAB 4: MEDICATIONS (Clinical MAR & Administration Schedule)
         ========================================================================= */}
      {activeTab === "medications" && (
        <Card className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Medication Administration Record (MAR)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active clinical prescriptions, administration dosage times, and physician instructions.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-[#3D6B22] border border-emerald-200">
              4 Active Prescriptions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Lisinopril 10mg", freq: "Once Daily (Morning)", purpose: "Hypertension Management", rx: "RX-891024", doc: "Dr. Amanda Chen" },
              { name: "Metformin 500mg", freq: "Twice Daily with Meals", purpose: "Type 2 Diabetes Blood Sugar", rx: "RX-441920", doc: "Dr. Amanda Chen" },
              { name: "Donepezil 5mg", freq: "Once Nightly at Bedtime", purpose: "Cognitive Memory Support", rx: "RX-908122", doc: "Dr. Marcus Vance (Neurology)" },
              { name: "Aspirin 81mg (Enteric-coated)", freq: "Once Daily with Breakfast", purpose: "Cardiovascular Prophylaxis", rx: "OTC-Approved", doc: "Dr. Amanda Chen" },
            ].map((med, idx) => (
              <div key={idx} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-[#3D6B22] flex items-center justify-center shrink-0">
                  <Pill className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{med.name}</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {med.rx}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-semibold">{med.freq}</div>
                  <div className="text-[11px] text-slate-500">{med.purpose} • Prescribed by {med.doc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* =========================================================================
          07. TAB 5: DOCUMENTS (HIPAA, Intake Packet & State Authorizations)
         ========================================================================= */}
      {activeTab === "documents" && (
        <Card className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Documents & Compliance Repository</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                HIPAA disclosures, State Medicaid service agreements, and clinical assessment records.
              </p>
            </div>
            <button
              onClick={() => toast.success("Document upload dialog ready")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {client.documents?.map((doc) => (
              <div key={doc.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{doc.name}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      {doc.category} • Uploaded {doc.uploadedDate || "2026-06-15"} • Signed by Legal Guardian
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${doc.status === "Verified"
                      ? "bg-emerald-50 text-[#1E5622] border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                  >
                    {doc.status}
                  </span>
                  <button
                    onClick={() => toast.info(`Viewing ${doc.name}`)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="Download / View"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* =========================================================================
          08. TAB 6: BILLING (Prior Authorization & Claims Ledger)
         ========================================================================= */}
      {activeTab === "billing" && (
        <Card className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Billing & Payer Authorization Ledger</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Claims generation, Medicaid unit consumption, and ADP caregiver payroll synchronization.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              EDI 837P Configured
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Total Authorized Units</span>
              <span className="text-2xl font-black text-slate-900 block">{client.authorization.totalUnitsApproved} units</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Approved by Medicaid / DHS</span>
            </div>
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Units Billed / Consumed</span>
              <span className="text-2xl font-black text-slate-900 block">{client.authorization.unitsUsed} units</span>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">35% burn-rate (Healthy)</span>
            </div>
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Remaining Units Balance</span>
              <span className="text-2xl font-black text-[#3D6B22] block">{client.authorization.unitsRemaining} units</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">{client.authorization.daysUntilExpiry} days to auth expiration</span>
            </div>
          </div>

          {/* Procedure Codes */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-900 mb-2">Approved Procedure Codes & Reimbursement Rates</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-slate-800">T1019</span>
                  <span className="text-slate-500 ml-2">Personal Care Services (per 15 min)</span>
                </div>
                <span className="font-bold text-slate-900">$28.50 / unit</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-slate-800">S5125</span>
                  <span className="text-slate-500 ml-2">Attendant Care Services (hourly)</span>
                </div>
                <span className="font-bold text-slate-900">$32.00 / hr</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* =========================================================================
          09. TAB 7: COMMUNICATION (Multi-Channel Family & Caregiver Feed)
         ========================================================================= */}
      {activeTab === "communication" && (
        <Card className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Communication & Care Coordination Feed</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Family phone calls, caregiver SMS alerts, and case manager correspondence.
              </p>
            </div>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3D6B22] hover:bg-[#2C5217] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Log Contact</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">Inbound Family Call — Robert Rigby</span>
                <span className="text-slate-400 text-[11px]">Jul 9, 7:45 PM</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Reviewed upcoming RN Supervisory visit. Confirmed caregiver arrival time and medication replenishment.
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">SMS Alert — Shift Completion</span>
                <span className="text-slate-400 text-[11px]">Jul 9, 2:50 PM</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Automated SMS delivered to family contact: &quot;Maria Santos completed shift for Leo. All ADL tasks verified.&quot;
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* =========================================================================
          10. TAB 8: CHRONOLOGY (Immutable Administrative Audit Log)
         ========================================================================= */}
      {activeTab === "chronology" && (
        <Card className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Client Chronology & HIPAA Audit Trail</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Timestamped log of status updates, authorizations, care plans, and administrative actions.
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              Audit Ready
            </span>
          </div>

          <div className="relative pl-6 space-y-5 border-l-2 border-slate-200 text-xs mt-3">
            {client.activity?.map((act) => (
              <div key={act.id} className="relative group">
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#3D6B22] border-2 border-white shadow-xs group-hover:scale-125 transition-transform" />
                <div className="font-bold text-slate-900 text-xs sm:text-sm">{act.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {act.timestamp} • {act.author} ({act.authorRole})
                </div>
                <div className="text-slate-700 mt-1.5 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                  {act.details}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* =========================================================================
          11. TAB 9: ASSESSMENTS (RN Initial & Supervisory Clinical Evaluations)
         ========================================================================= */}
      {activeTab === "assessments" && (
        <Card className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Clinical & RN Supervisory Assessments</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comprehensive periodic assessments, fall risk reassessments, and RN supervisor sign-offs.
              </p>
            </div>
            <button
              onClick={() => toast.info("New Clinical Assessment form launched")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3D6B22] hover:bg-[#2C5217] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Assessment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">Morse Fall Risk Assessment</span>
                <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-xs">
                  Score: 65 (High Risk)
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Completed by Clinical Supervisor (Rachel Miller, RN). Mobility impairment and history of fall within last 6 months. Non-skid footwear and standby assistance required.
              </p>
              <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-200/60">
                Completed: 2026-06-15 • Next Reassessment: 2026-12-15
              </div>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">Mini-Mental State Exam (MMSE)</span>
                <span className="text-[#1E5622] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70 text-xs">
                  Score: 26/30 (Low Impairment)
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Orientation to person, place, and time intact. Mild short-term memory deficit. Able to follow multi-step verbal directives without agitation.
              </p>
              <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-200/60">
                Completed: 2026-01-10 • Next Reassessment: 2026-07-10
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* =========================================================================
          MODALS
         ========================================================================= */}
      <ClientContactFamilyModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        client={client}
        onLogCommunication={handleLogCommunication}
      />

      <ClientScheduleVisitModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        client={client}
        onConfirmSchedule={(clientId, details) => {
          toast.success(`Visit scheduled for ${details.scheduledDate}`);
          setIsScheduleModalOpen(false);
        }}
      />
    </div>
  );
}
