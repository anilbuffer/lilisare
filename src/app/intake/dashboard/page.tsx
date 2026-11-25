"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Calendar,
  Plus,
  Inbox,
  ChevronDown,
  ExternalLink,
  ChevronRight,
  Kanban,
} from "lucide-react";

import { InquiryRecord } from "@/types/intake";
import { ClientRecord } from "@/types/client";
import { CaregiverRecord } from "@/types/caregiver";
import { Household } from "@/lib/households/mockData";

import {
  getIntakeInquiriesFromStorage,
  saveIntakeInquiriesToStorage,
  subscribeToIntakeSync,
} from "@/lib/intake/intakeSync";
import { getClientsFromStorage } from "@/lib/clients/mockData";
import { getHouseholdsFromStorage } from "@/lib/households/mockData";
import { getCaregiversFromStorage } from "@/lib/caregivers/mockData";

import { IntakeKpiRow } from "@/components/intake/dashboard/IntakeKpiRow";
import { IntakeAttentionQueue } from "@/components/intake/dashboard/IntakeAttentionQueue";
import { IntakePipelineFunnelCard } from "@/components/intake/dashboard/IntakePipelineFunnelCard";
import { IntakeAssessmentsCard } from "@/components/intake/dashboard/IntakeAssessmentsCard";
import { IntakeLiveActivityFeed } from "@/components/intake/dashboard/IntakeLiveActivityFeed";
import { IntakeAiBriefingDrawer } from "@/components/intake/dashboard/IntakeAiBriefingDrawer";

import { ConvertToOnboardingModal } from "@/components/intake/modals/ConvertToOnboardingModal";
import { ContactFamilyModal } from "@/components/intake/modals/ContactFamilyModal";
import { ScheduleAssessmentModal } from "@/components/intake/modals/ScheduleAssessmentModal";

