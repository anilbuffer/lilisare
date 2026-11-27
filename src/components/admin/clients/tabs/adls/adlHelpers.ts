import {
  AdlAssessmentItem,
  AdlDayKey,
  AdlDaySchedule,
  AdlFrequencyType,
  AdlTimeSlot,
  AdlWeeklySchedule,
} from "@/types/client";

export const ADL_DAYS: Array<{ key: AdlDayKey; short: string; mini: string; full: string }> = [
  { key: "mon", short: "MON", mini: "M", full: "Monday" },
  { key: "tue", short: "TUE", mini: "T", full: "Tuesday" },
  { key: "wed", short: "WED", mini: "W", full: "Wednesday" },
  { key: "thu", short: "THU", mini: "T", full: "Thursday" },
  { key: "fri", short: "FRI", mini: "F", full: "Friday" },
  { key: "sat", short: "SAT", mini: "S", full: "Saturday" },
  { key: "sun", short: "SUN", mini: "S", full: "Sunday" },
];

export const ADL_TIME_SLOTS: AdlTimeSlot[] = [
  "Morning",
  "Afternoon",
  "Evening",
  "Bedtime",
];

export const ADL_LEVEL_OPTIONS: AdlAssessmentItem["level"][] = [
  "Independent",
  "Supervision",
  "Minimal Assist",
  "Moderate Assist",
  "Total Dependent",
];

export const ADL_GROUP_OPTIONS = [
  "Personal Care & Hygiene",
  "Mobility & Exercise",
  "Nutrition & Hydration",
  "Medication & Health",
  "Household & Community",
  "Uncategorized",
];

export function createUniformSchedule(
  type: AdlFrequencyType,
  times?: AdlTimeSlot[]
): AdlWeeklySchedule {
  const cell: AdlDaySchedule =
    type === "specific_times"
      ? { type, times: times && times.length > 0 ? times : ["Morning"] }
      : { type };
  return {
    mon: { ...cell },
    tue: { ...cell },
    wed: { ...cell },
    thu: { ...cell },
    fri: { ...cell },
    sat: { ...cell },
    sun: { ...cell },
  };
}

export function inferWeeklySchedule(item: AdlAssessmentItem): AdlWeeklySchedule {
  if (item.weeklySchedule) {
    return item.weeklySchedule;
  }

  const freq = (item.frequency || "").toLowerCase();

  if (freq.includes("as needed") || freq.includes("prn")) {
    return createUniformSchedule("as_needed");
  }
  if (freq.includes("three times") || freq.includes("9am")) {
    return createUniformSchedule("specific_times", ["Morning", "Afternoon", "Evening"]);
  }
  if (freq.includes("twice") || freq.includes("morning") && freq.includes("evening")) {
    return createUniformSchedule("specific_times", ["Morning", "Evening"]);
  }
  if (freq.includes("evening") || freq.includes("bedtime")) {
    return createUniformSchedule("specific_times", ["Evening"]);
  }
  if (freq.includes("morning")) {
    return createUniformSchedule("specific_times", ["Morning"]);
  }
  if (freq.includes("bi-weekly") || freq.includes("2x")) {
    return {
      mon: { type: "never" },
      tue: { type: "always" },
      wed: { type: "never" },
      thu: { type: "never" },
      fri: { type: "always" },
      sat: { type: "never" },
      sun: { type: "never" },
    };
  }

  return createUniformSchedule("always");
}

export function getAllColumnState(schedule: AdlWeeklySchedule): {
  isUniform: boolean;
  cell: AdlDaySchedule;
} {
  const days = ADL_DAYS.map((d) => schedule[d.key]);
  const first = days[0];
  const firstTimes = (first.times || []).slice().sort().join(",");

  const isUniform = days.every((d) => {
    if (d.type !== first.type) return false;
    if (first.type === "specific_times") {
      return (d.times || []).slice().sort().join(",") === firstTimes;
    }
    return true;
  });

  return {
    isUniform,
    cell: isUniform ? first : { type: "never" },
  };
}

export function summarizeWeeklySchedule(schedule: AdlWeeklySchedule): string {
  const { isUniform, cell } = getAllColumnState(schedule);
  if (isUniform) {
    if (cell.type === "always") return "Daily (Always)";
    if (cell.type === "as_needed") return "As Needed (PRN)";
    if (cell.type === "never") return "Not Scheduled";
    return `Daily (${(cell.times || ["Morning"]).join(", ")})`;
  }
  const activeCount = ADL_DAYS.filter((d) => schedule[d.key].type !== "never").length;
  return `${activeCount} days / week`;
}

