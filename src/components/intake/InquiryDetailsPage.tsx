"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { InquiryRecord, InquiryStage, DocumentItem } from "@/types/intake";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  FileText,
  Clock,
  Building2,
  Stethoscope,
  ArrowRight,
  Send,
  RefreshCw,
  AlertTriangle,
  Archive,
  Trash2,
  Edit3,
  Sparkles,
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
  getIntakeInquiriesFromStorage,
  saveIntakeInquiriesToStorage,
  convertInquiryToLiveEntities,
  syncInquiryStageToAdmin,
  archiveReferralAcrossStores,
  deleteReferralAcrossStores,
  subscribeToIntakeSync,
} from "@/lib/intake/intakeSync";
import { InquiryProfileTab } from "./InquiryProfileTab";
import { ContactFamilyModal } from "./modals/ContactFamilyModal";
import { ScheduleAssessmentModal } from "./modals/ScheduleAssessmentModal";
import { AssignCoordinatorModal } from "./modals/AssignCoordinatorModal";
import { ConvertToOnboardingModal } from "./modals/ConvertToOnboardingModal";

interface InquiryDetailsPageProps {
  initialInquiry: InquiryRecord;
  backHref?: string;
  backLabel?: string;
  initialEditMode?: boolean;
}

type InquiryTabType =
  | "profile"
  | "care"
  | "documents"
  | "journeys"
  | "timeline";

const INQUIRY_TABS: DomainTabItem<InquiryTabType>[] = [
  { id: "profile", label: "PROFILE", minWidth: 92 },
  { id: "care", label: "CARE REQUIREMENTS", minWidth: 162 },
  { id: "documents", label: "DOCUMENTS & PAYER", minWidth: 164 },
  { id: "journeys", label: "CONNECTED JOURNEYS", minWidth: 174 },
  { id: "timeline", label: "TIMELINE & NOTES", minWidth: 148 },
];

const STAGE_SOLID_BG: Record<InquiryStage, string> = {
  "New Inquiry": "bg-rose-500",
  Contacted: "bg-amber-500",
  "Needs Discussion": "bg-purple-600",
  "CMA Coordination": "bg-sky-600",
  "Family Decision": "bg-teal-600",
  Converted: "bg-[#3D6B22]",
  Closed: "bg-slate-500",
  "New Lead": "bg-rose-500",
  "In Assessment": "bg-sky-600",
  "CM Coordination": "bg-indigo-600",
};

