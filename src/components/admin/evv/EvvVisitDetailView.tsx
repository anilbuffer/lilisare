"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  ChevronDown,
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
  MessageSquare,
  CalendarPlus,
  Eye,
  Activity,
  Layers,
  ArrowRight,
  Sliders,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  EvvVisitRecord,
  EvvVisitStatus,
  EvvVerificationStatus,
  EvvReviewNote,
  EvvCorrection,
} from "@/types/evvVisit";
import {
  getEvvVisitById,
  resolveEvvException,
  approveMinorVariance,
  requestCaregiverCorrection,
  addEvvReviewNote,
  EVV_REASON_CODES,
  EVV_RESOLUTION_CODES,
  EVV_REVIEWERS,
  EVV_SYNC_EVENT,
  exportEvvVisitsCsv,
} from "@/lib/admin/evvVisitsStore";
import { CaregiverContactModal } from "@/components/caregivers/modals/CaregiverContactModal";
import { CaregiverScheduleShiftModal } from "@/components/caregivers/modals/CaregiverScheduleShiftModal";
import { INITIAL_CAREGIVERS } from "@/lib/caregivers/mockData";

export type EvvDetailTabType =
  | "overview"
  | "evidence"
  | "verification"
  | "corrections"
  | "investigation"
  | "timeline";

export interface EvvTabDef {
  id: EvvDetailTabType;
  label: string;
}

export const EVV_DETAIL_TABS: EvvTabDef[] = [
  { id: "overview", label: "VISIT OVERVIEW" },
  { id: "evidence", label: "EVV EVIDENCE" },
  { id: "verification", label: "FEDERAL 6 ELEMENTS" },
  { id: "corrections", label: "CORRECTION HISTORY" },
  { id: "investigation", label: "EXCEPTION REVIEW" },
  { id: "timeline", label: "AUDIT TIMELINE" },
];

const TAB_MIN_WIDTHS: Record<EvvDetailTabType, number> = {
  overview: 132,
  evidence: 140,
  verification: 164,
  corrections: 160,
  investigation: 156,
  timeline: 140,
};
const MORE_BUTTON_MIN_WIDTH = 96;

const CARD_CLASS =
  "bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all";

interface EvvVisitDetailViewProps {
  visitId: string;
  defaultTab?: EvvDetailTabType;
  backHref?: string;
  backLabel?: string;
}

