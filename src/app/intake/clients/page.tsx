"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Calendar,
  ChevronDown,
  Check,
  FolderInput,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import { ClientRecord } from "@/types/client";
import { getClientsFromStorage } from "@/lib/clients/mockData";
import { subscribeToIntakeSync } from "@/lib/intake/intakeSync";
import { ClientKpiStrip } from "@/components/clients/ClientKpiStrip";
import { ClientManagementWorkspace } from "@/components/clients/ClientManagementWorkspace";
import { ClientContextualDrawer } from "@/components/clients/ClientContextualDrawer";
import { toast } from "sonner";

export default function IntakeClientsPage() {
  const router = useRouter();

  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  // Filter States
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState("30d");

  // Dropdown states for header controls
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Contextual Profile Drawer
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const dateOptions = [
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
    { id: "90d", label: "Last 90 Days" },
    { id: "ytd", label: "Year to Date" },
  ];

  useEffect(() => {
    setIsMounted(true);
    setClients(getClientsFromStorage());

    const unsubscribe = subscribeToIntakeSync(() => {
      setClients(getClientsFromStorage());
      setLastSyncTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    });

    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectClient = (c: ClientRecord) => {
    router.push(`/intake/clients/${c.id}`);
  };

  const handleOpenDrawer = (client: ClientRecord) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 01. Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Intake Clients
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span>Client admissions, waiver eligibility, and linked household coordination.</span>
            <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Real-time Intake Sync · {lastSyncTime}
            </span>
          </p>
        </div>

        {/* Global Header Actions */}
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="relative" ref={dateRef}>
            <button
              onClick={() => setIsDateOpen(!isDateOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{dateOptions.find((d) => d.id === selectedDateRange)?.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDateOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelectedDateRange(opt.id);
                      setIsDateOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left"
                  >
                    <span>{opt.label}</span>
                    {selectedDateRange === opt.id && (
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Client / Intake Conversion Button */}
          <div className="relative" ref={addMenuRef}>
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Client</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {isAddMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <Link
                  href="/clients/new"
                  onClick={() => setIsAddMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left"
                >
                  <UserPlus className="w-4 h-4 text-teal-600" />
                  <div>
                    <div className="font-semibold text-slate-900">Direct Registration</div>
                    <div className="text-[11px] text-slate-400">Direct client registration wizard</div>
                  </div>
                </Link>
                <Link
                  href="/intake/pipeline"
                  onClick={() => setIsAddMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left border-t border-slate-100 mt-1 pt-1.5"
                >
                  <FolderInput className="w-4 h-4 text-teal-600" />
                  <div>
                    <div className="font-semibold text-slate-900">Convert Inquiry</div>
                    <div className="text-[11px] text-slate-400">From Intake Pipeline</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 02. Interactive KPI Metric Strip */}
      <ClientKpiStrip
        clients={clients}
        selectedStatus={selectedStatus}
        onSelectStatus={(status) => setSelectedStatus(status)}
      />

      {/* 03. Main Interactive Workspace (Kanban / Table / Grid) */}
      <ClientManagementWorkspace
        clients={clients}
        selectedStatusFilter={selectedStatus}
        onSelectClient={handleSelectClient}
        onOpenDrawer={handleOpenDrawer}
      />

      {/* 04. Contextual Quick-Profile Drawer */}
      <ClientContextualDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        client={selectedClient}
      />
    </div>
  );
}
