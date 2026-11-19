"use client";

import React, { useState, useMemo } from "react";
import { InquiryRecord, InquiryStage } from "@/types/intake";
import { InquiryDetailView } from "./InquiryDetailView";
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  PhoneCall,
  Stethoscope,
  FileText,
  CheckCircle2,
  AlertTriangle,
  User,
  Inbox,
  Filter,
} from "lucide-react";

interface InquiryManagementWorkspaceProps {
  inquiries: InquiryRecord[];
  selectedInquiry: InquiryRecord | null;
  onSelectInquiry: (inquiry: InquiryRecord) => void;
  selectedStageFilter: InquiryStage | null;
  onSelectStageFilter: (stage: InquiryStage | null) => void;
  onContactFamily: (inquiry: InquiryRecord) => void;
  onAssignCoordinator: (inquiry: InquiryRecord) => void;
  onScheduleAssessment: (inquiry: InquiryRecord) => void;
  onUpdateStatus: (inquiry: InquiryRecord, newStage: InquiryRecord["stage"]) => void;
  onConvertToOnboarding: (inquiry: InquiryRecord) => void;
  onAddTimelineNote: (inquiryId: string, noteText: string) => void;
  onToggleDocumentStatus: (inquiryId: string, docId: string) => void;
}

const STAGE_BADGES: Record<InquiryStage, { bg: string; text: string; border: string }> = {
  "New Lead": { bg: "bg-[#FEF2F2]", text: "text-[#B91C1C]", border: "border-[#FECACA]" },
  "Contacted": { bg: "bg-[#FEF3C7]", text: "text-[#9A5B00]", border: "border-[#FDE68A]" },
  "In Assessment": { bg: "bg-[#E0F2FE]", text: "text-[#0369A1]", border: "border-[#BAE6FD]" },
  "CM Coordination": { bg: "bg-[#EEF2FF]", text: "text-[#4338CA]", border: "border-[#C7D2FE]" },
  "Converted": { bg: "bg-[#E3F1D9]", text: "text-[#1E5622]", border: "border-[#C7E4B3]" },
};

