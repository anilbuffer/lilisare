import {
  getVisitsFromStorage,
  saveVisitsToStorage,
  SCHEDULING_SYNC_EVENT,
} from "@/lib/scheduling/schedulingStore";
import {
  getEvvVisitsFromStorage,
  saveEvvVisitsToStorage,
  EVV_SYNC_EVENT,
} from "@/lib/admin/evvVisitsStore";
import {
  getCareNotesFromStorage,
  saveCareNotesToStorage,
  CARE_NOTES_SYNC_EVENT,
} from "@/lib/admin/careNotesStore";
import { RealTimeVisit } from "@/types/scheduling";
import { EvvVisitRecord, EvvCaptureMethod } from "@/types/evvVisit";
import { CareNote } from "@/types/careNotes";
import { Visit, VisitVitals } from "./caregiverPortalData";

export const SHIFT_REQUESTS_STORAGE_KEY = "lilisare_caregiver_shift_requests_v1";
export const HIDDEN_OPEN_VISITS_KEY = "lilisare_caregiver_hidden_open_visits_v1";
export const CAREGIVER_SYNC_EVENT = "lilisare_caregiver_portal_sync";

export type ShiftRequestStatus =
  | "Pending Agency Review"
  | "Approved & Published"
  | "Declined by Agency";

export interface CaregiverShiftRequest {
  id: string;
  visitId: string;
  shiftNumber: string;
  clientId: string;
  clientName: string;
  householdName: string;
  address: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  serviceName: string;
  serviceCode: string;
  payRate: number;
  caregiverId: string;
  caregiverName: string;
  status: ShiftRequestStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerNote?: string;
  matchScore: number;
  matchLabel: "Great Match" | "Strong Match" | "Qualified";
}

export interface RecommendedOpenVisit {
  visitId: string;
  shiftNumber: string;
  clientId: string;
  clientName: string;
  householdName: string;
  address: string;
  date: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  timeWindow: string;
  hours: number;
  serviceName: string;
  serviceCode: string;
  payRate: number;
  requiredSkills: string[];
  memo: string;
  matchScore: number;
  matchLabel: "Great Match" | "Strong Match" | "Qualified";
  matchReasons: string[];
  distanceMiles: number;
  requestStatus?: ShiftRequestStatus;
}

export interface WeeklyHoursSummary {
  currentHours: number;
  goalHours: number;
  currentPercent: number;
  pendingRequestHours: number;
}

function dispatchCaregiverSync() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CAREGIVER_SYNC_EVENT));
  }
}

export function subscribeToCaregiverSync(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(CAREGIVER_SYNC_EVENT, handler);
  window.addEventListener(SCHEDULING_SYNC_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CAREGIVER_SYNC_EVENT, handler);
    window.removeEventListener(SCHEDULING_SYNC_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getShiftRequestsFromStorage(): CaregiverShiftRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SHIFT_REQUESTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CaregiverShiftRequest[]) : [];
  } catch {
    return [];
  }
}

export function saveShiftRequestsToStorage(requests: CaregiverShiftRequest[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SHIFT_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
    dispatchCaregiverSync();
  } catch {
    // ignore storage quota errors
  }
}

