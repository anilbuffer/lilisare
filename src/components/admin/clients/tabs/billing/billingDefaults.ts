import { ClientBillingConfig, ClientRecord } from "@/types/client";

export interface CatalogServiceOption {
  code: string;
  name: string;
  description: string;
  defaultRate: number;
  defaultType: "Hourly" | "Per Visit" | "Daily" | "mTU";
}

export const AVAILABLE_BILLING_SERVICES: CatalogServiceOption[] = [
  {
    code: "IHPC - 75",
    name: "In-Home Personal Care Services",
    description: "In-Home Personal Care Services",
    defaultRate: 60.0,
    defaultType: "Hourly",
  },
  {
    code: "UHC - Respite",
    name: "United Healthcare",
    description: "United Healthcare",
    defaultRate: 55.0,
    defaultType: "Hourly",
  },
  {
    code: "T1019 - ADL",
    name: "Personal Care / ADL Support",
    description: "Personal Care / ADL Support",
    defaultRate: 48.0,
    defaultType: "mTU",
  },
  {
    code: "S5125 - ATT",
    name: "Attendant Care Services",
    description: "Attendant Care Services",
    defaultRate: 52.0,
    defaultType: "Hourly",
  },
  {
    code: "H2014 - BEH",
    name: "Sensory Regulation & Behavioral Coaching",
    description: "Sensory Regulation & Behavioral Coaching",
    defaultRate: 65.0,
    defaultType: "Hourly",
  },
  {
    code: "IHPC - COC",
    name: "Change of Condition",
    description: "Change of Condition",
    defaultRate: 75.0,
    defaultType: "Hourly",
  },
];

export const CLIENT_CLASS_OPTIONS = [
  "Medicaid Waiver, Private Pay",
  "Veterans Affairs, Private Pay",
  "Medicaid EPSDT",
  "Commercial Insurance",
  "Private Pay",
  "Self-Directed Care",
];

export function formatShortDate(isoDate?: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [y, m, d] = parts;
  return `${m}/${d}/${y.slice(-2)}`;
}

export function computeAuthLineStatus(
  startDate: string,
  endDate: string
): "Current" | "Expired" | "Upcoming" {
  const today = new Date().toISOString().slice(0, 10);
  if (endDate && endDate < today) return "Expired";
  if (startDate && startDate > today) return "Upcoming";
  return "Current";
}

export function getInitialBillingConfig(client: ClientRecord): ClientBillingConfig {
  if (client.billingConfig) {
    return client.billingConfig;
  }

  const primaryPayerName =
    client.authorization?.payer || "Oregon Health Plan (OHP / DHS Waiver)";
  const authNumber = client.authorization?.authNumber || "AUTH-2026-9812";
  const startDate = client.authorization?.startDate || "2026-01-01";
  const endDate = client.authorization?.expiryDate || "2027-03-31";
  const weeklyCap = client.authorization?.weeklyHourCap || 40;

  return {
    billingInfo: {
      clientClass: "Medicaid Waiver, Private Pay",
      billingCycle: "Weekly",
      insurancePolicyNumber: client.agencyInfo?.medicaidNumber || "OHP-8849201-OR",
      billingNotes: "",
      billClient: true,
      billOvertimeRates: true,
      billHolidayRates: true,
      payCaregiver: true,
      hipaaReleaseSigned: false,
      useMtuOnCalendar: false,
      includeTotalOnSplitInvoices: "System Default (No)",
      servicesFilter: "Authorized Only",
    },
    payers: [
      {
        id: "PAY-1",
        name: "Big Sky Waiver",
        status: "Inactive",
        requiresAuth: true,
        eligibilityStatus: "Not requested",
        verificationDate: "",
        defaultFax: "",
        contact: "",
        location: "",
      },
      {
        id: "PAY-2",
        name: "Oregon Total Care Payer",
        status: "Active",
        requiresAuth: true,
        eligibilityStatus: "Not requested",
        verificationDate: "",
        defaultFax: "",
        contact: "",
        location: "",
      },
      {
        id: "PAY-3",
        name: "Self Directed Care",
        status: "Active",
        requiresAuth: true,
        eligibilityStatus: "Not requested",
        verificationDate: "",
        defaultFax: "",
        contact: "",
        location: "",
      },
      {
        id: "PAY-4",
        name: primaryPayerName,
        status: "Active",
        requiresAuth: true,
        eligibilityStatus: "Verified",
        verificationDate: "01/05/26",
        defaultFax: "(541) 555-0140",
        contact: client.authorization?.caseManagerName || "Dana Jenkins, MSW",
        location: client.household?.city ? `${client.household.city}, ${client.household.state}` : "Oregon",
      },
    ],
    eligibilityHistory: [
      {
        id: "ELIG-1",
        payerName: primaryPayerName,
        checkedAt: "2026-01-05 09:30 AM",
        status: "Verified",
        checkedBy: "Billing Team",
        notes: "Active Medicaid waiver coverage confirmed.",
      },
    ],
    authorizations: [
      {
        id: "AUTH-LINE-1",
        authNumber,
        authType: "Per-Service Time",
        payerId: "PAY-4",
        payerName: primaryPayerName,
        icd10Codes: ["F84.0", "", "", ""],
        services: [
          {
            id: "SVC-1",
            code: "T1019 - ADL",
            description: "Personal Care / ADL Support",
            modifiers: ["", "", "", ""],
            units: "mTU",
            maxTimeAllowed: weeklyCap * 4,
            period: "Week",
            startDate,
            endDate,
            status: computeAuthLineStatus(startDate, endDate),
          },
        ],
      },
    ],
    paymentResponsibilities: [],
    assignedServices: [
      {
        id: "ASGN-1",
        code: "IHPC - 75",
        description: "Change of Condition",
        payer: "",
        type: "Hourly",
        billRate: 75.0,
        reqAuth: false,
      },
    ],
    maxHoursAndVisits: [],
    billRateAdjustments: [
      {
        id: "BRA-1",
        code: "IHPC - 75",
        description: "Change of Condition",
        payer: "",
        type: "Hourly",
        rate: 50.0,
        startDate: "2026-02-08",
        endDate: "2026-08-31",
      },
    ],
  };
}
