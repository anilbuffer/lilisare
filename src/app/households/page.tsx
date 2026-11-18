"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Home, 
  Users, 
  Heart, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { MOCK_HOUSEHOLDS, Household } from "@/lib/households/mockData";
import { Card } from "@/components/ui/Card";

export default function HouseholdsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);

  const filteredHouseholds = MOCK_HOUSEHOLDS.filter((hh) => {
    const matchesSearch = 
      hh.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hh.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hh.primaryCaregiver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hh.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProgram = 
      selectedProgram === "all" || hh.program === selectedProgram;

    return matchesSearch && matchesProgram;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#1B3414] text-[#93C573] rounded-xl">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Households & Family Units</h1>
              <p className="text-xs text-slate-500">
                LiliSare Family-Centred Care: Unified management of linked clients, family caregivers, and authorizations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#1B3414] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#274C1D] transition-colors shadow-sm">
            <Plus className="w-4 h-4 text-[#93C573]" />
            Register Household
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Households</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">11 Active</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">11</span>
            <span className="text-xs text-slate-500">Family Units</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Family Caregivers</span>
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">8 W2 / Paid</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">8</span>
            <span className="text-xs text-slate-500">Linked Guardians</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Authorized Weekly Hours</span>
            <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold">100% Tracked</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">122</span>
            <span className="text-xs text-slate-500">Hrs Approved</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Case Mgr Auths</span>
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">2 Approvals Due</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700">2</span>
            <span className="text-xs text-slate-500">Awaiting CM Sign-off</span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search household, client (Child A), caregiver (Mother A)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3D6B22] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]"
          >
            <option value="all">All Care Programs</option>
            <option value="Pediatric In-Home">Pediatric In-Home</option>
            <option value="Medicaid Waiver">Medicaid Waiver</option>
            <option value="Senior Community Care">Senior Community Care</option>
          </select>
        </div>
      </div>

      {/* Household Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHouseholds.map((hh) => (
          <Card 
            key={hh.id} 
            className="p-5 border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md transition-all space-y-4"
          >
            {/* Header: Name, Code & Program */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-lg">{hh.name}</h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                    {hh.code}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {hh.city}, {hh.state}
                  </span>
                  <span>•</span>
                  <span className="font-medium text-[#3D6B22] bg-[#3D6B22]/10 px-2 py-0.5 rounded-full">
                    {hh.program}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  hh.authStatus === "Approved" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {hh.authStatus === "Approved" ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                  )}
                  {hh.authStatus}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Expires: {hh.authExpiry}
                </p>
              </div>
            </div>

            {/* Linked Dual Entity Display (Client & Caregiver) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              {/* Client Box */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Care Recipient (Client)</span>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {hh.client.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {hh.client.relationship}
                </div>
                <Link 
                  href="/patients" 
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline pt-1"
                >
                  View Client Chart <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Caregiver Box */}
              <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                  <span>Paid Family Caregiver</span>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {hh.primaryCaregiver.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {hh.primaryCaregiver.relationship}
                </div>
                <Link 
                  href="/caregivers" 
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline pt-1"
                >
                  View Caregiver File <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Tri-Journey Status Ribbon */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tri-Journey Synchronization Status
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-blue-50/70 text-blue-800 rounded-lg border border-blue-100">
                  <div className="text-[10px] uppercase font-bold text-blue-500">1. Client</div>
                  <div className="font-bold truncate mt-0.5">{hh.triJourneyStatus.clientStage}</div>
                </div>
                <div className="p-2 bg-emerald-50/70 text-emerald-800 rounded-lg border border-emerald-100">
                  <div className="text-[10px] uppercase font-bold text-emerald-500">2. Caregiver</div>
                  <div className="font-bold truncate mt-0.5">{hh.triJourneyStatus.caregiverStage}</div>
                </div>
                <div className="p-2 bg-indigo-50/70 text-indigo-800 rounded-lg border border-indigo-100">
                  <div className="text-[10px] uppercase font-bold text-indigo-500">3. Agency Ops</div>
                  <div className="font-bold truncate mt-0.5">{hh.triJourneyStatus.opsStage}</div>
                </div>
              </div>

              {hh.triJourneyStatus.bottleneckMessage && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200/80">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{hh.triJourneyStatus.bottleneckMessage}</span>
                </div>
              )}
            </div>

            {/* Case Manager & Operational Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div className="text-slate-600">
                <span className="text-slate-400">Case Mgr:</span>{" "}
                <span className="font-semibold text-slate-800">{hh.caseManager.name}</span>
                <span className="text-[10px] text-slate-400 block sm:inline sm:ml-1">({hh.caseManager.agency})</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-bold text-slate-900">{hh.scheduledHoursPerWeek} / {hh.authorizedHoursPerWeek}</span>
                  <span className="text-slate-400 text-[10px] block">Weekly Hours</span>
                </div>
                <button 
                  onClick={() => setSelectedHousehold(hh)}
                  className="px-3 py-1.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-lg font-semibold transition-colors flex items-center gap-1 shadow-sm"
                >
                  Manage <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Slide-over Detail Modal */}
      {selectedHousehold && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#1B3414] p-5 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{selectedHousehold.name}</h2>
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-semibold rounded">
                    {selectedHousehold.code}
                  </span>
                </div>
                <p className="text-xs text-[#93C573] mt-1">{selectedHousehold.program} • {selectedHousehold.city}, {selectedHousehold.state}</p>
              </div>
              <button 
                onClick={() => setSelectedHousehold(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Linked Household Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Client Profile</h4>
                  <p className="font-semibold text-slate-900">{selectedHousehold.client.name}</p>
                  <p className="text-xs text-slate-500">{selectedHousehold.client.relationship}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedHousehold.client.phone}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Designated Caregiver</h4>
                  <p className="font-semibold text-slate-900">{selectedHousehold.primaryCaregiver.name}</p>
                  <p className="text-xs text-slate-500">{selectedHousehold.primaryCaregiver.relationship}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedHousehold.primaryCaregiver.phone}</p>
                </div>
              </div>

              {/* Case Manager Coordination */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Case Manager & Service Authorization</h4>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">
                    {selectedHousehold.authorizedHoursPerWeek} Hours / Week Authorized
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2">
                  <div><strong>Case Manager:</strong> {selectedHousehold.caseManager.name}</div>
                  <div><strong>Agency:</strong> {selectedHousehold.caseManager.agency}</div>
                  <div><strong>Email:</strong> {selectedHousehold.caseManager.email}</div>
                  <div><strong>Phone:</strong> {selectedHousehold.caseManager.phone}</div>
                </div>
              </div>

              {/* Quick Action Navigation */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/billing/authorizations"
                  className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700 text-xs transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#3D6B22]" /> Manage Authorizations
                </Link>
                <Link
                  href="/scheduling"
                  className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700 text-xs transition-colors"
                >
                  <Calendar className="w-4 h-4 text-blue-600" /> Open Shift Scheduler
                </Link>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedHousehold(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold text-xs transition-colors"
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
