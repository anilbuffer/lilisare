"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { ShieldCheck, Printer, UserCheck, Building2, CheckCircle2, AlertTriangle, FileSignature } from "lucide-react";
import { AuthorizationRecord } from "@/lib/admin/authorizationsData";

interface EvidenceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AuthorizationRecord | null;
}

export function EvidenceViewerModal({ isOpen, onClose, record }: EvidenceViewerModalProps) {
  if (!record) return null;

  const doc = record.documents[0] || {
    id: `DOC-${record.id}`,
    name: "Notice of Action (NOA) - Service Approval Determination.pdf",
    type: "Notice of Action (NOA)",
    fileSize: "1.4 MB",
    uploadedAt: record.effectiveDate,
    uploadedBy: "Marcus Vance (Agency Admin)",
    verificationStatus: record.status === "APPROVED" ? "VERIFIED" : "PENDING_REVIEW",
  };

  const isVerified = doc.verificationStatus === "VERIFIED";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Required Authorization Approval Evidence"
      description={`Official Notice of Action & Payer Determination for ${record.clientName}`}
      maxWidth="3xl"
      icon={<FileSignature className="w-5 h-5 text-[#3D6B22]" />}
      headerAction={
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isVerified
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            {isVerified ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified & Enforced
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Pending Verification
              </>
            )}
          </span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3D6B22]" />
            <span>Document ID: {doc.id} &bull; {doc.fileSize}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all cursor-pointer"
            >
              Done Reviewing
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Document Header & State Seal Simulation */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3D6B22]/5 rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#3D6B22]">
                <Building2 className="w-3.5 h-3.5" />
                <span>{record.payer} &bull; {record.payerPlan}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                {doc.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official Authorization Reference: <span className="font-semibold text-slate-700 font-mono">{record.id}</span>
                <span className="mx-2">&bull;</span>
                Member Policy ID: <span className="font-mono text-slate-600">{record.insurancePolicyId}</span>
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-right shadow-2xs min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Uploaded Date</span>
              <span className="text-xs font-bold text-slate-800">{doc.uploadedAt}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Status: {doc.verificationStatus}</span>
            </div>
          </div>

          {/* Key Document Data Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Beneficiary / Patient</span>
              <span className="font-bold text-slate-800">{record.clientName}</span>
              <span className="text-slate-500 block text-[11px]">{record.clientId} &bull; {record.householdName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Approved Service</span>
              <span className="font-bold text-slate-800">{record.serviceName}</span>
              <span className="font-mono text-[#3D6B22] font-semibold block text-[11px]">HCPCS: {record.serviceCode}{record.modifier ? `-${record.modifier}` : ""}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Approved Units</span>
              <span className="font-bold text-slate-800">{record.unitsApproved} {record.unitMeasure}</span>
              <span className="text-slate-500 block text-[11px]">Cap: {record.weeklyCapUnits || 20}/wk</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Authorized Term</span>
              <span className="font-bold text-slate-800">{record.effectiveDate} to {record.expirationDate}</span>
              <span className="text-emerald-700 font-semibold block text-[11px]">Bill: ${record.billRate.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Case Manager Determination & Attestation */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#3D6B22]" />
              Case Manager Determination & Written Attestation
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">Formal Payer Approval Record</span>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/70 rounded-lg p-3 text-xs text-slate-700 leading-relaxed">
            <p className="font-medium">
              &quot;I hereby certify that I have conducted the required clinical and functional level of care review for 
              <strong className="text-slate-900"> {record.clientName} </strong> under {record.payer} guidelines. 
              Services under code <strong className="text-slate-900">{record.serviceCode}</strong> are authorized for a total volume of 
              <strong className="text-slate-900"> {record.unitsApproved} {record.unitMeasure}</strong>. Caregiver participation is approved subject to 
              applicable Colorado Medicaid / payer onboarding and clinical supervision standards.&quot;
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/40">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Case Manager Name</span>
              <span className="font-bold text-slate-800">{record.caseManagerName}</span>
              <span className="text-slate-500 block text-[11px]">{record.caseManagerAgency}</span>
            </div>
            <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/40">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Coordinates</span>
              <span className="font-medium text-slate-700">{record.caseManagerPhone}</span>
              <span className="text-slate-500 block text-[11px] truncate">{record.caseManagerEmail}</span>
            </div>
            <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/40">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Verification State</span>
              {isVerified ? (
                <>
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified by Admin
                  </span>
                  <span className="text-slate-500 block text-[11px]">{doc.uploadedBy}</span>
                </>
              ) : (
                <span className="font-bold text-amber-700">Verification Pending</span>
              )}
            </div>
          </div>
        </div>

        {/* Operational Scope Policy Banner */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#3D6B22] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Authorization Gate Enforced:</span>
            <p className="text-emerald-900 leading-relaxed">
              Caregiver onboarding completion alone does NOT authorize service delivery. Scheduling and EVV claims remain locked until this approval evidence is verified and matched to active service codes in the system.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
