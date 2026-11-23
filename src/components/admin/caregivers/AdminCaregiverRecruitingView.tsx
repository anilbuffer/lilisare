"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  Clock,
  Briefcase,
  FileText,
  CheckCircle2,
  ChevronRight,
  X,
  UserCheck,
  Send,
  Phone,
  Mail,
  ArrowRight,
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AdminCaregiverTopTabs } from "./AdminCaregiverTopTabs";

export type RecruitingStage =
  | "New"
  | "Interviewing"
  | "Background Check"
  | "Offer"
  | "Hired";

export interface RecruitingApplicant {
  id: string;
  name: string;
  role: string;
  appliedDate: string;
  matchScore: number;
  tags: string[];
  stage: RecruitingStage;
  email: string;
  phone: string;
  summary: string;
  certifications: string[];
  notes?: string;
}

const INITIAL_APPLICANTS: RecruitingApplicant[] = [
  {
    id: "app-1",
    name: "Jessica Smith",
    role: "CNA",
    appliedDate: "2 days ago",
    matchScore: 92,
    tags: ["Dementia Care", "Bilingual"],
    stage: "New",
    email: "jessica.smith@example.com",
    phone: "(555) 321-7890",
    summary:
      "Compassionate Certified Nursing Assistant with 4+ years experience in memory care and hospice support. Bilingual in English and Spanish.",
    certifications: ["State CNA Registry Active", "BLS/CPR (AHA)"],
  },
  {
    id: "app-2",
    name: "Michael Chen",
    role: "HHA",
    appliedDate: "3 days ago",
    matchScore: 78,
    tags: ["Night Shift", "CPR Certified"],
    stage: "New",
    email: "m.chen@example.com",
    phone: "(555) 432-8765",
    summary:
      "Dedicated Home Health Aide offering reliable overnight and weekend support. Experienced with mobility assistance and vital signs monitoring.",
    certifications: ["State HHA Certificate", "First Aid / CPR"],
  },
  {
    id: "app-3",
    name: "Sarah Jenkins",
    role: "RN",
    appliedDate: "1 week ago",
    matchScore: 98,
    tags: ["Wound Care", "IV Certified"],
    stage: "Interviewing",
    email: "sarah.j@example.com",
    phone: "(555) 543-9876",
    summary:
      "Registered Nurse with 7 years clinical experience in home health and acute care. Specializes in complex wound management and infusion therapy.",
    certifications: ["PA Registered Nurse License #RN-894210", "ACLS", "BLS"],
  },
  {
    id: "app-4",
    name: "David Miller",
    role: "CNA",
    appliedDate: "2 weeks ago",
    matchScore: 85,
    tags: ["Hospice", "Transfer Assistance"],
    stage: "Background Check",
    email: "david.m@example.com",
    phone: "(555) 654-0987",
    summary:
      "Patient-first caregiver experienced with mechanical lifts, transfer protocols, and palliative comfort care. Background check in progress with Checkr.",
    certifications: ["CNA License", "Hoyer Lift Certified"],
  },
  {
    id: "app-5",
    name: "Emily Davis",
    role: "Companion",
    appliedDate: "3 weeks ago",
    matchScore: 90,
    tags: ["Meal Prep", "Light Housekeeping"],
    stage: "Offer",
    email: "emily.d@example.com",
    phone: "(555) 765-1098",
    summary:
      "Warm and attentive companion caregiver specializing in senior companionship, nutrition prep, errands, and social engagement.",
    certifications: ["Driver License Clean Record", "CPR Certified"],
  },
];

