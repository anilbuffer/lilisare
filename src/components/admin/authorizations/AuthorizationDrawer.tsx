"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  FileText,
  User,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Download,
  Eye,
  FileSignature,
  Edit3,
  ExternalLink,
  History,
  Phone,
  Mail,
  Home,
  Activity,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { cn } from "@/components/ui/Card";
import { AuthorizationRecord, AuthorizationStatus } from "@/lib/admin/authorizationsData";

interface AuthorizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  record: AuthorizationRecord | null;
  onEdit: (record: AuthorizationRecord) => void;
  onOpenEvidence: (record: AuthorizationRecord) => void;
  onUpdateStatus: (id: string, newStatus: AuthorizationStatus, reason: string) => void;
}

export function AuthorizationDrawer({
  isOpen,
  onClose,
  record,
  onEdit,
  onOpenEvidence,
  onUpdateStatus,
}: AuthorizationDrawerProps) {
  if (!record) return null;

  const remainingUnits = Math.max(0, record.unitsApproved - record.unitsUsed);
  const burnRate = Math.round((record.unitsUsed / record.unitsApproved) * 100);
  const isExhausted = remainingUnits <= 30 || burnRate >= 90;
  const isApproved = record.status === "APPROVED";
  const isSkilled = record.careCategory === "SKILLED_CARE";

  // Days until expiration calculation
  const now = new Date("2026-05-23");
  const expDate = new Date(record.expirationDate);
  const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full"
            >
              {/* Drawer Top Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-white relative">
                <div className="flex items-start gap-3.5 pr-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22] font-bold text-base shrink-0 mt-0.5">
                    {record.clientName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          isSkilled
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        )}
                      >
                        {isSkilled ? "Skilled Health Care" : "Non-Medical Home Care"}
                      </span>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          record.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : record.status === "PENDING" || record.status === "REQUESTED"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : record.status === "DENIED"
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                        )}
                      >
                        {record.status}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {record.clientName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>Auth Ref: <strong className="text-slate-700 font-mono">{record.id}</strong></span>
                      <span>&bull;</span>
                      <span>Household: <strong className="text-slate-700">{record.householdName}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEdit(record)}
                    className="p-2 rounded-xl text-slate-500 hover:text-[#3D6B22] hover:bg-slate-100 transition-colors"
                    title="Edit Authorization"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-700">
                {/* 1. Remaining Approved Units & Exhaustion Meter */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#3D6B22]" />
                      Approved Units & Utilization Meter
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Unit Measure: <strong className="text-slate-800">{record.unitMeasure}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Approved</span>
                      <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                        {record.unitsApproved}
                      </span>
                      <span className="text-[10px] text-slate-400">{record.unitMeasure} total</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Used to Date</span>
                      <span className="text-lg font-bold text-slate-700 mt-0.5 block">
                        {record.unitsUsed}
                      </span>
                      <span className="text-[10px] text-slate-400">{burnRate}% consumed</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Remaining Units</span>
                      <span
                        className={cn(
                          "text-lg font-extrabold mt-0.5 block",
                          isExhausted ? "text-rose-600" : "text-[#3D6B22]"
                        )}
                      >
                        {remainingUnits}
                      </span>
                      <span className="text-[10px] text-slate-400">Approved balance</span>
                    </div>
                  </div>

                  {/* Visual Burn Gauge */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Utilization Rate</span>
                      <span
                        className={cn(
                          "font-bold",
                          burnRate >= 90 ? "text-rose-600" : burnRate >= 75 ? "text-amber-600" : "text-emerald-700"
                        )}
                      >
                        {burnRate}% ({record.unitsUsed} of {record.unitsApproved} {record.unitMeasure})
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-300",
                          burnRate >= 90 ? "bg-rose-500" : burnRate >= 75 ? "bg-amber-500" : "bg-[#3D6B22]"
                        )}
                        style={{ width: `${Math.min(burnRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Contextual Warning if Low/Exhausted */}
                  {isExhausted && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-900 flex items-start gap-2.5">
                      <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Low Unit Alert</span>
                        <p className="text-[11px] text-rose-800 leading-relaxed mt-0.5">
                          Only {remainingUnits} {record.unitMeasure} remaining on this authorization. Billed visits will be blocked once balance reaches 0. Prepare a renewal request to avoid care disruption.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Expiration Alert */}
                  {diffDays > 0 && diffDays <= 45 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Expiring in {diffDays} Days</span>
                        <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                          This approval term concludes on {record.expirationDate}. Case Manager redetermination is required before expiration.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. UX Distinction Note (Policy Reminder) */}
                <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3.5 flex items-start gap-2.5 text-[11px] text-emerald-950">
                  <Info className="w-4 h-4 text-[#3D6B22] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-emerald-900 mb-0.5">
                      Authorization vs. Insurance Eligibility
                    </span>
                    <p className="text-emerald-800 leading-relaxed">
                      This record represents <strong>payer approval for a specific service</strong> ({record.serviceName}, code {record.serviceCode}, {record.unitsApproved} {record.unitMeasure}). It is distinct from Insurance Verification, which checks overall policy active status.
                    </p>
                  </div>
                </div>

                {/* 3. Payer & Procedure Specification */}
                <div className="space-y-3">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                    Payer & Service Specifications
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Payer Organization</span>
                      <span className="font-bold text-slate-900 text-xs mt-0.5 block">{record.payer}</span>
                      <span className="text-[11px] text-slate-500">{record.payerPlan}</span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Insurance Policy ID</span>
                      <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">{record.insurancePolicyId}</span>
                      <span className="text-[11px] text-slate-500">Verified Member Plan</span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Service Procedure</span>
                      <span className="font-bold text-slate-900 text-xs mt-0.5 block">{record.serviceName}</span>
                      <span className="font-mono text-[#3D6B22] font-semibold text-[11px]">
                        HCPCS: {record.serviceCode}{record.modifier ? `-${record.modifier}` : ""}
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Primary Diagnosis</span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block">{record.diagnosisCode}</span>
                      <span className="text-[11px] text-slate-500">ICD-10 Clinical Indication</span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Effective Dates</span>
                      <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                        {record.effectiveDate} &rarr; {record.expirationDate}
                      </span>
                      <span className="text-[11px] text-slate-500">12-Month Coverage Period</span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Financial Rates</span>
                      <span className="font-bold text-emerald-700 text-xs mt-0.5 block">
                        Bill: ${record.billRate.toFixed(2)} / {record.unitMeasure === "Visits" ? "visit" : "unit"}
                      </span>
                      <span className="text-[11px] text-slate-500">Pay: ${record.payRate.toFixed(2)} / unit</span>
                    </div>
                  </div>
                </div>

                {/* 4. Case Manager & Coordination Relationship */}
                <div className="space-y-3">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#3D6B22]" />
                    Case Manager & Coordination Contact
                  </h3>

                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{record.caseManagerName}</span>
                        <p className="text-[11px] text-slate-500">{record.caseManagerAgency}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        Designated SEP / CCB
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{record.caseManagerPhone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{record.caseManagerEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Attached Authorization Documents */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <FileSignature className="w-3.5 h-3.5 text-[#3D6B22]" />
                      Attached Authorization Documents ({record.documents.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => onOpenEvidence(record)}
                      className="text-[#3D6B22] font-semibold hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      View Notice of Action <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {record.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs hover:border-[#3D6B22]/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                            <FileText className="w-4 h-4 text-[#3D6B22]" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 block truncate text-xs">
                              {doc.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {doc.type} &bull; {doc.fileSize} &bull; Uploaded {doc.uploadedAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold",
                              doc.verificationStatus === "VERIFIED"
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-amber-50 text-amber-800"
                            )}
                          >
                            {doc.verificationStatus}
                          </span>
                          <button
                            type="button"
                            onClick={() => onOpenEvidence(record)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700"
                            title="Inspect Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Status Audit History */}
                <div className="space-y-3">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-[#3D6B22]" />
                    Payer Approval Lifecycle & Audit History
                  </h3>

                  <div className="space-y-2">
                    {record.statusHistory.map((h, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs">{h.status}</span>
                            <span className="text-slate-400">&bull;</span>
                            <span className="text-slate-600 text-[11px]">{h.changedBy}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{h.reason}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{h.changedAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Sticky Footer / Action Buttons */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {record.status !== "APPROVED" && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(record.id, "APPROVED", "Verified official payer approval determination")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Activate
                    </button>
                  )}

                  {record.status !== "DENIED" && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(record.id, "DENIED", "Recorded payer formal denial notice")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Record Denial
                    </button>
                  )}

                  {record.status === "APPROVED" && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(record.id, "REQUESTED", "Submitted PAR extension request to Case Manager")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Request Renewal
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onEdit(record)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  Edit Details
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
