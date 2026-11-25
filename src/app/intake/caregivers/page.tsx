"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Calendar,
  ChevronDown,
  Check,
  FolderInput,
  UserPlus,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import { CaregiverRecord } from "@/types/caregiver";
import {
  getCaregiversFromStorage,
  INITIAL_CAREGIVERS,
} from "@/lib/caregivers/mockData";
import { subscribeToIntakeSync } from "@/lib/intake/intakeSync";
import { CaregiverKpiStrip } from "@/components/caregivers/CaregiverKpiStrip";
import { CaregiverManagementWorkspace } from "@/components/caregivers/CaregiverManagementWorkspace";
import { CaregiverContextualDrawer } from "@/components/caregivers/CaregiverContextualDrawer";
import { toast } from "sonner";

export default function IntakeCaregiversPage() {
  const router = useRouter();

  const [caregivers, setCaregivers] = useState<CaregiverRecord[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Filter States
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);
  const [activeAttentionCategory, setActiveAttentionCategory] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState("30d");

  // Dropdown states for header controls
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const addMenuRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  const dateOptions = [
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
    { id: "90d", label: "Last 90 Days" },
    { id: "ytd", label: "Year to Date" },
  ];

  // Contextual Profile Drawer (Caregiver Overview Quick Inspector)
  const [selectedCaregiver, setSelectedCaregiver] = useState<CaregiverRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setCaregivers(getCaregiversFromStorage());

    const unsubscribe = subscribeToIntakeSync(() => {
      setCaregivers(getCaregiversFromStorage());
    });

    function handleClickOutside(event: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectCaregiver = (cg: CaregiverRecord) => {
    router.push(`/intake/caregivers/${cg.id}`);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const needsAttentionCount = caregivers.filter(
    (cg) =>
      cg.status === "On Hold" ||
      cg.status === "Pending" ||
      cg.documentsCredentials?.overallStatus === "Expired" ||
      cg.documentsCredentials?.overallStatus === "Missing" ||
      cg.verificationChecklist?.screening !== "Cleared" ||
      cg.verificationChecklist?.training !== "Complete"
  ).length;

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 01. Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Intake Caregivers
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Date Range Filter */}
          <div className="relative" ref={dateRef}>
            <button
              type="button"
              onClick={() => setIsDateOpen(!isDateOpen)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateOptions.find((d) => d.id === selectedDateRange)?.label || "Date Range"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isDateOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedDateRange(opt.id);
                      setIsDateOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between cursor-pointer ${selectedDateRange === opt.id
                      ? "bg-[#F2F8EE] text-[#3D6B22] font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    <span>{opt.label}</span>
                    {selectedDateRange === opt.id && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Caregiver CTA (Dedicated Action) */}
          <div className="relative" ref={addMenuRef}>
            <button
              type="button"
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3D6B22] hover:bg-[#345C1D] text-white text-xs font-bold rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add Caregiver</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/80" />
            </button>

            {isAddMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-30 animate-fadeIn text-xs">
                <Link
                  href="/intake/caregivers/new?pathway=direct"
                  onClick={() => setIsAddMenuOpen(false)}
                  className="block px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#3D6B22]" />
                    <span className="font-bold text-slate-900">Register New Caregiver</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 pl-6">
                    Direct registration for family or professional caregivers
                  </p>
                </Link>

                <div className="h-px bg-slate-100 my-1" />

                <Link
                  href="/intake/caregivers/new?pathway=convert"
                  onClick={() => setIsAddMenuOpen(false)}
                  className="block px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FolderInput className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900">Convert Application</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 pl-6">
                    Convert candidate from onboarding pipeline to prevent duplicates
                  </p>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 02. KPI Strip - 4 clean dashboard cards matching Agency Admin /caregivers */}
      <CaregiverKpiStrip
        caregivers={caregivers}
        activeStatusFilter={selectedStatusFilter || "ALL"}
        onSelectStatus={(status) => {
          if (status === "ALL" || selectedStatusFilter === status) {
            setSelectedStatusFilter(null);
          } else {
            setSelectedStatusFilter(status);
          }
          if (activeAttentionCategory) setActiveAttentionCategory(null);
        }}
        needsAttentionCount={needsAttentionCount}
      />

      {/* 03. Caregiver Directory Management Workspace (Default List View with Kanban toggle) */}
      <div id="intake-caregiver-directory-anchor">
        <CaregiverManagementWorkspace
          caregivers={caregivers}
          selectedStatusFilter={selectedStatusFilter}
          onSelectStatusFilter={setSelectedStatusFilter}
          selectedCaregiverId={selectedCaregiver?.id || null}
          onSelectCaregiver={handleSelectCaregiver}
          activeAttentionCategory={activeAttentionCategory}
          onClearAttentionCategory={() => setActiveAttentionCategory(null)}
          baseDetailsPath="/intake/caregivers"
          initialViewMode="list"
        />
      </div>

      {/* Contextual Quick Inspector Drawer */}
      <CaregiverContextualDrawer
        caregiver={selectedCaregiver}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onEditCaregiver={(cg) => router.push(`/intake/caregivers/${cg.id}/edit`)}
      />
    </div>
  );
}
