"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Edit3,
  Home,
  UserCheck,
  ShieldAlert,
  Phone,
  Mail,
  Calendar,
  Clock,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { ClientRecord, ReadinessState } from "@/types/client";

interface ClientContextualDrawerProps {
  client: ClientRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEditClient?: (client: ClientRecord) => void;
}

export function ClientContextualDrawer({
  client,
  isOpen,
  onClose,
  onEditClient,
}: ClientContextualDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getClientDetailPath = (id: string) => {
    if (pathname.startsWith("/scheduler")) return `/scheduler/clients/${id}`;
    if (pathname.startsWith("/hr")) return `/hr/clients/${id}`;
    if (pathname.startsWith("/field-supervisor")) return `/field-supervisor/clients/${id}`;
    if (pathname.startsWith("/intake")) return `/intake/clients/${id}`;
    if (pathname.startsWith("/admin")) return `/admin/clients/${id}`;
    return `/clients/${id}`;
  };

  if (!isOpen || !client) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20";
      case "Onboarding":
        return "bg-[#FEF3C7] text-[#9A5B00] border-[#9A5B00]/20";
      case "On Hold":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "Discharged":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getReadinessBadge = (state: string) => {
    switch (state) {
      case "Complete":
      case "Verified":
        return {
          badge: "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20",
          icon: CheckCircle2,
          iconColor: "text-[#1E5622]",
        };
      case "Review needed":
        return {
          badge: "bg-[#FEF3C7] text-[#9A5B00] border-[#9A5B00]/20",
          icon: AlertCircle,
          iconColor: "text-[#9A5B00]",
        };
      case "Expiring":
      case "Missing":
        return {
          badge: "bg-[#FEE2E2] text-[#B91C1C] border-[#B91C1C]/20",
          icon: AlertCircle,
          iconColor: "text-[#B91C1C]",
        };
      case "Pending":
      case "Draft":
      default:
        return {
          badge: "bg-slate-100 text-slate-700 border-slate-200",
          icon: Clock,
          iconColor: "text-slate-500",
        };
    }
  };

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

        {/* Drawer Container */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                {client.avatarUrl ? (
                  <img
                    src={client.avatarUrl}
                    alt={client.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 bg-slate-200">
                    {client.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{client.name}</h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                      client.status
                    )}`}
                  >
                    {client.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500  mt-0.5">
                  ID: {client.id} • Age {client.age}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-sm">
            {/* Attention Banner if client has attention items */}
            {client.attentionItems && client.attentionItems.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Attention Required ({client.attentionItems.length})
                </div>
                {client.attentionItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-white border border-amber-200/80 text-xs space-y-1"
                  >
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="text-slate-600 text-[11px]">{item.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Section 1: Client Information */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/90 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Client Information
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Client ID</span>
                  <span className=" font-bold text-slate-900">{client.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Service status</span>
                  <span className="font-bold text-slate-900">{client.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Household</span>
                  <Link
                    href={`/households`}
                    className="font-bold text-[#3D6B22] hover:underline flex items-center gap-1"
                  >
                    {client.household.name}
                    <ExternalLink className="w-3 h-3 inline" />
                  </Link>
                </div>
                <div>
                  <span className="text-slate-500 block">Care arrangement</span>
                  <span className="font-semibold text-slate-900">{client.careType}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs flex items-center justify-between text-slate-600">
                <span>Program:</span>
                <span className="font-medium text-slate-900 text-right truncate max-w-[220px]">
                  {client.carePlan.program}
                </span>
              </div>
            </div>

            {/* Section 2: Assigned Care Team */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/90 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Assigned Care Team
              </h3>

              <div className="space-y-2.5 text-xs">
                {/* Primary Caregiver */}
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">
                      Primary Caregiver
                    </span>
                    {client.assignedCareTeam.primaryCaregiver ? (
                      <div>
                        <div className="font-bold text-slate-900">
                          {client.assignedCareTeam.primaryCaregiver.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {client.assignedCareTeam.primaryCaregiver.id} •{" "}
                          {client.assignedCareTeam.primaryCaregiver.relationship}
                        </div>
                      </div>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        No caregiver assigned
                      </span>
                    )}
                  </div>
                  {client.assignedCareTeam.primaryCaregiver && (
                    <span className="text-[10px]  px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                      {client.assignedCareTeam.primaryCaregiver.id}
                    </span>
                  )}
                </div>

                {/* Family Contact */}
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">
                      Family Contact
                    </span>
                    <div className="font-bold text-slate-900">
                      {client.assignedCareTeam.familyContact.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {client.assignedCareTeam.familyContact.id} •{" "}
                      {client.assignedCareTeam.familyContact.relationship}
                    </div>
                  </div>
                  <span className="text-[10px]  px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                    {client.assignedCareTeam.familyContact.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Care Readiness */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Care Readiness
                </h3>
                <span className="text-xs font-bold text-slate-700">
                  Score: {client.readiness.overallScore ?? 85}%
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Client Profile */}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Client profile</span>
                  {(() => {
                    const r = getReadinessBadge(client.readiness.clientProfile);
                    const Icon = r.icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${r.badge}`}
                      >
                        <Icon className="w-3 h-3" />
                        {client.readiness.clientProfile}
                      </span>
                    );
                  })()}
                </div>

                {/* Care Arrangement */}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Care arrangement</span>
                  {(() => {
                    const r = getReadinessBadge(client.readiness.careArrangement);
                    const Icon = r.icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${r.badge}`}
                      >
                        <Icon className="w-3 h-3" />
                        {client.readiness.careArrangement}
                      </span>
                    );
                  })()}
                </div>

                {/* Documents */}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Documents</span>
                  {(() => {
                    const r = getReadinessBadge(client.readiness.documents);
                    const Icon = r.icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${r.badge}`}
                      >
                        <Icon className="w-3 h-3" />
                        {client.readiness.documents}
                      </span>
                    );
                  })()}
                </div>

                {/* Authorization */}
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-600 font-medium">Authorization</span>
                  {(() => {
                    const r = getReadinessBadge(client.readiness.authorization);
                    const Icon = r.icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${r.badge}`}
                      >
                        <Icon className="w-3 h-3" />
                        {client.readiness.authorization}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Quick Contact & Address Strip */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{client.primaryContact.phone}</span>
                <span className="text-slate-400">•</span>
                <span className="truncate">{client.primaryContact.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">
                  {client.household.address}, {client.household.city}, {client.household.state}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
            <Link
              href={getClientDetailPath(client.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1B3414] hover:bg-[#274C1D] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <span>View Full Profile</span>
              <ArrowRight className="w-4 h-4 text-[#93C573]" />
            </Link>

            <button
              type="button"
              onClick={() => {
                if (onEditClient) {
                  onEditClient(client);
                } else {
                  router.push(`/clients/${client.id}/edit`);
                }
              }}
              className="flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Client</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
