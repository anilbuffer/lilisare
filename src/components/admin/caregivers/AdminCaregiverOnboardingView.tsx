"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  FileCheck,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Clock,
  Mail,
  MoreVertical,
  Check,
  X,
  FileText,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  Upload,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { AdminCaregiverTopTabs } from "./AdminCaregiverTopTabs";

export type DocItemStatus = "completed" | "pending" | "missing";

export interface OnboardingDocInfo {
  status: DocItemStatus;
  fileName?: string;
  verifiedAt?: string;
}

export interface AdminNewHire {
  id: string;
  name: string;
  role: string;
  startDate: string;
  email: string;
  phone: string;
  progress: number;
  lastReminderSent?: string;
  documents: {
    i9: OnboardingDocInfo;
    w4: OnboardingDocInfo;
    bgc: OnboardingDocInfo;
    cpr: OnboardingDocInfo;
  };
}

const INITIAL_NEW_HIRES: AdminNewHire[] = [
  {
    id: "CG-104",
    name: "Amanda Riley",
    role: "Registered Nurse (RN)",
    startDate: "Oct 15, 2026",
    email: "amanda.riley@lilisare.com",
    phone: "(555) 234-5678",
    progress: 75,
    lastReminderSent: "Yesterday, 3:45 PM",
    documents: {
      i9: {
        status: "completed",
        fileName: "I-9_Employment_Eligibility.pdf",
        verifiedAt: "Oct 02, 2026",
      },
      w4: {
        status: "completed",
        fileName: "W4_Employee_Withholding.pdf",
        verifiedAt: "Oct 03, 2026",
      },
      bgc: {
        status: "completed",
        fileName: "State_Criminal_BGC_Pass.pdf",
        verifiedAt: "Oct 05, 2026",
      },
      cpr: { status: "missing" },
    },
  },
  {
    id: "CG-115",
    name: "James Wilson",
    role: "Home Health Aide",
    startDate: "Oct 22, 2026",
    email: "j.wilson@lilisare.com",
    phone: "(555) 876-5432",
    progress: 25,
    documents: {
      i9: {
        status: "pending",
        fileName: "I-9_Draft_Scan.pdf",
        verifiedAt: "Awaiting signature",
      },
      w4: { status: "missing" },
      bgc: {
        status: "pending",
        fileName: "Checkr_BGC_Processing",
        verifiedAt: "Processing",
      },
      cpr: {
        status: "completed",
        fileName: "AHA_BLS_Card_2026.pdf",
        verifiedAt: "Oct 08, 2026",
      },
    },
  },
  {
    id: "CG-106",
    name: "Elena Rodriguez",
    role: "Certified Nursing Assistant",
    startDate: "Nov 01, 2026",
    email: "elena.r@lilisare.com",
    phone: "(555) 345-6789",
    progress: 100,
    lastReminderSent: "Nov 01, 2026",
    documents: {
      i9: {
        status: "completed",
        fileName: "I-9_Form_Verified.pdf",
        verifiedAt: "Oct 18, 2026",
      },
      w4: {
        status: "completed",
        fileName: "W4_Signed_2026.pdf",
        verifiedAt: "Oct 19, 2026",
      },
      bgc: {
        status: "completed",
        fileName: "FBI_Fingerprint_Clearance.pdf",
        verifiedAt: "Oct 22, 2026",
      },
      cpr: {
        status: "completed",
        fileName: "RedCross_CPR_AED.pdf",
        verifiedAt: "Oct 24, 2026",
      },
    },
  },
  {
    id: "CG-105",
    name: "Marcus Vance",
    role: "Physical Therapist",
    startDate: "Nov 10, 2026",
    email: "marcus.v@lilisare.com",
    phone: "(555) 567-8901",
    progress: 50,
    documents: {
      i9: {
        status: "completed",
        fileName: "I-9_Form_Verified.pdf",
        verifiedAt: "Oct 28, 2026",
      },
      w4: { status: "missing" },
      bgc: {
        status: "completed",
        fileName: "State_Police_Clearance.pdf",
        verifiedAt: "Nov 01, 2026",
      },
      cpr: { status: "missing" },
    },
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function AdminCaregiverOnboardingView() {
  const [hires, setHires] = useState<AdminNewHire[]>(INITIAL_NEW_HIRES);
  const [kpiFilter, setKpiFilter] = useState<"all" | "completed" | "missing">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedHire, setSelectedHire] = useState<AdminNewHire | null>(null);
  const [isAddHireModalOpen, setIsAddHireModalOpen] = useState(false);

  // New hire form state
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Certified Nursing Assistant");
  const [newStartDate, setNewStartDate] = useState("Nov 25, 2026");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // KPI Calculations
  const inOnboardingCount = 12; // Platform overall
  const completedThisWeekCount = 5;
  const missingDocsCount = 3;

  // Filter logic
  const filteredHires = useMemo(() => {
    return hires.filter((hire) => {
      // KPI filter
      if (kpiFilter === "completed" && hire.progress < 100) return false;
      if (kpiFilter === "missing") {
        const hasMissing = Object.values(hire.documents).some(
          (d) => d.status === "missing"
        );
        if (!hasMissing) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = hire.name.toLowerCase().includes(q);
        const matchesRole = hire.role.toLowerCase().includes(q);
        const matchesEmail = hire.email.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesEmail) return false;
      }

      // Role filter
      if (roleFilter !== "ALL" && !hire.role.includes(roleFilter)) {
        return false;
      }

      return true;
    });
  }, [hires, kpiFilter, searchQuery, roleFilter]);

  const handleSendReminder = (hireId: string, name: string) => {
    setHires((prev) =>
      prev.map((h) =>
        h.id === hireId ? { ...h, lastReminderSent: "Sent just now" } : h
      )
    );
    toast.success(`Onboarding reminder sent to ${name}`);
  };

  const handleAddHire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Please enter hire name");
      return;
    }

    const newHire: AdminNewHire = {
      id: `CG-${Math.floor(100 + Math.random() * 900)}`,
      name: newName.trim(),
      role: newRole,
      startDate: newStartDate,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, ".")}@lilisare.com`,
      phone: newPhone || "(555) 000-0000",
      progress: 25,
      documents: {
        i9: { status: "pending", fileName: "I-9_Draft.pdf" },
        w4: { status: "missing" },
        bgc: { status: "pending", fileName: "BGC_In_Review" },
        cpr: { status: "completed", fileName: "CPR_Card.pdf" },
      },
    };

    setHires((prev) => [newHire, ...prev]);
    toast.success(`New hire ${newHire.name} added to onboarding`);
    setIsAddHireModalOpen(false);

    setNewName("");
    setNewEmail("");
    setNewPhone("");
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 01. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Caregiver Onboarding & Docs
          </h1>
        </div>

        <button
          onClick={() => setIsAddHireModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Hire</span>
        </button>
      </div>

      {/* 02. Top Tab Navigation Bar */}
      <AdminCaregiverTopTabs activeTab="onboarding" />

      {/* 03. Interactive KPI Cards (Matching Image 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: In Onboarding */}
        <button
          type="button"
          onClick={() => setKpiFilter("all")}
          className={`text-left bg-white rounded-2xl p-5 border transition-all duration-200 shadow-2xs flex items-center justify-between group cursor-pointer ${kpiFilter === "all"
            ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40"
            : "border-slate-200 hover:border-blue-300 hover:shadow-md"
            }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100/80 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-105">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {inOnboardingCount}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                In Onboarding
              </div>
            </div>
          </div>
          {kpiFilter === "all" && (
            <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              ACTIVE VIEW
            </span>
          )}
        </button>

        {/* Card 2: Completed this week */}
        <button
          type="button"
          onClick={() =>
            setKpiFilter(kpiFilter === "completed" ? "all" : "completed")
          }
          className={`text-left bg-white rounded-2xl p-5 border transition-all duration-200 shadow-2xs flex items-center justify-between group cursor-pointer ${kpiFilter === "completed"
            ? "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 bg-[#E8F2E4]/40"
            : "border-slate-200 hover:border-[#3D6B22]/40 hover:shadow-md"
            }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-emerald-700 transition-transform group-hover:scale-105">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {completedThisWeekCount}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                Completed this week
              </div>
            </div>
          </div>
          {kpiFilter === "completed" && (
            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              FILTERED
            </span>
          )}
        </button>

        {/* Card 3: Missing Documents */}
        <button
          type="button"
          onClick={() =>
            setKpiFilter(kpiFilter === "missing" ? "all" : "missing")
          }
          className={`text-left bg-white rounded-2xl p-5 border transition-all duration-200 shadow-2xs flex items-center justify-between group cursor-pointer ${kpiFilter === "missing"
            ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40"
            : "border-slate-200 hover:border-rose-300 hover:shadow-md"
            }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100/80 flex items-center justify-center text-rose-600 transition-transform group-hover:scale-105">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {missingDocsCount}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                Missing Documents
              </div>
            </div>
          </div>
          {kpiFilter === "missing" && (
            <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              FILTERED
            </span>
          )}
        </button>
      </div>

      {/* 03. Search & Filter Bar (Matching Image 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search new hires by name, role, email..."
              className="w-full pl-10 pr-9 py-2.5 bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`px-4 py-2.5 rounded-full bg-white border text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.03)] ${roleFilter !== "ALL"
                ? "border-[#3D6B22] text-[#1E5622] bg-[#E8F2E4]"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-bold text-slate-800 px-2 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Filter by Discipline</span>
                  {roleFilter !== "ALL" && (
                    <button
                      onClick={() => setRoleFilter("ALL")}
                      className="text-[11px] text-[#3D6B22] hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="space-y-1 pt-2 text-xs">
                  {["ALL", "Nurse", "Aide", "Physical Therapist"].map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setRoleFilter(role);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-between ${roleFilter === role
                        ? "bg-[#E8F2E4] text-[#1E5622] font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <span>{role === "ALL" ? "All Disciplines" : role}</span>
                      {roleFilter === role && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsAddHireModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-full shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hire</span>
        </button>
      </div>

      {/* 04. Main Onboarding Table (Matching Image 3) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="px-6 py-4">New Hire</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">Onboarding Progress</th>
                <th className="px-6 py-4 text-center">Required Documents</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHires.map((hire) => (
                <tr
                  key={hire.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* New Hire info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(hire.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/caregivers/${hire.id}`}
                            className="font-bold text-slate-900 hover:text-[#3D6B22] transition-colors"
                          >
                            {hire.name}
                          </Link>
                          {hire.lastReminderSent && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                              <Mail className="w-2.5 h-2.5" />
                              <span>Sent</span>
                            </span>
                          )}
                        </div>

                      </div>
                    </div>
                  </td>

                  {/* Start Date */}
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{hire.startDate}</span>
                    </div>
                  </td>

                  {/* Onboarding Progress */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 max-w-xs">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${hire.progress === 100
                            ? "bg-emerald-600"
                            : hire.progress >= 50
                              ? "bg-[#3D6B22]"
                              : "bg-amber-500"
                            }`}
                          style={{ width: `${hire.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-10 text-right">
                        {hire.progress}%
                      </span>
                    </div>
                  </td>

                  {/* Required Documents: I-9, W-4, BGC, CPR */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4">
                      {/* I-9 */}
                      <DocPill
                        label="I-9"
                        status={hire.documents.i9.status}
                        onClick={() => setSelectedHire(hire)}
                      />
                      {/* W-4 */}
                      <DocPill
                        label="W-4"
                        status={hire.documents.w4.status}
                        onClick={() => setSelectedHire(hire)}
                      />
                      {/* BGC */}
                      <DocPill
                        label="BGC"
                        status={hire.documents.bgc.status}
                        onClick={() => setSelectedHire(hire)}
                      />
                      {/* CPR */}
                      <DocPill
                        label="CPR"
                        status={hire.documents.cpr.status}
                        onClick={() => setSelectedHire(hire)}
                      />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleSendReminder(hire.id, hire.name)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Send Onboarding Reminder Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSelectedHire(hire)}
                        className="px-3.5 py-1.5 rounded-full border border-slate-200 text-slate-700 font-semibold hover:border-[#3D6B22] hover:text-[#3D6B22] hover:bg-[#E8F2E4]/40 transition-colors text-xs cursor-pointer"
                      >
                        Review
                      </button>

                      <button
                        onClick={() => setSelectedHire(hire)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredHires.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">
                      No onboarding records found
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try adjusting your search query or discipline filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 05. Review Document Drawer / Modal */}
      {selectedHire && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-bold flex items-center justify-center">
                  {getInitials(selectedHire.name)}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Onboarding Review: {selectedHire.name}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    {selectedHire.role} • Target Start: {selectedHire.startDate}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedHire(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
              {/* Progress Bar */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Onboarding Readiness Score
                  </span>
                  <span className="text-xs font-black text-[#3D6B22]">
                    {selectedHire.progress}% Complete
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3D6B22] rounded-full"
                    style={{ width: `${selectedHire.progress}%` }}
                  />
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Mandatory Document Verification
                </h4>

                <DocReviewRow
                  title="Form I-9 Employment Eligibility"
                  docKey="i9"
                  doc={selectedHire.documents.i9}
                  onApprove={() => {
                    setHires((prev) =>
                      prev.map((h) =>
                        h.id === selectedHire.id
                          ? {
                            ...h,
                            documents: {
                              ...h.documents,
                              i9: {
                                status: "completed",
                                fileName: "I-9_Approved.pdf",
                                verifiedAt: "Today",
                              },
                            },
                            progress: Math.min(100, h.progress + 25),
                          }
                          : h
                      )
                    );
                    toast.success("Form I-9 approved");
                  }}
                />

                <DocReviewRow
                  title="Form W-4 Employee Withholding"
                  docKey="w4"
                  doc={selectedHire.documents.w4}
                  onApprove={() => {
                    setHires((prev) =>
                      prev.map((h) =>
                        h.id === selectedHire.id
                          ? {
                            ...h,
                            documents: {
                              ...h.documents,
                              w4: {
                                status: "completed",
                                fileName: "W4_Signed.pdf",
                                verifiedAt: "Today",
                              },
                            },
                            progress: Math.min(100, h.progress + 25),
                          }
                          : h
                      )
                    );
                    toast.success("Form W-4 approved");
                  }}
                />

                <DocReviewRow
                  title="Criminal Background Check (BGC)"
                  docKey="bgc"
                  doc={selectedHire.documents.bgc}
                  onApprove={() => {
                    setHires((prev) =>
                      prev.map((h) =>
                        h.id === selectedHire.id
                          ? {
                            ...h,
                            documents: {
                              ...h.documents,
                              bgc: {
                                status: "completed",
                                fileName: "BGC_Cleared.pdf",
                                verifiedAt: "Today",
                              },
                            },
                            progress: Math.min(100, h.progress + 25),
                          }
                          : h
                      )
                    );
                    toast.success("Background check cleared and verified");
                  }}
                />

                <DocReviewRow
                  title="BLS / CPR Certification Card"
                  docKey="cpr"
                  doc={selectedHire.documents.cpr}
                  onApprove={() => {
                    setHires((prev) =>
                      prev.map((h) =>
                        h.id === selectedHire.id
                          ? {
                            ...h,
                            documents: {
                              ...h.documents,
                              cpr: {
                                status: "completed",
                                fileName: "CPR_Verified.pdf",
                                verifiedAt: "Today",
                              },
                            },
                            progress: Math.min(100, h.progress + 25),
                          }
                          : h
                      )
                    );
                    toast.success("CPR certification verified");
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-slate-50/50">
              <Link
                href={`/admin/caregivers/${selectedHire.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:text-[#1E5622]"
              >
                <span>View Full Caregiver Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => setSelectedHire(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 06. Add New Hire Modal */}
      {isAddHireModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col">
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Add New Hire to Onboarding
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    Register candidate into the document onboarding queue.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAddHireModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHire} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amanda Riley"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Discipline / Role *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  >
                    <option value="Registered Nurse (RN)">
                      Registered Nurse (RN)
                    </option>
                    <option value="Certified Nursing Assistant">
                      Certified Nursing Assistant
                    </option>
                    <option value="Home Health Aide">Home Health Aide</option>
                    <option value="Physical Therapist">Physical Therapist</option>
                    <option value="Companion">Companion</option>
                  </select>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@lilisare.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddHireModalOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Hire</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Document Pill (Matching Image 3)
function DocPill({
  label,
  status,
  onClick,
}: {
  label: string;
  status: DocItemStatus;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 cursor-pointer group"
      title={`${label}: ${status}`}
    >
      {status === "completed" ? (
        <span className="w-5 h-5 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
          <FileText className="w-4 h-4" />
        </span>
      ) : status === "pending" ? (
        <span className="w-5 h-5 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
          <Clock className="w-4 h-4" />
        </span>
      ) : (
        <span className="w-5 h-5 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
          <AlertCircle className="w-4 h-4" />
        </span>
      )}
      <span
        className={`text-[10px] font-bold ${status === "completed"
          ? "text-emerald-700"
          : status === "pending"
            ? "text-amber-700"
            : "text-rose-600"
          }`}
      >
        {label}
      </span>
    </button>
  );
}

// Subcomponent: Document Review Row
function DocReviewRow({
  title,
  docKey,
  doc,
  onApprove,
}: {
  title: string;
  docKey: string;
  doc: OnboardingDocInfo;
  onApprove: () => void;
}) {
  return (
    <div className="p-3 bg-white border border-slate-200/90 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-3">
        {doc.status === "completed" ? (
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
        ) : doc.status === "pending" ? (
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        )}
        <div>
          <div className="text-xs font-bold text-slate-800">{title}</div>
          <div className="text-[11px] text-slate-400">
            {doc.fileName ? doc.fileName : "No file uploaded yet"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {doc.status !== "completed" ? (
          <button
            onClick={onApprove}
            className="px-3 py-1 bg-[#3D6B22] hover:bg-[#345C1D] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Verify & Approve
          </button>
        ) : (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Verified
          </span>
        )}
      </div>
    </div>
  );
}
