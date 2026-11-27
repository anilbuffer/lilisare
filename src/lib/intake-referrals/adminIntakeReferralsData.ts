export type ReferralPriority = "Urgent" | "High" | "Standard";

export type ReferralStatus =
  | "New Referral"
  | "Clinical Assessment"
  | "Documents & Auth"
  | "Ready for Staffing"
  | "Enrolled"
  | "Archived";

export interface AdminIntakeReferralItem {
  id: string; // e.g. "REF-2026-1042"
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  referralSource: string; // e.g. "Hospital Discharge (UPMC)", "Primary Care Physician"
  referralSourceContact?: string;
  program: string; // e.g. "Medicaid Waiver (CHC)", "VA Community Care", "Private Pay"
  requestedServices: string[]; // e.g. ["Skilled Nursing", "Home Health Aide"]
  priority: ReferralPriority;
  status: ReferralStatus;
  receivedDate: string; // e.g. "Nov 22, 2026"
  daysInPipeline: number;
  primaryDiagnosis: string;
  triageNotes: string;
  assignedCoordinator: string;
  insuranceVerified: boolean;
  payerName: string;
  targetStartDate: string;
  estimatedHoursPerWeek: number;
  householdCode?: string;
  clientId?: string;
}

export const SEED_ADMIN_REFERRALS: AdminIntakeReferralItem[] = [
  {
    id: "REF-2026-1042",
    patientName: "Eleanor Vance",
    age: 74,
    gender: "Female",
    phone: "(319) 555-3820",
    email: "eleanor.vance@example.com",
    address: "1248 Oakwood Drive",
    city: "Cedar Falls",
    zip: "50613",
    referralSource: "Hospital Discharge (UPMC Mercy)",
    referralSourceContact: "Dr. Karen Vance, Discharge Navigator",
    program: "EBD Waiver (Elderly, Blind, and Disabled)",
    requestedServices: ["Skilled Nursing", "Home Health Aide", "Physical Therapy"],
    priority: "Urgent",
    status: "Clinical Assessment",
    receivedDate: "Nov 22, 2026",
    daysInPipeline: 2,
    primaryDiagnosis: "s/p right hip ORIF, early-stage vascular dementia",
    triageNotes:
      "Prospect discharged after surgical hip repair. Non-weight bearing on right leg for 3 weeks. Urgent RN assessment scheduled to verify home safety and transfer protocols.",
    assignedCoordinator: "Maria Santos, BSN",
    insuranceVerified: true,
    payerName: "ElderBridge Care Network",
    targetStartDate: "Nov 28, 2026",
    estimatedHoursPerWeek: 32,
  },
  {
    id: "REF-2026-1041",
    patientName: "Walter Kowalski",
    age: 79,
    gender: "Male",
    phone: "(541) 555-0199",
    email: "walter.kowalski@example.com",
    address: "742 Evergreen Terrace",
    city: "Springfield",
    zip: "97477",
    referralSource: "Cardiology Specialty Clinic",
    referralSourceContact: "Dr. Aris Thorne, MD",
    program: "Medicaid Waiver (CHC)",
    requestedServices: ["Home Health Aide", "Medication Management", "Companion Care"],
    priority: "High",
    status: "Documents & Auth",
    receivedDate: "Nov 20, 2026",
    daysInPipeline: 4,
    primaryDiagnosis: "Congestive Heart Failure (NYHA Class III), COPD",
    triageNotes:
      "Awaiting final CMA state authorization package for 35 hrs/wk of specialized in-home aide assistance.",
    assignedCoordinator: "Dana Jenkins, MSW",
    insuranceVerified: true,
    payerName: "PA Health & Wellness CHC",
    targetStartDate: "Dec 01, 2026",
    estimatedHoursPerWeek: 35,
  },
  {
    id: "REF-2026-1040",
    patientName: "Arthur Pendelton",
    age: 82,
    gender: "Male",
    phone: "(541) 555-6677",
    email: "arthur.pendelton@example.com",
    address: "889 Silverleaf Road",
    city: "Eugene",
    zip: "97401",
    referralSource: "Hospital Discharge (St. Jude)",
    referralSourceContact: "Mark Sullivan, Care Consultant",
    program: "VA Community Care",
    requestedServices: ["Skilled Nursing", "Mobility Support", "Respite Care"],
    priority: "Urgent",
    status: "New Referral",
    receivedDate: "Nov 25, 2026",
    daysInPipeline: 1,
    primaryDiagnosis: "Post-stroke hemiparesis, Fall Risk",
    triageNotes:
      "New hospital discharge referral received today. Pending initial outreach and RN triage call.",
    assignedCoordinator: "Maria Santos, BSN",
    insuranceVerified: true,
    payerName: "VA Community Care Network (TriWest)",
    targetStartDate: "Nov 29, 2026",
    estimatedHoursPerWeek: 30,
  },
  {
    id: "REF-2026-1039",
    patientName: "Harold Abernathy",
    age: 71,
    gender: "Male",
    phone: "(555) 345-6712",
    email: "h.abernathy@example.com",
    address: "909 Cybernetics Way",
    city: "Los Angeles",
    zip: "90012",
    referralSource: "Rheumatology Associates",
    referralSourceContact: "Dr. Evelyn Reed, MD",
    program: "Private Pay",
    requestedServices: ["Skilled Nursing", "Physical Therapy", "Companion Care"],
    priority: "High",
    status: "Ready for Staffing",
    receivedDate: "Nov 17, 2026",
    daysInPipeline: 6,
    primaryDiagnosis: "Severe Rheumatoid Arthritis, Chronic Pain Management",
    triageNotes:
      "All assessments and financial agreements executed. Ready for caregiver matching before enrollment.",
    assignedCoordinator: "Jessica Taylor",
    insuranceVerified: true,
    payerName: "Private Commercial / Out of Pocket",
    targetStartDate: "Nov 28, 2026",
    estimatedHoursPerWeek: 25,
  },
  {
    id: "REF-2026-1038",
    patientName: "Nadia Al-Mansoor",
    age: 66,
    gender: "Female",
    phone: "(555) 456-7890",
    email: "nadia.almansoor@example.com",
    address: "512 Pinecrest Blvd",
    city: "Allentown",
    zip: "18104",
    referralSource: "Hospital Discharge (St. Luke's)",
    referralSourceContact: "Sarah O'Connor, RN Case Manager",
    program: "Medicaid Waiver (CHC)",
    requestedServices: ["Skilled Nursing", "Home Health Aide", "Medication Management"],
    priority: "Standard",
    status: "Documents & Auth",
    receivedDate: "Nov 15, 2026",
    daysInPipeline: 8,
    primaryDiagnosis: "Type 2 Diabetes, Diabetic Neuropathy",
    triageNotes:
      "Requires daily insulin monitoring and vital sign checks. Pending physician certification statement.",
    assignedCoordinator: "David Kim, MSW",
    insuranceVerified: true,
    payerName: "PA Health & Wellness CHC",
    targetStartDate: "Dec 03, 2026",
    estimatedHoursPerWeek: 20,
  },
  {
    id: "REF-2026-1037",
    patientName: "Mary Smith",
    age: 65,
    gender: "Female",
    phone: "(555) 678-9012",
    email: "mary.smith@example.com",
    address: "123 Main Street",
    city: "Anytown",
    zip: "12345",
    referralSource: "Family / Self Referral",
    referralSourceContact: "Brian Smith (Son)",
    program: "Medicaid Waiver (CHC)",
    requestedServices: ["Companion Care", "Home Health Aide", "Meal Preparation"],
    priority: "Standard",
    status: "Enrolled",
    receivedDate: "Nov 10, 2026",
    daysInPipeline: 14,
    primaryDiagnosis: "General Debility, Mild Cognitive Impairment",
    triageNotes:
      "Successfully enrolled into active client roster. Caregiver assigned and initial EVV visit scheduled.",
    assignedCoordinator: "Jessica Taylor",
    insuranceVerified: true,
    payerName: "AmeriHealth Caritas CHC",
    targetStartDate: "Nov 24, 2026",
    estimatedHoursPerWeek: 18,
    householdCode: "HH-1008",
    clientId: "CL-1008",
  },
  {
    id: "REF-2026-1036",
    patientName: "Beatrice Morales",
    age: 76,
    gender: "Female",
    phone: "(555) 789-4321",
    email: "beatrice.morales@example.com",
    address: "340 Willow Street",
    city: "Bethlehem",
    zip: "18018",
    referralSource: "Primary Care Physician",
    referralSourceContact: "Dr. Howard Stern, MD",
    program: "Medicaid Waiver (CHC)",
    requestedServices: ["Home Health Aide", "Dementia Support"],
    priority: "Standard",
    status: "Clinical Assessment",
    receivedDate: "Nov 19, 2026",
    daysInPipeline: 5,
    primaryDiagnosis: "Early-stage Alzheimer's, Osteoporosis",
    triageNotes:
      "In-person RN assessment scheduled; care plan drafted for primary care physician review.",
    assignedCoordinator: "Maria Santos, BSN",
    insuranceVerified: true,
    payerName: "UPMC Community HealthChoices",
    targetStartDate: "Dec 02, 2026",
    estimatedHoursPerWeek: 24,
  },
  {
    id: "REF-2026-1035",
    patientName: "Evelyn Harper",
    age: 69,
    gender: "Female",
    phone: "(555) 890-1234",
    email: "e.harper@example.com",
    address: "710 Elmwood Terrace",
    city: "Easton",
    zip: "18042",
    referralSource: "Orthopedic Surgery Center",
    referralSourceContact: "Dr. Marcus Vance, DO",
    program: "Private Pay",
    requestedServices: ["Physical Therapy", "Home Health Aide"],
    priority: "Standard",
    status: "New Referral",
    receivedDate: "Nov 24, 2026",
    daysInPipeline: 2,
    primaryDiagnosis: "Total Knee Arthroplasty (TKA) Recovery",
    triageNotes:
      "New orthopedic post-op referral awaiting initial intake verification call.",
    assignedCoordinator: "David Kim, MSW",
    insuranceVerified: false,
    payerName: "Private Pay",
    targetStartDate: "Dec 04, 2026",
    estimatedHoursPerWeek: 15,
  },
];

