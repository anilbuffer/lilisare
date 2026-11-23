"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  CalendarCheck,
  CalendarX,
  Search,
  Filter,
  Check,
  X,
  Plus,
  AlertCircle,
  Calendar,
  User,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { AdminCaregiverTopTabs } from "./AdminCaregiverTopTabs";

export type TimeOffType = "PTO" | "Sick Leave" | "Unpaid" | "Bereavement";
export type TimeOffStatus = "Pending" | "Approved" | "Denied";

export interface AdminTimeOffRecord {
  id: string;
  caregiverId: string;
  name: string;
  role: string;
  submittedAt: string;
  type: TimeOffType;
  startDate: string;
  endDate: string;
  reason: string;
  status: TimeOffStatus;
}

const INITIAL_REQUESTS: AdminTimeOffRecord[] = [
  {
    id: "to-1",
    caregiverId: "CG-102",
    name: "Sarah Jenkins",
    role: "Registered Nurse (RN)",
    submittedAt: "2 days ago",
    type: "PTO",
    startDate: "Nov 20, 2026",
    endDate: "Nov 25, 2026",
    reason: "Family vacation",
    status: "Pending",
  },
  {
    id: "to-2",
    caregiverId: "CG-103",
    name: "Marcus Johnson",
    role: "Home Health Aide",
    submittedAt: "1 week ago",
    type: "Sick Leave",
    startDate: "Oct 28, 2026",
    endDate: "Oct 29, 2026",
    reason: "Medical appointment",
    status: "Approved",
  },
  {
    id: "to-3",
    caregiverId: "CG-107",
    name: "Lisa Wong",
    role: "Certified Nursing Assistant",
    submittedAt: "2 weeks ago",
    type: "Unpaid",
    startDate: "Dec 10, 2026",
    endDate: "Dec 15, 2026",
    reason: "Personal reasons",
    status: "Denied",
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function AdminCaregiverTimeOffView() {
  const [requests, setRequests] = useState<AdminTimeOffRecord[]>(INITIAL_REQUESTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState("Elena Rodriguez");
  const [formType, setFormType] = useState<TimeOffType>("PTO");
  const [formStartDate, setFormStartDate] = useState("Dec 01, 2026");
  const [formEndDate, setFormEndDate] = useState("Dec 05, 2026");
  const [formReason, setFormReason] = useState("Personal time off");

  // Dynamic KPI counts
  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === "Pending").length,
    [requests]
  );
  const approvedCount = useMemo(
    () => requests.filter((r) => r.status === "Approved").length + 11, // baseline agency approved this month
    [requests]
  );
  const onLeaveTodayCount = 2;

  // Filtering
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = req.name.toLowerCase().includes(q);
        const matchesReason = req.reason.toLowerCase().includes(q);
        const matchesType = req.type.toLowerCase().includes(q);
        if (!matchesName && !matchesReason && !matchesType) return false;
      }

      if (statusFilter !== "ALL" && req.status !== statusFilter) {
        return false;
      }

      if (typeFilter !== "ALL" && req.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [requests, searchQuery, statusFilter, typeFilter]);

  const handleApprove = (id: string, name: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
    );
    toast.success(`Time-off request for ${name} APPROVED`);
  };

  const handleDeny = (id: string, name: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Denied" } : r))
    );
    toast.error(`Time-off request for ${name} DENIED`);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter caregiver name");
      return;
    }

    const newReq: AdminTimeOffRecord = {
      id: `to-${Date.now()}`,
      caregiverId: "CG-106",
      name: formName.trim(),
      role: "Caregiver",
      submittedAt: "Just now",
      type: formType,
      startDate: formStartDate,
      endDate: formEndDate,
      reason: formReason,
      status: "Pending",
    };

    setRequests((prev) => [newReq, ...prev]);
    toast.success(`Time-off request created for ${newReq.name}`);
    setIsNewRequestModalOpen(false);

    setFormReason("Personal time off");
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 01. Top Tab Navigation Bar (Matching Reference Screenshot) */}
      <AdminCaregiverTopTabs activeTab="time-off" />

      {/* 02. KPI Cards (Matching Image 4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Pending Requests */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {pendingCount}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              Pending Requests
            </div>
          </div>
        </div>

        {/* Card 2: Approved this month */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-emerald-700">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {approvedCount}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              Approved this month
            </div>
          </div>
        </div>

        {/* Card 3: Caregivers on leave today */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
            <CalendarX className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {onLeaveTodayCount}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              Caregivers on leave today
            </div>
          </div>
        </div>
      </div>

      {/* 03. Search & Filter Bar (Matching Image 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search requests..."
              className="w-full pl-10 pr-9 py-2.5 bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`px-4 py-2.5 rounded-full bg-white border text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.03)] ${statusFilter !== "ALL" || typeFilter !== "ALL"
                ? "border-[#3D6B22] text-[#1E5622] bg-[#E8F2E4]"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-bold text-slate-800 px-2 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Filter by Status</span>
                  {(statusFilter !== "ALL" || typeFilter !== "ALL") && (
                    <button
                      onClick={() => {
                        setStatusFilter("ALL");
                        setTypeFilter("ALL");
                      }}
                      className="text-[11px] text-[#3D6B22] hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="space-y-1 pt-2 text-xs">
                  {["ALL", "Pending", "Approved", "Denied"].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setStatusFilter(st);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-between ${statusFilter === st
                        ? "bg-[#E8F2E4] text-[#1E5622] font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <span>{st === "ALL" ? "All Statuses" : st}</span>
                      {statusFilter === st && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsNewRequestModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-full shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Request Time-Off</span>
        </button>
      </div>

      {/* 04. Time-Off Table (Matching Image 4) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="px-6 py-4">Caregiver</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Caregiver Name and Time */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(req.name)}
                      </div>
                      <div>
                        <Link
                          href={`/admin/caregivers/${req.caregiverId}`}
                          className="font-bold text-slate-900 hover:text-[#3D6B22] transition-colors"
                        >
                          {req.name}
                        </Link>

                      </div>
                    </div>
                  </td>

                  {/* Type Badge */}
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                      {req.type}
                    </span>
                  </td>

                  {/* Dates */}
                  <td className="px-6 py-4 text-slate-700 font-semibold text-xs sm:text-sm">
                    {req.startDate} to {req.endDate}
                  </td>

                  {/* Reason */}
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {req.reason}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {req.status === "Pending" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Pending
                      </span>
                    ) : req.status === "Approved" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Approved
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        Denied
                      </span>
                    )}
                  </td>

                  {/* Actions (Matching Image 4: X and Check for pending, "Processed" for others) */}
                  <td className="px-6 py-4 text-right">
                    {req.status === "Pending" ? (
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeny(req.id, req.name)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Deny Request"
                        >
                          <X className="w-4 h-4 text-rose-500 hover:scale-110 transition-transform" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(req.id, req.name)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Approve Request"
                        >
                          <Check className="w-4 h-4 text-emerald-600 hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        Processed
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">
                      No time-off requests found
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Adjust your search or status filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 05. Request Time-Off Modal */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col">
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Record Time-Off Request
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    Log scheduled leave or PTO for a LiliSare caregiver.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsNewRequestModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Caregiver Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Leave Type *
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as TimeOffType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                >
                  <option value="PTO">Paid Time Off (PTO)</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                  <option value="Bereavement">Bereavement</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    End Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Reason for Request
                </label>
                <input
                  type="text"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
