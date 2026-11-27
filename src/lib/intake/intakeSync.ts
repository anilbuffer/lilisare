"use client";

import { InquiryRecord } from "@/types/intake";
import { INITIAL_INQUIRIES } from "./mockIntakeData";
import {
  getClientsFromStorage,
  saveClientsToStorage,
  INITIAL_CLIENTS,
} from "@/lib/clients/mockData";
import {
  getHouseholdsFromStorage,
  saveHouseholdsToStorage,
  MOCK_HOUSEHOLDS,
  Household,
} from "@/lib/households/mockData";
import {
  getCaregiversFromStorage,
  saveCaregiversToStorage,
  INITIAL_CAREGIVERS,
} from "@/lib/caregivers/mockData";
import { ClientRecord } from "@/types/client";
import { CaregiverRecord } from "@/types/caregiver";
import { enrichClientWith17Domains } from "@/lib/clients/enterpriseClientEnricher";

export const INTAKE_STORAGE_KEY = "lilisare_intake_inquiries";
export const INTAKE_SYNC_EVENT = "lilisare_intake_sync";

/**
 * Retrieve inquiries with local storage persistence
 */
export function getIntakeInquiriesFromStorage(): InquiryRecord[] {
  if (typeof window === "undefined") return INITIAL_INQUIRIES;
  try {
    const raw = localStorage.getItem(INTAKE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INTAKE_STORAGE_KEY, JSON.stringify(INITIAL_INQUIRIES));
      return INITIAL_INQUIRIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INQUIRIES;
  } catch (err) {
    console.error("Failed to read inquiries from localStorage", err);
    return INITIAL_INQUIRIES;
  }
}

/**
 * Save inquiries to localStorage and broadcast sync event
 */
export function saveIntakeInquiriesToStorage(inquiries: InquiryRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INTAKE_STORAGE_KEY, JSON.stringify(inquiries));
    window.dispatchEvent(new CustomEvent(INTAKE_SYNC_EVENT, { detail: { timestamp: Date.now() } }));
  } catch (err) {
    console.error("Failed to save inquiries to localStorage", err);
  }
}

/**
 * Subscribe to sync events across tabs and window actions
 */
export function subscribeToIntakeSync(callback: () => void): () => void {
  if (typeof window === "undefined") return () => { };

  const handleCustomSync = () => callback();
  const handleStorageChange = (e: StorageEvent) => {
    if (
      e.key === INTAKE_STORAGE_KEY ||
      e.key === "lilisare_admin_referrals_v1" ||
      e.key === "lilisare_clients_records" ||
      e.key === "lilisare_households_data" ||
      e.key === "lilisare_caregivers_v1"
    ) {
      callback();
    }
  };

  window.addEventListener(INTAKE_SYNC_EVENT, handleCustomSync);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(INTAKE_SYNC_EVENT, handleCustomSync);
    window.removeEventListener("storage", handleStorageChange);
  };
}

/**
 * Convert an Inquiry into full Client, Caregiver, and Household records,
 * synchronizing immediately with Agency Admin.
 */
