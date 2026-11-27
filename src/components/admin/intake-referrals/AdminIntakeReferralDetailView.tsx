"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Building2,
  Clock,
  FileText,
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
  ExternalLink,
  ClipboardCheck,
  ShieldAlert,
  FileCheck,
  Copy,
  Check,
  Archive,
  Trash2,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import {
  ResponsiveDomainTabStrip,
  DomainTabItem,
} from "@/components/ui/ResponsiveDomainTabStrip";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";
import {
  convertInquiryToLiveEntities,
  getIntakeInquiriesFromStorage,
  archiveReferralAcrossStores,
  deleteReferralAcrossStores,
  subscribeToIntakeSync,
} from "@/lib/intake/intakeSync";
import { getClientsFromStorage, saveClientsToStorage } from "@/lib/clients/mockData";
import { getHouseholdsFromStorage, saveHouseholdsToStorage } from "@/lib/households/mockData";
import { enrichClientWith17Domains } from "@/lib/clients/enterpriseClientEnricher";
import {
  AdminIntakeReferralItem,
  ReferralStatus,
  getAdminReferralById,
  getAdminReferralsFromStorage,
  saveAdminReferralsToStorage,
} from "@/lib/intake-referrals/adminIntakeReferralsData";
import { ReferralProfileTab } from "./ReferralProfileTab";

interface AdminIntakeReferralDetailViewProps {
  referralId: string;
  initialEditMode?: boolean;
}

type ReferralTabType =
  | "profile"
  | "clinical"
  | "contact"
  | "payer"
  | "connected"
  | "chronology";