export default function IntakeDashboardPage() {
  const router = useRouter();

  // ----------------------------------------------------
  // Live Synced State from Shared LiliSare Storage
  // ----------------------------------------------------
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverRecord[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals & AI Briefing Drawer state
  const [isAiBriefingOpen, setIsAiBriefingOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedInquiryForConvert, setSelectedInquiryForConvert] = useState<InquiryRecord | null>(null);
  const [selectedInquiryForContact, setSelectedInquiryForContact] = useState<InquiryRecord | null>(null);
  const [selectedInquiryForSchedule, setSelectedInquiryForSchedule] = useState<InquiryRecord | null>(null);

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  // Initial Load & Synchronisation Subscription
  const reloadAllSyncedData = () => {
    setIsSyncing(true);
    setInquiries(getIntakeInquiriesFromStorage());
    setClients(getClientsFromStorage());
    setHouseholds(getHouseholdsFromStorage());
    setCaregivers(getCaregiversFromStorage());
    setLastSyncTime(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
    setTimeout(() => setIsSyncing(false), 250);
  };

  useEffect(() => {
    reloadAllSyncedData();
    const unsubscribe = subscribeToIntakeSync(() => {
      reloadAllSyncedData();
    });
    return unsubscribe;
  }, []);

  // Dropdown outside click handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle contact log
  const handleLogCommunication = (inquiryId: string, type: "call" | "email" | "note", note: string) => {
    const updated = inquiries.map((inq) => {
      if (inq.id === inquiryId) {
        return {
          ...inq,
          timeline: [
            {
              id: `t-${Date.now()}`,
              type,
              author: "Intake Coordinator",
              timestamp: "Just now",
              title: `Logged ${type.toUpperCase()}`,
              details: note,
            },
            ...(inq.timeline || []),
          ],
        };
      }
      return inq;
    });
    saveIntakeInquiriesToStorage(updated);
    setInquiries(updated);
  };

  // Handle schedule assessment
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
    const updated = inquiries.map((inq) => {
      if (inq.id === inquiryId) {
        return {
          ...inq,
          assessmentStatus: "Scheduled" as const,
          assessmentDetails: details,
          stage: "Needs Discussion" as const,
          timeline: [
            {
              id: `t-${Date.now()}`,
              type: "assessment" as const,
              author: "Intake Coordinator",
              timestamp: "Just now",
              title: "Clinical Assessment Scheduled",
              details: `${details.type} with ${details.assessor} on ${details.scheduledDate} at ${details.scheduledTime}`,
            },
            ...(inq.timeline || []),
          ],
        };
      }
      return inq;
    });
    saveIntakeInquiriesToStorage(updated);
    setInquiries(updated);
  };

  // ----------------------------------------------------
  // Computed Metrics
  // ----------------------------------------------------
  const metrics = useMemo(() => {
    const urgentInquiries = inquiries.filter(
      (i) => i.urgency === "Urgent" || i.urgency === "Immediate" || i.source === "Hospital Discharge"
    );
    const newLeads = inquiries.filter((i) => i.stage === "New Inquiry" || i.stage === "New Lead");
    const converted = inquiries.filter((i) => i.stage === "Converted");
    const onboardingClients = clients.filter((c) => c.status === "Onboarding");
    const bottleneckHouseholds = households.filter((h) => Boolean(h.triJourneyStatus?.bottleneckMessage));
    const clearedCaregivers = caregivers.filter(
      (c) => c.verificationChecklist?.screening === "Cleared"
    );
    const caregiverClearedPct = caregivers.length > 0
      ? Math.round((clearedCaregivers.length / caregivers.length) * 100)
      : 92;

    return {
      totalInquiries: inquiries.length,
      urgentInquiries: urgentInquiries.length,
      newLeads: newLeads.length,
      converted: converted.length,
      totalClients: clients.length,
      onboardingClients: onboardingClients.length,
      totalHouseholds: households.length,
      bottlenecks: bottleneckHouseholds.length,
      totalCaregivers: caregivers.length,
      caregiverClearedPct,
    };
  }, [inquiries, clients, households, caregivers]);

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-14 animate-in fade-in duration-300">
      {/* 01. Page Header: Greeting • Date • Quick Actions • AI Briefing (Dedicated to Intake Coordinator Role) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Good morning, Sarah!
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{today}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* New Intake Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#3D6B22]" />
              <span>New Intake</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden text-xs">
                <button
                  onClick={() => {
                    router.push("/intake/inquiries/new");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 font-medium text-slate-700 hover:bg-[#F2F8EE] hover:text-[#3D6B22] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>New Phone / Web Inquiry</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    router.push("/intake/referrals/new");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 font-medium text-slate-700 hover:bg-[#F2F8EE] hover:text-[#3D6B22] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>New Clinical Referral</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <div className="my-1 border-t border-slate-100"></div>
                <button
                  onClick={() => {
                    router.push("/intake/referrals");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-[11px] text-slate-500 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>View All Intake Referrals</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            )}
          </div>

          {/* AI Briefing Button (Mirrors Agency Dashboard exactly) */}
          <button
            onClick={() => setIsAiBriefingOpen(true)}
            className="flex items-center gap-2 bg-[#1B3414] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#274C1D] transition-colors shadow-sm shadow-[#1B3414]/20 whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#93C573]" />
            AI Briefing
          </button>
        </div>
      </div>

      {/* 02. KPI Cards Strip */}
      <section aria-label="Key Performance Indicators">
        <IntakeKpiRow metrics={metrics} />
      </section>

      {/* 03. High-Priority Action Queue ("Needs Your Attention") */}
      <section aria-label="Needs Your Attention">
        <IntakeAttentionQueue
          inquiries={inquiries}
          onContact={(inq) => setSelectedInquiryForContact(inq)}
          onSchedule={(inq) => setSelectedInquiryForSchedule(inq)}
          onConvert={(inq) => setSelectedInquiryForConvert(inq)}
        />
      </section>

      {/* 04. Pipeline Funnel & Clinical RN Assessments (Balanced 2-Column Split) */}
      <section
        aria-label="Intake Pipeline and Clinical RN Assessments"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
      >
        <IntakePipelineFunnelCard inquiries={inquiries} />
        <IntakeAssessmentsCard
          inquiries={inquiries}
          onScheduleAssessment={(inq) => setSelectedInquiryForSchedule(inq)}
        />
      </section>

      {/* 05. Live Intake Activity Feed (Full-Width Enhanced List UI) */}
      <section aria-label="Live Intake Activity Feed">
        <IntakeLiveActivityFeed
          inquiries={inquiries}
          lastSyncTime={lastSyncTime}
          isSyncing={isSyncing}
          onRefreshSync={reloadAllSyncedData}
        />
      </section>

      {/* 06. AI Briefing Slide-over Drawer */}
      <IntakeAiBriefingDrawer
        isOpen={isAiBriefingOpen}
        onClose={() => setIsAiBriefingOpen(false)}
        inquiries={inquiries}
        households={households}
        lastSyncTime={lastSyncTime}
      />

      {/* 07. Live Synchronized Action Modals */}
      {selectedInquiryForConvert && (
        <ConvertToOnboardingModal
          isOpen={Boolean(selectedInquiryForConvert)}
          onClose={() => setSelectedInquiryForConvert(null)}
          inquiry={selectedInquiryForConvert}
          onConfirmConversion={() => {
            reloadAllSyncedData();
            setSelectedInquiryForConvert(null);
          }}
        />
      )}

      {selectedInquiryForContact && (
        <ContactFamilyModal
          isOpen={Boolean(selectedInquiryForContact)}
          onClose={() => setSelectedInquiryForContact(null)}
          inquiry={selectedInquiryForContact}
          onLogCommunication={handleLogCommunication}
        />
      )}

      {selectedInquiryForSchedule && (
        <ScheduleAssessmentModal
          isOpen={Boolean(selectedInquiryForSchedule)}
          onClose={() => setSelectedInquiryForSchedule(null)}
          inquiry={selectedInquiryForSchedule}
          onConfirmSchedule={handleConfirmSchedule}
        />
      )}
    </div>
  );
}