export function convertInquiryToLiveEntities(
  inquiryId: string,
  options: { createClient: boolean; createCaregiver: boolean } = {
    createClient: true,
    createCaregiver: true,
  }
): { success: boolean; client?: ClientRecord; caregiver?: CaregiverRecord; household?: Household } {
  const inquiries = getIntakeInquiriesFromStorage();
  const index = inquiries.findIndex((i) => i.id.toLowerCase() === inquiryId.toLowerCase());
  if (index === -1) return { success: false };

  const inquiry = inquiries[index];
  const newClientId = `CL-${Math.floor(1050 + Math.random() * 50)}`;
  const newHouseholdCode = `HH-${Math.floor(1050 + Math.random() * 50)}`;
  const newHouseholdId = newHouseholdCode.toLowerCase();
  const newCaregiverId = `CG-${Math.floor(2050 + Math.random() * 50)}`;

  let createdClient: ClientRecord | undefined;
  let createdCaregiver: CaregiverRecord | undefined;
  let createdHousehold: Household | undefined;

  // 1. Create or link Client in Agency Admin (prevent duplicate by ID or name)
  if (options.createClient) {
    const clients = getClientsFromStorage();
    const rawName = inquiry.familyInfo.clientInfo.name || "Client Name";
    const existingClient = clients.find(
      (c) =>
        (inquiry.onboardingStatus?.clientProfileId &&
          c.id.toLowerCase() === inquiry.onboardingStatus.clientProfileId.toLowerCase()) ||
        c.name.trim().toLowerCase() === rawName.trim().toLowerCase()
    );
    if (existingClient) {
      createdClient = existingClient;
    } else {
      const nameParts = rawName.trim().split(" ");
      const firstName = nameParts[0] || "Client";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Recipient";
      const clientGender = inquiry.familyInfo.clientInfo.gender || "Female";
      const autoTitle = clientGender === "Female" ? "Ms." : "Mr.";
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const assignedAdmin =
        inquiry.referralInfo?.assignedCoordinator?.name ||
        "Dana Jenkins, MSW";
      const region = inquiry.branch || "North Metro";
      const referredBySource =
        (inquiry.referralInfo?.source || inquiry.source || "Intake Referral") +
        (inquiry.referralInfo?.organization ? ` (${inquiry.referralInfo.organization})` : "");
      const medicaidNo = `MED-${randomSuffix}93`;

      const rawClient: ClientRecord = {
        id: newClientId,
        originReferralId: inquiry.id,
        title: autoTitle,
        firstName,
        lastName,
        name: rawName,
        preferredName: firstName,
        avatarUrl: "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&q=80&w=200",
        dob: inquiry.familyInfo.clientInfo.dob || "1980-01-01",
        age: inquiry.familyInfo.clientInfo.age || 45,
        gender: clientGender,
        primaryLanguage: inquiry.familyInfo.clientInfo.primaryLanguage || "English",
        ssn: `***-**-${randomSuffix}`,
        status: "Active",
        careType: "Family Care",
        household: {
          id: newHouseholdId,
          code: newHouseholdCode,
          name: inquiry.familyName,
          address: inquiry.familyInfo.householdLocation.address,
          city: inquiry.familyInfo.householdLocation.city,
          state: inquiry.familyInfo.householdLocation.state,
          zip: inquiry.familyInfo.householdLocation.zip,
          phone: inquiry.familyInfo.phone,
          totalMembersCount: 2,
        },
        agencyInfo: {
          status: "Active",
          leadCreatedDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
          initialAssessmentDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
          conversionDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
          startDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
          effectiveEndDate: "12/31/2026",
          administrator: assignedAdmin,
          regionCode: region,
          referredBy: referredBySource,
          medicaidNumber: medicaidNo,
          preferredCaregiver: inquiry.familyInfo.potentialCaregiver?.name || "Wilson Martin",
          adminAlerts: {
            disableClockInAlert: false,
            disableClockOutAlert: false,
          },
          invoicingId: `INV-${newClientId}`,
        },
        residentialAddress: {
          name: rawName,
          address: inquiry.familyInfo.householdLocation.address,
          address2: "",
          city: inquiry.familyInfo.householdLocation.city,
          state: inquiry.familyInfo.householdLocation.state,
          zip: inquiry.familyInfo.householdLocation.zip,
          verified: true,
        },
        billingAddress: {
          sameAsResidential: true,
          name: inquiry.familyInfo.primaryContact || rawName,
          address: inquiry.familyInfo.householdLocation.address,
          address2: "",
          city: inquiry.familyInfo.householdLocation.city,
          state: inquiry.familyInfo.householdLocation.state,
          zip: inquiry.familyInfo.householdLocation.zip,
        },
        primaryContact: {
          name: inquiry.familyInfo.primaryContact,
          relationship: inquiry.familyInfo.relationship,
          phone: inquiry.familyInfo.phone,
          email: inquiry.familyInfo.email,
          preferredMethod: (inquiry.familyInfo.preferredContactMethod as "Phone" | "Email" | "SMS") || "Phone",
        },
        emergencyContact: {
          name: inquiry.familyInfo.primaryContact,
          relationship: inquiry.familyInfo.relationship,
          phone: inquiry.familyInfo.phone,
        },
        responsibleParties: [
          {
            id: `RP-${newClientId}-1`,
            name: inquiry.familyInfo.primaryContact,
            relationship: inquiry.familyInfo.relationship,
            phone: inquiry.familyInfo.phone,
            email: inquiry.familyInfo.email,
            address: `${inquiry.familyInfo.householdLocation.address}, ${inquiry.familyInfo.householdLocation.city}, ${inquiry.familyInfo.householdLocation.state}`,
            isPrimaryDecisionMaker: true,
            isBillingContact: true,
            isEmergencyContact: true,
            hipaaAuthorized: true,
            notes: "Primary authorized representative from intake referral.",
          },
        ],
        assignedCareTeam: {
          primaryCaregiver: inquiry.familyInfo.potentialCaregiver?.name
            ? {
              id: newCaregiverId,
              name: inquiry.familyInfo.potentialCaregiver.name,
              relationship: inquiry.familyInfo.potentialCaregiver.relationship,
              classification: (inquiry.familyInfo.potentialCaregiver.classificationInterest as "W-2" | "1099") || "W-2",
              status: "Onboarding",
              phone: inquiry.familyInfo.potentialCaregiver.phone || inquiry.familyInfo.phone,
              email: inquiry.familyInfo.email,
              hireDate: new Date().toISOString().slice(0, 10),
            }
            : null,
          familyContact: {
            id: `FC-${Math.floor(200 + Math.random() * 50)}`,
            name: inquiry.familyInfo.primaryContact,
            relationship: inquiry.familyInfo.relationship,
            phone: inquiry.familyInfo.phone,
            email: inquiry.familyInfo.email,
          },
          caseManager: inquiry.referralInfo?.caseManager
            ? {
              name: inquiry.referralInfo.caseManager.name,
              agency: inquiry.referralInfo.caseManager.agency || "State Medicaid Agency",
              phone: inquiry.referralInfo.caseManager.phone || "(555) 010-0000",
              email: inquiry.referralInfo.caseManager.email || "casemanager@dhs.gov",
            }
            : undefined,
        },
        readiness: {
          clientProfile: "Complete",
          careArrangement: "Pending",
          documents: "Review needed",
          authorization: "Pending",
          overallScore: 65,
        },
        carePlan: {
          program: inquiry.careRequirements?.programInterest || "Pediatric In-Home Care (Medicaid EPSDT)",
          approvedServices: inquiry.careRequirements?.careType || ["Personal Care", "Companion Support"],
          authorizedWeeklyHours: inquiry.careRequirements?.hoursPerWeek || 25,
          scheduledWeeklyHours: 0,
          hoursUsedThisWeek: 0,
          effectiveDate: new Date().toISOString().slice(0, 10),
          reviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          needsReview: false,
          frequency: "Monday - Friday",
          careNeeds: inquiry.careRequirements?.careType || ["ADL Support"],
          specialInstructions: inquiry.careRequirements?.supportRequirements || "Standard ADL support",
          mobilityNotes: inquiry.familyInfo.clientInfo.mobilityNotes || "Needs standby assistance",
          dietaryRestrictions: "None reported",
          allergies: [],
          adlSupportNeeds: ["Bathing", "Dressing", "Transfer"],
        },
        authorization: {
          authNumber: `AUTH-${Math.floor(7000 + Math.random() * 500)}`,
          payer: inquiry.careRequirements?.programInterest || "Georgia Medicaid Waiver (CCSP)",
          status: "Pending Renewal",
          startDate: new Date().toISOString().slice(0, 10),
          expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          daysUntilExpiry: 180,
          totalUnitsApproved: (inquiry.careRequirements?.hoursPerWeek || 25) * 4 * 6,
          unitsUsed: 0,
          unitsRemaining: (inquiry.careRequirements?.hoursPerWeek || 25) * 4 * 6,
          weeklyHourCap: inquiry.careRequirements?.hoursPerWeek || 25,
          caseManagerName: inquiry.referralInfo?.caseManager?.name || "Assigned Case Manager",
          caseManagerAgency: inquiry.referralInfo?.caseManager?.agency || "State Medicaid DHS",
        },
        documents: [],
        householdMembers: [
          {
            id: `hm-1`,
            name: inquiry.familyInfo.clientInfo.name,
            relationship: "Care Recipient",
            role: "Care Recipient",
            phone: inquiry.familyInfo.phone,
            email: inquiry.familyInfo.email,
            permissions: ["View Care Plan"],
            isPrimaryDecisionMaker: false,
          },
          {
            id: `hm-2`,
            name: inquiry.familyInfo.primaryContact,
            relationship: inquiry.familyInfo.relationship,
            role: "Parent / Legal Guardian",
            phone: inquiry.familyInfo.phone,
            email: inquiry.familyInfo.email,
            permissions: ["Full Administrative Access", "Sign Consents"],
            isPrimaryDecisionMaker: true,
          },
        ],
        activity: [
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: "status_change",
            author: "Intake Coordinator",
            authorRole: "Intake Coordinator",
            title: "Client Registered from Intake",
            details: `Registered client profile from inquiry ${inquiry.id}.`,
          },
        ],
        attentionItems: [],
        updatedAt: new Date().toISOString(),
        updatedAtRelative: "Just now",
        convertedFromInquiryId: inquiry.id,
      };

      createdClient = enrichClientWith17Domains(rawClient);
      saveClientsToStorage([createdClient, ...clients]);
    }
  }

  // 2. Create or link Caregiver in Agency Admin
  if (options.createCaregiver && inquiry.familyInfo.potentialCaregiver?.name) {
    const caregivers = getCaregiversFromStorage();
    const classification = inquiry.familyInfo.potentialCaregiver.classificationInterest === "1099" ? "1099" : "W-2";
    createdCaregiver = {
      id: newCaregiverId,
      name: inquiry.familyInfo.potentialCaregiver.name,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      type: "Family Caregiver",
      status: "Onboarding",
      pipelineStage: "Hired & Onboarding",
      branch: inquiry.branch || "North Metro",
      hireDate: new Date().toISOString().slice(0, 10),
      employmentClassification: classification,
      verificationChecklist: {
        identity: "Verified",
        screening: "In Review",
        cprFirstAid: "Missing",
        training: "In Progress",
      },
      assignmentStatus: "Assigned",
      personalInfo: {
        dob: "1985-06-15",
        gender: "Female",
        languages: ["English"],
        phone: inquiry.familyInfo.potentialCaregiver.phone || inquiry.familyInfo.phone,
        email: inquiry.familyInfo.email,
        address: {
          street: inquiry.familyInfo.householdLocation.address,
          city: inquiry.familyInfo.householdLocation.city,
          state: inquiry.familyInfo.householdLocation.state,
          zip: inquiry.familyInfo.householdLocation.zip,
        },
        emergencyContact: {
          name: inquiry.familyInfo.primaryContact,
          relationship: inquiry.familyInfo.relationship,
          phone: inquiry.familyInfo.phone,
        },
        preferredCommunication: "Phone",
        maskedIdentifiers: {
          ssnMasked: "***-**-5921",
          driversLicenseMasked: "DL-***-401",
          taxIdMasked: "TIN-***-882",
        },
      },
      relationship: {
        caregiverType: "Family Caregiver",
        relationshipToClient: inquiry.familyInfo.potentialCaregiver.relationship,
        linkedHousehold: {
          id: newHouseholdId,
          code: newHouseholdCode,
          name: inquiry.familyName,
          address: inquiry.familyInfo.householdLocation.address,
          phone: inquiry.familyInfo.phone,
          city: inquiry.familyInfo.householdLocation.city,
          state: inquiry.familyInfo.householdLocation.state,
        },
        relationshipVerificationStatus: "Pending Review",
        householdPermissions: ["Access Schedule", "Care Notes"],
        caregivingBoundaries: "Family in-home care delivery",
      },
      documentsCredentials: {
        overallStatus: "Missing",
        cprExpiryDate: "2027-01-01",
        tbTestExpiryDate: "2027-01-01",
        items: [],
      },
      screeningTraining: {
        backgroundCheck: {
          status: "In Review",
          referenceNumber: `BGC-${Math.floor(8000 + Math.random() * 500)}`,
          provider: "Sterling Healthcare Triage",
          renewalDate: "2027-11-20",
        },
        screenings: [],
        trainingCourses: [],
        overallTrainingStatus: "In Progress",
        trainingHoursCompleted: 2,
        trainingHoursRequired: 16,
        screeningReviewDecisions: [],
      },
      availabilityAssignments: {
        weeklyCapacityHours: 40,
        scheduledWeeklyHours: 0,
        availabilitySchedule: [],
        assignmentHistory: [],
        assignedClient: {
          id: newClientId,
          name: inquiry.familyInfo.clientInfo.name,
          householdId: newHouseholdId,
          householdName: inquiry.familyName,
          relationship: inquiry.familyInfo.potentialCaregiver.relationship,
          weeklyAuthorizedHours: inquiry.careRequirements.hoursPerWeek || 25,
          scheduledWeeklyHours: 0,
          startDate: new Date().toISOString().slice(0, 10),
          status: "Pending Setup",
        },
      },
      evvVisitHistory: {
        overallComplianceRate: 0,
        totalVisitsCompleted: 0,
        gpsVerificationRate: 0,
        missedClockOutCount: 0,
        isRestrictedEVV: false,
        recentVisits: [],
      },
      activityHistory: {
        recentUpdates: [
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            relativeTime: "Just now",
            title: "Caregiver Profile Created from Intake",
            description: `Caregiver registered via inquiry ${inquiry.id}.`,
            actor: "Intake Coordinator",
            type: "profile",
          },
        ],
      },
    };
    if (createdCaregiver) {
      saveCaregiversToStorage([createdCaregiver, ...caregivers]);
    }
  }

  // 3. Create or link Household in Agency Admin
  const households = getHouseholdsFromStorage();
  createdHousehold = {
    id: newHouseholdId,
    code: newHouseholdCode,
    name: inquiry.familyName,
    address: inquiry.familyInfo.householdLocation.address,
    city: inquiry.familyInfo.householdLocation.city,
    state: inquiry.familyInfo.householdLocation.state,
    zip: inquiry.familyInfo.householdLocation.zip,
    phone: inquiry.familyInfo.phone,
    program: "Medicaid Waiver",
    caseManager: {
      name: inquiry.referralInfo.caseManager?.name || "Assigned Case Manager",
      agency: inquiry.referralInfo.caseManager?.agency || "State Department of Human Services",
      email: inquiry.referralInfo.caseManager?.email || "casemanager@dhs.state.gov",
      phone: inquiry.referralInfo.caseManager?.phone || "(555) 012-3456",
    },
    client: {
      id: newClientId,
      name: inquiry.familyInfo.clientInfo.name,
      role: "client",
      relationship: "Care Recipient",
      status: "Onboarding",
      phone: inquiry.familyInfo.phone,
      email: inquiry.familyInfo.email,
    },
    primaryCaregiver: {
      id: newCaregiverId,
      name: inquiry.familyInfo.potentialCaregiver?.name || "Primary Caregiver",
      role: "caregiver",
      relationship: inquiry.familyInfo.potentialCaregiver?.relationship || "Family Caregiver",
      status: "Onboarding",
      phone: inquiry.familyInfo.potentialCaregiver?.phone || inquiry.familyInfo.phone,
      email: inquiry.familyInfo.email,
    },
    authorizedHoursPerWeek: inquiry.careRequirements.hoursPerWeek || 25,
    scheduledHoursPerWeek: 0,
    authStatus: "Pending Review",
    authExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    triJourneyStatus: {
      clientStage: "Registered",
      caregiverStage: "Screening",
      opsStage: "Coordination",
      bottleneckMessage: "Background check and CMA authorization pending",
    },
    evvComplianceRate: 0,
    lastVisitDate: "Pending Activation",
  };
  saveHouseholdsToStorage([createdHousehold, ...households]);

  // 4. Update the Inquiry in Intake storage
  const updatedInquiries = [...inquiries];
  updatedInquiries[index] = {
    ...inquiry,
    stage: "Converted",
    onboardingStatus: {
      converted: true,
      convertedAt: new Date().toISOString(),
      clientProfileId: newClientId,
      caregiverProfileId: newCaregiverId,
    },
    timeline: [
      {
        id: `t-${Date.now()}`,
        type: "status_change",
        author: "Intake Coordinator",
        authorRole: "Intake Coordinator",
        timestamp: "Just now",
        title: "Inquiry Converted & Synced to Agency Admin",
        details: `Created Client ${newClientId}, Household ${newHouseholdCode}, and Caregiver ${newCaregiverId}.`,
      },
      ...inquiry.timeline,
    ],
  };

  saveIntakeInquiriesToStorage(updatedInquiries);

  // Also synchronize matching record in Agency Admin Referrals storage if present
  try {
    const adminRaw = localStorage.getItem("lilisare_admin_referrals_v1");
    if (adminRaw) {
      const adminList = JSON.parse(adminRaw);
      if (Array.isArray(adminList)) {
        const numericSuffix = inquiry.id.replace(/\D/g, "");
        const updatedAdmin = adminList.map((ref: { id?: string; patientName?: string; status?: string }) => {
          const matchesId =
            ref.id?.toLowerCase() === inquiry.id.toLowerCase() ||
            (numericSuffix && ref.id?.endsWith(`-${numericSuffix}`));
          const matchesName =
            ref.patientName?.toLowerCase() === inquiry.familyInfo.clientInfo.name.toLowerCase();
          if (matchesId || matchesName) {
            return {
              ...ref,
              status: "Enrolled",
              clientId: newClientId,
              householdCode: newHouseholdCode,
            };
          }
          return ref;
        });
        localStorage.setItem("lilisare_admin_referrals_v1", JSON.stringify(updatedAdmin));
        window.dispatchEvent(new CustomEvent(INTAKE_SYNC_EVENT, { detail: { timestamp: Date.now() } }));
      }
    }
  } catch (err) {
    console.error("Failed to sync conversion with admin referrals store", err);
  }

  return {
    success: true,
    client: createdClient,
    caregiver: createdCaregiver,
    household: createdHousehold,
  };
}

