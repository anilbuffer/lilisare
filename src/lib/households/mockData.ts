export interface HouseholdMember {
  id: string;
  name: string;
  role: "client" | "caregiver" | "guardian" | "caregiver_and_guardian";
  relationship: string;
  avatarUrl?: string;
  status: "Active" | "Onboarding" | "Pending Auth";
  phone: string;
  email: string;
}

export interface Household {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  program: string;
  caseManager: {
    name: string;
    agency: string;
    email: string;
    phone: string;
  };
  client: HouseholdMember;
  primaryCaregiver: HouseholdMember;
  secondaryCaregiver?: HouseholdMember;
  authorizedHoursPerWeek: number;
  scheduledHoursPerWeek: number;
  authStatus: "Approved" | "Pending Review" | "Expiring Soon" | "Expired";
  authExpiry: string;
  triJourneyStatus: {
    clientStage: "Inquiry" | "Registered" | "Assessment" | "Authorized" | "Care Active";
    caregiverStage: "Registered" | "Screening" | "Training" | "Approval" | "Active";
    opsStage: "Intake" | "Coordination" | "Compliance" | "Scheduling" | "Billing";
    bottleneckMessage?: string;
  };
  evvComplianceRate: number;
  lastVisitDate: string;
}

export const MOCK_HOUSEHOLDS: Household[] = [
  {
    id: "hh-1001",
    code: "HH-1001",
    name: "Miller Household",
    address: "742 Evergreen Terrace",
    city: "Springfield",
    state: "OR",
    zip: "97477",
    phone: "(541) 555-0199",
    program: "CES Waiver (Children’s Extensive Support)",
    caseManager: {
      name: "Dana Jenkins, MSW",
      agency: "State Dept of Human Services",
      email: "dana.jenkins@dhs.state.gov",
      phone: "(541) 555-4321",
    },
    client: {
      id: "CL-1001",
      name: "Leo Miller",
      role: "client",
      relationship: "Care Recipient (Minor, Age 8)",
      status: "Active",
      phone: "(541) 555-0199",
      email: "family.miller@example.com",
    },
    primaryCaregiver: {
      id: "CG-102",
      name: "Sarah Miller",
      role: "caregiver_and_guardian",
      relationship: "Mother & Legal Guardian (Paid W2 Caregiver)",
      status: "Active",
      phone: "(541) 555-0199",
      email: "sarah.miller@example.com",
    },
    authorizedHoursPerWeek: 40,
    scheduledHoursPerWeek: 40,
    authStatus: "Approved",
    authExpiry: "2027-03-31",
    triJourneyStatus: {
      clientStage: "Care Active",
      caregiverStage: "Active",
      opsStage: "Billing",
    },
    evvComplianceRate: 98.5,
    lastVisitDate: "Today, 08:30 AM",
  },
  {
    id: "hh-1002",
    code: "HH-1002",
    name: "Whitfield Household",
    address: "1248 Oakwood Drive",
    city: "Cedar Falls",
    state: "IA",
    zip: "50613",
    phone: "(319) 555-3820",
    program: "EBD Waiver (Elderly, Blind, and Disabled)",
    caseManager: {
      name: "Sarah Jenkins, RN",
      agency: "ElderBridge Care Network",
      email: "s.jenkins@elderbridge.org",
      phone: "(319) 555-9012",
    },
    client: {
      id: "CL-1002",
      name: "Marcus Whitfield",
      role: "client",
      relationship: "Care Recipient (Age 84)",
      status: "Active",
      phone: "(319) 555-3820",
      email: "whitfield.care@example.com",
    },
    primaryCaregiver: {
      id: "CG-108",
      name: "Elena Whitfield",
      role: "caregiver_and_guardian",
      relationship: "Daughter & Family Caregiver",
      status: "Active",
      phone: "(319) 555-3821",
      email: "elena.w@example.com",
    },
    authorizedHoursPerWeek: 32,
    scheduledHoursPerWeek: 30,
    authStatus: "Approved",
    authExpiry: "2026-12-15",
    triJourneyStatus: {
      clientStage: "Care Active",
      caregiverStage: "Active",
      opsStage: "Scheduling",
      bottleneckMessage: "Annual training refresher due in 15 days",
    },
    evvComplianceRate: 96.0,
    lastVisitDate: "Yesterday, 02:00 PM",
  },
  {
    id: "hh-1003",
    code: "HH-1003",
    name: "Santos Household",
    address: "892 Sunset Boulevard",
    city: "Des Moines",
    state: "IA",
    zip: "50309",
    phone: "(515) 555-7741",
    program: "IHSS (In-Home Support Services)",
    caseManager: {
      name: "Robert Martinez",
      agency: "Metro Care Management",
      email: "rmartinez@metrocare.org",
      phone: "(515) 555-8833",
    },
    client: {
      id: "cli-lucas-santos",
      name: "Lucas Santos",
      role: "client",
      relationship: "Care Recipient (Minor, Age 11)",
      status: "Pending Auth",
      phone: "(515) 555-7741",
      email: "santos.family@example.com",
    },
    primaryCaregiver: {
      id: "cg-elena-santos",
      name: "Elena Santos",
      role: "caregiver_and_guardian",
      relationship: "Mother & Designated Caregiver",
      status: "Onboarding",
      phone: "(515) 555-7741",
      email: "elena.santos@example.com",
    },
    authorizedHoursPerWeek: 35,
    scheduledHoursPerWeek: 0,
    authStatus: "Pending Review",
    authExpiry: "Pending Case Manager",
    triJourneyStatus: {
      clientStage: "Authorized",
      caregiverStage: "Approval",
      opsStage: "Coordination",
      bottleneckMessage: "Awaiting Case Manager Robert confirmation of Waiver units",
    },
    evvComplianceRate: 0,
    lastVisitDate: "Not Started",
  },
  {
    id: "hh-1004",
    code: "HH-1004",
    name: "Chen Household",
    address: "410 Pineview Crest",
    city: "Ames",
    state: "IA",
    zip: "50010",
    phone: "(515) 555-2311",
    program: "Family Caregiver",
    caseManager: {
      name: "Dana Jenkins, MSW",
      agency: "State Dept of Human Services",
      email: "dana.jenkins@dhs.state.gov",
      phone: "(541) 555-4321",
    },
    client: {
      id: "CL-1007",
      name: "Raymond Chen",
      role: "client",
      relationship: "Care Recipient (Age 76)",
      status: "Active",
      phone: "(515) 555-2311",
      email: "chen.raymond@example.com",
    },
    primaryCaregiver: {
      id: "CG-130",
      name: "David Chen",
      role: "caregiver_and_guardian",
      relationship: "Son & Family Caregiver",
      status: "Active",
      phone: "(515) 555-2312",
      email: "david.chen@example.com",
    },
    authorizedHoursPerWeek: 25,
    scheduledHoursPerWeek: 25,
    authStatus: "Approved",
    authExpiry: "2027-01-10",
    triJourneyStatus: {
      clientStage: "Care Active",
      caregiverStage: "Active",
      opsStage: "Billing",
    },
    evvComplianceRate: 99.1,
    lastVisitDate: "Today, 10:15 AM",
  },
  {
    id: "hh-1005",
    code: "HH-1005",
    name: "Patel Household",
    address: "3501 Northview Terrace",
    city: "Atlanta",
    state: "GA",
    zip: "30327",
    phone: "(404) 555-8392",
    program: "DD Waiver (Developmental Disabilities)",
    caseManager: {
      name: "Marcus Vance, LCSW",
      agency: "Georgia Community Care Services",
      email: "m.vance@gccs.ga.gov",
      phone: "(404) 555-7711",
    },
    client: {
      id: "CL-1003",
      name: "Sophia Patel",
      role: "client",
      relationship: "Care Recipient (Age 72)",
      status: "Onboarding",
      phone: "(404) 555-8392",
      email: "patel.sophia@example.com",
    },
    primaryCaregiver: {
      id: "CG-115",
      name: "Dev Patel",
      role: "caregiver_and_guardian",
      relationship: "Son & Primary Caregiver",
      status: "Onboarding",
      phone: "(404) 555-8393",
      email: "dev.patel@example.com",
    },
    authorizedHoursPerWeek: 28,
    scheduledHoursPerWeek: 0,
    authStatus: "Pending Review",
    authExpiry: "Pending State RN Review",
    triJourneyStatus: {
      clientStage: "Assessment",
      caregiverStage: "Training",
      opsStage: "Coordination",
      bottleneckMessage: "Awaiting State RN assessment approval",
    },
    evvComplianceRate: 0,
    lastVisitDate: "Not Started",
  },
  {
    id: "hh-1006",
    code: "HH-1006",
    name: "Vance Household",
    address: "1804 Highland Ave",
    city: "Savannah",
    state: "GA",
    zip: "31401",
    phone: "(912) 555-4421",
    program: "CHCBS Waiver (Children’s Home and Community-Based Services)",
    caseManager: {
      name: "Patricia Wong, RN",
      agency: "Coastal Care Coordination",
      email: "pwong@coastalcare.org",
      phone: "(912) 555-8899",
    },
    client: {
      id: "CL-1004",
      name: "Jackson Vance",
      role: "client",
      relationship: "Care Recipient (Minor, Age 6)",
      status: "Active",
      phone: "(912) 555-4421",
      email: "vance.family@example.com",
    },
    primaryCaregiver: {
      id: "CG-104",
      name: "Elena Vance",
      role: "caregiver_and_guardian",
      relationship: "Mother & Guardian",
      status: "Active",
      phone: "(912) 555-4422",
      email: "elena.vance@example.com",
    },
    authorizedHoursPerWeek: 35,
    scheduledHoursPerWeek: 35,
    authStatus: "Approved",
    authExpiry: "2027-02-28",
    triJourneyStatus: {
      clientStage: "Care Active",
      caregiverStage: "Active",
      opsStage: "Scheduling",
    },
    evvComplianceRate: 97.4,
    lastVisitDate: "Today, 09:00 AM",
  },
  {
    id: "hh-1007",
    code: "HH-1007",
    name: "Morales Household",
    address: "720 Juniper Street",
    city: "Decatur",
    state: "GA",
    zip: "30030",
    phone: "(404) 555-1984",
    program: "SLS Waiver (Supported Living Services)",
    caseManager: {
      name: "Elena Morales-Gomez",
      agency: "DeKalb County Community Network",
      email: "egomez@dekalbcare.org",
      phone: "(404) 555-3344",
    },
    client: {
      id: "CL-1005",
      name: "Hannah Morales",
      role: "client",
      relationship: "Care Recipient (Age 68)",
      status: "Onboarding",
      phone: "(404) 555-1984",
      email: "hannah.m@example.com",
    },
    primaryCaregiver: {
      id: "CG-120",
      name: "Sofia Morales",
      role: "caregiver_and_guardian",
      relationship: "Daughter & Caregiver",
      status: "Onboarding",
      phone: "(404) 555-1985",
      email: "sofia.m@example.com",
    },
    authorizedHoursPerWeek: 20,
    scheduledHoursPerWeek: 0,
    authStatus: "Approved",
    authExpiry: "2027-05-15",
    triJourneyStatus: {
      clientStage: "Registered",
      caregiverStage: "Screening",
      opsStage: "Compliance",
      bottleneckMessage: "Caregiver background check in progress",
    },
    evvComplianceRate: 0,
    lastVisitDate: "Not Started",
  },
  {
    id: "hh-1008",
    code: "HH-1008",
    name: "Bennett Household",
    address: "2914 Riverbirch Run",
    city: "Alpharetta",
    state: "GA",
    zip: "30022",
    phone: "(770) 555-6321",
    program: "CHRP Waiver (Children’s Habilitation Residential Program)",
    caseManager: {
      name: "Dana Jenkins, MSW",
      agency: "State Dept of Human Services",
      email: "dana.jenkins@dhs.state.gov",
      phone: "(541) 555-4321",
    },
    client: {
      id: "CL-1006",
      name: "Lucas Bennett",
      role: "client",
      relationship: "Care Recipient (Minor, Age 10)",
      status: "Active",
      phone: "(770) 555-6321",
      email: "bennett.family@example.com",
    },
    primaryCaregiver: {
      id: "CG-122",
      name: "Rachel Bennett",
      role: "caregiver_and_guardian",
      relationship: "Mother & Legal Guardian",
      status: "Active",
      phone: "(770) 555-6322",
      email: "rachel.b@example.com",
    },
    authorizedHoursPerWeek: 30,
    scheduledHoursPerWeek: 30,
    authStatus: "Approved",
    authExpiry: "2027-04-30",
    triJourneyStatus: {
      clientStage: "Care Active",
      caregiverStage: "Active",
      opsStage: "Scheduling",
    },
    evvComplianceRate: 98.9,
    lastVisitDate: "Today, 11:30 AM",
  },
  {
    id: "hh-1009",
    code: "HH-1009",
    name: "Lin Household",
    address: "5612 Clairmont Rd",
    city: "Duluth",
    state: "GA",
    zip: "30096",
    phone: "(678) 555-7210",
    program: "CNA (Certified Nurse Aide)",
    caseManager: {
      name: "Patricia Wong, RN",
      agency: "Gwinnett County Child Services",
      email: "pwong@gwinnett.gov",
      phone: "(678) 555-9000",
    },
    client: {
      id: "CL-1008",
      name: "Maya Lin",
      role: "client",
      relationship: "Care Recipient (Minor, Age 4)",
      status: "Onboarding",
      phone: "(678) 555-7210",
      email: "lin.family@example.com",
    },
    primaryCaregiver: {
      id: "CG-135",
      name: "Jennifer Lin",
      role: "caregiver_and_guardian",
      relationship: "Mother & Legal Guardian",
      status: "Onboarding",
      phone: "(678) 555-7211",
      email: "jennifer.lin@example.com",
    },
    authorizedHoursPerWeek: 36,
    scheduledHoursPerWeek: 0,
    authStatus: "Approved",
    authExpiry: "2027-06-30",
    triJourneyStatus: {
      clientStage: "Registered",
      caregiverStage: "Registered",
      opsStage: "Compliance",
      bottleneckMessage: "Awaiting CPR & First Aid upload",
    },
    evvComplianceRate: 0,
    lastVisitDate: "Not Started",
  },
  {
    id: "hh-1010",
    code: "HH-1010",
    name: "Davis Household",
    address: "4410 Ashford Dunwoody Rd",
    city: "Dunwoody",
    state: "GA",
    zip: "30338",
    phone: "(770) 555-8822",
    program: "Host Home",
    caseManager: {
      name: "Sarah Jenkins, RN",
      agency: "North Atlanta Senior Services",
      email: "s.jenkins@nass.org",
      phone: "(770) 555-1234",
    },
    client: {
      id: "CL-1009",
      name: "Robert Davis",
      role: "client",
      relationship: "Care Recipient (Age 81)",
      status: "Active",
      phone: "(770) 555-8822",
      email: "robert.davis@example.com",
    },
    primaryCaregiver: {
      id: "CG-106",
      name: "Maria Rodriguez",
      role: "caregiver_and_guardian",
      relationship: "Designated Caregiver",
      status: "Active",
      phone: "(770) 555-8823",
      email: "maria.rodriguez@example.com",
    },
    authorizedHoursPerWeek: 24,
    scheduledHoursPerWeek: 24,
    authStatus: "Approved",
    authExpiry: "2027-03-15",
    triJourneyStatus: {
      clientStage: "Care Active",
      caregiverStage: "Active",
      opsStage: "Billing",
    },
    evvComplianceRate: 99.4,
    lastVisitDate: "Today, 01:15 PM",
  },
];

