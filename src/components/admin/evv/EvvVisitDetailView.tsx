"use client";

import React, { useState, useEffect } from "react";
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
  Send,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  Check,
  DollarSign,
  CreditCard,
  History,
  FileText,
  Smartphone,
  Info,
  Building2,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  EvvVisitRecord,
  EvvVerificationStatus,
} from "@/types/evvVisit";
import {
  getEvvVisitById,
  resolveEvvException,
  EVV_REASON_CODES,
  EVV_RESOLUTION_CODES,
  EVV_SYNC_EVENT,
} from "@/lib/admin/evvVisitsStore";

export type EvvDetailTabType =
  | "details"
  | "resolution"
  | "billing"
  | "audit"
  | "investigation"
  | "overview";

interface EvvVisitDetailViewProps {
  visitId: string;
  defaultTab?: EvvDetailTabType;
  backHref?: string;
  backLabel?: string;
}

export function EvvVisitDetailView({
  visitId,
  defaultTab = "details",
  backHref,
  backLabel,
}: EvvVisitDetailViewProps) {
  const router = useRouter();
  const [visit, setVisit] = useState<EvvVisitRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Normalize tab
  const normalizedInitialTab =
    defaultTab === "investigation"
      ? "resolution"
      : defaultTab === "overview"
      ? "details"
      : defaultTab;

  // Tabs: 'details' | 'resolution' | 'billing' | 'audit'
  const [activeTab, setActiveTab] = useState<"details" | "resolution" | "billing" | "audit">(
    normalizedInitialTab
  );

  // Resolution workflow wizard state (5 steps)
  const [resolutionStep, setResolutionStep] = useState(1);
  const [selectedReasonCode, setSelectedReasonCode] = useState("RC-04");
  const [selectedResolutionCode, setSelectedResolutionCode] = useState("RES-03");
  const [resolutionNote, setResolutionNote] = useState(
    "Verified alternate location with client and care manager. Distance variance approved within jurisdiction exception guidelines."
  );

  const loadVisit = () => {
    setIsLoading(true);
    const found = getEvvVisitById(visitId);
    if (found) {
      setVisit(found);
    } else {
      // Fallback to primary demonstration visit if not found
      const fallback = getEvvVisitById("EVV-2026-003");
      setVisit(fallback || null);
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
        <p className="font-semibold text-xs text-slate-600">Loading Visit Details...</p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="w-full max-w-7xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Visit Record Not Found</h2>
        <p className="text-xs text-slate-500">Could not locate record for {visitId}</p>
        <Link
          href="/admin/evv-visits"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all"
        >
          Return to Visits
        </Link>
      </div>
    );
  }

  const isException = visit.complianceStatus === "Exception";
  const returnHref = backHref || (isException ? "/admin/evv-visits/exceptions" : "/admin/evv-visits");
  const returnText = backLabel || (isException ? "Back to Exceptions" : "Back to All Visits");

  const handleResolveException = () => {
    resolveEvvException(
      visit.id,
      selectedReasonCode,
      selectedResolutionCode,
      resolutionNote,
      "Agency Operations Admin"
    );
    toast.success("Exception Successfully Resolved", {
      description: `Visit ${visit.id} updated to Resolved. Holds cleared for Aggregator and Billing.`,
    });
    setActiveTab("details");
    loadVisit();
  };

  const handleSendReminder = () => {
    toast.success("Punch Reminder Dispatched", {
      description: `SMS and in-app reminder sent to ${visit.caregiverName} (${visit.caregiverPhone}).`,
    });
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Back and Role Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <Link
          href={returnHref}
          className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{returnText}</span>
        </Link>

        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <span className="font-semibold text-slate-600">Role: Agency Admin</span>
          <span>•</span>
          <span className="text-slate-500">
            EVV & Visits / {visit.displayId || visit.visitNumber || visit.id}
          </span>
        </div>
      </div>

      {/* Top Hero Card (Light Card per LiliSare System) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-3">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {visit.displayId || visit.visitNumber || visit.id}
              </span>

              {isException ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Exception
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified
                </span>
              )}

              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80">
                Visit: {visit.visitStatus}
              </span>

              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80">
                Method: {visit.captureMethod === "Mobile GPS" ? "GPS" : visit.captureMethod === "Telephony / IVR" ? "IVR" : "Manual"}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                {visit.clientName} ({visit.clientId}) • {visit.serviceName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Caregiver: {visit.caregiverName} ({visit.caregiverId} • {visit.caregiverRole}) • Today (2026-11-25) • {visit.scheduledStartTime} - {visit.scheduledEndTime}
              </p>
            </div>
          </div>

          {/* Action button on right */}
          {isException && (
            <button
              type="button"
              onClick={() => setActiveTab("resolution")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <span>Resolve Exception</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Standardized 4 Tabs Navigation (Screenshot 7) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          {
            id: "details" as const,
            title: "Details & Verification",
            subtitle: "Times, location & evidence",
            badge: null,
          },
          {
            id: "resolution" as const,
            title: "Exception Resolution",
            subtitle: "5-step guided workflow",
            badge: isException ? 1 : null,
          },
          {
            id: "billing" as const,
            title: "Aggregator & Billing",
            subtitle: "Submission, billing & payroll",
            badge: null,
          },
          {
            id: "audit" as const,
            title: "Audit History",
            subtitle: "Immutable UTC log",
            badge: 2,
          },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-md shadow-[#3D6B22]/20"
                  : "bg-white text-slate-800 border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div>
                <div
                  className={`text-xs sm:text-sm font-bold tracking-tight truncate ${
                    isActive ? "text-white" : "text-slate-900"
                  }`}
                >
                  {tab.title}
                </div>
                <div
                  className={`text-[10px] sm:text-[11px] font-medium truncate mt-0.5 ${
                    isActive ? "text-emerald-100" : "text-slate-500"
                  }`}
                >
                  {tab.subtitle}
                </div>
              </div>

              {tab.badge !== null && (
                <span
                  className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-rose-500 text-white"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DETAILS & VERIFICATION (Screenshot 7) */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (7 COLS / 8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: COMPLIANCE & EXCEPTION CONTEXT */}
            {isException && (
              <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>COMPLIANCE & EXCEPTION CONTEXT</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {visit.issueBadge || "Location Mismatch"}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  {visit.exceptionReason || "185 ft from registered address (threshold: 150 ft)"}
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("resolution")}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Open 5-Step Exception Resolution</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Card 2: ORIGINAL EVV EVENT VS CURRENT VISIT TIMES */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>ORIGINAL EVV EVENT VS CURRENT VISIT TIMES</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ±7m within rule
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    Method: {visit.captureMethod === "Mobile GPS" ? "GPS" : "IVR"}
                  </span>
                </div>
              </div>

              {/* Side by side comparison panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    ORIGINAL RAW EVV CAPTURE (PRESERVED)
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-2">
                    In: {visit.actualClockInTime || "08:07 AM"} • Out: {visit.actualClockOutTime || "12:02 PM"}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    185 ft from service anchor
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200/70">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    CURRENT / CONFIRMED RECORD
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-2">
                    In: {visit.actualClockInTime || "08:07 AM"} • Out: {visit.actualClockOutTime || "12:02 PM"}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Scheduled: {visit.scheduledStartTime} - {visit.scheduledEndTime} (Rule tol: ±7m)
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: CARE DELIVERY & CAREGIVER FOLLOW-UP */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    CARE DELIVERY & CAREGIVER FOLLOW-UP
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {visit.caregiverName} ({visit.caregiverId} • {visit.caregiverRole})
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                    <span>{visit.caregiverPhone || "(614) 555-1084"}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendReminder}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-slate-400" />
                  <span>Send Punch Reminder</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-600 block mb-2">
                  4/4 Care Tasks Documented
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    "Bathing / Hygiene",
                    "Meal Preparation",
                    "Medication Reminder",
                    "Light Housekeeping",
                  ].map((task) => (
                    <span
                      key={task}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      {task}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 4: SERVICE LOCATION & ASSOCIATED PATIENT PHONES */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  SERVICE LOCATION & ASSOCIATED PATIENT PHONES
                </div>
                <button
                  type="button"
                  onClick={() => toast.info("Address modification interface opened")}
                  className="text-xs font-bold text-[#3D6B22] hover:text-[#345C1D] cursor-pointer"
                >
                  Correct Location
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900">
                    {visit.clientAddress}
                  </span>
                  {isException && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      185 ft (limit 150 ft)
                    </span>
                  )}
                </div>
              </div>

              {/* Associated Phones */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Associated Service-Location Phone Numbers (IVR Eligible)
                  </span>
                  <button
                    type="button"
                    onClick={() => toast.info("Link new phone modal")}
                    className="text-xs font-bold text-[#3D6B22] hover:text-[#345C1D] cursor-pointer"
                  >
                    + Associate Phone
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Home Landline (Primary IVR)
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Landline • IVR Verified
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      (•••) •••-4821
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Sarah Mobile
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Mobile • IVR Verified
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      (•••) •••-9034
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: VERIFICATION EVIDENCE & PAYER RULE PROFILE */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  VERIFICATION EVIDENCE & PAYER RULE PROFILE
                </div>
                <span className="text-xs font-bold text-slate-700">
                  OH • Ohio Medicaid (ODM)
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Patient Signature
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Status: <span className="font-semibold text-emerald-600">Captured at 12:01 PM</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    Rule: Required
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Patient Voice / IVR
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Status: <span className="text-slate-600">Not Required</span> (Use Exception Resolution tab for Alternate IVR capture)
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                    Rule: Optional
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (4 COLS / 5 COLS) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: VISIT & SERVICE METADATA */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3.5">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                VISIT & SERVICE METADATA
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Caregiver</span>
                  <span className="font-bold text-slate-900 text-right">
                    {visit.caregiverName} ({visit.caregiverId} • {visit.caregiverRole})
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Client</span>
                  <span className="font-bold text-slate-900 text-right">
                    {visit.clientName} ({visit.clientId})
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Medicaid ID</span>
                  <span className="font-mono font-bold text-slate-800">
                    {visit.clientMedicaidId}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Service</span>
                  <span className="font-bold text-slate-900">
                    {visit.serviceName} {visit.serviceCode}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Payer / Aggregator</span>
                  <span className="font-bold text-slate-900">
                    {visit.payerName} • {visit.aggregator}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: PAYER AUTHORIZATION */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  PAYER AUTHORIZATION
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>{visit.authorizationNumber || "AUTH-OH-003"}</span>
                  <span className="text-slate-500 font-medium">Exp: 2027-02-28</span>
                </div>
                <div className="mt-3">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "53%" }} />
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block mt-1.5">
                    64 / 120 15m units remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: PROCESSING READINESS */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  PROCESSING READINESS
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("billing")}
                  className="text-xs font-bold text-[#3D6B22] hover:text-[#345C1D]"
                >
                  Manage →
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    Aggregator ({visit.aggregator})
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      visit.aggregatorStatusBadge === "Accepted"
                        ? "text-emerald-600"
                        : visit.aggregatorStatusBadge === "Rejected"
                        ? "text-rose-600"
                        : "text-slate-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        visit.aggregatorStatusBadge === "Accepted"
                          ? "bg-emerald-500"
                          : visit.aggregatorStatusBadge === "Rejected"
                          ? "bg-rose-500"
                          : "bg-slate-400"
                      }`}
                    />
                    {visit.aggregatorStatusBadge || "Pending"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    Billing (${((visit.scheduledDurationHours || 4) * (visit.billRate || 32)).toFixed(2)} est.)
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      visit.billingStatusBadge === "Cleared" || visit.billingStatusBadge === "Billed"
                        ? "text-emerald-600"
                        : visit.billingStatusBadge === "Hold"
                        ? "text-rose-600"
                        : "text-slate-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        visit.billingStatusBadge === "Cleared" || visit.billingStatusBadge === "Billed"
                          ? "bg-emerald-500"
                          : visit.billingStatusBadge === "Hold"
                          ? "bg-rose-500"
                          : "bg-slate-400"
                      }`}
                    />
                    {visit.billingStatusBadge || "Hold"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    Payroll (Payout gate)
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      visit.payrollStatusBadge === "Approved" || visit.payrollStatusBadge === "Processed"
                        ? "text-emerald-600"
                        : visit.payrollStatusBadge === "Hold"
                        ? "text-rose-600"
                        : "text-slate-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        visit.payrollStatusBadge === "Approved" || visit.payrollStatusBadge === "Processed"
                          ? "bg-emerald-500"
                          : visit.payrollStatusBadge === "Hold"
                          ? "bg-rose-500"
                          : "bg-slate-400"
                      }`}
                    />
                    {visit.payrollStatusBadge || "Pending Review"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: RECENT AUDIT EVENTS */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  RECENT AUDIT EVENTS
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("audit")}
                  className="text-xs font-bold text-[#3D6B22] hover:text-[#345C1D]"
                >
                  View All (2) →
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">EVV_CAPTURE</span>
                    <span className="text-[10px] text-slate-400">2026-11-25</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Clock-In captured via Mobile GPS at 08:07 AM (185 ft from registered address).
                  </p>
                </div>

                <div className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-700">EXCEPTION_DETECTED</span>
                    <span className="text-[10px] text-slate-400">2026-11-25</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Flagged Location Mismatch: 185 ft exceeds OH Medicaid 150 ft geofence rule.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXCEPTION RESOLUTION (Guided 5-step workflow) */}
      {activeTab === "resolution" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                5-Step Guided Exception Resolution
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Audit-compliant sign-off workflow to clear billing and payroll holds.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Step {resolutionStep} of 5
            </span>
          </div>

          {/* Stepper Indicator */}
          <div className="grid grid-cols-5 gap-2 text-xs">
            {[
              "1. Variance Analysis",
              "2. Caregiver Proof",
              "3. Patient Verification",
              "4. Supervisor Reason",
              "5. Audit Sign-off",
            ].map((stepLabel, idx) => {
              const num = idx + 1;
              const isCurrent = resolutionStep === num;
              const isDone = resolutionStep > num;
              return (
                <div
                  key={stepLabel}
                  onClick={() => setResolutionStep(num)}
                  className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                    isCurrent
                      ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-sm shadow-[#3D6B22]/20"
                      : isDone
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-50 text-slate-400 border-slate-200"
                  }`}
                >
                  <span className="block truncate">{stepLabel}</span>
                </div>
              );
            })}
          </div>

          {/* Step 1 */}
          {resolutionStep === 1 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900">
                Variance & Location Discrepancy
              </h3>
              <p className="text-slate-600">
                Clock-in GPS placed caregiver at 185 ft from 418 Oakridge Terrace. The Ohio Medicaid policy requires attendance within 150 ft.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Calculated Variance</span>
                  <span className="font-bold text-rose-600">+35 ft beyond allowable threshold</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Arrival Time</span>
                  <span className="font-bold text-emerald-600">08:07 AM (Within ±7 min policy tolerance)</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {resolutionStep === 2 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900">
                Caregiver Statement & Proof
              </h3>
              <p className="text-slate-600">
                Caregiver Hannah Miller provided confirmation that shift started in building courtyard before entering Apt 4B.
              </p>
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-800">
                ✓ Caregiver digital timesheet received and matches documented tasks.
              </div>
            </div>
          )}

          {/* Step 3 */}
          {resolutionStep === 3 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900">
                Patient Signature & Voice Confirmation
              </h3>
              <p className="text-slate-600">
                Client Sarah Johnson digitally signed on caregiver mobile device at 12:01 PM.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700">
                Signature ref: SIG-OH-2026-8814-01 • Timestamp: 2026-11-25 12:01:00 PM
              </div>
            </div>
          )}

          {/* Step 4 */}
          {resolutionStep === 4 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900">
                Supervisor Justification & Reason Code
              </h3>
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block">
                  Mandatory Exception Reason Code
                </label>
                <select
                  value={selectedReasonCode}
                  onChange={(e) => setSelectedReasonCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {EVV_REASON_CODES.map((rc) => (
                    <option key={rc.code} value={rc.code}>
                      {rc.code}: {rc.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block">
                  Formal Resolution Code
                </label>
                <select
                  value={selectedResolutionCode}
                  onChange={(e) => setSelectedResolutionCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {EVV_RESOLUTION_CODES.map((res) => (
                    <option key={res.code} value={res.code}>
                      {res.code}: {res.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block">
                  Audit Documentation Note
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>
          )}

          {/* Step 5 */}
          {resolutionStep === 5 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900">
                Audit Sign-Off & Release Holds
              </h3>
              <p className="text-slate-600 leading-relaxed">
                By completing resolution, you attest under penalty of audit compliance that this visit has been manually verified and is authorized for State Aggregator submission and claim 837 generation.
              </p>
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900 space-y-1">
                <div className="font-bold">Next Automatic Actions:</div>
                <div>• EVV status transitions to Resolved</div>
                <div>• $128.00 billing hold released</div>
                <div>• Shift released to payroll run</div>
                <div>• Re-queued into Sandata daily batch transmission</div>
              </div>
            </div>
          )}

          {/* Stepper Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={resolutionStep === 1}
              onClick={() => setResolutionStep((s) => s - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40"
            >
              Previous Step
            </button>

            {resolutionStep < 5 ? (
              <button
                type="button"
                onClick={() => setResolutionStep((s) => s + 1)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20"
              >
                Continue to Step {resolutionStep + 1}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResolveException}
                className="px-5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20"
              >
                Sign Off & Release All Holds
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AGGREGATOR & BILLING */}
      {activeTab === "billing" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-6">
          <h2 className="text-base font-bold text-slate-900">
            Aggregator Transmission & Billing Pipeline
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider block">
                AGGREGATOR PIPELINE
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span className="font-bold text-slate-900">{visit.aggregator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`font-bold ${
                    visit.aggregatorStatusBadge === "Accepted"
                      ? "text-emerald-600"
                      : visit.aggregatorStatusBadge === "Rejected"
                      ? "text-rose-600"
                      : "text-amber-600"
                  }`}
                >
                  {visit.aggregatorStatusBadge || "Pending Review"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Provider:</span>
                <span className="font-bold text-slate-900">
                  {visit.aggregatorProvider || `${visit.payerName?.split("•")[0]?.trim() || "State"} Gateway`}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider block">
                BILLING / 837 CLAIM GATE
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Claim Amount:</span>
                <span className="font-bold text-slate-900">
                  ${((visit.scheduledDurationHours || 4) * (visit.billRate || 32)).toFixed(2)} est.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`font-bold ${
                    visit.billingStatusBadge === "Cleared" || visit.billingStatusBadge === "Billed"
                      ? "text-emerald-600"
                      : visit.billingStatusBadge === "Hold"
                      ? "text-rose-600"
                      : "text-slate-700"
                  }`}
                >
                  {visit.billingStatusBadge === "Hold"
                    ? "Held (Pre-Claim Gate)"
                    : visit.billingStatusBadge === "Billed"
                    ? "Billed / Claim Sent"
                    : visit.billingStatusBadge === "Cleared"
                    ? "Cleared for 837"
                    : "Pending Review"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Block Reason:</span>
                <span className="font-bold text-slate-900">
                  {visit.billingStatusBadge === "Hold"
                    ? visit.issueBadge || "Open EVV Exception"
                    : "None (Cleared)"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider block">
                PAYROLL APPROVAL GATE
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Pay:</span>
                <span className="font-bold text-slate-900">
                  ${((visit.scheduledDurationHours || 4) * (visit.payRate || 21)).toFixed(2)} est.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`font-bold ${
                    visit.payrollStatusBadge === "Approved" || visit.payrollStatusBadge === "Processed"
                      ? "text-emerald-600"
                      : visit.payrollStatusBadge === "Hold"
                      ? "text-rose-600"
                      : "text-slate-700"
                  }`}
                >
                  {visit.payrollStatusBadge === "Approved"
                    ? "Approved for Payroll"
                    : visit.payrollStatusBadge === "Processed"
                    ? "Processed / Paid"
                    : visit.payrollStatusBadge === "Hold"
                    ? "Payroll Hold"
                    : "Pending Supervisor Review"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Disbursement Gate:</span>
                <span className="font-bold text-slate-900">Current Bi-Weekly</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT HISTORY */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Immutable Compliance Audit Trail
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                UTC timestamped event log for state auditor and payer inspection.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              HIPAA Compliant Log
            </span>
          </div>

          <div className="space-y-4">
            {[
              {
                time: "2026-11-25 08:07:12 AM UTC",
                actor: "Hannah Miller (Caregiver Mobile GPS)",
                event: "EVV_CAPTURE",
                desc: "Clock-In captured via Mobile GPS at 08:07 AM (185 ft from registered address 418 Oakridge Terrace).",
                badge: "bg-blue-50 text-blue-700 border-blue-200",
              },
              {
                time: "2026-11-25 08:07:14 AM UTC",
                actor: "System Rule Engine (ODM Rule-001)",
                event: "EXCEPTION_DETECTED",
                desc: "Flagged Location Mismatch: 185 ft exceeds OH Medicaid 150 ft geofence rule.",
                badge: "bg-rose-50 text-rose-700 border-rose-200",
              },
              {
                time: "2026-11-25 12:01:00 PM UTC",
                actor: "Sarah Johnson (Client Device Sign)",
                event: "SIGNATURE_CAPTURED",
                desc: "Digital signature captured on caregiver mobile device. Verification hash verified.",
                badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
              },
              {
                time: "2026-11-25 12:02:40 PM UTC",
                actor: "Hannah Miller (Caregiver Mobile GPS)",
                event: "CLOCK_OUT_VERIFIED",
                desc: "Clock-Out captured via Mobile GPS at 12:02 PM (45 ft from registered address, inside geofence).",
                badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
              },
            ].map((event, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${event.badge}`}>
                      {event.event}
                    </span>
                    <span className="font-semibold text-slate-700">{event.actor}</span>
                  </div>
                  <p className="text-slate-600 font-medium">{event.desc}</p>
                </div>
                <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                  {event.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
