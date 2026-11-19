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
  CAREGIVER_RECENT_ACTIVITIES,
  INITIAL_CAREGIVERS,
} from "@/lib/caregivers/mockData";
import { CaregiverKpiStrip } from "@/components/caregivers/CaregiverKpiStrip";
import { CaregiverAttentionSection } from "@/components/caregivers/CaregiverAttentionSection";
import { CaregiverRecentActivitySection } from "@/components/caregivers/CaregiverRecentActivitySection";
import { CaregiverManagementWorkspace } from "@/components/caregivers/CaregiverManagementWorkspace";
import { CaregiverContextualDrawer } from "@/components/caregivers/CaregiverContextualDrawer";
import { toast } from "sonner";

export default function CaregiversPage() {
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
    const data = getCaregiversFromStorage();
    setCaregivers(data);

    function handleClickOutside(event: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCaregiver = (cg: CaregiverRecord) => {
    setSelectedCaregiver(cg);
    setIsDrawerOpen(true);
  };

  const handleSelectCaregiverId = (id: string) => {
    const found = caregivers.find((c) => c.id.toLowerCase() === id.toLowerCase());
    if (found) {
      setSelectedCaregiver(found);
      setIsDrawerOpen(true);
    } else {
      router.push(`/caregivers/${id}`);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Handle clicking Attention issue
  const handleAttentionCategorySelect = (category: string) => {
    setActiveAttentionCategory(category);
    // Smooth scroll down to the directory table
    const el = document.getElementById("caregiver-directory-anchor");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    toast.info(`Filtered directory for: ${category.replace(/_/g, " ")}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Caregivers
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
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B3414] hover:bg-[#274C1D] text-white text-xs font-bold rounded-xl shadow-sm transition-all shadow-[#1B3414]/25 hover:shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#93C573]" />
              <span>Add Caregiver</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/80" />
            </button>

            {isAddMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-30 animate-fadeIn text-xs">
                <Link
                  href="/caregivers/new"
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
                  href="/caregivers/new"
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

      {/* 1. KPI Strip answering the 5 administrative questions immediately */}
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
        needsAttentionCount={12}
      />

      {/* 2. Secondary Sections: Needs Attention & Recent Activity (Side-by-side matching /clients) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CaregiverAttentionSection
          caregivers={caregivers}
          onSelectCategoryFilter={handleAttentionCategorySelect}
          onSelectCaregiverId={handleSelectCaregiverId}
          activeAttentionCategory={activeAttentionCategory}
        />
        <CaregiverRecentActivitySection
          activities={CAREGIVER_RECENT_ACTIVITIES}
          onSelectCaregiverId={handleSelectCaregiverId}
        />
      </div>

      {/* 4. Caregiver Directory (Anchor for smooth scroll) */}
      <div id="caregiver-directory-anchor">
        <CaregiverManagementWorkspace
          caregivers={caregivers}
          selectedStatusFilter={selectedStatusFilter}
          onSelectStatusFilter={setSelectedStatusFilter}
          selectedCaregiverId={selectedCaregiver?.id || null}
          onSelectCaregiver={handleSelectCaregiver}
          activeAttentionCategory={activeAttentionCategory}
          onClearAttentionCategory={() => setActiveAttentionCategory(null)}
        />
      </div>

      {/* Contextual Quick Inspector Drawer */}
      <CaregiverContextualDrawer
        caregiver={selectedCaregiver}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onEditCaregiver={(cg) => router.push(`/caregivers/${cg.id}/edit`)}
      />
    </div>
  );
}