/**
 * Sync an Inquiry stage change from Intake Coordinator to Agency Admin Referrals store
 */
export function syncInquiryStageToAdmin(inquiryId: string, newStage: string): void {
  if (typeof window === "undefined") return;
  try {
    const statusMap: Record<string, string> = {
      "New Inquiry": "New Referral",
      "New Lead": "New Referral",
      "Contacted": "New Referral",
      "Needs Discussion": "Clinical Assessment",
      "In Assessment": "Clinical Assessment",
      "CMA Coordination": "Documents & Auth",
      "CM Coordination": "Documents & Auth",
      "Family Decision": "Ready for Staffing",
      "Converted": "Enrolled",
      "Closed": "Archived",
    };
    const mappedStatus = statusMap[newStage] || "New Referral";
    const adminRaw = localStorage.getItem("lilisare_admin_referrals_v1");
    if (!adminRaw) return;
    const adminList = JSON.parse(adminRaw);
    if (!Array.isArray(adminList)) return;
    const numericSuffix = inquiryId.replace(/\D/g, "");
    const updated = adminList.map((ref: { id?: string }) => {
      if (
        ref.id?.toLowerCase() === inquiryId.toLowerCase() ||
        (numericSuffix && ref.id?.endsWith(`-${numericSuffix}`))
      ) {
        return { ...ref, status: mappedStatus };
      }
      return ref;
    });
    localStorage.setItem("lilisare_admin_referrals_v1", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(INTAKE_SYNC_EVENT, { detail: { timestamp: Date.now() } }));
  } catch (err) {
    console.error("Failed to sync inquiry stage to admin referrals", err);
  }
}

