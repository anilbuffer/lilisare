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
  History,
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
  Plus,
  ShieldAlert,
  UserCheck,
  UserX,
  Stethoscope,
  Lock,
  Download,
  Share2,
  Printer,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getClientById, getClientsFromStorage, saveClientsToStorage } from "@/lib/clients/mockData";
import { ClientRecord, ClientStatus, CareArrangementType } from "@/types/client";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";

interface ClientDetailViewProps {
  clientId: string;
}

export function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [client, setClient] = useState<ClientRecord | null>(null);
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ClientStatus>("Active");
  const [hasClinicalAccess, setHasClinicalAccess] = useState(true);

  useEffect(() => {
    const found = getClientById(clientId);
    if (found) {
      setClient(found);
      setSelectedStatus(found.status);
    }
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
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
          Back to Clients Workspace
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
    setSelectedStatus(newStatus);
    setIsEditingStatus(false);

    // Persist
    const all = getClientsFromStorage();
    const index = all.findIndex((c) => c.id === client.id);
    if (index !== -1) {
      all[index] = updated;
      saveClientsToStorage(all);
    }

    toast.success(`Client status updated to ${newStatus}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20";
      case "Onboarding":
        return "bg-[#FEF3C7] text-[#9A5B00] border-[#9A5B00]/20";
      case "On Hold":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "Discharged":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const tabs = [
    { id: "personal", label: "01. Personal Information", icon: Users },
    { id: "household", label: "02. Household & Relationships", icon: Home },
    { id: "care-plan", label: "03. Care Plan & Services", icon: HeartHandshake },
    { id: "caregivers", label: "04. Assigned Caregivers", icon: UserCheck },
    { id: "documents", label: "05. Documents & Authorizations", icon: FileText },
    { id: "activity", label: "06. Activity & History", icon: History },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/clients"
            className="flex items-center gap-1 font-bold text-slate-700 hover:text-[#3D6B22] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Clients
          </Link>
          <span>/</span>
          <span className="font-mono text-slate-600">{client.id}</span>
          <span>/</span>
          <span className="font-semibold text-slate-900 truncate">{client.name}</span>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/clients/${client.id}/edit`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B3414] hover:bg-[#274C1D] text-white text-xs font-bold shadow-2xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#93C573]" />
            Edit Client
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print Summary
          </button>
          <Link
            href={`/households`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" />
            View Household
          </Link>
        </div>
      </div>

      {/* Client Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D5DFDA] p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Avatar & Demographics */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
              {client.avatarUrl ? (
                <img
                  src={client.avatarUrl}
                  alt={client.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-slate-600 bg-slate-200">
                  {client.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {client.name}
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {client.id}
                </span>

                {/* Status Toggle / Badge */}
                <div className="relative inline-block">
                  <button
                    onClick={() => setIsEditingStatus(!isEditingStatus)}
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border transition-all inline-flex items-center gap-1 ${getStatusBadge(
                      client.status
                    )}`}
                    title="Click to change status"
                  >
                    <span>{client.status}</span>
                    <Edit3 className="w-3 h-3 opacity-60" />
                  </button>

                  {isEditingStatus && (
                    <div className="absolute left-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-30 text-xs space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
                        Change Service Status
                      </div>
                      {(["Active", "Onboarding", "On Hold", "Discharged"] as ClientStatus[]).map(
                        (st) => (
                          <button
                            key={st}
                            onClick={() => handleStatusUpdate(st)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg font-semibold flex items-center justify-between ${
                              client.status === st
                                ? "bg-[#F2F8EE] text-[#3D6B22]"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{st}</span>
                            {client.status === st && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {client.careType}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                <span>
                  DOB: <strong className="text-slate-800">{client.dob}</strong> (Age {client.age})
                </span>
                <span>•</span>
                <span>
                  Gender: <strong className="text-slate-800">{client.gender}</strong>
                </span>
                <span>•</span>
                <span>
                  Primary Language:{" "}
                  <strong className="text-slate-800">{client.primaryLanguage}</strong>
                </span>
                <span>•</span>
                <span>
                  Connected Household:{" "}
                  <strong className="text-[#3D6B22]">{client.household.name}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Key Indicators Mini Strip */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block font-bold uppercase">
                Authorized Hours
              </span>
              <span className="text-base font-extrabold text-slate-900">
                {client.carePlan.authorizedWeeklyHours}{" "}
                <span className="text-xs font-normal text-slate-500">hrs/wk</span>
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 text-[10px] block font-bold uppercase">
                Care Readiness
              </span>
              <span className="text-base font-extrabold text-[#1E5622]">
                {client.readiness.overallScore ?? 85}%
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 text-[10px] block font-bold uppercase">
                Authorization Expiry
              </span>
              <span
                className={`text-xs font-bold ${
                  client.authorization.daysUntilExpiry <= 14
                    ? "text-rose-600"
                    : "text-slate-800"
                }`}
              >
                {client.authorization.expiryDate}
              </span>
            </div>
          </div>
        </div>

        {/* Attention Alerts if any */}
        {client.attentionItems && client.attentionItems.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Action Required:
            </span>
            {client.attentionItems.map((item) => (
              <span
                key={item.id}
                onClick={() => {
                  if (item.linkTab) setActiveTab(item.linkTab);
                }}
                className="cursor-pointer text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
              >
                <span>{item.title}</span>
                <ChevronRight className="w-3 h-3 text-amber-600" />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* The Three Connected Journeys Tracker (RULES.md #L96) */}
      <div className="bg-white rounded-2xl border border-[#D5DFDA] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Three Connected Journeys (LiliSare Family-Centred Lifecycle)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Household: <strong className="text-slate-800">{client.household.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Journey 1: Client Journey */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>1. Client Journey</span>
              <span className="text-emerald-700 font-bold">
                {client.status === "Active" ? "Care Received" : "Registration / Assessment"}
              </span>
            </div>
            <p className="text-xs text-slate-800 font-medium">
              Registered client record linked to {client.carePlan.program.split("(")[0]}.
            </p>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className="bg-[#3D6B22] h-1.5 rounded-full"
                style={{ width: client.status === "Active" ? "100%" : "60%" }}
              />
            </div>
          </div>

          {/* Journey 2: Caregiver Journey */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>2. Caregiver Journey</span>
              <span
                className={
                  client.assignedCareTeam.primaryCaregiver ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"
                }
              >
                {client.assignedCareTeam.primaryCaregiver ? "Caregiver Active" : "Unassigned"}
              </span>
            </div>
            <p className="text-xs text-slate-800 font-medium truncate">
              {client.assignedCareTeam.primaryCaregiver
                ? `${client.assignedCareTeam.primaryCaregiver.name} (${client.assignedCareTeam.primaryCaregiver.classification})`
                : "Awaiting primary caregiver assignment"}
            </p>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${
                  client.assignedCareTeam.primaryCaregiver ? "bg-[#3D6B22]" : "bg-rose-400"
                }`}
                style={{ width: client.assignedCareTeam.primaryCaregiver ? "100%" : "25%" }}
              />
            </div>
          </div>

          {/* Journey 3: Agency Operations Journey */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>3. Agency Operations</span>
              <span className="text-emerald-700 font-bold">
                {client.authorization.status === "Verified" ? "Authorized & Compliant" : "Review Needed"}
              </span>
            </div>
            <p className="text-xs text-slate-800 font-medium">
              Auth: {client.authorization.authNumber} • {client.carePlan.authorizedWeeklyHours} hrs/wk cap.
            </p>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className="bg-[#3D6B22] h-1.5 rounded-full"
                style={{ width: client.authorization.status === "Verified" ? "95%" : "50%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Strip */}
      <div className="bg-white rounded-2xl border border-[#D5DFDA] p-1.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#1B3414] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#93C573]" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 01: Personal Information */}
      {activeTab === "personal" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
          {/* Basic Client Details */}
          <Card className="p-5 border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Basic Client Demographics
              </h3>
              <span className="text-xs text-slate-400 font-mono">CL-RECORD</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Full Legal Name</span>
                <span className="font-bold text-slate-900 text-sm">{client.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Preferred Name</span>
                <span className="font-bold text-slate-900 text-sm">
                  {client.preferredName || client.name}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Date of Birth</span>
                <span className="font-bold text-slate-900">{client.dob}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Age & Demographics</span>
                <span className="font-bold text-slate-900">
                  {client.age} years old ({client.gender})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Primary Language</span>
                <span className="font-bold text-slate-900">{client.primaryLanguage}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Service Classification</span>
                <span className="font-bold text-slate-900">{client.careType}</span>
              </div>
            </div>
          </Card>

          {/* Primary Contact & Preferred Communication */}
          <Card className="p-5 border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Primary Contact Information
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Prefers {client.primaryContact.preferredMethod}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Responsible Person</span>
                <span className="font-bold text-slate-900">
                  {client.primaryContact.name} ({client.primaryContact.relationship})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Phone Number</span>
                <a
                  href={`tel:${client.primaryContact.phone}`}
                  className="font-bold text-[#3D6B22] hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {client.primaryContact.phone}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email Address</span>
                <a
                  href={`mailto:${client.primaryContact.email}`}
                  className="font-bold text-[#3D6B22] hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {client.primaryContact.email}
                </a>
              </div>
              {client.primaryContact.bestTimeToReach && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Best Time to Reach</span>
                  <span className="font-medium text-slate-800">
                    {client.primaryContact.bestTimeToReach}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-slate-500 text-xs block mb-1 font-bold">Physical Address</span>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div>{client.household.address}</div>
                  <div>
                    {client.household.city}, {client.household.state} {client.household.zip}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card className="p-5 border-slate-200 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Designated Emergency Contact
              </h3>
              <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                24/7 Response
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Contact Name</span>
                <span className="font-bold text-slate-900 text-sm">
                  {client.emergencyContact.name}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Relationship</span>
                <span className="font-bold text-slate-900">
                  {client.emergencyContact.relationship}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Primary Telephone</span>
                <span className="font-mono font-bold text-slate-900">
                  {client.emergencyContact.phone}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 02: Household & Relationships */}
      {activeTab === "household" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Connected Household Overview */}
          <Card className="p-5 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#1B3414] text-[#93C573] rounded-xl">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {client.household.name} ({client.household.code})
                  </h3>
                  <p className="text-xs text-slate-500">
                    A client and their family household are connected under LiliSare&apos;s Family-Centred Care model.
                  </p>
                </div>
              </div>

              <Link
                href="/households"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#3D6B22] bg-[#F2F8EE] rounded-xl border border-[#3D6B22]/30 hover:bg-[#E3F1D9] transition-colors"
              >
                <span>Manage Household Unit</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Household Code</span>
                <span className="font-mono font-bold text-slate-900">{client.household.code}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Registered Telephone</span>
                <span className="font-bold text-slate-900">{client.household.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Location</span>
                <span className="font-medium text-slate-900">
                  {client.household.address}, {client.household.city}, {client.household.state}{" "}
                  {client.household.zip}
                </span>
              </div>
            </div>
          </Card>

          {/* Household Members, Roles & Permissions */}
          <Card className="p-5 border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Household Members & Legal Permissions
                </h3>
                <p className="text-xs text-slate-500">
                  Parents, legal guardians, family caregivers, and authorized decision-makers.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {client.householdMembers.length} Members Linked
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.householdMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{member.name}</span>
                        {member.isPrimaryDecisionMaker && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Primary POA / Guardian
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {member.relationship} • {member.role}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-slate-600">
                    <div>Phone: {member.phone}</div>
                    <div>Email: {member.email}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Authorized Permissions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {member.permissions.map((perm, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 03: Care Plan & Services */}
      {activeTab === "care-plan" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Program & Approved Hours Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-slate-200">
              <span className="text-slate-400 text-[10px] block font-bold uppercase">
                Care Program
              </span>
              <span className="text-base font-extrabold text-slate-900 block mt-1">
                {client.carePlan.program}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                Effective: {client.carePlan.effectiveDate}
              </span>
            </Card>

            <Card className="p-4 border-slate-200">
              <span className="text-slate-400 text-[10px] block font-bold uppercase">
                Weekly Authorized Hours
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  {client.carePlan.authorizedWeeklyHours}
                </span>
                <span className="text-xs text-slate-500">hrs / week</span>
              </div>
              <span className="text-xs text-emerald-700 font-semibold mt-1 block">
                {client.carePlan.hoursUsedThisWeek} hrs completed this week
              </span>
            </Card>

            <Card className="p-4 border-slate-200">
              <span className="text-slate-400 text-[10px] block font-bold uppercase">
                Care Plan Status
              </span>
              <div className="flex items-center gap-2 mt-1">
                {client.carePlan.needsReview ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Review Required
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active & Compliant
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                Scheduled review: {client.carePlan.reviewDate}
              </span>
            </Card>
          </div>

          {/* Approved Services & Daily ADL Support Needs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-5 border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Approved Services & Scope
              </h3>
              <ul className="space-y-2">
                {client.carePlan.approvedServices.map((service, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#3D6B22] shrink-0" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-600 block mb-1">
                  Service Schedule & Frequency
                </span>
                <p className="text-xs text-slate-800 font-medium bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  {client.carePlan.frequency}
                </p>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Daily ADL & Support Requirements
              </h3>
              <ul className="space-y-2">
                {client.carePlan.adlSupportNeeds.map((need, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>{need}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block">Mobility Profile:</span>
                  <span className="text-slate-600">{client.carePlan.mobilityNotes}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block">Dietary Restrictions:</span>
                  <span className="text-slate-600">{client.carePlan.dietaryRestrictions}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Important Care Instructions */}
          <Card className="p-5 border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Important Care Instructions & Safety Protocols
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60 font-medium">
              {client.carePlan.specialInstructions}
            </p>
          </Card>
        </div>
      )}

      {/* Tab 04: Assigned Caregivers */}
      {activeTab === "caregivers" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Primary Caregiver Card */}
            <Card className="p-5 border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#E3F1D9] text-[#1E5622] rounded-xl">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Primary Caregiver</h3>
                    <span className="text-[11px] text-slate-500 font-mono">PRIMARY-ASSIGNED</span>
                  </div>
                </div>
                {client.assignedCareTeam.primaryCaregiver && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E3F1D9] text-[#1E5622]">
                    {client.assignedCareTeam.primaryCaregiver.status}
                  </span>
                )}
              </div>

              {client.assignedCareTeam.primaryCaregiver ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Caregiver Name</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {client.assignedCareTeam.primaryCaregiver.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Caregiver ID</span>
                    <span className="font-mono font-bold text-slate-900">
                      {client.assignedCareTeam.primaryCaregiver.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Relationship to Client</span>
                    <span className="font-semibold text-slate-800">
                      {client.assignedCareTeam.primaryCaregiver.relationship}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Classification</span>
                    <span className="font-bold text-slate-800">
                      {client.assignedCareTeam.primaryCaregiver.classification} (Paid Caregiver)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">EVV Compliance Reliability</span>
                    <span className="font-bold text-emerald-700">
                      {client.assignedCareTeam.primaryCaregiver.attendanceReliability}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Contact</span>
                    <span className="text-slate-800">
                      {client.assignedCareTeam.primaryCaregiver.phone} •{" "}
                      {client.assignedCareTeam.primaryCaregiver.email}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-rose-600 space-y-2">
                  <UserX className="w-8 h-8 mx-auto" />
                  <p className="font-bold text-sm">No Primary Caregiver Assigned</p>
                  <p className="text-xs text-slate-500">
                    Client requires staff assignment before service delivery can begin.
                  </p>
                  <button
                    onClick={() => toast.info("Opening caregiver assignment workflow...")}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-[#1B3414] text-white text-xs font-bold"
                  >
                    Assign Primary Caregiver
                  </button>
                </div>
              )}
            </Card>

            {/* Backup Caregiver Card */}
            <Card className="p-5 border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Backup Caregiver</h3>
                    <span className="text-[11px] text-slate-500 font-mono">CONTINGENCY</span>
                  </div>
                </div>
                {client.assignedCareTeam.backupCaregiver && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Active
                  </span>
                )}
              </div>

              {client.assignedCareTeam.backupCaregiver ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Caregiver Name</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {client.assignedCareTeam.backupCaregiver.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Caregiver ID</span>
                    <span className="font-mono font-bold text-slate-900">
                      {client.assignedCareTeam.backupCaregiver.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Relationship to Client</span>
                    <span className="font-semibold text-slate-800">
                      {client.assignedCareTeam.backupCaregiver.relationship}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Classification</span>
                    <span className="font-bold text-slate-800">
                      {client.assignedCareTeam.backupCaregiver.classification}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 space-y-1.5">
                  <Users className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-semibold text-xs text-slate-600">No Backup Caregiver Enrolled</p>
                  <p className="text-[11px] text-slate-400">
                    Family friend or secondary relative can be assigned for emergency respite coverage.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Coordination & Case Management */}
          <Card className="p-5 border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Coordination & External Case Management
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">
                  Onboarding Coordinator (LiliSare)
                </span>
                <span className="font-bold text-slate-900">
                  {client.assignedCareTeam.onboardingCoordinator?.name || "Dana Jenkins, MSW"}
                </span>
                <div className="text-slate-600">
                  {client.assignedCareTeam.onboardingCoordinator?.email}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">
                  Assigned Payer Case Manager
                </span>
                <span className="font-bold text-slate-900">
                  {client.assignedCareTeam.caseManager?.name || client.authorization.caseManagerName}
                </span>
                <div className="text-slate-600">
                  {client.assignedCareTeam.caseManager?.agency || client.authorization.caseManagerAgency}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 05: Documents & Authorizations */}
      {activeTab === "documents" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Service Authorization Summary Banner */}
          <Card className="p-5 border-slate-200 bg-linear-to-r from-white to-[#F2F8EE]/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#3D6B22]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Service Authorization: {client.authorization.authNumber}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Payer: {client.authorization.payer} • Case Manager:{" "}
                    {client.authorization.caseManagerName}
                  </span>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  client.authorization.status === "Verified"
                    ? "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20"
                    : "bg-[#FEE2E2] text-[#B91C1C] border-[#B91C1C]/20"
                }`}
              >
                {client.authorization.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Start Date</span>
                <span className="font-bold text-slate-900">{client.authorization.startDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Expiration Date</span>
                <span
                  className={`font-bold ${
                    client.authorization.daysUntilExpiry <= 14 ? "text-rose-600" : "text-slate-900"
                  }`}
                >
                  {client.authorization.expiryDate} ({client.authorization.daysUntilExpiry} days left)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Weekly Hour Cap</span>
                <span className="font-bold text-slate-900">
                  {client.authorization.weeklyHourCap} hrs/week
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Units Remaining</span>
                <span className="font-bold text-slate-900">
                  {client.authorization.unitsRemaining} / {client.authorization.totalUnitsApproved}{" "}
                  units
                </span>
              </div>
            </div>
          </Card>

          {/* Client Documents & Consent Forms Checklist */}
          <Card className="p-5 border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Client Documents & Consent Forms
                </h3>
                <p className="text-xs text-slate-500">
                  Consent forms, parental agreements (COPPA/HIPAA), authorizations, and service records.
                </p>
              </div>

              <button
                onClick={() => toast.info("Opening document upload dialog...")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B3414] hover:bg-[#274C1D] text-white text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5 text-[#93C573]" />
                Upload Document
              </button>
            </div>

            <div className="space-y-2.5">
              {client.documents.map((doc) => {
                const isRestricted = doc.isRestrictedClinical;
                const canView = !isRestricted || hasClinicalAccess;

                return (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{doc.name}</span>
                          {doc.isRestrictedClinical && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              Clinical Protected
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Category: <strong>{doc.category}</strong> • Uploaded:{" "}
                          {doc.uploadedDate || "N/A"}{" "}
                          {doc.signedBy && `• Signed by: ${doc.signedBy}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          doc.status === "Verified"
                            ? "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20"
                            : doc.status === "Review needed"
                            ? "bg-[#FEF3C7] text-[#9A5B00] border-[#9A5B00]/20"
                            : "bg-[#FEE2E2] text-[#B91C1C] border-[#B91C1C]/20"
                        }`}
                      >
                        {doc.status}
                      </span>

                      {canView ? (
                        <button
                          onClick={() => toast.success(`Downloaded ${doc.name}`)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Restricted</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Operational Model & Clinical Documentation Notice */}
            <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-start gap-2 border border-slate-200">
              <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Operational Access Policy: </strong>
                Medical records and clinical documentation are restricted to authorized clinical roles
                (RN Supervisors, Medical Directors) in compliance with HIPAA and COPPA privacy standards.
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 06: Activity & History */}
      {activeTab === "activity" && (
        <Card className="p-5 border-slate-200 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Client Activity & Administrative Audit History
              </h3>
              <p className="text-xs text-slate-500">
                Immutable audit trail of status changes, caregiver updates, communications, and documents.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 font-bold">
              HIPAA AUDIT LOG
            </span>
          </div>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {client.activity.map((act) => (
              <div key={act.id} className="relative pl-8 text-xs space-y-1">
                <span className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-[#3D6B22] ring-4 ring-white" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{act.title}</span>
                  <span className="text-slate-400 text-[11px] font-mono">{act.timestamp}</span>
                </div>
                <div className="text-slate-500">
                  By: <strong className="text-slate-700">{act.author}</strong> ({act.authorRole})
                </div>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mt-1">
                  {act.details}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
