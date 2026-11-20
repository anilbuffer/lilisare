"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  UserCircle,
  HeartHandshake,
  CalendarDays,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Activity,
  LockKeyhole,
  Zap,
  RotateCcw,
  Shield,
  ScanEye,
  Cpu,
  Globe,
  Sparkles,
  ArrowRight,
  UserPlus,
  PhoneCall,
  Stethoscope,
  ClipboardCheck,
  GraduationCap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/rbac";

type LoginRole = Role;

interface RoleConfig {
  role: Role;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  email: string;
  badge: string;
  badgeColor: string;
  metrics: { label: string; value: string }[];
  highlights: string[];
  spotlightTitle: string;
  spotlightHighlight: string;
  features: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }[];
}

const ROLE_DATA: Record<LoginRole, RoleConfig> = {
  ADMIN: {
    role: "ADMIN",
    title: "Agency Executive & Admin",
    subtitle: "Full Governance & Operations",
    description: "Complete agency oversight, financial reporting, compliance auditing, and multi-branch management.",
    icon: ShieldCheck,
    email: "admin@lilisare.com",
    badge: "Full Governance",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    metrics: [
      { label: "Active Staff", value: "248 Staff" },
      { label: "HIPAA Audit", value: "99.9%" },
      { label: "Revenue", value: "$1.42M" },
    ],
    highlights: ["Executive BI Dashboards", "Payroll Engine", "Compliance Audit Trails"],
    spotlightTitle: "Autonomous Home Healthcare",
    spotlightHighlight: "Governance Platform",
    features: [
      {
        icon: ScanEye,
        title: "Automated Security & Compliance Auditing",
        desc: "Continuous EVV telemetry scanning and red-teaming compliance simulations."
      },
      {
        icon: Cpu,
        title: "AI-powered Analysis & Telemetry",
        desc: "Real-time threat detection and revenue forecasting using proprietary neural networks."
      },
      {
        icon: Globe,
        title: "Enterprise-grade Reliability",
        desc: "99.99% uptime with global compliance and sovereign data nodes."
      }
    ]
  },
  INTAKE_COORDINATOR: {
    role: "INTAKE_COORDINATOR",
    title: "Intake Coordinator",
    subtitle: "Referrals & New Inquiries",
    description: "Manage incoming inquiries, schedule initial assessments, and guide families through the onboarding process.",
    icon: PhoneCall,
    email: "intake@lilisare.com",
    badge: "Intake Desk",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    metrics: [
      { label: "New Inquiries", value: "12 Today" },
      { label: "Avg Wait", value: "14 mins" },
      { label: "Conv. Rate", value: "76%" },
    ],
    highlights: ["Urgency Queue", "Pipeline Kanban", "Quick Assessment Booking"],
    spotlightTitle: "First Contact & Family",
    spotlightHighlight: "Onboarding Experience",
    features: [
      {
        icon: Activity,
        title: "Real-time Urgency Queue",
        desc: "Prioritize hospital discharges and critical leads instantly."
      },
      {
        icon: Globe,
        title: "Integrated Intake Pipeline",
        desc: "Seamless handoff from inquiry to signed care plan."
      },
      {
        icon: ShieldCheck,
        title: "Quick Assessment Booking",
        desc: "Book available RN assessors while on the phone with families."
      }
    ]
  },
  HR: {
    role: "HR",
    title: "HR Manager & Recruiter",
    subtitle: "Staffing & Compliance Portal",
    description: "Recruiting pipelines, candidate onboarding, caregiver roster management, credential watchlist, and training LMS.",
    icon: UserPlus,
    email: "sarah.jenkins@lilisare.com",
    badge: "HR & Recruiting Desk",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    metrics: [
      { label: "Pipeline", value: "14 Candidates" },
      { label: "Credential Alerts", value: "3 Expiring" },
      { label: "Retention Rate", value: "94.2%" },
    ],
    highlights: ["Recruiting Pipeline Board", "Credential Watchlist", "Roster & Onboarding"],
    spotlightTitle: "Caregiver Talent & Enterprise",
    spotlightHighlight: "HR Management Hub",
    features: [
      {
        icon: ScanEye,
        title: "Automated Candidate Verification",
        desc: "Instant background check tracking, OIG clearances, and license verification."
      },
      {
        icon: Cpu,
        title: "Credential Watchlist Alerts",
        desc: "Proactive automated notifications for expiring CPR, TB, and driver licenses."
      },
      {
        icon: Globe,
        title: "Integrated LMS & Training Desk",
        desc: "Assign required compliance modules and track staff certification completion."
      }
    ]
  },
  SCHEDULER: {
    role: "SCHEDULER",
    title: "Scheduler & Dispatcher",
    subtitle: "AI Shift Matching & Call-Off Queue",
    description: "Real-time dispatch, call-off coverage resolution, OT prevention, and automated caregiver matching.",
    icon: CalendarDays,
    email: "alex.rivera@lilisare.com",
    badge: "Live Dispatcher Hub",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    metrics: [
      { label: "Fill Rate", value: "98.6%" },
      { label: "Open Call-offs", value: "2 Pending" },
      { label: "Avg Dispatch", value: "< 4 mins" },
    ],
    highlights: ["Interactive Drag & Drop Calendar", "Automated Coverage", "Smart Caregiver Match"],
    spotlightTitle: "Intelligent Shift Dispatch &",
    spotlightHighlight: "AI Route Optimizer",
    features: [
      {
        icon: Zap,
        title: "Instant Shift Coverage Engine",
        desc: "Predictive call-off fill suggestions with distance-aware matching."
      },
      {
        icon: Cpu,
        title: "Overtime Prevention Guard",
        desc: "Real-time scheduling telemetry to eliminate unauthorized OT costs."
      },
      {
        icon: Globe,
        title: "Multi-Branch Synchronization",
        desc: "Seamless live syncing across all regional dispatcher hubs."
      }
    ]
  },
  CAREGIVER: {
    role: "CAREGIVER",
    title: "Caregiver & Field Staff",
    subtitle: "Mobile Visit EVV & Care Charting",
    description: "GPS location verification, digital task charting, care plan sign-off, and open shift discovery.",
    icon: HeartHandshake,
    email: "maria.santos@lilisare.com",
    badge: "GPS EVV Enabled",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    metrics: [
      { label: "EVV Score", value: "100%" },
      { label: "Assigned Visits", value: "6 Today" },
      { label: "Rating Score", value: "4.95 ★" },
    ],
    highlights: ["One-Tap Visit Clock-In", "Care Plan Access", "Instant Shift Claiming"],
    spotlightTitle: "Mobile Point-of-Care &",
    spotlightHighlight: "Verified EVV Portal",
    features: [
      {
        icon: Shield,
        title: "Offline-First Mobile Verification",
        desc: "Clock-in seamlessly even in low connectivity home health environments."
      },
      {
        icon: ScanEye,
        title: "Instant Care Charting",
        desc: "Voice and touch digital vitals logging with immediate supervisor sync."
      },
      {
        icon: Globe,
        title: "Open Shift Instant Marketplace",
        desc: "Claim premium overtime and open shifts directly from your mobile desk."
      }
    ]
  },
  CLIENT: {
    role: "CLIENT",
    title: "Patient Portal",
    subtitle: "Self-Service Care Portal",
    description: "View your schedule, manage your care plan, and communicate directly with your care team.",
    icon: UserCircle,
    email: "patient@lilisare.com",
    badge: "Patient Desk",
    badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
    metrics: [
      { label: "Next Visit", value: "Today, 2pm" },
      { label: "Care Team", value: "3 Members" },
      { label: "Messages", value: "1 Unread" },
    ],
    highlights: ["My Schedule", "My Care Plan", "Direct Messaging"],
    spotlightTitle: "Personalized Care &",
    spotlightHighlight: "Patient Self-Service",
    features: [
      {
        icon: CalendarDays,
        title: "My Schedule & Visits",
        desc: "View upcoming visits and request changes to your schedule directly."
      },
      {
        icon: HeartHandshake,
        title: "My Active Care Plan",
        desc: "Review your goals and tasks that your caregivers help you with."
      },
      {
        icon: Globe,
        title: "Direct Care Team Access",
        desc: "Securely message your caregivers and coordinators anytime."
      }
    ]
  },
  FAMILY: {
    role: "FAMILY",
    title: "Family Portal",
    subtitle: "Transparent Care Monitoring",
    description: "Live caregiver arrival tracking, visit notes, shift schedules, and direct family communications.",
    icon: UserCircle,
    email: "family@lilisare.com",
    badge: "Family Desk",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    metrics: [
      { label: "Caregiver Status", value: "En Route" },
      { label: "Completed Visits", value: "34 / Mo" },
      { label: "Satisfaction", value: "100%" },
    ],
    highlights: ["Live GPS Tracker", "Care Plan Verification", "Family Messaging Hub"],
    spotlightTitle: "Real-Time Family Transparency &",
    spotlightHighlight: "Patient Wellness Desk",
    features: [
      {
        icon: ShieldCheck,
        title: "Live Caregiver Arrival Tracking",
        desc: "Real-time map telemetry showing caregiver ETA and visit start times."
      },
      {
        icon: Activity,
        title: "Daily Care Summary Feed",
        desc: "Verified shift notes, meal tracking, and medication check-offs."
      },
      {
        icon: Globe,
        title: "Direct Agency Concierge Line",
        desc: "Encrypted messaging with care coordinators and nursing leads."
      }
    ]
  },
  BILLING_FINANCE_STAFF: {
    role: "BILLING_FINANCE_STAFF",
    title: "Billing & Finance Staff",
    subtitle: "Financial Operations & Claims",
    description: "Manage pre-billing scrubs, claim submissions, accounts receivable, and financial reporting.",
    icon: Activity,
    email: "billing@lilisare.com",
    badge: "Billing Desk",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    metrics: [
      { label: "Pending Claims", value: "45" },
      { label: "Scrub Error Rate", value: "2.1%" },
      { label: "AR Days", value: "34 Days" },
    ],
    highlights: ["Automated Scrubbing", "Denial Management", "Clean Claim Rate"],
    spotlightTitle: "Financial Hub &",
    spotlightHighlight: "Revenue Cycle",
    features: [
      {
        icon: Activity,
        title: "Pre-Billing Scrubbing",
        desc: "Automated validation rules catch errors before submission."
      },
      {
        icon: ShieldCheck,
        title: "Denial Work Queue",
        desc: "Integrated workflow for appealing and correcting denied claims."
      },
      {
        icon: Globe,
        title: "AR Aging Analysis",
        desc: "Real-time visibility into outstanding accounts receivable."
      }
    ]
  },
  CLINICAL_SUPERVISOR_RN: {
    role: "CLINICAL_SUPERVISOR_RN",
    title: "Clinical Supervisor / RN",
    subtitle: "Clinical Oversight & Compliance",
    description: "Full chart access, care plan authorship, medication oversight, and clinical incident review.",
    icon: Stethoscope,
    email: "rachel.miller@lilisare.com",
    badge: "Clinical Hub",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    metrics: [
      { label: "Plans Due", value: "8" },
      { label: "Incidents", value: "2 Open" },
      { label: "Visits", value: "4 This Week" },
    ],
    highlights: ["Clinical Escalation Queue", "Care Plan Review", "Incident Sign-off"],
    spotlightTitle: "Clinical Command Center &",
    spotlightHighlight: "Patient Health Oversight",
    features: [
      {
        icon: Activity,
        title: "Clinical Escalation Queue",
        desc: "Real-time condition change reports and urgent clinical questions from the field."
      },
      {
        icon: ShieldCheck,
        title: "Care Plan Review Queue",
        desc: "Automated tracking for periodic reviews, post-hospitalization, and incident-triggered updates."
      },
      {
        icon: Globe,
        title: "Restricted Incident Review",
        desc: "High-priority clinical review for falls, medication errors, and restricted incidents."
      }
    ]
  },
  FIELD_SUPERVISOR: {
    role: "FIELD_SUPERVISOR",
    title: "Field Supervisor",
    subtitle: "On-Site Assessments & Support",
    description: "Conduct supervisory visits, evaluate caregivers in the field, handle on-site incidents, and ensure care quality.",
    icon: ClipboardCheck,
    email: "supervisor@lilisare.com",
    badge: "Field Ops",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    metrics: [
      { label: "Visits Today", value: "4" },
      { label: "Caregivers", value: "12" },
      { label: "Incidents", value: "0" },
    ],
    highlights: ["Supervisory Visits", "On-site Evaluations", "Incident Reporting"],
    spotlightTitle: "Field Operations &",
    spotlightHighlight: "Quality Assurance",
    features: [
      {
        icon: ScanEye,
        title: "On-Site Caregiver Evaluations",
        desc: "Document and review caregiver performance during actual client visits."
      },
      {
        icon: Activity,
        title: "Supervisory Visit Logs",
        desc: "Complete required supervisory visits and update care plans from the field."
      },
      {
        icon: ShieldCheck,
        title: "Field Incident Management",
        desc: "Respond to and document critical incidents happening at client homes."
      }
    ]
  },
  QA_COMPLIANCE_OFFICER: {
    role: "QA_COMPLIANCE_OFFICER",
    title: "QA & Compliance",
    subtitle: "Audits & Regulatory Oversight",
    description: "Agency-wide audits, restricted incident visibility, state reporting, and compliance verification.",
    icon: ShieldCheck,
    email: "david.chen@lilisare.com",
    badge: "Compliance Hub",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    metrics: [
      { label: "Survey Score", value: "99%" },
      { label: "Restricted", value: "0 Open" },
      { label: "Deadlines", value: "2 Due" },
    ],
    highlights: ["State Reporting Tracker", "Unscoped Incident Queue", "Mock Surveys"],
    spotlightTitle: "Quality Assurance &",
    spotlightHighlight: "Regulatory Compliance",
    features: [
      {
        icon: Activity,
        title: "State Reporting Deadline Tracker",
        desc: "Proactive countdowns for serious incidents to prevent state citations."
      },
      {
        icon: ShieldCheck,
        title: "Agency-Wide Incident Visibility",
        desc: "Full unscoped access to restricted incidents for thorough investigation."
      },
      {
        icon: Globe,
        title: "Compliance Verification Queue",
        desc: "Monitor all 9 tracked compliance categories to maintain survey readiness."
      }
    ]
  },
  PARTNER: {
    role: "PARTNER",
    title: "Partner Portal",
    subtitle: "Referral & Patient Management",
    description: "Manage referrals, track patient admissions, and communicate securely with our intake team.",
    icon: HeartHandshake,
    email: "partner@organization.com",
    badge: "Partner Portal",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    metrics: [
      { label: "Referrals", value: "14" },
      { label: "Active", value: "8" },
      { label: "Messages", value: "2 New" },
    ],
    highlights: ["Submit Referrals", "Track Admissions", "Direct Messaging"],
    spotlightTitle: "Collaborative Care &",
    spotlightHighlight: "Partner Management",
    features: [
      {
        icon: Zap,
        title: "Fast Referral Submission",
        desc: "Streamlined process for submitting new patient referrals securely."
      },
      {
        icon: Activity,
        title: "Real-time Status Tracking",
        desc: "Monitor the admission progress of your referred patients instantly."
      },
      {
        icon: Globe,
        title: "Secure Communication Hub",
        desc: "Direct and encrypted messaging with our intake and care teams."
      }
    ]
  },
  TRAINER: {
    role: "TRAINER",
    title: "Training Administrator",
    subtitle: "LMS & Content Management",
    description: "Manage the learning management system, build courses, track quiz performance, and map compliance requirements.",
    icon: GraduationCap,
    email: "trainer@lilisare.com",
    badge: "LMS Admin",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    metrics: [
      { label: "Courses", value: "42" },
      { label: "Enrollments", value: "1,248" },
      { label: "Reviews", value: "3 Pending" },
    ],
    highlights: ["Course Builder", "Quiz Analytics", "Compliance Mapping"],
    spotlightTitle: "Training & Development",
    spotlightHighlight: "LMS Portal",
    features: [
      {
        icon: Globe,
        title: "Advanced Course Builder",
        desc: "Easily author interactive content with video, PDF, and quizzes."
      },
      {
        icon: Activity,
        title: "Quiz Analytics",
        desc: "Track learner performance and identify ambiguous content."
      },
      {
        icon: ShieldCheck,
        title: "Compliance Linked",
        desc: "Map courses directly to state and federal compliance requirements."
      }
    ]
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<LoginRole>("ADMIN");
  const [email, setEmail] = useState<string>(ROLE_DATA.ADMIN.email);
  const [password, setPassword] = useState<string>("••••••••••••");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [resetSent, setResetSent] = useState<boolean>(false);

  // Auto update form credentials when a role is selected
  const handleRoleSelect = (role: LoginRole) => {
    setSelectedRole(role);
    setEmail(ROLE_DATA[role].email);
    setPassword("••••••••••••");
  };

  const handleResetCredentials = () => {
    const current = ROLE_DATA[selectedRole];
    setEmail(current.email);
    setPassword("••••••••••••");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login(selectedRole);
      setIsLoading(false);

      if (selectedRole === "ADMIN") {
        router.push("/dashboard");
      } else if (selectedRole === "SCHEDULER") {
        router.push("/scheduler");
      } else if (selectedRole === "HR") {
        router.push("/hr/dashboard");
      } else if (selectedRole === "CLIENT" || selectedRole === "FAMILY") {
        router.push("/portal");
      } else if (selectedRole === "CAREGIVER") {
        router.push("/caregiver");
      } else if (selectedRole === "INTAKE_COORDINATOR") {
        router.push("/intake/dashboard");
      } else if (selectedRole === "BILLING_FINANCE_STAFF") {
        router.push("/billing");
      } else if (selectedRole === "CLINICAL_SUPERVISOR_RN") {
        router.push("/clinical");
      } else if (selectedRole === "QA_COMPLIANCE_OFFICER") {
        router.push("/compliance");
      } else if (selectedRole === "FIELD_SUPERVISOR") {
        router.push("/field-supervisor");
      } else if (selectedRole === "PARTNER") {
        router.push("/partner");
      } else if (selectedRole === "TRAINER") {
        router.push("/training-admin");
      } else {
        router.push("/dashboard");
      }
    }, 750);
  };

  const currentRoleInfo = ROLE_DATA[selectedRole];
  const CurrentRoleIcon = currentRoleInfo.icon;

  // Reusable Role Selector Pill Grid Component
  const RoleSelectorGrid = () => (
    <div className="flex flex-col space-y-1.5 xl:space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] xl:text-xs font-semibold uppercase tracking-wider text-emerald-200/90 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#93C573]" />
          Select Workspace Role:
        </span>
        <span className="text-[10px] xl:text-[11px] text-emerald-300/70 hidden sm:inline-block">
          Auto-fills demo credentials
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-7 2xl:grid-cols-7 gap-1.5 xl:gap-2">
        {(Object.keys(ROLE_DATA) as LoginRole[]).map((roleKey) => {
          const rItem = ROLE_DATA[roleKey];
          const isSel = selectedRole === roleKey;
          const RIcon = rItem.icon;

          return (
            <button
              key={roleKey}
              type="button"
              onClick={() => handleRoleSelect(roleKey)}
              className={`p-1.5 xl:px-2.5 xl:py-2 rounded-lg xl:rounded-xl border text-left transition-all duration-150 flex items-center space-x-1.5 xl:space-x-2 cursor-pointer ${isSel
                ? "bg-[#274C1D] border-[#93C573] text-white shadow-md ring-1 ring-[#93C573]/40"
                : "bg-[#14280E]/70 hover:bg-[#274C1D]/60 border-[#274C1D] text-emerald-100/70 hover:text-white"
                }`}
            >
              <div
                className={`p-1 xl:p-1.5 rounded-md xl:rounded-lg shrink-0 ${isSel ? "bg-[#93C573] text-[#1B3414]" : "bg-[#14280E] text-[#93C573]"
                  }`}
              >
                <RIcon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              </div>
              <div className="overflow-hidden min-w-0">
                <div className="font-bold text-[11px] xl:text-xs truncate leading-tight">
                  {rItem.title.split(" ")[0]}
                </div>
                <div className="text-[9px] xl:text-[10px] text-emerald-200/60 truncate leading-none mt-0.5">
                  {rItem.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#EEF2F0] font-sans flex items-center justify-center p-2 sm:p-3 lg:p-4 xl:p-6 relative overflow-x-hidden overflow-y-auto lg:overflow-hidden select-none">
      {/* Ambient Enterprise Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[750px] h-[750px] rounded-full bg-[#93C573]/20 blur-[150px]" />
        <div className="absolute top-1/2 -right-40 w-[750px] h-[750px] rounded-full bg-[#1B3414]/15 blur-[160px]" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] rounded-full bg-[#FF6E61]/12 blur-[130px]" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#1B3414 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Main Responsive Container Card */}
      <div className="relative z-10 w-full max-w-[1560px] h-full lg:max-h-[calc(100vh-2rem)] xl:max-h-[calc(100vh-3rem)] rounded-2xl sm:rounded-3xl lg:rounded-[26px] xl:rounded-[32px] shadow-[0_2px_6px_-1px_rgba(17,28,22,0.06),0_1px_2px_-1px_rgba(17,28,22,0.04)] overflow-hidden flex flex-col justify-between">

        {/* Main Header (Visible on Mobile & Tablet above split, hidden on Desktop left panel) */}
        <div className="lg:hidden w-full bg-gradient-to-r from-[#1B3414] via-[#24461B] to-[#14280E] rounded-xl sm:rounded-2xl p-3 sm:p-3 text-white mb-2 sm:mb-3 border border-[#93C573]/30 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 p-1.5 flex items-center justify-center border border-[#93C573]/30 shadow-md shadow-brand-teal/20 shrink-0">
              <img src="/logo-mark.svg" alt="LiliSare" className="w-8 h-8 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl tracking-wide text-white block leading-snug">
                LiliSare
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-200/80 font-medium">
                Live-In Caregivers, Family Caregivers, and Family Friends
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-[#14280E]/80 text-[#93C573] px-2.5 py-1 rounded-full border border-[#93C573]/40 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#93C573] animate-pulse" />
              <span className="hidden sm:inline">Operational</span>
            </div>
          </div>
        </div>

        {/* MOBILE & TABLET ROLE SELECTOR CONTAINER (Appears directly ABOVE the login form on mobile/tablet) */}
        <div className="lg:hidden w-full bg-[#1B3414] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white mb-3 border border-[#93C573]/30 shadow-xs">
          <RoleSelectorGrid />
        </div>

        {/* 2-COLUMN SPLIT LAYOUT (Desktop: 70/30 Split | Tablet/Mobile: Stacked) */}
        <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-4 xl:gap-6 items-stretch min-h-0">

          {/* ========================================================================= */}
          {/* LEFT PANEL: Enterprise Spotlight & Details */}
          {/* ========================================================================= */}
          <div className="order-2 lg:order-1 w-full lg:w-[67%] xl:w-[70%] bg-gradient-to-br from-[#1B3414] via-[#24461B] to-[#14280E] rounded-xl sm:rounded-2xl lg:rounded-[24px] xl:rounded-[30px] p-3.5 sm:p-5 lg:p-5 xl:p-8 flex flex-col justify-between text-white relative overflow-hidden shadow-[0_2px_6px_-1px_rgba(17,28,22,0.06),0_1px_2px_-1px_rgba(17,28,22,0.04)] border border-[#93C573]/30 min-h-0">
            {/* Background Ambient Spotlight Glow */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#93C573]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#FF6E61]/12 rounded-full blur-2xl pointer-events-none" />

            <div className="h-full flex flex-col justify-between gap-2 xl:gap-3 min-h-0">
              {/* Desktop Header Bar (Hidden on mobile/tablet as they have top header) */}
              <div className="hidden lg:flex justify-between items-center w-full gap-3 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl xl:rounded-2xl bg-white/10 p-1.5 flex items-center justify-center border border-[#93C573]/30 shadow-md shadow-brand-teal/20 shrink-0">
                    <img src="/logo-mark.svg" alt="LiliSare" className="w-7 h-7 xl:w-8 xl:h-8 object-contain" />
                  </div>
                  <div>
                    <span className="font-bold text-xl xl:text-2xl tracking-wide text-white block leading-tight">
                      LiliSare
                    </span>
                    <span className="text-[10px] xl:text-[11px] text-emerald-200/80 font-medium">
                      Live-In Caregivers, Family Caregivers, and Family Friends
                    </span>
                  </div>
                </div>

                {/* System Status Pill */}
                <div className="flex items-center space-x-1.5 bg-[#14280E]/80 text-[#93C573] px-2.5 py-1 rounded-full border border-[#93C573]/40 text-[11px] font-semibold shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#93C573] animate-pulse" />
                  <span>Operational</span>
                </div>
              </div>

              {/* Desktop Role Selector Grid (Hidden on mobile/tablet) */}
              <div className="hidden lg:block shrink-0">
                <RoleSelectorGrid />
              </div>

              {/* Main Role Headline & Description */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedRole}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="my-auto py-1 xl:py-3"
                >
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 xl:px-3 xl:py-1 rounded-full text-[11px] xl:text-xs font-semibold bg-[#93C573]/15 text-[#93C573] border border-[#93C573]/30 mb-1.5 xl:mb-2.5">
                    <CurrentRoleIcon className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
                    <span>{currentRoleInfo.title}</span>
                  </div>

                  <h1 className="text-lg sm:text-2xl lg:text-2xl xl:text-4xl 2xl:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-1.5 xl:mb-2.5">
                    {currentRoleInfo.spotlightTitle}{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#93C573] via-[#C7E4B3] to-[#FF6E61]">
                      {currentRoleInfo.spotlightHighlight}
                    </span>
                  </h1>
                  <p className="text-xs xl:text-sm text-emerald-100/75 max-w-2xl leading-relaxed line-clamp-2 xl:line-clamp-3">
                    {currentRoleInfo.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Capability Features Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedRole + "_feats"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 xl:gap-3 shrink-0"
                >
                  {currentRoleInfo.features.map((feat, idx) => {
                    const FeatIcon = feat.icon;
                    return (
                      <div
                        key={idx}
                        className="bg-[#14280E]/70 border border-[#274C1D] p-2 xl:p-2.5 rounded-lg xl:rounded-xl flex items-start gap-2 xl:gap-2.5"
                      >
                        <div className="w-6 h-6 xl:w-7 xl:h-7 rounded-md xl:rounded-lg bg-[#274C1D] text-[#93C573] flex items-center justify-center shrink-0 border border-[#93C573]/30 mt-0.5">
                          <FeatIcon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[11px] xl:text-xs text-white mb-0.5 leading-snug truncate">
                            {feat.title}
                          </div>
                          <div className="text-[10px] xl:text-[11px] text-emerald-100/70 leading-relaxed line-clamp-2">
                            {feat.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Left Panel Footer */}
            <div className="pt-2 xl:pt-3 mt-2 xl:mt-3 border-t border-[#274C1D] flex flex-wrap flex-col lg:flex-row items-center justify-between w-full text-[11px] xl:text-xs text-emerald-200/60 gap-1.5 shrink-0">
              <div className="flex items-center gap-3">
                <span>&copy; 2026 LiliSare. All rights reserved.</span>
              </div>
              <div className="flex items-center space-x-3 text-[10px] xl:text-[11px] text-emerald-200/60">
                <span className="flex items-center space-x-1">
                  <LockKeyhole className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-[#93C573]" />
                  <span>256-Bit SSL</span>
                </span>
                <span>•</span>
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT PANEL: Authentication Form */}
          {/* ========================================================================= */}
          <div className="order-1 lg:order-2 w-full lg:w-[33%] xl:w-[30%] bg-white rounded-xl sm:rounded-2xl lg:rounded-[24px] xl:rounded-[28px] p-4 sm:p-5 lg:p-5 xl:p-8 flex flex-col justify-between border border-[#D5DFDA] shadow-[0_2px_6px_-1px_rgba(17,28,22,0.06),0_1px_2px_-1px_rgba(17,28,22,0.04)] min-h-0">
            <div className="flex flex-col h-full justify-between">
              {/* Form Header */}
              <div className="mb-2 xl:mb-3 shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] xl:text-xs font-semibold bg-[#E3F1D9] text-[#1E5622] border border-[#1E5622]/20">
                    <CurrentRoleIcon className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[170px] sm:max-w-none">{currentRoleInfo.title}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleResetCredentials}
                    className="text-xs font-medium text-[#3D6B22] hover:text-[#2C5217] flex items-center space-x-1 bg-[#E3F1D9]/60 hover:bg-[#E3F1D9] px-2.5 py-1 rounded-full transition-colors border border-[#3D6B22]/20 cursor-pointer shrink-0"
                    title="Reset credentials to role default"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Form Content Centered */}
              <div className="my-auto py-1 xl:py-2 flex flex-col justify-center gap-2.5 xl:gap-3.5">
                {/* Header Text */}
                <div className="flex flex-col mb-0.5 xl:mb-1">
                  <h2 className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-[#111C16] tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-xs text-[#4A5D52] mt-0.5">
                    Sign-in to your account to continue
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-3 xl:space-y-4">
                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#111C16] block">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-10 pr-4 py-2 xl:py-2.5 bg-[#F7F9F8] border border-[#D5DFDA] rounded-xl text-xs sm:text-sm text-[#111C16] placeholder:text-[#74877C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#93C573] focus:border-[#3D6B22] transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-semibold text-[#111C16] block">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs font-semibold text-[#3D6B22] hover:text-[#2C5217] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2 xl:py-2.5 bg-[#F7F9F8] border border-[#D5DFDA] rounded-xl text-xs sm:text-sm text-[#111C16] placeholder:text-[#74877C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#93C573] focus:border-[#3D6B22] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-gray-900 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Keep Me Signed In Checkbox */}
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-[#3D6B22] border-[#D5DFDA] rounded focus:ring-[#93C573] accent-[#3D6B22] cursor-pointer"
                      />
                      <span className="text-xs text-[#4A5D52] font-medium">Keep me signed in</span>
                    </label>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-1 xl:mt-2 bg-[#3D6B22] hover:bg-[#2C5217] active:scale-[0.99] text-white font-bold py-2.5 xl:py-3.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center space-x-2 shadow-md shadow-[#3D6B22]/20 border border-[#3D6B22]/30 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer text-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Secure note */}
              <div className="pt-2 text-center text-[11px] text-[#74877C] shrink-0">
                <span>Enterprise HIPAA Compliant Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-1">Reset Password</h3>
              <p className="text-xs text-gray-500 mb-4">
                Enter your work email address below to receive password reset instructions.
              </p>

              {resetSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs space-y-2 mb-4">
                  <div className="flex items-center space-x-2 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Password Reset Link Sent!</span>
                  </div>
                  <p>Check your inbox at <strong>{email}</strong> for instructions to reset your password.</p>
                </div>
              ) : (
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Corporate Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F7F9F8] border border-[#D5DFDA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#93C573]"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSent(false);
                  }}
                  className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  Close
                </button>
                {!resetSent && (
                  <button
                    type="button"
                    onClick={() => setResetSent(true)}
                    className="px-4 py-2 text-xs font-semibold bg-[#3D6B22] text-white rounded-xl hover:bg-[#2C5217] transition-colors shadow-sm cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
