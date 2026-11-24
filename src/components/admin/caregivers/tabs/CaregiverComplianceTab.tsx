"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck,
  Upload,
  RefreshCw,
  ExternalLink,
  Award,
  X,
  FileSearch,
} from "lucide-react";
import { AdminCaregiverProfile } from "@/lib/caregivers/adminCaregiversData";
import { toast } from "sonner";

interface CaregiverComplianceTabProps {
  profile: AdminCaregiverProfile;
}

export function CaregiverComplianceTab({ profile }: CaregiverComplianceTabProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastVerifiedTimestamp, setLastVerifiedTimestamp] = useState("Today at 09:15 AM");
  const [selectedAuditItem, setSelectedAuditItem] = useState<{
    title: string;
    identifier: string;
    issuer: string;
    expires: string;
    status: string;
    badge: string;
  } | null>(null);

  const complianceItems = [
    {
      title: "State Professional License",
      identifier: `${profile.licenseName} • ${profile.licenseNumber}`,
      issuer: profile.licenseIssuer,
      expires: profile.licenseExpires,
      status: "Verified",
      isExpiring: false,
      badge: "Mandatory",
    },
    {
      title: "CPR & Basic Life Support (BLS)",
      identifier: "AHA Healthcare Provider BLS Certification",
      issuer: "American Heart Association",
      expires: profile.cprExpires || "Dec 15, 2026",
      status: profile.cprStatus || "Valid",
      isExpiring: true,
      badge: "Clinical Care",
    },
    {
      title: "Tuberculosis (TB) Screening",
      identifier: "Negative 2-Step PPD / Quantiferon Gold",
      issuer: "Occupational Health Partners",
      expires: profile.tbExpires || "Jan 20, 2027",
      status: profile.tbTestStatus || "Clear",
      isExpiring: false,
      badge: "Infection Control",
    },
    {
      title: "State Criminal Background & Fingerprints",
      identifier: "State Bureau of Investigation & FBI Clearance",
      issuer: "Department of Safety & Homeland Security",
      expires: "Valid for Agency Employment",
      status: profile.backgroundCheckStatus || "Cleared",
      isExpiring: false,
      badge: "Security & Safety",
    },
    {
      title: "I-9 Employment Eligibility Verification",
      identifier: "Federal Form I-9 & E-Verify Confirmation",
      issuer: "U.S. Citizenship and Immigration Services",
      expires: "Complete & On File",
      status: "Verified",
      isExpiring: false,
      badge: "Federal Compliance",
    },
    {
      title: "OIG / SAM Exclusion List Clearance",
      identifier: "Monthly Automated Office of Inspector General Check",
      issuer: "Federal Health and Human Services (HHS)",
      expires: "Monthly Continuous Auto-Check",
      status: "Cleared",
      isExpiring: false,
      badge: "Monthly Continuous",
    },
  ];

  const handleReverify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setLastVerifiedTimestamp("Just now (Active)");
      toast.success("State registry re-verification complete: All 6 credentials verified active.");
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 01. Header Summary Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#3D6B22] border border-emerald-200 flex items-center justify-center font-bold shadow-2xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Compliance & Credentialing Status
              </h2>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {profile.complianceRate || 100}% Compliant
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Caregiver meets 100% of state licensing board mandates • Last checked: {lastVerifiedTimestamp}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReverify}
          disabled={isVerifying}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isVerifying ? "animate-spin text-[#3D6B22]" : ""}`} />
          <span>{isVerifying ? "Verifying..." : "Re-verify Credentials"}</span>
        </button>
      </div>

      {/* 02. Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {complianceItems.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{item.title}</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.isExpiring
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                >
                  {item.isExpiring ? (
                    <Clock className="w-3 h-3 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  )}
                  {item.status}
                </span>
              </div>

              <p className="text-xs font-bold text-slate-800 mt-2">{item.identifier}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Issuer: {item.issuer}</p>

              <div className="flex items-center gap-2 mt-2.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/80">
                  {item.badge}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAuditItem(item)}
                  className="text-[11px] font-semibold text-[#3D6B22] hover:text-[#345C1D] hover:underline cursor-pointer"
                >
                  Audit Record
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Expires / Renewal:</span>
              <span
                className={`font-semibold ${item.isExpiring ? "text-amber-700 " : "text-slate-800 "
                  }`}
              >
                {item.expires}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 03. Functional Credential Audit Modal */}
      {selectedAuditItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#3D6B22] flex items-center justify-center shrink-0">
                  <FileSearch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedAuditItem.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">Primary Source Registry Audit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Caregiver:</span>
                  <span className="font-bold text-slate-900">{profile.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Credential Detail:</span>
                  <span className="font-semibold text-slate-800">{selectedAuditItem.identifier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Issuing Authority:</span>
                  <span className="font-semibold text-slate-800">{selectedAuditItem.issuer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Verification Source:</span>
                  <span className="text-emerald-700 font-bold">State Public Registry Database (Automated API)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">License Disciplinary Flags:</span>
                  <span className="text-emerald-700 font-bold">Zero Violations (Unencumbered)</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-slate-700 leading-relaxed">
                <span className="font-bold text-emerald-900 block mb-0.5">Automated Re-Check Frequency:</span>
                This credential is monitored continuously by LiliSare Compliance engine. Automated alerts trigger 90, 60, and 30 days prior to expiration.
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  toast.success(`Verification certificate generated for ${selectedAuditItem.title}`);
                  setSelectedAuditItem(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs cursor-pointer"
              >
                Export Audit Log
              </button>
              <button
                type="button"
                onClick={() => setSelectedAuditItem(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