const REFERRAL_TABS: DomainTabItem<ReferralTabType>[] = [
  { id: "profile", label: "PROFILE", minWidth: 92 },
  { id: "clinical", label: "CLINICAL & TRIAGE", minWidth: 152 },
  { id: "contact", label: "DEMOGRAPHICS & CONTACT", minWidth: 196 },
  { id: "payer", label: "PAYER & SOURCE", minWidth: 140 },
  { id: "connected", label: "CONNECTED RECORDS", minWidth: 170 },
  { id: "chronology", label: "ACTIVITY & NOTES", minWidth: 148 },
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
  initialEditMode = false,
}: AdminIntakeReferralDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const perms = usePortalPermissions();

  const [referral, setReferral] = useState<AdminIntakeReferralItem | null>(null);
  const [activeTab, setActiveTab] = useState<ReferralTabType>("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(initialEditMode);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
    const load = () => {
      const item = getAdminReferralById(referralId);
      if (item) {
        setReferral(item);
        setNotesList((prev) =>
          prev.length > 0
            ? prev
            : [
              {
                author: item.assignedCoordinator || "Maria Santos, BSN",
                role: "Intake Coordinator & Triage RN",
                time: `${item.daysInPipeline} days ago`,
                category: "Clinical",
                text: item.triageNotes,
              },
              {
                author: item.referralSourceContact || "Discharge Navigator",
                role: "Referral Partner",
                time: item.receivedDate,
                category: "Payer",
                text: `Inbound referral received from ${item.referralSource}. Payer: ${item.payerName} (${item.estimatedHoursPerWeek} hrs/wk).`,
              },
              {
                author: "System Intake Gateway",
                role: "Automated Ingestion",
                time: item.receivedDate,
                category: "Coordination",
                text: `Referral logged with ${item.priority} priority and assigned to ${item.assignedCoordinator}.`,
              },
            ]
        );
      }
    };
    load();
    return subscribeToIntakeSync(load);
  }, [referralId]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const match = REFERRAL_TABS.find(
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

  if (!isMounted) {
    return (
      <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
        <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
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
    if (newStatus === "Enrolled") {
      setIsStatusDropdownOpen(false);
      handleConvertToClient();
      return;
    }

    const all = getAdminReferralsFromStorage();
    const updated = all.map((r) => (r.id === referral.id ? { ...r, status: newStatus } : r));
    saveAdminReferralsToStorage(updated);
    setReferral({ ...referral, status: newStatus });
    setIsStatusDropdownOpen(false);
    toast.success(`Referral status updated to ${newStatus}`);

    setNotesList((prev) => [
      {
        author: perms.actorName,
        role: perms.roleLabel,
        time: "Just now",
        category: "Coordination",
        text: `Pipeline status manually updated to ${newStatus}.`,
      },
      ...prev,
    ]);
  };

  const handleConvertToClient = () => {
    const numericSuffix = referral.id.replace(/\D/g, "");
    const inquiries = getIntakeInquiriesFromStorage();
    const matchedInquiry = inquiries.find(
      (inq) =>
        inq.id.toLowerCase() === referral.id.toLowerCase() ||
        (numericSuffix && inq.id.endsWith(`-${numericSuffix}`)) ||
        inq.familyInfo.clientInfo.name.toLowerCase() === referral.patientName.toLowerCase()
    );

    let createdClientId =
      referral.clientId || `CL-${numericSuffix || Math.floor(1050 + Math.random() * 50)}`;
    let createdHouseholdCode =
      referral.householdCode || `HH-${numericSuffix || Math.floor(1050 + Math.random() * 50)}`;

    if (matchedInquiry && !matchedInquiry.onboardingStatus?.converted) {
      const conv = convertInquiryToLiveEntities(matchedInquiry.id);
      if (conv.success && conv.client && conv.household) {
        createdClientId = conv.client.id;
        createdHouseholdCode = conv.household.code;
      }
    } else {
      const clients = getClientsFromStorage();
      const existingByName = clients.find(
        (c) =>
          c.id.toLowerCase() === createdClientId.toLowerCase() ||
          c.name.toLowerCase() === referral.patientName.trim().toLowerCase()
      );
      if (existingByName) {
        createdClientId = existingByName.id;
        createdHouseholdCode = existingByName.household?.code || createdHouseholdCode;
      } else {
        const nameParts = referral.patientName.trim().split(/\s+/);
        const firstName = nameParts[0] || "Client";
        const lastName = nameParts.slice(1).join(" ") || "Recipient";
        const newClient = enrichClientWith17Domains({
          id: createdClientId,
          originReferralId: referral.id,
          firstName,
          lastName,
          name: referral.patientName,
          preferredName: firstName,
          dob: "1955-01-01",
          age: referral.age || 70,
          gender: referral.gender || "Female",
          primaryLanguage: "English",
          status: "Active",
          careType: "Family Care",
          household: {
            id: createdHouseholdCode.toLowerCase(),
            code: createdHouseholdCode,
            name: `${lastName} Household`,
            address: referral.address,
            city: referral.city,
            state: "PA",
            zip: referral.zip,
            phone: referral.phone,
            totalMembersCount: 2,
          },
          primaryContact: {
            name: referral.referralSourceContact || referral.patientName,
            relationship: "Primary Contact",
            phone: referral.phone,
            email: referral.email,
            preferredMethod: "Phone",
          },
          emergencyContact: {
            name: referral.referralSourceContact || "Family Contact",
            relationship: "Guardian / POA",
            phone: referral.phone,
          },
          assignedCareTeam: {
            primaryCaregiver: null,
            familyContact: {
              id: `FC-${numericSuffix || "100"}`,
              name: referral.referralSourceContact || referral.patientName,
              relationship: "Primary Family Contact",
              phone: referral.phone,
              email: referral.email,
            },
            onboardingCoordinator: {
              id: "OC-ADMIN",
              name: referral.assignedCoordinator,
              email: "intake@lilisare.com",
              phone: referral.phone,
            },
          },
          readiness: {
            clientProfile: "Complete",
            careArrangement: "Pending",
            documents: referral.insuranceVerified ? "Verified" : "Review needed",
            authorization: referral.insuranceVerified ? "Verified" : "Pending",
            overallScore: 80,
          },
          carePlan: {
            program: referral.program,
            approvedServices: referral.requestedServices,
            authorizedWeeklyHours: referral.estimatedHoursPerWeek || 25,
            scheduledWeeklyHours: 0,
            hoursUsedThisWeek: 0,
            effectiveDate: new Date().toISOString().slice(0, 10),
            reviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            needsReview: false,
            frequency: "Weekly",
            careNeeds: referral.requestedServices,
            specialInstructions: referral.triageNotes,
            mobilityNotes: referral.primaryDiagnosis,
            dietaryRestrictions: "None",
            allergies: [],
            adlSupportNeeds: ["Personal Care"],
          },
          authorization: {
            authNumber: `AUTH-${numericSuffix || "8841"}`,
            payer: referral.payerName,
            status: referral.insuranceVerified ? "Verified" : "Pending Renewal",
            startDate: new Date().toISOString().slice(0, 10),
            expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            daysUntilExpiry: 180,
            totalUnitsApproved: (referral.estimatedHoursPerWeek || 25) * 24,
            unitsUsed: 0,
            unitsRemaining: (referral.estimatedHoursPerWeek || 25) * 24,
            weeklyHourCap: referral.estimatedHoursPerWeek || 25,
            caseManagerName: referral.assignedCoordinator || "Assigned Case Manager",
            caseManagerAgency: referral.payerName || "State Medicaid DHS",
          },
          documents: [],
          householdMembers: [],
          activity: [],
          attentionItems: [],
          updatedAt: new Date().toISOString(),
          updatedAtRelative: "Just now",
        });
        saveClientsToStorage([newClient, ...clients]);
      }

      const households = getHouseholdsFromStorage();
      if (!households.some((h) => h.code.toLowerCase() === createdHouseholdCode.toLowerCase())) {
        const lastName = referral.patientName.trim().split(/\s+/).pop() || "Family";
        saveHouseholdsToStorage([
          {
            id: createdHouseholdCode.toLowerCase(),
            code: createdHouseholdCode,
            name: `${lastName} Household`,
            address: referral.address,
            city: referral.city,
            state: "PA",
            zip: referral.zip,
            phone: referral.phone,
            program: referral.program,
            caseManager: {
              name: referral.assignedCoordinator,
              agency: referral.payerName,
              email: "casemanager@lilisare.com",
              phone: referral.phone,
            },
            client: {
              id: createdClientId,
              name: referral.patientName,
              role: "client",
              relationship: "Care Recipient",
              status: "Active",
              phone: referral.phone,
              email: referral.email,
            },
            primaryCaregiver: {
              id: "CG-PENDING",
              name: "Caregiver Assignment Pending",
              role: "caregiver",
              relationship: "Pending Match",
              status: "Onboarding",
              phone: referral.phone,
              email: referral.email,
            },
            authorizedHoursPerWeek: referral.estimatedHoursPerWeek || 25,
            scheduledHoursPerWeek: 0,
            authStatus: referral.insuranceVerified ? "Approved" : "Pending Review",
            authExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            triJourneyStatus: {
              clientStage: "Authorized",
              caregiverStage: "Registered",
              opsStage: "Coordination",
            },
            evvComplianceRate: 0,
            lastVisitDate: "Not Started",
          },
          ...households,
        ]);
      }
    }

    const all = getAdminReferralsFromStorage();
    const updated = all.map((r) =>
      r.id === referral.id
        ? {
          ...r,
          status: "Enrolled" as ReferralStatus,
          clientId: createdClientId,
          householdCode: createdHouseholdCode,
        }
        : r
    );
    saveAdminReferralsToStorage(updated);
    setReferral({
      ...referral,
      status: "Enrolled",
      clientId: createdClientId,
      householdCode: createdHouseholdCode,
    });
    toast.success(
      `${referral.patientName} admitted & synced to Client (${createdClientId}) and Household (${createdHouseholdCode})`
    );

    setNotesList((prev) => [
      {
        author: perms.actorName,
        role: perms.roleLabel,
        time: "Just now",
        category: "Coordination",
        text: `Client admitted into active home care roster (${createdClientId}) and linked to Household ${createdHouseholdCode}.`,
      },
      ...prev,
    ]);
  };

  const handleArchiveReferral = () => {
    archiveReferralAcrossStores(referral.id, `Archived by ${perms.roleLabel}`);
    setReferral({ ...referral, status: "Archived" });
    toast.success(`Referral ${referral.id} archived.`);
  };

  const handleDeleteReferral = () => {
    if (!perms.referrals.canDelete) {
      toast.error("Permanent deletion is restricted to Agency Administrators.");
      return;
    }
    deleteReferralAcrossStores(referral.id);
    setIsDeleteModalOpen(false);
    toast.success(`Referral ${referral.id} permanently deleted.`);
    router.push("/admin/intake-referrals");
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setNotesList((prev) => [
      {
        author: perms.actorName,
        role: perms.roleLabel,
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
    <div className="w-full max-w-9xl mx-auto space-y-5 pb-16 animate-in fade-in duration-300">
      {/* 01. Back Navigation Link */}
      <div>
        <Link
          href="/admin/intake-referrals"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Referrals Directory</span>
        </Link>
      </div>

      {/* 02. Hero Identity Card (Matched to AdminCaregiverDetailView & AdminClientDetailView) */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20 flex items-center justify-center text-xl font-bold">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs border-2 border-white ${referral.priority === "Urgent"
                  ? "bg-rose-600"
                  : referral.priority === "High"
                    ? "bg-amber-500"
                    : "bg-[#3D6B22]"
                  }`}
              >
                {referral.priority}
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                {referral.patientName}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80">
                {referral.id}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 flex-wrap text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#3D6B22] border border-emerald-200/80">
                {referral.program}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Received {referral.receivedDate} ({referral.daysInPipeline}d in pipeline)
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Control */}
        <div className="flex items-center gap-2.5 shrink-0">
          {referral.status !== "Enrolled" ? (
            <button
              type="button"
              onClick={handleConvertToClient}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-100" />
              <span>Admit as Active Client</span>
            </button>
          ) : (
            <Link
              href={referral.clientId ? `/admin/clients/${referral.clientId}` : "/admin/clients"}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {referral.clientId
                  ? `Converted to Client (${referral.clientId})`
                  : "Converted to Client"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* 02b. Secondary Referral Actions Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Referral Workflow Actions</h2>
          <p className="text-xs text-slate-500 mt-0.5">Update intake stage, edit referral record, or manage status</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
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
                    type="button"
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

          <Link
            href={`/admin/intake-referrals/${referral.id}/edit`}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Edit3 className="w-4 h-4 text-slate-400" />
            <span>Edit Referral</span>
          </Link>

          {perms.referrals.canArchive &&
            referral.status !== "Archived" &&
            referral.status !== "Enrolled" && (
              <button
                type="button"
                onClick={handleArchiveReferral}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Archive className="w-4 h-4 text-slate-400" />
                <span>Archive</span>
              </button>
            )}

          {perms.referrals.canDelete && (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* 03. Space-Aware Responsive Tab Navigation Strip */}
      <ResponsiveDomainTabStrip
        tabs={REFERRAL_TABS}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        ariaLabel="Referral record sections"
      />

      {/* 04. Tab Content Modules */}
      {activeTab === "profile" && (
        <ReferralProfileTab
          referral={referral}
          isEditing={isEditingProfile}
          onToggleEdit={setIsEditingProfile}
          onUpdateReferral={setReferral}
          onLogActivity={(category, text) =>
            setNotesList((prev) => [
              {
                author: perms.actorName,
                role: perms.roleLabel,
                time: "Just now",
                category,
                text,
              },
              ...prev,
            ])
          }
        />
      )}

      {activeTab === "clinical" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-[#3D6B22]" />
                <span>ADL & Mobility Directives</span>
              </h3>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                Priority: {referral.priority}
              </span>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Primary Clinical Diagnosis
              </span>
              <p className="text-xs sm:text-sm text-slate-900 font-bold leading-relaxed">
                {referral.primaryDiagnosis}
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                {
                  task: "Bathing & Personal Hygiene",
                  req: "Hands-on assistance required with shower chair & transfer bench",
                  status: "Total Assist",
                },
                {
                  task: "Bed Mobility & Transfers",
                  req: "Standby assist with gait belt and safe transfer supervision",
                  status: "Standby Guard",
                },
                {
                  task: "Medication Reminders",
                  req: "Supervised self-administration and daily schedule verification",
                  status: "Prompting",
                },
              ].map((item) => (
                <div
                  key={item.task}
                  className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/70"
                >
                  <div className="space-y-0.5 max-w-[72%]">
                    <span className="font-bold text-slate-900 block">{item.task}</span>
                    <span className="text-slate-500 block text-[11px]">{item.req}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#1E5622] bg-[#E8F2E4] px-2 py-0.5 rounded border border-[#3D6B22]/20 shrink-0">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-3 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-bold block text-amber-950 mb-0.5">
                  Triage & Safety Directives
                </strong>
                {referral.triageNotes}
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#3D6B22]" />
                <span>Supervisory Nursing Oversight</span>
              </h3>
              <span className="text-xs text-slate-500">
                Lead: <strong className="text-slate-800">{referral.assignedCoordinator}</strong>
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Initial In-Home Clinical Assessment
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Target: {referral.targetStartDate}
                  </span>
                </div>
                <div className="font-bold text-slate-900">
                  Comprehensive In-Home Intake & Home Safety Assessment
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Mandatory RN assessment to establish baseline clinical metrics and finalize care plan prior to activation.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Requested Service Lines
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {referral.requestedServices.map((svc) => (
                    <span
                      key={svc}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-slate-700 border border-slate-200"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Supervisory Cycle
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">Every 60 Calendar Days</div>
                </div>
                <span className="text-xs font-semibold text-[#1E5622] bg-[#E8F2E4] px-2.5 py-1 rounded-lg border border-[#3D6B22]/20">
                  Mandated
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "contact" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-[#3D6B22]" />
                <span>Client Identity & Contacts</span>
              </h3>
              <span className="text-xs text-slate-500 font-bold">{referral.id}</span>
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">Full Legal Name</span>
                <span className="font-bold text-slate-900">{referral.patientName}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">Age & Gender</span>
                <span className="font-bold text-slate-900">
                  {referral.age} years old ({referral.gender})
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
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
                    type="button"
                    onClick={() => handleCopy(referral.phone, "Phone")}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
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
              <div className="flex justify-between items-center py-2">
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
                    type="button"
                    onClick={() => handleCopy(referral.email, "Email")}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
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
            </div>
          </Card>

          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#3D6B22]" />
                <span>Service Residence & EVV Geofence</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                GPS Ready
              </span>
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">Physical Address</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-right">{referral.address}</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(`${referral.address}, ${referral.city} ${referral.zip}`, "Address")
                    }
                    className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
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
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">City & ZIP</span>
                <span className="font-bold text-slate-900">
                  {referral.city}, {referral.zip}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">EVV Perimeter Radius</span>
                <span className="font-bold text-emerald-700">150 Meters Geofence</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "payer" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3D6B22]" />
                <span>Inbound Referral Partner</span>
              </h3>
              <span className="text-xs font-semibold text-[#1E5622] bg-[#E8F2E4] px-2.5 py-0.5 rounded-full border border-[#3D6B22]/20">
                Partner Source
              </span>
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">Referring Organization</span>
                <span className="font-bold text-slate-900">{referral.referralSource}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">Source Contact</span>
                <span className="font-bold text-slate-900">
                  {referral.referralSourceContact || "Direct Referral"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">Ingestion Date</span>
                <span className="font-bold text-slate-900">
                  {referral.receivedDate} ({referral.daysInPipeline} days elapsed)
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Clinical Packet Checklist
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {["Discharge Summary", "Care Assessment", "Physician Orders", "Consent Package"].map(
                  (doc) => (
                    <div key={doc} className="flex items-center gap-1.5 text-slate-700">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{doc}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3D6B22]" />
                <span>Payer & Authorization Details</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {referral.insuranceVerified ? "Verified" : "Pending"}
              </span>
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">Primary Payer</span>
                <span className="font-bold text-slate-900">{referral.payerName}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">Funding Program</span>
                <span className="font-bold text-slate-900">{referral.program}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">Target Weekly Hours</span>
                <span className="font-bold text-slate-900">
                  {referral.estimatedHoursPerWeek} Hours / Week
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">Target Start Date</span>
                <span className="font-bold text-emerald-700">{referral.targetStartDate}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "connected" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {/* Household Hub Card */}
          <Card className="p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Household Hub
                </span>
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {referral.householdCode || "Pending"}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {referral.patientName.split(" ").pop()} Household
              </h3>
              <p className="text-xs text-slate-500">
                Unified family care unit linking Client, Caregiver, and Agency Operations.
              </p>
            </div>
            {referral.householdCode ? (
              <Link
                href={`/admin/households/${referral.householdCode.toLowerCase()}`}
                className="inline-flex items-center justify-between w-full px-3.5 py-2 text-xs font-bold text-[#1E5622] bg-[#E8F2E4]/60 hover:bg-[#E8F2E4] border border-[#3D6B22]/20 rounded-xl transition-all"
              >
                <span>Open Household Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleConvertToClient}
                className="inline-flex items-center justify-center w-full px-3.5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl cursor-pointer"
              >
                Create & Link Household
              </button>
            )}
          </Card>

          {/* Client Profile Card */}
          <Card className="p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Client Profile
                </span>
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {referral.clientId || "Pending"}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{referral.patientName}</h3>
              <p className="text-xs text-slate-500">
                17-domain client chart covering ADLs, plan of care, authorizations, and notes.
              </p>
            </div>
            {referral.clientId ? (
              <Link
                href={`/admin/clients/${referral.clientId}`}
                className="inline-flex items-center justify-between w-full px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
              >
                <span>View Client Profile</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleConvertToClient}
                className="inline-flex items-center justify-center w-full px-3.5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl cursor-pointer"
              >
                Admit as Active Client
              </button>
            )}
          </Card>

          {/* Assigned Coordinator Card */}
          <Card className="p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Assigned Coordinator
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active Lead
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{referral.assignedCoordinator}</h3>
              <p className="text-xs text-slate-500">Lead Intake & Triage Navigator</p>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
              <a
                href={`tel:${referral.phone}`}
                className="text-[#3D6B22] font-semibold flex items-center gap-1 hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Client</span>
              </a>
              <span className="text-slate-300">•</span>
              <a
                href={`mailto:${referral.email}`}
                className="text-[#3D6B22] font-semibold flex items-center gap-1 hover:underline"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </a>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "chronology" && (
        <Card className="p-5 sm:p-6 space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3D6B22]" />
              <span>Intake Chronology & Coordination Log</span>
            </h3>

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

          <form
            onSubmit={handleAddNote}
            className="space-y-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/80"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
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
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer shadow-md shadow-[#3D6B22]/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Coordination Note</span>
              </button>
            </div>
          </form>

          <div className="space-y-3 pt-1">
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
        </Card>
      )}

      {perms.referrals.canDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Intake Referral"
          description="Permanent deletion removes this referral across both Intake and Admin directories."
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          maxWidth="sm"
        >
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete referral{" "}
            <strong className="text-slate-900">{referral.patientName}</strong> ({referral.id})?
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
              onClick={handleDeleteReferral}
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
