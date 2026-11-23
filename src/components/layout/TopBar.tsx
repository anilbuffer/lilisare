"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationsCenter } from "./NotificationsCenter";

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    // Agency Admin Portal Routes
    if (pathname.startsWith("/admin/command-center")) return "Command Center";
    if (pathname.startsWith("/admin/households")) return "Agency Households";
    if (pathname.startsWith("/admin/clients")) return "Agency Clients";
    if (pathname.startsWith("/admin/caregivers")) return "Agency Caregivers";
    if (pathname.startsWith("/admin/intake-referrals")) return "Intake & Referrals";
    if (pathname.startsWith("/admin/authorizations")) return "Authorizations";
    if (pathname.startsWith("/admin/scheduling")) return "Scheduling & EVV";
    if (pathname.startsWith("/admin/evv-visits")) return "EVV Visits & Monitoring";
    if (pathname.startsWith("/admin/care-notes")) return "Care Notes & Clinical Monitoring";
    if (pathname.startsWith("/admin/clinical")) return "Clinical Monitoring";
    if (pathname.startsWith("/admin/compliance")) return "Compliance Management";
    if (pathname.startsWith("/admin/training")) return "Training & LMS";
    if (pathname.startsWith("/admin/payroll")) return "Agency Payroll";
    if (pathname.startsWith("/admin/billing")) return "Billing & Claims";
    if (pathname.startsWith("/admin/reports")) return "Reports & Analytics";
    if (pathname.startsWith("/admin/users")) return "User & Role Management";
    if (pathname.startsWith("/admin/automation")) return "Automation Rules";
    if (pathname.startsWith("/admin/notifications")) return "Notifications";
    if (pathname.startsWith("/admin/audit-logs")) return "Audit Logs";
    if (pathname.startsWith("/admin/settings")) return "Agency Settings";
    if (pathname.startsWith("/admin/dashboard") || pathname === "/admin") return "Agency Admin Dashboard";

    // Intake Portal Routes
    if (pathname.startsWith("/intake/reports")) return "Intake Reports & Analytics";
    if (pathname.startsWith("/intake/pipeline")) return "Intake Pipeline";
    if (pathname.startsWith("/intake/referrals")) return "Intake Referrals";
    if (pathname.startsWith("/intake/inquiries")) return "Intake Inquiries";
    if (pathname.startsWith("/intake/discharge")) return "Discharge Coordination";
    if (pathname.startsWith("/intake/clients")) return "Intake Clients";
    if (pathname.startsWith("/intake/caregivers")) return "Intake Caregivers";
    if (pathname.startsWith("/intake/households")) return "Intake Households";
    if (pathname.startsWith("/intake/settings")) return "Intake Settings";
    if (pathname.startsWith("/intake/dashboard") || pathname === "/intake") return "Intake Coordinator Dashboard";

    // HR Portal Routes
    if (pathname.startsWith("/hr/recruiting")) return "HR Recruiting & Onboarding";
    if (pathname.startsWith("/hr/caregivers")) return "HR Caregiver Roster";
    if (pathname.startsWith("/hr/training")) return "HR Training & LMS";
    if (pathname.startsWith("/hr/payroll")) return "HR Payroll";
    if (pathname.startsWith("/hr/messages")) return "HR Messages";
    if (pathname.startsWith("/hr/dashboard") || pathname === "/hr") return "HR Dashboard";

    // General & Role Routes
    if (pathname.startsWith("/users")) return "User Management";
    if (pathname.startsWith("/training")) return "Training (LMS)";
    if (pathname.startsWith("/clients") || pathname.startsWith("/patients")) return "Clients";
    if (pathname.startsWith("/households")) return "Households";
    if (pathname.startsWith("/scheduling")) return "Scheduling";
    if (pathname.startsWith("/evv")) return "EVV Monitoring";
    if (pathname.startsWith("/caregivers")) return "Caregivers";
    if (pathname.startsWith("/billing")) return "Billing & Claims";
    if (pathname.startsWith("/incidents")) return "Incident & Risk";
    if (pathname.startsWith("/compliance/qa")) return "Quality Assurance";
    if (pathname.startsWith("/compliance/incidents")) return "Incident Reports";
    if (pathname.startsWith("/compliance/reports")) return "Reports";
    if (pathname.startsWith("/compliance/messages")) return "Messages";
    if (pathname.startsWith("/compliance/settings")) return "Settings";
    if (pathname.startsWith("/compliance/tracking")) return "Compliance Tracking";
    if (pathname === "/compliance" || pathname.startsWith("/compliance/dashboard")) return "Compliance Dashboard";
    if (pathname.startsWith("/compliance")) return "Compliance Tracking";
    if (pathname.startsWith("/qa") || pathname.startsWith("/quality-assurance")) return "Quality Assurance";
    if (pathname.startsWith("/reports")) return "Reports";
    if (pathname.startsWith("/referrals")) return "Referrals & Intake";
    if (pathname.startsWith("/communications")) return "Communications";
    if (pathname.startsWith("/payroll")) return "Payroll";
    if (pathname.startsWith("/clinical/patients")) return "Clinical Patients";
    if (pathname.startsWith("/clinical/assessments")) return "Assessments & Care Plan";
    if (pathname.startsWith("/clinical/qa")) return "Quality Assurance";
    if (pathname.startsWith("/clinical/incidents")) return "Incident Reports";
    if (pathname.startsWith("/clinical/messages")) return "Clinical Messages";
    if (pathname.startsWith("/clinical/settings")) return "Settings";
    if (pathname === "/clinical" || pathname.startsWith("/clinical/dashboard")) return "Clinical Dashboard";
    if (pathname.startsWith("/settings")) return "Settings";
    if (pathname.startsWith("/profile")) return "Profile";
    return "Dashboard";
  };

  return (
    <header className="h-16 sm:h-20 px-3 sm:px-6 flex items-center justify-between bg-page-bg/90 backdrop-blur-md sticky top-0 z-30 transition-all duration-300 border-b border-slate-200">
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-1 rounded-xl text-slate-600 hover:bg-slate-200/70 min-[1120px]:hidden transition-colors active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 suppressHydrationWarning className="text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex-1 flex justify-end min-[1120px]:justify-start min-[1120px]:max-w-[480px] mx-1 sm:mx-4 z-40">
          <GlobalSearch />
        </div>

        <NotificationsCenter />
      </div>
    </header>
  );
}
