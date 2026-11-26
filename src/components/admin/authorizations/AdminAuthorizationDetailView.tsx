"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Edit3,
  Calendar,
  Clock,
  User,
  Home,
  FileText,
  FileSignature,
  Activity,
  AlertTriangle,
  AlertOctagon,
  Building2,
  CheckCircle2,
  Download,
  ExternalLink,
  History,
  Phone,
  Mail,
  Receipt,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  Printer,
  Copy,
  Check,
  UploadCloud,
  FileCheck,
  TrendingUp,
  Percent,
  Lock,
  ArrowRight,
  Shield,
  Stethoscope,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Card, cn } from "@/components/ui/Card";
import {
  ResponsiveDomainTabStrip,
  DomainTabItem,
} from "@/components/ui/ResponsiveDomainTabStrip";
import {
  AuthorizationRecord,
  AuthorizationStatus,
  getAuthorizationById,
  upsertAuthorizationRecord,
} from "@/lib/admin/authorizationsData";
import { EvidenceViewerModal } from "./EvidenceViewerModal";

interface AdminAuthorizationDetailViewProps {
  authId: string;
}

type AuthDetailTab = "overview" | "payer" | "connected" | "documents" | "audit";

export function AdminAuthorizationDetailView({ authId }: AdminAuthorizationDetailViewProps) {
  const router = useRouter();
  const [record, setRecord] = useState<AuthorizationRecord | null>(null);
  const [activeTab, setActiveTab] = useState<AuthDetailTab>("overview");
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [evidenceDocRecord, setEvidenceDocRecord] = useState<AuthorizationRecord | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [docFilter, setDocFilter] = useState<string>("ALL");

  useEffect(() => {
    const item = getAuthorizationById(authId);
    if (item) {
      setRecord(item);
    }
  }, [authId]);

  if (!record) {
    return (
      <div className="w-full max-w-9xl mx-auto py-16 text-center text-slate-500">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Authorization Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          The requested authorization ID <span className="font-semibold text-slate-700">"{authId}"</span> could not be loaded or has been archived.
        </p>
        <Link
          href="/admin/authorizations"
          className="inline-flex items-center gap-2 px-3.5 py-2 mt-5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Authorizations Directory</span>
        </Link>
      </div>
    );
  }

  const remainingUnits = Math.max(0, record.unitsApproved - record.unitsUsed);
  const burnRate = Math.round((record.unitsUsed / record.unitsApproved) * 100);
  const isExhausted = remainingUnits <= 30 || burnRate >= 90;
  const isSkilled = record.careCategory === "SKILLED_CARE";

  // Days until expiration calculation
  const now = new Date();
  const expDate = new Date(record.expirationDate);
  const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const handleUpdateStatus = (newStatus: AuthorizationStatus) => {
    setIsStatusMenuOpen(false);
    const updatedHistory = [
      {
        status: newStatus,
        changedAt: new Date().toISOString().slice(0, 10),
        changedBy: "Marcus Vance (Agency Admin)",
        reason: `Status manually changed to ${newStatus} via Admin Authorization Workspace`,
      },
      ...record.statusHistory,
    ];

    const updated: AuthorizationRecord = {
      ...record,
      status: newStatus,
      statusHistory: updatedHistory,
    };

    upsertAuthorizationRecord(updated);
    setRecord(updated);
    toast.success(`Authorization status updated to ${newStatus}`);
  };

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${record.serviceCode}${record.modifier ? `-${record.modifier}` : ""}`);
      setCopiedCode(true);
      toast.success("Billing code copied to clipboard");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const tabsWithBadges: DomainTabItem<AuthDetailTab>[] = [
    { id: "overview", label: "OVERVIEW & UTILIZATION", minWidth: 150, badge: `${burnRate}%` },
    { id: "payer", label: "PAYER & CASE MANAGER", minWidth: 155, badge: record.payer.split(" ")[0] },
    { id: "connected", label: "CONNECTED JOURNEYS", minWidth: 145, badge: "3 Links" },
    { id: "documents", label: "DOCUMENTS & EVIDENCE", minWidth: 155, badge: `${record.documents.length}` },
    { id: "audit", label: "STATUS HISTORY & AUDIT", minWidth: 150, badge: `${record.statusHistory.length}` },
  ];

  const filteredDocs = docFilter === "ALL"
    ? record.documents
    : record.documents.filter((d) => d.type.toLowerCase().includes(docFilter.toLowerCase()));

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* ----------------------------------------------------------------- */}
      {/* 01. Breadcrumb & Back Link */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/authorizations"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer w-fit group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Authorizations Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print Record</span>
          </button>
          <Link
            href={`/admin/authorizations/${record.id}/edit`}
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Authorization</span>
          </Link>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 02. Executive Authorization Header Card */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22] font-bold text-base shrink-0">
              {record.clientName.charAt(0)}
            </div>
            <div className="space-y-0.5">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {record.clientName}
              </h1>
              <p className="text-xs text-slate-500">
                Auth Ref #: <strong className="text-slate-800 font-semibold">{record.id}</strong>
              </p>
            </div>
          </div>

          {/* Quick Actions & Status Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5 border-t lg:border-t-0 pt-4 lg:pt-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                className="inline-flex items-center justify-between gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer min-w-[150px]"
              >
                <span>Status: <strong className="text-slate-900">{record.status}</strong></span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isStatusMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                  {(["APPROVED", "REQUESTED", "PENDING", "DENIED", "EXPIRED"] as AuthorizationStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(st)}
                      className={cn(
                        "w-full text-left px-3.5 py-2 hover:bg-slate-50 font-medium flex items-center justify-between",
                        record.status === st ? "text-[#3D6B22] font-bold bg-[#3D6B22]/5" : "text-slate-700"
                      )}
                    >
                      <span>{st}</span>
                      {record.status === st && <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setEvidenceDocRecord(record)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              <FileSignature className="w-3.5 h-3.5 text-slate-500" />
              <span>Attached Documents ({record.documents.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 03. Live Utilization Metric Cards */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Units Approved & Burn Rate */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved Units
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {record.unitsApproved.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500">{record.unitMeasure}</span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
              <span>{record.unitsUsed.toLocaleString()} used</span>
              <span className={cn(burnRate >= 90 ? "text-rose-600" : "text-[#3D6B22]")}>
                {burnRate}% burn
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  burnRate >= 90 ? "bg-rose-500" : burnRate >= 75 ? "bg-amber-500" : "bg-[#3D6B22]"
                )}
                style={{ width: `${Math.min(burnRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Remaining Balance */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Remaining Units
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#3D6B22]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span
              className={cn(
                "text-lg sm:text-xl font-bold tracking-tight",
                isExhausted ? "text-rose-600" : "text-slate-900"
              )}
            >
              {remainingUnits.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500">remaining</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Weekly cap: {record.weeklyCapUnits || "No limit"} {record.unitMeasure}/wk</span>
          </div>
        </div>

        {/* Card 3: Financial Rates */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Unit Reimbursement
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              ${record.billRate.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-slate-500">bill / unit</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Pay rate: ${record.payRate.toFixed(2)}</span>
            <span className="font-semibold text-emerald-700">
              +${(record.billRate - record.payRate).toFixed(2)} spread
            </span>
          </div>
        </div>

        {/* Card 4: Validity & Expiration */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Validity Window
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              {record.expirationDate}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-slate-400">Effective:</span>
            <span className="font-medium text-slate-700">{record.effectiveDate}</span>
            {diffDays > 0 && diffDays <= 45 && (
              <span className="ml-auto text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 rounded">
                {diffDays}d left
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 04. Responsive Tab Strip Navigation */}
      {/* ----------------------------------------------------------------- */}
      <div>
        <ResponsiveDomainTabStrip
          tabs={tabsWithBadges}
          activeTab={activeTab}
          onSelectTab={(t) => setActiveTab(t)}
        />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 05. Tab Content Views */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* Card: Service Scope & Authorization Parameters */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Service Scope & Billing Parameters</h3>
                  <p className="text-[11px] text-slate-400">Payer approved procedure codes and scheduling guardrails</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer"
                title="Copy HCPCS Code"
              >
                {copiedCode ? <Check className="w-3 h-3 text-[#3D6B22]" /> : <Copy className="w-3 h-3 text-slate-400" />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Care Category</span>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider",
                    isSkilled
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  )}
                >
                  {isSkilled ? "Skilled Health Care" : "Non-Medical Home Care"}
                </span>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Approval Status</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border shadow-2xs",
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
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Authorized Service</span>
                <span className="font-bold text-slate-900 text-xs block">{record.serviceName}</span>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">HCPCS / CPT Code</span>
                <span className="font-mono font-bold text-slate-900 text-xs bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                  {record.serviceCode} {record.modifier ? `-${record.modifier}` : ""}
                </span>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Unit Measurement</span>
                <span className="font-semibold text-slate-800 text-xs block">{record.unitMeasure}</span>
                <span className="text-[10px] text-slate-400 block">4 units = 1 hr billable</span>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Weekly Scheduling Cap</span>
                <span className="font-semibold text-slate-800 text-xs block">
                  {record.weeklyCapUnits ? `${record.weeklyCapUnits} ${record.unitMeasure} / week` : "No strict weekly cap"}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block">Enforced in scheduler</span>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Standard Bill Rate</span>
                <span className="font-bold text-slate-900 text-xs block">${record.billRate.toFixed(2)} / unit</span>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Caregiver Pay Rate</span>
                <span className="font-bold text-slate-900 text-xs block">${record.payRate.toFixed(2)} / unit</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#3D6B22]" />
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Diagnostic Justification & ICD-10
                </span>
              </div>
              <p className="font-bold text-slate-900 text-xs">{record.diagnosisCode}</p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Medical necessity verified against Colorado state clinical review standards. Care notes must substantiate assistance with activities of daily living (ADLs) or skilled nursing intervention.
              </p>
            </div>
          </div>

          {/* Card: Burnout Trajectory & EVV Gating */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#3D6B22]">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">EVV Gating & Balance Trajectory</h3>
                <p className="text-[11px] text-slate-400">Shift enforcement and automated unit countdown</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Delivered & Claimed Units</span>
                  <span className="font-bold text-slate-900">
                    {record.unitsUsed.toLocaleString()} of {record.unitsApproved.toLocaleString()} {record.unitMeasure}
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      burnRate >= 90 ? "bg-rose-500" : burnRate >= 75 ? "bg-amber-500" : "bg-[#3D6B22]"
                    )}
                    style={{ width: `${Math.min(burnRate, 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Burn Rate</span>
                    <span className={cn("text-base font-extrabold", burnRate >= 90 ? "text-rose-600" : "text-slate-900")}>
                      {burnRate}%
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Available Balance</span>
                    <span className={cn("text-base font-extrabold", isExhausted ? "text-rose-600" : "text-[#3D6B22]")}>
                      {remainingUnits.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Lock className="w-4 h-4 text-[#3D6B22]" />
                  <span>Electronic Visit Verification (EVV) Pre-Validation</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Visits scheduled in LiliSare Scheduler are pre-validated against this authorization's active date range ({record.effectiveDate} to {record.expirationDate}) and weekly cap ({record.weeklyCapUnits || "none"}). Unauthorized or exhausted units lock scheduling automatically.
                </p>
              </div>

              {record.notes && (
                <div className="border border-amber-200/80 bg-amber-50/40 rounded-xl p-3.5 text-xs">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                    Coordinator Clinical Directives
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">{record.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "payer" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* Card: Payer & Policy Specification */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Payer Program & Benefit Identification</h3>
                <p className="text-[11px] text-slate-400">Carrier details, benefit waiver, and claims policy</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Payer Carrier Organization</span>
                <span className="font-bold text-slate-900 text-sm block">{record.payer}</span>
                <span className="text-[11px] text-slate-500 block">Colorado Medicaid State Plan & HCBS Network</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Benefit Plan / Waiver Category</span>
                <span className="font-semibold text-slate-800 text-xs block">{record.payerPlan}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Patient Policy / Medicaid ID
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-xs block">{record.insurancePolicyId}</span>
                  <span className="text-[10px] text-slate-500 block">Eligibility & co-pay verification</span>
                </div>

                <div className="bg-[#3D6B22]/5 p-3 rounded-xl border border-[#3D6B22]/20 space-y-1">
                  <span className="text-[10px] text-[#3D6B22] font-bold uppercase block">
                    Prior Authorization Ref #
                  </span>
                  <span className="font-mono font-bold text-[#3D6B22] text-xs block">{record.id}</span>
                  <span className="text-[10px] text-[#3D6B22]/80 block">Mandatory for claim payment</span>
                </div>
              </div>

              <div className="bg-blue-50/40 border border-blue-200/70 rounded-xl p-3.5 text-[11px] text-slate-700 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Regulatory Distinction Notice</span>
                </div>
                <p className="leading-relaxed text-slate-600">
                  The <strong>Patient Policy ID</strong> confirms active state enrollment and benefit eligibility. The <strong>Authorization Reference #</strong> ({record.id}) certifies formal utilization board determination approving {record.unitsApproved} units of service code {record.serviceCode}.
                </p>
              </div>
            </div>
          </div>

          {/* Card: Case Management Coordination */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#3D6B22]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Designated Single Entry Point (SEP) Case Manager</h3>
                <p className="text-[11px] text-slate-400">Direct liaison for renewals, appeals, and reassessments</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22] font-bold text-xs shrink-0">
                  {record.caseManagerName.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{record.caseManagerName}</span>
                  <span className="text-slate-500 text-[11px] block">{record.caseManagerAgency}</span>
                  <span className="text-[10px] text-[#3D6B22] font-semibold block mt-0.5">Assigned County Case Manager</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`tel:${record.caseManagerPhone}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-[#3D6B22]/40 hover:bg-[#3D6B22]/5 transition-all text-slate-700 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-[#3D6B22] shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Direct Phone</span>
                    <span className="font-bold text-xs text-slate-900 group-hover:text-[#3D6B22] transition-colors">{record.caseManagerPhone}</span>
                  </div>
                </a>

                <a
                  href={`mailto:${record.caseManagerEmail}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-[#3D6B22]/40 hover:bg-[#3D6B22]/5 transition-all text-slate-700 truncate group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-[#3D6B22] shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Email Inquiry</span>
                    <span className="font-bold text-xs text-slate-900 group-hover:text-[#3D6B22] transition-colors truncate block">{record.caseManagerEmail}</span>
                  </div>
                </a>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 uppercase tracking-wider">Re-Authorization Milestone Window</span>
                  <span className="font-bold text-[#3D6B22]">45-Day Advance Target</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Renewals must be submitted to {record.caseManagerName} at least 45 calendar days prior to expiration ({record.expirationDate}) along with the updated 60-day nursing summary or non-medical service log.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "connected" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#3D6B22]" />
              <span className="font-bold text-slate-900">Three Connected Journeys:</span>
              <span>Authorization units govern care delivery across patient, household, and agency operations.</span>
            </div>
            <span className="text-[11px] font-bold text-[#3D6B22] bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              Synchronized Ecosystem
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Journey 1: Client Profile Link */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Client Journey
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-2">{record.clientName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">DOB: {record.clientDob} &bull; {record.clientPhone}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Primary beneficiary authorized for home health services. Direct access to 17 domain clinical tabs, care plan, and medications.
                </p>
              </div>

              <Link
                href={`/admin/clients/${record.clientId}`}
                className="mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-[#3D6B22] hover:text-white border border-slate-200 rounded-xl transition-all cursor-pointer group"
              >
                <span>View Full Client Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Journey 2: Household Profile Link */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-700">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Household Hub
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-2">{record.householdName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Household Code: {record.householdId}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Household unit managing family caregivers, respite allocation, shared authorization caps, and home emergency protocols.
                </p>
              </div>

              <Link
                href={`/admin/households/${record.householdId}`}
                className="mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-purple-700 hover:text-white border border-slate-200 rounded-xl transition-all cursor-pointer group"
              >
                <span>View Household Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Journey 3: Agency Operations & Caregivers */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#3D6B22]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#3D6B22] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Agency & Scheduling
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-2">Active Care Team</h4>
                  <p className="text-xs text-slate-500 mt-0.5">EVV Validated Shifts</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Direct integration with Agency Scheduling. Shifts cannot exceed approved weekly units ({record.weeklyCapUnits || "none"}).
                </p>
              </div>

              <Link
                href="/admin/scheduling"
                className="mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-[#3D6B22] hover:text-white border border-slate-200 rounded-xl transition-all cursor-pointer group"
              >
                <span>Open Scheduling Roster</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attached Documents & Clinical Evidence</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Notice of Action (NOA), Prior Auth Requests (PAR), CMS-485 assessments, and payer determination letters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Document upload window: select file from device to attach")}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl transition-all shadow-md shadow-[#3D6B22]/20 cursor-pointer self-start sm:self-auto"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Clinical Document</span>
            </button>
          </div>

          {/* Document Filter Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["ALL", "Notice of Action", "Prior Auth", "Clinical Assessment"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setDocFilter(filter)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                  docFilter === filter
                    ? "bg-[#3D6B22] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {filter === "ALL" ? "All Documents" : filter}
              </button>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            {filteredDocs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No documents match this filter</p>
                <p className="text-slate-400 mt-0.5">Try selecting "All Documents" or upload a new file.</p>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div key={doc.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                      <FileSignature className="w-5 h-5 text-[#3D6B22]" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{doc.name}</span>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-600">{doc.type}</span>
                        <span>&bull;</span>
                        <span>{doc.fileSize}</span>
                        <span>&bull;</span>
                        <span>Uploaded by {doc.uploadedBy} on {doc.uploadedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        doc.verificationStatus === "VERIFIED"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      )}
                    >
                      {doc.verificationStatus}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEvidenceDocRecord(record)}
                      className="p-2 rounded-xl text-slate-500 hover:text-[#3D6B22] hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Preview Document Modal"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Authorization Lifecycle & Status History</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Auditable log of payer decisions, clinical renewals, unit adjustments, and administrative overrides.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
              <span>HIPAA Compliant Audit Trail</span>
            </div>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {record.statusHistory.map((entry, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#3D6B22]" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {entry.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">&bull; {entry.changedAt}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{entry.reason}</p>
                  <span className="text-[10px] text-slate-400 block">Logged by {entry.changedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 06. Evidence Viewer Modal */}
      {/* ----------------------------------------------------------------- */}
      <EvidenceViewerModal
        isOpen={!!evidenceDocRecord}
        onClose={() => setEvidenceDocRecord(null)}
        record={evidenceDocRecord}
      />
    </div>
  );
}
