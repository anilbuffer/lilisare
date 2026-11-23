/**
 * LiliSare Agency Admin - Authorizations Data & Models
 * Payer Approval Lifecycle for Non-Medical Home Care & Skilled Home Health Care.
 * 
 * Important UX Distinction:
 * Authorization is payer approval for a specific service (procedure code, units, frequency, date range).
 * It is distinct from Insurance Verification, which checks policy eligibility and patient coverage.
 */

export type CareCategory = "NON_MEDICAL" | "SKILLED_CARE";

export type AuthorizationStatus =
  | "APPROVED"
  | "REQUESTED"
  | "PENDING"
  | "DENIED"
  | "EXPIRED";

export type UnitMeasure = "Visits" | "15-min Units" | "Hours";

export interface AttachedDocument {
  id: string;
  name: string;
  type: "Notice of Action (NOA)" | "Prior Auth Request (PAR)" | "Clinical Assessment (CMS-485)" | "Payer Denial Notice" | "Appeal Letter";
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  verificationStatus: "VERIFIED" | "PENDING_REVIEW" | "REJECTED";
}

export interface StatusHistoryEntry {
  status: AuthorizationStatus;
  changedAt: string;
  changedBy: string;
  reason: string;
}

export interface AuthorizationRecord {
  id: string; // Auth Reference # (e.g. "AUTH-CO-9941")
  internalId: string;
  clientId: string;
  clientName: string;
  clientDob: string;
  clientPhone: string;
  householdId: string;
  householdName: string;
  careCategory: CareCategory;
  payer: string;
  payerPlan: string;
  insurancePolicyId: string; // Distinct from Authorization Reference #
  caseManagerName: string;
  caseManagerEmail: string;
  caseManagerPhone: string;
  caseManagerAgency: string;
  serviceName: string;
  serviceCode: string; // HCPCS / CPT Code (e.g. T1019, G0151, S5125)
  modifier?: string;
  unitMeasure: UnitMeasure;
  unitsApproved: number;
  unitsUsed: number;
  weeklyCapUnits?: number;
  billRate: number;
  payRate: number;
  effectiveDate: string;
  expirationDate: string;
  diagnosisCode: string; // ICD-10
  status: AuthorizationStatus;
  documents: AttachedDocument[];
  denialReason?: string;
  renewalSubmitted?: boolean;
  notes?: string;
  statusHistory: StatusHistoryEntry[];
}

export interface AuthorizationsKpis {
  totalActiveApproved: number;
  nonMedicalActive: number;
  skilledActive: number;
  totalPendingRequests: number;
  expiringIn30Days: number;
  exhaustedOrCritical: number;
  deniedCount: number;
  totalApprovedUnits: number;
  totalUsedUnits: number;
  totalRemainingUnits: number;
}

