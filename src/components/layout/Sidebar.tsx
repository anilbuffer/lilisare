"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  LayoutGrid,
  CalendarDays,
  Calendar,
  Users,
  Activity,
  HeartHandshake,
  Heart,
  Home,
  Receipt,
  ShieldAlert,
  CheckSquare,
  Award,
  GraduationCap,
  BarChart3,
  Inbox,
  MessageSquare,
  Settings,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User,
  PanelLeftClose,
  FileText,
  UserPlus,
  MapPin,
  ListTodo,
  Repeat,
  List,
  Clock,
  ClipboardCheck,
  Stethoscope,
  Wallet,
  GitBranch,
  Bell,
  History,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useSidebarCollapse } from "@/hooks/useSidebarCollapse";
import { useAuth } from "@/hooks/useAuth";

export interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const getNavGroups = (role?: string): NavGroup[] => {
  if (role === "CLIENT") {
    return [
      {
        label: "",
        items: [
          { name: "Overview", icon: LayoutDashboard, id: "overview" },
          { name: "My Schedule", icon: CalendarDays, id: "scheduling" },
          { name: "My Care Plan", icon: HeartHandshake, id: "care-plan" },
          { name: "My Visits", icon: CalendarDays, id: "visits" },
          { name: "My Billing", icon: Receipt, id: "billing" },
          { name: "Messages", icon: MessageSquare, id: "messages" },
          { name: "My Documents", icon: FileText, id: "documents" },
        ],
      },
    ];
  }

  if (role === "FAMILY") {
    return [
      {
        label: "",
        items: [
          { name: "Overview", icon: LayoutDashboard, id: "overview" },
          { name: "Scheduling", icon: CalendarDays, id: "scheduling" },
          { name: "Care Plan", icon: HeartHandshake, id: "care-plan" },
          { name: "Visit History", icon: CalendarDays, id: "visits" },
          { name: "Billing & Payments", icon: Receipt, id: "billing" },
          { name: "Messages", icon: MessageSquare, id: "messages" },
          { name: "Documents", icon: FileText, id: "documents" },
        ],
      },
    ];
  }

  if (role === "CAREGIVER") {
    return [
      {
        label: "Caregiver Navigation",
        items: [
          { name: "Today", icon: LayoutDashboard, id: "today" },
          { name: "Schedule", icon: CalendarDays, id: "schedule" },
          { name: "Messages", icon: MessageSquare, id: "messages" },
          { name: "Training", icon: GraduationCap, id: "training" },
          { name: "Incident Report", icon: ShieldAlert, id: "incidents" },
          { name: "Daily Assessment", icon: CheckSquare, id: "assessments" },
          { name: "Profile", icon: User, id: "profile" },
        ],
      },
    ];
  }

  if (role === "HR") {
    return [
      {
        label: "HR & People Operations",
        items: [
          { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
          { name: "Recruiting", icon: UserPlus, id: "recruiting" },
          { name: "Caregivers", icon: HeartHandshake, id: "caregivers" },
          { name: "Clients", icon: Users, id: "clients" },
          { name: "Households", icon: Home, id: "households" },
          { name: "Training", icon: GraduationCap, id: "training" },
          { name: "Payroll", icon: Receipt, id: "payroll" },
          { name: "Messages", icon: MessageSquare, id: "messages" },
        ],
      },
    ];
  }

  if (role === "SCHEDULER") {
    return [
      {
        label: "Workspace",
        items: [
          { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
        ],
      },
      {
        label: "Scheduling & Shifts",
        items: [
          { name: "Scheduled Shifts", icon: ListTodo, id: "scheduled-shifts" },
          { name: "Recurring Patterns", icon: Repeat, id: "recurring-patterns" },
        ],
      },
      {
        label: "Route Planner & Dispatch",
        items: [
          { name: "Route Planner", icon: MapPin, id: "route-optimizer" },
          { name: "Visit List", icon: List, id: "visit-list" },
        ],
      },
      {
        label: "Caregiver Directory",
        items: [
          { name: "Caregiver Roster", icon: HeartHandshake, id: "caregivers" },
          { name: "Availability & Time-Off", icon: Clock, id: "availability" },
        ],
      },
      {
        label: "Clients & Households",
        items: [
          { name: "Clients", icon: Users, id: "clients" },
          { name: "Households", icon: Home, id: "households" },
        ],
      },
      {
        label: "Communications",
        items: [
          { name: "Messages", icon: MessageSquare, id: "messages" },
        ],
      },
    ];
  }

  if (role === "INTAKE_COORDINATOR") {
    return [
      {
        label: "",
        items: [
          { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
          { name: "Referral & Intake", icon: Inbox, id: "referrals" },
          { name: "Clients", icon: Users, id: "clients" },
          { name: "Caregivers", icon: HeartHandshake, id: "caregivers" },
          { name: "Households", icon: Home, id: "households" },
          { name: "Scheduling", icon: Calendar, id: "scheduling" },
          { name: "Reports", icon: BarChart3, id: "reports" },
          { name: "Settings", icon: Settings, id: "settings" },
        ],
      },
    ];
  }

  if (role === "BILLING_FINANCE_STAFF") {
    return [
      {
        label: "",
        items: [
          { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
          { name: "Billing & Claims", icon: Receipt, id: "billing-workspace" },
          { name: "Authorizations", icon: ShieldCheck, id: "authorizations" },
          { name: "Clients", icon: Users, id: "clients" },
          { name: "Households", icon: Home, id: "households" },
          { name: "Payroll", icon: Receipt, id: "payroll" },
          { name: "Reports (Financial)", icon: BarChart3, id: "reports" },
          { name: "Messages", icon: MessageSquare, id: "messages" },
        ],
      },
    ];
  }

  if (role === "CLINICAL_SUPERVISOR_RN") {
    return [
      {
        label: "",
        items: [
          { name: "Clinical Dashboard", icon: LayoutDashboard, id: "dashboard" },
          { name: "Clients", icon: Users, id: "clients" },
          { name: "Households", icon: Home, id: "households" },
          { name: "Assessments & Care Plan", icon: CheckSquare, id: "assessments" },
          { name: "QA (Audits)", icon: Award, id: "qa" },
          { name: "Incident Reports", icon: ShieldAlert, id: "incidents" },
          { name: "Messages", icon: MessageSquare, id: "messages" },
        ],
      },
    ];
  }

  if (role === "QA_COMPLIANCE_OFFICER") {
    return [
      {
        label: "",
        items: [
          { name: "Compliance Dashboard", icon: LayoutDashboard, id: "dashboard" },
          { name: "Clients", icon: Users, id: "clients" },
          { name: "Households", icon: Home, id: "households" },
          { name: "Compliance Tracking", icon: CheckSquare, id: "compliance" },
          { name: "Quality Assurance", icon: Award, id: "qa" },
          { name: "Incident Reports", icon: ShieldAlert, id: "incidents" },
          { name: "Reports (Compliance)", icon: BarChart3, id: "reports" },
          { name: "Messages", icon: MessageSquare, id: "messages" },
        ],
      },
    ];
  }

  if (role === "FIELD_SUPERVISOR") {
    return [
      {
        label: "",
        items: [
          { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
          { name: "Supervisory Visits", icon: CheckSquare, id: "visits" },
          { name: "Clients", icon: Users, id: "clients" },
          { name: "Households", icon: Home, id: "households" },
          { name: "Caregivers", icon: Users, id: "caregivers" },
          { name: "Incident Reports", icon: ShieldAlert, id: "incidents" },
          { name: "Messages", icon: MessageSquare, id: "messages" },
        ],
      },
    ];
  }

  if (role === "TRAINER") {
    return [
      {
        label: "Training Center",
        items: [
          { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
          { name: "Course Builder", icon: GraduationCap, id: "course-builder" },
          { name: "Quiz Management", icon: CheckSquare, id: "quizzes" },
          { name: "Course Library", icon: Inbox, id: "courses" },
          { name: "Compliance Tracking", icon: ShieldCheck, id: "compliance" },
          { name: "Messages", icon: MessageSquare, id: "messages" },
        ],
      },
    ];
  }

  // Default ADMIN / Agency Admin role navigation with original menu names
  return [
    {
      label: "",
      items: [
        { name: "Dashboard", icon: LayoutGrid, id: "dashboard" },
        { name: "Intake & Referrals", icon: Inbox, id: "intake-referrals" },
        { name: "Clients", icon: Users, id: "clients" },
        { name: "Caregivers", icon: Heart, id: "caregivers" },
        { name: "Households", icon: Home, id: "households" },
      ],
    },
    {
      label: "CARE OPERATIONS",
      items: [
        { name: "Authorizations", icon: ClipboardCheck, id: "authorizations" },
        { name: "Scheduling", icon: Calendar, id: "scheduling" },
        { name: "EVV Visits", icon: MapPin, id: "evv-visits" },
        { name: "Care Notes", icon: FileText, id: "care-notes" },
        { name: "Clinical & Supervisory", icon: Stethoscope, id: "clinical-supervisory" },
      ],
    },
    {
      label: "ADMINISTRATION",
      items: [
        { name: "Compliance", icon: ShieldCheck, id: "compliance" },
        { name: "Training & Credentials", icon: GraduationCap, id: "training-credentials" },
        { name: "Billing & Claims", icon: Receipt, id: "billing-claims" },
        { name: "Payroll", icon: Wallet, id: "payroll" },
        { name: "Reports & Analytics", icon: BarChart3, id: "reports-analytics" },
      ],
    },
    {
      label: "SYSTEM",
      items: [
        { name: "User & Role Management", icon: Users, id: "user-role-mgmt" },
        { name: "Automation & Rules", icon: GitBranch, id: "automation-rules" },
        { name: "Notifications", icon: Bell, id: "notifications" },
        { name: "Audit Logs", icon: History, id: "audit-logs" },
        { name: "Settings", icon: Settings, id: "settings" },
      ],
    },
  ];
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const cachedExpandedGroups: Record<string, boolean> = {};

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { isCollapsed, toggleCollapse } = useSidebarCollapse();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showHipaaTooltip, setShowHipaaTooltip] = useState(false);

  // Expandable group state initialized from cache so page switches don't reset
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(cachedExpandedGroups);

  const safeUser = currentUser;

  // Derive effective role from active URL prefix so role-dedicated portals (e.g. /intake/...) always render the correct portal sidebar
  const effectiveRole = useMemo(() => {
    if (pathname.startsWith("/intake")) return "INTAKE_COORDINATOR";
    if (pathname.startsWith("/hr")) return "HR";
    if (pathname.startsWith("/scheduler")) return "SCHEDULER";
    if (pathname.startsWith("/billing")) return "BILLING_FINANCE_STAFF";
    if (pathname.startsWith("/clinical")) return "CLINICAL_SUPERVISOR_RN";
    if (pathname.startsWith("/compliance")) return "QA_COMPLIANCE_OFFICER";
    if (pathname.startsWith("/field-supervisor")) return "FIELD_SUPERVISOR";
    if (pathname.startsWith("/caregiver")) return "CAREGIVER";
    if (pathname.startsWith("/portal")) return "CLIENT";
    if (pathname.startsWith("/admin")) return "ADMIN";
    return safeUser?.role || "ADMIN";
  }, [pathname, safeUser?.role]);

  const navGroups = useMemo(() => getNavGroups(effectiveRole), [effectiveRole]);

  const activeItem = useMemo(() => {
    if (!pathname) return "dashboard";
    const path = pathname.replace(/\/$/, "") || "/";
    const isPath = (target: string) => path === target || path.startsWith(`${target}/`);

    const role = effectiveRole;

    // 1. Role-specific portal & dedicated workspaces
    if (role === "CLIENT" || role === "FAMILY") {
      if (isPath("/portal/visits")) return "visits";
      if (isPath("/portal/schedule")) return "scheduling";
      if (isPath("/portal/care-plan")) return "care-plan";
      if (isPath("/portal/billing")) return "billing";
      if (isPath("/portal/messages")) return "messages";
      if (isPath("/portal/documents")) return "documents";
      if (isPath("/portal")) return "overview";
    }

    if (role === "CAREGIVER") {
      if (isPath("/caregiver/schedule")) return "schedule";
      if (isPath("/caregiver/messages")) return "messages";
      if (isPath("/caregiver/training")) return "training";
      if (isPath("/caregiver/incidents")) return "incidents";
      if (isPath("/caregiver/assessments")) return "assessments";
      if (isPath("/caregiver/profile")) return "profile";
      if (isPath("/caregiver")) return "today";
    }

    if (role === "HR") {
      if (isPath("/hr/recruiting")) return "recruiting";
      if (isPath("/hr/caregivers")) return "caregivers";
      if (isPath("/hr/training")) return "training";
      if (isPath("/hr/payroll")) return "payroll";
      if (isPath("/hr/messages")) return "messages";
      if (isPath("/hr/clients") || isPath("/clients") || isPath("/patients")) return "clients";
      if (isPath("/hr/households") || isPath("/households")) return "households";
      if (isPath("/hr/dashboard") || isPath("/hr")) return "dashboard";
    }

    if (role === "SCHEDULER") {
      if (isPath("/scheduler/shifts/recurring")) return "recurring-patterns";
      if (isPath("/scheduler/shifts")) return "scheduled-shifts";
      if (isPath("/scheduler/dispatch/optimizer")) return "route-optimizer";
      if (isPath("/scheduler/dispatch/visits")) return "visit-list";
      if (isPath("/scheduler/caregivers/availability")) return "availability";
      if (isPath("/scheduler/caregivers")) return "caregivers";
      if (isPath("/scheduler/clients") || isPath("/scheduler/patients") || isPath("/clients") || isPath("/patients")) return "clients";
      if (isPath("/scheduler/households") || isPath("/households")) return "households";
      if (isPath("/scheduler/messages")) return "messages";
      if (isPath("/scheduler")) return "dashboard";
    }

    if (role === "INTAKE_COORDINATOR") {
      if (isPath("/intake/referrals") || isPath("/referrals") || isPath("/intake/pipeline") || isPath("/intake/inquiries")) return "referrals";
      if (isPath("/intake/clients") || isPath("/intake/patients")) return "clients";
      if (isPath("/intake/caregivers")) return "caregivers";
      if (isPath("/intake/households")) return "households";
      if (isPath("/intake/scheduling")) return "scheduling";
      if (isPath("/intake/reports") || isPath("/reports")) return "reports";
      if (isPath("/intake/dashboard") || isPath("/intake")) return "dashboard";
    }

    if (role === "BILLING_FINANCE_STAFF") {
      if (isPath("/billing/authorizations") || isPath("/authorizations")) return "authorizations";
      if (isPath("/billing/payroll")) return "payroll";
      if (isPath("/billing/reports")) return "reports";
      if (isPath("/billing/messages")) return "messages";
      if (isPath("/clients") || isPath("/patients")) return "clients";
      if (isPath("/households")) return "households";
      if (isPath("/billing/workspace") || isPath("/billing")) return "billing-workspace";
      if (isPath("/dashboard") || path === "/") return "dashboard";
    }

    if (role === "CLINICAL_SUPERVISOR_RN") {
      if (isPath("/clinical/assessments")) return "assessments";
      if (isPath("/clinical/qa")) return "qa";
      if (isPath("/clinical/incidents")) return "incidents";
      if (isPath("/clinical/messages")) return "messages";
      if (isPath("/clients") || isPath("/patients")) return "clients";
      if (isPath("/households")) return "households";
      if (isPath("/clinical")) return "dashboard";
    }

    if (role === "QA_COMPLIANCE_OFFICER") {
      if (isPath("/compliance/tracking")) return "compliance";
      if (isPath("/compliance/qa")) return "qa";
      if (isPath("/compliance/incidents")) return "incidents";
      if (isPath("/compliance/reports")) return "reports";
      if (isPath("/compliance/messages")) return "messages";
      if (isPath("/clients") || isPath("/patients")) return "clients";
      if (isPath("/households")) return "households";
      if (isPath("/compliance")) return "dashboard";
    }

    if (role === "FIELD_SUPERVISOR") {
      if (isPath("/field-supervisor/visits")) return "visits";
      if (isPath("/field-supervisor/caregivers")) return "caregivers";
      if (isPath("/field-supervisor/incidents")) return "incidents";
      if (isPath("/field-supervisor/messages")) return "messages";
      if (isPath("/clients") || isPath("/patients")) return "clients";
      if (isPath("/households")) return "households";
      if (isPath("/field-supervisor")) return "dashboard";
    }

    if (role === "TRAINER") {
      if (isPath("/training-admin/courses/builder")) return "course-builder";
      if (isPath("/training-admin/courses")) return "courses";
      if (isPath("/training-admin/quizzes")) return "quizzes";
      if (isPath("/training-admin/compliance")) return "compliance";
      if (isPath("/training-admin/messages")) return "messages";
      if (isPath("/training-admin")) return "dashboard";
    }

    // 2. Specific sub-portal / standalone paths when accessed directly (even if role is not set)
    if (isPath("/portal/visits")) return "visits";
    if (isPath("/portal/schedule")) return "scheduling";
    if (isPath("/portal/care-plan")) return "care-plan";
    if (isPath("/portal/billing")) return "billing";
    if (isPath("/portal/messages")) return "messages";
    if (isPath("/portal/documents")) return "documents";
    if (isPath("/portal")) return "overview";

    if (isPath("/caregiver/schedule")) return "schedule";
    if (isPath("/caregiver/messages")) return "messages";
    if (isPath("/caregiver/training")) return "training";
    if (isPath("/caregiver/incidents")) return "incidents";
    if (isPath("/caregiver/assessments")) return "assessments";
    if (isPath("/caregiver/profile")) return "profile";
    if (isPath("/caregiver")) return "today";

    if (isPath("/hr/recruiting")) return "recruiting";
    if (isPath("/hr/caregivers")) return "caregivers";
    if (isPath("/hr/training")) return "training";
    if (isPath("/hr/payroll")) return "payroll";
    if (isPath("/hr/messages")) return "messages";

    // 3. Admin & General Agency Operational Mappings (Default ADMIN role & fallback)
    if (isPath("/admin/command-center")) return "command-center";
    if (isPath("/admin/households") || isPath("/households")) return "households";
    if (isPath("/admin/audit-logs") || isPath("/audit-logs")) return "audit-logs";
    if (isPath("/admin/automation") || isPath("/automation")) return "automation-rules";
    if (isPath("/admin/intake-referrals") || isPath("/admin/referrals") || isPath("/intake/pipeline") || isPath("/intake/referrals") || isPath("/intake") || isPath("/referrals") || isPath("/refer")) return "intake-referrals";
    if (isPath("/admin/clients") || isPath("/clients") || isPath("/patients")) return "clients";

    // Caregivers directory & management (Admin / Agency)
    if (isPath("/admin/caregivers") || isPath("/caregivers")) return "caregivers";

    // Care Operations
    if (isPath("/admin/authorizations") || isPath("/billing/authorizations") || isPath("/authorizations")) return "authorizations";
    if (isPath("/admin/evv-visits") || isPath("/evv-monitoring") || isPath("/caregivers-tracker")) return "evv-visits";
    if (isPath("/admin/scheduling") || isPath("/scheduling") || isPath("/scheduler")) return "scheduling";
    if (isPath("/admin/care-notes") || isPath("/clinical/visit-notes") || isPath("/care-notes")) return "care-notes";
    if (isPath("/admin/clinical") || isPath("/clinical")) return "clinical-supervisory";

    // Administration
    if (isPath("/admin/compliance") || isPath("/compliance") || isPath("/quality-assurance")) return "compliance";
    if (isPath("/admin/training") || isPath("/training-admin") || isPath("/training")) return "training-credentials";
    if (isPath("/admin/payroll") || isPath("/billing/payroll") || isPath("/payroll")) return "payroll";
    if (isPath("/admin/billing") || isPath("/billing")) return "billing-claims";
    if (isPath("/admin/reports") || isPath("/reports")) return "reports-analytics";

    // System
    if (isPath("/admin/users") || isPath("/users")) return "user-role-mgmt";
    if (isPath("/admin/notifications") || isPath("/communications") || isPath("/notifications")) return "notifications";
    if (isPath("/admin/settings") || isPath("/settings") || isPath("/admin-settings")) return "settings";

    if (isPath("/admin/dashboard") || isPath("/dashboard") || path === "/") return "dashboard";

    return "dashboard";
  }, [pathname, safeUser?.role]);

  // Ensure active category is expanded
  useEffect(() => {
    navGroups.forEach((group, index) => {
      if (group.label) {
        const groupKey = group.label || `group-${index}`;
        const containsActive = group.items.some((item) => item.id === activeItem);
        if (containsActive && expandedGroups[groupKey] === false) {
          setExpandedGroups((prev) => {
            const updated = { ...prev, [groupKey]: true };
            cachedExpandedGroups[groupKey] = true;
            return updated;
          });
        }
      }
    });
  }, [activeItem, navGroups, expandedGroups]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const nextVal = prev[groupKey] === undefined ? false : !prev[groupKey];
      const updated = {
        ...prev,
        [groupKey]: nextVal,
      };
      cachedExpandedGroups[groupKey] = nextVal;
      return updated;
    });
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    router.push("/login");
  };

  const getItemHref = (id: string) => {
    const role = effectiveRole;

    // 1. Role-specific URL namespaces
    if (role === "ADMIN" || !role) {
      if (id === "dashboard") return "/admin/dashboard";
      if (id === "intake-referrals") return "/admin/intake-referrals";
      if (id === "clients") return "/admin/clients";
      if (id === "caregivers") return "/admin/caregivers";
      if (id === "households") return "/admin/households";
      if (id === "authorizations") return "/admin/authorizations";
      if (id === "scheduling") return "/admin/scheduling";
      if (id === "evv-visits") return "/admin/evv-visits";
      if (id === "care-notes") return "/admin/care-notes";
      if (id === "clinical-supervisory") return "/admin/clinical";
      if (id === "compliance") return "/admin/compliance";
      if (id === "training-credentials") return "/admin/training";
      if (id === "billing-claims") return "/admin/billing";
      if (id === "payroll") return "/admin/payroll";
      if (id === "reports-analytics") return "/admin/reports";
      if (id === "user-role-mgmt") return "/admin/users";
      if (id === "automation-rules") return "/admin/automation";
      if (id === "notifications") return "/admin/notifications";
      if (id === "audit-logs") return "/admin/audit-logs";
      if (id === "settings") return "/admin/settings";
      if (id === "command-center") return "/admin/command-center";
    }

    if (role === "INTAKE_COORDINATOR") {
      if (id === "dashboard") return "/intake/dashboard";
      if (id === "referrals") return "/intake/pipeline";
      if (id === "clients") return "/intake/clients";
      if (id === "caregivers") return "/intake/caregivers";
      if (id === "households") return "/intake/households";
      if (id === "scheduling") return "/intake/scheduling";
      if (id === "reports") return "/intake/reports";
      if (id === "settings") return "/intake/settings";
    }

    if (role === "HR") {
      if (id === "dashboard") return "/hr/dashboard";
      if (id === "recruiting") return "/hr/recruiting";
      if (id === "caregivers") return "/hr/caregivers";
      if (id === "clients") return "/hr/clients";
      if (id === "households") return "/hr/households";
      if (id === "training") return "/hr/training";
      if (id === "payroll") return "/hr/payroll";
      if (id === "messages") return "/hr/messages";
    }

    if (role === "SCHEDULER") {
      if (id === "dashboard") return "/scheduler";
      if (id === "scheduled-shifts") return "/scheduler/shifts/list";
      if (id === "recurring-patterns") return "/scheduler/shifts/recurring";
      if (id === "route-optimizer") return "/scheduler/dispatch/optimizer";
      if (id === "visit-list") return "/scheduler/dispatch/visits";
      if (id === "caregivers") return "/scheduler/caregivers";
      if (id === "availability") return "/scheduler/caregivers/availability";
      if (id === "clients") return "/scheduler/clients";
      if (id === "households") return "/scheduler/households";
      if (id === "messages") return "/scheduler/messages";
    }

    if (id === "dashboard") return safeUser?.role === "QA_COMPLIANCE_OFFICER" ? "/compliance" : safeUser?.role === "INTAKE_COORDINATOR" ? "/intake/dashboard" : safeUser?.role === "BILLING_FINANCE_STAFF" ? "/billing" : safeUser?.role === "CLINICAL_SUPERVISOR_RN" ? "/clinical" : safeUser?.role === "FIELD_SUPERVISOR" ? "/field-supervisor" : safeUser?.role === "TRAINER" ? "/training-admin" : safeUser?.role === "HR" ? "/hr/dashboard" : safeUser?.role === "SCHEDULER" ? "/scheduler" : "/admin/dashboard";
    if (id === "intake-referrals") return safeUser?.role === "INTAKE_COORDINATOR" ? "/intake/pipeline" : "/admin/intake-referrals";
    if (id === "clients") return safeUser?.role === "INTAKE_COORDINATOR" ? "/intake/clients" : "/admin/clients";
    if (id === "caregivers") return safeUser?.role === "HR" ? "/hr/caregivers" : safeUser?.role === "SCHEDULER" ? "/scheduler/caregivers" : safeUser?.role === "FIELD_SUPERVISOR" ? "/field-supervisor/caregivers" : safeUser?.role === "INTAKE_COORDINATOR" ? "/intake/caregivers" : "/admin/caregivers";
    if (id === "households") return safeUser?.role === "INTAKE_COORDINATOR" ? "/intake/households" : "/admin/households";
    if (id === "authorizations") return "/admin/authorizations";
    if (id === "scheduling") return safeUser?.role === "CLIENT" || safeUser?.role === "FAMILY" ? "/portal/schedule" : safeUser?.role === "INTAKE_COORDINATOR" ? "/intake/scheduling" : "/admin/scheduling";
    if (id === "evv-visits") return "/admin/evv-visits";
    if (id === "care-notes") return "/admin/care-notes";
    if (id === "clinical-supervisory") return "/admin/clinical";
    if (id === "compliance") return safeUser?.role === "QA_COMPLIANCE_OFFICER" ? "/compliance/tracking" : safeUser?.role === "TRAINER" ? "/training-admin/compliance" : "/admin/compliance";
    if (id === "training-credentials") return "/admin/training";
    if (id === "billing-claims") return "/admin/billing";
    if (id === "payroll") return safeUser?.role === "HR" ? "/hr/payroll" : safeUser?.role === "BILLING_FINANCE_STAFF" ? "/billing/payroll" : "/admin/payroll";
    if (id === "reports-analytics") return "/admin/reports";
    if (id === "user-role-mgmt") return "/admin/users";
    if (id === "automation-rules") return "/admin/automation";
    if (id === "notifications") return "/admin/notifications";
    if (id === "audit-logs") return "/admin/audit-logs";
    if (id === "settings") return safeUser?.role === "QA_COMPLIANCE_OFFICER" ? "/compliance/settings" : safeUser?.role === "INTAKE_COORDINATOR" ? "/intake/settings" : safeUser?.role === "BILLING_FINANCE_STAFF" ? "/billing/settings" : safeUser?.role === "CLINICAL_SUPERVISOR_RN" ? "/clinical/settings" : safeUser?.role === "FIELD_SUPERVISOR" ? "/field-supervisor/settings" : safeUser?.role === "TRAINER" ? "/training-admin/settings" : "/admin/settings";

    // Backward compatibility for other sub-portal roles
    if (id === "command-center") return "/admin/command-center";
    if (id === "users") return "/admin/users";
    if (id === "training") return safeUser?.role === "CAREGIVER" ? "/caregiver/training" : safeUser?.role === "HR" ? "/hr/training" : "/admin/training";
    if (id === "billing-admin") return "/admin/billing";
    if (id === "billing-workspace") return "/admin/billing";
    if (id === "reports") return safeUser?.role === "BILLING_FINANCE_STAFF" ? "/billing/reports" : safeUser?.role === "QA_COMPLIANCE_OFFICER" ? "/compliance/reports" : safeUser?.role === "INTAKE_COORDINATOR" ? "/intake/reports" : "/admin/reports";
    if (id === "messages") return safeUser?.role === "CLIENT" || safeUser?.role === "FAMILY" ? "/portal/messages" : safeUser?.role === "CAREGIVER" ? "/caregiver/messages" : safeUser?.role === "HR" ? "/hr/messages" : safeUser?.role === "SCHEDULER" ? "/scheduler/messages" : safeUser?.role === "QA_COMPLIANCE_OFFICER" ? "/compliance/messages" : safeUser?.role === "CLINICAL_SUPERVISOR_RN" ? "/clinical/messages" : safeUser?.role === "FIELD_SUPERVISOR" ? "/field-supervisor/messages" : safeUser?.role === "TRAINER" ? "/training-admin/messages" : "/billing/messages";
    if (id === "patients") return safeUser?.role === "INTAKE_COORDINATOR" ? "/intake/clients" : "/admin/clients";
    if (id === "evv-monitoring") return "/admin/evv-visits";
    if (id === "qa") return safeUser?.role === "QA_COMPLIANCE_OFFICER" ? "/compliance/qa" : safeUser?.role === "CLINICAL_SUPERVISOR_RN" ? "/clinical/qa" : "/quality-assurance";
    if (id === "visits") return safeUser?.role === "CLIENT" || safeUser?.role === "FAMILY" ? "/portal/visits" : "/field-supervisor/visits";
    if (id === "incidents") return safeUser?.role === "CAREGIVER" ? "/caregiver/incidents" : safeUser?.role === "QA_COMPLIANCE_OFFICER" ? "/compliance/incidents" : safeUser?.role === "CLINICAL_SUPERVISOR_RN" ? "/clinical/incidents" : safeUser?.role === "FIELD_SUPERVISOR" ? "/field-supervisor/incidents" : "/incidents";
    if (id === "assessments") return safeUser?.role === "CAREGIVER" ? "/caregiver/assessments" : "/clinical/assessments";
    if (id === "referrals") return safeUser?.role === "INTAKE_COORDINATOR" ? "/intake/pipeline" : "/admin/intake-referrals";
    if (id === "communications") return safeUser?.role === "INTAKE_COORDINATOR" ? "/intake/communications" : "/admin/notifications";
    if (id === "overview") return "/portal";
    if (id === "care-plan") return "/portal/care-plan";
    if (id === "billing") return "/portal/billing";
    if (id === "documents") return "/portal/documents";
    if (id === "today") return "/caregiver";
    if (id === "schedule") return "/caregiver/schedule";
    if (id === "profile") return "/caregiver/profile";
    if (id === "recruiting") return "/hr/recruiting";
    if (id === "scheduled-shifts") return "/scheduler/shifts/list";
    if (id === "recurring-patterns") return "/scheduler/shifts/recurring";
    if (id === "route-optimizer") return "/scheduler/dispatch/optimizer";
    if (id === "visit-list") return "/scheduler/dispatch/visits";
    if (id === "availability") return "/scheduler/caregivers/availability";
    if (id === "course-builder") return "/training-admin/courses/builder";
    if (id === "courses") return "/training-admin/courses";
    if (id === "quizzes") return "/training-admin/quizzes";
    return "/admin/dashboard";
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={clsx(
          "bg-sidebar-bg text-white flex flex-col h-screen fixed top-0 left-0 z-50 transition-[width,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)] lg:translate-x-0 lg:sticky lg:top-0 shadow-[4px_0_24px_rgba(0,0,0,0.15)] lg:shadow-none select-none overflow-x-hidden will-change-[width]",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-[76px] w-[260px]" : "w-[260px]"
        )}
      >
        {/* Header / Logo Area */}
        <div
          className={clsx(
            "flex items-center h-20 border-b border-sidebar-active/40 px-3 relative overflow-hidden transition-all duration-300",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <Link
            href={
              effectiveRole === "CLIENT" || effectiveRole === "FAMILY"
                ? "/portal"
                : effectiveRole === "CAREGIVER"
                  ? "/caregiver"
                  : effectiveRole === "HR"
                    ? "/hr/dashboard"
                    : effectiveRole === "SCHEDULER"
                      ? "/scheduler"
                      : effectiveRole === "QA_COMPLIANCE_OFFICER"
                        ? "/compliance"
                        : effectiveRole === "INTAKE_COORDINATOR"
                          ? "/intake/dashboard"
                          : effectiveRole === "BILLING_FINANCE_STAFF"
                            ? "/billing"
                            : effectiveRole === "CLINICAL_SUPERVISOR_RN"
                              ? "/clinical"
                              : effectiveRole === "FIELD_SUPERVISOR"
                                ? "/field-supervisor"
                                : effectiveRole === "TRAINER"
                                  ? "/training-admin"
                                  : "/admin/dashboard"
            }
            className="flex items-center gap-3 overflow-hidden group w-full"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 p-1 flex items-center justify-center shadow-md shadow-brand-teal/20 shrink-0 group-hover:scale-105 transition-transform">
              <img src="/logo-mark.svg" alt="LiliSare Logo" className="w-10 h-10 object-contain" />
            </div>
            <div
              className={clsx(
                "flex flex-col truncate transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden whitespace-nowrap",
                isCollapsed
                  ? "max-w-0 opacity-0 -translate-x-3 pointer-events-none"
                  : "max-w-[180px] opacity-100 translate-x-0"
              )}
            >
              <span className="font-bold text-base lg:text-xl tracking-wide text-white block leading-tight truncate">
                LiliSare
              </span>
              {safeUser?.role === "CAREGIVER" && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-brand-teal flex items-center gap-1 mt-0.5">
                  <HeartHandshake className="w-3 h-3 inline" /> Caregiver Portal
                </span>
              )}
              {safeUser?.role === "HR" && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-teal mt-0.5">
                  HR Portal
                </span>
              )}
              {safeUser?.role === "SCHEDULER" && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-teal mt-0.5">
                  Dispatch Portal
                </span>
              )}
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className={clsx(
              "absolute right-4 lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors",
              isCollapsed && "hidden"
            )}
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600/80">
          {navGroups.map((group, groupIndex) => {
            const groupKey = group.label || `group-${groupIndex}`;
            // By default, groups are expanded unless explicitly toggled off
            const isExpanded = expandedGroups[groupKey] !== false;

            return (
              <div key={groupKey} className="space-y-1">
                {groupIndex > 0 && <div className="h-px bg-[#26481C] my-2 mx-1.5" />}

                {/* Section Header / Expandable Menu Trigger */}
                {group.label ? (
                  <div className="relative my-1 px-1 transition-all duration-300">
                    <div
                      className={clsx(
                        "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] whitespace-nowrap",
                        isCollapsed
                          ? "max-h-0 opacity-0 pointer-events-none -translate-x-2"
                          : "max-h-8 opacity-100 translate-x-0"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroup(groupKey)}
                        className="w-full flex items-center justify-between px-2 pt-2 pb-1 text-[11px] font-bold text-[#8DBE6A] hover:text-white tracking-wider uppercase truncate rounded-lg hover:bg-white/5 transition-colors cursor-pointer select-none group"
                        aria-expanded={isExpanded}
                      >
                        <span className="truncate">{group.label}</span>
                        <ChevronDown
                          className={clsx(
                            "w-3.5 h-3.5 text-[#8DBE6A]/70 group-hover:text-white transition-transform duration-200 shrink-0",
                            isExpanded ? "rotate-0" : "-rotate-90"
                          )}
                        />
                      </button>
                    </div>
                    <div
                      className={clsx(
                        "h-px bg-[#26481C] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] mx-1",
                        isCollapsed ? "opacity-100 my-1.5" : "opacity-0 max-h-0"
                      )}
                    />
                  </div>
                ) : null}

                {/* Group Items (Collapsible / Expandable with smooth transition) */}
                <AnimatePresence initial={false}>
                  {(!group.label || isCollapsed || isExpanded) && (
                    <motion.div
                      key={`${groupKey}-content`}
                      initial={false}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <ul className="space-y-0.5">
                        {group.items.map((item) => {
                          const isActive = activeItem === item.id;
                          const Icon = item.icon;
                          const href = getItemHref(item.id);

                          return (
                            <li key={item.id} className="relative group">
                              {isActive && (
                                <div
                                  className="absolute inset-0 bg-[#3D6B22] rounded-xl border border-[#528730]/60 shadow-sm transition-opacity duration-150"
                                >
                                  <span className="absolute left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-[#93C573]" />
                                </div>
                              )}

                              <Link
                                href={href}
                                onClick={() => {
                                  if (onClose) onClose();
                                }}
                                aria-label={isCollapsed ? item.name : undefined}
                                className={clsx(
                                  "relative flex items-center rounded-xl text-sm font-medium transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C573] h-10 px-3",
                                  isActive
                                    ? "text-white font-semibold"
                                    : "text-[#D2E0D4] hover:text-white hover:bg-[#25461C]/70"
                                )}
                              >
                                <div className="flex items-center w-full overflow-hidden">
                                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                    <Icon
                                      className={clsx(
                                        "w-4 h-4 shrink-0 transition-colors",
                                        isActive
                                          ? "text-[#93C573]"
                                          : "text-[#B6CDB9] group-hover:text-white"
                                      )}
                                    />
                                  </div>
                                  <span
                                    className={clsx(
                                      "truncate text-sm transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] whitespace-nowrap overflow-hidden ml-2.5",
                                      isCollapsed
                                        ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none ml-0"
                                        : "max-w-[170px] opacity-100 translate-x-0"
                                    )}
                                  >
                                    {item.name}
                                  </span>
                                </div>
                              </Link>

                              {/* Accessible Tooltip for Mini View (Hover + Focus) */}
                              {isCollapsed && (
                                <div
                                  role="tooltip"
                                  className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-2xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-all duration-200 z-50 flex items-center gap-2 translate-x-1 group-hover:translate-x-0 group-focus-within:translate-x-0"
                                >
                                  <span>{item.name}</span>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* HIPAA Card */}
        {safeUser?.role !== "CLIENT" && safeUser?.role !== "FAMILY" && (
          <div className="px-3 mb-3 relative group">
            <div
              onMouseEnter={() => isCollapsed && setShowHipaaTooltip(true)}
              onMouseLeave={() => isCollapsed && setShowHipaaTooltip(false)}
              className={clsx(
                "bg-[#14280E]/90 rounded-xl border border-sidebar-active/60 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden flex items-center",
                isCollapsed
                  ? "p-3 justify-center cursor-pointer hover:bg-sidebar-active/50"
                  : "p-3.5 justify-start gap-3"
              )}
            >
              <div className="relative shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#93C573]" />
                {isCollapsed && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#93C573] rounded-full ring-2 ring-sidebar-bg"></span>
                )}
              </div>

              <div
                className={clsx(
                  "transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden whitespace-nowrap",
                  isCollapsed
                    ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                    : "max-w-[170px] opacity-100 translate-x-0"
                )}
              >
                <div className="text-sm font-medium text-white truncate">
                  {safeUser?.role === "CAREGIVER"
                    ? "EVV & HIPAA Compliant"
                    : safeUser?.role === "SCHEDULER"
                      ? "HIPAA Protected"
                      : "HIPAA Compliant"}
                </div>
                <div className="text-xs text-slate-400 truncate mt-0.5">
                  {safeUser?.role === "SCHEDULER"
                    ? "Role-scoped scheduler view."
                    : "Data encrypted in transit."}
                </div>
              </div>
            </div>

            {/* Tooltip in collapsed state */}
            <AnimatePresence>
              {isCollapsed && showHipaaTooltip && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-full ml-4 bottom-0 w-56 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl z-50 text-left pointer-events-none"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#93C573]" />
                    {safeUser?.role === "CAREGIVER"
                      ? "EVV & HIPAA Compliant"
                      : safeUser?.role === "SCHEDULER"
                        ? "HIPAA Protected"
                        : "HIPAA Compliant"}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    {safeUser?.role === "SCHEDULER"
                      ? "Role-scoped scheduler view."
                      : "Data encrypted in transit and at rest."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* User Profile */}
        <div className="p-3 border-t border-sidebar-active/60 relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label={isCollapsed ? `${safeUser?.name || "Agency Admin"} Profile` : undefined}
            className={clsx(
              "flex items-center w-full hover:bg-sidebar-active p-2 rounded-xl transition-all duration-300 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C573]",
              isCollapsed ? "justify-center" : "gap-3 justify-between"
            )}
            title={isCollapsed ? `${safeUser?.name || "Agency Admin"}` : undefined}
          >
            <div className="w-9 h-9 rounded-full bg-sidebar-active shrink-0 overflow-hidden flex items-center justify-center ring-2 ring-[#93C573]/40">
              <User className="w-4.5 h-4.5 text-emerald-200" />
            </div>

            <div
              className={clsx(
                "flex-1 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] whitespace-nowrap",
                isCollapsed
                  ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                  : "max-w-[150px] opacity-100 translate-x-0"
              )}
            >
              <div className="text-sm font-medium text-white truncate">
                {effectiveRole === "INTAKE_COORDINATOR"
                  ? (safeUser?.role === "INTAKE_COORDINATOR" ? safeUser?.name : "Sarah Jenkins")
                  : (safeUser?.name || "Agency Executive")}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {effectiveRole === "INTAKE_COORDINATOR"
                  ? "Intake Coordinator"
                  : effectiveRole === "CLIENT"
                    ? "Patient"
                    : effectiveRole === "FAMILY"
                      ? "Family Member"
                      : effectiveRole === "CAREGIVER"
                        ? "Caregiver (Field Staff)"
                        : effectiveRole === "SCHEDULER"
                          ? "Scheduler / Dispatcher"
                          : effectiveRole === "HR"
                            ? "HR Recruiter"
                            : effectiveRole === "TRAINER"
                              ? "Trainer / LMS Admin"
                              : effectiveRole === "BILLING_FINANCE_STAFF"
                                ? "Billing & Finance"
                                : effectiveRole === "CLINICAL_SUPERVISOR_RN"
                                  ? "Clinical Supervisor RN"
                                  : effectiveRole === "QA_COMPLIANCE_OFFICER"
                                    ? "QA & Compliance"
                                    : effectiveRole === "FIELD_SUPERVISOR"
                                      ? "Field Supervisor"
                                      : "Agency Administrator"}
              </div>
            </div>

            <div
              className={clsx(
                "transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] shrink-0 overflow-hidden",
                isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-5 opacity-100"
              )}
            >
              <ChevronDown
                className={clsx(
                  "w-4 h-4 text-slate-400 transition-transform duration-200",
                  isProfileOpen && "rotate-180"
                )}
              />
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={clsx(
                  "absolute bg-[#14280E] border border-sidebar-active/80 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5",
                  isCollapsed
                    ? "left-full ml-4 bottom-3 w-48"
                    : "bottom-[calc(100%-10px)] left-3 right-3 mb-2"
                )}
              >
                <div className="flex flex-col gap-1">
                  <Link
                    href={
                      effectiveRole === "INTAKE_COORDINATOR"
                        ? "/intake/settings"
                        : effectiveRole === "QA_COMPLIANCE_OFFICER"
                          ? "/compliance/settings"
                          : effectiveRole === "BILLING_FINANCE_STAFF"
                            ? "/billing/settings"
                            : effectiveRole === "CLINICAL_SUPERVISOR_RN"
                              ? "/clinical/settings"
                              : effectiveRole === "FIELD_SUPERVISOR"
                                ? "/field-supervisor/settings"
                                : effectiveRole === "TRAINER"
                                  ? "/training-admin/settings"
                                  : "/settings"
                    }
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-sidebar-active rounded-xl transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Settings
                  </Link>
                  <Link
                    href="/about"
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-sidebar-active rounded-xl transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Heart className="w-4 h-4 text-[#FF6E61]" />
                    About LiliSare
                  </Link>
                  <div className="h-px w-full bg-sidebar-active/60 my-0.5" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  );
}
