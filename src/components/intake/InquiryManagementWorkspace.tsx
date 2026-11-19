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
  Users,
  Heart,
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
  "Converted": { bg: "bg-[#E3F1D9]", text: "text-[#1E5622]", border: "border-[#3D6B22]/20" },
};

const formatShortProgram = (program: string): string => {
  if (program.includes("CCSP")) return "CCSP Waiver";
  if (program.includes("SOURCE")) return "SOURCE Waiver";
  if (program.includes("Private Pay")) return "Private Pay";
  if (program.includes("VA")) return "VA Aid & Attend";
  if (program.includes("GAPP")) return "GAPP Pediatric";
  return program.split("(")[0].trim() || program;
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
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
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
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              />
            </div>

            {/* View Mode Toggle (Grid vs List) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "grid"
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
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "list"
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${isActive
                    ? "bg-[#1B3414] text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInquiries.map((inquiry) => {
            const badge = STAGE_BADGES[inquiry.stage];
            const detailsHref = getDetailsHref(inquiry.id);

            return (
              <Link
                key={inquiry.id}
                href={detailsHref}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#3D6B22]/60 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20"
              >
                <div>
                  {/* Top: Family Title + ID/Branch + Stage Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors truncate">
                          {inquiry.familyName}
                        </h3>
                        {inquiry.urgency === "Urgent" && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Urgent Priority" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono text-slate-500 font-medium">{inquiry.id}</span>
                        <span>•</span>
                        <span className="truncate">{inquiry.branch}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {inquiry.stage}
                    </span>
                  </div>

                  {/* Connected Household Unit snippet */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1.5 shrink-0">
                        <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        Loved One:
                      </span>
                      <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                        {inquiry.familyInfo.clientInfo.name}{" "}
                        <span className="text-slate-400 font-normal">({inquiry.familyInfo.clientInfo.age}y)</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1.5 shrink-0">
                        <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        Caregiver/Contact:
                      </span>
                      <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                        {inquiry.familyInfo.potentialCaregiver?.name || inquiry.familyInfo.primaryContact}
                      </span>
                    </div>
                  </div>

                  {/* Compact Tags */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium bg-[#E3F1D9] text-[#1E5622] px-2.5 py-0.5 rounded-lg border border-[#3D6B22]/20 truncate">
                      {formatShortProgram(inquiry.careRequirements.programInterest)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60 shrink-0">
                      {inquiry.careRequirements.hoursPerWeek} hrs/wk
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 truncate text-slate-500">
                    <span className="text-slate-400">Coord:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[120px]">
                      {inquiry.referralInfo.assignedCoordinator.name.split(" ")[0]}
                    </span>
                    <span>·</span>
                    <span>{inquiry.dateReceived}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 font-semibold text-xs text-[#3D6B22] group-hover:translate-x-1 transition-transform shrink-0">
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
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 pl-6">Family & Loved One</th>
                  <th className="py-3.5 px-3">Inquiry ID</th>
                  <th className="py-3.5 px-3">Program</th>
                  <th className="py-3.5 px-3">Hours</th>
                  <th className="py-3.5 px-3">Stage</th>
                  <th className="py-3.5 px-3">Coordinator</th>
                  <th className="py-3.5 px-3">Received</th>
                  <th className="py-3.5 px-4 pr-6 text-right">Action</th>
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
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 pl-6">
                        <Link
                          href={detailsHref}
                          className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors block text-xs"
                        >
                          {inquiry.familyName}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {inquiry.familyInfo.clientInfo.name} ({inquiry.familyInfo.clientInfo.age}y) • {inquiry.branch}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-medium text-slate-700">
                        {inquiry.id}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-[11px] font-medium bg-[#E3F1D9] text-[#1E5622] px-2.5 py-0.5 rounded-full border border-[#3D6B22]/20 inline-block">
                          {formatShortProgram(inquiry.careRequirements.programInterest)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {inquiry.careRequirements.hoursPerWeek} hrs/wk
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {inquiry.stage}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-700">
                        <div className="font-medium text-slate-800">{inquiry.referralInfo.assignedCoordinator.name}</div>
                        <div className="text-[11px] text-slate-400">{inquiry.source}</div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                        {inquiry.dateReceived}
                      </td>

                      <td className="py-3.5 px-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={detailsHref}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-[#F2F8EE] border border-slate-200 hover:border-[#3D6B22]/40 text-slate-700 hover:text-[#3D6B22] rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#3D6B22]" />
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
