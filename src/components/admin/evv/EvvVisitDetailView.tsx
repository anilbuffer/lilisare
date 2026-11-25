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
  FormSection,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormButtonPrimary,
  FormButtonSecondary,
} from "@/components/ui/FormControls";
import { CaregiverContactModal } from "@/components/caregivers/modals/CaregiverContactModal";
import { CaregiverScheduleShiftModal } from "@/components/caregivers/modals/CaregiverScheduleShiftModal";
import { INITIAL_CAREGIVERS } from "@/lib/caregivers/mockData";

export type EvvDetailTabType =
  | "overview"
  | "verification"
  | "location"
  | "service"
  | "investigation"
  | "timeline";

export interface EvvTabDef {
  id: EvvDetailTabType;
  label: string;
}

export const EVV_DETAIL_TABS: EvvTabDef[] = [
  { id: "overview", label: "VISIT OVERVIEW" },
  { id: "verification", label: "FEDERAL 6 ELEMENTS" },
  { id: "location", label: "GEOFENCE & TELEMETRY" },
  { id: "service", label: "CARE NOTES & ADLS" },
  { id: "investigation", label: "EXCEPTION REVIEW" },
  { id: "timeline", label: "AUDIT TIMELINE" },
];

const TAB_MIN_WIDTHS: Record<EvvDetailTabType, number> = {
  overview: 132,
  verification: 164,
  location: 176,
  service: 154,
  investigation: 156,
  timeline: 140,
};
const MORE_BUTTON_MIN_WIDTH = 96;

const CARD_CLASS =
  "bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all";

