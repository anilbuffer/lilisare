"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Send,
  Sparkles,
  Star,
  ShieldCheck,
  Award,
  Users,
  CalendarPlus,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Download,
  Plus,
  RotateCcw,
  Check,
  AlertTriangle,
  Folder,
  File,
  Eye,
  FileCheck2,
  User,
  Building,
  Navigation,
  Sliders,
  Heart,
  Tag,
  Smartphone,
  Trash2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";
import { deleteCaregiverFromStorage } from "@/lib/intake/intakeSync";
import {
  getAdminCaregiverProfileById,
  AdminCaregiverProfile,
} from "@/lib/caregivers/adminCaregiversData";
import { CaregiverContactModal } from "@/components/caregivers/modals/CaregiverContactModal";
import { CaregiverScheduleShiftModal } from "@/components/caregivers/modals/CaregiverScheduleShiftModal";
import { toast } from "sonner";
import { CaregiverRecord } from "@/types/caregiver";
import { getCaregiversFromStorage, INITIAL_CAREGIVERS } from "@/lib/caregivers/mockData";
import { subscribeToIntakeSync } from "@/lib/intake/intakeSync";

// The 13 Dedicated Tab Components
import { CaregiverProfileTab } from "./tabs/CaregiverProfileTab";
import { CaregiverCalendarTab } from "./tabs/CaregiverCalendarTab";
import { CaregiverComplianceTab } from "./tabs/CaregiverComplianceTab";
import { CaregiverAvailabilityTab } from "./tabs/CaregiverAvailabilityTab";
import { CaregiverPayDetailsTab } from "./tabs/CaregiverPayDetailsTab";
import { CaregiverDocumentsTab } from "./tabs/CaregiverDocumentsTab";
import { CaregiverAttributesTab } from "./tabs/CaregiverAttributesTab";
import { CaregiverFormsTab } from "./tabs/CaregiverFormsTab";
import { CaregiverCustomFieldsTab } from "./tabs/CaregiverCustomFieldsTab";
import { CaregiverEmergencyContactTab } from "./tabs/CaregiverEmergencyContactTab";
import { CaregiverPointsTab } from "./tabs/CaregiverPointsTab";
import { CaregiverNoteListTab } from "./tabs/CaregiverNoteListTab";
import { CaregiverMyAgencyTab } from "./tabs/CaregiverMyAgencyTab";

interface AdminCaregiverDetailViewProps {
  caregiverId: string;
  initialEditMode?: boolean;
}

// 13 exact tabs matching the user's latest specification & attached references
export type CaregiverDetailTabType =
  | "profile"
  | "calendar"
  | "compliance"
  | "availability-blocks"
  | "pay-details"
  | "documents"
  | "attributes"
  | "forms"
  | "custom-fields"
  | "emergency-contact"
  | "points"
  | "note-list"
  | "myagency";

export interface CaregiverTabDef {
  id: CaregiverDetailTabType;
  label: string;
}

export const CAREGIVER_DETAIL_TABS: CaregiverTabDef[] = [
  { id: "profile", label: "PROFILE" },
  { id: "calendar", label: "CALENDAR" },
  { id: "compliance", label: "COMPLIANCE" },
  { id: "availability-blocks", label: "AVAILABILITY BLOCKS" },
  { id: "pay-details", label: "PAY DETAILS" },
  { id: "documents", label: "DOCUMENTS" },
  { id: "attributes", label: "ATTRIBUTES" },
  { id: "forms", label: "FORMS" },
  { id: "custom-fields", label: "CUSTOM FIELDS" },
  { id: "emergency-contact", label: "EMERGENCY CONTACT" },
  { id: "points", label: "POINTS" },
  { id: "note-list", label: "NOTE LIST" },
  { id: "myagency", label: "MYAGENCY" },
];

const TAB_MIN_WIDTHS: Record<CaregiverDetailTabType, number> = {
  profile: 76,
  calendar: 84,
  compliance: 98,
  "availability-blocks": 156,
  "pay-details": 102,
  documents: 92,
  attributes: 96,
  forms: 64,
  "custom-fields": 118,
  "emergency-contact": 148,
  points: 70,
  "note-list": 88,
  myagency: 84,
};
const MORE_BUTTON_MIN_WIDTH = 96;