export const HOUSEHOLDS_STORAGE_KEY = "lilisare_households_data";

export function getHouseholdsFromStorage(): Household[] {
  if (typeof window === "undefined") return MOCK_HOUSEHOLDS;
  const stored = localStorage.getItem(HOUSEHOLDS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(HOUSEHOLDS_STORAGE_KEY, JSON.stringify(MOCK_HOUSEHOLDS));
    return MOCK_HOUSEHOLDS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return MOCK_HOUSEHOLDS;
  }
}

export function saveHouseholdsToStorage(households: Household[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HOUSEHOLDS_STORAGE_KEY, JSON.stringify(households));
    window.dispatchEvent(
      new CustomEvent("lilisare_intake_sync", {
        detail: { type: "households", count: households.length, timestamp: Date.now() },
      })
    );
  } catch (err) {
    console.error("Failed to save households to localStorage", err);
  }
}

export function getHouseholdById(id: string): Household | undefined {
  const cleanId = id.toLowerCase();
  const all = getHouseholdsFromStorage();
  return all.find(
    (h) => h.id.toLowerCase() === cleanId || h.code.toLowerCase() === cleanId
  ) || MOCK_HOUSEHOLDS.find(
    (h) => h.id.toLowerCase() === cleanId || h.code.toLowerCase() === cleanId
  );
}

export function getAllHouseholdIds(): string[] {
  const ids: string[] = [];
  MOCK_HOUSEHOLDS.forEach((h) => {
    ids.push(h.id);
    ids.push(h.code);
  });
  return Array.from(new Set(ids));
}