export const INITIAL_AUTHORIZATIONS: AuthorizationRecord[] = [
  {
    id: "AUTH-2026-9941",
    internalId: "PA-101",
    clientId: "CL-4011",
    clientName: "Eleanor Ruth Whitfield",
    clientDob: "1968-04-12",
    clientPhone: "(303) 555-0144",
    householdId: "HH-201",
    householdName: "Whitfield Household",
    careCategory: "SKILLED_CARE",
    payer: "Colorado Medicaid",
    payerPlan: "Health First Colorado HCBS-EBD",
    insurancePolicyId: "CO-MED-994821",
    caseManagerName: "David Sterling, MSW",
    caseManagerEmail: "d.sterling@denvergov.org",
    caseManagerPhone: "(303) 555-0192",
    caseManagerAgency: "Denver County Adult Services SEP",
    serviceName: "Skilled Nursing / CNA Care",
    serviceCode: "T1019",
    modifier: "U2",
    unitMeasure: "15-min Units",
    unitsApproved: 1440,
    unitsUsed: 920,
    weeklyCapUnits: 30,
    billRate: 15.5,
    payRate: 10.25,
    effectiveDate: "2026-01-01",
    expirationDate: "2026-12-31",
    diagnosisCode: "G80.9 (Cerebral Palsy)",
    status: "APPROVED",
    documents: [
      {
        id: "DOC-9941-NOA",
        name: "State Notice of Action (NOA) - T1019 Approval.pdf",
        type: "Notice of Action (NOA)",
        fileSize: "1.4 MB",
        uploadedAt: "2026-01-03",
        uploadedBy: "Sarah Jenkins (Intake Admin)",
        verificationStatus: "VERIFIED",
      },
      {
        id: "DOC-9941-485",
        name: "CMS-485 Clinical Plan of Care.pdf",
        type: "Clinical Assessment (CMS-485)",
        fileSize: "2.1 MB",
        uploadedAt: "2026-01-02",
        uploadedBy: "Rachel Adams, RN",
        verificationStatus: "VERIFIED",
      },
    ],
    notes: "Annual certification validated. Family caregiver CNA qualified under household Whitfield.",
    statusHistory: [
      {
        status: "REQUESTED",
        changedAt: "2025-12-18",
        changedBy: "Sarah Jenkins",
        reason: "Initial authorization request submitted to Colorado Medicaid PAR portal",
      },
      {
        status: "APPROVED",
        changedAt: "2026-01-03",
        changedBy: "Marcus Vance",
        reason: "Notice of Action verified; 1,440 units active",
      },
    ],
  },
  {
    id: "AUTH-2026-8812",
    internalId: "PA-102",
    clientId: "CL-4012",
    clientName: "Lucas Gabriel Gomez",
    clientDob: "2016-09-24",
    clientPhone: "(303) 555-0177",
    householdId: "HH-202",
    householdName: "Gomez Household",
    careCategory: "NON_MEDICAL",
    payer: "CES Waiver",
    payerPlan: "Children's Extensive Support (CES)",
    insurancePolicyId: "CES-CO-441209",
    caseManagerName: "Melissa Vance, LCSW",
    caseManagerEmail: "mvance@dpcolorado.org",
    caseManagerPhone: "(303) 855-3200",
    caseManagerAgency: "Developmental Pathways CCB",
    serviceName: "Family Caregiver (Pediatric)",
    serviceCode: "S5125",
    modifier: "TG",
    unitMeasure: "15-min Units",
    unitsApproved: 720,
    unitsUsed: 698,
    weeklyCapUnits: 25,
    billRate: 16.25,
    payRate: 11.5,
    effectiveDate: "2026-02-01",
    expirationDate: "2026-08-31",
    diagnosisCode: "F84.0 (Autism Spectrum)",
    status: "APPROVED",
    renewalSubmitted: true,
    documents: [
      {
        id: "DOC-8812-NOA",
        name: "CES Waiver Case Manager Allocation Notice.pdf",
        type: "Notice of Action (NOA)",
        fileSize: "1.8 MB",
        uploadedAt: "2026-01-28",
        uploadedBy: "Sarah Jenkins",
        verificationStatus: "VERIFIED",
      },
      {
        id: "DOC-8812-REQ",
        name: "Mid-Term Extension Request Form.pdf",
        type: "Prior Auth Request (PAR)",
        fileSize: "850 KB",
        uploadedAt: "2026-05-10",
        uploadedBy: "Marcus Vance",
        verificationStatus: "PENDING_REVIEW",
      },
    ],
    notes: "CRITICAL BURN: 22 units remaining out of 720 approved. Renewal extension submitted to CCB.",
    statusHistory: [
      {
        status: "REQUESTED",
        changedAt: "2026-01-15",
        changedBy: "Sarah Jenkins",
        reason: "Pediatric Family Caregiver renewal submitted",
      },
      {
        status: "APPROVED",
        changedAt: "2026-01-30",
        changedBy: "Marcus Vance",
        reason: "Approval letter verified",
      },
    ],
  },
  {
    id: "AUTH-2026-7734",
    internalId: "PA-103",
    clientId: "CL-4013",
    clientName: "Harper Mia Alvarez",
    clientDob: "2019-11-05",
    clientPhone: "(303) 555-0182",
    householdId: "HH-203",
    householdName: "Alvarez Household",
    careCategory: "NON_MEDICAL",
    payer: "Colorado Medicaid",
    payerPlan: "In-Home Support Services (IHSS)",
    insurancePolicyId: "CO-IHSS-338120",
    caseManagerName: "Brenda Larson, RN",
    caseManagerEmail: "blarson@rmhs.org",
    caseManagerPhone: "(303) 636-5600",
    caseManagerAgency: "Rocky Mountain Human Services",
    serviceName: "IHSS Personal Care & Homemaker",
    serviceCode: "S5130",
    modifier: "U3",
    unitMeasure: "15-min Units",
    unitsApproved: 1040,
    unitsUsed: 0,
    weeklyCapUnits: 20,
    billRate: 15.0,
    payRate: 10.25,
    effectiveDate: "2026-06-01",
    expirationDate: "2027-05-31",
    diagnosisCode: "M62.81 (Muscle Weakness)",
    status: "PENDING",
    documents: [
      {
        id: "DOC-7734-PAR",
        name: "IHSS Initial Client Assessment Packet.pdf",
        type: "Prior Auth Request (PAR)",
        fileSize: "3.2 MB",
        uploadedAt: "2026-05-15",
        uploadedBy: "Sarah Jenkins",
        verificationStatus: "PENDING_REVIEW",
      },
    ],
    notes: "Awaiting Case Manager written Notice of Action. Care delivery locked until formal NOA is uploaded.",
    statusHistory: [
      {
        status: "REQUESTED",
        changedAt: "2026-05-10",
        changedBy: "Intake Admin",
        reason: "Intake assessment packet sent to Brenda Larson at RMHS",
      },
      {
        status: "PENDING",
        changedAt: "2026-05-15",
        changedBy: "Marcus Vance",
        reason: "Verbal approval received; waiting for official state determination letter",
      },
    ],
  },
  {
    id: "AUTH-2026-6621",
    internalId: "PA-104",
    clientId: "CL-4014",
    clientName: "Samuel Thomas Wright",
    clientDob: "1975-02-18",
    clientPhone: "(303) 555-0199",
    householdId: "HH-204",
    householdName: "Wright Household",
    careCategory: "SKILLED_CARE",
    payer: "CHRP Waiver",
    payerPlan: "Children's Habilitation Residential Program",
    insurancePolicyId: "CHRP-CO-881290",
    caseManagerName: "Jonathan Hayes, MS",
    caseManagerEmail: "jhayes@jeffco.us",
    caseManagerPhone: "(303) 271-4000",
    caseManagerAgency: "Jefferson County Human Services",
    serviceName: "Physical Therapy (PT)",
    serviceCode: "G0151",
    unitMeasure: "Visits",
    unitsApproved: 48,
    unitsUsed: 14,
    weeklyCapUnits: 2,
    billRate: 125.0,
    payRate: 85.0,
    effectiveDate: "2026-03-01",
    expirationDate: "2027-02-28",
    diagnosisCode: "Q90.9 (Down Syndrome)",
    status: "APPROVED",
    documents: [
      {
        id: "DOC-6621-NOA",
        name: "CHRP Physical Therapy Approval Letter.pdf",
        type: "Notice of Action (NOA)",
        fileSize: "1.1 MB",
        uploadedAt: "2026-02-28",
        uploadedBy: "Sarah Jenkins",
        verificationStatus: "VERIFIED",
      },
    ],
    notes: "48 visits authorized over 12 months. 34 visits remaining. Quarterly progress review required.",
    statusHistory: [
      {
        status: "REQUESTED",
        changedAt: "2026-02-15",
        changedBy: "Clinical Supervisor",
        reason: "PT prescription submitted following supervisory assessment",
      },
      {
        status: "APPROVED",
        changedAt: "2026-02-28",
        changedBy: "Marcus Vance",
        reason: "48 PT visits approved by Jefferson County CCB",
      },
    ],
  },
  {
    id: "AUTH-2026-5510",
    internalId: "PA-105",
    clientId: "CL-4015",
    clientName: "Mateo Alexander Silva",
    clientDob: "1954-08-30",
    clientPhone: "(303) 555-0165",
    householdId: "HH-205",
    householdName: "Silva Household",
    careCategory: "NON_MEDICAL",
    payer: "Colorado Medicaid",
    payerPlan: "Health First Colorado HCBS-EBD",
    insurancePolicyId: "CO-EBD-771240",
    caseManagerName: "Katherine Powell",
    caseManagerEmail: "kpowell@srcdenver.org",
    caseManagerPhone: "(303) 235-6900",
    caseManagerAgency: "Senior Resource Center CCB",
    serviceName: "Homemaker Services",
    serviceCode: "S5130",
    unitMeasure: "Hours",
    unitsApproved: 120,
    unitsUsed: 118,
    weeklyCapUnits: 4,
    billRate: 34.0,
    payRate: 22.5,
    effectiveDate: "2026-01-15",
    expirationDate: "2026-07-15",
    diagnosisCode: "R26.89 (Mobility Impairment)",
    status: "APPROVED",
    documents: [
      {
        id: "DOC-5510-NOA",
        name: "Homemaker Services Approval Notice.pdf",
        type: "Notice of Action (NOA)",
        fileSize: "920 KB",
        uploadedAt: "2026-01-14",
        uploadedBy: "Sarah Jenkins",
        verificationStatus: "VERIFIED",
      },
    ],
    notes: "Only 2 hours remaining! Authorization expires in July. Renewal request needs submission.",
    statusHistory: [
      {
        status: "APPROVED",
        changedAt: "2026-01-14",
        changedBy: "Marcus Vance",
        reason: "Approved for 120 hours",
      },
    ],
  },
  {
    id: "AUTH-2026-4402",
    internalId: "PA-106",
    clientId: "CL-4016",
    clientName: "Amara Joy Washington",
    clientDob: "2008-05-14",
    clientPhone: "(303) 555-0128",
    householdId: "HH-206",
    householdName: "Washington Household",
    careCategory: "SKILLED_CARE",
    payer: "UnitedHealthcare",
    payerPlan: "Commercial Managed Care Home Health",
    insurancePolicyId: "UHC-992144-COMM",
    caseManagerName: "Gregory Stone",
    caseManagerEmail: "gstone@uhc.com",
    caseManagerPhone: "(800) 555-7822",
    caseManagerAgency: "UHC Care Coordination Services",
    serviceName: "Occupational Therapy (OT)",
    serviceCode: "G0152",
    unitMeasure: "Visits",
    unitsApproved: 24,
    unitsUsed: 0,
    weeklyCapUnits: 2,
    billRate: 135.0,
    payRate: 90.0,
    effectiveDate: "2026-05-01",
    expirationDate: "2026-10-31",
    diagnosisCode: "G80.2 (Spastic Hemiplegic)",
    status: "REQUESTED",
    documents: [
      {
        id: "DOC-4402-PAR",
        name: "UHC Prior Authorization Request Packet.pdf",
        type: "Prior Auth Request (PAR)",
        fileSize: "2.4 MB",
        uploadedAt: "2026-05-02",
        uploadedBy: "Sarah Jenkins",
        verificationStatus: "PENDING_REVIEW",
      },
    ],
    notes: "Initial 24 OT visits requested post-surgery. Awaiting UHC medical director determination.",
    statusHistory: [
      {
        status: "REQUESTED",
        changedAt: "2026-05-02",
        changedBy: "Clinical Intake",
        reason: "Request submitted via Availity portal",
      },
    ],
  },
  {
    id: "AUTH-2026-3390",
    internalId: "PA-107",
    clientId: "CL-4017",
    clientName: "David Jonathan Brooks",
    clientDob: "1960-12-03",
    clientPhone: "(303) 555-0139",
    householdId: "HH-207",
    householdName: "Brooks Household",
    careCategory: "SKILLED_CARE",
    payer: "Colorado Medicaid",
    payerPlan: "Health First Colorado HCBS-EBD",
    insurancePolicyId: "CO-MED-772911",
    caseManagerName: "Katherine Powell",
    caseManagerEmail: "kpowell@srcdenver.org",
    caseManagerPhone: "(303) 235-6900",
    caseManagerAgency: "Senior Resource Center CCB",
    serviceName: "Speech-Language Pathology (ST)",
    serviceCode: "G0153",
    unitMeasure: "Visits",
    unitsApproved: 16,
    unitsUsed: 0,
    weeklyCapUnits: 1,
    billRate: 130.0,
    payRate: 88.0,
    effectiveDate: "2026-04-15",
    expirationDate: "2026-07-15",
    diagnosisCode: "I69.320 (Aphasia following stroke)",
    status: "DENIED",
    denialReason: "Payer medical necessity review determined criteria not met for in-home ST; recommended outpatient clinic setting.",
    documents: [
      {
        id: "DOC-3390-DEN",
        name: "Medicaid Denial Determination Letter.pdf",
        type: "Payer Denial Notice",
        fileSize: "1.3 MB",
        uploadedAt: "2026-04-22",
        uploadedBy: "Marcus Vance",
        verificationStatus: "VERIFIED",
      },
    ],
    notes: "Payer denial under review. Preparing clinical appeal with attending neurologist letter.",
    statusHistory: [
      {
        status: "REQUESTED",
        changedAt: "2026-04-10",
        changedBy: "Clinical Intake",
        reason: "Initial ST visit request",
      },
      {
        status: "DENIED",
        changedAt: "2026-04-22",
        changedBy: "Marcus Vance",
        reason: "Payer issued denial notice for home setting. Appeal pending.",
      },
    ],
  },
  {
    id: "AUTH-2025-1102",
    internalId: "PA-108",
    clientId: "CL-4018",
    clientName: "Beatrice Marie Vance",
    clientDob: "1942-07-19",
    clientPhone: "(303) 555-0111",
    householdId: "HH-208",
    householdName: "Vance Household",
    careCategory: "NON_MEDICAL",
    payer: "Colorado Medicaid",
    payerPlan: "Health First Colorado HCBS-EBD",
    insurancePolicyId: "CO-MED-110294",
    caseManagerName: "David Sterling, MSW",
    caseManagerEmail: "d.sterling@denvergov.org",
    caseManagerPhone: "(303) 555-0192",
    caseManagerAgency: "Denver County Adult Services SEP",
    serviceName: "Personal Care Services",
    serviceCode: "T1019",
    unitMeasure: "15-min Units",
    unitsApproved: 600,
    unitsUsed: 600,
    weeklyCapUnits: 15,
    billRate: 14.5,
    payRate: 9.5,
    effectiveDate: "2025-05-01",
    expirationDate: "2026-04-30",
    diagnosisCode: "M19.90 (Osteoarthritis)",
    status: "EXPIRED",
    documents: [
      {
        id: "DOC-1102-HIST",
        name: "Prior Year Authorization Certificate.pdf",
        type: "Notice of Action (NOA)",
        fileSize: "1.2 MB",
        uploadedAt: "2025-05-02",
        uploadedBy: "Sarah Jenkins",
        verificationStatus: "VERIFIED",
      },
    ],
    notes: "Prior term complete. Replaced by active 2026-2027 renewal.",
    statusHistory: [
      {
        status: "APPROVED",
        changedAt: "2025-05-02",
        changedBy: "Marcus Vance",
        reason: "Term active",
      },
      {
        status: "EXPIRED",
        changedAt: "2026-05-01",
        changedBy: "System Automation",
        reason: "Reached end of validity period",
      },
    ],
  },
];