export function InquiryManagementWorkspace({
  inquiries,
  selectedInquiry,
  onSelectInquiry,
  selectedStageFilter,
  onSelectStageFilter,
  onContactFamily,
  onAssignCoordinator,
  onScheduleAssessment,
  onUpdateStatus,
  onConvertToOnboarding,
  onAddTimelineNote,
  onToggleDocumentStatus,
}: InquiryManagementWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tabFilter, setTabFilter] = useState<string>("ALL");

  // Keep tab filter and selectedStageFilter in sync
  const currentStage = selectedStageFilter || (tabFilter !== "ALL" ? (tabFilter as InquiryStage) : null);

  const tabs: { id: string; label: string; count?: number }[] = [
    { id: "ALL", label: "All inquiries", count: inquiries.length },
    { id: "New Lead", label: "New", count: inquiries.filter((i) => i.stage === "New Lead").length },
    { id: "Contacted", label: "Contacted", count: inquiries.filter((i) => i.stage === "Contacted").length },
    { id: "In Assessment", label: "Assessment", count: inquiries.filter((i) => i.stage === "In Assessment").length },
    { id: "CM Coordination", label: "Coordination", count: inquiries.filter((i) => i.stage === "CM Coordination").length },
    { id: "Converted", label: "Converted", count: inquiries.filter((i) => i.stage === "Converted").length },
  ];

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      // Stage / Tab Filter
      if (currentStage && item.stage !== currentStage) {
        return false;
      }

      // Search Query
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

  return (
    <section aria-label="Inquiry Management Workspace" className="space-y-3">
      {/* Workspace Header & Search / Filter Controls */}
      <div className="bg-[#FFFFFF] border border-[#D5DFDA] rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#111C16] tracking-tight">
              Inquiry Management
            </h2>
            <p className="text-xs text-[#4A5D52] mt-0.5">
              Review, qualify and manage family inquiries in real-time
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#74877C]" />
            <input
              type="text"
              placeholder="Search inquiry, family ID, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F9F8] border border-[#D5DFDA] rounded-xl text-[#111C16] placeholder-[#74877C] focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#D5DFDA]/60 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive =
              tab.id === "ALL"
                ? !currentStage
                : currentStage === tab.id;

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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#3D6B22] text-white shadow-xs"
                    : "bg-[#F7F9F8] text-[#4A5D52] hover:bg-[#EEF2F0] hover:text-[#111C16] border border-[#D5DFDA]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-[#D5DFDA]/60 text-[#4A5D52]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Split-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Pane: Inquiry List (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-[#4A5D52] px-1 font-medium">
            <span>
              Showing {filteredInquiries.length} of {inquiries.length} inquiries
            </span>
            {currentStage && (
              <span className="text-[#3D6B22] font-semibold">
                Filtered: {currentStage}
              </span>
            )}
          </div>

          {filteredInquiries.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#D5DFDA] rounded-2xl p-8 text-center">
              <Inbox className="w-10 h-10 text-[#74877C] mx-auto mb-2 opacity-50" />
              <h3 className="text-sm font-semibold text-[#111C16]">No inquiries match criteria</h3>
              <p className="text-xs text-[#4A5D52] mt-1">
                Try adjusting your search terms or clearing the stage filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  onSelectStageFilter(null);
                  setTabFilter("ALL");
                }}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#3D6B22] bg-[#E3F1D9] rounded-lg hover:bg-[#C7E4B3] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
              {filteredInquiries.map((inquiry, index) => {
                const isSelected = selectedInquiry?.id === inquiry.id;
                const badge = STAGE_BADGES[inquiry.stage];

                return (
                  <button
                    key={inquiry.id}
                    type="button"
                    onClick={() => onSelectInquiry(inquiry)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer relative group ${
                      isSelected
                        ? "bg-[#FFFFFF] border-[#3D6B22] shadow-sm ring-2 ring-[#3D6B22]/15"
                        : "bg-[#FFFFFF] hover:bg-[#F7F9F8] border-[#D5DFDA] hover:border-[#93C573]"
                    }`}
                  >
                    {/* Top Row: Family Label + Stage Badge */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-bold text-[#74877C]">
                          Family Record {String(index + 1).padStart(2, "0")}
                        </span>
                        {inquiry.urgency === "Urgent" && (
                          <span className="w-2 h-2 rounded-full bg-[#FF6E61]" title="Urgent inquiry" />
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {inquiry.stage}
                      </span>
                    </div>

                    {/* Middle Row: Family Name & Client */}
                    <h3 className="text-sm font-bold text-[#111C16] group-hover:text-[#3D6B22] transition-colors truncate">
                      {inquiry.familyName}
                    </h3>
                    <p className="text-xs text-[#4A5D52] truncate mt-0.5">
                      Client: <span className="text-[#111C16] font-medium">{inquiry.familyInfo.clientInfo.name}</span> ({inquiry.familyInfo.clientInfo.age}y)
                    </p>

                    {/* Bottom Row: ID · Source · Timestamp */}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#D5DFDA]/60 text-[11px] text-[#74877C]">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-mono font-medium text-[#111C16]">{inquiry.id}</span>
                        <span>·</span>
                        <span className="truncate">{inquiry.source}</span>
                      </div>
                      <span className="font-medium text-[#4A5D52] shrink-0">
                        {inquiry.dateReceived}
                      </span>
                    </div>

                    {/* Active Indicator Chevron */}
                    {isSelected && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex text-[#3D6B22]">
                        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane: Selected Inquiry Details (7 cols on lg) */}
        <div className="lg:col-span-7">
          {selectedInquiry ? (
            <InquiryDetailView
              inquiry={selectedInquiry}
              onContactFamily={onContactFamily}
              onAssignCoordinator={onAssignCoordinator}
              onScheduleAssessment={onScheduleAssessment}
              onUpdateStatus={onUpdateStatus}
              onConvertToOnboarding={onConvertToOnboarding}
              onAddTimelineNote={onAddTimelineNote}
              onToggleDocumentStatus={onToggleDocumentStatus}
            />
          ) : (
            <div className="bg-[#FFFFFF] border border-[#D5DFDA] rounded-2xl p-12 text-center">
              <User className="w-12 h-12 text-[#74877C] mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-bold text-[#111C16]">Select an Inquiry Record</h3>
              <p className="text-xs text-[#4A5D52] mt-1 max-w-sm mx-auto">
                Choose a family inquiry from the list on the left to view complete family details, referral notes, care requirements, documents, and take action.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
