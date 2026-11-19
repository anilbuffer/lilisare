"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InquiryRecord, InquiryStage, DocumentItem } from "@/types/intake";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Heart,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Stethoscope,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Send,
  CalendarPlus,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { ContactFamilyModal } from "./modals/ContactFamilyModal";
import { ScheduleAssessmentModal } from "./modals/ScheduleAssessmentModal";
import { AssignCoordinatorModal } from "./modals/AssignCoordinatorModal";
import { ConvertToOnboardingModal } from "./modals/ConvertToOnboardingModal";

interface InquiryDetailsPageProps {
  initialInquiry: InquiryRecord;
  backHref?: string;
  backLabel?: string;
}

const STAGE_STYLES: Record<InquiryStage, { bg: string; text: string; border: string }> = {
  "New Lead": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  "Contacted": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  "In Assessment": { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200" },
  "CM Coordination": { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
  "Converted": { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
};

export function InquiryDetailsPage({
  initialInquiry,
  backHref = "/intake/pipeline/",
  backLabel = "Back to Pipeline & Inquiries",
}: InquiryDetailsPageProps) {
  const router = useRouter();
  const [inquiry, setInquiry] = useState<InquiryRecord>(initialInquiry);
  const [newNote, setNewNote] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  const stageStyle = STAGE_STYLES[inquiry.stage];

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

    setInquiry((prev) => ({
      ...prev,
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: "note",
          author: "Intake Coordinator",
          authorRole: "Staff",
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

  const handleUpdateStatus = (newStage: InquiryStage) => {
    setInquiry((prev) => ({
      ...prev,
      stage: newStage,
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: "status_change",
          author: "Admin User",
          timestamp: "Just now",
          title: `Stage Updated to ${newStage}`,
          details: `Inquiry status changed to ${newStage}.`,
        },
        ...prev.timeline,
      ],
    }));
    setIsStatusDropdownOpen(false);
    toast.success(`Stage updated to ${newStage}`);
  };

  const handleToggleDocStatus = (docId: string) => {
    setInquiry((prev) => {
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
    setInquiry((prev) => ({
      ...prev,
      stage: "Converted",
      onboardingStatus: {
        converted: true,
        convertedAt: "Just now",
        clientProfileId: `CLI-${Math.floor(9100 + Math.random() * 50)}`,
        caregiverProfileId: prev.familyInfo.potentialCaregiver?.name ? `CG-${Math.floor(4500 + Math.random() * 50)}` : undefined,
      },
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: "status_change",
          author: "Admin User",
          timestamp: "Just now",
          title: "Inquiry Converted to Onboarding",
          details: "Transferred to Client Registration and Caregiver Onboarding workflows.",
        },
        ...prev.timeline,
      ],
    }));
    setIsConvertModalOpen(false);
    toast.success(`${inquiry.familyName} converted to onboarding!`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5 pb-14 animate-in fade-in duration-200">
      {/* Back Navigation Button */}
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* Top Banner / Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Identity & Status */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">
                {inquiry.id}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${stageStyle.bg} ${stageStyle.text} ${stageStyle.border}`}
              >
                {inquiry.stage}
              </span>
              {inquiry.urgency === "Urgent" && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  Urgent Priority
                </span>
              )}
              {inquiry.onboardingStatus?.converted && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Moved to Onboarding
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              {inquiry.familyName}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-1">
              <span>Client: <strong className="text-slate-800 font-semibold">{inquiry.familyInfo.clientInfo.name}</strong> ({inquiry.familyInfo.clientInfo.age} yrs)</span>
              <span>•</span>
              <span>Source: <strong className="text-slate-800 font-semibold">{inquiry.source}</strong></span>
              <span>•</span>
              <span>Branch: <strong className="text-slate-800 font-semibold">{inquiry.branch}</strong></span>
              <span>•</span>
              <span>Received: {inquiry.dateReceived}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#3D6B22]" />
              <span>Contact Family</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-sky-700" />
              <span>Schedule RN</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Assign Staff</span>
            </button>

            {/* Advance Stage Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Stage: {inquiry.stage}</span>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                    Advance Stage
                  </div>
                  {stagesList.map((stg) => (
                    <button
                      key={stg}
                      onClick={() => handleUpdateStatus(stg)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${inquiry.stage === stg ? "font-semibold text-[#3D6B22] bg-emerald-50/50" : "text-slate-800"
                        }`}
                    >
                      <span>{stg}</span>
                      {inquiry.stage === stg && <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Convert to Onboarding Primary Action */}
            <button
              type="button"
              onClick={() => setIsConvertModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#2C5217] active:scale-[0.98] transition-all rounded-xl shadow-sm shadow-[#3D6B22]/20 cursor-pointer"
            >
              <span>Convert to Onboarding</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Core Information Sections */}
        <div className="lg:col-span-8 space-y-5">
          {/* Section A: Family Information */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-[#3D6B22]" />
                A. Family & Contact Information
              </h2>
              <span className="text-xs text-slate-500">
                Inquiry ID: <span className="font-mono font-bold text-slate-800">{inquiry.id}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Primary Contact</span>
                <span className="text-sm font-semibold text-slate-900 block mt-0.5">
                  {inquiry.familyInfo.primaryContact}
                </span>
                <span className="text-xs text-slate-500">({inquiry.familyInfo.relationship})</span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Client (Person Needing Care)</span>
                <span className="text-sm font-semibold text-slate-900 block mt-0.5">
                  {inquiry.familyInfo.clientInfo.name}
                </span>
                <span className="text-xs text-slate-500">
                  Age {inquiry.familyInfo.clientInfo.age} · {inquiry.familyInfo.clientInfo.gender || "Gender N/A"}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Preferred Contact Method</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-[#1E5622] border border-emerald-200">
                    {inquiry.familyInfo.preferredContactMethod}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    {inquiry.familyInfo.phone}
                  </span>
                </div>
                {inquiry.familyInfo.bestTimeToCall && (
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Best time: {inquiry.familyInfo.bestTimeToCall}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Email Address</span>
                <span className="text-xs font-semibold text-slate-800 block mt-1">
                  {inquiry.familyInfo.email || "No email on file"}
                </span>
              </div>

              <div className="md:col-span-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Household Address</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-900 mt-0.5 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#3D6B22] shrink-0" />
                  <span>
                    {inquiry.familyInfo.householdLocation.address},{" "}
                    {inquiry.familyInfo.householdLocation.city},{" "}
                    {inquiry.familyInfo.householdLocation.state}{" "}
                    {inquiry.familyInfo.householdLocation.zip}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5 ml-5">
                  Assigned Branch: {inquiry.familyInfo.householdLocation.branch}
                </span>
              </div>

              {inquiry.familyInfo.potentialCaregiver && (
                <div className="md:col-span-2 pt-2 border-t border-slate-100 bg-slate-50 p-3.5 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    Potential In-Home Family Caregiver (SFC Model)
                  </span>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="font-bold text-slate-900">
                      {inquiry.familyInfo.potentialCaregiver.name}
                    </span>
                    <span className="text-slate-500">
                      {inquiry.familyInfo.potentialCaregiver.relationship} · {inquiry.familyInfo.potentialCaregiver.classificationInterest || "W-2"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section B: Referral Information */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-700" />
                B. Referral & Case Coordination
              </h2>
              <span className="text-xs text-slate-500">
                Date Received: {inquiry.referralInfo.dateReceived}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Referral Source & Org</span>
                <span className="text-sm font-semibold text-slate-900 block mt-0.5">
                  {inquiry.referralInfo.source}
                </span>
                <span className="text-xs text-slate-500">
                  {inquiry.referralInfo.organization}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Case Manager / Referring Party</span>
                {inquiry.referralInfo.caseManager?.name ? (
                  <div className="text-xs mt-0.5">
                    <span className="font-semibold text-slate-900 block">{inquiry.referralInfo.caseManager.name}</span>
                    <span className="text-slate-500 block">{inquiry.referralInfo.caseManager.agency}</span>
                    {inquiry.referralInfo.caseManager.phone && (
                      <span className="text-slate-400 block">{inquiry.referralInfo.caseManager.phone}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Self-inquiry / None assigned</span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Assigned Coordinator</span>
                <div className="flex items-center gap-2.5 mt-1">
                  {inquiry.referralInfo.assignedCoordinator.avatarUrl ? (
                    <img
                      src={inquiry.referralInfo.assignedCoordinator.avatarUrl}
                      alt={inquiry.referralInfo.assignedCoordinator.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#1E5622] text-xs font-bold flex items-center justify-center">
                      {inquiry.referralInfo.assignedCoordinator.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      {inquiry.referralInfo.assignedCoordinator.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {inquiry.referralInfo.assignedCoordinator.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Care Requirements */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600" />
                C. Care Requirements & Service Model
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                {inquiry.careRequirements.programInterest}
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                  Requested Care Support
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {inquiry.careRequirements.careType.map((ct) => (
                    <span
                      key={ct}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-800 border border-slate-200"
                    >
                      {ct}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block">Requested Hours</span>
                  <span className="text-sm font-bold text-slate-900">
                    {inquiry.careRequirements.hoursPerWeek} hrs / week
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block">Service Location</span>
                  <span className="text-xs font-semibold text-slate-900">
                    {inquiry.careRequirements.preferredLocation}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block">Target Start Date</span>
                  <span className="text-xs font-semibold text-slate-900">
                    {inquiry.careRequirements.targetStartDate || "Within 2 weeks"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Clinical & Care Background
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {inquiry.careRequirements.supportRequirements}
                </p>
                {inquiry.familyInfo.clientInfo.mobilityNotes && (
                  <p className="text-xs text-slate-500 mt-1.5 italic">
                    Mobility Notes: {inquiry.familyInfo.clientInfo.mobilityNotes}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Documents Checklist & Follow-up Timeline */}
        <div className="lg:col-span-4 space-y-5">
          {/* Section D: Documents & Assessment Status */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3D6B22]" />
                D. Documents & Assessment
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${inquiry.assessmentStatus === "Completed"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : inquiry.assessmentStatus === "Scheduled"
                    ? "bg-sky-50 text-sky-800 border-sky-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
              >
                {inquiry.assessmentStatus}
              </span>
            </div>

            {/* Assessment Details if booked */}
            {inquiry.assessmentDetails && (
              <div className="mb-3 p-3 rounded-xl bg-sky-50/60 border border-sky-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-sky-900">
                  <span>RN Evaluation Scheduled</span>
                  <span>{inquiry.assessmentDetails.scheduledDate}</span>
                </div>
                <p className="text-slate-800 text-[11px]">
                  Assessor: <strong>{inquiry.assessmentDetails.assessor}</strong>
                </p>
              </div>
            )}

            {/* Checklist */}
            <div className="space-y-2">
              <div className="text-[11px] font-medium text-slate-400">
                Click item to toggle status:
              </div>

              {inquiry.documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleToggleDocStatus(doc.id)}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${doc.status === "Received"
                    ? "bg-emerald-50/50 border-emerald-200"
                    : doc.status === "Pending Review"
                      ? "bg-amber-50/50 border-amber-200"
                      : "bg-rose-50/50 border-rose-200"
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {doc.status === "Received" ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1E5622] shrink-0" />
                    ) : doc.status === "Pending Review" ? (
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-800 truncate">{doc.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${doc.status === "Received"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : doc.status === "Pending Review"
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-rose-100 text-rose-800 border-rose-300"
                      }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Missing Info */}
            {inquiry.missingInformation.length > 0 && (
              <div className="mt-3.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 mb-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Action Needed: Missing Info</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                  {inquiry.missingInformation.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section E: Follow-up Timeline */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                E. Follow-up Timeline
              </h2>
              <span className="text-[11px] text-slate-400">
                {inquiry.timeline.length} events
              </span>
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="mb-3.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Log quick follow-up note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#2C5217] disabled:opacity-40 rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Timeline Stream */}
            <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {inquiry.timeline.map((entry) => (
                <div key={entry.id} className="relative text-xs">
                  <div
                    className={`absolute -left-5 top-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs ${entry.type === "call"
                      ? "bg-[#3D6B22]"
                      : entry.type === "assessment"
                        ? "bg-sky-600"
                        : entry.type === "status_change"
                          ? "bg-amber-600"
                          : "bg-slate-400"
                      }`}
                  />
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900">{entry.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{entry.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      by <strong className="text-slate-700 font-medium">{entry.author}</strong>
                    </div>
                    {entry.details && (
                      <p className="text-[11px] text-slate-700 mt-0.5 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                        {entry.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightweight Action Modals */}
      <ContactFamilyModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        inquiry={inquiry}
        onLogCommunication={(id, type, note) => {
          setInquiry((prev) => ({
            ...prev,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: type,
                author: "Intake Staff",
                timestamp: "Just now",
                title: type === "call" ? "Phone Call Completed" : type === "email" ? "Email Message Sent" : "Note Recorded",
                details: note,
              },
              ...prev.timeline,
            ],
          }));
        }}
      />

      <ScheduleAssessmentModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        inquiry={inquiry}
        onConfirmSchedule={(id, details) => {
          setInquiry((prev) => ({
            ...prev,
            stage: "In Assessment",
            assessmentStatus: "Scheduled",
            assessmentDetails: details,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "assessment",
                author: details.assessor,
                timestamp: "Just now",
                title: `RN Assessment Scheduled (${details.scheduledDate})`,
                details: `${details.type}. Instructions: ${details.notes}`,
              },
              ...prev.timeline,
            ],
          }));
        }}
      />

      <AssignCoordinatorModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        inquiry={inquiry}
        onConfirmAssignment={(id, name, role) => {
          setInquiry((prev) => ({
            ...prev,
            referralInfo: {
              ...prev.referralInfo,
              assignedCoordinator: {
                ...prev.referralInfo.assignedCoordinator,
                name: name,
                role: role,
              },
            },
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "assignment",
                author: "Admin User",
                timestamp: "Just now",
                title: `Coordinator Reassigned to ${name}`,
                details: `Role updated to ${role}.`,
              },
              ...prev.timeline,
            ],
          }));
        }}
      />

      <ConvertToOnboardingModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        inquiry={inquiry}
        onConfirmConversion={handleConfirmConversion}
      />
    </div>
  );
}
