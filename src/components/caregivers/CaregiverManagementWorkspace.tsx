"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  FilterX,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Clock,
  AlertTriangle,
  BadgeAlert,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Users,
  Eye,
  User,
} from "lucide-react";
import { CaregiverRecord, CaregiverType, CaregiverStatus, CredentialStatus } from "@/types/caregiver";

interface CaregiverManagementWorkspaceProps {
  caregivers: CaregiverRecord[];
  selectedStatusFilter: string | null;
  onSelectStatusFilter: (status: string | null) => void;
  selectedCaregiverId: string | null;
  onSelectCaregiver: (caregiver: CaregiverRecord) => void;
  activeAttentionCategory: string | null;
  onClearAttentionCategory: () => void;
}

export function CaregiverManagementWorkspace({
  caregivers,
  selectedStatusFilter,
  onSelectStatusFilter,
  selectedCaregiverId,
  onSelectCaregiver,
  activeAttentionCategory,
  onClearAttentionCategory,
}: CaregiverManagementWorkspaceProps) {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Filter options state
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterCredential, setFilterCredential] = useState<string>("ALL");
  const [filterScreening, setFilterScreening] = useState<string>("ALL");
  const [filterTraining, setFilterTraining] = useState<string>("ALL");
  const [filterAssignment, setFilterAssignment] = useState<string>("ALL");
  const [filterBranch, setFilterBranch] = useState<string>("ALL");

  // Status Tabs
  const currentTab = selectedStatusFilter || "ALL";

  const tabs = useMemo(
    () => [
      { id: "ALL", label: "All", count: caregivers.length },
      { id: "Active", label: "Active", count: caregivers.filter((c) => c.status === "Active").length },
      { id: "Onboarding", label: "Onboarding", count: caregivers.filter((c) => c.status === "Onboarding").length },
      { id: "Pending", label: "Pending", count: caregivers.filter((c) => c.status === "Pending").length },
      {
        id: "EXPIRING",
        label: "Expiring Credentials",
        count: caregivers.filter(
          (c) =>
            c.documentsCredentials?.overallStatus === "Expired" ||
            c.documentsCredentials?.overallStatus === "Missing" ||
            c.documentsCredentials?.items?.some(
              (i) => i.status === "Expired" || i.status === "Expiring Soon"
            )
        ).length,
      },
      {
        id: "ATTENTION",
        label: "Needs Attention",
        count: caregivers.filter(
          (c) =>
            c.status === "On Hold" ||
            c.status === "Pending" ||
            c.documentsCredentials?.overallStatus === "Expired" ||
            c.documentsCredentials?.overallStatus === "Missing" ||
            c.verificationChecklist?.screening !== "Cleared" ||
            c.verificationChecklist?.training !== "Complete"
        ).length,
      },
    ],
    [caregivers]
  );

  // Filtered Caregivers List
  const filteredCaregivers = useMemo(() => {
    return caregivers.filter((cg) => {
      // 1. Attention category filter (from clicking Needs Attention section)
      if (activeAttentionCategory) {
        if (activeAttentionCategory === "expired_credentials") {
          const hasExpired =
            cg.documentsCredentials.overallStatus === "Expired" ||
            cg.documentsCredentials.items.some((i) => i.status === "Expired") ||
            cg.status === "On Hold";
          if (!hasExpired) return false;
        } else if (activeAttentionCategory === "screening_pending") {
          const hasPendingScreening =
            cg.verificationChecklist.screening !== "Cleared" ||
            cg.screeningTraining.backgroundCheck.status !== "Cleared" ||
            cg.status === "Pending";
          if (!hasPendingScreening) return false;
        } else if (activeAttentionCategory === "training_incomplete") {
          const hasTrainingIncomplete =
            cg.verificationChecklist.training !== "Complete" ||
            cg.screeningTraining.overallTrainingStatus !== "Complete";
          if (!hasTrainingIncomplete) return false;
        } else if (activeAttentionCategory === "missing_documents") {
          const hasMissing =
            cg.verificationChecklist.cprFirstAid === "Missing" ||
            cg.documentsCredentials.overallStatus === "Missing" ||
            cg.documentsCredentials.items.some((i) => i.status === "Missing");
          if (!hasMissing) return false;
        } else if (activeAttentionCategory === "ALL_ATTENTION") {
          const needsAnyAttention =
            cg.status === "On Hold" ||
            cg.status === "Pending" ||
            cg.documentsCredentials.overallStatus === "Expired" ||
            cg.documentsCredentials.overallStatus === "Missing" ||
            cg.verificationChecklist.screening !== "Cleared" ||
            cg.verificationChecklist.training !== "Complete";
          if (!needsAnyAttention) return false;
        }
      }

      // 2. Status tab filter
      if (currentTab === "EXPIRING") {
        const hasExpiring =
          cg.documentsCredentials?.overallStatus === "Expired" ||
          cg.documentsCredentials?.overallStatus === "Missing" ||
          cg.documentsCredentials?.items?.some(
            (i) => i.status === "Expired" || i.status === "Expiring Soon"
          );
        if (!hasExpiring) return false;
      } else if (currentTab === "ATTENTION") {
        const needsAnyAttention =
          cg.status === "On Hold" ||
          cg.status === "Pending" ||
          cg.documentsCredentials?.overallStatus === "Expired" ||
          cg.documentsCredentials?.overallStatus === "Missing" ||
          cg.verificationChecklist?.screening !== "Cleared" ||
          cg.verificationChecklist?.training !== "Complete";
        if (!needsAnyAttention) return false;
      } else if (currentTab !== "ALL" && cg.status !== currentTab) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = cg.name.toLowerCase().includes(query);
        const matchesId = cg.id.toLowerCase().includes(query);
        const matchesHousehold = cg.relationship.linkedHousehold.name.toLowerCase().includes(query);
        const matchesClient = cg.availabilityAssignments.assignedClient?.name.toLowerCase().includes(query) ?? false;
        const matchesClientId = cg.availabilityAssignments.assignedClient?.id.toLowerCase().includes(query) ?? false;
        const matchesBranch = cg.branch.toLowerCase().includes(query);

        if (!matchesName && !matchesId && !matchesHousehold && !matchesClient && !matchesClientId && !matchesBranch) {
          return false;
        }
      }

      // 4. Panel filters
      if (filterType !== "ALL" && cg.type !== filterType) {
        return false;
      }
      if (filterCredential !== "ALL" && cg.documentsCredentials.overallStatus !== filterCredential) {
        return false;
      }
      if (filterScreening !== "ALL" && cg.screeningTraining.backgroundCheck.status !== filterScreening) {
        return false;
      }
      if (filterTraining !== "ALL" && cg.screeningTraining.overallTrainingStatus !== filterTraining) {
        return false;
      }
      if (filterAssignment !== "ALL" && cg.assignmentStatus !== filterAssignment) {
        return false;
      }
      if (filterBranch !== "ALL" && cg.branch !== filterBranch) {
        return false;
      }

      return true;
    });
  }, [
    caregivers,
    currentTab,
    activeAttentionCategory,
    searchQuery,
    filterType,
    filterCredential,
    filterScreening,
    filterTraining,
    filterAssignment,
    filterBranch,
  ]);

  const activeFiltersCount = [
    filterType !== "ALL",
    filterCredential !== "ALL",
    filterScreening !== "ALL",
    filterTraining !== "ALL",
    filterAssignment !== "ALL",
    filterBranch !== "ALL",
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterType("ALL");
    setFilterCredential("ALL");
    setFilterScreening("ALL");
    setFilterTraining("ALL");
    setFilterAssignment("ALL");
    setFilterBranch("ALL");
    onSelectStatusFilter(null);
    onClearAttentionCategory();
  };

  const getStatusBadge = (status: CaregiverStatus) => {
    switch (status) {
      case "Active":
        return "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20";
      case "Onboarding":
        return "bg-[#FEF3C7] text-[#9A5B00] border-[#9A5B00]/20";
      case "Pending":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "On Hold":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Inactive":
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getCredentialBadge = (status: CredentialStatus) => {
    switch (status) {
      case "Verified":
        return "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20";
      case "Expiring Soon":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Expired":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Missing":
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getTypeBadge = (type: CaregiverType) => {
    switch (type) {
      case "Family Caregiver":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Live-In Caregiver":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "Family Friend":
        return "bg-purple-50 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Directory Title & Tabs */}
      <div className="border-b border-slate-200/80 px-6 pt-5 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Caregiver Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Workforce roster across Family Caregivers, Live-In aides, and Family Friends
            </p>
          </div>

          {/* Active Attention Banner if filtering by attention category */}
          {activeAttentionCategory && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 animate-fadeIn">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>
                Filtering:{" "}
                {activeAttentionCategory === "expired_credentials"
                  ? "Expired Credentials"
                  : activeAttentionCategory === "screening_pending"
                  ? "Screening Pending"
                  : activeAttentionCategory === "training_incomplete"
                  ? "Training Incomplete"
                  : activeAttentionCategory === "missing_documents"
                  ? "Missing Documents"
                  : "All Issues"}
              </span>
              <button
                type="button"
                onClick={onClearAttentionCategory}
                className="hover:text-rose-950 font-bold ml-1"
                title="Clear attention filter"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Status Tabs matching requested design: (All) (Active) (Onboarding) (Pending) (On Hold) (Inactive) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-200/80 -mb-px">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSelectStatusFilter(tab.id === "ALL" ? null : tab.id);
                  if (activeAttentionCategory) onClearAttentionCategory();
                }}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-[#3D6B22] text-[#3D6B22] bg-[#F2F8EE]/30"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-[#3D6B22] text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search caregiver, ID, household..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right side: Filters button & Grid/Table toggles */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showFiltersPanel || activeFiltersCount > 0
                ? "bg-[#F2F8EE] border-[#3D6B22] text-[#3D6B22]"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#3D6B22] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
            {showFiltersPanel ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {(searchQuery || activeFiltersCount > 0 || currentTab !== "ALL" || activeAttentionCategory) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <FilterX className="w-4 h-4" />
            </button>
          )}

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-[#3D6B22]/10 text-[#3D6B22] font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-[#3D6B22]/10 text-[#3D6B22] font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFiltersPanel && (
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200/80 animate-fadeIn">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Caregiver Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Caregiver Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-[#3D6B22]"
              >
                <option value="ALL">All Types</option>
                <option value="Family Caregiver">Family Caregiver</option>
                <option value="Live-In Caregiver">Live-In Caregiver</option>
                <option value="Family Friend">Family Friend</option>
              </select>
            </div>

            {/* Credential Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Credentials
              </label>
              <select
                value={filterCredential}
                onChange={(e) => setFilterCredential(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-[#3D6B22]"
              >
                <option value="ALL">All Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
                <option value="Missing">Missing</option>
              </select>
            </div>

            {/* Screening Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Screening Status
              </label>
              <select
                value={filterScreening}
                onChange={(e) => setFilterScreening(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-[#3D6B22]"
              >
                <option value="ALL">All Screenings</option>
                <option value="Cleared">Cleared</option>
                <option value="Pending Review">Pending Review</option>
                <option value="In Review">In Review</option>
              </select>
            </div>

            {/* Training Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Training Status
              </label>
              <select
                value={filterTraining}
                onChange={(e) => setFilterTraining(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-[#3D6B22]"
              >
                <option value="ALL">All Training</option>
                <option value="Complete">Complete</option>
                <option value="In Progress">In Progress</option>
                <option value="Incomplete">Incomplete</option>
              </select>
            </div>

            {/* Assignment */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Assignment
              </label>
              <select
                value={filterAssignment}
                onChange={(e) => setFilterAssignment(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-[#3D6B22]"
              >
                <option value="ALL">All Assignments</option>
                <option value="Assigned">Assigned</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Branch
              </label>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-[#3D6B22]"
              >
                <option value="ALL">All Branches</option>
                <option value="Mountain Lane">Mountain Lane</option>
                <option value="North Metro">North Metro</option>
                <option value="Valley View">Valley View</option>
                <option value="Westside">Westside</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Directory Content: Table or Grid */}
      {filteredCaregivers.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Caregivers Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No caregiver records match your search criteria or active filters.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW matching recommended directory fields */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 pl-6">Caregiver</th>
                <th className="py-3 px-4">Caregiver ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Credentials</th>
                <th className="py-3 px-4">Assignment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCaregivers.map((cg) => {
                const isSelected = selectedCaregiverId === cg.id;
                const assignedClient = cg.availabilityAssignments.assignedClient;

                return (
                  <tr
                    key={cg.id}
                    onClick={() => onSelectCaregiver(cg)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? "bg-[#F2F8EE]/70 hover:bg-[#F2F8EE]"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    {/* Caregiver Name & Profile */}
                    <td className="py-3.5 px-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {cg.avatarUrl ? (
                            <img
                              src={cg.avatarUrl}
                              alt={cg.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors flex items-center gap-1.5">
                            <span>{cg.name}</span>
                            <span className="text-[10px] font-normal text-slate-400">
                              ({cg.employmentClassification})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{cg.branch}</span>
                            <span>•</span>
                            <span>{cg.relationship.linkedHousehold.name}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Caregiver ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {cg.id}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getTypeBadge(
                          cg.type
                        )}`}
                      >
                        {cg.type}
                      </span>
                    </td>

                    {/* Credentials */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${getCredentialBadge(
                            cg.documentsCredentials.overallStatus
                          )}`}
                        >
                          {cg.documentsCredentials.overallStatus}
                        </span>
                        {cg.documentsCredentials.overallStatus === "Expired" && (
                          <span className="text-[10px] text-rose-600 font-semibold">
                            (Renewal Due)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assignment */}
                    <td className="py-3.5 px-4">
                      {assignedClient ? (
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1">
                            <span className="text-[#3D6B22] font-mono text-[11px]">
                              {assignedClient.id}
                            </span>
                            <span className="truncate max-w-[120px]">
                              {assignedClient.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {assignedClient.weeklyAuthorizedHours} hrs/wk
                          </span>
                        </div>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          cg.status
                        )}`}
                      >
                        ({cg.status})
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 pr-6 text-right">
                      <div
                        className="inline-flex items-center gap-1 text-slate-400 group-hover:text-[#3D6B22] transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCaregiver(cg);
                        }}
                      >
                        <span className="text-[11px] font-semibold">Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID VIEW matching recommended sample cards:
           Caregiver Record 01 (Active) - CG-102 - Family Caregiver
        */
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCaregivers.map((cg) => {
            const isSelected = selectedCaregiverId === cg.id;
            const assignedClient = cg.availabilityAssignments.assignedClient;

            return (
              <div
                key={cg.id}
                onClick={() => onSelectCaregiver(cg)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 bg-gradient-to-b from-[#F2F8EE]/70 via-white to-white shadow-md -translate-y-0.5"
                    : "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <div>
                  {/* Top Bar: Caregiver Name & Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {cg.avatarUrl ? (
                          <img
                            src={cg.avatarUrl}
                            alt={cg.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors leading-snug">
                          {cg.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#3D6B22]">
                          <span>{cg.id}</span>
                          <span className="text-slate-300 font-sans">•</span>
                          <span className="text-[11px] font-sans font-normal text-slate-500">
                            {cg.branch}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border tracking-wide ${getStatusBadge(
                        cg.status
                      )}`}
                    >
                      ({cg.status})
                    </span>
                  </div>

                  {/* Badges: Type and Credentials */}
                  <div className="flex items-center flex-wrap gap-1.5 mt-3 mb-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getTypeBadge(
                        cg.type
                      )}`}
                    >
                      {cg.type}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getCredentialBadge(
                        cg.documentsCredentials.overallStatus
                      )}`}
                    >
                      {cg.documentsCredentials.overallStatus} Credentials
                    </span>
                  </div>

                  {/* Assignment info */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Client Assignment
                    </span>
                    {assignedClient ? (
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">
                          {assignedClient.name}{" "}
                          <span className="text-slate-400 font-normal">
                            ({assignedClient.id})
                          </span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          {assignedClient.weeklyAuthorizedHours}h / wk
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned (Available)</span>
                    )}
                  </div>
                </div>

                {/* Footer link */}
                <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#3D6B22]">
                  <span>Quick Overview</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
