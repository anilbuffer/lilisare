"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  FileSignature,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertOctagon,
  Eye,
  FileText,
  UserCheck,
  ChevronDown,
  Building2,
  Activity,
  Layers,
  ArrowUpDown,
  Sparkles,
  Info,
  Calendar,
  X,
  Edit3,
  Stethoscope,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/Card";
import {
  AuthorizationRecord,
  AuthorizationStatus,
  CareCategory,
  INITIAL_AUTHORIZATIONS,
  calculateAuthorizationsKpis,
  exportAuthorizationsCsv,
} from "@/lib/admin/authorizationsData";

import { AuthorizationDrawer } from "@/components/admin/authorizations/AuthorizationDrawer";
import { CreateEditAuthorizationModal } from "@/components/admin/authorizations/CreateEditAuthorizationModal";
import { EvidenceViewerModal } from "@/components/admin/authorizations/EvidenceViewerModal";

type ActiveTab = "ALL" | "SKILLED" | "NON_MEDICAL" | "PENDING" | "EXHAUSTED" | "DENIED";

export default function AdminAuthorizationsPage() {
  const [records, setRecords] = useState<AuthorizationRecord[]>(INITIAL_AUTHORIZATIONS);
  const [activeTab, setActiveTab] = useState<ActiveTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayer, setSelectedPayer] = useState("ALL");
  const [selectedCareType, setSelectedCareType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDistinctionBanner, setShowDistinctionBanner] = useState(true);

  // Drawer & Modal States
  const [drawerRecord, setDrawerRecord] = useState<AuthorizationRecord | null>(null);
  const [createEditRecord, setCreateEditRecord] = useState<AuthorizationRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [evidenceRecord, setEvidenceRecord] = useState<AuthorizationRecord | null>(null);

  // Live KPI Summary
  const kpis = useMemo(() => calculateAuthorizationsKpis(records), [records]);

  // Sync / Refresh Simulation
  const handleRefresh = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Payer authorizations synchronized with Colorado Medicaid and commercial portals");
    }, 400);
  };

  // CSV Export
  const handleExport = () => {
    exportAuthorizationsCsv(records);
    toast.success("Authorizations registry exported as CSV");
  };

  // Save handler (Create or Edit)
  const handleSaveRecord = (savedRecord: AuthorizationRecord) => {
    setRecords((prev) => {
      const exists = prev.some((r) => r.id === savedRecord.id);
      if (exists) {
        return prev.map((r) => (r.id === savedRecord.id ? savedRecord : r));
      }
      return [savedRecord, ...prev];
    });

    // Update drawer record if currently open
    if (drawerRecord && drawerRecord.id === savedRecord.id) {
      setDrawerRecord(savedRecord);
    }

    toast.success(`Authorization ${savedRecord.id} saved successfully`);
  };

  // Update Status directly
  const handleUpdateStatus = (id: string, newStatus: AuthorizationStatus, reason: string) => {
    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== id) return rec;

        const updatedHistory = [
          {
            status: newStatus,
            changedAt: new Date().toISOString().slice(0, 10),
            changedBy: "Marcus Vance (Agency Admin)",
            reason,
          },
          ...rec.statusHistory,
        ];

        const updated = {
          ...rec,
          status: newStatus,
          statusHistory: updatedHistory,
        };

        if (drawerRecord && drawerRecord.id === id) {
          setDrawerRecord(updated);
        }

        return updated;
      })
    );

    toast.success(`Authorization ${id} status updated to ${newStatus}`);
  };

  // Filtered Records based on tab, search, and dropdown filters
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Tab filter
      if (activeTab === "SKILLED") {
        if (rec.careCategory !== "SKILLED_CARE") return false;
      } else if (activeTab === "NON_MEDICAL") {
        if (rec.careCategory !== "NON_MEDICAL") return false;
      } else if (activeTab === "PENDING") {
        if (rec.status !== "PENDING" && rec.status !== "REQUESTED") return false;
      } else if (activeTab === "EXHAUSTED") {
        const remaining = rec.unitsApproved - rec.unitsUsed;
        const pct = (remaining / rec.unitsApproved) * 100;
        if (remaining > 30 && pct > 15 && rec.status === "APPROVED") return false;
      } else if (activeTab === "DENIED") {
        if (rec.status !== "DENIED") return false;
      }

      // Dropdown filters
      if (selectedPayer !== "ALL" && !rec.payer.toLowerCase().includes(selectedPayer.toLowerCase())) {
        return false;
      }
      if (selectedCareType !== "ALL" && rec.careCategory !== selectedCareType) {
        return false;
      }
      if (selectedStatus !== "ALL" && rec.status !== selectedStatus) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesClient = rec.clientName.toLowerCase().includes(q);
        const matchesAuth = rec.id.toLowerCase().includes(q) || rec.internalId.toLowerCase().includes(q);
        const matchesHh = rec.householdName.toLowerCase().includes(q);
        const matchesPayer = rec.payer.toLowerCase().includes(q);
        const matchesService = rec.serviceName.toLowerCase().includes(q) || rec.serviceCode.toLowerCase().includes(q);
        const matchesCm = rec.caseManagerName.toLowerCase().includes(q);

        if (!matchesClient && !matchesAuth && !matchesHh && !matchesPayer && !matchesService && !matchesCm) {
          return false;
        }
      }

      return true;
    });
  }, [records, activeTab, selectedPayer, selectedCareType, selectedStatus, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* ----------------------------------------------------------------- */}
      {/* 01. Clean Executive Header & Controls */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#3D6B22] uppercase tracking-wider bg-[#3D6B22]/10 px-2.5 py-0.5 rounded-full border border-[#3D6B22]/20">
              Payer Approvals & Lifecycle
            </span>
            <span className="text-xs text-slate-400 font-medium">&bull; Skilled & Non-Medical Home Care</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Authorizations Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track payer approvals, authorized service units, remaining visit balances, and renewal cycles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-slate-500", isSyncing && "animate-spin text-[#3D6B22]")} />
            <span>Sync Portals</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreateEditRecord(null);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Authorization</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 02. Essential UX Distinction Callout */}
      {/* ----------------------------------------------------------------- */}
      {showDistinctionBanner && (
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 sm:p-4 flex items-start justify-between gap-3 text-xs text-slate-700 shadow-2xs relative">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22] shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 pr-2">
              <span className="font-bold text-slate-900 block text-xs">
                Important Operational Distinction: Authorization vs. Insurance Verification
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>Authorization</strong> represents explicit payer approval for a specific service (HCPCS code, approved unit/visit volume, and validity dates). It is distinct from <strong>Insurance Verification</strong>, which confirms policy eligibility, co-pays, and patient benefit coverage. Service delivery and billing claims are gated by active authorization.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDistinctionBanner(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 03. Contextual Urgent Alerts (Expiring / Exhausted Units) */}
      {/* ----------------------------------------------------------------- */}
      {(kpis.exhaustedOrCritical > 0 || kpis.expiringIn30Days > 0 || kpis.deniedCount > 0) && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="flex flex-wrap items-center gap-1.5 font-medium">
              <span className="font-bold">Attention Required:</span>
              {kpis.exhaustedOrCritical > 0 && (
                <span className="text-rose-700 font-semibold">
                  {kpis.exhaustedOrCritical} authorization(s) exhausted or near limit &bull;
                </span>
              )}
              {kpis.expiringIn30Days > 0 && (
                <span className="text-amber-800 font-semibold">
                  {kpis.expiringIn30Days} expiring within 45 days &bull;
                </span>
              )}
              {kpis.deniedCount > 0 && (
                <span className="text-rose-700 font-semibold">
                  {kpis.deniedCount} denied by payer
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("EXHAUSTED")}
            className="text-xs font-bold text-amber-900 bg-white/90 hover:bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Filter Critical Approvals &rarr;
          </button>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 04. Clean KPI Overview */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Active Approvals */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs hover:border-[#3D6B22]/50 hover:shadow-md transition-all duration-200 overflow-hidden p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved & Active
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpis.totalActiveApproved}
            </span>
            <span className="text-xs font-medium text-slate-500">
              / {records.length} records
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="font-semibold text-purple-700">{kpis.skilledActive} skilled</span>
            <span>&bull;</span>
            <span className="font-semibold text-blue-700">{kpis.nonMedicalActive} non-medical</span>
          </div>
        </div>

        {/* Metric 2: Remaining Approved Units */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs hover:border-[#3D6B22]/50 hover:shadow-md transition-all duration-200 overflow-hidden p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Remaining Units
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#3D6B22]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpis.totalRemainingUnits.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500">
              balance
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-slate-700">{kpis.totalUsedUnits.toLocaleString()}</span>
            <span>used of {kpis.totalApprovedUnits.toLocaleString()} approved</span>
          </div>
        </div>

        {/* Metric 3: Pending & Requested */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs hover:border-[#3D6B22]/50 hover:shadow-md transition-all duration-200 overflow-hidden p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Payer Decision
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpis.totalPendingRequests}
            </span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
              Awaiting Determination
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Care locked until formal Notice of Action
          </div>
        </div>

        {/* Metric 4: Expiring & Exhausted Alerts */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs hover:border-[#3D6B22]/50 hover:shadow-md transition-all duration-200 overflow-hidden p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Renewal & Risk Queue
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-700">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpis.exhaustedOrCritical + kpis.expiringIn30Days}
            </span>
            <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded">
              Action Required
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>{kpis.exhaustedOrCritical} exhausted</span>
            <span>&bull;</span>
            <span>{kpis.expiringIn30Days} expiring soon</span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 05. Simple Searchable Toolbar & Navigation Tabs */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "All Authorizations", count: records.length },
              { id: "SKILLED", label: "Skilled Health Care", count: kpis.skilledActive },
              { id: "NON_MEDICAL", label: "Non-Medical Care", count: kpis.nonMedicalActive },
              {
                id: "PENDING",
                label: "Pending / Requested",
                count: kpis.totalPendingRequests,
                badgeColor: "bg-amber-100 text-amber-800",
              },
              {
                id: "EXHAUSTED",
                label: "Low Units / Expiring",
                count: kpis.exhaustedOrCritical + kpis.expiringIn30Days,
                badgeColor: "bg-rose-100 text-rose-800",
              },
              {
                id: "DENIED",
                label: "Denied / In Appeal",
                count: kpis.deniedCount,
                badgeColor: "bg-slate-200 text-slate-700",
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
                    isActive
                      ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                      isActive
                        ? "bg-white/20 text-white"
                        : tab.badgeColor || "bg-slate-200 text-slate-700"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredRecords.length} of {records.length} records
          </span>
        </div>

        {/* Search & Filter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, auth #, case manager..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 placeholder:text-slate-400 transition-all"
            />
          </div>

          {/* Care Category Filter */}
          <div className="relative">
            <select
              value={selectedCareType}
              onChange={(e) => setSelectedCareType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-700 appearance-none cursor-pointer"
            >
              <option value="ALL">All Care Categories</option>
              <option value="SKILLED_CARE">Skilled Home Health Care</option>
              <option value="NON_MEDICAL">Non-Medical Home Care</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Payer Filter */}
          <div className="relative">
            <select
              value={selectedPayer}
              onChange={(e) => setSelectedPayer(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-700 appearance-none cursor-pointer"
            >
              <option value="ALL">All Payers</option>
              <option value="Colorado Medicaid">Colorado Medicaid (Health First)</option>
              <option value="CES Waiver">CES Waiver</option>
              <option value="CHRP Waiver">CHRP Waiver</option>
              <option value="UnitedHealthcare">UnitedHealthcare Commercial</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-700 appearance-none cursor-pointer"
            >
              <option value="ALL">All Approval Statuses</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PENDING">PENDING</option>
              <option value="REQUESTED">REQUESTED</option>
              <option value="DENIED">DENIED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 06. Patient-Centric Authorizations Table */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs hover:border-[#3D6B22]/50 hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Patient & Category</th>
                <th className="py-3 px-4">Payer & Auth Reference #</th>
                <th className="py-3 px-4">Service & Code</th>
                <th className="py-3 px-4">Approved / Used</th>
                <th className="py-3 px-4">Remaining Units</th>
                <th className="py-3 px-4">Effective Term</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-slate-700">No authorizations match your query</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting your search filters or active tab.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const remaining = Math.max(0, record.unitsApproved - record.unitsUsed);
                  const burnRate = Math.round((record.unitsUsed / record.unitsApproved) * 100);
                  const isExhausted = remaining <= 30 || burnRate >= 90;
                  const isSkilled = record.careCategory === "SKILLED_CARE";

                  return (
                    <tr
                      key={record.id}
                      onClick={() => setDrawerRecord(record)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* 1. Patient & Care Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22] font-bold text-xs shrink-0">
                            {record.clientName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors block">
                              {record.clientName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={cn(
                                  "px-1.5 py-0.2 rounded text-[10px] font-bold",
                                  isSkilled
                                    ? "bg-purple-50 text-purple-700"
                                    : "bg-blue-50 text-blue-700"
                                )}
                              >
                                {isSkilled ? "Skilled Health" : "Non-Medical"}
                              </span>
                              <span className="text-[11px] text-slate-400">&bull; {record.householdName}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Payer & Auth Ref # */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block text-xs">
                          {record.payer}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                            {record.id}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[150px]">
                          Policy: {record.insurancePolicyId}
                        </span>
                      </td>

                      {/* 3. Service & Code */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {record.serviceName}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 px-1.5 py-0.5 rounded mt-0.5">
                          {record.serviceCode}
                          {record.modifier ? `-${record.modifier}` : ""}
                        </span>
                      </td>

                      {/* 4. Approved / Used */}
                      <td className="py-3.5 px-4 min-w-[130px]">
                        <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                          <span className="text-slate-600">
                            {record.unitsUsed} / {record.unitsApproved}
                          </span>
                          <span
                            className={cn(
                              "font-bold",
                              burnRate >= 90
                                ? "text-rose-600"
                                : burnRate >= 75
                                ? "text-amber-600"
                                : "text-emerald-700"
                            )}
                          >
                            {burnRate}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-300",
                              burnRate >= 90
                                ? "bg-rose-500"
                                : burnRate >= 75
                                ? "bg-amber-500"
                                : "bg-[#3D6B22]"
                            )}
                            style={{ width: `${Math.min(burnRate, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {record.unitMeasure}
                        </span>
                      </td>

                      {/* 5. Remaining Units */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={cn(
                              "text-sm font-extrabold",
                              isExhausted ? "text-rose-600" : "text-slate-900"
                            )}
                          >
                            {remaining}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {record.unitMeasure === "Visits" ? "visits" : "units"}
                          </span>
                        </div>
                        {isExhausted && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 mt-0.5 inline-block">
                            Low Units
                          </span>
                        )}
                      </td>

                      {/* 6. Effective Term */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-700 font-medium block">
                          {record.expirationDate}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          From: {record.effectiveDate}
                        </span>
                      </td>

                      {/* 7. Status */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs",
                            record.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : record.status === "PENDING" || record.status === "REQUESTED"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : record.status === "DENIED"
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          )}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {record.status}
                        </span>
                      </td>

                      {/* 8. Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Open Detailed Drawer"
                            onClick={() => setDrawerRecord(record)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#3D6B22] hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Edit Authorization"
                            onClick={() => {
                              setCreateEditRecord(record);
                              setIsCreateModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#3D6B22] hover:bg-slate-100 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="View Attached Documents"
                            onClick={() => setEvidenceRecord(record)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#3D6B22] hover:bg-slate-100 transition-colors"
                          >
                            <FileSignature className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 07. Detailed Slide-Over Flyout Drawer */}
      {/* ----------------------------------------------------------------- */}
      <AuthorizationDrawer
        isOpen={!!drawerRecord}
        onClose={() => setDrawerRecord(null)}
        record={drawerRecord}
        onEdit={(rec) => {
          setCreateEditRecord(rec);
          setIsCreateModalOpen(true);
        }}
        onOpenEvidence={(rec) => setEvidenceRecord(rec)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* ----------------------------------------------------------------- */}
      {/* 08. Create & Edit Authorization Modal */}
      {/* ----------------------------------------------------------------- */}
      <CreateEditAuthorizationModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateEditRecord(null);
        }}
        recordToEdit={createEditRecord}
        onSave={handleSaveRecord}
      />

      {/* ----------------------------------------------------------------- */}
      {/* 09. Evidence / NOA Viewer Modal */}
      {/* ----------------------------------------------------------------- */}
      <EvidenceViewerModal
        isOpen={!!evidenceRecord}
        onClose={() => setEvidenceRecord(null)}
        record={evidenceRecord}
      />
    </div>
  );
}
