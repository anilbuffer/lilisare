"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Home,
  CheckCircle2,
  Edit3,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  Phone,
  Mail,
  CalendarPlus,
  Lock,
  Sparkles,
  Stethoscope,
  Clock,
  Receipt,
  UserCheck,
} from "lucide-react";
import { getClientById, getClientsFromStorage, saveClientsToStorage } from "@/lib/clients/mockData";
import { ClientRecord, ClientStatus } from "@/types/client";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";
import { toast } from "sonner";
import { ClientContactFamilyModal } from "@/components/clients/modals/ClientContactFamilyModal";
import { ClientScheduleVisitModal } from "@/components/clients/modals/ClientScheduleVisitModal";

// Tab Components
import { ClientProfileTab } from "./tabs/ClientProfileTab";
import { ClientCalendarTab } from "./tabs/ClientCalendarTab";
import { ClientSchedulesTab } from "./tabs/ClientSchedulesTab";
import { ClientCareNotesTab } from "./tabs/ClientCareNotesTab";
import { ClientNotesTab } from "./tabs/ClientNotesTab";
import { ClientRespPartiesTab } from "./tabs/ClientRespPartiesTab";
import { ClientBillingTab } from "./tabs/ClientBillingTab";
import { ClientWalletTab } from "./tabs/ClientWalletTab";
import { ClientTransactionsTab } from "./tabs/ClientTransactionsTab";
import { ClientDocumentsTab } from "./tabs/ClientDocumentsTab";
import { ClientHealthcareTab } from "./tabs/ClientHealthcareTab";
import { ClientIncidentsTab } from "./tabs/ClientIncidentsTab";
import { ClientAdlsTab } from "./tabs/ClientAdlsTab";
import { ClientPlanOfCareTab } from "./tabs/ClientPlanOfCareTab";
import { ClientAttributesTab } from "./tabs/ClientAttributesTab";
import { ClientFormsTab } from "./tabs/ClientFormsTab";
import { ClientMoreTab } from "./tabs/ClientMoreTab";

export type PortalRole =
  | "admin"
  | "intake"
  | "scheduler"
  | "billing"
  | "clinical"
  | "compliance";

export type ClientDomainTab =
  | "profile"
  | "calendar"
  | "schedules"
  | "care-notes"
  | "notes"
  | "resp-parties"
  | "billing"
  | "wallet"
  | "transactions"
  | "documents"
  | "healthcare"
  | "incidents"
  | "adls"
  | "plan-of-care"
  | "attributes"
  | "forms"
  | "more";

export interface DomainTabDef {
  id: ClientDomainTab;
  label: string;
  badge?: string;
  allowedRoles?: PortalRole[];
  readOnlyFor?: PortalRole[];
}

export const ALL_DOMAIN_TABS: DomainTabDef[] = [
  { id: "profile", label: "PROFILE" },
  { id: "calendar", label: "CALENDAR" },
  { id: "schedules", label: "SCHEDULES" },
  { id: "care-notes", label: "CARE NOTES" },
  { id: "notes", label: "NOTES" },
  { id: "resp-parties", label: "RESP. PARTIES" },
  { id: "billing", label: "BILLING", readOnlyFor: ["intake", "scheduler"] },
  { id: "wallet", label: "WALLET", readOnlyFor: ["intake", "scheduler", "clinical"] },
  { id: "transactions", label: "TRANSACTIONS", readOnlyFor: ["intake", "scheduler", "clinical"] },
  { id: "documents", label: "DOCUMENTS" },
  { id: "healthcare", label: "HEALTHCARE", readOnlyFor: ["billing"] },
  { id: "incidents", label: "INCIDENTS" },
  { id: "adls", label: "ADLS", readOnlyFor: ["billing"] },
  { id: "plan-of-care", label: "PLAN OF CARE", readOnlyFor: ["billing"] },
  { id: "attributes", label: "ATTRIBUTES" },
  { id: "forms", label: "FORMS" },
  { id: "more", label: "AUDIT & LIFECYCLE" },
];

const TAB_MIN_WIDTHS: Record<ClientDomainTab, number> = {
  profile: 88,
  calendar: 98,
  schedules: 112,
  "care-notes": 115,
  notes: 82,
  "resp-parties": 135,
  billing: 92,
  wallet: 88,
  transactions: 142,
  documents: 115,
  healthcare: 132,
  incidents: 110,
  adls: 82,
  "plan-of-care": 138,
  attributes: 118,
  forms: 88,
  more: 175, // "AUDIT & LIFECYCLE"
};
const MORE_BUTTON_MIN_WIDTH = 125;