/**
 * Archive (soft-close) an Inquiry/Referral across both stores (permitted for Intake Coordinator & Admin)
 */
export function archiveReferralAcrossStores(id: string, reason = "Archived by coordinator"): void {
  if (typeof window === "undefined") return;
  const numericSuffix = id.replace(/\D/g, "");

  const inquiries = getIntakeInquiriesFromStorage();
  const updatedInquiries = inquiries.map((inq) => {
    if (
      inq.id.toLowerCase() === id.toLowerCase() ||
      (numericSuffix && inq.id.endsWith(`-${numericSuffix}`))
    ) {
      return {
        ...inq,
        stage: "Closed" as const,
        timeline: [
          {
            id: `t-${Date.now()}`,
            type: "status_change" as const,
            author: "Intake Staff",
            timestamp: "Just now",
            title: "Inquiry Archived / Closed",
            details: reason,
          },
          ...inq.timeline,
        ],
      };
    }
    return inq;
  });
  saveIntakeInquiriesToStorage(updatedInquiries);

  try {
    const adminRaw = localStorage.getItem("lilisare_admin_referrals_v1");
    if (adminRaw) {
      const adminList = JSON.parse(adminRaw);
      if (Array.isArray(adminList)) {
        const updatedAdmin = adminList.map((ref: { id?: string }) => {
          if (
            ref.id?.toLowerCase() === id.toLowerCase() ||
            (numericSuffix && ref.id?.endsWith(`-${numericSuffix}`))
          ) {
            return { ...ref, status: "Archived" };
          }
          return ref;
        });
        localStorage.setItem("lilisare_admin_referrals_v1", JSON.stringify(updatedAdmin));
        window.dispatchEvent(new CustomEvent(INTAKE_SYNC_EVENT, { detail: { timestamp: Date.now() } }));
      }
    }
  } catch (err) {
    console.error("Failed to archive admin referral", err);
  }
}

