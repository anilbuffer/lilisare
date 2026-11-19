"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  Users,
  FilterX,
  ChevronRight,
  ShieldAlert,
  AlertCircle,
  Home,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { ClientRecord } from "@/types/client";

interface ClientManagementWorkspaceProps {
  clients: ClientRecord[];
  selectedStatusFilter: string | null;
  onSelectStatusFilter: (status: string | null) => void;
  selectedClientId: string | null;
  onSelectClient: (client: ClientRecord) => void;
}

const CARE_TYPE_OPTIONS = [
  { id: "ALL", label: "All Care Types" },
  { id: "Family Care", label: "Family Care" },
  { id: "Live-In Care", label: "Live-In Care" },
  { id: "Family Friend Care", label: "Family Friend Care" },
];

export function ClientManagementWorkspace({
  clients,
  selectedStatusFilter,
  onSelectStatusFilter,
  selectedClientId,
  onSelectClient,
}: ClientManagementWorkspaceProps) {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCareType, setSelectedCareType] = useState("ALL");

  // Determine active tab
  const currentTab = selectedStatusFilter || "ALL";

  // Tab definitions with dynamic counts
  const tabs = useMemo(
    () => [
      { id: "ALL", label: "All Clients", count: clients.length },
      { id: "Active", label: "Active", count: clients.filter((c) => c.status === "Active").length },
      { id: "Onboarding", label: "Onboarding", count: clients.filter((c) => c.status === "Onboarding").length },
      { id: "On Hold", label: "On Hold", count: clients.filter((c) => c.status === "On Hold").length },
      {
        id: "ATTENTION",
        label: "Needs Attention",
        count: clients.filter((c) => c.attentionItems && c.attentionItems.length > 0).length,
      },
    ],
    [clients]
  );

  // Filter clients by search, tab status, and care type
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Tab status filter
      if (currentTab === "ATTENTION") {
        if (!client.attentionItems || client.attentionItems.length === 0) return false;
      } else if (currentTab !== "ALL" && client.status !== currentTab) {
        return false;
      }

      // Care type dropdown filter
      if (selectedCareType !== "ALL" && client.careType !== selectedCareType) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = client.name.toLowerCase().includes(query);
        const matchesId = client.id.toLowerCase().includes(query);
        const matchesHousehold = client.household.name.toLowerCase().includes(query);
        const matchesCaregiver =
          client.assignedCareTeam.primaryCaregiver?.name.toLowerCase().includes(query) ?? false;
        const matchesProgram = client.carePlan.program.toLowerCase().includes(query);

        if (!matchesName && !matchesId && !matchesHousehold && !matchesCaregiver && !matchesProgram) {
          return false;
        }
      }

      return true;
    });
  }, [clients, currentTab, selectedCareType, searchQuery]);

  const isFiltered = searchQuery !== "" || selectedCareType !== "ALL" || currentTab !== "ALL";

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCareType("ALL");
    onSelectStatusFilter(null);
  };

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

  const getCareTypeBadge = (careType: string) => {
    switch (careType) {
      case "Family Care":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Live-In Care":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "Family Friend Care":
        return "bg-purple-50 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <section aria-label="Client Management Workspace" className="space-y-4">
      {/* Workspace Container matching InquiryManagementWorkspace */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-[0_6px_32px_rgba(0,0,0,0.06)]">
        {/* Workspace Toolbar Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Client Management
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {filteredClients.length} shown
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and manage registered clients, caregivers, and authorizations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search client, ID, household, caregiver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              />
            </div>

            {/* Care Type Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedCareType}
                onChange={(e) => setSelectedCareType(e.target.value)}
                className="text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all cursor-pointer"
              >
                {CARE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle (Table vs Grid) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Table View"
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Stage Tabs - matching InquiryManagementWorkspace */}
        <div className="pt-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max border-b border-slate-100 pb-2.5">
            {tabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectStatusFilter(tab.id === "ALL" ? null : tab.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#1B3414] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}

            {isFiltered && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 ml-auto rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Reset filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Display: Table or Grid */}
        <div className="mt-3.5">
          {filteredClients.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-sm">No clients match your criteria</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Try searching for another name or clearing active filters.
              </p>
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E5622] bg-[#E3F1D9] hover:bg-[#d5eac8] rounded-xl transition-colors cursor-pointer"
                >
                  <FilterX className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          ) : viewMode === "table" ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Client</th>
                      <th className="py-3.5 px-4">Household</th>
                      <th className="py-3.5 px-4">Care Arrangement</th>
                      <th className="py-3.5 px-4">Assigned Caregiver</th>
                      <th className="py-3.5 px-4">Readiness</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Updated</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredClients.map((client) => {
                    const isSelected = selectedClientId === client.id;
                    const hasAttention = client.attentionItems && client.attentionItems.length > 0;

                    return (
                      <tr
                        key={client.id}
                        onClick={() => onSelectClient(client)}
                        className={`group cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#F2F8EE] border-l-4 border-l-[#3D6B22]"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Client Name & ID */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {client.avatarUrl ? (
                                <img
                                  src={client.avatarUrl}
                                  alt={client.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-600 bg-slate-200">
                                  {client.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                                <span>{client.name}</span>
                                {hasAttention && (
                                  <span title="Needs Attention" className="text-amber-600">
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {client.id} • Age {client.age}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Household */}
                        <td className="py-3 px-3.5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                              {client.household.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {client.household.code}
                            </span>
                          </div>
                        </td>

                        {/* Care Arrangement */}
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCareTypeBadge(
                              client.careType
                            )}`}
                          >
                            {client.careType}
                          </span>
                        </td>

                        {/* Caregiver */}
                        <td className="py-3 px-3.5">
                          {client.assignedCareTeam.primaryCaregiver ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800">
                                {client.assignedCareTeam.primaryCaregiver.name}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {client.assignedCareTeam.primaryCaregiver.relationship.split("(")[0]}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Care Readiness */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              title={`Profile: ${client.readiness.clientProfile}`}
                              className={`w-2 h-2 rounded-full ${
                                client.readiness.clientProfile === "Complete"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            <span
                              title={`Care: ${client.readiness.careArrangement}`}
                              className={`w-2 h-2 rounded-full ${
                                client.readiness.careArrangement === "Complete"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            <span
                              title={`Docs: ${client.readiness.documents}`}
                              className={`w-2 h-2 rounded-full ${
                                client.readiness.documents === "Verified"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            <span
                              title={`Auth: ${client.readiness.authorization}`}
                              className={`w-2 h-2 rounded-full ${
                                client.readiness.authorization === "Verified"
                                  ? "bg-emerald-500"
                                  : client.readiness.authorization === "Expiring"
                                  ? "bg-rose-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            <span className="text-[11px] font-mono font-bold text-slate-600 ml-1">
                              {client.readiness.overallScore ?? 85}%
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                              client.status
                            )}`}
                          >
                            {client.status}
                          </span>
                        </td>

                        {/* Updated */}
                        <td className="py-3 px-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                          {client.updatedAtRelative}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onSelectClient(client)}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                              Quick View
                            </button>
                            <Link
                              href={`/clients/${client.id}`}
                              className="p-1.5 text-slate-400 hover:text-[#3D6B22] transition-colors rounded-xl hover:bg-[#F2F8EE]"
                              title="Full Profile"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => {
                const isSelected = selectedClientId === client.id;
                const hasAttention = client.attentionItems && client.attentionItems.length > 0;

                return (
                  <div
                    key={client.id}
                    onClick={() => onSelectClient(client)}
                    className={`h-full bg-white backdrop-blur-xl rounded-2xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                      isSelected
                        ? "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 bg-gradient-to-b from-[#F2F8EE]/70 via-white to-white shadow-[0_8px_30px_rgba(61,107,34,0.12)] -translate-y-0.5"
                        : "border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:border-[#3D6B22]/60"
                    }`}
                  >
                    <div>
                      {/* Card Header: Client Info & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0">
                            {client.avatarUrl ? (
                              <img
                                src={client.avatarUrl}
                                alt={client.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-600 bg-slate-200">
                                {client.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                              <span>{client.name}</span>
                              {hasAttention && (
                                <span title="Needs Attention" className="text-amber-600">
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              {client.id} • Age {client.age}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${getStatusBadge(
                            client.status
                          )}`}
                        >
                          {client.status}
                        </span>
                      </div>

                      {/* Badges strip: Care Type & Household */}
                      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getCareTypeBadge(
                            client.careType
                          )}`}
                        >
                          {client.careType}
                        </span>

                        <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200/80">
                          <Home className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[130px]">{client.household.name}</span>
                        </div>
                      </div>

                      {/* Caregiver & Hours summary */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400 text-[11px]">Caregiver:</span>
                          {client.assignedCareTeam.primaryCaregiver ? (
                            <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                              {client.assignedCareTeam.primaryCaregiver.name}
                            </span>
                          ) : (
                            <span className="font-bold text-rose-600 text-[11px] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Unassigned
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400 text-[11px]">Auth Hours:</span>
                          <span className="font-bold text-slate-800">
                            {client.carePlan.authorizedWeeklyHours} hrs/wk
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{client.updatedAtRelative}</span>
                      <Link
                        href={`/clients/${client.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#3D6B22] group-hover:translate-x-1 transition-transform"
                      >
                        Full Profile
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}