export interface AdlPresetTemplate {
  name: string;
  category: "ADL" | "IADL";
  group: string;
  level: AdlAssessmentItem["level"];
  instructions: string;
  instructionsEs: string;
  weeklySchedule: AdlWeeklySchedule;
}

export const ADL_CLINICAL_PRESETS: AdlPresetTemplate[] = [
  {
    name: "Bathing & Showering",
    category: "ADL",
    group: "Personal Care & Hygiene",
    level: "Minimal Assist",
    instructions: "Standby supervision in walk-in shower. Place shower chair and non-slip mat.",
    instructionsEs: "Supervisión en ducha; coloque silla de ducha y tapete antideslizante.",
    weeklySchedule: createUniformSchedule("always"),
  },
  {
    name: "Dressing & Grooming",
    category: "ADL",
    group: "Personal Care & Hygiene",
    level: "Minimal Assist",
    instructions: "Assist with lower extremity garments and shoe fastening; client dresses upper body independently.",
    instructionsEs: "Asistir con prendas inferiores y calzado; el cliente viste parte superior solo.",
    weeklySchedule: createUniformSchedule("always"),
  },
  {
    name: "Toileting & Hygiene",
    category: "ADL",
    group: "Personal Care & Hygiene",
    level: "Independent",
    instructions: "Independent with grab bars installed near toilet.",
    instructionsEs: "Independiente con barras de apoyo instaladas junto al inodoro.",
    weeklySchedule: createUniformSchedule("as_needed"),
  },
  {
    name: "Transfers & Bed Mobility",
    category: "ADL",
    group: "Mobility & Exercise",
    level: "Supervision",
    instructions: "Standby touch supervision when rising from deep armchairs.",
    instructionsEs: "Supervisión de contacto al levantarse de sillones profundos.",
    weeklySchedule: createUniformSchedule("always"),
  },
  {
    name: "Ambulation & Walking",
    category: "ADL",
    group: "Mobility & Exercise",
    level: "Supervision",
    instructions: "Requires 4-wheeled rolling walker with active brakes on all surfaces.",
    instructionsEs: "Requiere andador de 4 ruedas con frenos activos en todas las superficies.",
    weeklySchedule: createUniformSchedule("always"),
  },
  {
    name: "Meal Preparation",
    category: "IADL",
    group: "Nutrition & Hydration",
    level: "Moderate Assist",
    instructions: "Prepare heart-healthy meals; cut foods into bite-size portions.",
    instructionsEs: "Preparar comidas saludables para el corazón; cortar alimentos en trozos pequeños.",
    weeklySchedule: createUniformSchedule("specific_times", ["Morning", "Afternoon", "Evening"]),
  },
  {
    name: "Medication Reminders",
    category: "IADL",
    group: "Medication & Health",
    level: "Minimal Assist",
    instructions: "Prompt client to retrieve pre-sorted organizer from counter with water.",
    instructionsEs: "Recordar al cliente tomar su organizador de medicamentos con agua.",
    weeklySchedule: createUniformSchedule("specific_times", ["Morning", "Afternoon", "Evening"]),
  },
  {
    name: "Housekeeping & Laundry",
    category: "IADL",
    group: "Household & Community",
    level: "Total Dependent",
    instructions: "Caregiver washes bed linens and vacuums walkway clear of cords.",
    instructionsEs: "El cuidador lava la ropa de cama y mantiene los pasillos despejados.",
    weeklySchedule: {
      mon: { type: "never" },
      tue: { type: "always" },
      wed: { type: "never" },
      thu: { type: "never" },
      fri: { type: "always" },
      sat: { type: "never" },
      sun: { type: "never" },
    },
  },
  {
    name: "Transportation & Escort",
    category: "IADL",
    group: "Household & Community",
    level: "Moderate Assist",
    instructions: "Assist into passenger seat for physician follow-ups; store walker in trunk.",
    instructionsEs: "Asistir al asiento del pasajero para citas médicas; guardar andador.",
    weeklySchedule: createUniformSchedule("as_needed"),
  },
];
