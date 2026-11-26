"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CareNote,
  CareNoteReviewStatus,
  CareNoteQualityStatus,
  CareNoteSubmissionStatus,
} from "@/types/careNotes";
import {
  getCareNotesFromStorage,
  exportCareNotesCsv,
  CARE_NOTES_SYNC_EVENT,
} from "@/lib/admin/careNotesStore";
import { CareNotesSubNav } from "./CareNotesSubNav";
import { CareNoteStatusBadge, CareNoteQualityIndicator } from "./CareNotesBadges";
import {
  Search,
  Filter,
  X,
  Download,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function CareNotesAllWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatusFilter = searchParams.get("status") || "all";
  const initialTypeFilter = searchParams.get("type") || "all";

  const [notes, setNotes] = useState<CareNote[]>([]);
  const [activeTab, setActiveTab] = useState<string>(initialStatusFilter);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOffice, setSelectedOffice] = useState("All Offices");
  const [selectedProgram, setSelectedProgram] = useState("All Programs");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedQuality, setSelectedQuality] = useState("all");
  const [selectedReviewer, setSelectedReviewer] = useState("all");
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sync state if url changes
  useEffect(() => {
    if (initialStatusFilter && initialStatusFilter !== "all") {
      setActiveTab(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  useEffect(() => {
    const load = () => {
      setNotes(getCareNotesFromStorage());
    };
    load();
    window.addEventListener(CARE_NOTES_SYNC_EVENT, load);
    return () => window.removeEventListener(CARE_NOTES_SYNC_EVENT, load);
  }, []);

  // Filter logic
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Status tab filter
      if (activeTab === "draft" && n.submissionStatus !== "draft") return false;
      if (activeTab === "submitted" && n.submissionStatus !== "submitted") return false;
      if (activeTab === "pending_review" && n.reviewStatus !== "pending_review") return false;
      if (activeTab === "needs_correction" && n.reviewStatus !== "correction_requested") return false;
      if (activeTab === "resubmitted" && n.submissionStatus !== "resubmitted") return false;
      if (activeTab === "approved" && n.reviewStatus !== "approved" && n.reviewStatus !== "reviewed") return false;
      if (activeTab === "missing" && !n.isMissing && !n.isOverdue) return false;
      if (activeTab === "flagged") {
        const hasFlag = n.flags.some((f) => f.status === "open") || n.reviewStatus === "escalated";
        if (!hasFlag) return false;
        if (initialTypeFilter === "clinical" && !n.flags.some((f) => f.flagType === "clinical" && f.status === "open")) return false;
        if (initialTypeFilter === "compliance" && !n.flags.some((f) => f.flagType === "compliance" && f.status === "open")) return false;
      }

      // Office
      if (selectedOffice !== "All Offices" && n.agencyName !== selectedOffice) return false;

      // Program
      if (selectedProgram !== "All Programs" && n.programName !== selectedProgram) return false;

      // Service
      if (selectedService !== "all" && n.serviceCode !== selectedService) return false;

      // Quality
      if (selectedQuality !== "all" && n.qualityStatus !== selectedQuality) return false;

      // Reviewer
      if (selectedReviewer !== "all") {
        if (selectedReviewer === "unassigned" && n.assignedReviewerId) return false;
        if (selectedReviewer !== "unassigned" && n.assignedReviewerId !== selectedReviewer) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesId = n.id.toLowerCase().includes(term);
        const matchesClient = n.clientName.toLowerCase().includes(term) || n.clientId.toLowerCase().includes(term);
        const matchesCaregiver = n.caregiverName.toLowerCase().includes(term) || n.caregiverId.toLowerCase().includes(term);
        const matchesService = n.serviceType.toLowerCase().includes(term) || n.serviceCode.toLowerCase().includes(term);
        const matchesVisit = n.visitId.toLowerCase().includes(term);
        if (!matchesId && !matchesClient && !matchesCaregiver && !matchesService && !matchesVisit) {
          return false;
        }
      }

      return true;
    });
  }, [
    notes,
    activeTab,
    selectedOffice,
    selectedProgram,
    selectedService,
    selectedQuality,
    selectedReviewer,
    searchTerm,
    initialTypeFilter,
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredNotes.length / pageSize) || 1;
  const paginatedNotes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNotes.slice(start, start + pageSize);
  }, [filteredNotes, currentPage, pageSize]);

  // Selection handlers
  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedNotes.length === paginatedNotes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(paginatedNotes.map((n) => n.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNotes((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const clearAllFilters = () => {
    setActiveTab("all");
    setSearchTerm("");
    setSelectedOffice("All Offices");
    setSelectedProgram("All Programs");
    setSelectedService("all");
    setSelectedQuality("all");
    setSelectedReviewer("all");
    setCurrentPage(1);
    toast.info("Filters cleared");
  };

  const activeFiltersCount =
    (activeTab !== "all" ? 1 : 0) +
    (selectedOffice !== "All Offices" ? 1 : 0) +
    (selectedProgram !== "All Programs" ? 1 : 0) +
    (selectedService !== "all" ? 1 : 0) +
    (selectedQuality !== "all" ? 1 : 0) +
    (selectedReviewer !== "all" ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0);

  const tabs = [
    { id: "all", label: "All Notes", count: notes.length },
    { id: "draft", label: "Draft / Missing", count: notes.filter((n) => n.submissionStatus === "draft" || n.isMissing).length },
    { id: "submitted", label: "Submitted", count: notes.filter((n) => n.submissionStatus === "submitted").length },
    { id: "pending_review", label: "Pending Review", count: notes.filter((n) => n.reviewStatus === "pending_review").length },
    { id: "needs_correction", label: "Needs Correction", count: notes.filter((n) => n.reviewStatus === "correction_requested").length },
    { id: "resubmitted", label: "Resubmitted", count: notes.filter((n) => n.submissionStatus === "resubmitted").length },
    { id: "approved", label: "Reviewed / Approved", count: notes.filter((n) => n.reviewStatus === "approved" || n.reviewStatus === "reviewed").length },
    { id: "flagged", label: "Flagged", count: notes.filter((n) => n.flags.some((f) => f.status === "open") || n.reviewStatus === "escalated").length },
  ];

  return (
    <div className="w-full max-w-9xl mx-auto space-y-5 pb-16 px-4 sm:px-6 lg:px-8 pt-2 animate-in fade-in duration-300">
      <CareNotesSubNav
        title="All Care Notes"
        description="Search and manage care documentation submitted across your agency."
      />

      {/* Search & Filter Card with Status Pills */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        {/* Status Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id
                  ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20 font-bold"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
                }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
                  }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Dropdowns & Search Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input (2 cols) */}
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              placeholder="Search Note ID, client, caregiver, service..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Office Filter */}
          <div>
            <select
              value={selectedOffice}
              onChange={(e) => {
                setSelectedOffice(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all cursor-pointer"
            >
              <option value="All Offices">All Offices</option>
              <option value="Columbus Metro Office">Columbus Metro</option>
              <option value="Cleveland North Branch">Cleveland North</option>
              <option value="Cincinnati Regional">Cincinnati Regional</option>
            </select>
          </div>

          {/* Program Filter */}
          <div>
            <select
              value={selectedProgram}
              onChange={(e) => {
                setSelectedProgram(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all cursor-pointer"
            >
              <option value="All Programs">All Programs</option>
              <option value="Medicaid HCBS Waiver">Medicaid HCBS</option>
              <option value="Ohio PASSPORT Waiver">Ohio PASSPORT</option>
              <option value="IHSS Attendant Program">IHSS Attendant</option>
              <option value="DODD Supported Living">DODD Living</option>
              <option value="Private Duty & Skilled Nursing">Skilled Nursing</option>
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <select
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all cursor-pointer"
            >
              <option value="all">All Services</option>
              <option value="T1019">T1019 - Personal Care</option>
              <option value="S5130">S5130 - Homemaker</option>
              <option value="T1005">T1005 - Attendant (IHSS)</option>
              <option value="S5150">S5150 - Respite Care</option>
              <option value="G0299">G0299 - Skilled Nursing</option>
              <option value="T1000">T1000 - Private Duty</option>
            </select>
          </div>

          {/* Quality Status Filter */}
          <div>
            <select
              value={selectedQuality}
              onChange={(e) => {
                setSelectedQuality(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all cursor-pointer"
            >
              <option value="all">All Quality States</option>
              <option value="complete">Complete</option>
              <option value="incomplete">Incomplete</option>
              <option value="missing_required">Missing Required</option>
              <option value="review_required">Review Required</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        {/* Active filter count & clear actions */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Showing <strong className="text-slate-900 font-bold">{filteredNotes.length}</strong> of {notes.length} care notes
            </span>
            {activeFiltersCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                {activeFiltersCount} active filter{activeFiltersCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="font-bold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Operational Table Card (Clean Front List) */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Note ID</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Caregiver</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date of Service</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Review Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedNotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-2">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">No care notes found</p>
                      <p className="text-xs text-slate-500">No records match your selected filter criteria.</p>
                      <button
                        onClick={clearAllFilters}
                        className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedNotes.map((note) => (
                  <tr
                    key={note.id}
                    onClick={() => router.push(`/admin/care-notes/${note.id}`)}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  >
                    {/* Note ID */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 group-hover:text-[#3D6B22] group-hover:border-[#3D6B22]/30 transition-colors">
                          {note.id}
                        </span>
                        {note.currentVersion > 1 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            v{note.currentVersion}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Client */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-[#3D6B22] font-bold text-[10px] shrink-0 shadow-2xs">
                          {getInitials(note.clientName)}
                        </div>
                        <span className="font-semibold text-xs text-slate-900 group-hover:text-[#3D6B22] transition-colors whitespace-nowrap">
                          {note.clientName}
                        </span>
                      </div>
                    </td>

                    {/* Caregiver */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 font-bold text-[10px] shrink-0">
                          {getInitials(note.caregiverName)}
                        </div>
                        <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
                          {note.caregiverName}
                        </span>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="py-4 px-4 sm:px-6 text-xs text-slate-700 font-medium whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 mr-2">
                        {note.serviceCode}
                      </span>
                      {note.serviceType}
                    </td>

                    {/* Date of Service */}
                    <td className="py-4 px-4 sm:px-6 text-xs text-slate-600 whitespace-nowrap font-medium">
                      {note.serviceDate}
                    </td>

                    {/* Review Status & Quality */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CareNoteStatusBadge status={note.reviewStatus} />
                        <CareNoteQualityIndicator
                          status={note.qualityStatus}
                          issueCount={note.qualityIssues?.length}
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/care-notes/${note.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      >
                        <span>View Note</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">
              Page <strong className="text-slate-900 font-bold">{currentPage}</strong> of{" "}
              <strong className="text-slate-900 font-bold">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