export function getHiddenOpenVisitIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HIDDEN_OPEN_VISITS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function hideOrDeclineOpenVisit(visitId: string, action: "Decline" | "Hide"): void {
  if (typeof window === "undefined") return;
  const current = getHiddenOpenVisitIds();
  if (!current.includes(visitId)) {
    window.localStorage.setItem(HIDDEN_OPEN_VISITS_KEY, JSON.stringify([...current, visitId]));
  }
  const visits = getVisitsFromStorage();
  const idx = visits.findIndex((v) => v.id === visitId);
  if (idx !== -1) {
    const updated = [...visits];
    updated[idx] = {
      ...updated[idx],
      auditTrail: [
        ...(updated[idx].auditTrail || []),
        {
          id: `aud-cg-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actor: "Maria Santos, CNA",
          actorRole: "Caregiver (Mobile App)",
          action: action === "Decline" ? "Open Visit Declined" : "Open Visit Hidden",
          details: `Caregiver chose to ${action.toLowerCase()} open shift ${updated[idx].shiftNumber}.`,
        },
      ],
    };
    saveVisitsToStorage(updated);
  }
  dispatchCaregiverSync();
}

function formatVisitDateLabel(isoDate: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split("-").map(Number);
  if (parts.length !== 3) return isoDate;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime12h(time24: string): string {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function getRecommendedOpenVisitsForCaregiver(
  caregiverId = "CG-101"
): RecommendedOpenVisit[] {
  const allVisits = getVisitsFromStorage();
  const requests = getShiftRequestsFromStorage();
  const hiddenIds = getHiddenOpenVisitIds();

  const openVisits = allVisits.filter(
    (v) =>
      !v.isRemoved &&
      (v.status === "Unassigned" || !v.caregiverId) &&
      !hiddenIds.includes(v.id)
  );

  return openVisits
    .map((v, idx): RecommendedOpenVisit => {
      const existingReq = requests.find(
        (r) => r.visitId === v.id && r.caregiverId === caregiverId
      );
      const isGreatMatch = idx === 0 || (v.requiredSkills || []).some((s) => s.includes("CNA") || s.includes("Personal Care"));
      const matchScore = isGreatMatch ? 96 : 87;
      const matchLabel = matchScore >= 92 ? "Great Match" : matchScore >= 82 ? "Strong Match" : "Qualified";

      return {
        visitId: v.id,
        shiftNumber: v.shiftNumber,
        clientId: v.clientId,
        clientName: v.clientName,
        householdName: v.householdName,
        address: v.address,
        date: v.date,
        dateLabel: formatVisitDateLabel(v.date),
        startTime: v.startTime,
        endTime: v.endTime,
        timeWindow: `${formatTime12h(v.startTime)} – ${formatTime12h(v.endTime)}`,
        hours: v.scheduledHours,
        serviceName: v.serviceName,
        serviceCode: v.serviceCode,
        payRate: v.payRate || 23.5,
        requiredSkills: v.requiredSkills || [],
        memo: v.memo || "Standard LiliSare care plan coverage.",
        matchScore,
        matchLabel,
        matchReasons: [
          "Active CNA & CPR credentials verified",
          `${v.distanceMiles || 4.2} mi from your North Zone route`,
          "Matches client care plan & language preferences",
        ],
        distanceMiles: v.distanceMiles || 4.2,
        requestStatus: existingReq?.status,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function getCaregiverWeeklyHoursSummary(
  caregiverId = "CG-101",
  goalHours = 20,
  baselineHours = 6.5
): WeeklyHoursSummary {
  const requests = getShiftRequestsFromStorage().filter(
    (r) => r.caregiverId === caregiverId
  );
  const approvedHours = requests
    .filter((r) => r.status === "Approved & Published")
    .reduce((sum, r) => sum + r.hours, 0);
  const pendingRequestHours = requests
    .filter((r) => r.status === "Pending Agency Review")
    .reduce((sum, r) => sum + r.hours, 0);

  const currentHours = Math.round((baselineHours + approvedHours) * 10) / 10;
  const currentPercent = Math.min(100, Math.round((currentHours / goalHours) * 1000) / 10);

  return {
    currentHours,
    goalHours,
    currentPercent,
    pendingRequestHours,
  };
}

/**
 * Step 2 of workflow: Caregiver Requests an Open Visit -> Agency Reviews
 */
export function submitOpenVisitRequest(
  openVisit: RecommendedOpenVisit,
  caregiverId = "CG-101",
  caregiverName = "Maria Santos, CNA"
): CaregiverShiftRequest {
  const requests = getShiftRequestsFromStorage();
  const existing = requests.find(
    (r) => r.visitId === openVisit.visitId && r.caregiverId === caregiverId
  );
  if (existing) return existing;

  const newRequest: CaregiverShiftRequest = {
    id: `REQ-${Date.now()}`,
    visitId: openVisit.visitId,
    shiftNumber: openVisit.shiftNumber,
    clientId: openVisit.clientId,
    clientName: openVisit.clientName,
    householdName: openVisit.householdName,
    address: openVisit.address,
    date: openVisit.date,
    startTime: openVisit.startTime,
    endTime: openVisit.endTime,
    hours: openVisit.hours,
    serviceName: openVisit.serviceName,
    serviceCode: openVisit.serviceCode,
    payRate: openVisit.payRate,
    caregiverId,
    caregiverName,
    status: "Pending Agency Review",
    requestedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    matchScore: openVisit.matchScore,
    matchLabel: openVisit.matchLabel,
  };

  saveShiftRequestsToStorage([newRequest, ...requests]);

  // Also log to scheduling visit auditTrail so Agency Admin/Scheduler sees it immediately
  const visits = getVisitsFromStorage();
  const vIdx = visits.findIndex((v) => v.id === openVisit.visitId);
  if (vIdx !== -1) {
    const updated = [...visits];
    updated[vIdx] = {
      ...updated[vIdx],
      auditTrail: [
        ...(updated[vIdx].auditTrail || []),
        {
          id: `aud-req-${Date.now()}`,
          timestamp: newRequest.requestedAt,
          actor: caregiverName,
          actorRole: "Caregiver (Mobile App)",
          action: "Shift Request Submitted",
          details: `${caregiverName} requested open visit (${openVisit.matchLabel} · ${openVisit.matchScore}%). Pending Agency Review.`,
        },
      ],
    };
    saveVisitsToStorage(updated);
  }

  return newRequest;
}

/**
 * Step 3-6 of workflow: Agency Reviews -> Approved / Declined -> Assignment Published -> Caregiver Notified
 */
export function reviewOpenVisitRequest(
  requestId: string,
  decision: "approve" | "decline",
  reviewerName = "Marcus Vance (Lead Scheduler)",
  note?: string
): CaregiverShiftRequest | null {
  const requests = getShiftRequestsFromStorage();
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx === -1) return null;

  const target = requests[idx];
  const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const updatedReq: CaregiverShiftRequest = {
    ...target,
    status: decision === "approve" ? "Approved & Published" : "Declined by Agency",
    reviewedAt: nowStr,
    reviewedBy: reviewerName,
    reviewerNote:
      note ||
      (decision === "approve"
        ? "Assignment published to caregiver mobile schedule."
        : "Covered by primary household caregiver."),
  };

  const nextRequests = [...requests];
  nextRequests[idx] = updatedReq;
  saveShiftRequestsToStorage(nextRequests);

  // Sync to RealTimeVisit in schedulingStore
  const visits = getVisitsFromStorage();
  const vIdx = visits.findIndex((v) => v.id === target.visitId);
  if (vIdx !== -1) {
    const nextVisits = [...visits];
    const visit = nextVisits[vIdx];
    if (decision === "approve") {
      nextVisits[vIdx] = {
        ...visit,
        status: "Scheduled",
        caregiverId: target.caregiverId,
        caregiverName: target.caregiverName,
        caregiverClass: "CNA / Direct Care Worker (W-2)",
        isModifiedFromSchedule: true,
        modificationReason: "Caregiver Requested Open Shift (Approved)",
        auditTrail: [
          ...(visit.auditTrail || []),
          {
            id: `aud-app-${Date.now()}`,
            timestamp: nowStr,
            actor: reviewerName,
            actorRole: "Agency Scheduler",
            action: "Shift Request Approved & Published",
            details: `Assigned to ${target.caregiverName}. Assignment published to Caregiver Mobile App.`,
          },
        ],
      };
    } else {
      nextVisits[vIdx] = {
        ...visit,
        auditTrail: [
          ...(visit.auditTrail || []),
          {
            id: `aud-dec-${Date.now()}`,
            timestamp: nowStr,
            actor: reviewerName,
            actorRole: "Agency Scheduler",
            action: "Shift Request Declined",
            details: `Declined request from ${target.caregiverName}: ${updatedReq.reviewerNote}`,
          },
        ],
      };
    }
    saveVisitsToStorage(nextVisits);
  }

  return updatedReq;
}

/**
 * Real-time EVV Clock-In Sync -> Scheduling + EVV Monitoring
 */
export function syncCaregiverClockInToAgency(params: {
  visit: Visit;
  clockInTime: string;
  method: "gps" | "ivr" | "fvv";
  reason?: string;
  isLateArrival?: boolean;
  caregiverId?: string;
  caregiverName?: string;
}): void {
  const {
    visit,
    clockInTime,
    method,
    reason,
    isLateArrival = false,
    caregiverId = "CG-101",
    caregiverName = "Maria Santos, CNA",
  } = params;

  const captureMap: Record<"gps" | "ivr" | "fvv", EvvCaptureMethod> = {
    gps: "Mobile GPS",
    ivr: "Telephony / IVR",
    fvv: "Fixed Device",
  };
  const captureMethod = captureMap[method];
  const nowDate = new Date().toISOString().split("T")[0];

  // 1. Update Scheduling Store (RealTimeVisit)
  const schedVisits = getVisitsFromStorage();
  const sIdx = schedVisits.findIndex(
    (sv) =>
      sv.id === visit.id ||
      sv.clientName.toLowerCase() === visit.clientName.toLowerCase()
  );

  if (sIdx !== -1) {
    const updatedSched = [...schedVisits];
    updatedSched[sIdx] = {
      ...updatedSched[sIdx],
      status: "In-Progress",
      evvStatus: isLateArrival ? "Exception" : "Pending",
      clockInActual: clockInTime,
      clockInLocation: "Client Residential Address",
      auditTrail: [
        ...(updatedSched[sIdx].auditTrail || []),
        {
          id: `aud-ci-${Date.now()}`,
          timestamp: clockInTime,
          actor: caregiverName,
          actorRole: "Caregiver (Mobile App)",
          action: "EVV Clock-In Recorded",
          details: `Clocked in via ${captureMethod} at ${clockInTime}.${isLateArrival ? " Flagged as late arrival in EVV Monitoring." : ""}`,
        },
      ],
    };
    saveVisitsToStorage(updatedSched);
  }

  // 2. Upsert EVV Visit Record (for /admin/evv-visits & /evv-monitoring)
  const evvVisits = getEvvVisitsFromStorage();
  const evvId = `EVV-${visit.id}`;
  const eIdx = evvVisits.findIndex(
    (ev) => ev.id === evvId || ev.schedulingVisitId === visit.id
  );

  const newEvvRecord: EvvVisitRecord = {
    id: evvId,
    visitNumber: visit.shiftNumber || "#420",
    date: nowDate,
    schedulingVisitId: visit.id,
    clientId: visit.clientId,
    clientName: visit.clientName,
    clientPhone: visit.phone,
    clientAddress: `${visit.address}, ${visit.cityStateZip}`,
    clientMedicaidId: "CO-MCD-884910",
    householdName: `${visit.clientName.split(" ").pop()} Household`,
    caregiverId,
    caregiverName,
    caregiverPhone: "(555) 382-9102",
    caregiverRole: "Certified Nurse Aide (W-2)",
    caregiverClassification: "W-2",
    serviceName: visit.serviceName || "CNA (Certified Nurse Aide)",
    serviceCode: visit.serviceCode || "T1019",
    payerName: "Colorado Medicaid / Health First Colorado",
    program: "HCBS-EBD",
    authorizationNumber: "AUTH-2026-8841",
    authorizedHours: 4,
    billRate: 36.0,
    payRate: 23.5,
    scheduledStartTime: visit.scheduledStartTime,
    scheduledEndTime: visit.scheduledEndTime,
    scheduledDurationHours: 4,
    actualClockInTime: clockInTime,
    varianceStatus: isLateArrival ? "Outside Tolerance" : "Within Tolerance",
    varianceDisplay: isLateArrival ? "+18m Late Arrival" : "On Schedule (0m)",
    captureMethod,
    visitStatus: "In Progress",
    verificationStatus: isLateArrival ? "Exception" : "Pending",
    aggregatorStatus: "Not Submitted",
    aggregatorProvider: "Sandata / HHAeXchange",
    billingReadiness: "Not Evaluated",
    payrollReadiness: "Not Evaluated",
    geofenceRadiusFeet: 150,
    locationVerificationStatus: method === "gps" ? "Verified" : "Unavailable",
    exceptionType: isLateArrival ? "LATE_OR_EARLY" : undefined,
    exceptionReason: isLateArrival ? "Caregiver clocked in past scheduled start grace period" : undefined,
    tasksCompleted: [],
    careNotes: "",
    clientSignatureCaptured: false,
    clockInLocation: {
      address: `${visit.address}, ${visit.cityStateZip}`,
      lat: visit.clientCoords.lat,
      lng: visit.clientCoords.lng,
      withinGeofence: method === "gps",
      distanceFeet: Math.round((visit.distanceFromClientMiles || 0.04) * 5280),
      timestamp: clockInTime,
      method: captureMethod,
      coordinatesAvailable: method === "gps",
    },
    patientVerification: {
      signatureCaptured: "No",
      voiceVerificationCaptured: "Not applicable",
      patientConfirmedService: "Not captured",
      patientConfirmedTime: "Not captured",
    },
    sixElements: {
      serviceType: { verified: true, value: visit.serviceName || "CNA (T1019)" },
      individualReceiving: { verified: true, value: visit.clientName },
      dateOfService: { verified: true, value: nowDate },
      locationOfService: { verified: true, value: `${visit.address}, ${visit.cityStateZip}` },
      individualProviding: { verified: true, value: caregiverName },
      timeBeginsAndEnds: { verified: false, value: `In: ${clockInTime} / Out: Pending` },
    },
      reviewNotes: [],
    timeline: [
      {
        id: `tl-ci-${Date.now()}`,
        timestamp: clockInTime,
        actor: caregiverName,
        actorRole: "Caregiver (Mobile App)",
        event: "EVV Clock-In",
        details: `Real-time clock-in captured via ${captureMethod}.`,
        badgeType: isLateArrival ? "warning" : "info",
      },
    ],
    corrections: [],
  };

  if (eIdx !== -1) {
    const nextEvv = [...evvVisits];
    nextEvv[eIdx] = { ...nextEvv[eIdx], ...newEvvRecord };
    saveEvvVisitsToStorage(nextEvv);
  } else {
    saveEvvVisitsToStorage([newEvvRecord, ...evvVisits]);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVV_SYNC_EVENT));
  }
}

/**
 * Real-time Clock-Out & Documentation Submit Sync ->
 * Scheduling + EVV Monitoring + Care Notes Review + Payroll/Billing Readiness
 */
export function syncCaregiverClockOutToAgency(params: {
  visit: Visit;
  clockOutTime: string;
  generalNotes: string;
  vitals?: VisitVitals;
  signatureUrl?: string;
  unableToSignReason?: string;
  caregiverId?: string;
  caregiverName?: string;
}): void {
  const {
    visit,
    clockOutTime,
    generalNotes,
    vitals,
    signatureUrl,
    unableToSignReason,
    caregiverId = "CG-101",
    caregiverName = "Maria Santos, CNA",
  } = params;

  const nowDate = new Date().toISOString().split("T")[0];
  const completedTasks = visit.tasks.filter((t) => t.completed);
  const skippedTasks = visit.tasks.filter((t) => t.skipped);

  // 1. Update Scheduling Store
  const schedVisits = getVisitsFromStorage();
  const sIdx = schedVisits.findIndex(
    (sv) =>
      sv.id === visit.id ||
      sv.clientName.toLowerCase() === visit.clientName.toLowerCase()
  );

  if (sIdx !== -1) {
    const updatedSched = [...schedVisits];
    updatedSched[sIdx] = {
      ...updatedSched[sIdx],
      status: "Completed",
      evvStatus: "Verified",
      clockOutActual: clockOutTime,
      careNoteStatus: "Completed",
      careNoteSummary: generalNotes,
      auditTrail: [
        ...(updatedSched[sIdx].auditTrail || []),
        {
          id: `aud-co-${Date.now()}`,
          timestamp: clockOutTime,
          actor: caregiverName,
          actorRole: "Caregiver (Mobile App)",
          action: "Visit Signed & Clocked Out",
          details: `Completed ${completedTasks.length}/${visit.tasks.length} ADL tasks. Care note & EVV submitted for review.`,
        },
      ],
    };
    saveVisitsToStorage(updatedSched);
  }

  // 2. Update EVV Visits Store (Payroll & Billing Readiness)
  const evvVisits = getEvvVisitsFromStorage();
  const evvId = `EVV-${visit.id}`;
  const eIdx = evvVisits.findIndex(
    (ev) => ev.id === evvId || ev.schedulingVisitId === visit.id
  );
  if (eIdx !== -1) {
    const nextEvv = [...evvVisits];
    const prev = nextEvv[eIdx];
    const hasEx = Boolean(prev.exceptionType);
    nextEvv[eIdx] = {
      ...prev,
      actualClockOutTime: clockOutTime,
      actualDurationHours: prev.scheduledDurationHours,
      visitStatus: "Completed",
      verificationStatus: hasEx ? "Under Review" : "Verified",
      billingReadiness: hasEx ? "Ready for Review" : "Cleared for Billing",
      payrollReadiness: hasEx ? "Ready for Review" : "Cleared for Payroll",
      tasksCompleted: completedTasks.map((t) => t.title),
      careNotes: generalNotes,
      clientSignatureCaptured: Boolean(signatureUrl),
      clientSignatureTimestamp: signatureUrl ? clockOutTime : undefined,
      patientVerification: {
        signatureCaptured: signatureUrl ? "Yes" : "No",
        voiceVerificationCaptured: "Not applicable",
        patientConfirmedService: signatureUrl ? "Yes" : "Not captured",
        patientConfirmedTime: signatureUrl ? "Yes" : "Not captured",
        verificationTimestamp: clockOutTime,
        signatureType: signatureUrl ? "Digital Signature" : "Paper Exception Form",
        notes: unableToSignReason,
      },
      sixElements: {
        ...prev.sixElements,
        timeBeginsAndEnds: {
          verified: true,
          value: `In: ${prev.actualClockInTime || visit.clockInTime || "09:30 AM"} / Out: ${clockOutTime}`,
        },
      },
      timeline: [
        ...(prev.timeline || []),
        {
          id: `tl-co-${Date.now()}`,
          timestamp: clockOutTime,
          actor: caregiverName,
          actorRole: "Caregiver (Mobile App)",
          event: "EVV Clock-Out & Certification",
          details: "Caregiver certified visit summary and submitted EVV + Care Note.",
          badgeType: "success",
        },
      ],
    };
    saveEvvVisitsToStorage(nextEvv);
  }

  // 3. Create Care Note in careNotesStore (for /admin/care-notes & /clinical/visit-notes)
  const careNotes = getCareNotesFromStorage();
  const noteId = `CN-${visit.id}-${Date.now().toString().slice(-4)}`;
  const adlLines = visit.tasks
    .map((t) => {
      const status = t.completed
        ? "Completed"
        : t.skipped
          ? `Not Completed (${t.skipReason || "Reason noted"})`
          : "Pending";
      const notePart = t.taskNote ? ` — Note: "${t.taskNote}"` : "";
      return `• ${t.title} [${status}]${notePart}`;
    })
    .join("\n");

  const vitalsText = vitals
    ? `Time: ${vitals.recordedAt} | Temp: ${vitals.temperatureF}°F | Pulse: ${vitals.pulseBpm} bpm | Resp: ${vitals.respirations}/min | BP: ${vitals.bloodPressure} (${vitals.bpLocation}) | O2 Sat: ${vitals.o2Saturation}%`
    : "No vitals required for this shift.";

  const newCareNote: CareNote = {
    id: noteId,
    visitId: visit.id,
    clientId: visit.clientId,
    clientName: visit.clientName,
    caregiverId,
    caregiverName,
    caregiverClassification: "Certified Nurse Aide (W-2)",
    serviceId: "svc-cna",
    serviceType: visit.serviceName || "CNA (Certified Nurse Aide)",
    serviceCode: visit.serviceCode || "T1019",
    programId: "PRG-HCBS",
    programName: "Colorado Medicaid HCBS",
    agencyId: "AGY-DENVER",
    agencyName: "LiliSare Denver Metro",
    serviceDate: nowDate,
    submittedAt: `${nowDate} ${clockOutTime}`,
    scheduledTime: `${visit.scheduledStartTime} - ${visit.scheduledEndTime}`,
    actualVisitTime: `${visit.clockInTime || "09:30 AM"} - ${clockOutTime}`,
    evvStatus: "verified",
    submissionStatus: "submitted",
    reviewStatus: "pending_review",
    qualityStatus: skippedTasks.length > 0 ? "review_required" : "complete",
    correctionStatus: "not_required",
    priority: "medium",
    currentVersion: 1,
    assignedReviewerId: "REV-2",
    assignedReviewerName: "Carlos Mendez, RN",
    createdAt: `${nowDate} ${clockOutTime}`,
    updatedAt: `${nowDate} ${clockOutTime}`,
    sections: [
      {
        id: `${noteId}-sec-1`,
        sectionKey: "adl_tasks",
        sectionTitle: "Care Plan Tasks & ADLs",
        content: adlLines,
        required: true,
        completionStatus: "complete",
      },
      {
        id: `${noteId}-sec-2`,
        sectionKey: "vitals",
        sectionTitle: "Clinical Vitals",
        content: vitalsText,
        required: false,
        completionStatus: "complete",
      },
      {
        id: `${noteId}-sec-3`,
        sectionKey: "general_notes",
        sectionTitle: "General Observations & Client Response",
        content: generalNotes,
        required: true,
        completionStatus: "complete",
      },
    ],
    versions: [],
    reviews: [],
    corrections: [],
    flags: [],
  };

  saveCareNotesToStorage([newCareNote, ...careNotes]);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CARE_NOTES_SYNC_EVENT));
    window.dispatchEvent(new CustomEvent(EVV_SYNC_EVENT));
  }
  dispatchCaregiverSync();
}
