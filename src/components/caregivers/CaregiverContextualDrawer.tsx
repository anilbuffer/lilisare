"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Edit3,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Users,
  ChevronRight,
  ArrowRight,
  Award,
} from "lucide-react";
import { CaregiverRecord } from "@/types/caregiver";

interface CaregiverContextualDrawerProps {
  caregiver: CaregiverRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEditCaregiver?: (caregiver: CaregiverRecord) => void;
}

export function CaregiverContextualDrawer({
  caregiver,
  isOpen,
  onClose,
  onEditCaregiver,
}: CaregiverContextualDrawerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Profile" | "Credentials" | "Assignments" | "Activity">("Profile");

  if (!isOpen || !caregiver) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20";
      case "Onboarding":
        return "bg-[#FEF3C7] text-[#9A5B00] border-[#9A5B00]/20";
      case "Pending":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "On Hold":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getVerificationBadge = (val: string) => {
    if (val === "Verified" || val === "Cleared" || val === "Complete") {
      return {
        badge: "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20",
        icon: CheckCircle2,
      };
    }
    if (val === "In Review" || val === "In Progress" || val === "Pending") {
      return {
        badge: "bg-amber-50 text-amber-800 border-amber-200",
        icon: Clock,
      };
    }
    return {
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      icon: AlertTriangle,
    };
  };

  const assignedClient = caregiver.availabilityAssignments.assignedClient;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-out Drawer Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200/90 bg-slate-50/70 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                {caregiver.avatarUrl ? (
                  <img
                    src={caregiver.avatarUrl}
                    alt={caregiver.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {caregiver.name}
                  </h3>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border tracking-wide ${getStatusBadge(
                      caregiver.status
                    )}`}
                  >
                    ({caregiver.status})
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  <span className=" font-bold text-[#3D6B22]">{caregiver.id}</span>
                  {" · "}
                  <span>{caregiver.type}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-tabs: (Profile) (Credentials) (Assignments) (Activity) */}
          <div className="flex items-center px-5 border-b border-slate-200/80 bg-white gap-2">
            {(["Profile", "Credentials", "Assignments", "Activity"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${activeTab === tab
                  ? "border-[#3D6B22] text-[#3D6B22]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
              >
                ({tab})
              </button>
            ))}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeTab === "Profile" && (
              <>
                {/* 1. Caregiver Information */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Caregiver Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Caregiver ID</span>
                      <span className=" font-bold text-slate-800">{caregiver.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Caregiver type</span>
                      <span className="font-semibold text-slate-800">{caregiver.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Branch</span>
                      <span className="font-semibold text-slate-800">{caregiver.branch}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Status</span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(
                          caregiver.status
                        )}`}
                      >
                        ({caregiver.status})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Verification Checklist */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Verification Checklist
                  </h4>
                  <div className="space-y-2 text-xs">
                    {[
                      {
                        label: "Identity verification",
                        val: caregiver.verificationChecklist.identity,
                      },
                      {
                        label: "Background screening",
                        val: caregiver.verificationChecklist.screening,
                      },
                      {
                        label: "CPR / First Aid",
                        val: caregiver.verificationChecklist.cprFirstAid,
                      },
                      {
                        label: "Required training",
                        val: caregiver.verificationChecklist.training,
                      },
                    ].map((item, idx) => {
                      const { badge, icon: Icon } = getVerificationBadge(item.val);
                      return (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                          <span className="text-slate-600">{item.label}</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${badge}`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>({item.val})</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Client Assignment */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Client Assignment
                  </h4>
                  {assignedClient ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Assigned client</span>
                        <Link
                          href={`/clients/${assignedClient.id}`}
                          className=" font-bold text-[#3D6B22] hover:underline flex items-center gap-1"
                        >
                          <span>{assignedClient.id} ({assignedClient.name})</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Assignment status</span>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-[#E3F1D9] text-[#1E5622] border border-[#1E5622]/20">
                          ({assignedClient.status})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Authorized hours</span>
                        <span className="font-semibold text-slate-800">
                          {assignedClient.weeklyAuthorizedHours} hrs/week
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Linked Household</span>
                        <span className="font-semibold text-slate-800">
                          {assignedClient.householdName}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 py-2">
                      <p className="font-medium text-slate-700">Currently Unassigned</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Caregiver is available for assignments once all onboarding prerequisites are complete.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "Credentials" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Credentials & Licenses
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${caregiver.documentsCredentials.overallStatus === "Verified"
                      ? "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                  >
                    {caregiver.documentsCredentials.overallStatus}
                  </span>
                </div>

                {caregiver.documentsCredentials.items.map((cred) => (
                  <div
                    key={cred.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-900">{cred.name}</h5>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        {cred.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Issuer: {cred.issuer}</span>
                      <span>Expires: {cred.expiryDate || "N/A"}</span>
                    </div>
                    {cred.verificationNotes && (
                      <p className="text-[11px] text-rose-600 font-medium pt-1">
                        {cred.verificationNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Assignments" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Current Schedule & Capacity
                  </h4>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Weekly Capacity:</span>
                    <span className="font-bold text-slate-800">
                      {caregiver.availabilityAssignments.weeklyCapacityHours} hrs/week
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Scheduled:</span>
                    <span className="font-bold text-slate-800">
                      {caregiver.availabilityAssignments.scheduledWeeklyHours} hrs/week
                    </span>
                  </div>
                  {caregiver.availabilityAssignments.backupCaregiver && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Designated Backup:</span>
                      <span className="font-semibold text-slate-800">
                        {caregiver.availabilityAssignments.backupCaregiver.name} (
                        {caregiver.availabilityAssignments.backupCaregiver.relationship})
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                    Weekly Availability
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    {caregiver.availabilityAssignments.availabilitySchedule.map((day, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <span className="font-medium text-slate-700">{day.day}</span>
                        <span className="text-[11px] text-slate-500">{day.timeSlots}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Activity" && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Caregiver Operations Timeline
                </h4>
                {caregiver.activityHistory.recentUpdates.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No recent activity logs.</p>
                ) : (
                  caregiver.activityHistory.recentUpdates.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{act.title}</span>
                        <span className="text-[10px] text-slate-400">{act.relativeTime}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{act.description}</p>
                      <p className="text-[10px] text-slate-400">Actor: {act.actor}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer Action Buttons matching requested design:
             View Full Profile & Edit Caregiver
          */}
          <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
            <Link
              href={`/caregivers/${caregiver.id}`}
              className="flex-1 text-center py-2.5 px-4 rounded-xl bg-[#3D6B22] text-white text-xs font-bold hover:bg-[#2d5019] transition-all shadow-sm cursor-pointer"
            >
              View Full Profile
            </Link>
            <Link
              href={`/caregivers/${caregiver.id}/edit`}
              className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Caregiver</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