/**
 * Hard-delete a Referral/Inquiry across both stores (Agency Admin only)
 */
export function deleteReferralAcrossStores(id: string): void {
  if (typeof window === "undefined") return;
  const numericSuffix = id.replace(/\D/g, "");

  const inquiries = getIntakeInquiriesFromStorage();
  const filteredInquiries = inquiries.filter(
    (inq) =>
      inq.id.toLowerCase() !== id.toLowerCase() &&
      !(numericSuffix && inq.id.endsWith(`-${numericSuffix}`))
  );
  saveIntakeInquiriesToStorage(filteredInquiries);

  try {
    const adminRaw = localStorage.getItem("lilisare_admin_referrals_v1");
    if (adminRaw) {
      const adminList = JSON.parse(adminRaw);
      if (Array.isArray(adminList)) {
        const filteredAdmin = adminList.filter(
          (ref: { id?: string }) =>
            ref.id?.toLowerCase() !== id.toLowerCase() &&
            !(numericSuffix && ref.id?.endsWith(`-${numericSuffix}`))
        );
        localStorage.setItem("lilisare_admin_referrals_v1", JSON.stringify(filteredAdmin));
        window.dispatchEvent(new CustomEvent(INTAKE_SYNC_EVENT, { detail: { timestamp: Date.now() } }));
      }
    }
  } catch (err) {
    console.error("Failed to delete admin referral", err);
  }
}