function getInitials(name: string): string {
  if (!name) return "CG";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getVisitStatusBadge(status: EvvVisitStatus) {
  switch (status) {
    case "Completed":
      return { bg: "bg-emerald-500", label: "Completed" };
    case "In Progress":
      return { bg: "bg-blue-600", label: "In Progress" };
    case "Scheduled":
      return { bg: "bg-slate-500", label: "Scheduled" };
    case "Missed":
      return { bg: "bg-rose-500", label: "Missed" };
    default:
      return { bg: "bg-slate-500", label: status };
  }
}

export function EvvVisitDetailView({
  visitId,
  defaultTab,
  backHref,
  backLabel,
}: EvvVisitDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [visit, setVisit] = useState<EvvVisitRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<EvvDetailTabType>(defaultTab || "overview");

  // Modals for Caregiver actions
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Review Form State
  const [reviewerName, setReviewerName] = useState("Dana Jenkins, MSW");
  const [reviewerRole, setReviewerRole] = useState("Agency Operations Admin");
  const [reviewNoteText, setReviewNoteText] = useState("");
  const [selectedReasonCode, setSelectedReasonCode] = useState("");
  const [selectedResolutionCode, setSelectedResolutionCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Space-Aware Responsive Tab Strip State
  const tabStripRef = useRef<HTMLDivElement>(null);
  const measureContainerRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(EVV_DETAIL_TABS.length);

  // Close More dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    if (isMoreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMoreOpen]);

  // Dynamic space-aware overflow calculation
  useEffect(() => {
    const calculateOverflow = () => {
      if (!tabStripRef.current) return;

      const containerWidth = tabStripRef.current.clientWidth;
      const availableWidth = containerWidth - 16;
      if (availableWidth <= 0) return;

      const measureChildren = measureContainerRef.current
        ? (Array.from(measureContainerRef.current.children) as HTMLElement[])
        : [];

      const moreMeasureEl =
        measureChildren.length > 0 ? measureChildren[measureChildren.length - 1] : null;
      const measuredMoreWidth = moreMeasureEl ? moreMeasureEl.getBoundingClientRect().width : 0;
      const moreWidth = Math.max(measuredMoreWidth, MORE_BUTTON_MIN_WIDTH);

      const tabElements = measureChildren.slice(0, EVV_DETAIL_TABS.length);
      const tabWidths = EVV_DETAIL_TABS.map((tab, idx) => {
        const measured = tabElements[idx]?.getBoundingClientRect().width || 0;
        return Math.max(measured, TAB_MIN_WIDTHS[tab.id] || 90);
      });

      const GAP = 4;
      const totalAllWidth = tabWidths.reduce((acc, w, idx) => acc + w + (idx > 0 ? GAP : 0), 0);
      if (availableWidth >= totalAllWidth + 8) {
        setVisibleCount(EVV_DETAIL_TABS.length);
        return;
      }

      const maxTabsWidth = availableWidth - moreWidth - GAP;
      let currentWidth = 0;
      let count = 0;
      for (let i = 0; i < tabWidths.length; i++) {
        const nextWidth = currentWidth + (count > 0 ? GAP : 0) + tabWidths[i];
        if (nextWidth <= maxTabsWidth) {
          currentWidth = nextWidth;
          count++;
        } else {
          break;
        }
      }

      setVisibleCount(Math.min(EVV_DETAIL_TABS.length - 1, Math.max(1, count)));
    };

    calculateOverflow();

    const resizeObserver = new ResizeObserver(() => {
      calculateOverflow();
    });

    if (tabStripRef.current) {
      resizeObserver.observe(tabStripRef.current);
    }

    window.addEventListener("resize", calculateOverflow);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateOverflow);
    };
  }, []);

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

    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const match = EVV_DETAIL_TABS.find(
        (t) =>
          t.id === tabParam.toLowerCase() ||
          t.label.toLowerCase() === tabParam.toLowerCase()
      );
      if (match) setActiveTab(match.id);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }

    if (typeof window !== "undefined") {
      window.addEventListener(EVV_SYNC_EVENT, loadVisit);
      window.addEventListener("storage", loadVisit);
      return () => {
        window.removeEventListener(EVV_SYNC_EVENT, loadVisit);
        window.removeEventListener("storage", loadVisit);
      };
    }
  }, [visitId, searchParams]);

  if (isLoading) {
    return (
      <div className="w-full max-w-9xl mx-auto py-16 text-center text-slate-500">
        <div className="w-6 h-6 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">Loading Visit Workspace...</p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="w-full max-w-9xl mx-auto py-16 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">EVV Visit Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested EVV visit ID &quot;{visitId}&quot; could not be located in the operational dataset.
        </p>
        <Link
          href="/admin/evv-visits/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#3e6b2b] hover:bg-[#345c1d] rounded-xl shadow-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to EVV Visits</span>
        </Link>
      </div>
    );
  }

  const formatTimeDisplay = (time24?: string) => {
    if (!time24) return "Not Recorded";
    const [h, m] = time24.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return time24;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const caregiverInitials = getInitials(visit.caregiverName);
  const statusBadge = getVisitStatusBadge(visit.visitStatus);
  const isException =
    visit.verificationStatus === "Exception" ||
    visit.verificationStatus === "Under Review" ||
    visit.verificationStatus === "Correction Required";

  const verifiedCount = Object.values(visit.sixElements).filter((e) => e.verified).length;

  const rawCaregiver =
    INITIAL_CAREGIVERS.find((c) => c.id.toLowerCase() === visit.caregiverId.toLowerCase()) ||
    INITIAL_CAREGIVERS[0];

  const visibleTabs = EVV_DETAIL_TABS.slice(0, visibleCount);
  const overflowTabs = EVV_DETAIL_TABS.slice(visibleCount);
  const isOverflowActive = overflowTabs.some((t) => t.id === activeTab);
  const activeOverflowTab = overflowTabs.find((t) => t.id === activeTab);

  const handleSelectTab = (tabId: EvvDetailTabType) => {
    setActiveTab(tabId);
    setIsMoreOpen(false);
  };

  const handleResolveFromPage = () => {
    if (!selectedReasonCode || !selectedResolutionCode) {
      toast.error("Reason & Resolution required", {
        description: "Please select both an exception reason code and resolution code.",
      });
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      resolveEvvException(
        visit.id,
        selectedReasonCode,
        selectedResolutionCode,
        reviewNoteText,
        reviewerName
      );
      setIsSubmitting(false);
      setReviewNoteText("");
      toast.success("Exception Resolved & Verified", {
        description: `Visit ${visit.id} updated and cleared for downstream evaluation.`,
      });
      loadVisit();
    }, 400);
  };

  const handleApproveCorrection = (correctionId: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      resolveEvvException(
        visit.id,
        "RC-02",
        "RES-06",
        "Caregiver submitted timesheet correction approved by agency administrator.",
        reviewerName
      );
      setIsSubmitting(false);
      toast.success("Correction Approved", {
        description: "Caregiver timesheet amendment verified and approved into permanent audit log.",
      });
      loadVisit();
    }, 400);
  };

  const resolvedBackHref =
    backHref ||
    (searchParams.get("from") === "exceptions"
      ? "/admin/evv-visits/exceptions/"
      : "/admin/evv-visits/");
  const resolvedBackLabel =
    backLabel ||
    (searchParams.get("from") === "exceptions"
      ? "Back to Exceptions Queue"
      : "Back to EVV Visits Monitoring");

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5 pb-16 animate-fade-in">
      {/* 01. Back Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          href={resolvedBackHref}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{resolvedBackLabel}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportEvvVisitsCsv([visit])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Record</span>
          </button>
          {isException && (
            <button
              type="button"
              onClick={() => setActiveTab("investigation")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Review Exception</span>
            </button>
          )}
        </div>
      </div>

      {/* 02. EVV Visit Hero Identity Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar Box with Caregiver Initials & Status Badge */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#3e6b2b]/15 text-[#3e6b2b] border border-[#3e6b2b]/25 flex items-center justify-center text-xl font-bold">
              {caregiverInitials}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs border-2 border-white ${statusBadge.bg}`}
              >
                {statusBadge.label}
              </span>
            </div>
          </div>

          {/* Heading & Meta Subtitle */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                <Link
                  href={`/admin/caregivers/${visit.caregiverId}/`}
                  className="hover:text-[#3e6b2b] hover:underline transition-colors"
                  title="View caregiver profile and credentials"
                >
                  {visit.caregiverName}
                </Link>
              </h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                {visit.id}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 flex-wrap text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#3e6b2b] border border-emerald-200/80">
                {visit.serviceName} ({visit.serviceCode})
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-medium">
                Client:{" "}
                <Link
                  href={`/admin/clients/${visit.clientId}/`}
                  className="font-semibold text-slate-900 hover:text-[#3e6b2b] hover:underline"
                >
                  {visit.clientName}
                </Link>{" "}
                ({visit.clientMedicaidId})
              </span>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium text-[11px]">Verification:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${visit.verificationStatus === "Verified"
                  ? "bg-[#3e6b2b]/15 text-[#3e6b2b]"
                  : "bg-amber-100 text-amber-800"
                  }`}
              >
                {visit.verificationStatus}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium text-[11px]">Aggregator:</span>
              <span className="font-semibold text-slate-800 text-[11px]">
                {visit.aggregatorStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 03. Space-Aware Responsive Tab Strip */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div ref={tabStripRef} className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight transition-all shrink-0 cursor-pointer whitespace-nowrap ${isActive
                  ? "bg-[#3e6b2b] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}

          {overflowTabs.length > 0 && (
            <div ref={moreDropdownRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsMoreOpen((prev) => !prev)}
                className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${isOverflowActive
                  ? "bg-[#3e6b2b] text-white shadow-xs"
                  : isMoreOpen
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
              >
                <span>
                  {isOverflowActive && activeOverflowTab
                    ? activeOverflowTab.label
                    : `MORE (${overflowTabs.length})`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 ${isMoreOpen ? "rotate-180" : ""}`} />
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  {overflowTabs.map((tab) => {
                    const isTabActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleSelectTab(tab.id)}
                        className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center justify-between cursor-pointer ${isTabActive
                          ? "bg-[#3e6b2b]/10 text-[#3e6b2b]"
                          : "text-slate-700 hover:bg-slate-50"
                          }`}
                      >
                        <span>{tab.label}</span>
                        {isTabActive && <Check className="w-3.5 h-3.5 text-[#3e6b2b]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 04. Exception Alert Banner (if applicable) */}
      {isException && (
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
            </div>
          </div>
        </div>
      )}

      {/* 05. TAB CONTENT PANELS */}

      {/* TAB 1: VISIT OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Scheduled vs Actual Comparison */}
            <div className={CARD_CLASS}>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#3e6b2b]/10 text-[#3e6b2b] flex items-center justify-center font-bold text-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Scheduled vs. Actual Visit Time
                    </h3>
                    <p className="text-xs text-slate-500">
                      Comparison of scheduling roster against mobile EVV telemetry
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/scheduling/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  <span>View in Scheduling</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Scheduled Box */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Scheduled Plan</span>
                    <span className="text-slate-700 font-semibold">{visit.scheduledDurationHours} hrs</span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Planned Start &amp; End</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatTimeDisplay(visit.scheduledStartTime)} – {formatTimeDisplay(visit.scheduledEndTime)}
                    </div>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-200/60">
                    <span>Units: {visit.scheduledDurationHours * 4}</span>
                    <span>Rate: ${visit.billRate.toFixed(2)}/hr</span>
                  </div>
                </div>

                {/* Actual EVV Box */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Actual Recorded EVV</span>
                    <span className="text-[#3e6b2b] font-semibold">
                      {visit.actualDurationHours ? `${visit.actualDurationHours} hrs` : "In Progress"}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Recorded Clock-In &amp; Out</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatTimeDisplay(visit.actualClockInTime)} – {formatTimeDisplay(visit.actualClockOutTime)}
                    </div>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-200/60">
                    <span>Method: {visit.captureMethod}</span>
                    <span>Pay: ${visit.payRate.toFixed(2)}/hr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Federal 6 EVV Elements Status */}
            <div className={CARD_CLASS}>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#3e6b2b]/10 text-[#3e6b2b] flex items-center justify-center font-bold text-xs">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Federal 6 EVV Elements Status
                    </h3>
                    <p className="text-xs text-slate-500">21st Century Cures Act Mandatory Criteria</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#3e6b2b]/10 text-[#3e6b2b] border border-[#3e6b2b]/20">
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
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
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
            {/* Downstream Operations Governance Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl lg:rounded-2xl p-4 sm:p-5 text-xs text-slate-600 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-200/70 flex items-center justify-center text-slate-700 shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-slate-800">
                  Billing &amp; Payroll Governance
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Visits do not automatically release for billing or payroll upon completion. Verification requires passing all 6 EVV federal elements and resolving exceptions.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                <span className="text-[11px] font-bold text-slate-500">Billing Readiness:</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${visit.billingReadiness === "Cleared for Billing"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-100 text-amber-800"
                      }`}
                  >
                    {visit.billingReadiness}
                  </span>
                  {visit.billingReadiness === "Cleared for Billing" && (
                    <Link
                      href="/admin/billing"
                      className="text-[11px] font-semibold text-[#3e6b2b] hover:underline inline-flex items-center"
                      title="Open in Billing & Claims"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">Payroll Readiness:</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${visit.payrollReadiness === "Cleared for Payroll"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-100 text-amber-800"
                      }`}
                  >
                    {visit.payrollReadiness}
                  </span>
                  {visit.payrollReadiness === "Cleared for Payroll" && (
                    <Link
                      href="/admin/payroll"
                      className="text-[11px] font-semibold text-[#3e6b2b] hover:underline inline-flex items-center"
                      title="Open in Timesheets & Payroll"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Care Notes Snapshot */}
            <div className={CARD_CLASS}>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800">Care Notes &amp; ADLs</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {visit.tasksCompleted.length} Tasks
                  </span>
                  <Link
                    href="/admin/care-notes"
                    className="text-[11px] font-semibold text-[#3e6b2b] hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Review</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                &ldquo;{visit.careNotes}&rdquo;
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {visit.tasksCompleted.map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EVV EVIDENCE */}
      {activeTab === "evidence" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Location Evidence Card */}
            <div className={CARD_CLASS}>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Location Telemetry &amp; Geofence Evidence
                    </h3>
                    <p className="text-xs text-slate-500">
                      Approved client service centroid vs captured event coordinates
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${visit.locationVerificationStatus === "Verified"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                >
                  {visit.locationVerificationStatus}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Approved Service Address
                  </span>
                  <p className="font-semibold text-slate-800 text-sm">{visit.clientAddress}</p>
                  <p className="text-slate-500 text-[11px]">Authorized Radius: {visit.geofenceRadiusFeet} feet geofence</p>
                </div>

                {visit.clockInLocation ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <span className="font-bold text-slate-700 block">Clock-in Telemetry</span>
                      <p className="text-slate-600 truncate">{visit.clockInLocation.address}</p>
                      {visit.clockInLocation.coordinatesAvailable ? (
                        <div className="font-mono text-[11px] text-slate-500 space-y-0.5">
                          <p>Lat: {visit.clockInLocation.lat?.toFixed(5)}, Lng: {visit.clockInLocation.lng?.toFixed(5)}</p>
                          <p>Distance: <strong className="text-slate-800">{visit.clockInLocation.distanceFeet} ft</strong></p>
                          <p>Accuracy: +/- {visit.clockInLocation.accuracyMeters}m</p>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Non-GPS capture method</p>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <span className="font-bold text-slate-700 block">Clock-out Telemetry</span>
                      <p className="text-slate-600 truncate">
                        {visit.clockOutLocation?.address || "Pending shift completion"}
                      </p>
                      {visit.clockOutLocation?.coordinatesAvailable ? (
                        <div className="font-mono text-[11px] text-slate-500 space-y-0.5">
                          <p>Lat: {visit.clockOutLocation.lat?.toFixed(5)}, Lng: {visit.clockOutLocation.lng?.toFixed(5)}</p>
                          <p>Distance: <strong className="text-slate-800">{visit.clockOutLocation.distanceFeet} ft</strong></p>
                          <p>Accuracy: +/- {visit.clockOutLocation.accuracyMeters}m</p>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Clock-out location not recorded or non-GPS</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-100 text-center text-slate-500">
                    Location data unavailable (Telephony or manual submission)
                  </div>
                )}
              </div>
            </div>

            {/* Patient Verification Card */}
            <div className={CARD_CLASS}>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#3e6b2b] flex items-center justify-center font-bold text-xs">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Patient Service Verification Evidence
                    </h3>
                    <p className="text-xs text-slate-500">
                      Signature, voice attestation and client service confirmation
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Digital Signature
                    </span>
                    <span className="text-sm font-bold text-slate-800 mt-1 block">
                      {visit.patientVerification?.signatureCaptured}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Type: {visit.patientVerification?.signatureType || "None"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Voice Attestation
                    </span>
                    <span className="text-sm font-bold text-slate-800 mt-1 block">
                      {visit.patientVerification?.voiceVerificationCaptured}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Phone auth confirmation
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Client Confirmed Service Performed:</span>
                    <span className="font-bold text-slate-900">{visit.patientVerification?.patientConfirmedService}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-2">
                    <span className="text-slate-600 font-semibold">Client Confirmed Visit Duration:</span>
                    <span className="font-bold text-slate-900">{visit.patientVerification?.patientConfirmedTime}</span>
                  </div>
                  {visit.patientVerification?.verificationTimestamp && (
                    <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-2 text-slate-500">
                      <span>Attestation Timestamp:</span>
                      <span className="font-mono">{visit.patientVerification.verificationTimestamp}</span>
                    </div>
                  )}
                </div>

                {/* Secure Attachment Placeholder */}
                <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">
                        Encrypted Attestation Payload
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Ref: {visit.patientVerification?.evidenceRef || "EVD-CO-2026-ENCRYPTED"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded bg-slate-200 text-slate-700 font-semibold">
                    HIPAA Secured
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEDERAL 6 ELEMENTS */}
      {activeTab === "verification" && (
        <div className={CARD_CLASS}>
          <h3 className="text-base font-bold text-slate-900 mb-2">
            Federal 21st Century Cures Act Mandatory Elements
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Under Section 12006 of the 21st Century Cures Act, all 6 data elements must be satisfied and verified prior to claims processing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "1. Type of Service",
                desc: "The specific covered personal care or home health service provided.",
                data: visit.sixElements.serviceType,
              },
              {
                title: "2. Individual Receiving Service",
                desc: "The Medicaid beneficiary recipient identified by state ID.",
                data: visit.sixElements.individualReceiving,
              },
              {
                title: "3. Date of Service",
                desc: "The calendar date on which care delivery occurred.",
                data: visit.sixElements.dateOfService,
              },
              {
                title: "4. Location of Service",
                desc: "The geofence coordinates or registered address of service delivery.",
                data: visit.sixElements.locationOfService,
              },
              {
                title: "5. Individual Providing Service",
                desc: "The credentialed direct care worker performing the shift.",
                data: visit.sixElements.individualProviding,
              },
              {
                title: "6. Time Begins and Ends",
                desc: "The electronic timestamp recording clock-in and clock-out.",
                data: visit.sixElements.timeBeginsAndEnds,
              },
            ].map((el, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{el.title}</span>
                  {el.data.verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <AlertTriangle className="w-3 h-3" />
                      Discrepancy
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">{el.desc}</p>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 font-medium text-slate-800">
                  {el.data.value}
                </div>
                {el.data.notes && (
                  <p className="text-[11px] text-amber-700 font-semibold">{el.data.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CORRECTION HISTORY */}
      {activeTab === "corrections" && (
        <div className={CARD_CLASS}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Caregiver Timesheet Corrections &amp; Amendments
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Side-by-side auditable view of original EVV recordings versus caregiver submitted corrections. Original events are permanently immutable.
              </p>
            </div>
          </div>

          {visit.corrections && visit.corrections.length > 0 ? (
            <div className="space-y-4">
              {visit.corrections.map((cor) => (
                <div
                  key={cor.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Correction #{cor.id}</span>
                      <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Field: {cor.fieldChanged}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${cor.status === "Approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : cor.status === "Pending Approval"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                        }`}
                    >
                      {cor.status}
                    </span>
                  </div>

                  {/* Side by side comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Original EVV Value (Immutable)
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-600 block">
                        {cor.originalValue}
                      </span>
                      <p className="text-[10px] text-slate-400">Captured at shift event</p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200 space-y-1">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase block">
                        Submitted Corrected Value
                      </span>
                      <span className="font-mono text-sm font-bold text-emerald-900 block">
                        {cor.correctedValue}
                      </span>
                      <p className="text-[10px] text-emerald-600">Pending agency sign-off</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-100 space-y-1">
                    <span className="font-semibold text-slate-700 block">Reason for Adjustment:</span>
                    <p className="text-slate-600">{cor.reason}</p>
                    <div className="pt-2 text-[11px] text-slate-400 flex justify-between border-t border-slate-100">
                      <span>Submitted by: <strong>{cor.submittedBy}</strong></span>
                      <span>Timestamp: {cor.submittedAt}</span>
                    </div>
                  </div>

                  {/* Action button if pending */}
                  {cor.status === "Pending Approval" && (
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleApproveCorrection(cor.id)}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3e6b2b] hover:bg-[#345c1d] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Timesheet Correction</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              <History className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="font-bold text-slate-800 text-sm">No Timesheet Corrections Submitted</p>
              <p className="text-xs text-slate-500 mt-1">
                The caregiver has not submitted post-shift timesheet adjustments for this visit.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: EXCEPTION & RESOLUTION */}
      {activeTab === "investigation" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Resolution Form */}
            <div className={CARD_CLASS}>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Resolve Exception &amp; Document Audit
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Record mandatory reason and resolution codes per state compliance standards.
              </p>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Exception Reason Code <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedReasonCode}
                    onChange={(e) => setSelectedReasonCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  >
                    <option value="">-- Select reason code --</option>
                    {EVV_REASON_CODES.map((rc) => (
                      <option key={rc.code} value={rc.code}>
                        {rc.code} — {rc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Resolution Code <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedResolutionCode}
                    onChange={(e) => setSelectedResolutionCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  >
                    <option value="">-- Select resolution code --</option>
                    {EVV_RESOLUTION_CODES.map((res) => (
                      <option key={res.code} value={res.code}>
                        {res.code} — {res.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Reviewer Notes &amp; Verification Justification
                  </label>
                  <textarea
                    rows={3}
                    value={reviewNoteText}
                    onChange={(e) => setReviewNoteText(e.target.value)}
                    placeholder="Enter factual explanation, corroborated documentation, or supervisor sign-off..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleResolveFromPage}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#3e6b2b] hover:bg-[#345c1d] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save Resolution &amp; Mark Verified</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Review Notes */}
            <div className={CARD_CLASS}>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Investigation &amp; Resolution History
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Prior staff notes, supervisor reviews, and audit events.
              </p>

              <div className="space-y-3">
                {visit.reviewNotes.length > 0 ? (
                  visit.reviewNotes.map((n) => (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{n.reviewerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-700">{n.note}</p>
                      {n.reasonCode && (
                        <p className="text-[11px] font-mono text-[#3e6b2b] font-semibold">
                          Code: {n.reasonCode} {n.reasonDescription ? `(${n.reasonDescription})` : ""}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 text-center">
                    No investigation notes recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TIMELINE */}
      {activeTab === "timeline" && (
        <div className={CARD_CLASS}>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Complete EVV Event &amp; Audit Trail
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Immutable chronological sequence of shift lifecycle, telemetry pings, exception triggers, and agency review actions.
          </p>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {visit.timeline.map((evt) => (
              <div key={evt.id} className="relative text-xs">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 top-0 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${evt.badgeType === "success"
                    ? "bg-emerald-500 text-white"
                    : evt.badgeType === "warning"
                      ? "bg-amber-500 text-white"
                      : evt.badgeType === "error"
                        ? "bg-rose-500 text-white"
                        : "bg-[#3e6b2b] text-white"
                    }`}
                >
                  <Activity className="w-2.5 h-2.5" />
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-slate-900 text-xs">{evt.event}</span>
                    <span className="text-[10px] font-mono text-slate-400">{evt.timestamp}</span>
                  </div>
                  <p className="text-slate-600">{evt.details}</p>
                  <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-2">
                    <span>Actor: <strong>{evt.actor}</strong></span>
                    <span>•</span>
                    <span>Role: {evt.actorRole}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals for Caregiver Contact & Scheduling */}
      <CaregiverContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        caregiver={rawCaregiver}
        onLogCommunication={(cgId, type, note) => {
          toast.success("Caregiver Communication Logged", {
            description: `${type.toUpperCase()} recorded for ${rawCaregiver.name}.`,
          });
          setIsContactModalOpen(false);
        }}
      />
      <CaregiverScheduleShiftModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        caregiver={rawCaregiver}
        onScheduleShift={() => {
          toast.success("Shift Scheduled", {
            description: `New shift scheduled for ${rawCaregiver.name}.`,
          });
          setIsScheduleModalOpen(false);
        }}
      />
    </div>
  );
}
