"use client";

import React, { useState } from "react";
import { InquiryRecord, TimelineEntry } from "@/types/intake";
import {
  Phone,
  Mail,
  MessageSquare,
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
  Plus,
  ExternalLink,
  Upload,
  CalendarPlus,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface InquiryDetailViewProps {
  inquiry: InquiryRecord;
  onContactFamily: (inquiry: InquiryRecord) => void;
  onAssignCoordinator: (inquiry: InquiryRecord) => void;
  onScheduleAssessment: (inquiry: InquiryRecord) => void;
  onUpdateStatus: (inquiry: InquiryRecord, newStage: InquiryRecord["stage"]) => void;
  onConvertToOnboarding: (inquiry: InquiryRecord) => void;
  onAddTimelineNote: (inquiryId: string, noteText: string) => void;
  onToggleDocumentStatus: (inquiryId: string, docId: string) => void;
}

const STAGE_STYLES: Record<InquiryRecord["stage"], { bg: string; text: string; border: string }> = {
  "New Inquiry": { bg: "bg-[#FEF2F2]", text: "text-[#B91C1C]", border: "border-[#FECACA]" },
  "Contacted": { bg: "bg-[#FEF3C7]", text: "text-[#9A5B00]", border: "border-[#FDE68A]" },
  "Needs Discussion": { bg: "bg-[#F3E8FF]", text: "text-[#6B21A8]", border: "border-[#E9D5FF]" },
  "CMA Coordination": { bg: "bg-[#E0F2FE]", text: "text-[#0369A1]", border: "border-[#BAE6FD]" },
  "Family Decision": { bg: "bg-[#CCFBF1]", text: "text-[#115E59]", border: "border-[#99F6E4]" },
  "Converted": { bg: "bg-[#E3F1D9]", text: "text-[#1E5622]", border: "border-[#C7E4B3]" },
  "Closed": { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  "New Lead": { bg: "bg-[#FEF2F2]", text: "text-[#B91C1C]", border: "border-[#FECACA]" },
  "In Assessment": { bg: "bg-[#E0F2FE]", text: "text-[#0369A1]", border: "border-[#BAE6FD]" },
  "CM Coordination": { bg: "bg-[#EEF2FF]", text: "text-[#4338CA]", border: "border-[#C7D2FE]" },
};

export function InquiryDetailView({
  inquiry,
  onContactFamily,
  onAssignCoordinator,
  onScheduleAssessment,
  onUpdateStatus,
  onConvertToOnboarding,
  onAddTimelineNote,
  onToggleDocumentStatus,
}: InquiryDetailViewProps) {
  const [newNote, setNewNote] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const stageStyle = STAGE_STYLES[inquiry.stage];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddTimelineNote(inquiry.id, newNote.trim());
    setNewNote("");
    toast.success("Follow-up note saved to timeline");
  };

  const stagesList: InquiryRecord["stage"][] = [
    "New Lead",
    "Contacted",
    "In Assessment",
    "CM Coordination",
    "Converted",
  ];

  return (
    <div className="bg-[#FFFFFF] border border-[#D5DFDA] rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
      {/* Top Header / Primary Actions Bar */}
      <div className="p-4 sm:p-5 border-b border-[#D5DFDA] bg-[#F7F9F8]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Inquiry Identifier & Stage */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#D5DFDA] text-[#111C16]">
                {inquiry.id}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${stageStyle.bg} ${stageStyle.text} ${stageStyle.border}`}
              >
                {inquiry.stage}
              </span>
              {inquiry.urgency === "Urgent" && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FF6E61]/15 text-[#D93829] border border-[#FF6E61]/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-[#D93829]" />
                  Urgent Priority
                </span>
              )}
              {inquiry.onboardingStatus?.converted && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E3F1D9] text-[#1E5622] border border-[#C7E4B3]">
                  Moved to Onboarding
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[#111C16] mt-1.5 tracking-tight">
              {inquiry.familyName}
            </h2>
            <p className="text-xs text-[#4A5D52] mt-0.5 flex items-center gap-2">
              <span>Client: <strong className="text-[#111C16]">{inquiry.familyInfo.clientInfo.name}</strong> ({inquiry.familyInfo.clientInfo.age} yrs)</span>
              <span>•</span>
              <span>Source: <strong className="text-[#111C16]">{inquiry.source}</strong></span>
              <span>•</span>
              <span>Received: {inquiry.dateReceived}</span>
            </p>
          </div>

          {/* F. Primary Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Contact Family */}
            <button
              type="button"
              onClick={() => onContactFamily(inquiry)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#111C16] bg-[#FFFFFF] hover:bg-[#F7F9F8] border border-[#D5DFDA] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#3D6B22]" />
              <span>Contact Family</span>
            </button>

            {/* Assign Coordinator */}
            <button
              type="button"
              onClick={() => onAssignCoordinator(inquiry)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#111C16] bg-[#FFFFFF] hover:bg-[#F7F9F8] border border-[#D5DFDA] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#4A5D52]" />
              <span>Assign Staff</span>
            </button>

            {/* Schedule Assessment */}
            <button
              type="button"
              onClick={() => onScheduleAssessment(inquiry)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#111C16] bg-[#FFFFFF] hover:bg-[#F7F9F8] border border-[#D5DFDA] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-[#0369A1]" />
              <span>Schedule RN</span>
            </button>

            {/* Update Status Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#111C16] bg-[#FFFFFF] hover:bg-[#F7F9F8] border border-[#D5DFDA] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#74877C]" />
                <span>Stage: {inquiry.stage}</span>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-[#74877C] border-b border-[#D5DFDA]/60">
                    Advance Stage
                  </div>
                  {stagesList.map((stg) => (
                    <button
                      key={stg}
                      onClick={() => {
                        onUpdateStatus(inquiry, stg);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F7F9F8] ${
                        inquiry.stage === stg ? "font-semibold text-[#3D6B22] bg-[#E3F1D9]/40" : "text-[#111C16]"
                      }`}
                    >
                      <span>{stg}</span>
                      {inquiry.stage === stg && <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Convert to Onboarding (Primary CTA) */}
            <button
              type="button"
              onClick={() => onConvertToOnboarding(inquiry)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#2C5217] active:scale-[0.98] transition-all rounded-xl shadow-xs cursor-pointer ml-auto xl:ml-0"
            >
              <span>Convert to Onboarding</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Detail Body */}
      <div className="p-4 sm:p-5 overflow-y-auto space-y-5 max-h-[calc(100vh-280px)] custom-scrollbar">
        {/* A. Family Information */}
        <div className="p-4 rounded-xl border border-[#D5DFDA] bg-[#FFFFFF]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D5DFDA]/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111C16] flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#3D6B22]" />
              A. Family & Contact Information
            </h3>
            <span className="text-[11px] text-[#4A5D52]">
              Inquiry ID: <span className="font-mono font-bold text-[#111C16]">{inquiry.id}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div>
              <span className="text-[11px] font-medium text-[#4A5D52] block">Primary Contact</span>
              <span className="text-sm font-semibold text-[#111C16] block mt-0.5">
                {inquiry.familyInfo.primaryContact}
              </span>
              <span className="text-xs text-[#4A5D52]">({inquiry.familyInfo.relationship})</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-[#4A5D52] block">Client (Person Needing Care)</span>
              <span className="text-sm font-semibold text-[#111C16] block mt-0.5">
                {inquiry.familyInfo.clientInfo.name}
              </span>
              <span className="text-xs text-[#4A5D52]">
                Age {inquiry.familyInfo.clientInfo.age} · {inquiry.familyInfo.clientInfo.gender || "Gender N/A"}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-[#4A5D52] block">Preferred Contact Method</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#E3F1D9] text-[#1E5622]">
                  {inquiry.familyInfo.preferredContactMethod}
                </span>
                <span className="text-xs text-[#4A5D52]">
                  {inquiry.familyInfo.phone}
                </span>
              </div>
              <span className="text-[11px] text-[#74877C] block mt-0.5">
                {inquiry.familyInfo.bestTimeToCall && `Best time: ${inquiry.familyInfo.bestTimeToCall}`}
              </span>
            </div>

            <div className="md:col-span-2">
              <span className="text-[11px] font-medium text-[#4A5D52] block">Household Location</span>
              <div className="flex items-center gap-1.5 text-xs text-[#111C16] mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#3D6B22] shrink-0" />
                <span>
                  {inquiry.familyInfo.householdLocation.address},{" "}
                  {inquiry.familyInfo.householdLocation.city},{" "}
                  {inquiry.familyInfo.householdLocation.state}{" "}
                  {inquiry.familyInfo.householdLocation.zip}
                </span>
              </div>
              <span className="text-[11px] text-[#74877C] block mt-0.5 ml-5">
                Assigned Branch: {inquiry.familyInfo.householdLocation.branch}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-[#4A5D52] block">Potential In-Home Caregiver</span>
              {inquiry.familyInfo.potentialCaregiver ? (
                <div className="text-xs mt-0.5">
                  <span className="font-semibold text-[#111C16]">{inquiry.familyInfo.potentialCaregiver.name}</span>
                  <span className="text-[#4A5D52] block">
                    {inquiry.familyInfo.potentialCaregiver.relationship} · {inquiry.familyInfo.potentialCaregiver.classificationInterest || "W-2"}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-[#74877C] italic">None identified (Agency staffing requested)</span>
              )}
            </div>
          </div>
        </div>

        {/* B. Referral Information */}
        <div className="p-4 rounded-xl border border-[#D5DFDA] bg-[#FFFFFF]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D5DFDA]/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111C16] flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-[#0369A1]" />
              B. Referral & Coordination Information
            </h3>
            <span className="text-[11px] text-[#4A5D52]">
              Received: {inquiry.referralInfo.dateReceived}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div>
              <span className="text-[11px] font-medium text-[#4A5D52] block">Referral Source & Org</span>
              <span className="text-sm font-semibold text-[#111C16] block mt-0.5">
                {inquiry.referralInfo.source}
              </span>
              <span className="text-xs text-[#4A5D52]">
                {inquiry.referralInfo.organization}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-[#4A5D52] block">Case Manager / Referring Party</span>
              {inquiry.referralInfo.caseManager?.name ? (
                <div className="text-xs mt-0.5">
                  <span className="font-semibold text-[#111C16]">{inquiry.referralInfo.caseManager.name}</span>
                  <span className="text-[#4A5D52] block">{inquiry.referralInfo.caseManager.agency}</span>
                  {inquiry.referralInfo.caseManager.phone && (
                    <span className="text-[#74877C] block">{inquiry.referralInfo.caseManager.phone}</span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-[#74877C] italic">Self-referred / No case manager assigned</span>
              )}
            </div>

            <div>
              <span className="text-[11px] font-medium text-[#4A5D52] block">Assigned Intake Coordinator</span>
              <div className="flex items-center gap-2.5 mt-1">
                {inquiry.referralInfo.assignedCoordinator.avatarUrl ? (
                  <img
                    src={inquiry.referralInfo.assignedCoordinator.avatarUrl}
                    alt={inquiry.referralInfo.assignedCoordinator.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#D5DFDA]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#E3F1D9] text-[#1E5622] text-xs font-bold flex items-center justify-center">
                    {inquiry.referralInfo.assignedCoordinator.name.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="text-xs font-semibold text-[#111C16] block">
                    {inquiry.referralInfo.assignedCoordinator.name}
                  </span>
                  <span className="text-[11px] text-[#4A5D52] block">
                    {inquiry.referralInfo.assignedCoordinator.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* C. Care Requirements */}
        <div className="p-4 rounded-xl border border-[#D5DFDA] bg-[#FFFFFF]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D5DFDA]/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111C16] flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-[#FF6E61]" />
              C. Care Requirements & Needs
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E0F2F5] text-[#0F5E6E]">
              {inquiry.careRequirements.programInterest}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-medium text-[#4A5D52] block mb-1">
                Requested Care Types
              </span>
              <div className="flex flex-wrap gap-1.5">
                {inquiry.careRequirements.careType.map((ct) => (
                  <span
                    key={ct}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F7F9F8] text-[#111C16] border border-[#D5DFDA]"
                  >
                    {ct}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-[11px] font-medium text-[#4A5D52] block">Authorized / Requested Hours</span>
                <span className="text-sm font-bold text-[#111C16]">
                  {inquiry.careRequirements.hoursPerWeek} hrs / week
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-[#4A5D52] block">Service Location</span>
                <span className="text-xs font-semibold text-[#111C16]">
                  {inquiry.careRequirements.preferredLocation}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-[#4A5D52] block">Target Start Date</span>
                <span className="text-xs font-semibold text-[#111C16]">
                  {inquiry.careRequirements.targetStartDate || "As soon as possible"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F7F9F8] border border-[#D5DFDA]/80">
              <span className="text-[11px] font-semibold text-[#4A5D52] block mb-1">
                Clinical Support & Background Details
              </span>
              <p className="text-xs text-[#111C16] leading-relaxed">
                {inquiry.careRequirements.supportRequirements}
              </p>
              {inquiry.familyInfo.clientInfo.mobilityNotes && (
                <p className="text-xs text-[#74877C] mt-1.5 italic">
                  Mobility Notes: {inquiry.familyInfo.clientInfo.mobilityNotes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* D. Documents & Requirements */}
        <div className="p-4 rounded-xl border border-[#D5DFDA] bg-[#FFFFFF]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D5DFDA]/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111C16] flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#3D6B22]" />
              D. Documents & Assessment Status
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#4A5D52]">Assessment:</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  inquiry.assessmentStatus === "Completed"
                    ? "bg-[#E3F1D9] text-[#1E5622]"
                    : inquiry.assessmentStatus === "Scheduled"
                    ? "bg-[#E0F2FE] text-[#0369A1]"
                    : "bg-[#FEF3C7] text-[#9A5B00]"
                }`}
              >
                {inquiry.assessmentStatus}
              </span>
            </div>
          </div>

          {/* Assessment Details if scheduled */}
          {inquiry.assessmentDetails && (
            <div className="mb-3 p-3 rounded-lg bg-[#E0F2FE]/40 border border-[#BAE6FD] text-xs">
              <div className="flex items-center justify-between font-semibold text-[#0369A1] mb-1">
                <span>RN Assessment Details</span>
                <span>{inquiry.assessmentDetails.scheduledDate} {inquiry.assessmentDetails.scheduledTime && `· ${inquiry.assessmentDetails.scheduledTime}`}</span>
              </div>
              <p className="text-[#111C16] text-[11px]">
                Assessor: <strong>{inquiry.assessmentDetails.assessor}</strong> ({inquiry.assessmentDetails.type})
              </p>
              {inquiry.assessmentDetails.notes && (
                <p className="text-[#4A5D52] text-[11px] mt-0.5 italic">
                  Note: {inquiry.assessmentDetails.notes}
                </p>
              )}
            </div>
          )}

          {/* Documents Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-[#4A5D52]">
              <span>Required Intake Documentation</span>
              <span>Click checkbox to toggle verification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {inquiry.documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onToggleDocumentStatus(inquiry.id, doc.id)}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    doc.status === "Received"
                      ? "bg-[#F2F8EE] border-[#C7E4B3]"
                      : doc.status === "Pending Review"
                      ? "bg-[#FEF3C7]/40 border-[#FDE68A]"
                      : "bg-[#FEF2F2] border-[#FECACA]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {doc.status === "Received" ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1E5622] shrink-0" />
                    ) : doc.status === "Pending Review" ? (
                      <Clock className="w-4 h-4 text-[#9A5B00] shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    )}
                    <span className="font-medium text-[#111C16] truncate">{doc.name}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      doc.status === "Received"
                        ? "bg-[#E3F1D9] text-[#1E5622]"
                        : doc.status === "Pending Review"
                        ? "bg-[#FEF3C7] text-[#9A5B00]"
                        : "bg-[#FEE2E2] text-[#B91C1C]"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Information Callout */}
          {inquiry.missingInformation.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-[#FEF3C7]/40 border border-[#FDE68A]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9A5B00] mb-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Action Needed: Missing Information for Qualification</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#4A5D52]">
                {inquiry.missingInformation.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* E. Follow-up Timeline */}
        <div className="p-4 rounded-xl border border-[#D5DFDA] bg-[#FFFFFF]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D5DFDA]/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111C16] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#4A5D52]" />
              E. Follow-up Activity & Communication Timeline
            </h3>
            <span className="text-[11px] text-[#4A5D52]">
              {inquiry.timeline.length} Events Logged
            </span>
          </div>

          {/* New Note Quick Form */}
          <form onSubmit={handleAddNote} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Log a call note, follow-up conversation, or status update..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-[#F7F9F8] border border-[#D5DFDA] rounded-xl text-[#111C16] focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#2C5217] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Log Note</span>
              </button>
            </div>
          </form>

          {/* Timeline Feed */}
          <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D5DFDA]">
            {inquiry.timeline.map((entry) => (
              <div key={entry.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                    entry.type === "call"
                      ? "bg-[#3D6B22]"
                      : entry.type === "assessment"
                      ? "bg-[#0369A1]"
                      : entry.type === "status_change"
                      ? "bg-[#9A5B00]"
                      : "bg-[#74877C]"
                  }`}
                />

                <div className="text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#111C16]">{entry.title}</span>
                    <span className="text-[10px] text-[#74877C] shrink-0">{entry.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-[#4A5D52] mt-0.5">
                    by <strong className="text-[#111C16]">{entry.author}</strong>
                    {entry.authorRole && ` (${entry.authorRole})`}
                  </div>
                  {entry.details && (
                    <p className="text-[11px] text-[#111C16] mt-1 bg-[#F7F9F8] p-2 rounded-lg border border-[#D5DFDA]/60">
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
  );
}
