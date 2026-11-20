"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Save,
  Key,
  Eye,
  EyeOff,
  UserCheck,
  Filter,
  ShieldCheck,
  Heart,
  RefreshCw,
  Stethoscope,
  ArrowRight,
  Database,
  Lock,
  Smartphone,
  Laptop,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/Card";
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

type SettingsTab = "triage" | "assessments" | "caregivers" | "sync" | "profile" | "security";

export default function IntakeSettingsPage() {
  const { currentUser } = useAuth();

  // Active Category Tab
  const [activeTab, setActiveTab] = useState<SettingsTab>("triage");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("Just now");

  // ----------------------------------------------------
  // Triage & SLA Configuration State
  // ----------------------------------------------------
  const [hospitalDischargeSla, setHospitalDischargeSla] = useState("15");
  const [standardLeadSla, setStandardLeadSla] = useState("120");
  const [defaultAssignee, setDefaultAssignee] = useState("Round Robin");
  const [autoFlagHighAcuity, setAutoFlagHighAcuity] = useState(true);

  // ----------------------------------------------------
  // Assessments & Registration State
  // ----------------------------------------------------
  const [defaultAssessmentDuration, setDefaultAssessmentDuration] = useState("60");
  const [autoAssignRN, setAutoAssignRN] = useState("Yes");
  const [defaultPayerProgram, setDefaultPayerProgram] = useState("Georgia Medicaid Waiver (CCSP / SOURCE)");
  const [requirePhysicianOrder, setRequirePhysicianOrder] = useState(true);

  // ----------------------------------------------------
  // Caregiver Workforce State
  // ----------------------------------------------------
  const [defaultCaregiverClassification, setDefaultCaregiverClassification] = useState<"W-2" | "1099">("W-2");
  const [requiredLmsTrainingHours, setRequiredLmsTrainingHours] = useState("16");
  const [screeningVendor, setScreeningVendor] = useState("Sterling Healthcare Triage");
  const [autoTriggerAdpSetup, setAutoTriggerAdpSetup] = useState(true);

  // ----------------------------------------------------
  // Coordinator Profile State
  // ----------------------------------------------------
  const [name, setName] = useState("Sarah Jenkins");
  const [title, setTitle] = useState("Lead Intake Coordinator");
  const [email, setEmail] = useState("sarah.jenkins@lilisare.com");
  const [phone, setPhone] = useState("(404) 555-0182");
  const [branch, setBranch] = useState("North Metro Branch");

  // ----------------------------------------------------
  // Security Form State
  // ----------------------------------------------------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Load saved settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("lilisare_intake_settings");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.hospitalDischargeSla) setHospitalDischargeSla(parsed.hospitalDischargeSla);
          if (parsed.standardLeadSla) setStandardLeadSla(parsed.standardLeadSla);
          if (parsed.defaultAssignee) setDefaultAssignee(parsed.defaultAssignee);
          if (parsed.defaultAssessmentDuration) setDefaultAssessmentDuration(parsed.defaultAssessmentDuration);
          if (parsed.autoAssignRN) setAutoAssignRN(parsed.autoAssignRN);
          if (parsed.defaultCaregiverClassification) setDefaultCaregiverClassification(parsed.defaultCaregiverClassification);
          if (parsed.name) setName(parsed.name);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.branch) setBranch(parsed.branch);
        }
      } catch (err) {
        console.error("Failed to read settings from storage", err);
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const payload = {
        hospitalDischargeSla,
        standardLeadSla,
        defaultAssignee,
        autoFlagHighAcuity,
        defaultAssessmentDuration,
        autoAssignRN,
        requirePhysicianOrder,
        defaultPayerProgram,
        defaultCaregiverClassification,
        requiredLmsTrainingHours,
        screeningVendor,
        autoTriggerAdpSetup,
        name,
        title,
        email,
        phone,
        branch,
      };
      localStorage.setItem("lilisare_intake_settings", JSON.stringify(payload));
    }
    toast.success("Settings saved successfully");
  };

  const handleForceResync = () => {
    setIsSyncing(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("lilisare_intake_sync"));
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Stores synchronized with Agency Admin");
    }, 300);
  };

  const handleResetSampleData = () => {
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
    { id: "triage" as const, label: "Triage & SLAs", icon: Filter },
    { id: "assessments" as const, label: "Assessments", icon: Stethoscope },
    { id: "caregivers" as const, label: "Caregivers", icon: Heart },
    { id: "sync" as const, label: "Data & Sync", icon: Database },
    { id: "profile" as const, label: "Profile", icon: UserCheck },
    { id: "security" as const, label: "Security", icon: Lock },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-14 animate-in fade-in duration-300">
      {/* 01. Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Intake Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Synced with Agency Admin ({lastSyncTime})</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/intake/dashboard"
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs"
          >
            <span>Intake Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleForceResync}
            className="flex items-center gap-2 bg-[#1B3414] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#274C1D] transition-colors shadow-sm shadow-[#1B3414]/20 whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-[#93C573]", isSyncing && "animate-spin")} />
            <span>Sync Stores</span>
          </button>
        </div>
      </div>

      {/* 02. 2-Column Clean Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Navigation: Minimal Tabs with NO subtexts */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-2 space-y-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-3 cursor-pointer text-xs",
                  isActive
                    ? "bg-[#1B3414] text-white font-bold shadow-xs"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-[#93C573]" : "text-slate-500"
                  )}
                />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Form Container */}
        <div className="lg:col-span-3">
          {/* TAB 1: TRIAGE & SLAS */}
          {activeTab === "triage" && (
            <form
              onSubmit={handleSave}
              className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 lg:p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Triage & SLA Rules
                </h3>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-[#93C573]" />
                  <span>Save Changes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Hospital Discharge SLA</label>
                  <select
                    value={hospitalDischargeSla}
                    onChange={(e) => setHospitalDischargeSla(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  >
                    <option value="15">15 Minutes (Hospital Protocol)</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Standard Lead SLA Target</label>
                  <select
                    value={standardLeadSla}
                    onChange={(e) => setStandardLeadSla(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  >
                    <option value="60">1 Hour</option>
                    <option value="120">2 Hours (Standard)</option>
                    <option value="240">4 Hours</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-slate-700">Coordinator Routing</label>
                  <select
                    value={defaultAssignee}
                    onChange={(e) => setDefaultAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  >
                    <option value="Round Robin">Round Robin (Distribute Evenly)</option>
                    <option value="Branch Territory">Branch Territory (Match Client Zip)</option>
                    <option value="Assign to Me">Assign to Sarah Jenkins (Lead)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Auto-Flag High Acuity Referrals</span>
                <input
                  type="checkbox"
                  checked={autoFlagHighAcuity}
                  onChange={(e) => setAutoFlagHighAcuity(e.target.checked)}
                  className="w-4 h-4 text-[#3D6B22] rounded accent-[#3D6B22] cursor-pointer"
                />
              </div>
            </form>
          )}

          {/* TAB 2: ASSESSMENTS */}
          {activeTab === "assessments" && (
            <form
              onSubmit={handleSave}
              className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 lg:p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Clinical Assessment Rules
                </h3>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-[#93C573]" />
                  <span>Save Changes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">RN Assessment Duration</label>
                  <select
                    value={defaultAssessmentDuration}
                    onChange={(e) => setDefaultAssessmentDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  >
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes (Standard)</option>
                    <option value="90">90 Minutes (High Acuity)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Auto-Assign Field RN</label>
                  <select
                    value={autoAssignRN}
                    onChange={(e) => setAutoAssignRN(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  >
                    <option value="Yes">Yes (Territory Match)</option>
                    <option value="No">No (Manual Lead Assignment)</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-slate-700">Default Service Program</label>
                  <select
                    value={defaultPayerProgram}
                    onChange={(e) => setDefaultPayerProgram(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  >
                    <option value="Georgia Medicaid Waiver (CCSP / SOURCE)">Georgia Medicaid Waiver (CCSP / SOURCE)</option>
                    <option value="Pediatric In-Home Care (EPSDT)">Pediatric In-Home Care (EPSDT)</option>
                    <option value="Senior Community Care">Senior Community Care (AAA Waiver)</option>
                    <option value="Private Duty / Self-Pay">Private Duty / Commercial</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Require Signed Physician Orders</span>
                <input
                  type="checkbox"
                  checked={requirePhysicianOrder}
                  onChange={(e) => setRequirePhysicianOrder(e.target.checked)}
                  className="w-4 h-4 text-[#3D6B22] rounded accent-[#3D6B22] cursor-pointer"
                />
              </div>
            </form>
          )}

          {/* TAB 3: CAREGIVERS */}
          {activeTab === "caregivers" && (
            <form
              onSubmit={handleSave}
              className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 lg:p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Caregiver Workforce Rules
                </h3>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-[#93C573]" />
                  <span>Save Changes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Default Classification</label>
                  <select
                    value={defaultCaregiverClassification}
                    onChange={(e) => setDefaultCaregiverClassification(e.target.value as "W-2" | "1099")}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  >
                    <option value="W-2">W-2 Employed Caregiver</option>
                    <option value="1099">1099 Independent Contractor</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Mandatory LMS Training</label>
                  <select
                    value={requiredLmsTrainingHours}
                    onChange={(e) => setRequiredLmsTrainingHours(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  >
                    <option value="8">8 Hours (Express)</option>
                    <option value="16">16 Hours (State Standard)</option>
                    <option value="24">24 Hours (Comprehensive)</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-slate-700">Background Screening Vendor</label>
                  <select
                    value={screeningVendor}
                    onChange={(e) => setScreeningVendor(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  >
                    <option value="Sterling Healthcare Triage">Sterling Healthcare Triage</option>
                    <option value="Checkr Healthcare FastTrack">Checkr Healthcare FastTrack</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Automated Direct Deposit Setup Link</span>
                <input
                  type="checkbox"
                  checked={autoTriggerAdpSetup}
                  onChange={(e) => setAutoTriggerAdpSetup(e.target.checked)}
                  className="w-4 h-4 text-[#3D6B22] rounded accent-[#3D6B22] cursor-pointer"
                />
              </div>
            </form>
          )}

          {/* TAB 4: DATA & SYNC */}
          {activeTab === "sync" && (
            <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 lg:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Data & Agency Admin Sync
                </h3>
                <button
                  type="button"
                  onClick={handleForceResync}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 text-[#93C573]", isSyncing && "animate-spin")} />
                  <span>Resync All</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-semibold">INQUIRIES</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">Synced</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-semibold">CLIENTS</span>
                  <span className="font-bold text-sky-700 mt-0.5 block">Synced</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-semibold">HOUSEHOLDS</span>
                  <span className="font-bold text-purple-700 mt-0.5 block">Synced</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-semibold">CAREGIVERS</span>
                  <span className="font-bold text-[#3D6B22] mt-0.5 block">Synced</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Restore Factory Demo Records</span>
                <button
                  type="button"
                  onClick={handleResetSampleData}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition-colors cursor-pointer text-xs"
                >
                  Reset Records
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === "profile" && (
            <form
              onSubmit={handleSave}
              className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 lg:p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Coordinator Profile
                </h3>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-[#93C573]" />
                  <span>Save Changes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Role Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-slate-700">Assigned Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  >
                    <option value="North Metro Branch">North Metro Branch (Atlanta)</option>
                    <option value="Mountain Lane Branch">Mountain Lane Branch</option>
                    <option value="Valley View Branch">Valley View Branch</option>
                  </select>
                </div>
              </div>
            </form>
          )}

          {/* TAB 6: SECURITY */}
          {activeTab === "security" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Security credentials updated");
              }}
              className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 lg:p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Security & Password
                </h3>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-[#93C573]" />
                  <span>Update Password</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Current Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#3D6B22]" />}
                  <span>{showPassword ? "Hide Passwords" : "Show Passwords"}</span>
                </button>

                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  2FA Active (SMS)
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