const ADMIN_REFERRALS_STORAGE_KEY = "lilisare_admin_referrals_v1";

export function getAdminReferralsFromStorage(): AdminIntakeReferralItem[] {
  if (typeof window === "undefined") {
    return SEED_ADMIN_REFERRALS;
  }
  try {
    const raw = localStorage.getItem(ADMIN_REFERRALS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_REFERRALS_STORAGE_KEY, JSON.stringify(SEED_ADMIN_REFERRALS));
      return SEED_ADMIN_REFERRALS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SEED_ADMIN_REFERRALS;
  } catch (err) {
    console.error("Failed to read admin referrals from localStorage", err);
    return SEED_ADMIN_REFERRALS;
  }
}

export function saveAdminReferralsToStorage(referrals: AdminIntakeReferralItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_REFERRALS_STORAGE_KEY, JSON.stringify(referrals));
    window.dispatchEvent(
      new CustomEvent("lilisare_intake_sync", {
        detail: { type: "admin_referrals", count: referrals.length, timestamp: Date.now() },
      })
    );
  } catch (err) {
    console.error("Failed to save admin referrals to localStorage", err);
  }
}

export function getAdminReferralById(id: string): AdminIntakeReferralItem | null {
  const all = getAdminReferralsFromStorage();
  const found = all.find((r) => r.id.toLowerCase() === id.toLowerCase());
  return found || null;
}
