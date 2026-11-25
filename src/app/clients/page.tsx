"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Calendar,
  ChevronDown,
  Check,
} from "lucide-react";
import { ClientRecord } from "@/types/client";
import { getClientsFromStorage } from "@/lib/clients/mockData";
import { subscribeToIntakeSync } from "@/lib/intake/intakeSync";
import { ClientKpiStrip } from "@/components/clients/ClientKpiStrip";
import { ClientManagementWorkspace } from "@/components/clients/ClientManagementWorkspace";
import { ClientContextualDrawer } from "@/components/clients/ClientContextualDrawer";
import { toast } from "sonner";

export default function ClientsPage() {
  const router = useRouter();

  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Filter States
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState("30d");

  // Dropdown states for header controls
  const [isDateOpen, setIsDateOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);

  // Contextual Profile Drawer
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setClients(getClientsFromStorage());

    const unsubscribe = subscribeToIntakeSync(() => {
      setClients(getClientsFromStorage());
    });

    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectClient = (client: ClientRecord) => {
    router.push(`/clients/${client.id}`);
  };

  const handleSelectClientId = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

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

  const dateOptions = [
    { id: "30d", label: "Last 30 Days" },
    { id: "7d", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "all", label: "All Active Records" },
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
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 01. Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Clients & Family Care
          </h1>
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Filter */}
          <div className="relative" ref={dateRef}>
            <button
              type="button"
              onClick={() => setIsDateOpen(!isDateOpen)}
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
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between cursor-pointer ${selectedDateRange === opt.id
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
        clients={clients}
        activeStatusFilter={selectedStatus || "ALL"}
        onSelectStatus={handleSelectKpiStatus}
        needsAttentionCount={needsAttentionCount}
      />

      {/* 03. Client Management Workspace (Full-Width with Table/Grid, Search, Care Type, and Stage tabs) */}
      <ClientManagementWorkspace
        clients={clients}
        selectedStatusFilter={selectedStatus}
        onSelectStatusFilter={setSelectedStatus}
        selectedClientId={selectedClient?.id ?? null}
        onSelectClient={handleSelectClient}
      />

      {/* 04. Contextual Quick Overview Drawer */}
      <ClientContextualDrawer
        client={selectedClient}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}