/**
 * Delete a Client record from live storage (Agency Admin only)
 */
export function deleteClientFromStorage(clientId: string): void {
  if (typeof window === "undefined") return;
  const clients = getClientsFromStorage();
  const filtered = clients.filter((c) => c.id.toLowerCase() !== clientId.toLowerCase());
  saveClientsToStorage(filtered);
}

/**
 * Delete a Caregiver record from live storage (Agency Admin only)
 */
export function deleteCaregiverFromStorage(caregiverId: string): void {
  if (typeof window === "undefined") return;
  const caregivers = getCaregiversFromStorage();
  const filtered = caregivers.filter((c) => c.id.toLowerCase() !== caregiverId.toLowerCase());
  saveCaregiversToStorage(filtered);
}

/**
 * Delete a Household record from live storage (Agency Admin only)
 */
export function deleteHouseholdFromStorage(householdId: string): void {
  if (typeof window === "undefined") return;
  const households = getHouseholdsFromStorage();
  const filtered = households.filter(
    (h) =>
      h.id.toLowerCase() !== householdId.toLowerCase() &&
      h.code.toLowerCase() !== householdId.toLowerCase()
  );
  saveHouseholdsToStorage(filtered);
}

/**
 * Get synchronized operational metrics across all 4 LiliSare Intake pillars
 */