function getStatusBadge(status: AdminCaregiverProfile["status"]) {
  switch (status) {
    case "Active":
      return { bg: "bg-emerald-500", label: "Active" };
    case "Onboarding":
      return { bg: "bg-purple-600", label: "Onboarding" };
    case "On Hold":
      return { bg: "bg-amber-500", label: "On Hold" };
    case "Inactive":
    default:
      return { bg: "bg-slate-500", label: "Inactive" };
  }
}

export function AdminCaregiverDetailView({
  caregiverId,
  initialEditMode = false,
}: AdminCaregiverDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<CaregiverDetailTabType>("profile");
  const [profile, setProfile] = useState<AdminCaregiverProfile | null>(null);
  const [rawRecord, setRawRecord] = useState<CaregiverRecord | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(initialEditMode);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const perms = usePortalPermissions();

  const allowedTabs = React.useMemo(
    () =>
      CAREGIVER_DETAIL_TABS.filter((tab) => {
        if (!perms.caregivers.canViewPayDetails && (tab.id === "pay-details" || tab.id === "points" || tab.id === "myagency")) {
          return false;
        }
        return true;
      }),
    [perms.caregivers.canViewPayDetails]
  );

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Space-Aware Responsive Tab Strip State
  const tabStripRef = useRef<HTMLDivElement>(null);
  const measureContainerRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(CAREGIVER_DETAIL_TABS.length);

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

  // Dynamic space-aware overflow calculation: measures exact tab widths and available container space
  useEffect(() => {
    const calculateOverflow = () => {
      if (!tabStripRef.current) return;

      const containerWidth = tabStripRef.current.clientWidth;
      // Subtract container horizontal padding (p-1.5 = 12px) plus safety buffer (16px)
      const availableWidth = containerWidth - 16;
      if (availableWidth <= 0) return;

      const measureChildren = measureContainerRef.current
        ? (Array.from(measureContainerRef.current.children) as HTMLElement[])
        : [];

      // The last child in the measure container is the "MORE (13) ▾" template button
      const moreMeasureEl =
        measureChildren.length > 0 ? measureChildren[measureChildren.length - 1] : null;
      const measuredMoreWidth = moreMeasureEl ? moreMeasureEl.getBoundingClientRect().width : 0;
      const moreWidth = Math.max(measuredMoreWidth, MORE_BUTTON_MIN_WIDTH);

      // The first 13 children are the tab buttons
      const tabElements = measureChildren.slice(0, CAREGIVER_DETAIL_TABS.length);
      const tabWidths = CAREGIVER_DETAIL_TABS.map((tab, idx) => {
        const measured = tabElements[idx]?.getBoundingClientRect().width || 0;
        return Math.max(measured, TAB_MIN_WIDTHS[tab.id] || 80);
      });

      const GAP = 4; // gap-1 in Tailwind is 4px

      // 1. Check if ALL tabs fit cleanly within available container width
      const totalAllWidth = tabWidths.reduce((acc, w, idx) => acc + w + (idx > 0 ? GAP : 0), 0);
      if (availableWidth >= totalAllWidth + 8) {
        setVisibleCount(CAREGIVER_DETAIL_TABS.length);
        return;
      }

      // 2. Otherwise, reserve space for the directly adjacent "MORE" button and its gap
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

      // Ensure at least 1 tab is visible and at most 12 tabs when overflowing
      setVisibleCount(Math.min(CAREGIVER_DETAIL_TABS.length - 1, Math.max(1, count)));
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

  // Load consistent caregiver profile by ID & sync tab from URL query with real-time intake updates
  useEffect(() => {
    setIsMounted(true);

    const refreshData = () => {
      const loadedProfile = getAdminCaregiverProfileById(caregiverId);
      setProfile(loadedProfile);

      // Also look up raw record for modal compatibility
      const all = getCaregiversFromStorage();
      let found = all.find(
        (c) =>
          c.id.toLowerCase() === caregiverId.toLowerCase() ||
          (c.id.replace(/\D/g, "") && c.id.replace(/\D/g, "") === caregiverId.replace(/\D/g, ""))
      );
      if (!found) {
        found =
          INITIAL_CAREGIVERS.find(
            (c) =>
              c.id.toLowerCase() === caregiverId.toLowerCase() ||
              (c.id.replace(/\D/g, "") && c.id.replace(/\D/g, "") === caregiverId.replace(/\D/g, ""))
          ) || INITIAL_CAREGIVERS[0];
      }
      setRawRecord(found);
    };

    refreshData();

    // Subscribe to intake conversions and live entity updates
    const unsubscribe = subscribeToIntakeSync(() => {
      refreshData();
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lilisare_caregivers_v1" || e.key === "lilisare_clients_records") {
        refreshData();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const match = CAREGIVER_DETAIL_TABS.find(
        (t) =>
          t.id === tabParam.toLowerCase() ||
          t.label.toLowerCase() === tabParam.toLowerCase() ||
          t.id.replace("-", "") === tabParam.toLowerCase().replace("-", "")
      );
      if (match) setActiveTab(match.id);
    }

    if (searchParams.get("mode") === "edit" || initialEditMode) {
      setIsEditingProfile(true);
      setActiveTab("profile");
    }

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [caregiverId, searchParams, initialEditMode]);

  if (!isMounted || !profile) {
    return (
      <div className="w-full max-w-9xl mx-auto py-16 text-center text-slate-500">
        <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">Loading Caregiver Profile...</p>
      </div>
    );
  }

  const initials = profile.name
    .replace(/^The\s+/i, "")
    .slice(0, 2)
    .toUpperCase();

  const statusBadge = getStatusBadge(profile.status);

  // Split tabs into visible & overflow (More)
  const visibleTabs = allowedTabs.slice(0, visibleCount);
  const overflowTabs = allowedTabs.slice(visibleCount);
  const isOverflowActive = overflowTabs.some((t) => t.id === activeTab);
  const activeOverflowTab = overflowTabs.find((t) => t.id === activeTab);

  const handleSelectTab = (tabId: CaregiverDetailTabType) => {
    setActiveTab(tabId);
    setIsMoreOpen(false);
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-5 pb-16 animate-in fade-in duration-200">
      {/* 01. Back Navigation Link */}
      <div>
        <Link
          href="/admin/caregivers"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Caregivers Directory</span>
        </Link>
      </div>

      {/* 02. Caregiver Hero Identity Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar Box with Initials & Dynamic Status Badge */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20 flex items-center justify-center text-xl font-bold">
              {initials}
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
                {profile.name}
              </h1>
              <span className="text-xs  font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                #{profile.numericId || profile.id}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 flex-wrap text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#3D6B22] border border-emerald-200/80">
                {profile.role}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-medium">{profile.branch}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Control */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <CalendarPlus className="w-4 h-4 text-emerald-200" />
            <span>Schedule Shift</span>
          </button>
        </div>
      </div>

      {/* 02b. Secondary Caregiver Actions Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Caregiver Quick Actions</h2>
          <p className="text-xs text-slate-500 mt-0.5">Direct communication and lifecycle controls</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsContactModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>Send Message</span>
          </button>

          {perms.caregivers.canDelete && (
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

      {/* 03. Responsive Space-Aware Tab Strip (The 13 Caregiver Details Tabs) */}
      <div className="relative">
        {/* Hidden measurement row for pixel-perfect dynamic overflow calculation */}
        <div
          ref={measureContainerRef}
          aria-hidden="true"
          className="absolute -top-[9999px] -left-[9999px] pointer-events-none flex items-center gap-1 opacity-0 z-[-1]"
        >
          {CAREGIVER_DETAIL_TABS.map((tab) => (
            <div
              key={`measure-${tab.id}`}
              className="px-3 sm:px-3.5 py-2 text-xs font-bold tracking-tight whitespace-nowrap rounded-xl shrink-0"
            >
              <span>{tab.label}</span>
            </div>
          ))}
          {/* Measure reference for the "MORE (13) ▾" template */}
          <div className="px-3 sm:px-3.5 py-2 text-xs font-bold tracking-tight whitespace-nowrap rounded-xl flex items-center gap-1.5 border shrink-0">
            <span>MORE (13)</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Dynamic Space-Aware Tab Navigation Strip: "More" is directly adjacent with zero empty gap */}
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
                  ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Collapsed Overflow Tabs Dropdown Menu (Directly adjacent to visible tabs without gap) */}
          {overflowTabs.length > 0 && (
            <div ref={moreDropdownRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${isOverflowActive
                  ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20"
                  : isMoreOpen
                    ? "bg-slate-100 text-slate-900 border border-slate-300"
                    : "text-slate-700 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 hover:text-slate-900"
                  }`}
                aria-expanded={isMoreOpen}
                aria-label="More caregiver detail tabs"
              >
                <span>
                  {isOverflowActive && activeOverflowTab
                    ? `MORE: ${activeOverflowTab.label}`
                    : `MORE (${overflowTabs.length})`}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu Popover */}
              {isMoreOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-64 max-w-[calc(100vw-32px)] bg-white rounded-2xl border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 p-2 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Additional Tabs</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                      {overflowTabs.length} tabs
                    </span>
                  </div>

                  <div className="py-1 max-h-80 overflow-y-auto space-y-0.5">
                    {overflowTabs.map((tab) => {
                      const isTabActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleSelectTab(tab.id)}
                          className={`w-full text-left px-3.5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-between ${isTabActive
                            ? "bg-[#3D6B22]/10 text-[#3D6B22]"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                          <span>{tab.label}</span>
                          {isTabActive && <div className="w-1.5 h-1.5 rounded-full bg-[#3D6B22]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 04. Tab Content Panel (All 13 Tabs) */}
      <div className="mt-2">
        {/* 1. PROFILE */}
        {activeTab === "profile" && (
          <CaregiverProfileTab
            profile={profile}
            isEditing={isEditingProfile}
            onToggleEdit={setIsEditingProfile}
            onProfileUpdated={(updated) => setProfile(updated)}
          />
        )}

        {/* 2. CALENDAR */}
        {activeTab === "calendar" && (
          <CaregiverCalendarTab
            profile={profile}
            onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
          />
        )}

        {/* 3. COMPLIANCE */}
        {activeTab === "compliance" && <CaregiverComplianceTab profile={profile} />}

        {/* 4. AVAILABILITY BLOCKS */}
        {activeTab === "availability-blocks" && (
          <CaregiverAvailabilityTab profile={profile} />
        )}

        {/* 5. PAY DETAILS */}
        {activeTab === "pay-details" && <CaregiverPayDetailsTab profile={profile} />}

        {/* 6. DOCUMENTS */}
        {activeTab === "documents" && <CaregiverDocumentsTab profile={profile} />}

        {/* 7. ATTRIBUTES (Faithful to Reference Image 1) */}
        {activeTab === "attributes" && (
          <CaregiverAttributesTab
            profile={profile}
            onUpdateProfile={(updated) => setProfile(updated)}
          />
        )}

        {/* 8. FORMS */}
        {activeTab === "forms" && <CaregiverFormsTab profile={profile} />}

        {/* 9. CUSTOM FIELDS */}
        {activeTab === "custom-fields" && <CaregiverCustomFieldsTab profile={profile} />}

        {/* 10. EMERGENCY CONTACT */}
        {activeTab === "emergency-contact" && (
          <CaregiverEmergencyContactTab profile={profile} />
        )}

        {/* 11. POINTS */}
        {activeTab === "points" && <CaregiverPointsTab profile={profile} />}

        {/* 12. NOTE LIST */}
        {activeTab === "note-list" && <CaregiverNoteListTab profile={profile} />}

        {/* 13. MYAGENCY */}
        {activeTab === "myagency" && <CaregiverMyAgencyTab profile={profile} />}
      </div>

      {/* Modals for Shift Scheduling and Communication */}
      {rawRecord && (
        <>
          <CaregiverContactModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            caregiver={rawRecord}
            onLogCommunication={(_id, type, note) => {
              toast.success(`Logged ${type.toUpperCase()} for ${profile.name}`);
            }}
          />
          <CaregiverScheduleShiftModal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            caregiver={rawRecord}
            onScheduleShift={(_id, shift) => {
              toast.success(`Scheduled ${shift.type || "shift"} with ${shift.clientName}`);
            }}
          />
        </>
      )}

      {perms.caregivers.canDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Caregiver Record"
          description="Permanent deletion removes this caregiver across both Agency Admin and Intake directories."
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          maxWidth="sm"
        >
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-slate-900">{profile.name}</strong> ({profile.id})?
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
                deleteCaregiverFromStorage(profile.id);
                setIsDeleteModalOpen(false);
                toast.success(`Caregiver ${profile.name} permanently deleted.`);
                router.push("/admin/caregivers");
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
