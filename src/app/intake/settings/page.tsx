"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock,
  Calendar,
  UserCheck,
  Stethoscope,
  Building2,
  Heart,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Key,
  RefreshCw,
  Sliders,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  getIntakeInquiriesFromStorage,
  saveIntakeInquiriesToStorage,
  subscribeToIntakeSync,
} from "@/lib/intake/intakeSync";
import { INITIAL_INQUIRIES } from "@/lib/intake/mockIntakeData";
import { INITIAL_CLIENTS, saveClientsToStorage } from "@/lib/clients/mockData";
import { MOCK_HOUSEHOLDS, saveHouseholdsToStorage } from "@/lib/households/mockData";
import { INITIAL_CAREGIVERS, saveCaregiversToStorage } from "@/lib/caregivers/mockData";

type SettingsTab = "rules" | "profile";

export default function IntakeSettingsPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("rules");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("Just now");

  // ----------------------------------------------------
  // Tab 1: Intake & Triage Rules State
  // ----------------------------------------------------
  const [hospitalDischargeSla, setHospitalDischargeSla] = useState("15");
  const [standardLeadSla, setStandardLeadSla] = useState("120");
  const [defaultAssignee, setDefaultAssignee] = useState("Round Robin");
  const [autoFlagHighAcuity, setAutoFlagHighAcuity] = useState(true);

  const [defaultAssessmentDuration, setDefaultAssessmentDuration] = useState("60");
  const [defaultPayerProgram, setDefaultPayerProgram] = useState("Georgia Medicaid Waiver (CCSP / SOURCE)");
  const [defaultCaregiverClassification, setDefaultCaregiverClassification] = useState<"W-2" | "1099">("W-2");
  const [requirePhysicianOrder, setRequirePhysicianOrder] = useState(true);

  // ----------------------------------------------------
  // Tab 2: Coordinator Profile & Security State
  // ----------------------------------------------------
  const [coordinatorName, setCoordinatorName] = useState(currentUser?.name || "Sarah Jenkins");
  const [coordinatorEmail, setCoordinatorEmail] = useState(currentUser?.email || "s.jenkins@lilisare.com");
  const [coordinatorPhone, setCoordinatorPhone] = useState("(404) 555-0192");
  const [branch, setBranch] = useState("North Metro Branch");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Load persisted settings
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("lilisare_intake_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.hospitalDischargeSla) setHospitalDischargeSla(parsed.hospitalDischargeSla);
        if (parsed.standardLeadSla) setStandardLeadSla(parsed.standardLeadSla);
        if (parsed.defaultAssignee) setDefaultAssignee(parsed.defaultAssignee);
        if (parsed.autoFlagHighAcuity !== undefined) setAutoFlagHighAcuity(parsed.autoFlagHighAcuity);
        if (parsed.defaultAssessmentDuration) setDefaultAssessmentDuration(parsed.defaultAssessmentDuration);
        if (parsed.defaultPayerProgram) setDefaultPayerProgram(parsed.defaultPayerProgram);
        if (parsed.defaultCaregiverClassification) setDefaultCaregiverClassification(parsed.defaultCaregiverClassification);
        if (parsed.requirePhysicianOrder !== undefined) setRequirePhysicianOrder(parsed.requirePhysicianOrder);
        if (parsed.coordinatorName) setCoordinatorName(parsed.coordinatorName);
        if (parsed.coordinatorEmail) setCoordinatorEmail(parsed.coordinatorEmail);
        if (parsed.coordinatorPhone) setCoordinatorPhone(parsed.coordinatorPhone);
        if (parsed.branch) setBranch(parsed.branch);
      }
    } catch {
      // ignore JSON parse error
    }

    const unsubscribe = subscribeToIntakeSync(() => {
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    });
    return unsubscribe;
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window === "undefined") return;

    const payload = {
      hospitalDischargeSla,
      standardLeadSla,
      defaultAssignee,
      autoFlagHighAcuity,
      defaultAssessmentDuration,
      defaultPayerProgram,
      defaultCaregiverClassification,
      requirePhysicianOrder,
      coordinatorName,
      coordinatorEmail,
      coordinatorPhone,
      branch,
    };

    localStorage.setItem("lilisare_intake_settings", JSON.stringify(payload));
    toast.success("Intake settings saved successfully");
  };

  const handleForceResync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      toast.success("Synchronized with Agency Admin data stores");
    }, 400);
  };

  const handleResetDemoData = () => {
    if (typeof window === "undefined") return;
    if (window.confirm("Reset all intake inquiries, clients, households, and caregivers to factory seed data?")) {
      saveIntakeInquiriesToStorage(INITIAL_INQUIRIES);
      saveClientsToStorage(INITIAL_CLIENTS);
      saveHouseholdsToStorage(MOCK_HOUSEHOLDS);
      saveCaregiversToStorage(INITIAL_CAREGIVERS);
      toast.success("Demo records restored to factory state");
      handleForceResync();
    }
  };

  const tabs = [
    {
      id: "rules" as const,
      title: "Intake & Triage Rules",
      description: "SLA response thresholds, lead routing, and assessment defaults",
      icon: Sliders,
    },
    {
      id: "profile" as const,
      title: "Coordinator Profile & Security",
      description: "Your contact details, assigned branch, and data sync",
      icon: User,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-16 animate-in fade-in duration-200">
      {/* 01. Back Button */}
      <div>
        <Link
          href="/intake/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_6px_32px_rgba(0,0,0,0.06)] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Intake Dashboard</span>
        </Link>
      </div>

      {/* 02. Header Banner (Matching /intake/pipeline/new Style) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-[0_6px_32px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200/80">
                Portal Settings
              </span>
              <span className="text-xs text-slate-400">Synced: {lastSyncTime}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Intake Coordinator Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure triage response SLAs, lead routing, assessment defaults, and your coordinator profile.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center shrink-0 self-start sm:self-center shadow-[0_4px_16px_rgba(61,107,34,0.12)]">
            <Sparkles className="w-6 h-6 text-[#3D6B22]" />
          </div>
        </div>

        {/* Focused 2-Tab Selector */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    isActive
                      ? "border-[#3D6B22] bg-[#3D6B22]/5 shadow-xs"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                      isActive
                        ? "bg-[#3D6B22] text-white shadow-xs"
                        : "bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-bold truncate ${
                        isActive ? "text-[#3D6B22]" : "text-slate-800"
                      }`}
                    >
                      {t.title}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {t.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 03. Main Guided Form Card */}
      <form
        onSubmit={handleSave}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-6"
      >
        {/* TAB 1: INTAKE & TRIAGE RULES */}
        {activeTab === "rules" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Section 1: Response SLAs & Lead Routing */}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                1. Response SLAs & Priority Rules
                <div className="h-px bg-slate-100 flex-1"></div>
              </h4>
              <p className="text-xs text-slate-500">
                Define target response timeframes for hospital discharge referrals and community web leads.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-1">
              {/* Hospital Discharge SLA */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Hospital Discharge SLA Target
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <select
                    value={hospitalDischargeSla}
                    onChange={(e) => setHospitalDischargeSla(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none"
                  >
                    <option value="15">&lt; 15 Minutes (Hospital Protocol)</option>
                    <option value="30">&lt; 30 Minutes</option>
                    <option value="45">&lt; 45 Minutes</option>
                    <option value="60">&lt; 60 Minutes</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Standard Lead SLA */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Community & Web Lead SLA Target
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <select
                    value={standardLeadSla}
                    onChange={(e) => setStandardLeadSla(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none"
                  >
                    <option value="60">&lt; 1 Hour</option>
                    <option value="120">&lt; 2 Hours (Standard)</option>
                    <option value="240">&lt; 4 Hours</option>
                    <option value="1440">&lt; 24 Hours</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Default Assignee */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[13px] font-medium text-slate-700">
                  Default Intake Assignee
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <select
                    value={defaultAssignee}
                    onChange={(e) => setDefaultAssignee(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none"
                  >
                    <option value="Round Robin">Automatic Round Robin (All Active Coordinators)</option>
                    <option value="Sarah Jenkins">Sarah Jenkins (Primary Intake Coordinator)</option>
                    <option value="Marcus Vance">Marcus Vance (Pediatric Specialist)</option>
                    <option value="Elena Rostova">Elena Rostova (Senior Waiver Coordinator)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* High-Acuity Priority Flagging Toggle */}
              <div className="sm:col-span-2 pt-1">
                <label className="flex items-center gap-3 p-3 bg-slate-50/60 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={autoFlagHighAcuity}
                    onChange={(e) => setAutoFlagHighAcuity(e.target.checked)}
                    className="w-4 h-4 rounded text-[#3D6B22] focus:ring-[#3D6B22] cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800">
                      Auto-flag hospital discharge and high-acuity inquiries as Immediate
                    </span>
                    <span className="block text-slate-500 text-[11px] mt-0.5">
                      Triggers top-priority visual indicators across the queue and notifies on-call staff.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 2: Clinical Assessment & Payer Defaults */}
            <div className="pt-2">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                2. Clinical Assessment & Payer Defaults
                <div className="h-px bg-slate-100 flex-1"></div>
              </h4>
              <p className="text-xs text-slate-500">
                Preset standard parameters used when booking initial in-home assessments and registering cases.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-1">
              {/* Default Duration */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Default RN Assessment Duration
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <select
                    value={defaultAssessmentDuration}
                    onChange={(e) => setDefaultAssessmentDuration(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none"
                  >
                    <option value="45">45 Minutes (Fast-Track Initial)</option>
                    <option value="60">60 Minutes (Standard Comprehensive)</option>
                    <option value="90">90 Minutes (Pediatric High-Acuity / Complex)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Default Caregiver Classification */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Caregiver Default Classification
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Heart className="h-4 w-4" />
                  </div>
                  <select
                    value={defaultCaregiverClassification}
                    onChange={(e) => setDefaultCaregiverClassification(e.target.value as "W-2" | "1099")}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none"
                  >
                    <option value="W-2">W-2 Direct Employee (Georgia Standard)</option>
                    <option value="1099">1099 Independent Contractor</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Primary Payer Program */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[13px] font-medium text-slate-700">
                  Primary Payer Program Preset
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <select
                    value={defaultPayerProgram}
                    onChange={(e) => setDefaultPayerProgram(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none"
                  >
                    <option value="Georgia Medicaid Waiver (CCSP / SOURCE)">
                      Georgia Medicaid Waiver (CCSP / SOURCE)
                    </option>
                    <option value="Pediatric In-Home (EPSDT)">
                      Pediatric In-Home (EPSDT)
                    </option>
                    <option value="Private Duty / Self-Pay">
                      Private Duty / Self-Pay
                    </option>
                    <option value="Veterans Care Coordination">
                      Veterans Care Coordination (VA)
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Physician Order Requirement Toggle */}
              <div className="sm:col-span-2 pt-1">
                <label className="flex items-center gap-3 p-3 bg-slate-50/60 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={requirePhysicianOrder}
                    onChange={(e) => setRequirePhysicianOrder(e.target.checked)}
                    className="w-4 h-4 rounded text-[#3D6B22] focus:ring-[#3D6B22] cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800">
                      Require signed physician order before RN assessment dispatch
                    </span>
                    <span className="block text-slate-500 text-[11px] mt-0.5">
                      Ensures compliance with Georgia Department of Community Health guidelines before scheduling.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COORDINATOR PROFILE & SECURITY */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Section 1: Contact Information */}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                1. Coordinator Information & Regional Office
                <div className="h-px bg-slate-100 flex-1"></div>
              </h4>
              <p className="text-xs text-slate-500">
                Your coordinator details are stamped on referral communications, inquiry notes, and audit logs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-1">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Coordinator Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={coordinatorName}
                    onChange={(e) => setCoordinatorName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Work Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={coordinatorEmail}
                    onChange={(e) => setCoordinatorEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              {/* Direct Phone */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Direct Phone / Extension
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    value={coordinatorPhone}
                    onChange={(e) => setCoordinatorPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              {/* Regional Branch */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Primary Regional Branch
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none"
                  >
                    <option value="North Metro Branch">North Metro Branch (Atlanta)</option>
                    <option value="South Metro Hub">South Metro Hub (Clayton / Henry)</option>
                    <option value="Savannah Regional">Savannah Regional Hub</option>
                    <option value="Augusta Office">Augusta Regional Office</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Security & Credentials */}
            <div className="pt-2">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                2. Password & Access Credentials
                <div className="h-px bg-slate-100 flex-1"></div>
              </h4>
              <p className="text-xs text-slate-500">
                Update your portal login password in accordance with HIPAA access policy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Data Store Management */}
            <div className="pt-2">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                3. Agency Data Sync & Reset
                <div className="h-px bg-slate-100 flex-1"></div>
              </h4>
              <p className="text-xs text-slate-500">
                Manage live browser store synchronization and testing seed records.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50/80 border border-slate-200 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Seed Data Recovery
                </span>
                <span className="text-[11px] text-slate-500">
                  Re-initialize demo inquiries, clients, and caregivers if data becomes corrupted.
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetDemoData}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        )}

        {/* 04. Unified Form Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleForceResync}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#3D6B22] ${isSyncing ? "animate-spin" : ""}`} />
            <span>Force Resync Stores</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