export function calculateAuthorizationsKpis(records: AuthorizationRecord[]): AuthorizationsKpis {
  let totalActive = 0;
  let nonMed = 0;
  let skilled = 0;
  let pendingReq = 0;
  let expiring30 = 0;
  let exhausted = 0;
  let denied = 0;
  let approvedUnits = 0;
  let usedUnits = 0;

  const now = new Date("2026-05-23"); // Reference simulation date

  records.forEach((r) => {
    approvedUnits += r.unitsApproved;
    usedUnits += r.unitsUsed;

    if (r.status === "APPROVED") {
      totalActive++;
      if (r.careCategory === "NON_MEDICAL") nonMed++;
      if (r.careCategory === "SKILLED_CARE") skilled++;

      // Expiration check within 30 days
      const end = new Date(r.expirationDate);
      const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 0 && diffDays <= 45) {
        expiring30++;
      }

      // Exhausted check (<10% remaining units)
      const remaining = r.unitsApproved - r.unitsUsed;
      const pctRemaining = (remaining / r.unitsApproved) * 100;
      if (remaining <= 30 || pctRemaining <= 10) {
        exhausted++;
      }
    } else if (r.status === "REQUESTED" || r.status === "PENDING") {
      pendingReq++;
    } else if (r.status === "DENIED") {
      denied++;
    }
  });

  return {
    totalActiveApproved: totalActive,
    nonMedicalActive: nonMed,
    skilledActive: skilled,
    totalPendingRequests: pendingReq,
    expiringIn30Days: expiring30,
    exhaustedOrCritical: exhausted,
    deniedCount: denied,
    totalApprovedUnits: approvedUnits,
    totalUsedUnits: usedUnits,
    totalRemainingUnits: Math.max(0, approvedUnits - usedUnits),
  };
}

