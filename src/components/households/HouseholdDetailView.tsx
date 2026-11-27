"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Household,
  getHouseholdsFromStorage,
  saveHouseholdsToStorage,
} from "@/lib/households/mockData";
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  ArrowRight,
  Send,
  Building2,
  Sparkles,
  CalendarPlus,
  Trash2,
  Edit3,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import {
  ResponsiveDomainTabStrip,
  DomainTabItem,
} from "@/components/ui/ResponsiveDomainTabStrip";
import { toast } from "sonner";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";
import {
  deleteHouseholdFromStorage,
  subscribeToIntakeSync,
} from "@/lib/intake/intakeSync";
import { HouseholdProfileTab } from "./HouseholdProfileTab";
import { HouseholdContactFamilyModal } from "./modals/HouseholdContactFamilyModal";
import { HouseholdScheduleVisitModal } from "./modals/HouseholdScheduleVisitModal";

type HouseholdDomainTab =
  | "profile"
  | "tri-journey"
  | "family"
  | "authorizations"
  | "evv"
  | "timeline";

const HOUSEHOLD_TABS: DomainTabItem<HouseholdDomainTab>[] = [
  { id: "profile", label: "PROFILE", minWidth: 90 },
  { id: "tri-journey", label: "TRI-JOURNEY FLOW", minWidth: 148 },
  { id: "family", label: "FAMILY & CARE TEAM", minWidth: 158 },
  { id: "authorizations", label: "AUTHORIZATIONS & CM", minWidth: 170 },
  { id: "evv", label: "EVV & SCHEDULING", minWidth: 150 },
  { id: "timeline", label: "TIMELINE & NOTES", minWidth: 146 },
];

interface HouseholdDetailViewProps {
  initialHousehold: Household;
  backHref?: string;
  backLabel?: string;
  initialEditMode?: boolean;
}

