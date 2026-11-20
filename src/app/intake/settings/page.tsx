"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Lock,
  CheckCircle2,
  Save,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  Laptop,
  UserCheck,
  Settings,
  Filter,
  CalendarCheck,
  ShieldCheck,
  Users,
  Home,
  Heart,
  RefreshCw,
  Building2,
  Stethoscope,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  Database,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import {
  getIntakeInquiriesFromStorage,
  saveIntakeInquiriesToStorage,
  subscribeToIntakeSync,
  INTAKE_STORAGE_KEY,
} from "@/lib/intake/intakeSync";
import { INITIAL_INQUIRIES } from "@/lib/intake/mockIntakeData";
import { INITIAL_CLIENTS, saveClientsToStorage } from "@/lib/clients/mockData";
import { MOCK_HOUSEHOLDS, saveHouseholdsToStorage } from "@/lib/households/mockData";
import { INITIAL_CAREGIVERS, saveCaregiversToStorage } from "@/lib/caregivers/mockData";

type SettingsTab =
  | "triage"
  | "clients"
  | "trijourney"
  | "caregivers"
  | "sync"
  | "profile"
  | "security";

export default function IntakeSettingsPage() {
  const { currentUser } = useAuth();

  // Active Category Tab
  const [activeTab, setActiveTab] = useState<SettingsTab>("triage");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("Just now");

  // ----------------------------------------------------
  // Pillar 1: Intake & Referral Triage State
  // ----------------------------------------------------
  const [autoTriage, setAutoTriage] = useState("Enabled");
  const [defaultAssignee, setDefaultAssignee] = useState("Round Robin");
  const [hospitalDischargeSla, setHospitalDischargeSla] = useState("15"); // minutes
  const [standardLeadSla, setStandardLeadSla] = useState("120"); // minutes
  const [slaWarningNotice, setSlaWarningNotice] = useState("10"); // minutes before breach
  const [autoFlagHighAcuity, setAutoFlagHighAcuity] = useState(true);

  // ----------------------------------------------------
  // Pillar 2: Client Registration & Clinical Assessment State
  // ----------------------------------------------------
  const [defaultAssessmentDuration, setDefaultAssessmentDuration] = useState("60"); // minutes
  const [autoAssignRN, setAutoAssignRN] = useState("Yes");
  const [assessmentSlaDays, setAssessmentSlaDays] = useState("2"); // within 2 days
  const [requirePhysicianOrder, setRequirePhysicianOrder] = useState(true);
  const [maxWeeklyHoursThreshold, setMaxWeeklyHoursThreshold] = useState("40");
  const [defaultPayerProgram, setDefaultPayerProgram] = useState("Medicaid Waiver (CCSP / SOURCE)");

  // ----------------------------------------------------
  // Pillar 3: Three Connected Journeys & Household Automation State
  // ----------------------------------------------------
  const [autoCreateClientOnConvert, setAutoCreateClientOnConvert] = useState(true);
  const [autoCreateHouseholdOnConvert, setAutoCreateHouseholdOnConvert] = useState(true);
  const [autoCreateCaregiverOnConvert, setAutoCreateCaregiverOnConvert] = useState(true);
  const [cmaAuthDelayThresholdDays, setCmaAuthDelayThresholdDays] = useState("3");
  const [screeningDelayThresholdHours, setScreeningDelayThresholdHours] = useState("48");
  const [enforceUnifiedHouseholdCase, setEnforceUnifiedHouseholdCase] = useState(true);

  // ----------------------------------------------------
  // Pillar 4: Caregiver Workforce Intake & Classification State
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

  // Sessions State
  const [sessions, setSessions] = useState([
    { id: "s-1", device: "Chrome / Windows 11 (Intake Station 01)", location: "Atlanta North HQ", lastActive: "Active Now", isCurrent: true },
    { id: "s-2", device: "LiliSare Coordinator Mobile (iPhone 15)", location: "Atlanta Metro Field", lastActive: "1 hour ago", isCurrent: false },
  ]);

  // Load saved settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("lilisare_intake_settings");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.autoTriage) setAutoTriage(parsed.autoTriage);
          if (parsed.defaultAssignee) setDefaultAssignee(parsed.defaultAssignee);
          if (parsed.hospitalDischargeSla) setHospitalDischargeSla(parsed.hospitalDischargeSla);
          if (parsed.standardLeadSla) setStandardLeadSla(parsed.standardLeadSla);
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
        autoTriage,
        defaultAssignee,
        hospitalDischargeSla,
        standardLeadSla,
        slaWarningNotice,
        autoFlagHighAcuity,
        defaultAssessmentDuration,
        autoAssignRN,
        assessmentSlaDays,
        requirePhysicianOrder,
        maxWeeklyHoursThreshold,
        defaultPayerProgram,
        autoCreateClientOnConvert,
        autoCreateHouseholdOnConvert,
        autoCreateCaregiverOnConvert,
        cmaAuthDelayThresholdDays,
        screeningDelayThresholdHours,
        enforceUnifiedHouseholdCase,
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
    setSavedSuccess(true);
    toast.success("Intake settings and operational rules saved successfully!");
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Device session revoked.");
  };

  const handleForceResync = () => {
    setIsSyncing(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("lilisare_intake_sync"));
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Intake stores forcefully synchronized with Agency Admin!");
    }, 400);
  };

  const handleResetSampleData = () => {
    if (typeof window === "undefined") return;
    if (window.confirm("Are you sure you want to reset all intake inquiries, clients, households, and caregivers to initial LiliSare demo data?")) {
      saveIntakeInquiriesToStorage(INITIAL_INQUIRIES);
      saveClientsToStorage(INITIAL_CLIENTS);
      saveHouseholdsToStorage(MOCK_HOUSEHOLDS);
      saveCaregiversToStorage(INITIAL_CAREGIVERS);
      toast.success("All LiliSare demo intake and admin records restored to initial state.");
      handleForceResync();
    }
  };

  return (
    <div className="max-w-9xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* ---------------------------------------------------- */}
      {/* 01. Top Header Banner */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
              Role: Intake Coordinator Portal
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Synchronized with Agency Admin · {lastSyncTime}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Intake Settings & Workflow Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure triage response SLAs, clinical assessment routing, <strong>The Three Connected Journeys</strong>,
            and caregiver classification rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/intake/dashboard"
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <span>Intake Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleForceResync}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-[#3D6B22] text-slate-700 hover:text-[#3D6B22] px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-[#3D6B22]", isSyncing && "animate-spin")} />
            <span>Sync Stores</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 02. Navigation & Configuration Body */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Vertical Tab Navigation (1/4 width) */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-1.5 self-start">
          {[
            {
              id: "triage" as const,
              label: "1. Intake & Referrals (Triage & SLAs)",
              icon: Filter,
              desc: "Urgency queue, hospital SLAs & coordinator routing",
            },
            {
              id: "clients" as const,
              label: "2. Client Registration & Assessments",
              icon: Stethoscope,
              desc: "RN in-home assessments & waiver thresholds",
            },
            {
              id: "trijourney" as const,
              label: "3. Three Connected Journeys",
              icon: Home,
              desc: "Section 8 household sync & bottleneck alerts",
            },
            {
              id: "caregivers" as const,
              label: "4. Caregiver Workforce Intake",
              icon: Heart,
              desc: "W-2 / 1099 defaults, LMS training & screening",
            },
            {
              id: "sync" as const,
              label: "5. Agency Admin Synchronization",
              icon: Database,
              desc: "Shared storage, real-time events & data reset",
            },
            {
              id: "profile" as const,
              label: "6. Coordinator Profile",
              icon: UserCheck,
              desc: "Personal info, contact & branch assignment",
            },
            {
              id: "security" as const,
              label: "7. Security & HIPAA Sessions",
              icon: Lock,
              desc: "Password updates, SMS 2FA & active devices",
            },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer",
                  isActive
                    ? "bg-[#3D6B22] text-white shadow-xs font-bold"
                    : "text-slate-700 hover:bg-[#F2F8EE] hover:text-[#3D6B22] font-medium"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 mt-0.5",
                    isActive ? "text-white" : "text-[#3D6B22]"
                  )}
                />
                <div>
                  <div className="text-xs font-bold leading-tight">{t.label}</div>
                  <div
                    className={cn(
                      "text-[11px] mt-0.5",
                      isActive ? "text-emerald-100" : "text-slate-400 font-normal"
                    )}
                  >
                    {t.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Main Form Container (3/4 width) */}
        <div className="lg:col-span-3">
          {/* TAB 1: INTAKE & REFERRAL TRIAGE RULES */}
          {activeTab === "triage" && (
            <form onSubmit={handleSave} className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3D6B22]"></span>
                    <h3 className="text-base font-bold text-slate-900">
                      Pillar 1: Intake & Referral Triage Rules
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Controls automated referral prioritization, SLA countdown timers, and coordinator assignment.
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Triage Rules
                </button>
              </div>

              <div className="space-y-4">
                {/* Rule 1 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Hospital Discharge Fast-Track SLA
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight inline-block">
                        Maximum permissible wait time before a hospital discharge referral flags an SLA breach.
                      </span>
                    </div>
                    <select
                      value={hospitalDischargeSla}
                      onChange={(e) => setHospitalDischargeSla(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="15">15 Minutes (Hospital Urgent Protocol)</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">60 Minutes</option>
                    </select>
                  </div>
                </div>

                {/* Rule 2 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Standard Inbound Lead SLA Target
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight inline-block">
                        Target response window for website inquiries and physician office referrals.
                      </span>
                    </div>
                    <select
                      value={standardLeadSla}
                      onChange={(e) => setStandardLeadSla(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="60">1 Hour</option>
                      <option value="120">2 Hours (Standard)</option>
                      <option value="240">4 Hours</option>
                      <option value="1440">24 Hours</option>
                    </select>
                  </div>
                </div>

                {/* Rule 3 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Default Intake Coordinator Routing
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight inline-block">
                        Distribution mechanism for newly incoming referrals.
                      </span>
                    </div>
                    <select
                      value={defaultAssignee}
                      onChange={(e) => setDefaultAssignee(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="Round Robin">Round Robin (Distribute Evenly)</option>
                      <option value="Branch Territory">Branch-Based (Map to Client City/Zip)</option>
                      <option value="Assign to Me">Assign to Sarah Jenkins (Lead)</option>
                      <option value="Unassigned">Leave Unassigned in Triage Queue</option>
                    </select>
                  </div>
                </div>

                {/* Toggle 4 */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Auto-Flag High Acuity & Immobility Cases
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Automatically mark referrals mentioning total transfer assistance, dementia, or tube feeding as Immediate.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoFlagHighAcuity}
                    onChange={(e) => setAutoFlagHighAcuity(e.target.checked)}
                    className="w-4 h-4 text-[#3D6B22] rounded accent-[#3D6B22] cursor-pointer"
                  />
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: CLIENT REGISTRATION & CLINICAL ASSESSMENTS */}
          {activeTab === "clients" && (
            <form onSubmit={handleSave} className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                    <h3 className="text-base font-bold text-slate-900">
                      Pillar 2: Client Registration & Clinical Assessment Setup
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure defaults for registered care recipients, in-home RN assessment booking, and waiver programs.
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Client Rules
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Default In-Home RN Assessment Duration
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight inline-block">
                        Standard calendar appointment duration booked for clinical supervisors.
                      </span>
                    </div>
                    <select
                      value={defaultAssessmentDuration}
                      onChange={(e) => setDefaultAssessmentDuration(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes (Standard Comprehensive)</option>
                      <option value="90">90 Minutes (High Acuity / Pediatric Complex)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Auto-Assign Clinical Supervisor RN by Territory
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight inline-block">
                        Automatically match client household zip code with the nearest licensed field RN.
                      </span>
                    </div>
                    <select
                      value={autoAssignRN}
                      onChange={(e) => setAutoAssignRN(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="Yes">Yes (Smart Territory Matching)</option>
                      <option value="No">No (Manual Assignment by Lead RN)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Default Payer Waiver Program
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight inline-block">
                        Pre-selected service reimbursement program for newly registered clients.
                      </span>
                    </div>
                    <select
                      value={defaultPayerProgram}
                      onChange={(e) => setDefaultPayerProgram(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="Medicaid Waiver (CCSP / SOURCE)">Georgia Medicaid Waiver (CCSP / SOURCE)</option>
                      <option value="Pediatric In-Home Care (EPSDT)">Pediatric In-Home Care (Medicaid EPSDT)</option>
                      <option value="Senior Community Care">Senior Community Care (AAA Waiver)</option>
                      <option value="Private Duty / Self-Pay">Private Duty / Commercial Insurance</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Require Signed Physician Orders Prior to Service Start
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Mandate physician orders verification before client care status can be unlocked in Agency Admin.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={requirePhysicianOrder}
                    onChange={(e) => setRequirePhysicianOrder(e.target.checked)}
                    className="w-4 h-4 text-[#3D6B22] rounded accent-[#3D6B22] cursor-pointer"
                  />
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: THREE CONNECTED JOURNEYS & HOUSEHOLDS */}
          {activeTab === "trijourney" && (
            <form onSubmit={handleSave} className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    <h3 className="text-base font-bold text-slate-900">
                      Pillar 3: The Three Connected Journeys & Household Automation
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Strict adherence to Section 8 of LiliSare Architecture: Client Journey ↔ Caregiver Journey ↔ Ops Journey.
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Journey Rules
                </button>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-purple-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>Cross-Journey Unified Case Context</span>
                </div>
                <p className="text-[11px] leading-relaxed text-purple-950">
                  LiliSare prohibits isolated department silos. When a family referral is converted, it automatically
                  synchronizes the Client Profile, Linked Caregiver Profile, and Household Unit simultaneously across all portals.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <span className="font-bold text-xs text-slate-900 block">
                    Automatic Unified Creation on Inquiry Conversion
                  </span>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoCreateClientOnConvert}
                        onChange={(e) => setAutoCreateClientOnConvert(e.target.checked)}
                        className="w-4 h-4 text-[#3D6B22] rounded accent-[#3D6B22]"
                      />
                      <span>Auto-create verified Client Record in Agency Admin (Client Journey)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoCreateHouseholdOnConvert}
                        onChange={(e) => setAutoCreateHouseholdOnConvert(e.target.checked)}
                        className="w-4 h-4 text-[#3D6B22] rounded accent-[#3D6B22]"
                      />
                      <span>Auto-create Linked Family Household with shared code e.g. HH-1001 (Unified Context)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoCreateCaregiverOnConvert}
                        onChange={(e) => setAutoCreateCaregiverOnConvert(e.target.checked)}
                        className="w-4 h-4 text-[#3D6B22] rounded accent-[#3D6B22]"
                      />
                      <span>Auto-create Caregiver Onboarding Record with screening checklist (Caregiver Journey)</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Case Manager (CMA) Authorisation Delay Threshold
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight inline-block">
                        Flag a household with a coordination delay alert if CMA approval takes longer than this.
                      </span>
                    </div>
                    <select
                      value={cmaAuthDelayThresholdDays}
                      onChange={(e) => setCmaAuthDelayThresholdDays(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="2">2 Business Days</option>
                      <option value="3">3 Business Days (Standard)</option>
                      <option value="5">5 Business Days</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Caregiver Screening Delay Alert Window
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight inline-block">
                        Highlight household bottleneck if background check remains pending past this window.
                      </span>
                    </div>
                    <select
                      value={screeningDelayThresholdHours}
                      onChange={(e) => setScreeningDelayThresholdHours(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="24">24 Hours</option>
                      <option value="48">48 Hours (Standard)</option>
                      <option value="72">72 Hours</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: CAREGIVER WORKFORCE INTAKE & CLASSIFICATION */}
          {activeTab === "caregivers" && (
            <form onSubmit={handleSave} className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <h3 className="text-base font-bold text-slate-900">
                      Pillar 4: Caregiver Workforce Intake & Classification
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure family caregiver employment classification (W-2 vs 1099), training requirements, and screening.
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Caregiver Rules
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Default Family Caregiver Employment Classification
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight inline-block">
                        Recommended employment classification for in-home family caregivers (e.g. Mother, Daughter).
                      </span>
                    </div>
                    <select
                      value={defaultCaregiverClassification}
                      onChange={(e) => setDefaultCaregiverClassification(e.target.value as "W-2" | "1099")}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="W-2">W-2 Employed Family Caregiver (Recommended)</option>
                      <option value="1099">1099 Independent Contractor</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Mandatory LMS Training Modules Requirement
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight inline-block">
                        Total training course hours required before a caregiver can be activated for care delivery.
                      </span>
                    </div>
                    <select
                      value={requiredLmsTrainingHours}
                      onChange={(e) => setRequiredLmsTrainingHours(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="8">8 Hours (Express Orientation)</option>
                      <option value="16">16 Hours (State Standard: Infection, EVV, ADL)</option>
                      <option value="24">24 Hours (Comprehensive)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Background Screening Integration Provider
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight inline-block">
                        Direct webhook integration for criminal background check, sex offender registry, and OIG exclusions.
                      </span>
                    </div>
                    <select
                      value={screeningVendor}
                      onChange={(e) => setScreeningVendor(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="Sterling Healthcare Triage">Sterling Healthcare Triage (Active API)</option>
                      <option value="Checkr Healthcare FastTrack">Checkr Healthcare FastTrack</option>
                      <option value="State Direct LiveScan">State Direct LiveScan / GBI</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Automated ADP Direct Deposit Enrollment Link
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Send automated secure payroll setup link via SMS immediately upon caregiver registration.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoTriggerAdpSetup}
                    onChange={(e) => setAutoTriggerAdpSetup(e.target.checked)}
                    className="w-4 h-4 text-[#3D6B22] rounded accent-[#3D6B22] cursor-pointer"
                  />
                </div>
              </div>
            </form>
          )}

          {/* TAB 5: AGENCY ADMIN SYNCHRONIZATION & DATA TOOLS */}
          {activeTab === "sync" && (
            <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#3D6B22]" />
                    <h3 className="text-base font-bold text-slate-900">
                      Two-Way Agency Admin Synchronization Engine
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live operational synchronization across intake queues and administrative dashboards.
                  </p>
                </div>
                <button
                  onClick={handleForceResync}
                  className="px-4 py-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
                  <span>Force Full Resync</span>
                </button>
              </div>

              {/* Status Banner */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-sm">Real-Time Synchronization: Active</span>
                    <span className="text-[11px] text-emerald-800">
                      Any referral created or converted in this portal broadcasts immediate updates to Agency Admin (`/dashboard`, `/referrals`, `/clients`, `/households`, and `/caregivers`).
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-white px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs self-start sm:self-center">
                  Last Sync: {lastSyncTime}
                </span>
              </div>

              {/* Sync Stores Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-0.5">Intake Inquiries Store</span>
                  <code className="text-[10px] text-slate-500 font-mono">lilisare_intake_inquiries</code>
                  <span className="mt-2 block text-[11px] text-[#3D6B22] font-semibold">Active & Persistent</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-0.5">Clients Directory Store</span>
                  <code className="text-[10px] text-slate-500 font-mono">lilisare_clients_records</code>
                  <span className="mt-2 block text-sky-700 font-semibold">Synced with /clients</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-0.5">Households Units Store</span>
                  <code className="text-[10px] text-slate-500 font-mono">lilisare_households_data</code>
                  <span className="mt-2 block text-purple-700 font-semibold">Synced with /households</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-0.5">Caregiver Workforce Store</span>
                  <code className="text-[10px] text-slate-500 font-mono">lilisare_caregivers_v1</code>
                  <span className="mt-2 block text-rose-700 font-semibold">Synced with /caregivers</span>
                </div>
              </div>

              {/* Reset Data Danger Zone */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Reset & Seed Clean LiliSare Intake Data</span>
                  <span className="text-slate-500 text-[11px]">
                    Restores all initial demo inquiries, clients, households, and caregivers to factory seed state.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetSampleData}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition-colors cursor-pointer self-start sm:self-center"
                >
                  Reset Demo Records
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: COORDINATOR PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleSave} className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#3D6B22]" />
                    <h3 className="text-base font-bold text-slate-900">
                      Coordinator Profile Information
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official intake specialist employee credentials registered with LiliSare Operations.
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>

              {/* Avatar Section */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
                <div className="w-14 h-14 rounded-2xl bg-[#3D6B22] text-white font-black text-lg flex items-center justify-center shadow-md shadow-[#3D6B22]/20">
                  SJ
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Employee ID: INT-2088 • Role: {title}
                  </p>
                  <span className="mt-1 inline-block text-[10px] font-extrabold text-[#3D6B22] bg-[#E3F1D9] border border-[#3D6B22]/20 px-2 py-0.5 rounded-md">
                    Assigned: {branch} (Full-Time)
                  </span>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Title / Designation</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Direct Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Work Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-slate-800">Assigned Agency Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]"
                  >
                    <option value="North Metro Branch">North Metro Branch (Atlanta)</option>
                    <option value="Mountain Lane Branch">Mountain Lane Branch</option>
                    <option value="Valley View Branch">Valley View Branch</option>
                  </select>
                </div>
              </div>
            </form>
          )}

          {/* TAB 7: SECURITY & HIPAA COMPLIANCE */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <form onSubmit={handleSave} className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#3D6B22]" />
                      <h3 className="text-base font-bold text-slate-900">Update Password</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enforces HIPAA-compliant credential security (minimum 8 characters with numbers & symbols).
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Key className="w-4 h-4" /> Update Password
                  </button>
                </div>

                <div className="space-y-3.5 max-w-md text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">Current Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">Confirm New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-medium cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showPassword ? "Hide Passwords" : "Show Passwords"}
                  </button>
                </div>
              </form>

              {/* 2FA & Active Sessions */}
              <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">
                    Two-Factor Authentication (2FA) & Active Device Sessions
                  </h3>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#3D6B22] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-emerald-950 block">
                        2-Factor Authentication via SMS is Active
                      </span>
                      <span className="text-[11px] text-emerald-800">
                        Verification code sent to {phone} when logging in from new devices.
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-900 text-xs font-bold rounded-lg shadow-2xs self-start sm:self-center">
                    Enforced by HIPAA PoLP
                  </span>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Active Intake Device Sessions ({sessions.length})
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                    {sessions.map((s) => (
                      <div key={s.id} className="p-3.5 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {s.device.includes("Mobile") || s.device.includes("iPhone") ? (
                            <Smartphone className="w-4 h-4 text-[#3D6B22] shrink-0" />
                          ) : (
                            <Laptop className="w-4 h-4 text-sky-600 shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-slate-900 block">{s.device}</span>
                            <span className="text-[11px] text-slate-500">
                              {s.location} • {s.lastActive}
                            </span>
                          </div>
                        </div>

                        {s.isCurrent ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E3F1D9] text-[#3D6B22] border border-[#3D6B22]/20">
                            Current Device
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(s.id)}
                            className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                          >
                            Revoke Session
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
