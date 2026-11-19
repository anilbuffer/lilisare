"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InquiryRecord, InquiryStage } from "@/types/intake";
import {
  Search,
  LayoutGrid,
  List,
  ChevronRight,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Stethoscope,
  FileText,
  CheckCircle2,
  AlertTriangle,
  User,
  Inbox,
  FilterX,
  Clock,
  MapPin,
  Calendar,
} from "lucide-react";

interface InquiryManagementWorkspaceProps {
  inquiries: InquiryRecord[];
  selectedStageFilter: InquiryStage | null;
  onSelectStageFilter: (stage: InquiryStage | null) => void;
  baseDetailsPath?: string;
}

const STAGE_BADGES: Record<InquiryStage, { bg: string; text: string; border: string }> = {
  "New Lead": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  "Contacted": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  "In Assessment": { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200" },
  "CM Coordination": { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
  "Converted": { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
};

export function InquiryManagementWorkspace({
  inquiries,
  selectedStageFilter,
  onSelectStageFilter,
  baseDetailsPath = "/intake/pipeline",
}: InquiryManagementWorkspaceProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [tabFilter, setTabFilter] = useState<string>("ALL");

  const currentStage = selectedStageFilter || (tabFilter !== "ALL" ? (tabFilter as InquiryStage) : null);

  const tabs: { id: string; label: string; count: number }[] = [
    { id: "ALL", label: "All inquiries", count: inquiries.length },
    { id: "New Lead", label: "New Lead", count: inquiries.filter((i) => i.stage === "New Lead").length },
    { id: "Contacted", label: "Contacted", count: inquiries.filter((i) => i.stage === "Contacted").length },
    { id: "In Assessment", label: "In Assessment", count: inquiries.filter((i) => i.stage === "In Assessment").length },
    { id: "CM Coordination", label: "CM Coordination", count: inquiries.filter((i) => i.stage === "CM Coordination").length },
    { id: "Converted", label: "Converted", count: inquiries.filter((i) => i.stage === "Converted").length },
  ];

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      if (currentStage && item.stage !== currentStage) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesFamily = item.familyName.toLowerCase().includes(query);
        const matchesClient = item.familyInfo.clientInfo.name.toLowerCase().includes(query);
        const matchesContact = item.familyInfo.primaryContact.toLowerCase().includes(query);
        const matchesSource = item.source.toLowerCase().includes(query);
        const matchesProgram = item.careRequirements.programInterest.toLowerCase().includes(query);
        if (!matchesId && !matchesFamily && !matchesClient && !matchesContact && !matchesSource && !matchesProgram) {
          return false;
        }
      }

      return true;
    });
  }, [inquiries, currentStage, searchQuery]);

  const getDetailsHref = (id: string) => {
    const cleanPath = baseDetailsPath.replace(/\/$/, "");
    return `${cleanPath}/${id}/`;
  };

  const handleRowClick = (id: string) => {
    router.push(getDetailsHref(id));
  };

  return (
    <section aria-label="Inquiry Management Workspace" className="space-y-4">
      {/* Workspace Header & Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Inquiry Management
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {filteredInquiries.length} shown
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, qualify and manage family inquiries across all stages
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search inquiry, family ID, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
              />
            </div>

            {/* View Mode Toggle (Grid vs List) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-[#3D6B22] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-[#3D6B22] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.id === "ALL" ? !currentStage : currentStage === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === "ALL") {
                    setTabFilter("ALL");
                    onSelectStageFilter(null);
                  } else {
                    setTabFilter(tab.id);
                    onSelectStageFilter(tab.id as InquiryStage);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#3D6B22] text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}

          {currentStage && (
            <button
              type="button"
              onClick={() => {
                setTabFilter("ALL");
                onSelectStageFilter(null);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 px-2 py-1 ml-auto cursor-pointer transition-colors"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredInquiries.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center">
          <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-slate-900">No inquiries match criteria</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search terms or clearing the stage filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              onSelectStageFilter(null);
              setTabFilter("ALL");
            }}
            className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#3D6B22] bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredInquiries.map((inquiry, index) => {
            const badge = STAGE_BADGES[inquiry.stage];
            const detailsHref = getDetailsHref(inquiry.id);

            return (
              <Link
                key={inquiry.id}
                href={detailsHref}
                className="bg-white border border-slate-200/80 hover:border-[#3D6B22]/50 hover:shadow-md rounded-2xl p-4 sm:p-4.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20"
              >
                <div>
                  {/* Top: Record Label + Stage Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        Family Record {String(index + 1).padStart(2, "0")}
                      </span>
                      {inquiry.urgency === "Urgent" && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Urgent
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {inquiry.stage}
                    </span>
                  </div>

                  {/* Family Title */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors truncate">
                    {inquiry.familyName}
                  </h3>

                  {/* Client Info */}
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Client: <strong className="text-slate-800 font-semibold">{inquiry.familyInfo.clientInfo.name}</strong> ({inquiry.familyInfo.clientInfo.age}y)
                    </span>
                  </p>

                  {/* Program / Hours Details */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-[11px]">Program:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[170px]" title={inquiry.careRequirements.programInterest}>
                        {inquiry.careRequirements.programInterest}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-[11px]">Requested:</span>
                      <span className="font-semibold text-slate-900">
                        {inquiry.careRequirements.hoursPerWeek} hrs / wk
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Source · Date · Action Link */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                    <span className="font-mono font-semibold text-slate-700">{inquiry.id}</span>
                    <span>·</span>
                    <span className="truncate">{inquiry.source}</span>
                    <span>·</span>
                    <span>{inquiry.dateReceived}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3D6B22] group-hover:translate-x-0.5 transition-transform shrink-0">
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Family & Client</th>
                  <th className="py-3 px-3">Inquiry ID</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">Program & Hours</th>
                  <th className="py-3 px-3">Assigned Coordinator</th>
                  <th className="py-3 px-3">Received</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInquiries.map((inquiry) => {
                  const badge = STAGE_BADGES[inquiry.stage];
                  const detailsHref = getDetailsHref(inquiry.id);

                  return (
                    <tr
                      key={inquiry.id}
                      onClick={() => handleRowClick(inquiry.id)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={detailsHref}
                          className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors hover:underline block"
                        >
                          {inquiry.familyName}
                        </Link>
                        <div className="text-[11px] text-slate-500">
                          Client: {inquiry.familyInfo.clientInfo.name} ({inquiry.familyInfo.clientInfo.age}y)
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-medium text-slate-800">
                        {inquiry.id}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {inquiry.stage}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        <span className="font-medium text-slate-800">{inquiry.source}</span>
                        {inquiry.referralInfo.organization && (
                          <span className="block text-[10px] text-slate-400 truncate max-w-[140px]">
                            {inquiry.referralInfo.organization}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        <span className="font-medium text-slate-800 block truncate max-w-[150px]">
                          {inquiry.careRequirements.programInterest}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {inquiry.careRequirements.hoursPerWeek} hrs / wk
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-800">
                        <div className="flex items-center gap-2">
                          {inquiry.referralInfo.assignedCoordinator.avatarUrl ? (
                            <img
                              src={inquiry.referralInfo.assignedCoordinator.avatarUrl}
                              alt={inquiry.referralInfo.assignedCoordinator.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#1E5622] text-[10px] font-bold flex items-center justify-center">
                              {inquiry.referralInfo.assignedCoordinator.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium">{inquiry.referralInfo.assignedCoordinator.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                        {inquiry.dateReceived}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          href={detailsHref}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#3D6B22] group-hover:translate-x-1 transition-transform"
                        >
                          <span>View</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
