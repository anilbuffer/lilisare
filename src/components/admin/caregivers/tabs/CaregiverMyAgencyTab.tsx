"use client";

import React, { useState } from "react";
import {
  Smartphone,
  ShieldCheck,
  Building,
  Key,
  RefreshCw,
  Send,
  CheckCircle2,
  Lock,
  Bell,
  Radio,
  X,
  Mail,
} from "lucide-react";
import { AdminCaregiverProfile } from "@/lib/caregivers/adminCaregiversData";
import { toast } from "sonner";

interface CaregiverMyAgencyTabProps {
  profile: AdminCaregiverProfile;
}

export function CaregiverMyAgencyTab({ profile }: CaregiverMyAgencyTabProps) {
  const [agencyData, setAgencyData] = useState(
    profile.myAgency || {
      appLoginEmail: profile.email,
      lastLogin: "Today at 7:45 AM",
      appVersion: "LiliSare Go v3.4.1",
      deviceType: "Apple iPhone 14 Pro (iOS 18.1)",
      evvStatus: "Authorized",
      branchAffiliations: ["Brentwood Hub", "Franklin Regional"],
    }
  );

  const [isReauthing, setIsReauthing] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSendPasswordReset = () => {
    setIsResetModalOpen(false);
    toast.success(`Password reset verification email dispatched to ${agencyData.appLoginEmail}`);
  };

  const handleReauthDevice = () => {
    setIsReauthing(true);
    setTimeout(() => {
      setIsReauthing(false);
      setAgencyData((prev) => ({
        ...prev,
        evvStatus: "Authorized (Refreshed Just Now)",
      }));
      toast.success(`EVV Mobile token successfully refreshed and validated for ${profile.name}'s iPhone.`);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 01. Top Header Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#3D6B22] border border-emerald-200 flex items-center justify-center font-bold shadow-2xs">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                LiliSare Caregiver Mobile App & Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Connected & Active
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              MyAgency Access & Device Credentials
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Secure EVV GPS mobile clock-in, telephony token authorization, and branch roster access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span>Reset Password</span>
          </button>
        </div>
      </div>

      {/* 02. Device & Authorization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Device & App Status Card */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-[#3D6B22]" />
              <h3 className="text-sm font-bold text-slate-900">Mobile Device Specs</h3>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {agencyData.evvStatus}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">App Login ID:</span>
              <span className="font-bold text-slate-900">{agencyData.appLoginEmail}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Last Login:</span>
              <span className="font-semibold text-slate-800">{agencyData.lastLogin}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Installed Version:</span>
              <span className=" font-bold text-slate-800">{agencyData.appVersion}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Hardware Model:</span>
              <span className="font-semibold text-slate-800">{agencyData.deviceType}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleReauthDevice}
              disabled={isReauthing}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isReauthing ? "animate-spin text-[#3D6B22]" : ""}`} />
              <span>{isReauthing ? "Validating Device Security..." : "Re-Authorize Device Token"}</span>
            </button>
          </div>
        </div>

        {/* Branch Affiliations & Permissions */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-[#3D6B22]" />
              <h3 className="text-sm font-bold text-slate-900">Branch & Territory Links</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {agencyData.branchAffiliations.length} Branches
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-medium">
              Caregiver is authorized to receive broadcast open shifts and clock in for clients in these territories:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {agencyData.branchAffiliations.map((branch, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold"
                >
                  <Building className="w-3.5 h-3.5 text-[#3D6B22]" />
                  <span>{branch}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 03. Password Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#3D6B22] flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Send Password Reset</h3>
                  <p className="text-xs text-slate-500 font-medium">MyAgency Mobile Portal Credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-700 leading-relaxed">
                Are you sure you want to send a secure password reset link to{" "}
                <span className="font-bold text-slate-900">{agencyData.appLoginEmail}</span>?
              </p>
              <p className="text-slate-500 text-[11px]">
                The link will expire in 24 hours. The caregiver will be prompted to create a new password meeting agency complexity rules upon their next sign-in.
              </p>
            </div>

            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendPasswordReset}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reset Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