const STAGES: RecruitingStage[] = [
  "New",
  "Interviewing",
  "Background Check",
  "Offer",
  "Hired",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function AdminCaregiverRecruitingView() {
  const [applicants, setApplicants] =
    useState<RecruitingApplicant[]>(INITIAL_APPLICANTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] =
    useState<RecruitingApplicant | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Applicant Form State
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("CNA");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newMatch, setNewMatch] = useState(88);
  const [newTags, setNewTags] = useState("Dementia Care, CPR");
  const [newStage, setNewStage] = useState<RecruitingStage>("New");

  // Filtering
  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = app.name.toLowerCase().includes(query);
        const matchesRole = app.role.toLowerCase().includes(query);
        const matchesTags = app.tags.some((t) =>
          t.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesRole && !matchesTags) return false;
      }
      if (selectedRole !== "ALL" && app.role !== selectedRole) {
        return false;
      }
      return true;
    });
  }, [applicants, searchQuery, selectedRole]);

  const moveStage = (applicantId: string, newStage: RecruitingStage) => {
    setApplicants((prev) =>
      prev.map((app) =>
        app.id === applicantId ? { ...app, stage: newStage } : app
      )
    );
    toast.success(`Applicant moved to ${newStage}`);
    if (selectedApplicant && selectedApplicant.id === applicantId) {
      setSelectedApplicant((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
  };

  const handleAddApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Please enter applicant name");
      return;
    }
    const tagsArray = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newApp: RecruitingApplicant = {
      id: `app-${Date.now()}`,
      name: newName.trim(),
      role: newRole,
      appliedDate: "Just now",
      matchScore: Number(newMatch) || 85,
      tags: tagsArray.length > 0 ? tagsArray : ["CPR Certified"],
      stage: newStage,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: newPhone || "(555) 000-0000",
      summary: `Candidate registered for ${newRole} position at LiliSare Agency.`,
      certifications: ["Pending verification"],
    };

    setApplicants((prev) => [newApp, ...prev]);
    toast.success(`Applicant ${newApp.name} added to ${newStage}`);
    setIsAddModalOpen(false);

    // Reset Form
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewTags("Dementia Care, CPR");
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 01. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Recruiting Pipeline
          </h1>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Applicant</span>
        </button>
      </div>

      {/* 02. Top Tab Navigation Bar */}
      <AdminCaregiverTopTabs activeTab="recruiting" />

      {/* 03. Search & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applicants by name, role, or skills..."
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
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-2.5 rounded-full bg-white border text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.03)] ${selectedRole !== "ALL"
                ? "border-[#3D6B22] text-[#1E5622] bg-[#E8F2E4]"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {selectedRole !== "ALL" && (
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-bold text-slate-800 px-2 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Filter by Role</span>
                  {selectedRole !== "ALL" && (
                    <button
                      onClick={() => setSelectedRole("ALL")}
                      className="text-[11px] text-[#3D6B22] hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="space-y-1 pt-2 text-xs">
                  {["ALL", "RN", "CNA", "HHA", "Companion"].map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setSelectedRole(role);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-between ${selectedRole === role
                        ? "bg-[#E8F2E4] text-[#1E5622] font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <span>{role === "ALL" ? "All Roles" : role}</span>
                      {selectedRole === role && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 04. Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
        {STAGES.map((stage) => {
          const stageApplicants = filteredApplicants.filter(
            (a) => a.stage === stage
          );
          return (
            <div
              key={stage}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col min-h-[460px]"
            >
              {/* Column Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                    {stage}
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-slate-200/70 text-slate-600 text-[11px] font-bold flex items-center justify-center">
                    {stageApplicants.length}
                  </span>
                </div>
                {stage === "New" && (
                  <button
                    onClick={() => {
                      setNewStage("New");
                      setIsAddModalOpen(true);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-[#E8F2E4] transition-colors"
                    title="Add to New"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Column Cards */}
              <div className="p-3 space-y-3 flex-1 flex flex-col">
                {stageApplicants.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApplicant(app)}
                    className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col gap-2.5 group"
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(app.name)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                            {app.name}
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            <span>{app.role}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Applied Date & Match Score */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Applied {app.appliedDate}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${app.matchScore >= 90
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : app.matchScore >= 80
                            ? "bg-teal-50 text-teal-700 border-teal-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                      >
                        {app.matchScore}% Match
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {app.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer link */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplicant(app);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3D6B22] hover:text-[#1E5622] transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Resume</span>
                      </button>

                      {/* Advance Stage shortcut */}
                      <select
                        onClick={(e) => e.stopPropagation()}
                        value={app.stage}
                        onChange={(e) =>
                          moveStage(app.id, e.target.value as RecruitingStage)
                        }
                        className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-0.5 focus:outline-none focus:border-[#3D6B22]"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {stageApplicants.length === 0 && (
                  <div className="flex-1 min-h-[140px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
                    No applicants
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 04. Applicant Details & Resume Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-bold flex items-center justify-center">
                  {getInitials(selectedApplicant.name)}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {selectedApplicant.name}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    {selectedApplicant.role} • Applied{" "}
                    {selectedApplicant.appliedDate}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
              {/* Match Score & Contact Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">
                    Match Score
                  </div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">
                    {selectedApplicant.matchScore}% Match
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">
                    Phone
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">
                    {selectedApplicant.phone}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">
                    Email
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5 truncate">
                    {selectedApplicant.email}
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Professional Summary
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {selectedApplicant.summary}
                </p>
              </div>

              {/* Skills & Specialties */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Skills & Certifications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplicant.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#E8F2E4] text-[#1E5622] rounded-lg text-xs font-semibold border border-[#3D6B22]/20"
                    >
                      {tag}
                    </span>
                  ))}
                  {selectedApplicant.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stage Transition Control */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2">
                  Recruiting Pipeline Stage
                </h4>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => moveStage(selectedApplicant.id, stage)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedApplicant.stage === stage
                        ? "bg-[#3D6B22] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => {
                  toast.success(
                    `Resume downloaded for ${selectedApplicant.name}`
                  );
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:text-[#1E5622]"
              >
                <FileText className="w-4 h-4" />
                <span>Download PDF Resume</span>
              </button>

              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 05. Add Applicant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Add Candidate to Pipeline
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    Enter candidate details to track in LiliSare Recruiting.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddApplicant} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Smith"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Role *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  >
                    <option value="CNA">CNA</option>
                    <option value="HHA">HHA</option>
                    <option value="RN">RN</option>
                    <option value="LPN">LPN</option>
                    <option value="PT">PT</option>
                    <option value="Companion">Companion</option>
                  </select>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Initial Stage
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) =>
                      setNewStage(e.target.value as RecruitingStage)
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Skills & Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dementia Care, Bilingual, Wound Care"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Applicant</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
