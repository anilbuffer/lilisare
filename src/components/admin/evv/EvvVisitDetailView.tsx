"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  User,
  HeartHandshake,
  FileText,
  DollarSign,
  Send,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Navigation,
  Sparkles,
  Lock,
  FileCheck2,
  History,
  AlertCircle,
  HelpCircle,
  Smartphone,
  PhoneCall,
  Check,
  Building2,
  CalendarDays,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  EvvVisitRecord,
  EvvVisitStatus,
  EvvVerificationStatus,
  EvvReviewNote,
} from "@/types/evvVisit";
import {
  getEvvVisitById,
  addEvvReviewNote,
  EVV_REASON_CODES,
  EVV_SYNC_EVENT,
} from "@/lib/admin/evvVisitsStore";
import {
  ResponsiveDomainTabStrip,
  DomainTabItem,
} from "@/components/ui/ResponsiveDomainTabStrip";
import {
  FormSection,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormButtonPrimary,
  FormButtonSecondary,
} from "@/components/ui/FormControls";

type DetailDomainTab =
  | "overview"
  | "verification"
  | "location"
  | "service"
  | "investigation"
  | "timeline";

interface EvvVisitDetailViewProps {
  visitId: string;
}

const DETAIL_TABS: DomainTabItem<DetailDomainTab>[] = [
  { id: "overview", label: "VISIT OVERVIEW", minWidth: 140 },
  { id: "verification", label: "FEDERAL 6 ELEMENTS", minWidth: 168 },
  { id: "location", label: "GEOFENCE & TELEMETRY", minWidth: 172 },
  { id: "service", label: "CARE NOTES & ADLS", minWidth: 152 },
  { id: "investigation", label: "EXCEPTION REVIEW", minWidth: 156 },
  { id: "timeline", label: "AUDIT TIMELINE", minWidth: 140 },
];

const CARD_CLASS =
  "bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200";

