"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRBAC } from "@/lib/rbac/rbacStore";
import { AccessLevel } from "@/lib/rbac/types";

export type PortalPersona = "intake" | "admin";

export interface ModuleCRUDPermissions {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canArchive: boolean;
}

export interface PortalPermissions {
  persona: PortalPersona;
  isAdmin: boolean;
  isIntakeCoordinator: boolean;
  roleId: string;
  roleLabel: string;
  actorName: string;
  baseRoutePrefix: "/intake" | "/admin";
  referrals: ModuleCRUDPermissions & {
    canConvert: boolean;
  };
  clients: ModuleCRUDPermissions & {
    canDischarge: boolean;
    canEditBilling: boolean;
    canEditClinical: boolean;
    canEditAuthorization: boolean;
  };
  caregivers: ModuleCRUDPermissions & {
    canActivate: boolean;
    canViewPayDetails: boolean;
    canEditEmployment: boolean;
  };
  households: ModuleCRUDPermissions & {
    canApproveAuthorization: boolean;
  };
}

/**
 * Resolves strict least-privilege RBAC permissions for the active portal persona
 * (Intake Coordinator vs. Agency Admin) using the active route namespace, auth session,
 * and RBAC matrix.
 */
export function usePortalPermissions(explicitPersona?: PortalPersona): PortalPermissions {
  const pathname = usePathname() || "";
  const { currentUser } = useAuth();
  const { permissions } = useRBAC();

  return useMemo(() => {
    // Route namespace takes precedence for portal isolation; an Intake Coordinator session
    // cannot escalate into Admin privileges even if visiting an /admin route directly.
    const isSessionIntake =
      currentUser?.role === "INTAKE_COORDINATOR" ||
      currentUser?.role_id === "care_intake_coord";

    const isIntakeRoute = pathname.startsWith("/intake");
    const isAdminRoute = pathname.startsWith("/admin");

    let persona: PortalPersona = "admin";
    if (explicitPersona) {
      persona = isSessionIntake ? "intake" : explicitPersona;
    } else if (isSessionIntake || isIntakeRoute) {
      persona = "intake";
    } else if (isAdminRoute) {
      persona = "admin";
    }

    const isIntakeCoordinator = persona === "intake";
    const isAdmin = persona === "admin";
    const roleId = isIntakeCoordinator ? "care_intake_coord" : currentUser?.role_id || "super_admin";

    const getLevel = (moduleId: string, fallback: AccessLevel): AccessLevel => {
      const match = permissions.find(
        (p) => p.role_id === roleId && p.module_id === moduleId
      );
      return match?.access_level ?? fallback;
    };

    const referralsLevel = getLevel("mod_referrals", isAdmin ? "full" : "full");
    const clientsLevel = getLevel("mod_patients", isAdmin ? "full" : "edit");
    const caregiversLevel = getLevel("mod_caregivers", isAdmin ? "full" : "view");
    const billingLevel = getLevel("mod_billing", isAdmin ? "full" : "none");

    return {
      persona,
      isAdmin,
      isIntakeCoordinator,
      roleId,
      roleLabel: isIntakeCoordinator ? "Intake Coordinator" : "Agency Administrator",
      actorName:
        currentUser?.name ||
        (isIntakeCoordinator ? "Elena Rostova (Intake Coordinator)" : "Agency Administrator"),
      baseRoutePrefix: isIntakeCoordinator ? "/intake" : "/admin",
      referrals: {
        canView: referralsLevel !== "none",
        canAdd: referralsLevel === "full" || referralsLevel === "edit",
        canEdit: referralsLevel === "full" || referralsLevel === "edit",
        canArchive: referralsLevel === "full" || referralsLevel === "edit",
        canDelete: isAdmin && referralsLevel === "full",
        canConvert: referralsLevel === "full" || referralsLevel === "edit",
      },
      clients: {
        canView: clientsLevel !== "none",
        canAdd: isAdmin || clientsLevel === "full" || clientsLevel === "edit",
        canEdit: isAdmin || clientsLevel === "full" || clientsLevel === "edit",
        canArchive: isAdmin,
        canDelete: isAdmin && clientsLevel === "full",
        canDischarge: isAdmin,
        canEditBilling: isAdmin && billingLevel !== "none",
        canEditClinical: isAdmin,
        canEditAuthorization: isAdmin,
      },
      caregivers: {
        canView: caregiversLevel !== "none",
        // Intake Coordinator can register prospective/family caregivers into Onboarding,
        // but cannot activate them, edit payroll/classification, or delete records.
        canAdd: isAdmin || isIntakeCoordinator,
        canEdit: isAdmin || isIntakeCoordinator,
        canArchive: isAdmin,
        canDelete: isAdmin && caregiversLevel === "full",
        canActivate: isAdmin,
        canViewPayDetails: isAdmin,
        canEditEmployment: isAdmin,
      },
      households: {
        canView: clientsLevel !== "none",
        canAdd: isAdmin || isIntakeCoordinator,
        canEdit: isAdmin || isIntakeCoordinator,
        canArchive: isAdmin,
        canDelete: isAdmin,
        canApproveAuthorization: isAdmin,
      },
    };
  }, [pathname, currentUser, permissions, explicitPersona]);
}