export function getSyncedIntakeMetrics() {
  const inquiries = getIntakeInquiriesFromStorage();
  const clients = getClientsFromStorage();
  const households = getHouseholdsFromStorage();
  const caregivers = getCaregiversFromStorage();

  // Pillar 1: Intake & Referrals
  const newInquiries = inquiries.filter((i) => i.stage === "New Inquiry" || i.stage === "New Lead");
  const inAssessment = inquiries.filter(
    (i) => i.stage === "Needs Discussion" || i.stage === "CMA Coordination" || i.stage === "In Assessment"
  );
  const converted = inquiries.filter((i) => i.stage === "Converted");
  const hospitalDischarges = inquiries.filter((i) => i.source === "Hospital Discharge");
  const urgentCount = inquiries.filter((i) => i.urgency === "Immediate" || i.urgency === "Urgent");

  // Pillar 2: Clients
  const activeClients = clients.filter((c) => c.status === "Active");
  const onboardingClients = clients.filter((c) => c.status === "Onboarding");
  const pendingAuthClients = clients.filter(
    (c) => c.authorization?.status === "Pending Renewal" || c.readiness?.authorization === "Pending"
  );

  // Pillar 3: Households
  const onboardingHouseholds = households.filter((h) => h.triJourneyStatus.opsStage === "Intake" || h.triJourneyStatus.opsStage === "Coordination");
  const delayedHouseholds = households.filter((h) => Boolean(h.triJourneyStatus.bottleneckMessage));

  // Pillar 4: Caregivers
  const onboardingCaregivers = caregivers.filter((c) => c.status === "Onboarding" || c.status === "Pending");
  const w2Caregivers = caregivers.filter((c) => c.employmentClassification === "W-2");
  const contract1099Caregivers = caregivers.filter((c) => c.employmentClassification === "1099");
  const screeningPending = caregivers.filter((c) => c.verificationChecklist?.screening !== "Cleared");

  return {
    intake: {
      total: inquiries.length,
      newCount: newInquiries.length,
      inAssessmentCount: inAssessment.length,
      convertedCount: converted.length,
      hospitalDischargeCount: hospitalDischarges.length,
      urgentCount: urgentCount.length,
    },
    clients: {
      total: clients.length,
      activeCount: activeClients.length,
      onboardingCount: onboardingClients.length,
      pendingAuthCount: pendingAuthClients.length,
    },
    households: {
      total: households.length,
      onboardingCount: onboardingHouseholds.length,
      delayedCount: delayedHouseholds.length,
    },
    caregivers: {
      total: caregivers.length,
      onboardingCount: onboardingCaregivers.length,
      w2Count: w2Caregivers.length,
      contract1099Count: contract1099Caregivers.length,
      screeningPendingCount: screeningPending.length,
    },
  };
}
