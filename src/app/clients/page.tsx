"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Download,
  Calendar,
  MapPin,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Printer,
  Check,
} from "lucide-react";
import { ClientRecord } from "@/types/client";
import { getClientsFromStorage } from "@/lib/clients/mockData";
import { ClientKpiStrip } from "@/components/clients/ClientKpiStrip";
import { ClientManagementWorkspace } from "@/components/clients/ClientManagementWorkspace";
import { ClientAttentionSection } from "@/components/clients/ClientAttentionSection";
import { ClientRecentActivitySection } from "@/components/clients/ClientRecentActivitySection";
import { ClientContextualDrawer } from "@/components/clients/ClientContextualDrawer";
import { toast } from "sonner";

export default function ClientsPage() {
  const router = useRouter();

  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Filter States
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedDateRange, setSelectedDateRange] = useState("30d");

  // Dropdown states for header controls (matching /intake/pipeline/)
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);

  // Contextual Profile Drawer
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const data = getClientsFromStorage();
    setClients(data);

    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
        setIsBranchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectClient = (client: ClientRecord) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleSelectClientId = (clientId: string) => {
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setSelectedClient(found);
      setIsDrawerOpen(true);
    } else {
      router.push(`/clients/${clientId}`);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Branch filtered clients
  const branchFilteredClients = useMemo(() => {
    if (selectedBranch === "All Branches") return clients;
    return clients.filter((c) => {
      if (selectedBranch === "North Metro Branch") {
        return ["OR", "Springfield", "Portland"].includes(c.household.state);
      }
      return true;
    });
  }, [clients, selectedBranch]);

  // KPI card selection handler (syncs cleanly with workspace tabs)
  const handleSelectKpiStatus = (statusKey: string) => {
    if (statusKey === "ALL") {
      setSelectedStatus(null);
    } else if (selectedStatus === statusKey) {
      setSelectedStatus(null);
    } else {
      setSelectedStatus(statusKey);
    }
  };

  const handleExportCSV = () => {
    setIsExportOpen(false);
    const headers = [
      "Client ID",
      "Name",
      "Household",
      "Care Arrangement",
      "Caregiver",
      "Status",
      "Auth Hours",
      "Auth Expiry",
    ];
    const rows = branchFilteredClients.map((c) => [
      c.id,
      `"${c.name}"`,
      `"${c.household.name}"`,
      `"${c.careType}"`,
      `"${c.assignedCareTeam.primaryCaregiver?.name || "Unassigned"}"`,
      c.status,
      c.carePlan.authorizedWeeklyHours,
      c.authorization.expiryDate,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `LiliSare_Clients_Roster_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${branchFilteredClients.length} clients to CSV`);
  };

  const handleExportJSON = () => {
    setIsExportOpen(false);
    const rows = branchFilteredClients.map((c) => ({
      ID: c.id,
      Name: c.name,
      Household: c.household.name,
      CareType: c.careType,
      PrimaryCaregiver: c.assignedCareTeam.primaryCaregiver?.name || "Unassigned",
      Status: c.status,
      AuthorizedHours: c.carePlan.authorizedWeeklyHours,
      AuthNumber: c.authorization.authNumber,
      AuthExpiry: c.authorization.expiryDate,
    }));

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(rows, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `lilisare-clients-${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast.success(`Exported ${branchFilteredClients.length} client records to JSON`);
  };

  const handlePrintSummary = () => {
    setIsExportOpen(false);
    window.print();
  };

  const dateOptions = [
    { id: "30d", label: "Last 30 Days" },
    { id: "7d", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "all", label: "All Active Records" },
  ];

  const branchOptions = [
    { id: "All Branches", label: "All Branches" },
    { id: "North Metro Branch", label: "North Metro Branch" },
    { id: "South County Branch", label: "South County Branch" },
  ];

  if (!isMounted) {
    return (
      <div className="w-full max-w-7xl mx-auto py-12 text-center text-slate-500">
        <Users className="w-8 h-8 animate-pulse text-[#3D6B22] mx-auto mb-2" />
        <p className="font-semibold text-sm">Loading Client Workspace...</p>
      </div>
    );
  }

  const needsAttentionCount = clients.filter(
    (c) => c.attentionItems && c.attentionItems.length > 0
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-12 animate-in fade-in duration-200">
      {/* 01. Page Header matching IntakePageHeader */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Clients & Family Care
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E3F1D9] text-[#1E5622] border border-[#3D6B22]/20">
              {clients.length} Active Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage registered clients, family households, authorizations, and ongoing care readiness
          </p>
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Filter */}
          <div className="relative" ref={dateRef}>
            <button
              type="button"
              onClick={() => {
                setIsDateOpen(!isDateOpen);
                setIsBranchOpen(false);
                setIsExportOpen(false);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateOptions.find((d) => d.id === selectedDateRange)?.label || "Date Range"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isDateOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedDateRange(opt.id);
                      setIsDateOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between cursor-pointer ${
                      selectedDateRange === opt.id
                        ? "bg-[#F2F8EE] text-[#3D6B22] font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedDateRange === opt.id && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Branch Filter */}
          <div className="relative" ref={branchRef}>
            <button
              type="button"
              onClick={() => {
                setIsBranchOpen(!isBranchOpen);
                setIsDateOpen(false);
                setIsExportOpen(false);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedBranch}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isBranchOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {branchOptions.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBranch(b.id);
                      setIsBranchOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between cursor-pointer ${
                      selectedBranch === b.id
                        ? "bg-[#F2F8EE] text-[#3D6B22] font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{b.label}</span>
                    {selectedBranch === b.id && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => {
                setIsExportOpen(!isExportOpen);
                setIsDateOpen(false);
                setIsBranchOpen(false);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isExportOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export to CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export to JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintSummary}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Summary</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Client CTA (Dedicated Action) */}
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B3414] hover:bg-[#274C1D] text-white text-xs font-bold rounded-xl shadow-sm transition-all shadow-[#1B3414]/25 hover:shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#93C573]" />
            <span>Add Client</span>
          </Link>
        </div>
      </header>

      {/* 02. KPI Overview (Four clean, dashboard-style cards matching IntakeKpiStrip) */}
      <ClientKpiStrip
        clients={branchFilteredClients}
        activeStatusFilter={selectedStatus || "ALL"}
        onSelectStatus={handleSelectKpiStatus}
        needsAttentionCount={needsAttentionCount}
      />

      {/* 03. Client Management Workspace (Full-Width with Table/Grid, Search, Care Type, and Stage tabs) */}
      <ClientManagementWorkspace
        clients={branchFilteredClients}
        selectedStatusFilter={selectedStatus}
        onSelectStatusFilter={setSelectedStatus}
        selectedClientId={selectedClient?.id ?? null}
        onSelectClient={handleSelectClient}
      />

      {/* 04. Secondary Sections: Actionable Items & Recent Activity matching /intake/pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientAttentionSection
          clients={branchFilteredClients}
          onSelectClient={handleSelectClientId}
        />
        <ClientRecentActivitySection
          onSelectClient={handleSelectClientId}
        />
      </div>

      {/* 05. Contextual Quick Overview Drawer */}
      <ClientContextualDrawer
        client={selectedClient}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}