export function exportAuthorizationsCsv(records: AuthorizationRecord[]): void {
  const headers = [
    "Auth Ref Number",
    "Internal ID",
    "Patient Name",
    "Household",
    "Care Category",
    "Payer",
    "Payer Plan",
    "Insurance Policy ID",
    "Service Name",
    "HCPCS / CPT Code",
    "Unit Measure",
    "Approved Units",
    "Used Units",
    "Remaining Units",
    "Effective Date",
    "Expiration Date",
    "Status",
    "Case Manager",
    "Case Manager Agency",
  ];

  const rows = records.map((r) => {
    const remaining = r.unitsApproved - r.unitsUsed;
    return [
      r.id,
      r.internalId,
      `"${r.clientName}"`,
      `"${r.householdName}"`,
      r.careCategory,
      `"${r.payer}"`,
      `"${r.payerPlan}"`,
      r.insurancePolicyId,
      `"${r.serviceName}"`,
      r.serviceCode + (r.modifier ? `-${r.modifier}` : ""),
      r.unitMeasure,
      r.unitsApproved,
      r.unitsUsed,
      remaining,
      r.effectiveDate,
      r.expirationDate,
      r.status,
      `"${r.caseManagerName}"`,
      `"${r.caseManagerAgency}"`,
    ].join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `lilisare-authorizations-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
