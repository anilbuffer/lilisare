"use client";

import React, { useState } from "react";
import {
  Receipt,
  FileCheck,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  Plus,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Lock,
} from "lucide-react";
import { ClientRecord } from "@/types/client";
import { PortalRole } from "../AdminClientDetailView";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientBillingTabProps {
  client: ClientRecord;
  userRole?: PortalRole;
  onUpdateClient?: (updated: ClientRecord) => void;
}

export function ClientBillingTab({
  client,
  userRole = "admin",
  onUpdateClient,
}: ClientBillingTabProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const auth = client.authorization;
  const burnPercent = Math.round((auth.unitsUsed / auth.totalUnitsApproved) * 100);
  const canManageBilling = userRole === "admin" || userRole === "billing";

  const [authForm, setAuthForm] = useState({
    payer: auth.payer || "Oregon Health Plan (OHP Medicaid)",
    authNumber: auth.authNumber || "AUTH-2026-9921",
    totalUnitsApproved: auth.totalUnitsApproved || 1200,
    startDate: auth.startDate || "2026-01-01",
    expiryDate: auth.expiryDate || "2026-12-31",
    caseManagerName: auth.caseManagerName || "Linda Martinez, MSW",
    caseManagerAgency: auth.caseManagerAgency || "State Dept. of Human Services",
    weeklyHourCap: auth.weeklyHourCap || 35,
  });

  const handleSaveAuthorization = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAuth = {
      ...auth,
      payer: authForm.payer,
      authNumber: authForm.authNumber,
      totalUnitsApproved: Number(authForm.totalUnitsApproved),
      unitsRemaining: Math.max(0, Number(authForm.totalUnitsApproved) - auth.unitsUsed),
      startDate: authForm.startDate,
      expiryDate: authForm.expiryDate,
      caseManagerName: authForm.caseManagerName,
      caseManagerAgency: authForm.caseManagerAgency,
      weeklyHourCap: Number(authForm.weeklyHourCap),
    };

    const updated: ClientRecord = {
      ...client,
      authorization: updatedAuth,
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) onUpdateClient(updated);

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }

    setIsAuthModalOpen(false);
    toast.success("Payer authorization successfully updated.");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Role Notice Banner for Non-Billing roles */}
      {!canManageBilling && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Read-Only Financial View:</strong> Payer authorizations and billing rates are managed exclusively by the Billing & Accounting team. Displayed for service hour pacing reference.
            </span>
          </div>
          <span className="font-bold text-amber-700 uppercase tracking-wider text-[10px] bg-amber-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto shrink-0">
            {userRole.toUpperCase()} VIEW
          </span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Payer Authorizations & Billing Setup
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                <ShieldCheck className="w-3 h-3 text-[#3D6B22]" /> Active Contract
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              State Medicaid waivers, commercial insurance authorizations, and billing rules
            </p>
          </div>
        </div>

        {canManageBilling && (
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Authorization</span>
          </button>
        )}
      </div>

      {/* Authorization Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Primary Payer
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{auth.payer}</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#3D6B22] border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-[#3D6B22]" /> Verified Eligibility
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50/80 px-3.5 py-2 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Prior Authorization #
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-900">
              {auth.authNumber}
            </span>
          </div>
        </div>

        {/* Progress Bar of Units Used */}
        <div className="space-y-2.5 bg-slate-50/60 p-4 sm:p-5 rounded-xl border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-xs">
            <span className="font-bold text-slate-800">
              Service Unit Burn Rate ({burnPercent}%)
            </span>
            <span className="text-slate-600 font-semibold font-mono">
              {auth.unitsUsed} Used / {auth.totalUnitsApproved} Approved Units
            </span>
          </div>

          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3D6B22] rounded-full transition-all duration-500"
              style={{ width: `${burnPercent}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-500 pt-1 gap-1">
            <span>Effective: <strong className="text-slate-700">{auth.startDate}</strong></span>
            <span className="font-bold text-[#3D6B22]">
              {auth.unitsRemaining} Units Remaining ({auth.daysUntilExpiry} days left)
            </span>
            <span>Expires: <strong className="text-slate-700">{auth.expiryDate}</strong></span>
          </div>
        </div>

        {/* Case Manager Coordination Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Assigned Waiver Case Manager
            </div>
            <div className="text-sm font-bold text-slate-900">{auth.caseManagerName}</div>
            <div className="text-xs text-slate-500 font-medium">{auth.caseManagerAgency}</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Weekly Authorized Service Cap
            </div>
            <div className="text-sm font-bold text-[#3D6B22]">
              {auth.weeklyHourCap} Hours / Week
            </div>
            <div className="text-xs text-slate-500 font-medium">
              15-minute billing unit increment (Procedure Code: T1019)
            </div>
          </div>
        </div>
      </div>

      {/* New / Edit Authorization Modal */}
      <Modal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Manage Payer Prior Authorization"
        icon={<FileCheck className="w-5 h-5 text-[#3D6B22]" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAuthorization} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Payer Program
              </label>
              <input
                type="text"
                required
                value={authForm.payer}
                onChange={(e) => setAuthForm({ ...authForm, payer: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Prior Authorization #
              </label>
              <input
                type="text"
                required
                value={authForm.authNumber}
                onChange={(e) => setAuthForm({ ...authForm, authNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Total Units Approved
              </label>
              <input
                type="number"
                required
                value={authForm.totalUnitsApproved}
                onChange={(e) => setAuthForm({ ...authForm, totalUnitsApproved: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Weekly Authorized Hours Cap
              </label>
              <input
                type="number"
                required
                value={authForm.weeklyHourCap}
                onChange={(e) => setAuthForm({ ...authForm, weeklyHourCap: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Effective Start Date
              </label>
              <input
                type="date"
                required
                value={authForm.startDate}
                onChange={(e) => setAuthForm({ ...authForm, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                required
                value={authForm.expiryDate}
                onChange={(e) => setAuthForm({ ...authForm, expiryDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Assigned Case Manager
              </label>
              <input
                type="text"
                value={authForm.caseManagerName}
                onChange={(e) => setAuthForm({ ...authForm, caseManagerName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Case Management Agency
              </label>
              <input
                type="text"
                value={authForm.caseManagerAgency}
                onChange={(e) => setAuthForm({ ...authForm, caseManagerAgency: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Save Authorization</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
