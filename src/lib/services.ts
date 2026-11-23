/**
 * LiliSare Services - Single Source of Truth
 * 
 * Standardized list of all 17 official LiliSare service lines, clinical programs,
 * and Colorado Medicaid HCBS waiver programs.
 */

export interface LiliSareServiceItem {
  id: string;
  order: number;
  name: string;
  shortName: string;
  code: string; // HCPCS / Program Code
  category: 
    | "Assessment"
    | "Core In-Home"
    | "Clinical Nursing"
    | "Residential Supports"
    | "State Plan / Waivers"
    | "Children's Waivers"
    | "Adult Waivers"
    | "Community & Engagement"
    | "Other";
  description: string;
  defaultBillRate: string;
  defaultPayRate: string;
  unitType: "Per Assessment" | "15 min (Unit)" | "Hourly" | "Daily Per Diem" | "Per Event" | "Custom";
  status: "Active" | "Inactive";
  colorScheme: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
}

export const LILISARE_SERVICES: LiliSareServiceItem[] = [
  {
    id: "svc-home-care-assessment",
    order: 1,
    name: "Home Care Assessment",
    shortName: "Assessment",
    code: "T1001",
    category: "Assessment",
    description: "Comprehensive initial and periodic in-home nursing assessment, level-of-care evaluation, and care planning.",
    defaultBillRate: "$150.00",
    defaultPayRate: "$95.00",
    unitType: "Per Assessment",
    status: "Active",
    colorScheme: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-500",
    },
  },
  {
    id: "svc-family-caregiver",
    order: 2,
    name: "Family Caregiver",
    shortName: "Family Caregiver",
    code: "S5125",
    category: "Core In-Home",
    description: "Paid family caregiving assistance for activities of daily living (ADLs), personal hygiene, meal preparation, and companionship.",
    defaultBillRate: "$28.50",
    defaultPayRate: "$19.50",
    unitType: "Hourly",
    status: "Active",
    colorScheme: {
      bg: "bg-emerald-50",
      text: "text-[#3D6B22]",
      border: "border-[#3D6B22]/30",
      dot: "bg-[#3D6B22]",
    },
  },
  {
    id: "svc-cna",
    order: 3,
    name: "CNA (Certified Nurse Aide)",
    shortName: "CNA",
    code: "T1019",
    category: "Clinical Nursing",
    description: "Certified Nurse Aide hands-on patient care, vital signs monitoring, personal hygiene, and skilled aide tasks under RN supervision.",
    defaultBillRate: "$36.00",
    defaultPayRate: "$23.50",
    unitType: "Hourly",
    status: "Active",
    colorScheme: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-200",
      dot: "bg-teal-500",
    },
  },
  {
    id: "svc-ihss",
    order: 4,
    name: "IHSS (In-Home Support Services)",
    shortName: "IHSS",
    code: "S5130",
    category: "Core In-Home",
    description: "Client-directed in-home attendant support services, personal care, homemaking, and authorized health maintenance activities.",
    defaultBillRate: "$31.50",
    defaultPayRate: "$21.00",
    unitType: "Hourly",
    status: "Active",
    colorScheme: {
      bg: "bg-lime-50",
      text: "text-lime-800",
      border: "border-lime-200",
      dot: "bg-lime-600",
    },
  },
  {
    id: "svc-pdn",
    order: 5,
    name: "PDN (Private Duty Nursing)",
    shortName: "PDN",
    code: "T1000",
    category: "Clinical Nursing",
    description: "Individual, continuous complex skilled nursing care provided by a Registered Nurse (RN) or Licensed Practical Nurse (LPN).",
    defaultBillRate: "$88.00",
    defaultPayRate: "$58.00",
    unitType: "Hourly",
    status: "Active",
    colorScheme: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      dot: "bg-purple-500",
    },
  },
  {
    id: "svc-irss",
    order: 6,
    name: "IRSS (Individual Residential Services and Supports)",
    shortName: "IRSS",
    code: "H0043",
    category: "Residential Supports",
    description: "Individualized residential living supports, daily living skill coaching, habilitation, and 24-hour emergency on-call backup.",
    defaultBillRate: "$210.00",
    defaultPayRate: "$145.00",
    unitType: "Daily Per Diem",
    status: "Active",
    colorScheme: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
  },
  {
    id: "svc-host-home",
    order: 7,
    name: "Host Home",
    shortName: "Host Home",
    code: "S5140",
    category: "Residential Supports",
    description: "Community family-living arrangement providing dedicated residential care, room, board, and supportive habilitation in a private home setting.",
    defaultBillRate: "$195.00",
    defaultPayRate: "$135.00",
    unitType: "Daily Per Diem",
    status: "Active",
    colorScheme: {
      bg: "bg-orange-50",
      text: "text-orange-800",
      border: "border-orange-200",
      dot: "bg-orange-500",
    },
  },
  {
    id: "svc-cfc",
    order: 8,
    name: "Community First Choice (CFC)",
    shortName: "CFC",
    code: "CFC-101",
    category: "State Plan / Waivers",
    description: "State plan Medicaid benefit providing home and community-based attendant services and supports to eligible individuals with disabilities.",
    defaultBillRate: "$30.00",
    defaultPayRate: "$20.00",
    unitType: "Hourly",
    status: "Active",
    colorScheme: {
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-200",
      dot: "bg-sky-500",
    },
  },
  {
    id: "svc-ces-waiver",
    order: 9,
    name: "CES Waiver (Children’s Extensive Support)",
    shortName: "CES Waiver",
    code: "CES-WVR",
    category: "Children's Waivers",
    description: "Medicaid waiver serving children under 18 with severe intellectual or developmental disabilities and intensive behavioral/medical needs.",
    defaultBillRate: "$34.00",
    defaultPayRate: "$22.50",
    unitType: "Hourly",
    status: "Active",
    colorScheme: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
    },
  },
  {
    id: "svc-chrp-waiver",
    order: 10,
    name: "CHRP Waiver (Children’s Habilitation Residential Program)",
    shortName: "CHRP Waiver",
    code: "CHRP-WVR",
    category: "Children's Waivers",
    description: "Specialized residential habilitation and intensive crisis intervention for children and youth with high behavioral needs.",
    defaultBillRate: "$42.00",
    defaultPayRate: "$27.00",
    unitType: "Hourly",
    status: "Active",
    colorScheme: {
      bg: "bg-pink-50",
      text: "text-pink-700",
      border: "border-pink-200",
      dot: "bg-pink-500",
    },
  },
  {
    id: "svc-chcbs-waiver",
    order: 11,
    name: "CHCBS Waiver (Children’s Home and Community-Based Services)",
    shortName: "CHCBS Waiver",
    code: "CHCBS-WVR",
    category: "Children's Waivers",
    description: "Waiver allowing children with significant medical needs at risk of hospital or skilled nursing facility placement to receive care at home.",
    defaultBillRate: "$35.00",
    defaultPayRate: "$23.00",
    unitType: "Hourly",
    status: "Active",
    colorScheme: {
      bg: "bg-cyan-50",
      text: "text-cyan-800",
      border: "border-cyan-200",
      dot: "bg-cyan-500",
    },
  },
  {
    id: "svc-sls-waiver",
    order: 12,
    name: "SLS Waiver (Supported Living Services)",
    shortName: "SLS Waiver",
    code: "SLS-WVR",
    category: "Adult Waivers",
    description: "Supports adults with intellectual or developmental disabilities who live in their own homes or family homes to maintain independence.",
    defaultBillRate: "$32.00",
    defaultPayRate: "$21.50",
    unitType: "Hourly",
    status: "Active",
    colorScheme: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      dot: "bg-indigo-500",
    },
  },
  {
    id: "svc-dd-waiver",
    order: 13,
    name: "DD Waiver (Developmental Disabilities)",
    shortName: "DD Waiver",
    code: "DD-WVR",
    category: "Adult Waivers",
    description: "Comprehensive waiver providing 24/7 residential habilitation, day habilitation, supported employment, and behavioral services.",
    defaultBillRate: "$36.00",
    defaultPayRate: "$24.00",
    unitType: "Hourly",
    status: "Active",
    colorScheme: {
      bg: "bg-violet-50",
      text: "text-violet-700",
      border: "border-violet-200",
      dot: "bg-violet-500",
    },
  },
  {
    id: "svc-ebd-waiver",
    order: 14,
    name: "EBD Waiver (Elderly, Blind, and Disabled)",
    shortName: "EBD Waiver",
    code: "EBD-WVR",
    category: "Adult Waivers",
    description: "Medicaid waiver for individuals aged 65 and older or disabled adults aged 18-64 who qualify for nursing facility level of care.",
    defaultBillRate: "$30.00",
    defaultPayRate: "$20.00",
    unitType: "Hourly",
    status: "Active",
    colorScheme: {
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-200",
      dot: "bg-yellow-600",
    },
  },
  {
    id: "svc-cih-waiver",
    order: 15,
    name: "CIH Waiver (Complementary and Integrative Health)",
    shortName: "CIH Waiver",
    code: "CIH-WVR",
    category: "Adult Waivers",
    description: "Waiver offering spinal cord injury and qualifying clients supportive care alongside acupuncture, chiropractic care, and massage therapy.",
    defaultBillRate: "$48.00",
    defaultPayRate: "$32.00",
    unitType: "Hourly",
    status: "Active",
    colorScheme: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
  },
  {
    id: "svc-wego-events",
    order: 16,
    name: "WeGo Community Events",
    shortName: "WeGo Events",
    code: "WEGO-COMM",
    category: "Community & Engagement",
    description: "Community engagement, social outings, inclusive peer recreational activities, life skills workshops, and adaptive family gatherings.",
    defaultBillRate: "$25.00",
    defaultPayRate: "$18.00",
    unitType: "Hourly",
    status: "Active",
    colorScheme: {
      bg: "bg-teal-50",
      text: "text-teal-800",
      border: "border-teal-200",
      dot: "bg-teal-600",
    },
  },
  {
    id: "svc-other",
    order: 17,
    name: "Other",
    shortName: "Other",
    code: "SVC-OTHER",
    category: "Other",
    description: "Custom specialized care arrangements, self-pay agreements, or non-standard case manager authorizations.",
    defaultBillRate: "$30.00",
    defaultPayRate: "$20.00",
    unitType: "Hourly",
    status: "Active",
    colorScheme: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      dot: "bg-slate-400",
    },
  },
];

/**
 * Array of all 17 service names for easy dropdown iteration
 */
export const LILISARE_SERVICE_NAMES: string[] = LILISARE_SERVICES.map((s) => s.name);

/**
 * Unique list of service categories
 */
export const LILISARE_SERVICE_CATEGORIES = Array.from(
  new Set(LILISARE_SERVICES.map((s) => s.category))
);

/**
 * Find service by exact name or case-insensitive matching
 */
export function getLiliSareServiceByName(name: string): LiliSareServiceItem | undefined {
  if (!name) return undefined;
  const lower = name.trim().toLowerCase();
  return LILISARE_SERVICES.find(
    (s) =>
      s.name.toLowerCase() === lower ||
      s.shortName.toLowerCase() === lower ||
      s.code.toLowerCase() === lower
  );
}

/**
 * Find service by code
 */
export function getLiliSareServiceByCode(code: string): LiliSareServiceItem | undefined {
  if (!code) return undefined;
  return LILISARE_SERVICES.find((s) => s.code.toLowerCase() === code.trim().toLowerCase());
}
