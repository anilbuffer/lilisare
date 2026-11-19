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
  program: "Medicaid Waiver" | "Pediatric In-Home" | "Senior Community Care" | "Private Duty";
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
    program: "Pediatric In-Home",
    caseManager: {
      name: "Dana Jenkins, MSW",
      agency: "State Dept of Human Services",
      email: "dana.jenkins@dhs.state.gov",
      phone: "(541) 555-4321",
    },
    client: {
      id: "cli-child-a",
      name: "Child A (Leo Miller)",
      role: "client",
      relationship: "Care Recipient (Minor, Age 8)",
      status: "Active",
      phone: "(541) 555-0199",
      email: "family.miller@example.com",
    },
    primaryCaregiver: {
      id: "cg-mother-a",
      name: "Mother A (Sarah Miller)",
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
    program: "Senior Community Care",
    caseManager: {
      name: "Sarah Jenkins, RN",
      agency: "ElderBridge Care Network",
      email: "s.jenkins@elderbridge.org",
      phone: "(319) 555-9012",
    },
    client: {
      id: "cli-whitfield",
      name: "Eleanor Ruth Whitfield",
      role: "client",
      relationship: "Care Recipient (Age 84)",
      status: "Active",
      phone: "(319) 555-3820",
      email: "whitfield.care@example.com",
    },
    primaryCaregiver: {
      id: "cg-meg-whitfield",
      name: "Meg Whitfield",
      role: "caregiver_and_guardian",
      relationship: "Daughter & Family Caregiver",
      status: "Active",
      phone: "(319) 555-3821",
      email: "meg.w@example.com",
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
    program: "Medicaid Waiver",
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
    program: "Medicaid Waiver",
    caseManager: {
      name: "Dana Jenkins, MSW",
      agency: "State Dept of Human Services",
      email: "dana.jenkins@dhs.state.gov",
      phone: "(541) 555-4321",
    },
    client: {
      id: "cli-david-chen",
      name: "Arthur Chen",
      role: "client",
      relationship: "Care Recipient (Age 76)",
      status: "Active",
      phone: "(515) 555-2311",
      email: "chen.arthur@example.com",
    },
    primaryCaregiver: {
      id: "cg-david-chen",
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
];

export function getHouseholdById(id: string): Household | undefined {
  const cleanId = id.toLowerCase();
  return MOCK_HOUSEHOLDS.find(
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
