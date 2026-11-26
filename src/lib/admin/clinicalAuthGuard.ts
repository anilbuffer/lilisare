import { Role } from "@/types/rbac";
import { ClinicalProfessional, ClinicalProfessionalType } from "@/types/clinicalSupervisory";

/**
 * Operational vs. Clinical Authority Boundary
 *
 * Notice: Because this Next.js application deploys with `output: "export"`,
 * there is no live server API runtime yet. To prevent UI-only security assumptions,
 * all mutations pass through this replaceable authorization guard layer so a real
 * server API / RBAC middleware can enforce the exact same contracts without changing UI logic.
 */
export type ClinicalAction =
  | "VIEW_CLINICAL_OVERSIGHT"
  | "CREATE_REQUIREMENT"
  | "EDIT_REQUIREMENT"
  | "CANCEL_REQUIREMENT"
  | "ASSIGN_PROFESSIONAL"
  | "SCHEDULE_VISIT"
  | "RESCHEDULE_VISIT"
  | "CANCEL_VISIT"
  | "REQUEST_DOCUMENTATION"
  | "ADD_OPERATIONAL_NOTE"
  | "CREATE_FOLLOWUP"
  | "COMPLETE_FOLLOWUP"
  | "ESCALATE_ISSUE"
  | "SEND_MOCK_REMINDER"
  | "ASSIGN_CLINICAL_REVIEWER"
  | "MANAGE_RULES"
  | "EXPORT_REPORTS"
  | "SUBMIT_CLINICAL_FINDINGS" // RN / Authorised Clinical Supervisor ONLY
  | "CLINICAL_SIGN_OFF"; // RN / Authorised Clinical Supervisor ONLY

export interface ClinicalActorContext {
  userId: string;
  name: string;
  role: Role;
  roleLabel: string;
  isAuthorizedClinicalSigner: boolean;
}

export interface AuthCheckResult {
  allowed: boolean;
  reason?: string;
}

const ADMIN_ALLOWED_ACTIONS = new Set<ClinicalAction>([
  "VIEW_CLINICAL_OVERSIGHT",
  "CREATE_REQUIREMENT",
  "EDIT_REQUIREMENT",
  "CANCEL_REQUIREMENT",
  "ASSIGN_PROFESSIONAL",
  "SCHEDULE_VISIT",
  "RESCHEDULE_VISIT",
  "CANCEL_VISIT",
  "REQUEST_DOCUMENTATION",
  "ADD_OPERATIONAL_NOTE",
  "CREATE_FOLLOWUP",
  "COMPLETE_FOLLOWUP",
  "ESCALATE_ISSUE",
  "SEND_MOCK_REMINDER",
  "ASSIGN_CLINICAL_REVIEWER",
  "MANAGE_RULES",
  "EXPORT_REPORTS",
]);

const CLINICAL_SIGNER_ACTIONS = new Set<ClinicalAction>([
  "VIEW_CLINICAL_OVERSIGHT",
  "SUBMIT_CLINICAL_FINDINGS",
  "CLINICAL_SIGN_OFF",
  "CREATE_FOLLOWUP",
  "ADD_OPERATIONAL_NOTE",
  "EXPORT_REPORTS",
]);

export function resolveClinicalActor(
  user?: { id?: string; name?: string; role?: Role; role_id?: string } | null
): ClinicalActorContext {
  const role: Role = user?.role || "ADMIN";
  const isClinicalRn =
    role === "CLINICAL_SUPERVISOR_RN" ||
    user?.role_id === "clinical_supervisor_rn";

  return {
    userId: user?.id || "usr-001",
    name: user?.name || "Sarah Jenkins",
    role,
    roleLabel: isClinicalRn
      ? "Clinical Supervisor / RN"
      : role === "QA_COMPLIANCE_OFFICER"
        ? "QA / Compliance Officer"
        : role === "FIELD_SUPERVISOR"
          ? "Field Supervisor"
          : "Agency Administrator",
    isAuthorizedClinicalSigner: isClinicalRn,
  };
}

export function checkClinicalPermission(
  actor: ClinicalActorContext,
  action: ClinicalAction
): AuthCheckResult {
  if (action === "CLINICAL_SIGN_OFF" || action === "SUBMIT_CLINICAL_FINDINGS") {
    if (actor.isAuthorizedClinicalSigner) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason:
        "Permission denied: Clinical findings, assessments, and professional sign-off require an authorised RN or Clinical Supervisor role. Agency Admin cannot perform or impersonate clinical sign-off.",
    };
  }

  if (actor.role === "ADMIN" || actor.role === "INTAKE_COORDINATOR" || actor.role === "SCHEDULER") {
    if (actor.role === "ADMIN" && ADMIN_ALLOWED_ACTIONS.has(action)) {
      return { allowed: true };
    }
    if (
      (actor.role === "SCHEDULER" &&
        (action === "VIEW_CLINICAL_OVERSIGHT" ||
          action === "SCHEDULE_VISIT" ||
          action === "RESCHEDULE_VISIT")) ||
      (actor.role === "INTAKE_COORDINATOR" &&
        (action === "VIEW_CLINICAL_OVERSIGHT" || action === "CREATE_REQUIREMENT"))
    ) {
      return { allowed: true };
    }
  }

  if (actor.role === "CLINICAL_SUPERVISOR_RN") {
    if (CLINICAL_SIGNER_ACTIONS.has(action) || ADMIN_ALLOWED_ACTIONS.has(action)) {
      return { allowed: true };
    }
  }

  if (actor.role === "QA_COMPLIANCE_OFFICER" || actor.role === "FIELD_SUPERVISOR") {
    if (
      action === "VIEW_CLINICAL_OVERSIGHT" ||
      action === "ADD_OPERATIONAL_NOTE" ||
      action === "CREATE_FOLLOWUP" ||
      action === "EXPORT_REPORTS"
    ) {
      return { allowed: true };
    }
  }

  return {
    allowed: false,
    reason: `Role "${actor.roleLabel}" does not have authorization for action "${action}".`,
  };
}

export function assertClinicalPermission(
  actor: ClinicalActorContext,
  action: ClinicalAction
): void {
  const res = checkClinicalPermission(actor, action);
  if (!res.allowed) {
    throw new Error(res.reason || "Unauthorized clinical operation.");
  }
}

/**
 * Validates whether a professional holds the required qualification for a clinical requirement or rule.
 */
export function isProfessionalEligibleForType(
  professional: ClinicalProfessional,
  requiredType: ClinicalProfessionalType
): boolean {
  if (professional.status !== "Active") return false;
  if (requiredType === "RN") {
    return professional.canPerformRnVisits || professional.qualificationType === "RN";
  }
  if (requiredType === "Clinical Supervisor") {
    return (
      professional.qualificationType === "RN" ||
      professional.qualificationType === "Clinical Supervisor"
    );
  }
  if (requiredType === "Field Supervisor") {
    return (
      professional.qualificationType === "RN" ||
      professional.qualificationType === "Clinical Supervisor" ||
      professional.qualificationType === "Field Supervisor"
    );
  }
  // Qualified Non-RN Supervisor permits RN, Clinical Supervisor, Field Supervisor, or Qualified Non-RN Supervisor
  return true;
}
