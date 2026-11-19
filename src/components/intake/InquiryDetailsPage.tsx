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
  Globe,
  Sparkles,
  Check,
  FileSpreadsheet,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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

const STAGE_STYLES: Record<InquiryStage, { bg: string; text: string; border: string; solidBg: string }> = {
  "New Lead": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", solidBg: "bg-rose-500" },
  "Contacted": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", solidBg: "bg-amber-500" },
  "In Assessment": { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200", solidBg: "bg-sky-600" },
  "CM Coordination": { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200", solidBg: "bg-indigo-600" },
  "Converted": { bg: "bg-emerald-50", text: "text-[#1E5622]", border: "border-emerald-200", solidBg: "bg-[#3D6B22]" },
};

const formatShortProgram = (program: string): string => {
  if (program.includes("CCSP")) return "CCSP Medicaid Waiver";
  if (program.includes("SOURCE")) return "SOURCE Waiver";
  if (program.includes("Private Pay")) return "Private Pay";
  if (program.includes("VA")) return "VA Benefits";
  if (program.includes("GAPP")) return "GAPP Pediatric";
  return program.split("(")[0].trim() || program;
};

export function InquiryDetailsPage({
  initialInquiry,
  backHref = "/intake/pipeline/",
  backLabel = "Back to Pipeline & Inquiries",
}: InquiryDetailsPageProps) {
  const router = useRouter();
  const [inquiry, setInquiry] = useState<InquiryRecord>(initialInquiry);
  const [activeTab, setActiveTab] = useState<"overview" | "care" | "documents" | "timeline">("overview");
  const [newNote, setNewNote] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  const stageStyle = STAGE_STYLES[inquiry.stage] || STAGE_STYLES["New Lead"];

  const stagesList: InquiryStage[] = [
    "New Lead",
    "Contacted",
    "In Assessment",
    "CM Coordination",
    "Converted",
  ];

  const tabs = [
    { id: "overview" as const, label: "Overview & Loved One", icon: User },
    { id: "care" as const, label: "Care Requirements", icon: Heart },
    { id: "documents" as const, label: "Documents & Payer", icon: FileText },
    { id: "timeline" as const, label: "Timeline & Activity Notes", icon: Clock },
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

  const handleLogCommunication = (
    inquiryId: string,
    type: "call" | "email" | "note",
    noteText: string
  ) => {
    setInquiry((prev) => ({
      ...prev,
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: type === "call" ? "call" : type === "email" ? "email" : "note",
          author: "Intake Staff",
          authorRole: "Staff",
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
    setInquiry((prev) => ({
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
          author: "Clinical Team",
          timestamp: "Just now",
          title: `${details.type} Scheduled`,
          details: `Date: ${details.scheduledDate} at ${details.scheduledTime} with ${details.assessor}. Notes: ${details.notes}`,
        },
        ...prev.timeline,
      ],
    }));
  };

  const handleConfirmAssignment = (
    inquiryId: string,
    coordinatorName: string,
    role: string
  ) => {
    setInquiry((prev) => ({
      ...prev,
      referralInfo: {
        ...prev.referralInfo,
        assignedCoordinator: {
          name: coordinatorName,
          role,
          phone: "(404) 555-0199",
          email: `${coordinatorName.toLowerCase().replace(/\s+/g, ".")}@lilisare.com`,
        },
      },
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: "assignment",
          author: "Admin User",
          timestamp: "Just now",
          title: `Assigned to ${coordinatorName}`,
          details: `Inquiry assigned to ${coordinatorName} (${role}).`,
        },
        ...prev.timeline,
      ],
    }));
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

  const missingDocsCount = inquiry.documents.filter((d) => d.status === "Missing").length;
  const familyInitials = inquiry.familyName
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

      {/* 01. PatientHeader Style: Hero Identity & Actions Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] border border-slate-200 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar Box with Floating Stage Badge */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#3D6B22]/10 to-emerald-100/60 text-[#3D6B22] border-2 border-white shadow-[0_6px_24px_rgba(0,0,0,0.06)] flex items-center justify-center text-2xl font-extrabold">
              {familyInitials}
            </div>
            <div className="absolute -bottom-2 -right-2">
              <span
                className={`border-2 border-white shadow-sm font-semibold text-white whitespace-nowrap px-2.5 py-0.5 text-[10px] rounded-full uppercase tracking-wider ${stageStyle.solidBg}`}
              >
                {inquiry.stage}
              </span>
            </div>
          </div>

          {/* Family Heading & Badges */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {inquiry.id}
              </span>
              {inquiry.urgency === "Urgent" && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                  Urgent Priority
                </span>
              )}
              {inquiry.onboardingStatus?.converted && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200">
                  Admitted to Onboarding
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              {inquiry.familyName}
            </h1>

            {/* Metadata Line */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mb-3">
              <span className="font-medium text-slate-700">
                Loved One: <strong className="text-slate-900 font-semibold">{inquiry.familyInfo.clientInfo.name}</strong> ({inquiry.familyInfo.clientInfo.age}y, {inquiry.familyInfo.clientInfo.relationship})
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {inquiry.familyInfo.householdLocation.city}, {inquiry.familyInfo.householdLocation.state}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {inquiry.familyInfo.phone}
              </span>
            </div>

            {/* Program & Safety Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand" className="bg-emerald-50 text-[#1E5622] border-emerald-200 text-xs font-semibold px-2.5 py-0.5">
                {formatShortProgram(inquiry.careRequirements.programInterest)}
              </Badge>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] uppercase font-bold px-2 py-0.5 border">
                Source: {inquiry.source}
              </Badge>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] uppercase font-bold px-2 py-0.5 border flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {inquiry.familyInfo.clientInfo.primaryLanguage}
              </Badge>
              <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] uppercase font-bold px-2 py-0.5 border">
                Requested: {inquiry.careRequirements.hoursPerWeek}h/wk
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Controls Column */}
        <div className="flex flex-col items-start lg:items-end justify-between gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
          <div className="flex items-center gap-2 self-stretch lg:self-auto justify-between lg:justify-end">
            <span className="text-xs font-semibold text-slate-500">Missing Docs</span>
            {missingDocsCount > 0 ? (
              <Badge variant="error" className="text-xs px-2.5 py-0.5 bg-rose-100 text-rose-700 border-rose-200 font-semibold">
                {missingDocsCount} Missing
              </Badge>
            ) : (
              <Badge variant="success" className="text-xs px-2.5 py-0.5 bg-emerald-100 text-[#1E5622] border-emerald-200 font-semibold">
                Complete
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#3D6B22]" />
              <span>Contact Family</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-sky-700" />
              <span>Schedule RN</span>
            </button>

            {/* Advance Stage Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
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

            {/* Convert to Onboarding Primary CTA */}
            <button
              type="button"
              onClick={() => setIsConvertModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#2C5217] active:scale-[0.98] transition-all rounded-xl shadow-[0_4px_16px_rgba(61,107,34,0.25)] hover:shadow-[0_6px_24px_rgba(61,107,34,0.35)] cursor-pointer"
            >
              <span>Convert to Onboarding</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
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
              className={`relative px-4 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap rounded-xl flex items-center gap-2 cursor-pointer ${isActive
                ? "bg-[#3D6B22] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 03. Tab Content Modules */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {/* Left Column (2 cols): Family & Loved One Demographics */}
          <div className="lg:col-span-2 space-y-5">
            {/* Family & Contact Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Users className="w-4.5 h-4.5 text-[#3D6B22]" />
                Primary Family Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Primary Contact Name</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{inquiry.familyInfo.primaryContact}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Relationship to Loved One</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">{inquiry.familyInfo.relationship}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone Number</span>
                  <a href={`tel:${inquiry.familyInfo.phone}`} className="font-medium text-[#3D6B22] hover:underline flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {inquiry.familyInfo.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Email Address</span>
                  <a href={`mailto:${inquiry.familyInfo.email}`} className="font-medium text-[#3D6B22] hover:underline flex items-center gap-1 mt-0.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {inquiry.familyInfo.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Preferred Contact Method</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">{inquiry.familyInfo.preferredContactMethod}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Best Time to Call</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">{inquiry.familyInfo.bestTimeToCall}</span>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 text-xs">
                <span className="text-slate-500 block mb-1">Household Location</span>
                <p className="font-medium text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#3D6B22] shrink-0" />
                  {inquiry.familyInfo.householdLocation.address}, {inquiry.familyInfo.householdLocation.city}, {inquiry.familyInfo.householdLocation.state} {inquiry.familyInfo.householdLocation.zip}
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">Assigned Service Area: {inquiry.branch}</span>
              </div>
            </Card>

            {/* Loved One (Client) Profile Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Heart className="w-4.5 h-4.5 text-[#FF6E61]" />
                Loved One Demographics & Mobility
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Full Name</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{inquiry.familyInfo.clientInfo.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Age & Gender</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">{inquiry.familyInfo.clientInfo.age} years old · {inquiry.familyInfo.clientInfo.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Birth</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">{inquiry.familyInfo.clientInfo.dob || "On File"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Primary Language</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">{inquiry.familyInfo.clientInfo.primaryLanguage}</span>
                </div>
              </div>

              {inquiry.familyInfo.clientInfo.mobilityNotes && (
                <div className="mt-4 pt-3.5 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 block mb-1">Mobility & Daily Living Notes</span>
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-900 text-xs leading-relaxed">
                    {inquiry.familyInfo.clientInfo.mobilityNotes}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column (1 col): Potential Caregiver & Assigned Coordinator */}
          <div className="space-y-5">
            {/* Potential Family Caregiver Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <HeartHandshakeIcon className="w-4 h-4 text-[#3D6B22]" />
                In-Home Family Caregiver
              </h3>
              {inquiry.familyInfo.potentialCaregiver?.name ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Caregiver Name</span>
                    <span className="font-bold text-slate-900 text-sm">{inquiry.familyInfo.potentialCaregiver.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Relationship</span>
                    <span className="font-medium text-slate-700">{inquiry.familyInfo.potentialCaregiver.relationship}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payroll / Worker Intent</span>
                    <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] font-semibold border border-emerald-200">
                      {inquiry.familyInfo.potentialCaregiver.classificationInterest || "W-2 Employee"}
                    </span>
                  </div>
                  {inquiry.familyInfo.potentialCaregiver.phone && (
                    <div>
                      <span className="text-slate-500 block">Contact</span>
                      <span className="font-medium text-slate-700">{inquiry.familyInfo.potentialCaregiver.phone}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-3 text-center">
                  <p>No family caregiver identified yet.</p>
                  <p className="text-[11px] mt-1 text-slate-500">Will be matched with agency staff.</p>
                </div>
              )}
            </Card>

            {/* Coordination & Intake Snapshot */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-3.5 text-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-600" />
                Assigned Coordinator
              </h3>
              <div className="flex items-center gap-3">
                {inquiry.referralInfo.assignedCoordinator.avatarUrl ? (
                  <img
                    src={inquiry.referralInfo.assignedCoordinator.avatarUrl}
                    alt={inquiry.referralInfo.assignedCoordinator.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#1E5622] font-bold flex items-center justify-center">
                    {inquiry.referralInfo.assignedCoordinator.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900">{inquiry.referralInfo.assignedCoordinator.name}</p>
                  <p className="text-[11px] text-slate-400">{inquiry.referralInfo.assignedCoordinator.role}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Referral Received</span>
                  <span className="font-medium text-slate-800">{inquiry.dateReceived}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Referral Channel</span>
                  <span className="font-medium text-slate-800">{inquiry.source}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Care Requirements */}
      {activeTab === "care" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          <div className="lg:col-span-2 space-y-5">
            {/* Service & Schedule Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
              <h3 className="text-base font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-[#3D6B22]" />
                Authorized Hours & Schedule Preference
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-1">Requested Care Hours</span>
                  <p className="text-xl font-extrabold text-slate-900">{inquiry.careRequirements.hoursPerWeek} hrs / week</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-1">Target Start Date</span>
                  <p className="text-sm font-bold text-slate-800">{inquiry.careRequirements.targetStartDate || "Immediate"}</p>
                </div>
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-1">Preferred Daily Schedule</span>
                  <p className="text-sm font-semibold text-slate-800">{inquiry.careRequirements.schedulePreference}</p>
                </div>
              </div>

              {/* Requested Care Types Pills */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-700 block mb-2">Requested Care Support Types</span>
                <div className="flex flex-wrap gap-2">
                  {inquiry.careRequirements.careType.map((type) => (
                    <span key={type} className="px-3 py-1 rounded-xl bg-emerald-50 text-[#1E5622] text-xs font-semibold border border-emerald-200/80">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Clinical & Support Narrative */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-3">
              <h3 className="text-base font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                <Stethoscope className="w-4.5 h-4.5 text-sky-700" />
                Support Requirements & Clinical Context
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                {inquiry.careRequirements.supportRequirements}
              </p>
            </Card>
          </div>

          <div className="space-y-5">
            {/* Preferred Location Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#3D6B22]" />
                Service Delivery Location
              </h3>
              <p className="font-medium text-slate-800">{inquiry.careRequirements.preferredLocation}</p>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-[11px] text-slate-600">
                In-home visits verified within {inquiry.branch} operational radius.
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: Documents & Payer */}
      {activeTab === "documents" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          <div className="lg:col-span-2 space-y-5">
            {/* Document Checklist Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-[#3D6B22]" />
                  Required Intake Documents
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
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                            {doc.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Category: {doc.category} {doc.uploadedDate ? `· Uploaded ${doc.uploadedDate}` : ""}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColors}`}>
                        {doc.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            {/* Payer & Case Manager Card */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3D6B22]" />
                Payer & Case Manager
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Primary Program</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{inquiry.careRequirements.programInterest}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Case Manager</span>
                  <p className="font-semibold text-slate-800">{inquiry.referralInfo.caseManager?.name || "Pending"}</p>
                  <p className="text-[11px] text-slate-500">{inquiry.referralInfo.caseManager?.agency}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 4: Timeline & Activity Notes */}
      {activeTab === "timeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          <div className="lg:col-span-2 space-y-5">
            {/* Log Note Form */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-3">
              <h3 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#3D6B22]" />
                Log Coordinator Call / Follow-up Note
              </h3>
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record call summary, family preference update, or clinical coordination note..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#2C5217] rounded-xl shadow-[0_4px_16px_rgba(61,107,34,0.25)] transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Note</span>
                  </button>
                </div>
              </form>
            </Card>

            {/* Timeline Feed */}
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-4">
              <h3 className="text-base font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-slate-600" />
                Inquiry Activity & Communication Log
              </h3>
              <div className="space-y-3">
                {inquiry.timeline.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 text-xs flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#1E5622] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{item.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">{item.details}</p>
                      <span className="text-[10px] text-slate-400 mt-1.5 block">By {item.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] text-xs space-y-2">
              <span className="font-bold text-slate-800 block">Audit & Compliance</span>
              <p className="text-slate-500 leading-relaxed">
                All phone notes, status shifts, and coordinator assignments are cryptographically signed and stored under HIPAA audit logging regulations.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Action Dialog Modals */}
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
    </div>
  );
}

function HeartHandshakeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
      <path d="m18 15-2-2" />
      <path d="m15 18-2-2" />
    </svg>
  );
}