export function EvvVisitDetailView({ visitId }: EvvVisitDetailViewProps) {
  const router = useRouter();
  const [visit, setVisit] = useState<EvvVisitRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailDomainTab>("overview");

  // Review Form State
  const [reviewerName, setReviewerName] = useState("Dana Jenkins, MSW");
  const [reviewerRole, setReviewerRole] = useState("Agency Operations Admin");
  const [reviewNoteText, setReviewNoteText] = useState("");
  const [selectedReasonCode, setSelectedReasonCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Visit
  const loadVisit = () => {
    const found = getEvvVisitById(visitId);
    if (found) {
      setVisit(found);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadVisit();

    if (typeof window !== "undefined") {
      window.addEventListener(EVV_SYNC_EVENT, loadVisit);
      window.addEventListener("storage", loadVisit);
      return () => {
        window.removeEventListener(EVV_SYNC_EVENT, loadVisit);
        window.removeEventListener("storage", loadVisit);
      };
    }
  }, [visitId]);

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">Loading EVV Record...</p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="w-full max-w-7xl mx-auto py-16 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">EVV Visit Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested EVV visit ID &quot;{visitId}&quot; could not be located in the operational dataset.
        </p>
        <Link
          href="/admin/evv-visits/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to EVV Visits</span>
        </Link>
      </div>
    );
  }

  // Handle Review Actions
  const handleAddReviewNote = (actionType: EvvReviewNote["action"], resolveException = false) => {
    if (!reviewNoteText.trim()) {
      toast.error("Please enter a review explanation or note");
      return;
    }

    setIsSubmitting(true);
    const reasonObj = EVV_REASON_CODES.find((r) => r.code === selectedReasonCode);

    try {
      const updated = addEvvReviewNote(
        visit.id,
        reviewerName,
        reviewerRole,
        reviewNoteText.trim(),
        actionType,
        selectedReasonCode || undefined,
        reasonObj?.label,
        resolveException
      );

      if (updated) {
        setVisit(updated);
        setReviewNoteText("");
        setSelectedReasonCode("");
        toast.success(
          resolveException
            ? "Exception resolved and visit marked Verified"
            : actionType === "CORRECTION_REQUESTED"
              ? "Correction request recorded"
              : "Review explanation saved",
          {
            description: "Audit trail preserved without altering caregiver original submission.",
          }
        );
      }
    } catch {
      toast.error("Failed to save review action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeDisplay = (time24?: string) => {
    if (!time24) return "Not Recorded";
    const [h, m] = time24.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return time24;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const verifiedCount = Object.values(visit.sixElements).filter((e) => e.verified).length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/admin/dashboard/" className="hover:text-slate-800 transition-colors">
          Admin Portal
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/admin/evv-visits/" className="hover:text-slate-800 transition-colors">
          EVV Visits & Monitoring
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold font-mono">{visit.id}</span>
      </div>


      {/* Main Header & Status Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {visit.id}
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Shift {visit.visitNumber}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20">
              {visit.serviceName}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {visit.date}
            </span>
            <span>•</span>
            <span className="font-medium text-slate-700">Client: {visit.clientName}</span>
            <span>•</span>
            <span className="font-medium text-slate-700">Caregiver: {visit.caregiverName}</span>
          </div>
        </div>

        {/* Status Badges & Back Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Visit Status Badge */}
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Visit Status
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mt-0.5 ${visit.visitStatus === "Completed"
                  ? "bg-[#E8F2E4] text-[#1E5622] border-[#3D6B22]/20"
                  : visit.visitStatus === "In Progress"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : visit.visitStatus === "Scheduled"
                      ? "bg-slate-100 text-slate-700 border-slate-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
            >
              {visit.visitStatus}
            </span>
          </div>

          {/* Verification Status Badge */}
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Verification Status
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mt-0.5 ${visit.verificationStatus === "Verified"
                  ? "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20"
                  : visit.verificationStatus === "Exception"
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : visit.verificationStatus === "Under Review"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : visit.verificationStatus === "Correction Required"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {visit.verificationStatus}
            </span>
          </div>

          <Link
            href="/admin/evv-visits/"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer ml-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Visits</span>
          </Link>
        </div>
      </div>

      {/* Exception Alert Banner (if applicable) */}
      {(visit.verificationStatus === "Exception" ||
        visit.verificationStatus === "Under Review" ||
        visit.verificationStatus === "Correction Required") && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl lg:rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-amber-900">
                    {visit.exceptionTitle || "EVV Verification Exception"}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200/70 text-amber-900">
                    Flagged: {visit.exceptionDateFlagged || "Today"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                  {visit.exceptionDescription ||
                    "This visit has a discrepancy requiring agency staff investigation before approval."}
                </p>
                <div className="mt-2 text-[11px] font-medium text-amber-700 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Staff review should not silently overwrite caregiver-submitted EVV data. All review notes and reason codes are saved to the persistent audit log.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Downstream Operations Governance Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-200/70 flex items-center justify-center text-slate-700 shrink-0">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-800 block">
              Billing &amp; Payroll Downstream Policy
            </span>
            <span>
              Visits do not automatically release for billing or payroll upon completion. Verification requires passing all 6 EVV federal elements.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-500">Billing:</span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold ${visit.billingReadiness === "Ready for Billing"
                ? "bg-[#E8F2E4] text-[#1E5622]"
                : "bg-amber-100 text-amber-800"
              }`}
          >
            {visit.billingReadiness}
          </span>
          <span className="text-[11px] font-bold text-slate-500 ml-2">Payroll:</span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold ${visit.payrollReadiness === "Ready for Payroll"
                ? "bg-[#E8F2E4] text-[#1E5622]"
                : "bg-amber-100 text-amber-800"
              }`}
          >
            {visit.payrollReadiness}
          </span>
        </div>
      </div>

      {/* Primary Triad Details: Client, Service & Verification (Moved from front table to dedicated details view) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* 1. Client Card */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-4.5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Client Information
            </span>
            <Link
              href={`/admin/clients/${visit.clientId}/`}
              className="text-xs font-semibold text-[#3D6B22] hover:underline inline-flex items-center gap-1"
            >
              <span>Profile</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
            {visit.clientName}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>ID: {visit.clientId}</span>
            <span>•</span>
            <span>Medicaid: {visit.clientMedicaidId}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 truncate">
            {visit.clientAddress}
          </p>
        </div>

        {/* 2. Service Card */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-4.5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Service Information
            </span>
            <span className="font-mono text-[11px] font-semibold text-[#1E5622] bg-[#E8F2E4] px-2 py-0.5 rounded">
              {visit.serviceCode}
            </span>
          </div>
          <div className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
            {visit.serviceName}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Payer: {visit.payerName}</span>
            <span className="font-semibold text-slate-700">${visit.billRate.toFixed(2)}/hr</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Authorization: <span className="font-mono font-medium text-slate-700">{visit.authorizationNumber}</span>
          </p>
        </div>

        {/* 3. Verification Card */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-4.5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              EVV Verification
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {verifiedCount} / 6 Elements
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                visit.verificationStatus === "Verified"
                  ? "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20"
                  : visit.verificationStatus === "Exception"
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : visit.verificationStatus === "Under Review"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : visit.verificationStatus === "Correction Required"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {visit.verificationStatus}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Capture: {visit.sixElements.locationOfService.verified ? "Mobile GPS" : "Flagged"}</span>
            <span className="font-medium text-slate-600">{visit.sixElements.timeBeginsAndEnds.verified ? "Times Match" : "Discrepancy"}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            21st Century Cures Act Compliant
          </p>
        </div>
      </div>

      {/* Domain Navigation Tabs (Space-Aware Dynamic Responsive Tab Strip) */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 sm:p-3 shadow-2xs">
        <ResponsiveDomainTabStrip<DetailDomainTab>
          tabs={DETAIL_TABS}
          activeTab={activeTab}
          onSelectTab={(tabId) => setActiveTab(tabId)}
          ariaLabel="Visit Detail Navigation Tabs"
        />
      </div>

      {/* Tab Panels */}
      {/* 1. Overview Tab */}
      {(activeTab === "overview" || activeTab === "verification") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Scheduled vs Actual Comparison */}
            <div className={CARD_CLASS}>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#3D6B22]" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Scheduled vs. Actual Visit Time
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Separated operational data
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Scheduled Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Scheduled Plan</span>
                    <span className="text-slate-600 font-semibold">{visit.scheduledDurationHours} hrs</span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Planned Start &amp; End</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatTimeDisplay(visit.scheduledStartTime)} – {formatTimeDisplay(visit.scheduledEndTime)}
                    </div>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-500 flex justify-between border-t border-slate-200/60">
                    <span>Billable Units: {visit.scheduledDurationHours * 4}</span>
                    <span>Rate: ${visit.billRate.toFixed(2)}/hr</span>
                  </div>
                </div>

                {/* Actual EVV Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Actual Recorded EVV</span>
                    <span className="text-[#1E5622] font-semibold">
                      {visit.actualDurationHours ? `${visit.actualDurationHours} hrs` : "In Progress"}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Recorded Clock-In &amp; Out</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatTimeDisplay(visit.actualClockInTime)} – {formatTimeDisplay(visit.actualClockOutTime)}
                    </div>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-500 flex justify-between border-t border-slate-200/60">
                    <span>Capture: Mobile App GPS</span>
                    <span>Pay: ${visit.payRate.toFixed(2)}/hr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Federal 6 EVV Elements Scorecard */}
            <div className={CARD_CLASS}>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-[#3D6B22]" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Federal 6 EVV Elements (21st Century CURES Act)
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20">
                  {verifiedCount} / 6 Verified
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: "1. Type of Service Performed", item: visit.sixElements.serviceType },
                  { label: "2. Individual Receiving Service (Client)", item: visit.sixElements.individualReceiving },
                  { label: "3. Date of the Service", item: visit.sixElements.dateOfService },
                  { label: "4. Location of Service Delivery", item: visit.sixElements.locationOfService },
                  { label: "5. Individual Providing Service (Caregiver)", item: visit.sixElements.individualProviding },
                  { label: "6. Time Service Begins and Ends", item: visit.sixElements.timeBeginsAndEnds },
                ].map((elem, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800">{elem.label}</span>
                      <p className="text-slate-600 font-medium">{elem.item.value}</p>
                      {elem.item.notes && (
                        <p className="text-amber-700 font-semibold text-[11px]">{elem.item.notes}</p>
                      )}
                    </div>
                    <div>
                      {elem.item.verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#E3F1D9] text-[#1E5622] border border-[#1E5622]/20">
                          <Check className="w-3 h-3" />
                          Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <AlertTriangle className="w-3 h-3" />
                          Flagged
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col) */}
          <div className="space-y-5">
            {/* Client Information Card */}
            <div className={CARD_CLASS}>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Client Profile
                </span>
                <Link
                  href={`/admin/clients/${visit.clientId}/`}
                  className="text-xs font-semibold text-[#3D6B22] hover:underline inline-flex items-center gap-1"
                >
                  <span>Full Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">{visit.clientName}</span>
                  <span className="font-mono text-slate-500 text-[11px]">ID: {visit.clientId}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Medicaid ID:</span>
                  <p className="font-mono font-semibold text-slate-800">{visit.clientMedicaidId}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Household:</span>
                  <p className="font-semibold text-slate-800">{visit.householdName || "Direct Client Household"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Authorized Address:</span>
                  <p className="text-slate-700 mt-0.5 leading-snug">{visit.clientAddress}</p>
                </div>
              </div>
            </div>

            {/* Caregiver Information Card */}
            <div className={CARD_CLASS}>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Caregiver Profile
                </span>
                <Link
                  href={`/admin/caregivers/${visit.caregiverId}/`}
                  className="text-xs font-semibold text-[#3D6B22] hover:underline inline-flex items-center gap-1"
                >
                  <span>Full Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">{visit.caregiverName}</span>
                  <span className="font-mono text-slate-500 text-[11px]">ID: {visit.caregiverId}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Role:</span>
                  <p className="font-semibold text-slate-800">{visit.caregiverRole}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Classification:</span>
                  <p className="font-semibold text-slate-800">{visit.caregiverClassification}</p>
                </div>
              </div>
            </div>

            {/* Authorization & Payer Card */}
            <div className={CARD_CLASS}>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Payer &amp; Authorization
                </span>
                <Link
                  href="/admin/authorizations/"
                  className="text-xs font-semibold text-[#3D6B22] hover:underline inline-flex items-center gap-1"
                >
                  <span>Auths</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Primary Payer:</span>
                  <p className="font-semibold text-slate-800">{visit.payerName}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Authorization Number:</span>
                  <p className="font-mono font-bold text-slate-900">{visit.authorizationNumber}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 font-medium">Weekly Cap:</span>
                    <p className="font-semibold text-slate-800">{visit.authorizedHours} hrs/wk</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Aggregator:</span>
                    <p className="font-semibold text-[#1E5622]">{visit.aggregator}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Location & Telemetry Tab */}
      {activeTab === "location" && (
        <div className="space-y-5">
          <div className={CARD_CLASS}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#3D6B22]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Location Verification &amp; Geofence
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Geofence Radius: {visit.geofenceRadiusFeet} ft
              </span>
            </div>

            {/* Authorized Service Address */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 mb-4 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Authorized Client Service Address
              </span>
              <span className="font-semibold text-slate-800 text-sm">{visit.clientAddress}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Clock-in Location */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500">
                    Clock-In Location
                  </span>
                  {visit.clockInLocation?.withinGeofence ? (
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#E8F2E4] text-[#1E5622]">
                      Within Geofence
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                      Outside Geofence
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  {visit.clockInLocation?.address || "No clock-in coordinates recorded"}
                </p>
                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                  <div>Distance from home: {visit.clockInLocation?.distanceFeet ?? "—"} ft</div>
                  <div>Accuracy: ±{visit.clockInLocation?.accuracyMeters ?? "—"} meters</div>
                  <div>Method: {visit.clockInLocation?.method || "Mobile App"}</div>
                  <div>Timestamp: {visit.clockInLocation?.timestamp || "Pending"}</div>
                </div>
              </div>

              {/* Clock-out Location */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500">
                    Clock-Out Location
                  </span>
                  {visit.clockOutLocation ? (
                    visit.clockOutLocation.withinGeofence ? (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#E8F2E4] text-[#1E5622]">
                        Within Geofence
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                        Outside Geofence
                      </span>
                    )
                  ) : (
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  {visit.clockOutLocation?.address || "Awaiting clock-out verification"}
                </p>
                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                  <div>Distance from home: {visit.clockOutLocation?.distanceFeet ?? "—"} ft</div>
                  <div>Accuracy: ±{visit.clockOutLocation?.accuracyMeters ?? "—"} meters</div>
                  <div>Method: {visit.clockOutLocation?.method || "Mobile App"}</div>
                  <div>Timestamp: {visit.clockOutLocation?.timestamp || "Pending"}</div>
                </div>
              </div>
            </div>

            {/* GPS Guidance Notice */}
            <div className="mt-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Investigative Guidance: </span>
                Do not assume GPS verification always succeeds or that a location mismatch proves misconduct.
                Cellular dead zones, multistory buildings, or community outings (pharmacy pickups, medical transport) frequently generate false location variances.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Service Records, Tasks & ADLs Tab */}
      {activeTab === "service" && (
        <div className="space-y-5">
          <div className={CARD_CLASS}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3D6B22]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Service Delivery, Tasks &amp; Care Notes
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Client Signature: {visit.clientSignatureCaptured ? "Captured" : "Missing / Exempt"}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Tasks &amp; ADLs Completed
                </span>
                <div className="flex flex-wrap gap-2">
                  {visit.tasksCompleted.length > 0 ? (
                    visit.tasksCompleted.map((task, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                      >
                        <Check className="w-3.5 h-3.5 text-[#3D6B22]" />
                        {task}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No tasks logged yet</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Caregiver Clinical Shift Notes
                </span>
                <p className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  {visit.careNotes || "No care notes recorded."}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                <span>Client Attestation: {visit.signatureType || "Digital Signature"}</span>
                <span>
                  Timestamp: {visit.clientSignatureTimestamp ? visit.clientSignatureTimestamp : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Exception Investigation Tab */}
      {activeTab === "investigation" && (
        <div className="space-y-5">
          <div className={CARD_CLASS}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3D6B22]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Staff Review &amp; Exception Resolution Workspace
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Audit Trail Compliant
              </span>
            </div>

            <div className="space-y-5">
              {/* Form Input using FormControls */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-4">
                <FormSection
                  title="Document Investigation or Decision"
                  description="All reviews preserve original caregiver submissions while adding reviewer notes and official reason codes."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Staff Reviewer Name</FormLabel>
                    <FormInput
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                    />
                  </div>

                  <div>
                    <FormLabel>State-Approved Reason Code</FormLabel>
                    <FormSelect
                      value={selectedReasonCode}
                      onChange={(e) => setSelectedReasonCode(e.target.value)}
                    >
                      <option value="">Select applicable reason code...</option>
                      {EVV_REASON_CODES.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.code} - {r.label}
                        </option>
                      ))}
                    </FormSelect>
                  </div>
                </div>

                <div>
                  <FormLabel>Review Explanation &amp; Findings</FormLabel>
                  <FormTextarea
                    rows={3}
                    placeholder="Document investigation findings, contact with caregiver/client, or justification for resolution..."
                    value={reviewNoteText}
                    onChange={(e) => setReviewNoteText(e.target.value)}
                  />
                </div>

                {/* Action Buttons using FormButtonPrimary & FormButtonSecondary */}
                <div className="flex items-center gap-2.5 justify-end flex-wrap pt-2">
                  <FormButtonSecondary
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleAddReviewNote("NOTE_ADDED", false)}
                  >
                    <span>Record Explanation</span>
                  </FormButtonSecondary>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleAddReviewNote("CORRECTION_REQUESTED", false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Request Correction</span>
                  </button>

                  <FormButtonPrimary
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleAddReviewNote("EXCEPTION_RESOLVED", true)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolve &amp; Verify Visit</span>
                  </FormButtonPrimary>
                </div>
              </div>

              {/* Review History */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Historical Review Log ({visit.reviewNotes.length})
                </span>
                {visit.reviewNotes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No staff review notes recorded yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {visit.reviewNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="font-bold text-slate-900">
                            {note.reviewerName}{" "}
                            <span className="font-normal text-slate-500">({note.reviewerRole})</span>
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">{note.timestamp}</span>
                        </div>
                        {note.reasonCode && (
                          <div className="text-[11px] font-semibold text-amber-800">
                            Reason: {note.reasonCode} - {note.reasonDescription}
                          </div>
                        )}
                        <p className="text-slate-700 leading-relaxed font-sans">{note.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Audit Timeline Tab */}
      {activeTab === "timeline" && (
        <div className="space-y-5">
          <div className={CARD_CLASS}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#3D6B22]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Chronological Activity Timeline
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {visit.timeline.length} events logged
              </span>
            </div>

            <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
              {visit.timeline.map((event) => (
                <div key={event.id} className="relative">
                  <div
                    className={`absolute -left-5 top-1 w-3 h-3 rounded-full border-2 bg-white ${event.badgeType === "warning"
                        ? "border-amber-500 bg-amber-500"
                        : event.badgeType === "success"
                          ? "border-[#3D6B22] bg-[#3D6B22]"
                          : "border-slate-400 bg-slate-300"
                      }`}
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold text-slate-900 text-sm">{event.event}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{event.timestamp}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {event.actor} • {event.actorRole}
                    </div>
                    <p className="text-slate-600 mt-1 leading-snug text-xs sm:text-sm">{event.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