export function HouseholdDetailView({
  initialHousehold,
  backHref = "/admin/households",
  backLabel = "Back to Households Directory",
  initialEditMode = false,
}: HouseholdDetailViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const perms = usePortalPermissions();

  const [household, setHousehold] = useState<Household>(initialHousehold);
  const [activeTab, setActiveTab] = useState<HouseholdDomainTab>("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(initialEditMode);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newNote, setNewNote] = useState("");

  // Resolve role-dedicated portal prefix strictly per AGENTS.md
  const portalPrefix = React.useMemo(() => {
    if (pathname.startsWith("/intake") || backHref.startsWith("/intake")) return "/intake";
    if (pathname.startsWith("/admin") || backHref.startsWith("/admin")) return "/admin";
    return perms.baseRoutePrefix || "/admin";
  }, [pathname, backHref, perms.baseRoutePrefix]);

  const householdsBasePath = backHref.replace(/\/$/, "");
  const editHref = `${householdsBasePath}/${household.id}/edit`;

  const [notes, setNotes] = useState<
    { id: string; author: string; role: string; timestamp: string; title: string; details: string }[]
  >([
    {
      id: "n-1",
      author: initialHousehold.caseManager.name,
      role: "Case Manager",
      timestamp: "Today, 11:30 AM",
      title: "Authorization & Plan Sync Verified",
      details: `Service authorization active for ${initialHousehold.authorizedHoursPerWeek} hrs/wk under ${initialHousehold.program}.`,
    },
    {
      id: "n-2",
      author: "Coordination Ops",
      role: "Staff",
      timestamp: "Yesterday, 3:15 PM",
      title: "EVV Geofence Verified",
      details: `Home visit recorded with ${initialHousehold.evvComplianceRate}% EVV verification for caregiver ${initialHousehold.primaryCaregiver.name}.`,
    },
    {
      id: "n-3",
      author: "Intake Coordinator",
      role: "Staff",
      timestamp: "2 weeks ago",
      title: "Household Connected Unit Created",
      details: `Household registered with client ${initialHousehold.client.name} and primary caregiver ${initialHousehold.primaryCaregiver.name}.`,
    },
  ]);

  useEffect(() => {
    const syncHousehold = () => {
      const all = getHouseholdsFromStorage();
      const found = all.find(
        (h) =>
          h.id.toLowerCase() === initialHousehold.id.toLowerCase() ||
          h.code.toLowerCase() === initialHousehold.code.toLowerCase()
      );
      if (found) setHousehold(found);
    };
    syncHousehold();
    return subscribeToIntakeSync(syncHousehold);
  }, [initialHousehold.id, initialHousehold.code]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const match = HOUSEHOLD_TABS.find(
        (t) =>
          t.id === tabParam.toLowerCase() ||
          t.label.toLowerCase() === tabParam.toLowerCase()
      );
      if (match) setActiveTab(match.id);
    }
    if (searchParams.get("mode") === "edit" || initialEditMode) {
      setIsEditingProfile(true);
      setActiveTab("profile");
    }
  }, [searchParams, initialEditMode]);

  const appendNote = (title: string, details: string, author = perms.actorName, role = perms.roleLabel) => {
    setNotes((prev) => [
      {
        id: `n-${Date.now()}`,
        author,
        role,
        timestamp: "Just now",
        title,
        details,
      },
      ...prev,
    ]);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    appendNote("Staff Coordination Note Added", newNote.trim());
    setNewNote("");
    toast.success("Household note logged to timeline");
  };

  const handleLogCommunication = (
    _householdId: string,
    type: "call" | "email" | "note",
    noteText: string
  ) => {
    const title =
      type === "call"
        ? "Phone Contact Logged"
        : type === "email"
          ? "Email Sent to Household"
          : "Coordination Note Logged";
    appendNote(title, noteText, "Coordination Specialist", "Operations Staff");
    toast.success("Communication logged to timeline");
  };

  const handleConfirmSchedule = (
    _householdId: string,
    details: {
      scheduledDate: string;
      scheduledTime: string;
      clinician: string;
      type: string;
      notes: string;
    }
  ) => {
    appendNote(
      `${details.type} Scheduled`,
      `Scheduled for ${details.scheduledDate} at ${details.scheduledTime}. Focus: ${details.notes}`,
      details.clinician,
      "Clinical Supervisor"
    );
    toast.success(`Visit scheduled for ${details.scheduledDate}`);
  };

  const handleStatusChange = (newStatus: Household["authStatus"]) => {
    if (!perms.households.canApproveAuthorization) {
      toast.error("Service authorization status overrides require Agency Admin approval.");
      return;
    }
    const updated = { ...household, authStatus: newStatus };
    setHousehold(updated);
    const all = getHouseholdsFromStorage();
    const idx = all.findIndex((h) => h.id === household.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveHouseholdsToStorage(all);
    }
    appendNote("Authorization Status Updated", `Authorization transitioned to ${newStatus}.`);
    toast.success(`Authorization status updated to ${newStatus}`);
  };

  const householdInitials = household.name
    .replace(/^The\s+/i, "")
    .slice(0, 2)
    .toUpperCase();

  const authBadgeBg =
    household.authStatus === "Approved"
      ? "bg-[#3D6B22]"
      : household.authStatus === "Expiring Soon"
        ? "bg-amber-500"
        : household.authStatus === "Pending Review"
          ? "bg-blue-600"
          : "bg-rose-500";

  const fulfillmentPct =
    household.authorizedHoursPerWeek > 0
      ? Math.min(100, Math.round((household.scheduledHoursPerWeek / household.authorizedHoursPerWeek) * 100))
      : 0;

  return (
    <div className="w-full max-w-9xl mx-auto space-y-5 pb-16 animate-in fade-in duration-300">
      {/* 01. Back Navigation Link */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* 02. Hero Identity Card (Matched to AdminCaregiverDetailView & AdminClientDetailView) */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20 flex items-center justify-center text-xl font-bold">
              {householdInitials}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs border-2 border-white ${authBadgeBg}`}
              >
                {household.authStatus}
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                {household.name}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80">
                {household.code}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 flex-wrap text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#3D6B22] border border-emerald-200/80">
                {household.program}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {household.client.name} & {household.primaryCaregiver.name}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Control */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all cursor-pointer active:scale-95"
          >
            <CalendarPlus className="w-4 h-4 text-emerald-100" />
            <span>Schedule Visit</span>
          </button>
        </div>
      </div>

      {/* 02b. Secondary Household Actions Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Household Management Actions</h2>
          <p className="text-xs text-slate-500 mt-0.5">Edit household details, authorization links, or lifecycle status</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={editHref}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-slate-400" />
            <span>Edit Household</span>
          </Link>

          {perms.households.canApproveAuthorization && (
            <Link
              href="/admin/authorizations"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#3D6B22] bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Manage Auth</span>
            </Link>
          )}

          {perms.households.canDelete && (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* 03. Space-Aware Responsive Tab Navigation Strip */}
      <ResponsiveDomainTabStrip
        tabs={HOUSEHOLD_TABS}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        ariaLabel="Household management sections"
      />

      {/* 04. Tab Content Modules */}
      {activeTab === "profile" && (
        <HouseholdProfileTab
          household={household}
          portalPrefix={portalPrefix}
          isEditing={isEditingProfile}
          onToggleEdit={setIsEditingProfile}
          onUpdateHousehold={setHousehold}
          onOpenContactFamily={() => setIsContactModalOpen(true)}
          canApproveAuthorization={perms.households.canApproveAuthorization}
          onLogActivity={(title, details) => appendNote(title, details)}
        />
      )}

      {activeTab === "tri-journey" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <Card className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#3D6B22]" />
                  <span>Three Connected Journeys (LiliSare Operational Flow)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized progress across Client Care, Caregiver Activation, and Agency Operations
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200">
                Synchronized Unit
              </span>
            </div>

            {household.triJourneyStatus.bottleneckMessage && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Operational Bottleneck Detected</strong>
                  <span>{household.triJourneyStatus.bottleneckMessage}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Client Journey */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    1. Client Journey
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200">
                    {household.triJourneyStatus.clientStage}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{household.client.name}</p>
                  <p className="text-xs text-slate-500">{household.client.relationship}</p>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#3D6B22] h-2 rounded-full transition-all"
                    style={{
                      width:
                        household.triJourneyStatus.clientStage === "Care Active" ? "100%" : "70%",
                    }}
                  />
                </div>
                <Link
                  href={`${portalPrefix}/clients/${household.client.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline"
                >
                  <span>Open Client Chart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 2. Caregiver Journey */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    2. Caregiver Journey
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200">
                    {household.triJourneyStatus.caregiverStage}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {household.primaryCaregiver.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {household.primaryCaregiver.relationship}
                  </p>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#3D6B22] h-2 rounded-full transition-all"
                    style={{
                      width:
                        household.triJourneyStatus.caregiverStage === "Active" ? "100%" : "65%",
                    }}
                  />
                </div>
                <Link
                  href={`${portalPrefix}/caregivers/${household.primaryCaregiver.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline"
                >
                  <span>Open Caregiver File</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 3. Agency Operations Journey */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    3. Agency Operations
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200">
                    {household.triJourneyStatus.opsStage}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {household.scheduledHoursPerWeek} / {household.authorizedHoursPerWeek} hrs/wk
                  </p>
                  <p className="text-xs text-slate-500">
                    EVV Compliance: {household.evvComplianceRate}%
                  </p>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#3D6B22] h-2 rounded-full transition-all"
                    style={{ width: `${fulfillmentPct}%` }}
                  />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                  <span>{fulfillmentPct}% Authorized Hours Scheduled</span>
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "family" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
          {/* Client Member Card */}
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F2E4] text-[#1E5622] flex items-center justify-center font-bold text-sm border border-[#3D6B22]/20">
                  <Heart className="w-5 h-5" />
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

            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Relationship</span>
                <span className="font-semibold text-slate-800">{household.client.relationship}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Telephone</span>
                <span className="font-semibold text-slate-800">{household.client.phone}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-800">{household.client.email}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link
                href={`${portalPrefix}/clients/${household.client.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline"
              >
                <span>View Dedicated Client Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* Primary Caregiver Member Card */}
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F2E4] text-[#1E5622] flex items-center justify-center font-bold text-sm border border-[#3D6B22]/20">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {household.primaryCaregiver.name}
                  </h3>
                  <span className="text-[11px] text-slate-500">Designated Primary Caregiver</span>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {household.primaryCaregiver.status}
              </span>
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Role & Relationship</span>
                <span className="font-semibold text-slate-800">
                  {household.primaryCaregiver.relationship}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Telephone</span>
                <span className="font-semibold text-slate-800">
                  {household.primaryCaregiver.phone}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-800">
                  {household.primaryCaregiver.email}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link
                href={`${portalPrefix}/caregivers/${household.primaryCaregiver.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline"
              >
                <span>View Dedicated Caregiver Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "authorizations" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3D6B22]" />
                <span>Service Authorization Parameters</span>
              </h3>
              {perms.households.canApproveAuthorization && (
                <select
                  value={household.authStatus}
                  onChange={(e) => handleStatusChange(e.target.value as Household["authStatus"])}
                  aria-label="Authorization status"
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20"
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Expired">Expired</option>
                </select>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Care Program</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {household.program}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Authorized Hours</span>
                <span className="font-extrabold text-slate-900 text-lg mt-0.5 block">
                  {household.authorizedHoursPerWeek} hrs/wk
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Scheduled Hours</span>
                <span className="font-extrabold text-slate-900 text-lg mt-0.5 block">
                  {household.scheduledHoursPerWeek} hrs/wk
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Auth Expiry Date</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {household.authExpiry}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Status</span>
                <span className="font-bold text-[#3D6B22] mt-0.5 block">
                  {household.authStatus}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Fulfillment Rate</span>
                <span className="font-bold text-[#3D6B22] mt-0.5 block">
                  {fulfillmentPct}% Fulfilled
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#3D6B22]" />
              <span>Case Manager & State Agency</span>
            </h3>
            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Assigned Official</span>
                <span className="font-bold text-slate-900 text-sm">
                  {household.caseManager.name}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">State Agency</span>
                <span className="font-semibold text-slate-800">
                  {household.caseManager.agency}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Direct Telephone</span>
                <span className="font-semibold text-slate-800">{household.caseManager.phone}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Direct Email</span>
                <span className="font-semibold text-slate-800">{household.caseManager.email}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "evv" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
          <Card className="p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3D6B22]" />
              <span>Electronic Visit Verification (EVV)</span>
            </h3>
            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Compliance Rate</span>
                <span className="font-extrabold text-emerald-700 text-base">
                  {household.evvComplianceRate}% Verified
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Last Recorded Visit</span>
                <span className="font-semibold text-slate-800">{household.lastVisitDate}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Geofence Compliance</span>
                <span className="font-semibold text-slate-800">
                  100% Home GPS Location Match
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#3D6B22]" />
              <span>Scheduling Dispatch & Calendar</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Weekly shifts are coordinated with caregiver{" "}
              <strong className="text-slate-900">{household.primaryCaregiver.name}</strong> across{" "}
              {household.authorizedHoursPerWeek} authorized hours per week.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#3D6B22]/20 cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Schedule Home Visit</span>
              </button>
              <Link
                href={portalPrefix === "/admin" ? "/admin/scheduling" : "/scheduling"}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all"
              >
                <span>Open Shift Scheduler</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          <div className="lg:col-span-1">
            <Card className="p-5 sm:p-6 space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <FileText className="w-4 h-4 text-[#3D6B22]" />
                <span>Log Coordination Note</span>
              </h3>
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  rows={4}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record coordination update, visit check-in, or case manager follow-up..."
                  className="w-full text-sm p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all resize-none text-slate-800"
                />
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3D6B22] hover:bg-[#345C1D] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-[#3D6B22]/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Note to Timeline</span>
                </button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Clock className="w-4 h-4 text-[#3D6B22]" />
                <span>Household Activity History</span>
              </h3>
              <div className="relative pl-6 space-y-5 border-l-2 border-slate-100">
                {notes.map((n) => (
                  <div key={n.id} className="relative">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#3D6B22]" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 text-xs">{n.title}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.details}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Logged by {n.author} ({n.role})
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

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

      {perms.households.canDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Household Unit"
          description="Permanent deletion removes this household across both Agency Admin and Intake directories."
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          maxWidth="sm"
        >
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-slate-900">{household.name}</strong> ({household.code})?
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
                deleteHouseholdFromStorage(household.id);
                setIsDeleteModalOpen(false);
                toast.success(`Household ${household.name} deleted.`);
                router.push(backHref);
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