interface EvvVisitDetailViewProps {
  visitId: string;
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

export function EvvVisitDetailView({ visitId }: EvvVisitDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [visit, setVisit] = useState<EvvVisitRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<EvvDetailTabType>("overview");

  // Modals for Caregiver actions (mirroring Caregiver Details workflow)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Review Form State
  const [reviewerName, setReviewerName] = useState("Dana Jenkins, MSW");
  const [reviewerRole, setReviewerRole] = useState("Agency Operations Admin");
  const [reviewNoteText, setReviewNoteText] = useState("");
  const [selectedReasonCode, setSelectedReasonCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Space-Aware Responsive Tab Strip State (exact match with AdminCaregiverDetailView)
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

  // Load Visit & URL Param Sync
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
          t.label.toLowerCase() === tabParam.toLowerCase() ||
          t.id.replace("-", "") === tabParam.toLowerCase().replace("-", "")
      );
      if (match) setActiveTab(match.id);
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
        <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">Loading EVV Record...</p>
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

  // Tab Slicing for Space-Aware Responsive Tabs
  const visibleTabs = EVV_DETAIL_TABS.slice(0, visibleCount);
  const overflowTabs = EVV_DETAIL_TABS.slice(visibleCount);
  const isOverflowActive = overflowTabs.some((t) => t.id === activeTab);
  const activeOverflowTab = overflowTabs.find((t) => t.id === activeTab);

  const handleSelectTab = (tabId: EvvDetailTabType) => {
    setActiveTab(tabId);
    setIsMoreOpen(false);
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-5 pb-16 animate-in fade-in duration-200">
      {/* 01. Back Navigation Link (Identical to Caregiver Details) */}
      <div>
        <Link
          href="/admin/evv-visits/"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to EVV Visits Monitoring</span>
        </Link>
      </div>

      {/* 02. EVV Visit Hero Identity Card (Exact Layout Structure as Caregivers Hero Card) */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar Box with Caregiver Initials & Dynamic Status Badge */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20 flex items-center justify-center text-xl font-bold">
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

          {/* Heading & Meta Subtitle (Clean & non-duplicated) */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                {visit.caregiverName}
              </h1>
            </div>

            <div className="mt-1 flex items-center gap-2 flex-wrap text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#3D6B22] border border-emerald-200/80">
                {visit.serviceName}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-medium">
                Client:{" "}
                <Link
                  href={`/admin/clients/${visit.clientId}/`}
                  className="font-semibold text-slate-900 hover:text-[#3D6B22] hover:underline"
                >
                  {visit.clientName}
                </Link>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls (Standardized LiliSare Action Buttons) */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {isException ? (
            <button
              type="button"
              onClick={() => setActiveTab("investigation")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 text-amber-100" />
              <span>Investigate Exception</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab("investigation")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Review Note</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer hover:text-slate-900"
          >
            <CalendarPlus className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Schedule Shift</span>
          </button>

          <button
            type="button"
            onClick={() => setIsContactModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer hover:text-slate-900"
          >
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Message</span>
          </button>
        </div>
      </div>

      {/* 03. Space-Aware Responsive Tab Strip (Directly Adjacent More Dropdown with Zero Gaps) */}
      <div className="relative">
        {/* Hidden measurement row for pixel-perfect dynamic overflow calculation */}
        <div
          ref={measureContainerRef}
          aria-hidden="true"
          className="absolute -top-[9999px] -left-[9999px] pointer-events-none flex items-center gap-1 opacity-0 z-[-1]"
        >
          {EVV_DETAIL_TABS.map((tab) => (
            <div
              key={`measure-${tab.id}`}
              className="px-3 sm:px-3.5 py-2 text-xs font-bold tracking-tight whitespace-nowrap rounded-xl shrink-0"
            >
              <span>{tab.label}</span>
            </div>
          ))}
          <div className="px-3 sm:px-3.5 py-2 text-xs font-bold tracking-tight whitespace-nowrap rounded-xl flex items-center gap-1.5 border shrink-0">
            <span>MORE (6)</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Dynamic Space-Aware Tab Navigation Strip */}
        <div
          ref={tabStripRef}
          className="relative w-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-xl lg:rounded-2xl border border-slate-200 p-1.5 flex items-center gap-1 flex-nowrap overflow-visible"
        >
          {/* Front Visible Tabs */}
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight transition-all shrink-0 cursor-pointer whitespace-nowrap ${isActive
                  ? "bg-[#3D6B22] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}

          {/* Directly Adjacent Overflow "MORE" Button & Dropdown */}
          {overflowTabs.length > 0 && (
            <div ref={moreDropdownRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsMoreOpen((prev) => !prev)}
                className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${isOverflowActive
                  ? "bg-[#3D6B22] text-white shadow-xs"
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
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Floating Dropdown Menu */}
              {isMoreOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    Additional Sections
                  </div>
                  {overflowTabs.map((tab) => {
                    const isTabActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleSelectTab(tab.id)}
                        className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${isTabActive
                          ? "bg-[#3D6B22]/10 text-[#3D6B22]"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                      >
                        <span>{tab.label}</span>
                        {isTabActive && <Check className="w-3.5 h-3.5 text-[#3D6B22]" />}
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
              <div className="mt-2 text-[11px] font-medium text-amber-700 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Staff review preserves caregiver-submitted EVV data. All notes and reason codes are logged to persistent audit history.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 05. Primary Triad Detail Cards: Client, Service & EVV Verification */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* 1. Client Card */}
        <div className={CARD_CLASS}>
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
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 ">
            <span>ID: {visit.clientId}</span>
            <span>•</span>
            <span>Medicaid: {visit.clientMedicaidId}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 truncate">
            {visit.clientAddress}
          </p>
        </div>

        {/* 2. Service Card */}
        <div className={CARD_CLASS}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Service Information
            </span>
            <span className=" text-[11px] font-semibold text-[#1E5622] bg-[#E8F2E4] px-2 py-0.5 rounded">
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
            Authorization:{" "}
            <span className=" font-medium text-slate-700">
              {visit.authorizationNumber}
            </span>
          </p>
        </div>

        {/* 3. EVV Verification Card */}
        <div className={CARD_CLASS}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              EVV Verification & Schedule
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {verifiedCount} / 6 Elements
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${visit.verificationStatus === "Verified"
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
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {visit.id} · Shift {visit.visitNumber}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {visit.date} ({formatTimeDisplay(visit.scheduledStartTime)} – {formatTimeDisplay(visit.scheduledEndTime)})
            </span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Capture: {visit.sixElements.locationOfService.verified ? "Mobile GPS" : "Flagged"}</span>
            <span className="text-slate-400">21st Century Cures Act Compliant</span>
          </div>
        </div>
      </div>

      {/* 06. TAB CONTENT PANELS */}

      {/* TAB 1: VISIT OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Scheduled vs Actual Comparison */}
            <div className={CARD_CLASS}>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#3D6B22]/10 text-[#3D6B22] flex items-center justify-center font-bold text-xs">
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
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Separated operational data
                </span>
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
                  <div className="pt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-200/60">
                    <span>Method: Mobile App GPS</span>
                    <span>Pay: ${visit.payRate.toFixed(2)}/hr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Federal 6 EVV Elements Summary Card */}
            <div className={CARD_CLASS}>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#3D6B22]/10 text-[#3D6B22] flex items-center justify-center font-bold text-xs">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Federal 6 EVV Elements Status
                    </h3>
                    <p className="text-xs text-slate-500">21st Century Cures Act Mandatory Criteria</p>
                  </div>
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
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#E3F1D9] text-[#1E5622] border border-[#1E5622]/20">
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
                Visits do not automatically release for billing or payroll upon completion. Verification requires passing all 6 EVV federal elements.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                <span className="text-[11px] font-bold text-slate-500">Billing Readiness:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${visit.billingReadiness === "Ready for Billing"
                    ? "bg-[#E8F2E4] text-[#1E5622]"
                    : "bg-amber-100 text-amber-800"
                    }`}
                >
                  {visit.billingReadiness}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">Payroll Readiness:</span>
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
                  <span className=" text-slate-500 text-[11px]">ID: {visit.clientId}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Medicaid ID:</span>
                  <p className=" font-semibold text-slate-800">{visit.clientMedicaidId}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Household:</span>
                  <p className="font-semibold text-slate-800">
                    {visit.householdName || "Direct Client Household"}
                  </p>
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
                  <span className=" text-slate-500 text-[11px]">ID: {visit.caregiverId}</span>
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
          </div>
        </div>
      )}

      {/* TAB 2: FEDERAL 6 ELEMENTS */}
      {activeTab === "verification" && (
        <div className="space-y-5">
          <div className={CARD_CLASS}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3D6B22]/10 text-[#3D6B22] flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Federal 6 Elements Comprehensive Audit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mandatory 21st Century Cures Act verification criteria
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20">
                {verifiedCount} of 6 Checks Passed
              </span>
            </div>

            <div className="space-y-4">
              {[
                {
                  number: "1",
                  title: "Type of Service Performed",
                  value: visit.sixElements.serviceType.value,
                  verified: visit.sixElements.serviceType.verified,
                  notes: visit.sixElements.serviceType.notes,
                  description: "Matches approved HCPCS procedure code and authorization service plan.",
                },
                {
                  number: "2",
                  title: "Individual Receiving the Service",
                  value: visit.sixElements.individualReceiving.value,
                  verified: visit.sixElements.individualReceiving.verified,
                  notes: visit.sixElements.individualReceiving.notes,
                  description: "Validated client Medicaid Identification Number and identity match.",
                },
                {
                  number: "3",
                  title: "Date of the Service",
                  value: visit.sixElements.dateOfService.value,
                  verified: visit.sixElements.dateOfService.verified,
                  notes: visit.sixElements.dateOfService.notes,
                  description: "Validated calendar date of shift execution within authorized period.",
                },
                {
                  number: "4",
                  title: "Location of Service Delivery",
                  value: visit.sixElements.locationOfService.value,
                  verified: visit.sixElements.locationOfService.verified,
                  notes: visit.sixElements.locationOfService.notes,
                  description: "Geofence verification against client authorized home residence coordinates.",
                },
                {
                  number: "5",
                  title: "Individual Providing the Service",
                  value: visit.sixElements.individualProviding.value,
                  verified: visit.sixElements.individualProviding.verified,
                  notes: visit.sixElements.individualProviding.notes,
                  description: "Caregiver identity authenticated via mobile application secure credential token.",
                },
                {
                  number: "6",
                  title: "Time Service Begins and Ends",
                  value: visit.sixElements.timeBeginsAndEnds.value,
                  verified: visit.sixElements.timeBeginsAndEnds.verified,
                  notes: visit.sixElements.timeBeginsAndEnds.notes,
                  description: "Recorded mobile clock-in and clock-out timestamps matching schedule threshold.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200/80 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {item.number}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                    </div>
                    <p className="text-xs text-slate-600  pl-7">{item.value}</p>
                    <p className="text-[11px] text-slate-400 pl-7">{item.description}</p>
                    {item.notes && (
                      <p className="text-[11px] font-semibold text-amber-800 pl-7">{item.notes}</p>
                    )}
                  </div>
                  <div className="sm:self-center">
                    {item.verified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E3F1D9] text-[#1E5622] border border-[#1E5622]/20">
                        <Check className="w-3.5 h-3.5" />
                        <span>Pass</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Exception</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GEOFENCE & TELEMETRY */}
      {activeTab === "location" && (
        <div className="space-y-5">
          <div className={CARD_CLASS}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3D6B22]/10 text-[#3D6B22] flex items-center justify-center font-bold text-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Location Verification &amp; Geofence
                  </h3>
                  <p className="text-xs text-slate-500">
                    GPS telemetry capture and geofence buffer validation
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-600 font-medium">
                Geofence Radius: <strong className="text-slate-900">{visit.geofenceRadiusFeet} ft</strong>
              </span>
            </div>

            {/* Authorized Service Address */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 mb-4 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Authorized Client Service Address
              </span>
              <span className="font-semibold text-slate-800 text-sm">{visit.clientAddress}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Clock-in Location */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
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
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
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

      {/* TAB 4: CARE NOTES & ADLS */}
      {activeTab === "service" && (
        <div className="space-y-5">
          <div className={CARD_CLASS}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3D6B22]/10 text-[#3D6B22] flex items-center justify-center font-bold text-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Service Delivery, Tasks &amp; Care Notes
                  </h3>
                  <p className="text-xs text-slate-500">
                    ADLs, clinical delivery notes, and client attestation
                  </p>
                </div>
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

      {/* TAB 5: EXCEPTION REVIEW */}
      {activeTab === "investigation" && (
        <div className="space-y-5">
          <div className={CARD_CLASS}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3D6B22]/10 text-[#3D6B22] flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Staff Review &amp; Exception Resolution Workspace
                  </h3>
                  <p className="text-xs text-slate-500">
                    Investigate discrepancies, attach CMS reason codes, and record audit decisions
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                Audit Trail Compliant
              </span>
            </div>

            <div className="space-y-5">
              {/* Form Input using standardized FormControls */}
              <div className="p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
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
                          <span className="text-slate-400  text-[11px]">{note.timestamp}</span>
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

      {/* TAB 6: AUDIT TIMELINE */}
      {activeTab === "timeline" && (
        <div className="space-y-5">
          <div className={CARD_CLASS}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3D6B22]/10 text-[#3D6B22] flex items-center justify-center font-bold text-xs">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Chronological Activity Timeline
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aggregator submissions, system shifts, and audit logs
                  </p>
                </div>
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
                      <span className="text-[11px] text-slate-400 ">{event.timestamp}</span>
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

      {/* Caregiver Shared Modals */}
      {isContactModalOpen && (
        <CaregiverContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          caregiver={rawCaregiver}
          onLogCommunication={(_id, type) => {
            toast.success(`Logged ${type.toUpperCase()} message for ${visit.caregiverName}`);
          }}
        />
      )}

      {isScheduleModalOpen && (
        <CaregiverScheduleShiftModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          caregiver={rawCaregiver}
          onScheduleShift={(_id, shift) => {
            toast.success(`Scheduled ${shift.type || "shift"} with ${shift.clientName || visit.clientName}`);
          }}
        />
      )}
    </div>
  );
}