interface AdminClientDetailViewProps {
  clientId: string;
  baseBackPath?: string;
  userRole?: PortalRole;
}

export function AdminClientDetailView({
  clientId,
  baseBackPath = "/admin/clients",
  userRole: propUserRole,
}: AdminClientDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const perms = usePortalPermissions();

  // Infer role from prop, RBAC session, or path
  const currentRole: PortalRole = React.useMemo(() => {
    if (propUserRole) return propUserRole;
    if (perms.isIntakeCoordinator) return "intake";
    if (pathname.includes("/intake") || baseBackPath.includes("/intake")) return "intake";
    if (pathname.includes("/scheduler") || baseBackPath.includes("/scheduler")) return "scheduler";
    if (pathname.includes("/billing") || baseBackPath.includes("/billing")) return "billing";
    if (pathname.includes("/clinical") || baseBackPath.includes("/clinical")) return "clinical";
    if (pathname.includes("/compliance") || baseBackPath.includes("/compliance")) return "compliance";
    return "admin";
  }, [propUserRole, perms.isIntakeCoordinator, pathname, baseBackPath]);

  // Determine initial landing tab based on role
  const getDefaultTabForRole = (role: PortalRole): ClientDomainTab => {
    switch (role) {
      case "scheduler":
        return "schedules";
      case "clinical":
        return "healthcare";
      case "billing":
        return "billing";
      case "compliance":
        return "documents";
      case "intake":
      case "admin":
      default:
        return "profile";
    }
  };

  const [client, setClient] = useState<ClientRecord | null>(null);
  const [activeTab, setActiveTab] = useState<ClientDomainTab>(getDefaultTabForRole(currentRole));
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Tab Strip Refs & Dynamic Space-Aware Responsive Overflow State
  const tabStripRef = useRef<HTMLDivElement>(null);
  const measureContainerRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(12);

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
      // Subtract container horizontal padding (p-1.5 = 12px) plus safety buffer
      const availableWidth = containerWidth - 20;
      if (availableWidth <= 0) return;

      const measureChildren = measureContainerRef.current
        ? (Array.from(measureContainerRef.current.children) as HTMLElement[])
        : [];

      // The last child in the measure container is the "MORE (17) ▾" template button
      const moreMeasureEl = measureChildren.length > 0 ? measureChildren[measureChildren.length - 1] : null;
      const measuredMoreWidth = moreMeasureEl ? moreMeasureEl.getBoundingClientRect().width : 0;
      const moreWidth = Math.max(measuredMoreWidth, MORE_BUTTON_MIN_WIDTH);

      // The first 17 children are the tab buttons
      const tabElements = measureChildren.slice(0, ALL_DOMAIN_TABS.length);
      const tabWidths = ALL_DOMAIN_TABS.map((tab, idx) => {
        const measured = tabElements[idx]?.getBoundingClientRect().width || 0;
        return Math.max(measured, TAB_MIN_WIDTHS[tab.id] || 90);
      });

      const GAP = 4; // gap-1 in Tailwind is 4px

      // 1. Check if ALL tabs fit cleanly with a 32px comfortable safety buffer
      const totalAllWidth = tabWidths.reduce((acc, w, idx) => acc + w + (idx > 0 ? GAP : 0), 0);
      if (availableWidth >= totalAllWidth + 32) {
        setVisibleCount(ALL_DOMAIN_TABS.length);
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

      // Strictly ensure that in overflow mode, count is capped at ALL_DOMAIN_TABS.length - 1
      // so [AUDIT & LIFECYCLE] (tab 17) is always clubbed into MORE whenever device width cannot fit all tabs.
      setVisibleCount(Math.min(ALL_DOMAIN_TABS.length - 1, Math.max(1, count)));
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
  }, [currentRole]);

  useEffect(() => {
    const found = getClientById(clientId);
    if (found) {
      setClient(found);
    }
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const match = ALL_DOMAIN_TABS.find(
        (t) => t.id === tabParam.toLowerCase() || t.label.toLowerCase() === tabParam.toLowerCase()
      );
      if (match) setActiveTab(match.id);
    }
  }, [clientId, searchParams]);

  if (!client) {
    return (
      <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Client Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          Client ID &quot;{clientId}&quot; does not exist or has been removed.
        </p>
        <Link
          href={baseBackPath}
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#3D6B22] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients Directory</span>
        </Link>
      </div>
    );
  }

  const clientInitials = client.name
    .replace(/^The\s+/i, "")
    .slice(0, 2)
    .toUpperCase();

  const handleUpdateStatus = (newStatus: ClientStatus) => {
    const updated: ClientRecord = {
      ...client,
      status: newStatus,
      updatedAtRelative: "Just now",
      activity: [
        {
          id: `act-${Date.now()}`,
          timestamp: "Just now",
          type: "status_change",
          author: `${currentRole.toUpperCase()} User`,
          authorRole: "Operational Administrator",
          title: `Status Changed to ${newStatus}`,
          details: `Client status was manually transitioned to ${newStatus}.`,
        },
        ...client.activity,
      ],
    };
    setClient(updated);
    setIsStatusDropdownOpen(false);

    const all = getClientsFromStorage();
    const index = all.findIndex((c) => c.id === client.id);
    if (index !== -1) {
      all[index] = updated;
      saveClientsToStorage(all);
    }
    toast.success(`Client status updated to ${newStatus}`);
  };

  const handleUpdateClient = (updated: ClientRecord) => {
    setClient(updated);
  };

  // Role Metadata Badge Config
  const roleDisplayNames: Record<PortalRole, { title: string; color: string; desc: string }> = {
    admin: {
      title: "Agency Administrator",
      color: "bg-[#3D6B22] text-white",
      desc: "Full Operational & Financial Authority (All 17 Domains)",
    },
    intake: {
      title: "Intake Coordinator",
      color: "bg-teal-700 text-white",
      desc: "Client Onboarding & Demographics Focus (Read-only Billing)",
    },
    scheduler: {
      title: "Care Scheduler & Coordinator",
      color: "bg-blue-700 text-white",
      desc: "Shift Rostering & Caregiver Attributes Matching Focus",
    },
    billing: {
      title: "Billing & Financial Specialist",
      color: "bg-indigo-700 text-white",
      desc: "Payer Authorizations, Claims & Wallet Ledger Focus",
    },
    clinical: {
      title: "Supervising RN & Clinical Lead",
      color: "bg-emerald-800 text-white",
      desc: "Person-Centered Care Plan, ADLs & Medical Orders Focus",
    },
    compliance: {
      title: "Quality & Compliance Officer",
      color: "bg-slate-800 text-white",
      desc: "Regulatory Audits, Incidents & Immutable Timeline Focus",
    },
  };

  const activeRoleMeta = roleDisplayNames[currentRole];

  return (
    <div className="w-full max-w-9xl mx-auto space-y-4 pb-16 animate-in fade-in duration-300">
      {/* =========================================================================
          TOP NAVIGATION BREADCRUMB
         ========================================================================= */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href={baseBackPath}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Directory</span>
        </Link>
      </div>

      {/* =========================================================================
          01. HERO IDENTITY CARD (With Right-Aligned Schedule Shift Action)
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            {/* Row 1: Client Name and ID pill */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {client.name}
              </h1>
              <span className=" font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg text-xs border border-slate-200/80">
                {client.id}
              </span>
            </div>

            {/* Row 2: Program Badge */}
            <div className="mt-0.5 flex items-center gap-2.5 flex-wrap text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#3D6B22] border border-emerald-200/80">
                {client.carePlan?.program || "Pediatric In-Home Care"}
              </span>
            </div>
          </div>

          {/* Right-Aligned Schedule Shift Action Button */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-sm shadow-[#3D6B22]/20 hover:shadow-md transition-all active:scale-95 cursor-pointer"
              title="Schedule Shift"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Schedule Shift</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02. RESPONSIVE 17-DOMAIN TAB NAVIGATION STRIP (Auto-Collapsing "More" Dropdown)
         ========================================================================= */}
      {(() => {
        const visibleTabs = ALL_DOMAIN_TABS.slice(0, visibleCount);
        const collapsedTabs = ALL_DOMAIN_TABS.slice(visibleCount);
        const activeCollapsedTab = collapsedTabs.find((t) => t.id === activeTab);
        const isMoreActive = Boolean(activeCollapsedTab);

        return (
          <>
            {/* Hidden Measurement Row for Pixel-Perfect Dynamic Overflow Calculation */}
            <div
              ref={measureContainerRef}
              aria-hidden="true"
              className="absolute -top-[9999px] -left-[9999px] invisible pointer-events-none flex items-center gap-1 opacity-0 z-[-1]"
            >
              {ALL_DOMAIN_TABS.map((tab) => {
                const isReadOnlyForRole = tab.readOnlyFor?.includes(currentRole);
                return (
                  <div
                    key={`measure-${tab.id}`}
                    className="px-3 sm:px-3.5 py-2 text-xs font-bold tracking-wide whitespace-nowrap rounded-xl flex items-center gap-1.5 shrink-0"
                  >
                    <span>{tab.label}</span>
                    {isReadOnlyForRole && (
                      <span className="text-[9px] px-1 py-0.2 rounded font-normal">
                        VIEW
                      </span>
                    )}
                  </div>
                );
              })}
              {/* Measure reference for the "MORE (17) ▾" template */}
              <div className="px-3 sm:px-3.5 py-2 text-xs font-bold tracking-wide whitespace-nowrap rounded-xl flex items-center gap-1.5 border shrink-0">
                <span>MORE (17)</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Dynamic Space-Aware Tab Navigation Strip: "More" is directly adjacent with zero empty gap */}
            <div
              ref={tabStripRef}
              className="relative w-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-2xl border border-slate-200 p-1.5 flex items-center gap-1"
            >
              {/* Front Visible Tabs (Exact count calculated to fit cleanly within available container width) */}
              {visibleTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const isReadOnlyForRole = tab.readOnlyFor?.includes(currentRole);

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMoreOpen(false);
                    }}
                    className={`relative shrink-0 px-3 sm:px-3.5 py-2 text-xs font-bold tracking-wide transition-all whitespace-nowrap rounded-xl cursor-pointer flex items-center gap-1.5 ${isActive
                      ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/30 scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                      }`}
                  >
                    <span>{tab.label}</span>
                    {isReadOnlyForRole && (
                      <span
                        title="Read-Only for your role"
                        className={`text-[9px] px-1 py-0.2 rounded font-normal ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                          }`}
                      >
                        VIEW
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Collapsed Overflow Tabs Dropdown Menu (Directly adjacent to visible tabs without gap) */}
              {collapsedTabs.length > 0 && (
                <div ref={moreDropdownRef} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className={`px-3 sm:px-3.5 py-2 text-xs font-bold tracking-wide transition-all whitespace-nowrap rounded-xl cursor-pointer flex items-center gap-1.5 ${isMoreActive
                      ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/30 scale-[1.02]"
                      : isMoreOpen
                        ? "bg-slate-100 text-slate-900 border border-slate-300"
                        : "text-slate-700 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 hover:text-slate-900"
                      }`}
                    aria-expanded={isMoreOpen}
                    aria-label="More navigation domains"
                  >
                    <span>
                      {isMoreActive && activeCollapsedTab
                        ? `MORE: ${activeCollapsedTab.label}`
                        : `MORE (${collapsedTabs.length})`}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* Dropdown Menu Popover (Right-aligned to remain cleanly visible on all screen sizes) */}
                  {isMoreOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 max-w-[calc(100vw-32px)] bg-white rounded-2xl border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 p-2 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Additional Domains</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                          {collapsedTabs.length} tabs
                        </span>
                      </div>

                      <div className="py-1 max-h-80 overflow-y-auto space-y-0.5">
                        {collapsedTabs.map((tab) => {
                          const isActive = activeTab === tab.id;
                          const isReadOnly = tab.readOnlyFor?.includes(currentRole);

                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => {
                                setActiveTab(tab.id);
                                setIsMoreOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${isActive
                                ? "bg-[#3D6B22] text-white shadow-xs"
                                : "text-slate-700 hover:bg-slate-100/80"
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                                <span>{tab.label}</span>
                              </div>
                              {isReadOnly && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-normal ${isActive
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-100 text-slate-400"
                                    }`}
                                >
                                  VIEW
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        );
      })()}

      {/* =========================================================================
          03. DEDICATED DOMAIN VIEWS (17 Complete Modular Tabs)
         ========================================================================= */}
      <div>
        {/* 1. PROFILE */}
        {activeTab === "profile" && (
          <ClientProfileTab
            client={client}
            onUpdateClient={handleUpdateClient}
            userRole={currentRole}
            onOpenContactFamily={() => setIsContactModalOpen(true)}
            onOpenScheduleVisit={() => setIsScheduleModalOpen(true)}
          />
        )}

        {/* 2. CALENDAR */}
        {activeTab === "calendar" && (
          <ClientCalendarTab
            client={client}
            onOpenScheduleVisit={() => setIsScheduleModalOpen(true)}
          />
        )}

        {/* 3. SCHEDULES */}
        {activeTab === "schedules" && (
          <ClientSchedulesTab
            client={client}
            onOpenScheduleVisit={() => setIsScheduleModalOpen(true)}
          />
        )}

        {/* 4. CARE NOTES */}
        {activeTab === "care-notes" && (
          <ClientCareNotesTab
            client={client}
            userRole={currentRole}
            onUpdateClient={handleUpdateClient}
          />
        )}

        {/* 5. NOTES */}
        {activeTab === "notes" && (
          <ClientNotesTab client={client} onUpdateClient={handleUpdateClient} />
        )}

        {/* 6. RESP. PARTIES */}
        {activeTab === "resp-parties" && (
          <ClientRespPartiesTab
            client={client}
            onUpdateClient={handleUpdateClient}
          />
        )}

        {/* 7. BILLING */}
        {activeTab === "billing" && (
          <ClientBillingTab
            client={client}
            userRole={currentRole}
            onUpdateClient={handleUpdateClient}
          />
        )}

        {/* 8. WALLET */}
        {activeTab === "wallet" && (
          <ClientWalletTab
            client={client}
            userRole={currentRole}
            onUpdateClient={handleUpdateClient}
          />
        )}

        {/* 9. TRANSACTIONS */}
        {activeTab === "transactions" && (
          <ClientTransactionsTab
            client={client}
            userRole={currentRole}
          />
        )}

        {/* 10. DOCUMENTS */}
        {activeTab === "documents" && (
          <ClientDocumentsTab
            client={client}
            onUpdateClient={handleUpdateClient}
          />
        )}

        {/* 11. HEALTHCARE */}
        {activeTab === "healthcare" && (
          <ClientHealthcareTab
            client={client}
            userRole={currentRole}
            onUpdateClient={handleUpdateClient}
          />
        )}

        {/* 12. INCIDENTS */}
        {activeTab === "incidents" && (
          <ClientIncidentsTab
            client={client}
            onUpdateClient={handleUpdateClient}
          />
        )}

        {/* 13. ADLS */}
        {activeTab === "adls" && (
          <ClientAdlsTab
            client={client}
            onUpdateClient={handleUpdateClient}
          />
        )}

        {/* 14. PLAN OF CARE */}
        {activeTab === "plan-of-care" && (
          <ClientPlanOfCareTab
            client={client}
            userRole={currentRole}
            onUpdateClient={handleUpdateClient}
          />
        )}

        {/* 15. ATTRIBUTES */}
        {activeTab === "attributes" && (
          <ClientAttributesTab client={client} onUpdateClient={handleUpdateClient} />
        )}

        {/* 16. FORMS */}
        {activeTab === "forms" && (
          <ClientFormsTab
            client={client}
            onUpdateClient={handleUpdateClient}
          />
        )}

        {/* 17. MORE */}
        {activeTab === "more" && (
          <ClientMoreTab
            client={client}
            onUpdateClient={handleUpdateClient}
            canDischarge={perms.clients.canDischarge}
            canDelete={perms.clients.canDelete}
            baseBackPath={baseBackPath}
          />
        )}
      </div>

      {/* =========================================================================
          MODALS
         ========================================================================= */}
      <ClientContactFamilyModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        client={client}
        onLogCommunication={(cId, type, text) => {
          const newNote = {
            id: `NOT-${Date.now()}`,
            timestamp: "Just now",
            author: `${activeRoleMeta.title}`,
            authorRole: "Operational Staff",
            category: type === "call" ? ("Family Communication" as const) : ("Coordination" as const),
            title: type === "call" ? "Phone Call Logged" : "Communication Recorded",
            content: text,
            isPinned: false,
          };
          const updated = {
            ...client,
            notes: [newNote, ...(client.notes || [])],
            updatedAtRelative: "Just now",
          };
          setClient(updated);
          const all = getClientsFromStorage();
          const idx = all.findIndex((c) => c.id === client.id);
          if (idx !== -1) {
            all[idx] = updated;
            saveClientsToStorage(all);
          }
          toast.success("Family communication logged.");
        }}
      />

      <ClientScheduleVisitModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        client={client}
        onConfirmSchedule={(clientId, details) => {
          toast.success(`Visit scheduled for ${details.scheduledDate}`);
          setIsScheduleModalOpen(false);
        }}
      />
    </div>
  );
}
