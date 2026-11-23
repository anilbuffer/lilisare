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
    patientName: "Eleanor Ruth Whitfield",
    age: 78,
    gender: "Female",
    phone: "(555) 234-8901",
    email: "whitfield.family@example.com",
    address: "214 Maple Ridge Lane",
    city: "Cedar Falls",
    zip: "19087",
    referralSource: "Hospital Discharge (UPMC Mercy)",
    referralSourceContact: "Dr. Karen Vance, Discharge Navigator",
    program: "Medicaid Waiver (CHC)",
    requestedServices: ["Skilled Nursing", "Home Health Aide", "Physical Therapy"],
    priority: "Urgent",
    status: "Clinical Assessment",
    receivedDate: "Nov 22, 2026",
    daysInPipeline: 2,
    primaryDiagnosis: "s/p right hip ORIF, early-stage vascular dementia",
    triageNotes:
      "Patient discharged after surgical hip repair. Non-weight bearing on right leg for 3 weeks. Urgent nursing assessment scheduled to verify home safety and transfer protocols.",
    assignedCoordinator: "Maria Santos, BSN",
    insuranceVerified: true,
    payerName: "UPMC Community HealthChoices",
    targetStartDate: "Nov 26, 2026",
    estimatedHoursPerWeek: 35,
    householdCode: "HH-1002",
    clientId: "CL-1002",
  },
  {
    id: "REF-2026-1041",
    patientName: "Leo Miller",
    age: 8,
    gender: "Male",
    phone: "(541) 555-0199",
    email: "sarah.miller@example.com",
    address: "742 Evergreen Terrace",
    city: "Springfield",
    zip: "97477",
    referralSource: "Pediatric Specialty Clinic",
    referralSourceContact: "Dr. Aris Thorne, MD",
    program: "Pediatric Special Care (CES Waiver)",
    requestedServices: ["Home Health Aide", "Occupational Therapy", "Companion Care"],
    priority: "High",
    status: "Documents & Auth",
    receivedDate: "Nov 20, 2026",
    daysInPipeline: 4,
    primaryDiagnosis: "Autism Spectrum Disorder (Level 2), Sensory Processing",
    triageNotes:
      "Awaiting final CMA state authorization package for 40 hrs/wk of specialized pediatric in-home aide assistance.",
    assignedCoordinator: "David Kim, MSW",
    insuranceVerified: true,
    payerName: "State Medicaid Pediatric Waiver",
    targetStartDate: "Dec 01, 2026",
    estimatedHoursPerWeek: 40,
    householdCode: "HH-1001",
    clientId: "CL-1001",
  },
  {
    id: "REF-2026-1040",
    patientName: "John Doe",
    age: 76,
    gender: "Male",
    phone: "(555) 789-0123",
    email: "john.doe.care@example.com",
    address: "88 Oak Lane, Apt 4B",
    city: "Springfield",
    zip: "01103",
    referralSource: "Area Agency on Aging (AAA)",
    referralSourceContact: "Mark Sullivan, Care Consultant",
    program: "VA Community Care",
    requestedServices: ["Home Health Aide", "Physical Therapy", "Dementia Support"],
    priority: "Urgent",
    status: "New Referral",
    receivedDate: "Nov 23, 2026",
    daysInPipeline: 1,
    primaryDiagnosis: "Post-Stroke Recovery, Left Hemiparesis",
    triageNotes:
      "Veteran recovering from ischemic stroke with mobility impairment. Requires aide assistance for ADLs and transfer support 6 days/week.",
    assignedCoordinator: "Maria Santos, BSN",
    insuranceVerified: true,
    payerName: "VA Community Care Network (TriWest)",
    targetStartDate: "Nov 28, 2026",
    estimatedHoursPerWeek: 30,
    householdCode: "HH-1004",
    clientId: "CL-1004",
  },
  {
    id: "REF-2026-1039",
    patientName: "Sarah Connor",
    age: 62,
    gender: "Female",
    phone: "(555) 345-6712",
    email: "s.connor@example.com",
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
      "All assessments and financial agreements executed. Ready for caregiver matching with emphasis on gentle joint mobility support.",
    assignedCoordinator: "Jessica Taylor",
    insuranceVerified: true,
    payerName: "Private Commercial / Out of Pocket",
    targetStartDate: "Nov 27, 2026",
    estimatedHoursPerWeek: 25,
    householdCode: "HH-1003",
    clientId: "CL-1003",
  },
  {
    id: "REF-2026-1038",
    patientName: "Raymond Chen",
    age: 80,
    gender: "Male",
    phone: "(555) 456-7890",
    email: "chen.family@example.com",
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
    primaryDiagnosis: "Congestive Heart Failure (NYHA Class II), Hypertension",
    triageNotes:
      "Requires daily weigh-ins and vital sign checks. Pending physician certification statement from cardiology clinic.",
    assignedCoordinator: "David Kim, MSW",
    insuranceVerified: true,
    payerName: "PA Health & Wellness CHC",
    targetStartDate: "Dec 03, 2026",
    estimatedHoursPerWeek: 20,
    householdCode: "HH-1007",
    clientId: "CL-1007",
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
      "Successfully enrolled into care. Caregiver assigned and initial EVV visit scheduled for tomorrow morning.",
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
    patientName: "Martha Smith",
    age: 68,
    gender: "Female",
    phone: "(555) 789-4321",
    email: "martha.smith@example.com",
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
      "In-person RN assessment completed; care plan drafted. In review with primary care physician for final sign-off.",
    assignedCoordinator: "Maria Santos, BSN",
    insuranceVerified: true,
    payerName: "UPMC Community HealthChoices",
    targetStartDate: "Dec 02, 2026",
    estimatedHoursPerWeek: 24,
    householdCode: "HH-1006",
    clientId: "CL-1006",
  },
  {
    id: "REF-2026-1035",
    patientName: "Robert Davis",
    age: 68,
    gender: "Male",
    phone: "(555) 890-1234",
    email: "r.davis@example.com",
    address: "710 Elmwood Terrace",
    city: "Easton",
    zip: "18042",
    referralSource: "Orthopedic Surgery Center",
    referralSourceContact: "Dr. Marcus Vance, DO",
    program: "Private Pay",
    requestedServices: ["Physical Therapy", "Home Health Aide"],
    priority: "Standard",
    status: "Archived",
    receivedDate: "Nov 05, 2026",
    daysInPipeline: 18,
    primaryDiagnosis: "Total Knee Arthroplasty (TKA)",
    triageNotes:
      "Patient completed 4-week short-term physical therapy protocol; achieved functional independence and discharged.",
    assignedCoordinator: "David Kim, MSW",
    insuranceVerified: true,
    payerName: "Private Pay",
    targetStartDate: "Nov 08, 2026",
    estimatedHoursPerWeek: 15,
    householdCode: "HH-1009",
    clientId: "CL-1009",
  },
];