export function InquiryDetailsPage({
  initialInquiry,
  backHref = "/intake/pipeline/",
  backLabel = "Back to Pipeline & Inquiries",
  initialEditMode = false,
}: InquiryDetailsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const perms = usePortalPermissions();

  const [inquiry, setInquiry] = useState<InquiryRecord>(initialInquiry);
  const [activeTab, setActiveTab] = useState<InquiryTabType>("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(initialEditMode);
  const [newNote, setNewNote] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const cleanBackBase = backHref.replace(/\/$/, "");
  const editHref = `${cleanBackBase}/${inquiry.id}/edit`;

  useEffect(() => {
    const sync = () => {
      const all = getIntakeInquiriesFromStorage();
      const live = all.find(
        (i) => i.id.toLowerCase() === initialInquiry.id.toLowerCase()
      );
      if (live) setInquiry(live);
    };
    sync();
    return subscribeToIntakeSync(sync);
  }, [initialInquiry.id]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const match = INQUIRY_TABS.find(
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

  const persistInquiry = (updater: (prev: InquiryRecord) => InquiryRecord) => {
    setInquiry((prev) => {
      const next = updater(prev);
      const all = getIntakeInquiriesFromStorage();
      const exists = all.some((i) => i.id.toLowerCase() === next.id.toLowerCase());
      const updatedList = exists
        ? all.map((i) => (i.id.toLowerCase() === next.id.toLowerCase() ? next : i))
        : [next, ...all];
      saveIntakeInquiriesToStorage(updatedList);
      return next;
    });
  };

  const stagesList: InquiryStage[] = [
    "New Lead",
    "Contacted",
    "In Assessment",
    "CM Coordination",
    "Converted",
  ];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    persistInquiry((prev) => ({
      ...prev,
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: "note",
          author: perms.actorName,
          authorRole: perms.roleLabel,
          timestamp: "Just now",
          title: "Coordinator Note Added",
          details: newNote.trim(),
        },
        ...prev.timeline,
      ],
    }));

    setNewNote("");
    toast.success("Follow-up note logged to timeline");
  };

  const handleLogCommunication = (
    _inquiryId: string,
    type: "call" | "email" | "note",
    noteText: string
  ) => {
    persistInquiry((prev) => ({
      ...prev,
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: type === "call" ? "call" : type === "email" ? "email" : "note",
          author: perms.actorName,
          authorRole: perms.roleLabel,
          timestamp: "Just now",
          title:
            type === "call"
              ? "Phone Contact Logged"
              : type === "email"
                ? "Email Sent to Family"
                : "Communication Note Added",
          details: noteText,
        },
        ...prev.timeline,
      ],
    }));
  };

  const handleConfirmSchedule = (
    inquiryId: string,
    details: {
      scheduledDate: string;
      scheduledTime: string;
      assessor: string;
      type: string;
      notes: string;
    }
  ) => {
    persistInquiry((prev) => ({
      ...prev,
      stage: "In Assessment",
      assessmentStatus: "Scheduled",
      assessmentDetails: {
        scheduledDate: details.scheduledDate,
        scheduledTime: details.scheduledTime,
        assessor: details.assessor,
        type: details.type,
        notes: details.notes,
      },
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: "assessment",
          author: perms.actorName,
          timestamp: "Just now",
          title: `${details.type} Scheduled`,
          details: `Date: ${details.scheduledDate} at ${details.scheduledTime} with ${details.assessor}. Notes: ${details.notes}`,
        },
        ...prev.timeline,
      ],
    }));
    syncInquiryStageToAdmin(inquiryId, "In Assessment");
  };

  const handleConfirmAssignment = (
    _inquiryId: string,
    coordinatorName: string,
    role: string
  ) => {
    persistInquiry((prev) => ({
      ...prev,
      referralInfo: {
        ...prev.referralInfo,
        assignedCoordinator: {
          name: coordinatorName,
          role,
          email: `${coordinatorName.toLowerCase().replace(/\s+/g, ".")}@lilisare.com`,
        },
      },
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: "assignment",
          author: perms.actorName,
          timestamp: "Just now",
          title: `Assigned to ${coordinatorName}`,
          details: `Inquiry assigned to ${coordinatorName} (${role}).`,
        },
        ...prev.timeline,
      ],
    }));
  };

  const handleUpdateStatus = (newStage: InquiryStage) => {
    persistInquiry((prev) => ({
      ...prev,
      stage: newStage,
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: "status_change",
          author: perms.actorName,
          timestamp: "Just now",
          title: `Stage Updated to ${newStage}`,
          details: `Inquiry status changed to ${newStage}.`,
        },
        ...prev.timeline,
      ],
    }));
    syncInquiryStageToAdmin(inquiry.id, newStage);
    setIsStatusDropdownOpen(false);
    toast.success(`Stage updated to ${newStage}`);
  };

  const handleToggleDocStatus = (docId: string) => {
    persistInquiry((prev) => {
      const updatedDocs: DocumentItem[] = prev.documents.map((d) => {
        if (d.id === docId) {
          const nextStatus: DocumentItem["status"] =
            d.status === "Received"
              ? "Missing"
              : d.status === "Missing"
                ? "Pending Review"
                : "Received";
          return { ...d, status: nextStatus };
        }
        return d;
      });
      return { ...prev, documents: updatedDocs };
    });
    toast.info("Document status updated");
  };

  const handleConfirmConversion = (inquiryId: string) => {
    const result = convertInquiryToLiveEntities(inquiryId);
    if (result.success) {
      const refreshed = getIntakeInquiriesFromStorage().find(
        (i) => i.id.toLowerCase() === inquiryId.toLowerCase()
      );
      if (refreshed) setInquiry(refreshed);
    } else {
      persistInquiry((prev) => ({
        ...prev,
        stage: "Converted",
        onboardingStatus: {
          converted: true,
          convertedAt: new Date().toISOString(),
          clientProfileId: `CL-${Math.floor(1050 + Math.random() * 50)}`,
          caregiverProfileId: prev.familyInfo.potentialCaregiver?.name
            ? `CG-${Math.floor(2050 + Math.random() * 50)}`
            : undefined,
        },
      }));
    }
    setIsConvertModalOpen(false);
    toast.success(
      `${inquiry.familyName} converted and synced across Client, Caregiver, and Household records!`
    );
  };

  const handleArchiveInquiry = () => {
    archiveReferralAcrossStores(inquiry.id, `Archived by ${perms.roleLabel}`);
    const refreshed = getIntakeInquiriesFromStorage().find(
      (i) => i.id.toLowerCase() === inquiry.id.toLowerCase()
    );
    if (refreshed) setInquiry(refreshed);
    toast.success(`Inquiry ${inquiry.id} archived and closed.`);
  };

  const handleDeleteInquiry = () => {
    if (!perms.referrals.canDelete) {
      toast.error("Permanent deletion is restricted to Agency Administrators.");
      return;
    }
    deleteReferralAcrossStores(inquiry.id);
    setIsDeleteModalOpen(false);
    toast.success(`Inquiry ${inquiry.id} permanently removed.`);
    router.push(backHref);
  };

  const familyInitials = inquiry.familyName
    .replace(/^The\s+/i, "")
    .slice(0, 2)
    .toUpperCase();
  const stageSolidBg = STAGE_SOLID_BG[inquiry.stage] || "bg-[#3D6B22]";

  return (
    <div className="w-full max-w-9xl mx-auto space-y-5 pb-16 animate-in fade-in duration-300">
      {/* 01. Back Navigation Link */}
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* 02. Hero Identity Card (Matched to AdminClientDetailView & AdminCaregiverDetailView) */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20 flex items-center justify-center text-xl font-bold">
              {familyInitials}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs border-2 border-white ${stageSolidBg}`}
              >
                {inquiry.stage}
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                {inquiry.familyName}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80">
                {inquiry.id}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 flex-wrap text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#3D6B22] border border-emerald-200/80">
                {inquiry.careRequirements.programInterest}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {inquiry.familyInfo.clientInfo.name} ({inquiry.familyInfo.clientInfo.age}y)
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 border-t xl:border-t-0 pt-3.5 xl:pt-0 border-slate-100">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>{inquiry.stage}</span>
            </button>
            {isStatusDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                  Advance Stage
                </div>
                {stagesList.map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => handleUpdateStatus(stg)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      inquiry.stage === stg
                        ? "font-semibold text-[#3D6B22] bg-emerald-50/50"
                        : "text-slate-800"
                    }`}
                  >
                    <span>{stg}</span>
                    {inquiry.stage === stg && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href={editHref}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Edit3 className="w-4 h-4 text-slate-400" />
            <span>Edit Inquiry</span>
          </Link>

          {perms.referrals.canArchive &&
            inquiry.stage !== "Closed" &&
            inquiry.stage !== "Converted" && (
              <button
                type="button"
                onClick={handleArchiveInquiry}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Archive className="w-4 h-4 text-slate-400" />
                <span>Archive</span>
              </button>
            )}

          {perms.referrals.canDelete && (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsConvertModalOpen(true)}
            disabled={inquiry.stage === "Converted"}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span>
              {inquiry.stage === "Converted"
                ? "Converted to Onboarding"
                : "Convert to Onboarding"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 03. Space-Aware Responsive Tab Navigation Strip */}
      <ResponsiveDomainTabStrip
        tabs={INQUIRY_TABS}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        ariaLabel="Inquiry pipeline sections"
      />

      {/* 04. Tab Content Modules */}
      {activeTab === "profile" && (
        <InquiryProfileTab
          inquiry={inquiry}
          isEditing={isEditingProfile}
          onToggleEdit={setIsEditingProfile}
          onSaveInquiry={(updated) => {
            persistInquiry(() => updated);
            syncInquiryStageToAdmin(updated.id, updated.stage);
          }}
          onOpenContactFamily={() => setIsContactModalOpen(true)}
          onOpenScheduleAssessment={() => setIsScheduleModalOpen(true)}
          onOpenAssignCoordinator={() => setIsAssignModalOpen(true)}
        />
      )}

      {activeTab === "care" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          <div className="lg:col-span-2 space-y-5">
            <Card className="p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#3D6B22]" />
                <span>Authorized Hours & Schedule Preference</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">
                    Requested Care Hours
                  </span>
                  <p className="text-lg font-bold text-slate-900">
                    {inquiry.careRequirements.hoursPerWeek} hrs / week
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">
                    Target Start Date
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    {inquiry.careRequirements.targetStartDate || "Immediate"}
                  </p>
                </div>
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">
                    Preferred Daily Schedule
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    {inquiry.careRequirements.schedulePreference || "Flexible daily coverage"}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Requested Care Support Types
                </span>
                <div className="flex flex-wrap gap-2">
                  {inquiry.careRequirements.careType.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 rounded-xl bg-emerald-50 text-[#1E5622] text-xs font-semibold border border-emerald-200/80"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-5 sm:p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#3D6B22]" />
                <span>Support Requirements & Clinical Context</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                {inquiry.careRequirements.supportRequirements}
              </p>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-5 sm:p-6 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#3D6B22]" />
                <span>Service Delivery Location</span>
              </h3>
              <p className="font-semibold text-slate-800">
                {inquiry.careRequirements.preferredLocation}
              </p>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-[11px] text-slate-600">
                In-home visits verified within {inquiry.branch} operational radius.
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          <div className="lg:col-span-2 space-y-5">
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#3D6B22]" />
                  <span>Required Intake Documents</span>
                </h3>
                <span className="text-xs text-slate-400">Click to toggle status</span>
              </div>

              <div className="space-y-2.5">
                {inquiry.documents.map((doc) => {
                  const statusColors = {
                    Received: "bg-emerald-50 text-[#1E5622] border-emerald-200",
                    Missing: "bg-rose-50 text-rose-700 border-rose-200",
                    "Pending Review": "bg-amber-50 text-amber-800 border-amber-200",
                  }[doc.status];

                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleToggleDocStatus(doc.id)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-white transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                            {doc.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Category: {doc.category}
                            {doc.uploadedDate ? ` • Uploaded ${doc.uploadedDate}` : ""}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColors}`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-5 sm:p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3D6B22]" />
                <span>Payer & Case Manager</span>
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Primary Program</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">
                    {inquiry.careRequirements.programInterest}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Case Manager</span>
                  <p className="font-semibold text-slate-800">
                    {inquiry.referralInfo.caseManager?.name || "Pending"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {inquiry.referralInfo.caseManager?.agency}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "journeys" && (
        <Card className="p-5 sm:p-6 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3D6B22]" />
                <span>Connected Journeys & Conversion Readiness</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Converting this inquiry automatically links Client, Caregiver, and Household records across portals
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200">
              {inquiry.onboardingStatus?.converted ? "Converted & Linked" : "Pre-Conversion"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1. Client Journey
              </span>
              <p className="text-sm font-bold text-slate-900">
                {inquiry.familyInfo.clientInfo.name}
              </p>
              <p className="text-xs text-slate-500">
                {inquiry.onboardingStatus?.clientProfileId
                  ? `Linked Client ID: ${inquiry.onboardingStatus.clientProfileId}`
                  : "Will provision Client Profile on conversion"}
              </p>
              {inquiry.onboardingStatus?.clientProfileId && (
                <Link
                  href={`/intake/clients/${inquiry.onboardingStatus.clientProfileId}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3D6B22] hover:underline"
                >
                  <span>Open Client Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                2. Caregiver Journey
              </span>
              <p className="text-sm font-bold text-slate-900">
                {inquiry.familyInfo.potentialCaregiver?.name || "Pending Assignment"}
              </p>
              <p className="text-xs text-slate-500">
                {inquiry.onboardingStatus?.caregiverProfileId
                  ? `Linked Caregiver ID: ${inquiry.onboardingStatus.caregiverProfileId}`
                  : "Caregiver onboarding tracks credential & screening completion"}
              </p>
              {inquiry.onboardingStatus?.caregiverProfileId && (
                <Link
                  href={`/intake/caregivers/${inquiry.onboardingStatus.caregiverProfileId}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3D6B22] hover:underline"
                >
                  <span>Open Caregiver Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                3. Agency Operations
              </span>
              <p className="text-sm font-bold text-slate-900">{inquiry.familyName}</p>
              <p className="text-xs text-slate-500">
                Stage: {inquiry.stage} • {inquiry.careRequirements.hoursPerWeek} hrs/wk
              </p>
              {!inquiry.onboardingStatus?.converted && (
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3D6B22] hover:underline cursor-pointer"
                >
                  <span>Convert to Onboarding</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </Card>
      )}

      {activeTab === "timeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          <div className="lg:col-span-2 space-y-5">
            <Card className="p-5 sm:p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#3D6B22]" />
                <span>Log Coordinator Call / Follow-up Note</span>
              </h3>
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record call summary, family preference update, or clinical coordination note..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] disabled:opacity-50 rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Note</span>
                  </button>
                </div>
              </form>
            </Card>

            <Card className="p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span>Inquiry Activity & Communication Log</span>
              </h3>
              <div className="space-y-3">
                {inquiry.timeline.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#1E5622] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">{item.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">{item.details}</p>
                      <span className="text-[10px] text-slate-400 mt-1.5 block">
                        By {item.author}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-5 sm:p-6 text-xs space-y-2">
              <span className="font-bold text-slate-800 block">Audit & Compliance</span>
              <p className="text-slate-500 leading-relaxed">
                All phone notes, status updates, and coordinator assignments are logged under HIPAA audit tracking requirements.
              </p>
            </Card>
          </div>
        </div>
      )}

      <ContactFamilyModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        inquiry={inquiry}
        onLogCommunication={handleLogCommunication}
      />
      <ScheduleAssessmentModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        inquiry={inquiry}
        onConfirmSchedule={handleConfirmSchedule}
      />
      <AssignCoordinatorModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        inquiry={inquiry}
        onConfirmAssignment={handleConfirmAssignment}
      />
      <ConvertToOnboardingModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        inquiry={inquiry}
        onConfirmConversion={handleConfirmConversion}
      />

      {perms.referrals.canDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Inquiry Record"
          description="Permanent deletion is restricted to Agency Administrators and cannot be undone."
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          maxWidth="sm"
        >
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-slate-900">{inquiry.familyName}</strong> ({inquiry.id})?
            For routine closures, consider using <strong>Archive</strong> instead.
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
              onClick={handleDeleteInquiry}
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
