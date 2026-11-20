"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Home,
  HeartHandshake,
  FileText,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Edit3,
  ExternalLink,
  Printer,
  ChevronRight,
  ArrowRight,
  Send,
  Building2,
  Sparkles,
  RefreshCw,
  User,
  Heart,
  Lock,
  Globe,
  CalendarPlus,
} from "lucide-react";
import { getClientById, getClientsFromStorage, saveClientsToStorage } from "@/lib/clients/mockData";
import { ClientRecord, ClientStatus, ClientDocument, ClientActivityLog } from "@/types/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { ClientContactFamilyModal } from "./modals/ClientContactFamilyModal";
import { ClientScheduleVisitModal } from "./modals/ClientScheduleVisitModal";

interface ClientDetailViewProps {
  clientId: string;
}

const formatShortProgram = (program?: string): string => {
  if (!program) return "General Care";
  if (program.includes("CCSP")) return "CCSP Waiver";
  if (program.includes("SOURCE")) return "SOURCE Waiver";
  if (program.includes("Private Pay")) return "Private Pay";
  if (program.includes("VA")) return "VA Aid & Attend";
  if (program.includes("GAPP")) return "GAPP Pediatric";
  return program.split("(")[0].trim() || program;
};

export function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [client, setClient] = useState<ClientRecord | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "household" | "careplan" | "documents" | "activity"
  >("overview");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [newNote, setNewNote] = useState("");

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
      if (tabParam === "personal") setActiveTab("overview");
      else if (tabParam === "household" || tabParam === "caregivers") setActiveTab("household");
      else if (tabParam === "care-plan") setActiveTab("careplan");
      else if (tabParam === "documents") setActiveTab("documents");
      else if (tabParam === "activity") setActiveTab("activity");
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
          href="/clients"
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#3D6B22] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients Workspace</span>
        </Link>
      </div>
    );
  }

  const handleStatusUpdate = (newStatus: ClientStatus) => {
    const updated: ClientRecord = {
      ...client,
      status: newStatus,
      updatedAtRelative: "Just now",
      activity: [
        {
          id: `ACT-${Date.now()}`,
          timestamp: "Just now",
          type: "status_change",
          author: "Agency Admin",
          authorRole: "Operational Administrator",
          title: `Status Changed to ${newStatus}`,
          details: `Client status was manually transitioned from ${client.status} to ${newStatus}.`,
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

  const handleToggleDocStatus = (docId: string) => {
    const updatedDocs: ClientDocument[] = client.documents.map((d) => {
      if (d.id === docId) {
        const nextStatus: ClientDocument["status"] =
          d.status === "Verified"
            ? "Missing"
            : d.status === "Missing"
              ? "Review needed"
              : "Verified";
        return { ...d, status: nextStatus };
      }
      return d;
    });

    const updated: ClientRecord = {
      ...client,
      documents: updatedDocs,
    };
    setClient(updated);
    const all = getClientsFromStorage();
    const index = all.findIndex((c) => c.id === client.id);
    if (index !== -1) {
      all[index] = updated;
      saveClientsToStorage(all);
    }
    toast.info("Document verification status updated");
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newLog: ClientActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: "Just now",
      type: "note",
      author: "Intake Coordinator",
      authorRole: "Clinical Staff",
      title: "Coordination Note Logged",
      details: newNote.trim(),
    };

    const updated: ClientRecord = {
      ...client,
      activity: [newLog, ...client.activity],
    };

    setClient(updated);
    setNewNote("");

    const all = getClientsFromStorage();
    const index = all.findIndex((c) => c.id === client.id);
    if (index !== -1) {
      all[index] = updated;
      saveClientsToStorage(all);
    }

    toast.success("Follow-up note logged to client timeline");
  };

  const handleLogCommunication = (
    clientId: string,
    type: "call" | "email" | "note",
    noteText: string
  ) => {
    const newLog: ClientActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: "Just now",
      type: type === "call" ? "call" : type === "email" ? "email" : "note",
      author: "Care Coordinator",
      authorRole: "Agency Operations",
      title:
        type === "call"
          ? "Phone Contact Logged"
          : type === "email"
            ? "Email Sent to Family"
            : "Communication Note Added",
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

  const handleConfirmSchedule = (
    clientId: string,
    details: {
      scheduledDate: string;
      scheduledTime: string;
      clinician: string;
      type: string;
      notes: string;
    }
  ) => {
    const newLog: ClientActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: "Just now",
      type: "assessment",
      author: details.clinician,
      authorRole: "Clinical Assessor",
      title: `${details.type} Scheduled`,
      details: `Scheduled for ${details.scheduledDate} at ${details.scheduledTime}. Focus: ${details.notes}`,
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

  const tabs = [
    { id: "overview" as const, label: "Overview & Demographics", icon: User },
    { id: "household" as const, label: "Household & Care Team", icon: Home },
    { id: "careplan" as const, label: "Care Plan & Authorizations", icon: HeartHandshake },
    { id: "documents" as const, label: "Documents & Compliance", icon: FileText },
    { id: "activity" as const, label: "Timeline & Activity Notes", icon: Clock },
  ];

  const clientInitials = client.name
    .replace(/^The\s+/i, "")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-16 animate-in fade-in duration-300">
      {/* Back Navigation Button */}
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Clients Workspace</span>
        </Link>
      </div>

      {/* 01. PatientHeader Style: Hero Identity & Actions Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] border border-slate-200 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar Box with Floating Status Badge */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#3D6B22]/10 to-emerald-100/60 text-[#3D6B22] border-2 border-white shadow-[0_6px_24px_rgba(0,0,0,0.06)] flex items-center justify-center text-2xl font-extrabold overflow-hidden">
              {client.avatarUrl ? (
                <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                clientInitials
              )}
            </div>
            <div className="absolute -bottom-2 -right-2">
              <span
                className={`border-2 border-white shadow-sm font-semibold text-white whitespace-nowrap px-2.5 py-0.5 text-[10px] rounded-full uppercase tracking-wider ${client.status === "Active"
                    ? "bg-[#3D6B22]"
                    : client.status === "Onboarding"
                      ? "bg-amber-500"
                      : client.status === "On Hold"
                        ? "bg-slate-500"
                        : "bg-rose-500"
                  }`}
              >
                {client.status}
              </span>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {client.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Household: <strong className="text-slate-900 font-semibold">{client.household.name}</strong> ({client.household.code})
            </p>
          </div>
        </div>

        {/* Action Controls Column */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-3.5 lg:pt-0 border-slate-100 self-center">
          {/* Schedule RN Assessment / Care Review Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer whitespace-nowrap"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-sky-700" />
            <span>Schedule RN</span>
          </button>

          {/* Edit Client Primary CTA */}
          <Link
            href={`/clients/${client.id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#2C5217] active:scale-[0.98] transition-all rounded-xl shadow-[0_4px_16px_rgba(61,107,34,0.25)] hover:shadow-[0_6px_24px_rgba(61,107,34,0.35)] cursor-pointer whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5 text-white" />
            <span>Edit Profile</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
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
          {/* Left Column (2 cols): Demographics & Three Connected Journeys */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Client Demographics Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#3D6B22]" />
                  Client Demographics & Residence
                </h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-[#1E5622] border border-emerald-200/70">
                  {client.careType}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Full Legal Name</span>
                  <span className="text-sm font-semibold text-slate-800 block">{client.name}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Preferred Name</span>
                  <span className="text-sm font-semibold text-slate-800 block">{client.preferredName || client.name}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Date of Birth / Age</span>
                  <span className="text-sm font-semibold text-slate-800 block">{client.dob} ({client.age} years old)</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Gender & Primary Language</span>
                  <span className="text-sm font-semibold text-slate-800 block">{client.gender} • {client.primaryLanguage}</span>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Client ID & Program</span>
                  <span className="text-xs font-semibold text-slate-800 block">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/70 mr-1.5">{client.id}</span>
                    {client.carePlan.program}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Residence Address</span>
                  <p className="text-xs font-medium text-slate-700 flex items-start gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{client.household.address}, {client.household.city}, {client.household.state} {client.household.zip}</span>
                  </p>
                </div>
              </div>

              {/* Operational Metadata: Care Arrangement, Readiness, and Last Updated */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-4">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Care Arrangement</span>
                  <span className="text-xs font-semibold text-[#1E5622] block">
                    {client.careType}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Care Readiness</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-semibold text-[#1E5622] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                      {client.readiness.overallScore ?? 85}% Verified
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({client.readiness.authorization} Auth)
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Last Record Update</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                    {client.updatedAtRelative}
                  </span>
                </div>
              </div>
            </Card>

            {/* Three Connected Journeys Card (RULES.md #L96) */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#3D6B22]" />
                  Three Connected Journeys (Household Synchronization)
                </h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-[#1E5622] border border-emerald-200/70">
                  Synchronized
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. Client Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">1. Client Care</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200/70">
                      {client.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold truncate">
                    {formatShortProgram(client.carePlan.program)}
                  </p>
                  <p className="text-[11px] text-slate-500">Care Plan Active</p>
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#3D6B22] h-1.5 rounded-full"
                      style={{ width: client.status === "Active" ? "100%" : "60%" }}
                    />
                  </div>
                </div>

                {/* 2. Caregiver Workforce Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">2. Caregiver Workforce</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${client.assignedCareTeam.primaryCaregiver
                        ? "bg-emerald-50 text-[#1E5622] border-emerald-200/70"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                      {client.assignedCareTeam.primaryCaregiver ? "Assigned" : "Unassigned"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold truncate">
                    {client.assignedCareTeam.primaryCaregiver
                      ? client.assignedCareTeam.primaryCaregiver.name
                      : "Awaiting primary caregiver"}
                  </p>
                  <p className="text-[11px] text-slate-500">Primary Caregiver</p>
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${client.assignedCareTeam.primaryCaregiver ? "bg-[#3D6B22]" : "bg-rose-400"}`}
                      style={{ width: client.assignedCareTeam.primaryCaregiver ? "100%" : "20%" }}
                    />
                  </div>
                </div>

                {/* 3. Agency Operations Journey */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">3. Agency Ops</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200/70">
                      {client.authorization.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold truncate">
                    {client.carePlan.authorizedWeeklyHours} hrs/wk authorized
                  </p>
                  <p className="text-[11px] text-slate-500">Authorization Status</p>
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#3D6B22] h-1.5 rounded-full"
                      style={{ width: client.authorization.status === "Verified" ? "100%" : "50%" }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (1 col): Primary Contact & Emergency Contact */}
          <div className="space-y-5">
            {/* Primary Family Contact Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#3D6B22]" />
                  Primary Family Contact
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
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Contact Person</span>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {client.primaryContact.name} ({client.primaryContact.relationship})
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Direct Phone</span>
                  <a href={`tel:${client.primaryContact.phone}`} className="text-xs font-semibold text-[#3D6B22] hover:underline flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {client.primaryContact.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Email Address</span>
                  <a href={`mailto:${client.primaryContact.email}`} className="text-xs font-semibold text-[#3D6B22] hover:underline flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {client.primaryContact.email}
                  </a>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Preferred Communication</span>
                  <span className="text-xs font-semibold text-slate-700 block">
                    {client.primaryContact.preferredMethod}
                  </span>
                </div>
              </div>
            </Card>

            {/* Designated Emergency Contact Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  Emergency Contact
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  24/7 Response
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Name</span>
                  <span className="font-semibold text-slate-800">{client.emergencyContact.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Relationship</span>
                  <span className="font-semibold text-slate-700">{client.emergencyContact.relationship}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Telephone</span>
                  <a href={`tel:${client.emergencyContact.phone}`} className="font-mono font-bold text-slate-900 hover:text-[#3D6B22] transition-colors">
                    {client.emergencyContact.phone}
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 02: Household & Care Team */}
      {activeTab === "household" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
          {/* Connected Household Card */}
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1E5622] flex items-center justify-center font-bold text-sm">
                  <Home className="w-5 h-5 text-[#3D6B22]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{client.household.name}</h3>
                  <span className="font-mono text-xs text-slate-500">{client.household.code}</span>
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
                <span className="font-medium text-slate-800">{client.household.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Residence Address:</span>
                <span className="font-medium text-slate-800">
                  {client.household.address}, {client.household.city}, {client.household.state} {client.household.zip}
                </span>
              </div>
            </div>
          </Card>

          {/* Primary Caregiver Card */}
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {client.assignedCareTeam.primaryCaregiver ? (
                    client.assignedCareTeam.primaryCaregiver.name.charAt(0)
                  ) : (
                    <Users className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {client.assignedCareTeam.primaryCaregiver
                      ? client.assignedCareTeam.primaryCaregiver.name
                      : "Unassigned Caregiver"}
                  </h3>
                  <span className="text-[11px] text-slate-500">Designated Primary Caregiver</span>
                </div>
              </div>
              {client.assignedCareTeam.primaryCaregiver && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {client.assignedCareTeam.primaryCaregiver.classification}
                </span>
              )}
            </div>

            {client.assignedCareTeam.primaryCaregiver ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Relationship:</span>
                  <span className="font-semibold text-slate-800">
                    {client.assignedCareTeam.primaryCaregiver.relationship}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Telephone:</span>
                  <span className="font-medium text-slate-800">
                    {client.assignedCareTeam.primaryCaregiver.phone}
                  </span>
                </div>
                <div className="pt-2">
                  <Link
                    href={`/caregivers/${client.assignedCareTeam.primaryCaregiver.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline"
                  >
                    <span>View Caregiver File</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                A primary caregiver has not been assigned to this client yet. Assign from the Caregivers directory.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 03: Care Plan & Authorizations */}
      {activeTab === "careplan" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
              <HeartHandshake className="w-4.5 h-4.5 text-[#3D6B22]" />
              Care Plan Parameters & Needs
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Service Program</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{client.carePlan.program}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Authorized Weekly Hours</span>
                <span className="font-extrabold text-slate-900 text-lg mt-0.5 block">{client.carePlan.authorizedWeeklyHours} hrs/wk</span>
              </div>
              <div>
                <span className="text-slate-500 block">Service Schedule Frequency</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{client.carePlan.frequency}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Effective / Review Dates</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{client.carePlan.effectiveDate} → {client.carePlan.reviewDate}</span>
              </div>
            </div>

            {client.carePlan.adlSupportNeeds && client.carePlan.adlSupportNeeds.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block text-xs font-bold mb-1.5">ADL Assistance Needs</span>
                <div className="flex flex-wrap gap-1.5">
                  {client.carePlan.adlSupportNeeds.map((need, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60">
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-[#3D6B22]" />
              Service Authorization Record
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Auth Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{client.authorization.authNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Payer & Waiver</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{client.authorization.payer}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Units Approved / Remaining</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{client.authorization.totalUnitsApproved} units ({client.authorization.unitsRemaining} rem.)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Expiry Date</span>
                <span className="font-bold text-emerald-700 mt-0.5 block">{client.authorization.expiryDate}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-500 block text-xs">
                Case Manager: <strong className="text-slate-800">{client.authorization.caseManagerName}</strong> ({client.authorization.caseManagerAgency})
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 04: Documents & Compliance */}
      {activeTab === "documents" && (
        <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-[#3D6B22]" />
                Client Document Verification Checklist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Required consents, medical orders, assessment files, and authorizations
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {client.documents.length} Files Tracked
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {client.documents.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{doc.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Category: {doc.category} • Uploaded: {doc.uploadedDate || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleDocStatus(doc.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${doc.status === "Verified"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : doc.status === "Review needed"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                  >
                    {doc.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 05: Timeline & Activity Notes */}
      {activeTab === "activity" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {/* Note Form */}
          <div className="lg:col-span-1">
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <FileText className="w-4 h-4 text-[#3D6B22]" />
                Log Client Note
              </h3>
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  rows={4}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record visit observations, physician contact, or household communication..."
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

          {/* Activity Timeline */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Clock className="w-4 h-4 text-[#3D6B22]" />
                Client History & Timeline
              </h3>
              <div className="relative pl-6 space-y-5 border-l-2 border-slate-100">
                {client.activity.map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#3D6B22]" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 text-xs">{item.title}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.details}</p>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                      Logged by {item.author} ({item.authorRole})
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Interactive Modals styled identically to /intake/pipeline/INQ-1042/ */}
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
        onConfirmSchedule={handleConfirmSchedule}
      />
    </div>
  );
}
