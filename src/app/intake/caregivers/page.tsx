"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  HeartHandshake,
  ShieldCheck,
  Clock,
  Search,
  Plus,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Home,
  User,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { CaregiverRecord } from "@/types/caregiver";
import {
  getCaregiversFromStorage,
  INITIAL_CAREGIVERS,
} from "@/lib/caregivers/mockData";
import { CaregiverContextualDrawer } from "@/components/caregivers/CaregiverContextualDrawer";

type CaregiverFilterTab = "all" | "family" | "onboarding" | "screening_pending" | "cleared";

export default function IntakeCaregiversPage() {
  const [caregivers, setCaregivers] = useState<CaregiverRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<CaregiverFilterTab>("all");
  const [selectedCaregiver, setSelectedCaregiver] = useState<CaregiverRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = () => {
    setIsSyncing(true);
    const data = getCaregiversFromStorage();
    setCaregivers(data && data.length > 0 ? data : INITIAL_CAREGIVERS);
    setTimeout(() => {
      setIsSyncing(false);
    }, 300);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Intake-specific KPIs
  const kpis = useMemo(() => {
    const total = caregivers.length;
    const familyCount = caregivers.filter(
      (c) => c.type === "Family Caregiver" || c.type === "Family Friend"
    ).length;
    const pendingScreening = caregivers.filter(
      (c) => c.verificationChecklist?.screening !== "Cleared"
    ).length;
    const readyForActivation = caregivers.filter(
      (c) =>
        c.verificationChecklist?.screening === "Cleared" &&
        c.verificationChecklist?.identity === "Verified" &&
        c.verificationChecklist?.cprFirstAid === "Verified"
    ).length;

    return { total, familyCount, pendingScreening, readyForActivation };
  }, [caregivers]);

  // Filter caregivers list
  const filteredCaregivers = useMemo(() => {
    return caregivers.filter((c) => {
      // Tab filter
      if (activeTab === "family" && c.type !== "Family Caregiver" && c.type !== "Family Friend") {
        return false;
      }
      if (activeTab === "onboarding" && c.status !== "Onboarding" && c.status !== "Pending") {
        return false;
      }
      if (activeTab === "screening_pending" && c.verificationChecklist?.screening === "Cleared") {
        return false;
      }
      if (
        activeTab === "cleared" &&
        (c.verificationChecklist?.screening !== "Cleared" || c.verificationChecklist?.identity !== "Verified")
      ) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesId = c.id.toLowerCase().includes(q);
        const matchesClient = (c.availabilityAssignments?.assignedClient?.name || "")
          .toLowerCase()
          .includes(q);
        const matchesHousehold = (c.relationship?.linkedHousehold?.name || "")
          .toLowerCase()
          .includes(q);

        return matchesName || matchesId || matchesClient || matchesHousehold;
      }

      return true;
    });
  }, [caregivers, activeTab, searchQuery]);

  const handleOpenDrawer = (c: CaregiverRecord) => {
    setSelectedCaregiver(c);
    setIsDrawerOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-14 animate-in fade-in duration-200">
      {/* ---------------------------------------------------- */}
      {/* 01. Clean Header & Actions */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Intake Caregiver Directory
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sync Button */}
          <button
            onClick={loadData}
            title="Refresh from storage"
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-[#3D6B22] text-slate-700 hover:text-[#3D6B22] px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#3D6B22] ${isSyncing ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          {/* Register Caregiver Button */}
          <Link
            href="/caregivers/new"
            className="inline-flex items-center gap-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Register Caregiver</span>
          </Link>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 02. Four Core Minimal KPI Cards (Consistent Style) */}
      {/* ---------------------------------------------------- */}
      <section aria-label="Caregiver Key Metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Total Caregivers */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Total Caregivers</span>
            <div className="w-7 h-7 rounded-lg bg-[#3D6B22]/10 text-[#3D6B22] flex items-center justify-center">
              <HeartHandshake className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.total}
          </div>
        </div>

        {/* KPI 2: Family Caregivers */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Family Caregivers</span>
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.familyCount}
          </div>
        </div>

        {/* KPI 3: Pending Screening */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Pending Screening</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.pendingScreening}
          </div>
        </div>

        {/* KPI 4: Ready for Activation */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Ready for Activation</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.readyForActivation}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 03. Minimal Filter Bar & Search */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Quick Filter Tabs */}
        <div className="inline-flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "all"
                ? "bg-[#3D6B22] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({caregivers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("family")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "family"
                ? "bg-[#3D6B22] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Family Providers ({kpis.familyCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("onboarding")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "onboarding"
                ? "bg-[#3D6B22] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Onboarding
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("screening_pending")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "screening_pending"
                ? "bg-[#3D6B22] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Screening Pending ({kpis.pendingScreening})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cleared")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "cleared"
                ? "bg-[#3D6B22] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cleared ({kpis.readyForActivation})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search caregiver, client, household..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#3D6B22] transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 04. Caregivers Directory Table Card */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Caregiver</th>
                <th className="py-3 px-4">Type & Classification</th>
                <th className="py-3 px-4">Linked Household / Client</th>
                <th className="py-3 px-4">Onboarding Clearance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCaregivers.map((c) => {
                const isCleared =
                  c.verificationChecklist?.screening === "Cleared" &&
                  c.verificationChecklist?.identity === "Verified";
                const isFamily =
                  c.type === "Family Caregiver" || c.type === "Family Friend";

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Caregiver Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#3D6B22]/10 text-[#3D6B22] font-bold flex items-center justify-center shrink-0 text-xs">
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(c)}
                            className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors cursor-pointer text-left block"
                          >
                            {c.name}
                          </button>
                          <span className="text-[11px] text-slate-400">
                            {c.id} • {c.branch}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type & Classification */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            isFamily
                              ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {c.type}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-0.5">
                          {c.employmentClassification || "W-2"}
                        </span>
                      </div>
                    </td>

                    {/* Linked Household / Client */}
                    <td className="py-3.5 px-4">
                      {c.relationship?.linkedHousehold?.name ? (
                        <div className="space-y-0.5">
                          <Link
                            href={`/households/${c.relationship.linkedHousehold.id || "hh-1001"}`}
                            className="text-xs font-semibold text-slate-800 hover:text-[#3D6B22] hover:underline flex items-center gap-1"
                          >
                            <Home className="w-3 h-3 text-slate-400" />
                            <span>{c.relationship.linkedHousehold.name}</span>
                          </Link>
                          {c.availabilityAssignments?.assignedClient && (
                            <span className="text-[11px] text-slate-500 block">
                              For: {c.availabilityAssignments.assignedClient.name} ({c.relationship.relationshipToClient || "Care Recipient"})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unlinked</span>
                      )}
                    </td>

                    {/* Onboarding Clearance Indicators */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {/* Identity */}
                        <span
                          title={`Identity: ${c.verificationChecklist?.identity || "Pending"}`}
                          className={`w-2 h-2 rounded-full ${
                            c.verificationChecklist?.identity === "Verified"
                              ? "bg-emerald-500"
                              : "bg-amber-400"
                          }`}
                        />
                        {/* Screening */}
                        <span
                          title={`Background Screening: ${c.verificationChecklist?.screening || "Pending"}`}
                          className={`w-2 h-2 rounded-full ${
                            c.verificationChecklist?.screening === "Cleared"
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        />
                        {/* CPR */}
                        <span
                          title={`CPR/First Aid: ${c.verificationChecklist?.cprFirstAid || "Pending"}`}
                          className={`w-2 h-2 rounded-full ${
                            c.verificationChecklist?.cprFirstAid === "Verified"
                              ? "bg-emerald-500"
                              : "bg-slate-300"
                          }`}
                        />
                        <span className="text-[11px] text-slate-500 ml-1">
                          {isCleared ? "Screening Cleared" : "Checklist Incomplete"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                            : c.status === "Onboarding"
                            ? "bg-amber-50 text-amber-700 border border-amber-200/80"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.status === "Active"
                              ? "bg-emerald-500"
                              : c.status === "Onboarding"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {c.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(c)}
                          className="px-2.5 py-1 text-slate-700 hover:text-[#3D6B22] hover:bg-[#3D6B22]/10 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          Quick View
                        </button>
                        <Link
                          href={`/caregivers/${c.id}`}
                          className="p-1 text-slate-400 hover:text-[#3D6B22] rounded-lg transition-colors"
                          title="Full Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCaregivers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-400 text-xs"
                  >
                    No caregivers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contextual Quick Inspector Drawer */}
      <CaregiverContextualDrawer
        caregiver={selectedCaregiver}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
