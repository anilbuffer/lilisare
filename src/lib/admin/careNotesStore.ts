import {
  CareNote,
  CareNoteSection,
  CareNoteVersion,
  CareNoteReview,
  CareNoteCorrection,
  CareNoteFlag,
  CareNoteRule,
  CareNoteTemplate,
  CareNoteAuditEvent,
  CareNoteReviewer,
  CareNotesKpiSummary,
} from "@/types/careNotes";

export const CARE_NOTES_STORAGE_KEY = "lilisare_care_notes_v1";
export const CARE_NOTES_RULES_KEY = "lilisare_care_notes_rules_v1";
export const CARE_NOTES_TEMPLATES_KEY = "lilisare_care_notes_templates_v1";
export const CARE_NOTES_AUDIT_KEY = "lilisare_care_notes_audit_v1";
export const CARE_NOTES_SYNC_EVENT = "lilisare_care_notes_sync";

export const DEMO_DATE = "2026-11-26";

export const CARE_NOTE_REVIEWERS: CareNoteReviewer[] = [
  {
    id: "REV-1",
    name: "Dana Jenkins, MSW",
    role: "Agency Operations Admin",
    email: "dana.jenkins@lilisare.com",
    avatarInitials: "DJ",
  },
  {
    id: "REV-2",
    name: "Carlos Mendez, RN",
    role: "Clinical Supervisor",
    email: "carlos.mendez@lilisare.com",
    avatarInitials: "CM",
  },
  {
    id: "REV-3",
    name: "Sarah Alverez",
    role: "Billing & Compliance Auditor",
    email: "sarah.alverez@lilisare.com",
    avatarInitials: "SA",
  },
  {
    id: "REV-4",
    name: "Marcus Vance",
    role: "Lead Dispatcher & Scheduler",
    email: "marcus.vance@lilisare.com",
    avatarInitials: "MV",
  },
];

// Initial mock rules
export const INITIAL_CARE_NOTE_RULES: CareNoteRule[] = [
  {
    id: "RULE-101",
    agencyId: "AGY-COLUMBUS",
    programId: "PRG-HCBS",
    programName: "Medicaid HCBS Waiver",
    serviceCategory: "Personal Care",
    serviceCode: "T1019",
    requirementName: "HCBS Personal Care Comprehensive Documentation",
    requirementDescription:
      "All Personal Care shifts must document specific ADL assists, mobility assistance, client response, and safety verification within 24 hours of shift completion.",
    requirementType: "required",
    requiredSections: ["ADL & Personal Care Assist", "Mobility & Transfers", "Client Response & Safety Check"],
    conditionalRequirements: "Skin inspection mandatory if bedbound or wheelchair-bound > 4 hours.",
    validationInstructions: "Flag note if ADL assist is vague (e.g., 'Helped client' without naming specific tasks).",
    effectiveFrom: "2026-01-01",
    status: "active",
    updatedBy: "Dana Jenkins, MSW",
    updatedAt: "2026-10-15 09:30",
  },
  {
    id: "RULE-102",
    agencyId: "AGY-COLUMBUS",
    programId: "PRG-PASSPORT",
    programName: "Ohio PASSPORT Waiver",
    serviceCategory: "Homemaker",
    serviceCode: "S5130",
    requirementName: "PASSPORT Homemaker & Chore Documentation Standard",
    requirementDescription:
      "Household chore documentation must itemize kitchen sanitation, laundry cycles completed, and nutritional meal prep support.",
    requirementType: "required",
    requiredSections: ["Homemaker Tasks Itemization", "Nutritional Support & Meal Prep", "Client Well-Being Observation"],
    conditionalRequirements: "Deep sanitation required for client respiratory health precautions.",
    validationInstructions: "Ensure meal items provided align with dietary plan restrictions.",
    effectiveFrom: "2026-02-01",
    status: "active",
    updatedBy: "Sarah Alverez",
    updatedAt: "2026-09-20 14:15",
  },
  {
    id: "RULE-103",
    agencyId: "AGY-COLUMBUS",
    programId: "PRG-IHSS",
    programName: "IHSS Attendant Program",
    serviceCategory: "Attendant Care",
    serviceCode: "T1005",
    requirementName: "IHSS Caregiver Documentation & Independence Support",
    requirementDescription:
      "Self-directed attendant care documentation requires verifying client self-direction participation, cueing, and transfer safety.",
    requirementType: "required",
    requiredSections: ["Self-Direction & Cueing", "Direct Support Tasks", "Environmental Safety"],
    validationInstructions: "Caregiver must verify whether client directed tasks or required direct physical intervention.",
    effectiveFrom: "2026-03-01",
    status: "active",
    updatedBy: "Dana Jenkins, MSW",
    updatedAt: "2026-08-11 11:00",
  },
  {
    id: "RULE-104",
    agencyId: "AGY-COLUMBUS",
    programId: "PRG-DODD",
    programName: "DODD Supported Living",
    serviceCategory: "Respite Care",
    serviceCode: "S5150",
    requirementName: "Respite Service & Family Relief Documentation",
    requirementDescription:
      "Respite notes must record primary caregiver relief period, client engagement activities, behavioral observations, and medication cueing.",
    requirementType: "conditional",
    requiredSections: ["Relief Care Duration & Engagement", "Behavioral Observations & Milieu", "Departure Handover"],
    conditionalRequirements: "Behavioral incident report mandatory if client exhibits level 2 de-escalation needs.",
    validationInstructions: "Must confirm handoff back to family or primary guardian at shift end.",
    effectiveFrom: "2026-04-15",
    status: "active",
    updatedBy: "Carlos Mendez, RN",
    updatedAt: "2026-10-02 16:45",
  },
  {
    id: "RULE-105",
    agencyId: "AGY-COLUMBUS",
    programId: "PRG-SKILLED",
    programName: "Private Duty & Skilled Nursing",
    serviceCategory: "CNA / Skilled Monitoring",
    serviceCode: "G0299",
    requirementName: "Skilled Observation & Vital Sign Verification",
    requirementDescription:
      "Direct observation, vitals assessment (BP, HR, SpO2), catheter/wound care observation, and RN supervisory notification.",
    requirementType: "required",
    requiredSections: ["Vital Signs & Clinical Observations", "Interventions & Care Plan Adherence", "RN Notification & Escalation"],
    conditionalRequirements: "Immediate RN telephone notification required if systolic BP > 160 or < 90 mmHg.",
    validationInstructions: "Full vital signs must be recorded; blank systolic/diastolic blocks approval.",
    effectiveFrom: "2026-01-01",
    status: "active",
    updatedBy: "Carlos Mendez, RN",
    updatedAt: "2026-11-01 10:20",
  },
];

// Initial mock templates
export const INITIAL_CARE_NOTE_TEMPLATES: CareNoteTemplate[] = [
  {
    id: "TMPL-01",
    templateName: "Standard Personal Care Note (T1019)",
    description: "Standard daily note structure for personal care, ADL assistance, and patient safety checks.",
    programId: "PRG-HCBS",
    programName: "Medicaid HCBS Waiver",
    serviceCategory: "Personal Care",
    serviceCode: "T1019",
    version: "2.1",
    status: "active",
    effectiveDate: "2026-01-01",
    lastUpdatedBy: "Dana Jenkins, MSW",
    lastUpdatedAt: "2026-10-15 10:00",
    sections: [
      {
        key: "adl_support",
        title: "ADL & Personal Care Assist",
        description: "Specify bathing, grooming, dressing, oral hygiene, and peri-care provided.",
        required: true,
        placeholder: "Describe specific assistance provided for bathing, dressing, toileting, or oral care...",
        guidance: "Avoid broad terms like 'helped with everything'. Name the exact tasks and level of assistance.",
      },
      {
        key: "mobility_transfers",
        title: "Mobility & Transfers",
        description: "Document ambulatory assistance, gait belt usage, pivot transfers, or wheelchair mobility.",
        required: true,
        placeholder: "Detail transfers between bed, chair, commode, and ambulation distance or assistive devices...",
        guidance: "Record assistive devices used (e.g. rolling walker, quad cane, slide board).",
      },
      {
        key: "client_response",
        title: "Client Response & Safety Check",
        description: "Client pain report, mood, cognitive status, home safety hazards cleared, and departure status.",
        required: true,
        placeholder: "Document client demeanor, physical comfort, safety rails checked, call bell placed in reach...",
        guidance: "Always confirm call bell, hydration, and emergency pathway safety before departure.",
      },
    ],
  },
  {
    id: "TMPL-02",
    templateName: "Homemaker & Nutritional Care Note (S5130)",
    description: "Structured record for chore services, food safety, kitchen sanitation, and client meal planning.",
    programId: "PRG-PASSPORT",
    programName: "Ohio PASSPORT Waiver",
    serviceCategory: "Homemaker",
    serviceCode: "S5130",
    version: "1.4",
    status: "active",
    effectiveDate: "2026-02-01",
    lastUpdatedBy: "Sarah Alverez",
    lastUpdatedAt: "2026-09-20 14:00",
    sections: [
      {
        key: "homemaker_tasks",
        title: "Homemaker Tasks Itemization",
        description: "List household sanitation, dust removal, dishwashing, bed linen changes, and trash removal.",
        required: true,
        placeholder: "Record specific rooms cleaned, linen changed, surfaces sanitized...",
      },
      {
        key: "nutritional_support",
        title: "Nutritional Support & Meal Prep",
        description: "Breakfast/lunch/dinner prepared, food portioning, refrigeration date labeling, and hydration.",
        required: true,
        placeholder: "Detail meals prepared, dietary considerations followed, fluids provided...",
      },
      {
        key: "client_wellbeing",
        title: "Client Well-Being Observation",
        description: "General household atmosphere, client interaction, safety observations.",
        required: true,
        placeholder: "Observations on client mood, conversation, home environment state...",
      },
    ],
  },
  {
    id: "TMPL-03",
    templateName: "CNA & Skilled Observation Note (G0299)",
    description: "Clinical monitoring note capturing vital signs, catheter/skin checks, and supervisory communications.",
    programId: "PRG-SKILLED",
    programName: "Private Duty & Skilled Nursing",
    serviceCategory: "CNA / Skilled Monitoring",
    serviceCode: "G0299",
    version: "3.0",
    status: "active",
    effectiveDate: "2026-01-01",
    lastUpdatedBy: "Carlos Mendez, RN",
    lastUpdatedAt: "2026-11-01 10:15",
    sections: [
      {
        key: "vital_signs",
        title: "Vital Signs & Clinical Observations",
        description: "Systolic/Diastolic BP, Heart Rate, Respiratory Rate, Oxygen Saturation, Blood Glucose if ordered.",
        required: true,
        placeholder: "BP: 124/78 mmHg, HR: 72 bpm, Resp: 16/min, SpO2: 98% room air...",
        guidance: "Must include complete readings. Zero or empty readings trigger validation blockage.",
      },
      {
        key: "interventions",
        title: "Interventions & Care Plan Adherence",
        description: "Repositioning schedule, compression stockings, hydration, intake/output logging.",
        required: true,
        placeholder: "Skin inspected over sacrum and heels (intact). TED hose applied at 08:30...",
      },
      {
        key: "clinical_escalation",
        title: "RN Notification & Escalation",
        description: "Log whether supervising RN was contacted or if patient showed clinical variance.",
        required: true,
        placeholder: "No acute changes noted. Supervisor RN Carlos Mendez briefed via routine log...",
      },
    ],
  },
  {
    id: "TMPL-04",
    templateName: "Respite & Family Relief Care Note (S5150)",
    description: "Documenting respite relief duration, community or home engagement, and caregiver handoff.",
    programId: "PRG-DODD",
    programName: "DODD Supported Living",
    serviceCategory: "Respite Care",
    serviceCode: "S5150",
    version: "1.2",
    status: "active",
    effectiveDate: "2026-04-15",
    lastUpdatedBy: "Carlos Mendez, RN",
    lastUpdatedAt: "2026-10-02 16:30",
    sections: [
      {
        key: "relief_duration",
        title: "Relief Care Duration & Engagement",
        description: "Primary caregiver departure time, return time, recreational activities engaged.",
        required: true,
        placeholder: "Relieved daughter at 13:00. Engaged client in sensory puzzles and courtyard walk...",
      },
      {
        key: "behavioral_milieu",
        title: "Behavioral Observations & Milieu",
        description: "Mood stability, emotional regulation, response to environmental cues.",
        required: true,
        placeholder: "Client was calm, responsive, smiled during music playlist listening...",
      },
      {
        key: "departure_handover",
        title: "Departure Handover",
        description: "Condition report given to returning family member or next caregiver.",
        required: true,
        placeholder: "Primary caregiver returned at 17:00. Debriefed on fluids, toileting, and snacks...",
      },
    ],
  },
];

// Initial mock care notes reflecting scenarios A-G
export const INITIAL_CARE_NOTES: CareNote[] = [
  // Scenario A: Complete note - Clean, submitted on time, ready for or recently approved
  {
    id: "CN-4001",
    clientId: "CL-2041",
    clientName: "Sarah Johnson",
    caregiverId: "CG-1084",
    caregiverName: "Hannah Miller",
    caregiverClassification: "Home Health Aide (HHA)",
    visitId: "VIS-1003",
    serviceId: "SRV-T1019",
    serviceType: "Personal Care",
    serviceCode: "T1019",
    programId: "PRG-HCBS",
    programName: "Medicaid HCBS Waiver",
    agencyId: "AGY-COLUMBUS",
    agencyName: "Columbus Metro Office",
    serviceDate: "2026-11-25",
    submittedAt: "2026-11-25 16:45",
    scheduledTime: "08:00 - 12:00",
    actualVisitTime: "08:02 - 12:05 (4 hrs 3 mins)",
    evvStatus: "verified",
    submissionStatus: "submitted",
    reviewStatus: "pending_review",
    qualityStatus: "complete",
    correctionStatus: "not_required",
    priority: "medium",
    currentVersion: 1,
    assignedReviewerId: "REV-1",
    assignedReviewerName: "Dana Jenkins, MSW",
    sections: [
      {
        id: "SEC-4001-1",
        sectionKey: "adl_support",
        sectionTitle: "ADL & Personal Care Assist",
        content:
          "Assisted client with shower transfer using grab bar and shower chair. Provided hands-on assist with washing back and lower extremities. Assisted with oral hygiene and hair combing. Guided client into fresh cotton shirt and pull-on slacks with light assistance.",
        required: true,
        completionStatus: "complete",
        aiDrafted: false,
      },
      {
        id: "SEC-4001-2",
        sectionKey: "mobility_transfers",
        sectionTitle: "Mobility & Transfers",
        content:
          "Client ambulated with four-wheel rolling walker inside apartment. Guarded closely during kitchen to living room transfers. Client maintained steady gait with no loss of balance. Lock brakes verified on walker before seated transfers.",
        required: true,
        completionStatus: "complete",
        aiDrafted: false,
      },
      {
        id: "SEC-4001-3",
        sectionKey: "client_response",
        sectionTitle: "Client Response & Safety Check",
        content:
          "Client was alert, oriented x3, and reported zero pain during shift. Prepared light breakfast of oatmeal and hot tea; client consumed 100%. Ensured pathway to bathroom was clear of rugs. Call pendant placed around client's neck and water tumbler filled at bedside before departure.",
        required: true,
        completionStatus: "complete",
        aiDrafted: false,
      },
    ],
    versions: [
      {
        id: "VER-4001-1",
        noteId: "CN-4001",
        versionNumber: 1,
        contentSnapshot: [],
        submittedBy: "Hannah Miller",
        submittedByRole: "Caregiver (HHA)",
        submittedAt: "2026-11-25 16:45",
        createdAt: "2026-11-25 16:45",
      },
    ],
    corrections: [],
    flags: [],
    reviews: [],
    createdAt: "2026-11-25 16:45",
    updatedAt: "2026-11-25 16:45",
  },

  // Scenario B: Missing information - Configured required section incomplete, admin can request correction
  {
    id: "CN-4002",
    clientId: "CL-2035",
    clientName: "Robert Chen",
    caregiverId: "CG-1085",
    caregiverName: "Sarah Jenkins",
    caregiverClassification: "Direct Care Worker",
    visitId: "VIS-1002",
    serviceId: "SRV-S5150",
    serviceType: "Respite Care",
    serviceCode: "S5150",
    programId: "PRG-DODD",
    programName: "DODD Supported Living",
    agencyId: "AGY-COLUMBUS",
    agencyName: "Columbus Metro Office",
    serviceDate: "2026-11-25",
    submittedAt: "2026-11-25 17:10",
    scheduledTime: "13:00 - 17:00",
    actualVisitTime: "13:05 - 17:02 (3 hrs 57 mins)",
    evvStatus: "verified",
    submissionStatus: "submitted",
    reviewStatus: "pending_review",
    qualityStatus: "missing_required",
    correctionStatus: "not_required",
    priority: "high",
    currentVersion: 1,
    assignedReviewerId: "REV-1",
    assignedReviewerName: "Dana Jenkins, MSW",
    qualityIssues: ["Missing required 'Departure Handover' details under DODD respite rule."],
    sections: [
      {
        id: "SEC-4002-1",
        sectionKey: "relief_duration",
        sectionTitle: "Relief Care Duration & Engagement",
        content: "Relieved primary family caregiver from 13:00 until 17:00. Provided companionship, watched documentary, and assisted with afternoon snack.",
        required: true,
        completionStatus: "complete",
      },
      {
        id: "SEC-4002-2",
        sectionKey: "behavioral_milieu",
        sectionTitle: "Behavioral Observations & Milieu",
        content: "Client was cooperative and engaged. No agitation or behavioral triggers observed.",
        required: true,
        completionStatus: "complete",
      },
      {
        id: "SEC-4002-3",
        sectionKey: "departure_handover",
        sectionTitle: "Departure Handover",
        content: "", // Missing required field!
        required: true,
        completionStatus: "missing",
        validationMessages: ["Section cannot be blank. Must identify the individual receiving handoff and client condition."],
      },
    ],
    versions: [
      {
        id: "VER-4002-1",
        noteId: "CN-4002",
        versionNumber: 1,
        contentSnapshot: [],
        submittedBy: "Sarah Jenkins",
        submittedByRole: "Caregiver (DCW)",
        submittedAt: "2026-11-25 17:10",
        createdAt: "2026-11-25 17:10",
      },
    ],
    corrections: [],
    flags: [],
    reviews: [],
    createdAt: "2026-11-25 17:10",
    updatedAt: "2026-11-25 17:10",
  },

  // Scenario C: Note awaiting review - Submitted, pending in queue, older review age
  {
    id: "CN-4003",
    clientId: "CL-2032",
    clientName: "Eleanor Whitfield",
    caregiverId: "CG-1082",
    caregiverName: "Marcus Johnson",
    caregiverClassification: "Certified Nursing Assistant (CNA)",
    visitId: "VIS-1001",
    serviceId: "SRV-S5130",
    serviceType: "Homemaker",
    serviceCode: "S5130",
    programId: "PRG-PASSPORT",
    programName: "Ohio PASSPORT Waiver",
    agencyId: "AGY-COLUMBUS",
    agencyName: "Columbus Metro Office",
    serviceDate: "2026-11-24",
    submittedAt: "2026-11-24 14:30",
    scheduledTime: "10:00 - 14:00",
    actualVisitTime: "09:58 - 14:02 (4 hrs 4 mins)",
    evvStatus: "verified",
    submissionStatus: "submitted",
    reviewStatus: "pending_review",
    qualityStatus: "complete",
    correctionStatus: "not_required",
    priority: "medium",
    currentVersion: 1,
    assignedReviewerId: "REV-1",
    assignedReviewerName: "Dana Jenkins, MSW",
    sections: [
      {
        id: "SEC-4003-1",
        sectionKey: "homemaker_tasks",
        sectionTitle: "Homemaker Tasks Itemization",
        content:
          "Completed full kitchen sanitation including wiping counters, washing morning dishes, and sanitizing microwave. Vacuumed living area rug and swept hardwood hallway. Laundered two loads of bed linens and towels; folded and placed in linen closet.",
        required: true,
        completionStatus: "complete",
      },
      {
        id: "SEC-4003-2",
        sectionKey: "nutritional_support",
        sectionTitle: "Nutritional Support & Meal Prep",
        content:
          "Prepared roasted turkey breast sandwich on whole wheat with sliced cucumbers. Stored two prepared dinner portions of chicken noodle soup in dated glass containers in refrigerator. Checked milk expiration dates and discarded expired yogurt.",
        required: true,
        completionStatus: "complete",
      },
      {
        id: "SEC-4003-3",
        sectionKey: "client_wellbeing",
        sectionTitle: "Client Well-Being Observation",
        content:
          "Client engaged in cheerful conversation regarding family photos. Mood bright and interactive. Reported appetite was good. Trash bins taken out to collection curb before departure.",
        required: true,
        completionStatus: "complete",
      },
    ],
    versions: [
      {
        id: "VER-4003-1",
        noteId: "CN-4003",
        versionNumber: 1,
        contentSnapshot: [],
        submittedBy: "Marcus Johnson",
        submittedByRole: "Caregiver (CNA)",
        submittedAt: "2026-11-24 14:30",
        createdAt: "2026-11-24 14:30",
      },
    ],
    corrections: [],
    flags: [],
    reviews: [],
    createdAt: "2026-11-24 14:30",
    updatedAt: "2026-11-24 14:30",
  },

  // Scenario D: Correction requested - Admin requested correction, awaiting caregiver resubmission
  {
    id: "CN-4004",
    clientId: "CL-2038",
    clientName: "Mary Thompson",
    caregiverId: "CG-1091",
    caregiverName: "David Kim",
    caregiverClassification: "Certified Nursing Assistant (CNA)",
    visitId: "VIS-1004",
    serviceId: "SRV-G0299",
    serviceType: "CNA / Skilled Monitoring",
    serviceCode: "G0299",
    programId: "PRG-SKILLED",
    programName: "Private Duty & Skilled Nursing",
    agencyId: "AGY-COLUMBUS",
    agencyName: "Columbus Metro Office",
    serviceDate: "2026-11-24",
    submittedAt: "2026-11-24 18:20",
    scheduledTime: "14:00 - 18:00",
    actualVisitTime: "14:02 - 18:00 (3 hrs 58 mins)",
    evvStatus: "verified",
    submissionStatus: "submitted",
    reviewStatus: "correction_requested",
    qualityStatus: "incomplete",
    correctionStatus: "awaiting_caregiver",
    priority: "high",
    currentVersion: 1,
    assignedReviewerId: "REV-2",
    assignedReviewerName: "Carlos Mendez, RN",
    qualityIssues: ["Missing blood pressure reading prior to transfer assist."],
    sections: [
      {
        id: "SEC-4004-1",
        sectionKey: "vital_signs",
        sectionTitle: "Vital Signs & Clinical Observations",
        content: "Heart Rate: 78 bpm, Respiration: 16/min, SpO2: 97% on room air. Client felt warm to touch.",
        required: true,
        completionStatus: "incomplete",
        validationMessages: ["Systolic and Diastolic blood pressure reading missing from skilled vitals panel."],
      },
      {
        id: "SEC-4004-2",
        sectionKey: "interventions",
        sectionTitle: "Interventions & Care Plan Adherence",
        content: "Repositioned client every 2 hours. Applied skin barrier cream to heels. Ensured water pitcher full.",
        required: true,
        completionStatus: "complete",
      },
      {
        id: "SEC-4004-3",
        sectionKey: "clinical_escalation",
        sectionTitle: "RN Notification & Escalation",
        content: "Notified supervisor RN via email portal of warm skin reading. No acute distress noted.",
        required: true,
        completionStatus: "complete",
      },
    ],
    versions: [
      {
        id: "VER-4004-1",
        noteId: "CN-4004",
        versionNumber: 1,
        contentSnapshot: [],
        submittedBy: "David Kim",
        submittedByRole: "Caregiver (CNA)",
        submittedAt: "2026-11-24 18:20",
        createdAt: "2026-11-24 18:20",
      },
    ],
    corrections: [
      {
        id: "CORR-901",
        noteId: "CN-4004",
        requestedBy: "Dana Jenkins, MSW",
        requestedByRole: "Agency Operations Admin",
        requestedAt: "2026-11-25 10:15",
        reason: "Missing Mandatory Blood Pressure Reading",
        affectedSections: ["vital_signs"],
        caregiverInstructions:
          "Please log the exact systolic/diastolic blood pressure measured during the shift. Skilled G0299 documentation requires complete vital signs for billing and clinical monitoring.",
        dueDate: "2026-11-27 17:00",
        status: "awaiting_caregiver",
      },
    ],
    flags: [],
    reviews: [
      {
        id: "REVW-801",
        noteId: "CN-4004",
        reviewerId: "REV-1",
        reviewerName: "Dana Jenkins, MSW",
        reviewerRole: "Agency Operations Admin",
        reviewStatus: "correction_requested",
        reviewNotes: "Returned to caregiver David Kim for missing BP vitals.",
        reviewedAt: "2026-11-25 10:15",
      },
    ],
    createdAt: "2026-11-24 18:20",
    updatedAt: "2026-11-25 10:15",
  },

  // Scenario E: Resubmitted note - New version available after correction, version comparison active
  {
    id: "CN-4005",
    clientId: "CL-2044",
    clientName: "Arthur Pendelton",
    caregiverId: "CG-1093",
    caregiverName: "Elena Rostova",
    caregiverClassification: "Home Health Aide (HHA)",
    visitId: "VIS-1005",
    serviceId: "SRV-T1005",
    serviceType: "Attendant Care",
    serviceCode: "T1005",
    programId: "PRG-IHSS",
    programName: "IHSS Attendant Program",
    agencyId: "AGY-COLUMBUS",
    agencyName: "Columbus Metro Office",
    serviceDate: "2026-11-23",
    submittedAt: "2026-11-25 11:30", // resubmitted timestamp
    scheduledTime: "09:00 - 13:00",
    actualVisitTime: "08:55 - 13:02 (4 hrs 7 mins)",
    evvStatus: "verified",
    submissionStatus: "resubmitted",
    reviewStatus: "pending_review",
    qualityStatus: "complete",
    correctionStatus: "resubmitted",
    priority: "medium",
    currentVersion: 2,
    assignedReviewerId: "REV-1",
    assignedReviewerName: "Dana Jenkins, MSW",
    sections: [
      {
        id: "SEC-4005-1",
        sectionKey: "self_direction",
        sectionTitle: "Self-Direction & Cueing",
        content:
          "Client directed the daily schedule, requesting morning bath first followed by physical therapy exercises. Provided verbal reminders and stand-by cueing for medication self-administration from pre-sorted pill organizer.",
        required: true,
        completionStatus: "complete",
      },
      {
        id: "SEC-4005-2",
        sectionKey: "direct_support",
        sectionTitle: "Direct Support Tasks",
        content:
          "Assisted client with transferring into shower and washing lower back. Applied moisturising lotion to dry skin on arms and legs. Assisted with buttoning shirt and fastening orthotic ankle brace on right foot. (UPDATED V2: Detailed ankle brace fastening and transfer steps per correction request).",
        required: true,
        completionStatus: "complete",
      },
      {
        id: "SEC-4005-3",
        sectionKey: "environmental_safety",
        sectionTitle: "Environmental Safety",
        content:
          "Checked wheelchair footplates and tire pressure. Ensured pathway from bedroom to kitchen remained unobstructed. Left emergency pendant in reach on dining table.",
        required: true,
        completionStatus: "complete",
      },
    ],
    versions: [
      {
        id: "VER-4005-1",
        noteId: "CN-4005",
        versionNumber: 1,
        contentSnapshot: [
          {
            id: "SEC-4005-1-V1",
            sectionKey: "self_direction",
            sectionTitle: "Self-Direction & Cueing",
            content: "Client directed tasks.",
            required: true,
            completionStatus: "complete",
          },
          {
            id: "SEC-4005-2-V1",
            sectionKey: "direct_support",
            sectionTitle: "Direct Support Tasks",
            content: "Helped client get dressed and helped with shower.",
            required: true,
            completionStatus: "incomplete",
            validationMessages: ["Too brief. Did not specify assist level or orthotic device."],
          },
          {
            id: "SEC-4005-3-V1",
            sectionKey: "environmental_safety",
            sectionTitle: "Environmental Safety",
            content: "Home was safe.",
            required: true,
            completionStatus: "complete",
          },
        ],
        submittedBy: "Elena Rostova",
        submittedByRole: "Caregiver (HHA)",
        submittedAt: "2026-11-23 15:00",
        changeReason: "Initial caregiver submission",
        createdAt: "2026-11-23 15:00",
      },
      {
        id: "VER-4005-2",
        noteId: "CN-4005",
        versionNumber: 2,
        contentSnapshot: [],
        submittedBy: "Elena Rostova",
        submittedByRole: "Caregiver (HHA)",
        submittedAt: "2026-11-25 11:30",
        changeReason: "Correction: itemized physical assist and orthotic brace installation per admin instructions",
        correctionRequestId: "CORR-892",
        createdAt: "2026-11-25 11:30",
      },
    ],
    corrections: [
      {
        id: "CORR-892",
        noteId: "CN-4005",
        requestedBy: "Dana Jenkins, MSW",
        requestedByRole: "Agency Operations Admin",
        requestedAt: "2026-11-24 09:30",
        reason: "Vague Direct Support Description",
        affectedSections: ["direct_support"],
        caregiverInstructions: "Please detail the specific support provided during bathing and mention the orthotic brace prescribed in the care plan.",
        dueDate: "2026-11-26 17:00",
        status: "resubmitted",
        resubmittedAt: "2026-11-25 11:30",
      },
    ],
    flags: [],
    reviews: [
      {
        id: "REVW-799",
        noteId: "CN-4005",
        reviewerId: "REV-1",
        reviewerName: "Dana Jenkins, MSW",
        reviewerRole: "Agency Operations Admin",
        reviewStatus: "correction_requested",
        reviewNotes: "Requested detailed breakdown of assistive devices.",
        reviewedAt: "2026-11-24 09:30",
      },
    ],
    createdAt: "2026-11-23 15:00",
    updatedAt: "2026-11-25 11:30",
  },

  // Scenario F: Clinical review - Flagged for authorized RN / Clinical Supervisor review
  {
    id: "CN-4006",
    clientId: "CL-2050",
    clientName: "Beatrice Holloway",
    caregiverId: "CG-1094",
    caregiverName: "Brenda Miller",
    caregiverClassification: "State Tested Nursing Assistant (STNA)",
    visitId: "VIS-1006",
    serviceId: "SRV-T1000",
    serviceType: "Specialized Private Duty",
    serviceCode: "T1000",
    programId: "PRG-SKILLED",
    programName: "Private Duty & Skilled Nursing",
    agencyId: "AGY-COLUMBUS",
    agencyName: "Columbus Metro Office",
    serviceDate: "2026-11-25",
    submittedAt: "2026-11-25 19:40",
    scheduledTime: "16:00 - 20:00",
    actualVisitTime: "16:01 - 19:58 (3 hrs 57 mins)",
    evvStatus: "verified",
    submissionStatus: "submitted",
    reviewStatus: "escalated",
    qualityStatus: "flagged",
    correctionStatus: "not_required",
    priority: "urgent",
    currentVersion: 1,
    assignedReviewerId: "REV-2",
    assignedReviewerName: "Carlos Mendez, RN",
    qualityIssues: ["Client exhibited neurological disorientation during shift; referred for clinical assessment."],
    sections: [
      {
        id: "SEC-4006-1",
        sectionKey: "vital_signs",
        sectionTitle: "Vital Signs & Clinical Observations",
        content:
          "BP: 168/98 mmHg (High), HR: 94 bpm, Resp: 20/min, SpO2: 95%. Client appeared mildly disoriented at 17:30, slurring words slightly when asked for the date. Left grip strength noticeably diminished compared to baseline.",
        required: true,
        completionStatus: "complete",
        validationMessages: ["Systolic blood pressure > 160 mmHg triggered clinical supervisory alert."],
      },
      {
        id: "SEC-4006-2",
        sectionKey: "interventions",
        sectionTitle: "Interventions & Care Plan Adherence",
        content:
          "Assisted client to recliner immediately. Called family contact (daughter Linda). Provided sips of room-temperature water. Checked face symmetry (no marked facial droop). Stayed with client at bedside.",
        required: true,
        completionStatus: "complete",
      },
      {
        id: "SEC-4006-3",
        sectionKey: "clinical_escalation",
        sectionTitle: "RN Notification & Escalation",
        content:
          "Contacted on-call supervising RN Carlos Mendez at 17:45. RN advised family to evaluate client for urgent clinic visit. Daughter arrived at 18:20 to transport client to urgent care.",
        required: true,
        completionStatus: "complete",
      },
    ],
    versions: [
      {
        id: "VER-4006-1",
        noteId: "CN-4006",
        versionNumber: 1,
        contentSnapshot: [],
        submittedBy: "Brenda Miller",
        submittedByRole: "Caregiver (STNA)",
        submittedAt: "2026-11-25 19:40",
        createdAt: "2026-11-25 19:40",
      },
    ],
    corrections: [],
    flags: [
      {
        id: "FLG-501",
        noteId: "CN-4006",
        flagType: "clinical",
        flaggedBy: "Dana Jenkins, MSW",
        flaggedAt: "2026-11-26 08:30",
        reason: "Acute Neurological & Blood Pressure Deviation",
        notes: "Elevated BP (168/98) and reported mild speech slurring requires clinical review by RN Carlos Mendez before any administrative sign-off.",
        status: "open",
      },
    ],
    reviews: [
      {
        id: "REVW-810",
        noteId: "CN-4006",
        reviewerId: "REV-1",
        reviewerName: "Dana Jenkins, MSW",
        reviewerRole: "Agency Operations Admin",
        reviewStatus: "escalated",
        reviewNotes: "Escalated note to Clinical Supervisor RN Carlos Mendez for clinical triage.",
        reviewedAt: "2026-11-26 08:30",
      },
    ],
    createdAt: "2026-11-25 19:40",
    updatedAt: "2026-11-26 08:30",
  },

  // Scenario G: Missing expected note - Linked visit exists, 24h passed, no note submitted, flagged overdue
  {
    id: "CN-4007",
    clientId: "CL-2048",
    clientName: "Donald Castillo",
    caregiverId: "CG-1084",
    caregiverName: "Hannah Miller",
    caregiverClassification: "Home Health Aide (HHA)",
    visitId: "VIS-1008",
    serviceId: "SRV-T1019",
    serviceType: "Personal Care",
    serviceCode: "T1019",
    programId: "PRG-HCBS",
    programName: "Medicaid HCBS Waiver",
    agencyId: "AGY-COLUMBUS",
    agencyName: "Columbus Metro Office",
    serviceDate: "2026-11-24",
    submittedAt: null, // Note NOT submitted!
    scheduledTime: "12:00 - 16:00",
    actualVisitTime: "12:03 - 16:01 (3 hrs 58 mins)",
    evvStatus: "verified",
    submissionStatus: "draft",
    reviewStatus: "pending_review",
    qualityStatus: "incomplete",
    correctionStatus: "not_required",
    priority: "urgent",
    currentVersion: 0,
    isOverdue: true,
    isMissing: true,
    qualityIssues: ["Documentation window exceeded 24 hours post-shift completion. No submission recorded."],
    sections: [
      {
        id: "SEC-4007-1",
        sectionKey: "adl_support",
        sectionTitle: "ADL & Personal Care Assist",
        content: "",
        required: true,
        completionStatus: "missing",
      },
      {
        id: "SEC-4007-2",
        sectionKey: "mobility_transfers",
        sectionTitle: "Mobility & Transfers",
        content: "",
        required: true,
        completionStatus: "missing",
      },
      {
        id: "SEC-4007-3",
        sectionKey: "client_response",
        sectionTitle: "Client Response & Safety Check",
        content: "",
        required: true,
        completionStatus: "missing",
      },
    ],
    versions: [],
    corrections: [],
    flags: [
      {
        id: "FLG-502",
        noteId: "CN-4007",
        flagType: "compliance",
        flaggedBy: "System Rule Engine",
        flaggedAt: "2026-11-25 16:01",
        reason: "Mandatory Care Note Missing Beyond 24-Hour SLA",
        notes: "Visit VIS-1008 was EVV-verified on 11/24. Caregiver has not submitted documentation. Automated compliance reminder dispatched.",
        status: "open",
      },
    ],
    reviews: [],
    createdAt: "2026-11-24 16:01",
    updatedAt: "2026-11-25 16:01",
  },

  // Additional realistic notes:
  // CN-4008: Reviewed & Approved note
  {
    id: "CN-4008",
    clientId: "CL-2032",
    clientName: "Eleanor Whitfield",
    caregiverId: "CG-1082",
    caregiverName: "Marcus Johnson",
    caregiverClassification: "Certified Nursing Assistant (CNA)",
    visitId: "VIS-0994",
    serviceId: "SRV-T1019",
    serviceType: "Personal Care",
    serviceCode: "T1019",
    programId: "PRG-HCBS",
    programName: "Medicaid HCBS Waiver",
    agencyId: "AGY-COLUMBUS",
    agencyName: "Columbus Metro Office",
    serviceDate: "2026-11-23",
    submittedAt: "2026-11-23 17:00",
    scheduledTime: "08:00 - 12:00",
    actualVisitTime: "08:00 - 12:00 (4 hrs 0 mins)",
    evvStatus: "verified",
    submissionStatus: "submitted",
    reviewStatus: "approved",
    qualityStatus: "complete",
    correctionStatus: "not_required",
    priority: "low",
    currentVersion: 1,
    assignedReviewerId: "REV-1",
    assignedReviewerName: "Dana Jenkins, MSW",
    sections: [
      {
        id: "SEC-4008-1",
        sectionKey: "adl_support",
        sectionTitle: "ADL & Personal Care Assist",
        content: "Assisted client with sponge bath, facial wash, and morning dressing. Clean clothes selected with client.",
        required: true,
        completionStatus: "complete",
      },
      {
        id: "SEC-4008-2",
        sectionKey: "mobility_transfers",
        sectionTitle: "Mobility & Transfers",
        content: "Guided pivot transfer to bedside commode. Supervised walking with cane around apartment.",
        required: true,
        completionStatus: "complete",
      },
      {
        id: "SEC-4008-3",
        sectionKey: "client_response",
        sectionTitle: "Client Response & Safety Check",
        content: "Client expressed appreciation for assistance. Drank full glass of cranberry juice. Call button verified.",
        required: true,
        completionStatus: "complete",
      },
    ],
    versions: [
      {
        id: "VER-4008-1",
        noteId: "CN-4008",
        versionNumber: 1,
        contentSnapshot: [],
        submittedBy: "Marcus Johnson",
        submittedByRole: "Caregiver (CNA)",
        submittedAt: "2026-11-23 17:00",
        createdAt: "2026-11-23 17:00",
      },
    ],
    corrections: [],
    flags: [],
    reviews: [
      {
        id: "REVW-760",
        noteId: "CN-4008",
        reviewerId: "REV-1",
        reviewerName: "Dana Jenkins, MSW",
        reviewerRole: "Agency Operations Admin",
        reviewStatus: "approved",
        reviewNotes: "Complete and verified against HCBS documentation standards.",
        reviewedAt: "2026-11-24 11:15",
      },
    ],
    createdAt: "2026-11-23 17:00",
    updatedAt: "2026-11-24 11:15",
  },

  // CN-4009: Reviewed Note (Awaiting payroll batch)
  {
    id: "CN-4009",
    clientId: "CL-2041",
    clientName: "Sarah Johnson",
    caregiverId: "CG-1084",
    caregiverName: "Hannah Miller",
    caregiverClassification: "Home Health Aide (HHA)",
    visitId: "VIS-0992",
    serviceId: "SRV-T1019",
    serviceType: "Personal Care",
    serviceCode: "T1019",
    programId: "PRG-HCBS",
    programName: "Medicaid HCBS Waiver",
    agencyId: "AGY-COLUMBUS",
    agencyName: "Columbus Metro Office",
    serviceDate: "2026-11-22",
    submittedAt: "2026-11-22 16:30",
    scheduledTime: "08:00 - 12:00",
    actualVisitTime: "08:05 - 12:05 (4 hrs 0 mins)",
    evvStatus: "verified",
    submissionStatus: "submitted",
    reviewStatus: "reviewed",
    qualityStatus: "complete",
    correctionStatus: "not_required",
    priority: "low",
    currentVersion: 1,
    assignedReviewerId: "REV-1",
    assignedReviewerName: "Dana Jenkins, MSW",
    sections: [
      {
        id: "SEC-4009-1",
        sectionKey: "adl_support",
        sectionTitle: "ADL & Personal Care Assist",
        content: "Assisted with tub transfer, upper body washing, grooming, and denture cleaning.",
        required: true,
        completionStatus: "complete",
      },
      {
        id: "SEC-4009-2",
        sectionKey: "mobility_transfers",
        sectionTitle: "Mobility & Transfers",
        content: "Rolling walker used. Close contact guard maintained during all transfers.",
        required: true,
        completionStatus: "complete",
      },
      {
        id: "SEC-4009-3",
        sectionKey: "client_response",
        sectionTitle: "Client Response & Safety Check",
        content: "Client cheerful, engaged. Checked telephone and verified nightlight operation.",
        required: true,
        completionStatus: "complete",
      },
    ],
    versions: [],
    corrections: [],
    flags: [],
    reviews: [
      {
        id: "REVW-755",
        noteId: "CN-4009",
        reviewerId: "REV-1",
        reviewerName: "Dana Jenkins, MSW",
        reviewerRole: "Agency Operations Admin",
        reviewStatus: "reviewed",
        reviewNotes: "All operational checks satisfied.",
        reviewedAt: "2026-11-23 10:00",
      },
    ],
    createdAt: "2026-11-22 16:30",
    updatedAt: "2026-11-23 10:00",
  },

  // CN-4010: Flagged for Compliance Review (Discrepancy in reported service hours vs EVV)
  {
    id: "CN-4010",
    clientId: "CL-2035",
    clientName: "Robert Chen",
    caregiverId: "CG-1085",
    caregiverName: "Sarah Jenkins",
    caregiverClassification: "Direct Care Worker",
    visitId: "VIS-0988",
    serviceId: "SRV-S5150",
    serviceType: "Respite Care",
    serviceCode: "S5150",
    programId: "PRG-DODD",
    programName: "DODD Supported Living",
    agencyId: "AGY-COLUMBUS",
    agencyName: "Columbus Metro Office",
    serviceDate: "2026-11-21",
    submittedAt: "2026-11-21 19:15",
    scheduledTime: "13:00 - 17:00",
    actualVisitTime: "13:45 - 17:00 (3 hrs 15 mins)",
    evvStatus: "exception",
    submissionStatus: "submitted",
    reviewStatus: "escalated",
    qualityStatus: "flagged",
    correctionStatus: "not_required",
    priority: "high",
    currentVersion: 1,
    assignedReviewerId: "REV-3",
    assignedReviewerName: "Sarah Alverez",
    qualityIssues: ["Shift duration in note claims 4.0 hours, but EVV geo-stamp confirms 3.25 hours."],
    sections: [
      {
        id: "SEC-4010-1",
        sectionKey: "relief_duration",
        sectionTitle: "Relief Care Duration & Engagement",
        content: "Provided 4 hours of continuous family respite care from 13:00 to 17:00 as scheduled.",
        required: true,
        completionStatus: "complete",
      },
      {
        id: "SEC-4010-2",
        sectionKey: "behavioral_milieu",
        sectionTitle: "Behavioral Observations & Milieu",
        content: "Client was relaxed, participated in arts and crafts, listened to audiobooks.",
        required: true,
        completionStatus: "complete",
      },
      {
        id: "SEC-4010-3",
        sectionKey: "departure_handover",
        sectionTitle: "Departure Handover",
        content: "Father returned at 17:00. Handed over care and briefed on medication reminder given.",
        required: true,
        completionStatus: "complete",
      },
    ],
    versions: [],
    corrections: [],
    flags: [
      {
        id: "FLG-503",
        noteId: "CN-4010",
        flagType: "compliance",
        flaggedBy: "Sarah Alverez",
        flaggedAt: "2026-11-22 14:00",
        reason: "Time Variance: Note claims 4.0 hrs vs EVV clock-in 13:45",
        notes: "Caregiver arrived 45 mins late per GPS EVV telemetry. Requires compliance verification before billing approval.",
        status: "open",
      },
    ],
    reviews: [
      {
        id: "REVW-742",
        noteId: "CN-4010",
        reviewerId: "REV-3",
        reviewerName: "Sarah Alverez",
        reviewerRole: "Billing & Compliance Auditor",
        reviewStatus: "escalated",
        reviewNotes: "Flagged for Compliance time verification.",
        reviewedAt: "2026-11-22 14:00",
      },
    ],
    createdAt: "2026-11-21 19:15",
    updatedAt: "2026-11-22 14:00",
  },
];

// Initial mock audit events
export const INITIAL_CARE_NOTE_AUDIT_EVENTS: CareNoteAuditEvent[] = [
  {
    id: "AUD-1001",
    timestamp: "2026-11-26 08:30:14",
    noteId: "CN-4006",
    clientId: "CL-2050",
    clientName: "Beatrice Holloway",
    caregiverId: "CG-1094",
    caregiverName: "Brenda Miller",
    action: "FLAGGED_FOR_CLINICAL_REVIEW",
    previousValue: "pending_review",
    newValue: "escalated",
    user: "Dana Jenkins, MSW",
    role: "Agency Operations Admin",
    reason: "Elevated BP (168/98) and reported neurological slurring routed to RN Carlos Mendez.",
  },
  {
    id: "AUD-1002",
    timestamp: "2026-11-25 16:01:00",
    noteId: "CN-4007",
    clientId: "CL-2048",
    clientName: "Donald Castillo",
    caregiverId: "CG-1084",
    caregiverName: "Hannah Miller",
    action: "MARKED_OVERDUE_BY_RULE_ENGINE",
    previousValue: "on_time",
    newValue: "overdue",
    user: "System Rule Engine",
    role: "Automated Compliance",
    reason: "24-hour documentation SLA lapsed for verified visit VIS-1008.",
  },
  {
    id: "AUD-1003",
    timestamp: "2026-11-25 11:30:45",
    noteId: "CN-4005",
    clientId: "CL-2044",
    clientName: "Arthur Pendelton",
    caregiverId: "CG-1093",
    caregiverName: "Elena Rostova",
    action: "NOTE_RESUBMITTED",
    previousValue: "Version 1 (awaiting_caregiver)",
    newValue: "Version 2 (resubmitted)",
    user: "Elena Rostova",
    role: "Caregiver (HHA)",
    reason: "Caregiver updated direct support details and orthotic brace installation per correction instructions.",
  },
  {
    id: "AUD-1004",
    timestamp: "2026-11-25 10:15:20",
    noteId: "CN-4004",
    clientId: "CL-2038",
    clientName: "Mary Thompson",
    caregiverId: "CG-1091",
    caregiverName: "David Kim",
    action: "CORRECTION_REQUESTED",
    previousValue: "pending_review",
    newValue: "correction_requested",
    user: "Dana Jenkins, MSW",
    role: "Agency Operations Admin",
    reason: "Missing mandatory blood pressure readings required under G0299 skilled service rule.",
  },
  {
    id: "AUD-1005",
    timestamp: "2026-11-24 11:15:00",
    noteId: "CN-4008",
    clientId: "CL-2032",
    clientName: "Eleanor Whitfield",
    caregiverId: "CG-1082",
    caregiverName: "Marcus Johnson",
    action: "NOTE_APPROVED",
    previousValue: "pending_review",
    newValue: "approved",
    user: "Dana Jenkins, MSW",
    role: "Agency Operations Admin",
    reason: "All required personal care documentation sections verified against HCBS standards.",
  },
  {
    id: "AUD-1006",
    timestamp: "2026-11-22 14:00:10",
    noteId: "CN-4010",
    clientId: "CL-2035",
    clientName: "Robert Chen",
    caregiverId: "CG-1085",
    caregiverName: "Sarah Jenkins",
    action: "FLAGGED_FOR_COMPLIANCE_REVIEW",
    previousValue: "pending_review",
    newValue: "escalated",
    user: "Sarah Alverez",
    role: "Billing & Compliance Auditor",
    reason: "Discrepancy: Note reports 4.0h but EVV records 3.25h visit duration.",
  },
];

// Helper functions for storage management
export function getCareNotesFromStorage(): CareNote[] {
  if (typeof window === "undefined") return INITIAL_CARE_NOTES;
  try {
    const raw = localStorage.getItem(CARE_NOTES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CARE_NOTES_STORAGE_KEY, JSON.stringify(INITIAL_CARE_NOTES));
      return INITIAL_CARE_NOTES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load care notes from localStorage:", e);
    return INITIAL_CARE_NOTES;
  }
}

export function saveCareNotesToStorage(notes: CareNote[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CARE_NOTES_STORAGE_KEY, JSON.stringify(notes));
    window.dispatchEvent(new Event(CARE_NOTES_SYNC_EVENT));
  } catch (e) {
    console.error("Failed to save care notes to localStorage:", e);
  }
}

export function getCareNoteById(id: string): CareNote | undefined {
  const notes = getCareNotesFromStorage();
  return notes.find((n) => n.id === id);
}

export function getCareNoteRulesFromStorage(): CareNoteRule[] {
  if (typeof window === "undefined") return INITIAL_CARE_NOTE_RULES;
  try {
    const raw = localStorage.getItem(CARE_NOTES_RULES_KEY);
    if (!raw) {
      localStorage.setItem(CARE_NOTES_RULES_KEY, JSON.stringify(INITIAL_CARE_NOTE_RULES));
      return INITIAL_CARE_NOTE_RULES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load care note rules from localStorage:", e);
    return INITIAL_CARE_NOTE_RULES;
  }
}

export function saveCareNoteRulesToStorage(rules: CareNoteRule[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CARE_NOTES_RULES_KEY, JSON.stringify(rules));
    window.dispatchEvent(new Event(CARE_NOTES_SYNC_EVENT));
  } catch (e) {
    console.error("Failed to save care note rules:", e);
  }
}

export function getCareNoteTemplatesFromStorage(): CareNoteTemplate[] {
  if (typeof window === "undefined") return INITIAL_CARE_NOTE_TEMPLATES;
  try {
    const raw = localStorage.getItem(CARE_NOTES_TEMPLATES_KEY);
    if (!raw) {
      localStorage.setItem(CARE_NOTES_TEMPLATES_KEY, JSON.stringify(INITIAL_CARE_NOTE_TEMPLATES));
      return INITIAL_CARE_NOTE_TEMPLATES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load care note templates from localStorage:", e);
    return INITIAL_CARE_NOTE_TEMPLATES;
  }
}

export function saveCareNoteTemplatesToStorage(templates: CareNoteTemplate[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CARE_NOTES_TEMPLATES_KEY, JSON.stringify(templates));
    window.dispatchEvent(new Event(CARE_NOTES_SYNC_EVENT));
  } catch (e) {
    console.error("Failed to save care note templates:", e);
  }
}

export function getCareNoteAuditEventsFromStorage(): CareNoteAuditEvent[] {
  if (typeof window === "undefined") return INITIAL_CARE_NOTE_AUDIT_EVENTS;
  try {
    const raw = localStorage.getItem(CARE_NOTES_AUDIT_KEY);
    if (!raw) {
      localStorage.setItem(CARE_NOTES_AUDIT_KEY, JSON.stringify(INITIAL_CARE_NOTE_AUDIT_EVENTS));
      return INITIAL_CARE_NOTE_AUDIT_EVENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load care note audit events from localStorage:", e);
    return INITIAL_CARE_NOTE_AUDIT_EVENTS;
  }
}

export function logCareNoteAuditEvent(event: Omit<CareNoteAuditEvent, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const events = getCareNoteAuditEventsFromStorage();
    const newEvent: CareNoteAuditEvent = {
      ...event,
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    };
    events.unshift(newEvent);
    localStorage.setItem(CARE_NOTES_AUDIT_KEY, JSON.stringify(events));
    window.dispatchEvent(new Event(CARE_NOTES_SYNC_EVENT));
  } catch (e) {
    console.error("Failed to log care note audit event:", e);
  }
}

export function getCareNotesKpiSummary(notes?: CareNote[]): CareNotesKpiSummary {
  const currentNotes = notes || getCareNotesFromStorage();

  const totalNotes = currentNotes.length;
  const submittedCount = currentNotes.filter((n) => n.submissionStatus === "submitted" || n.submissionStatus === "resubmitted").length;
  const pendingReviewCount = currentNotes.filter((n) => n.reviewStatus === "pending_review" || n.reviewStatus === "in_review").length;
  const needsCorrectionCount = currentNotes.filter((n) => n.reviewStatus === "correction_requested" || n.correctionStatus === "open" || n.correctionStatus === "awaiting_caregiver").length;
  const overdueMissingCount = currentNotes.filter((n) => n.isOverdue || n.isMissing || n.qualityStatus === "missing_required").length;
  const reviewedApprovedCount = currentNotes.filter((n) => n.reviewStatus === "reviewed" || n.reviewStatus === "approved").length;
  const highPriorityCount = currentNotes.filter((n) => n.priority === "high" || n.priority === "urgent").length;
  const assignedToMeCount = currentNotes.filter((n) => n.assignedReviewerId === "REV-1").length;
  const unassignedCount = currentNotes.filter((n) => !n.assignedReviewerId).length;
  const clinicalEscalatedCount = currentNotes.filter((n) => n.flags.some((f) => f.flagType === "clinical" && f.status === "open") || n.reviewStatus === "escalated").length;
  const complianceFlaggedCount = currentNotes.filter((n) => n.flags.some((f) => f.flagType === "compliance" && f.status === "open")).length;

  return {
    totalNotes,
    submittedCount,
    pendingReviewCount,
    needsCorrectionCount,
    overdueMissingCount,
    reviewedApprovedCount,
    highPriorityCount,
    assignedToMeCount,
    unassignedCount,
    clinicalEscalatedCount,
    complianceFlaggedCount,
  };
}

// Workflow operations

export function markCareNoteReviewed(noteId: string, reviewer: CareNoteReviewer, notes?: string): boolean {
  const allNotes = getCareNotesFromStorage();
  const index = allNotes.findIndex((n) => n.id === noteId);
  if (index === -1) return false;

  const note = allNotes[index];
  const prevStatus = note.reviewStatus;

  note.reviewStatus = "reviewed";
  note.reviews.push({
    id: `REVW-${Date.now()}`,
    noteId: note.id,
    reviewerId: reviewer.id,
    reviewerName: reviewer.name,
    reviewerRole: reviewer.role,
    reviewStatus: "reviewed",
    reviewNotes: notes,
    reviewedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
  });
  note.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);

  saveCareNotesToStorage(allNotes);

  logCareNoteAuditEvent({
    noteId: note.id,
    clientId: note.clientId,
    clientName: note.clientName,
    caregiverId: note.caregiverId,
    caregiverName: note.caregiverName,
    action: "NOTE_REVIEWED",
    previousValue: prevStatus,
    newValue: "reviewed",
    user: reviewer.name,
    role: reviewer.role,
    reason: notes || "Administrative care documentation review completed.",
  });

  return true;
}

export function approveCareNote(noteId: string, approver: CareNoteReviewer, notes?: string): { success: boolean; error?: string } {
  const allNotes = getCareNotesFromStorage();
  const index = allNotes.findIndex((n) => n.id === noteId);
  if (index === -1) return { success: false, error: "Note not found" };

  const note = allNotes[index];

  // Validation block: check if required sections are missing or incomplete
  const hasIncompleteSections = note.sections.some((s) => s.required && s.completionStatus !== "complete");
  if (hasIncompleteSections) {
    return {
      success: false,
      error: "Approval blocked: Note contains missing or incomplete required documentation sections. Correction must be requested.",
    };
  }

  // Clinical block: If note has open clinical flags, Agency Admin cannot approve alone
  const hasOpenClinicalFlag = note.flags.some((f) => f.flagType === "clinical" && f.status === "open");
  if (hasOpenClinicalFlag) {
    return {
      success: false,
      error: "Approval blocked: Unresolved clinical escalation flag present. Authorized Clinical Supervisor (RN) sign-off required.",
    };
  }

  const prevStatus = note.reviewStatus;
  note.reviewStatus = "approved";
  note.reviews.push({
    id: `REVW-${Date.now()}`,
    noteId: note.id,
    reviewerId: approver.id,
    reviewerName: approver.name,
    reviewerRole: approver.role,
    reviewStatus: "approved",
    reviewNotes: notes,
    reviewedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
  });
  note.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);

  saveCareNotesToStorage(allNotes);

  logCareNoteAuditEvent({
    noteId: note.id,
    clientId: note.clientId,
    clientName: note.clientName,
    caregiverId: note.caregiverId,
    caregiverName: note.caregiverName,
    action: "NOTE_APPROVED",
    previousValue: prevStatus,
    newValue: "approved",
    user: approver.name,
    role: approver.role,
    reason: notes || "All administrative documentation requirements verified and approved.",
  });

  return { success: true };
}

export function requestCareNoteCorrection(
  noteId: string,
  request: {
    requestedBy: CareNoteReviewer;
    reason: string;
    affectedSections: string[];
    caregiverInstructions: string;
    dueDate?: string;
  }
): boolean {
  const allNotes = getCareNotesFromStorage();
  const index = allNotes.findIndex((n) => n.id === noteId);
  if (index === -1) return false;

  const note = allNotes[index];
  const prevStatus = note.reviewStatus;

  const correctionId = `CORR-${Date.now().toString().slice(-4)}`;
  const newCorrection: CareNoteCorrection = {
    id: correctionId,
    noteId: note.id,
    requestedBy: request.requestedBy.name,
    requestedByRole: request.requestedBy.role,
    requestedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    reason: request.reason,
    affectedSections: request.affectedSections,
    caregiverInstructions: request.caregiverInstructions,
    dueDate: request.dueDate,
    status: "awaiting_caregiver",
  };

  note.corrections.push(newCorrection);
  note.reviewStatus = "correction_requested";
  note.correctionStatus = "awaiting_caregiver";
  note.qualityStatus = "incomplete";
  note.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);

  // Mark affected sections
  note.sections.forEach((s) => {
    if (request.affectedSections.includes(s.sectionKey)) {
      s.completionStatus = "incomplete";
      if (!s.validationMessages) s.validationMessages = [];
      s.validationMessages.push(`Correction requested: ${request.reason}`);
    }
  });

  saveCareNotesToStorage(allNotes);

  logCareNoteAuditEvent({
    noteId: note.id,
    clientId: note.clientId,
    clientName: note.clientName,
    caregiverId: note.caregiverId,
    caregiverName: note.caregiverName,
    action: "CORRECTION_REQUESTED",
    previousValue: prevStatus,
    newValue: "correction_requested",
    user: request.requestedBy.name,
    role: request.requestedBy.role,
    reason: `${request.reason}: ${request.caregiverInstructions}`,
  });

  return true;
}

export function resubmitCareNote(
  noteId: string,
  updatedSections: { sectionKey: string; content: string }[],
  changeReason: string,
  caregiverName?: string
): boolean {
  const allNotes = getCareNotesFromStorage();
  const index = allNotes.findIndex((n) => n.id === noteId);
  if (index === -1) return false;

  const note = allNotes[index];

  // Snapshot previous version
  const previousVersionNumber = note.currentVersion;
  const versionSnapshot: CareNoteVersion = {
    id: `VER-${note.id}-${previousVersionNumber}`,
    noteId: note.id,
    versionNumber: previousVersionNumber,
    contentSnapshot: JSON.parse(JSON.stringify(note.sections)),
    submittedBy: note.caregiverName,
    submittedByRole: `Caregiver (${note.caregiverClassification})`,
    submittedAt: note.submittedAt || note.createdAt,
    changeReason: changeReason,
    createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
  };

  if (!note.versions) note.versions = [];
  note.versions.push(versionSnapshot);

  // Apply changes to sections
  updatedSections.forEach((updated) => {
    const sec = note.sections.find((s) => s.sectionKey === updated.sectionKey);
    if (sec) {
      sec.content = updated.content;
      sec.completionStatus = "complete";
      sec.validationMessages = [];
    }
  });

  // Increment version
  note.currentVersion = previousVersionNumber + 1;
  note.submissionStatus = "resubmitted";
  note.reviewStatus = "pending_review";
  note.correctionStatus = "resubmitted";
  note.qualityStatus = "complete";
  note.submittedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
  note.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);

  // Update open correction status
  const openCorrection = note.corrections.find((c) => c.status === "awaiting_caregiver" || c.status === "open");
  if (openCorrection) {
    openCorrection.status = "resubmitted";
    openCorrection.resubmittedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
  }

  saveCareNotesToStorage(allNotes);

  logCareNoteAuditEvent({
    noteId: note.id,
    clientId: note.clientId,
    clientName: note.clientName,
    caregiverId: note.caregiverId,
    caregiverName: note.caregiverName,
    action: "NOTE_RESUBMITTED",
    previousValue: `Version ${previousVersionNumber}`,
    newValue: `Version ${note.currentVersion}`,
    user: caregiverName || note.caregiverName,
    role: `Caregiver (${note.caregiverClassification})`,
    reason: changeReason,
  });

  return true;
}

export function acceptCareNoteCorrection(
  noteId: string,
  reviewer: CareNoteReviewer,
  notes?: string
): boolean {
  const allNotes = getCareNotesFromStorage();
  const index = allNotes.findIndex((n) => n.id === noteId);
  if (index === -1) return false;

  const note = allNotes[index];
  const correction = note.corrections.find((c) => c.status === "resubmitted" || c.status === "awaiting_caregiver");
  if (correction) {
    correction.status = "resolved";
    correction.resolvedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
    correction.resolutionNotes = notes || "Caregiver correction accepted by Agency Admin.";
  }

  note.correctionStatus = "resolved";
  note.reviewStatus = "reviewed";
  note.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);

  saveCareNotesToStorage(allNotes);

  logCareNoteAuditEvent({
    noteId: note.id,
    clientId: note.clientId,
    clientName: note.clientName,
    caregiverId: note.caregiverId,
    caregiverName: note.caregiverName,
    action: "CORRECTION_ACCEPTED",
    previousValue: "correction_requested",
    newValue: "resolved",
    user: reviewer.name,
    role: reviewer.role,
    reason: notes || "Resubmitted documentation verified and accepted.",
  });

  return true;
}

export function flagCareNote(
  noteId: string,
  flagData: {
    flagType: "clinical" | "compliance" | "billing" | "general";
    flaggedBy: CareNoteReviewer;
    reason: string;
    notes?: string;
  }
): boolean {
  const allNotes = getCareNotesFromStorage();
  const index = allNotes.findIndex((n) => n.id === noteId);
  if (index === -1) return false;

  const note = allNotes[index];
  const prevStatus = note.reviewStatus;

  const newFlag: CareNoteFlag = {
    id: `FLG-${Date.now().toString().slice(-4)}`,
    noteId: note.id,
    flagType: flagData.flagType,
    flaggedBy: flagData.flaggedBy.name,
    flaggedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    reason: flagData.reason,
    notes: flagData.notes,
    status: "open",
  };

  note.flags.push(newFlag);
  note.reviewStatus = "escalated";
  note.qualityStatus = "flagged";
  note.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);

  saveCareNotesToStorage(allNotes);

  logCareNoteAuditEvent({
    noteId: note.id,
    clientId: note.clientId,
    clientName: note.clientName,
    caregiverId: note.caregiverId,
    caregiverName: note.caregiverName,
    action: flagData.flagType === "clinical" ? "FLAGGED_FOR_CLINICAL_REVIEW" : "FLAGGED_FOR_COMPLIANCE_REVIEW",
    previousValue: prevStatus,
    newValue: "escalated",
    user: flagData.flaggedBy.name,
    role: flagData.flaggedBy.role,
    reason: flagData.reason,
  });

  return true;
}

export function resolveCareNoteFlag(noteId: string, flagId: string, resolutionNotes: string, resolver: CareNoteReviewer): boolean {
  const allNotes = getCareNotesFromStorage();
  const index = allNotes.findIndex((n) => n.id === noteId);
  if (index === -1) return false;

  const note = allNotes[index];
  const flag = note.flags.find((f) => f.id === flagId);
  if (!flag) return false;

  flag.status = "resolved";
  flag.resolvedBy = resolver.name;
  flag.resolvedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
  flag.notes = `${flag.notes || ""} | Resolved: ${resolutionNotes}`;

  // If no other open flags, return review status to pending_review
  const hasRemainingOpenFlags = note.flags.some((f) => f.status === "open");
  if (!hasRemainingOpenFlags) {
    note.reviewStatus = "pending_review";
    note.qualityStatus = "review_required";
  }
  note.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);

  saveCareNotesToStorage(allNotes);

  logCareNoteAuditEvent({
    noteId: note.id,
    clientId: note.clientId,
    clientName: note.clientName,
    caregiverId: note.caregiverId,
    caregiverName: note.caregiverName,
    action: "FLAG_RESOLVED",
    previousValue: flag.reason,
    newValue: "resolved",
    user: resolver.name,
    role: resolver.role,
    reason: resolutionNotes,
  });

  return true;
}

export function assignCareNoteReviewer(noteId: string, reviewerId: string, reviewerName: string, actor: CareNoteReviewer): boolean {
  const allNotes = getCareNotesFromStorage();
  const index = allNotes.findIndex((n) => n.id === noteId);
  if (index === -1) return false;

  const note = allNotes[index];
  const prevReviewer = note.assignedReviewerName || "Unassigned";

  note.assignedReviewerId = reviewerId;
  note.assignedReviewerName = reviewerName;
  note.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);

  saveCareNotesToStorage(allNotes);

  logCareNoteAuditEvent({
    noteId: note.id,
    clientId: note.clientId,
    clientName: note.clientName,
    caregiverId: note.caregiverId,
    caregiverName: note.caregiverName,
    action: "REVIEWER_ASSIGNED",
    previousValue: prevReviewer,
    newValue: reviewerName,
    user: actor.name,
    role: actor.role,
    reason: `Review assigned to ${reviewerName}`,
  });

  return true;
}

export function addCareNoteInternalReviewNote(noteId: string, noteText: string, author: CareNoteReviewer): boolean {
  const allNotes = getCareNotesFromStorage();
  const index = allNotes.findIndex((n) => n.id === noteId);
  if (index === -1) return false;

  const note = allNotes[index];
  note.reviews.push({
    id: `REVW-${Date.now()}`,
    noteId: note.id,
    reviewerId: author.id,
    reviewerName: author.name,
    reviewerRole: author.role,
    reviewStatus: note.reviewStatus,
    reviewNotes: noteText,
    reviewedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
  });
  note.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);

  saveCareNotesToStorage(allNotes);

  logCareNoteAuditEvent({
    noteId: note.id,
    clientId: note.clientId,
    clientName: note.clientName,
    caregiverId: note.caregiverId,
    caregiverName: note.caregiverName,
    action: "INTERNAL_NOTE_ADDED",
    previousValue: undefined,
    newValue: noteText.slice(0, 50) + "...",
    user: author.name,
    role: author.role,
    reason: "Internal reviewer observation recorded.",
  });

  return true;
}

export function saveCareNoteRule(rule: CareNoteRule, actor: CareNoteReviewer): void {
  const rules = getCareNoteRulesFromStorage();
  const existingIdx = rules.findIndex((r) => r.id === rule.id);
  const now = new Date().toISOString().replace("T", " ").substring(0, 16);

  if (existingIdx >= 0) {
    rules[existingIdx] = { ...rule, updatedAt: now, updatedBy: actor.name };
  } else {
    rules.unshift({ ...rule, updatedAt: now, updatedBy: actor.name });
  }

  saveCareNoteRulesToStorage(rules);

  logCareNoteAuditEvent({
    noteId: "RULE-CONFIG",
    clientId: "-",
    clientName: "System Configuration",
    caregiverId: "-",
    caregiverName: "Agency Rules",
    action: existingIdx >= 0 ? "RULE_UPDATED" : "RULE_CREATED",
    previousValue: existingIdx >= 0 ? "Previous Rule Version" : undefined,
    newValue: rule.requirementName,
    user: actor.name,
    role: actor.role,
    reason: `Documentation rule '${rule.requirementName}' configured for ${rule.serviceCode}`,
  });
}

export function saveCareNoteTemplate(template: CareNoteTemplate, actor: CareNoteReviewer): void {
  const templates = getCareNoteTemplatesFromStorage();
  const existingIdx = templates.findIndex((t) => t.id === template.id);
  const now = new Date().toISOString().replace("T", " ").substring(0, 16);

  if (existingIdx >= 0) {
    templates[existingIdx] = { ...template, lastUpdatedAt: now, lastUpdatedBy: actor.name };
  } else {
    templates.unshift({ ...template, lastUpdatedAt: now, lastUpdatedBy: actor.name });
  }

  saveCareNoteTemplatesToStorage(templates);

  logCareNoteAuditEvent({
    noteId: "TEMPLATE-CONFIG",
    clientId: "-",
    clientName: "System Configuration",
    caregiverId: "-",
    caregiverName: "Agency Templates",
    action: existingIdx >= 0 ? "TEMPLATE_UPDATED" : "TEMPLATE_CREATED",
    previousValue: existingIdx >= 0 ? "Previous Template Version" : undefined,
    newValue: template.templateName,
    user: actor.name,
    role: actor.role,
    reason: `Note template '${template.templateName}' configured for ${template.serviceCode}`,
  });
}

export function exportCareNotesCsv(notes: CareNote[]): void {
  const headers = [
    "Note ID",
    "Service Date",
    "Client ID",
    "Client Name",
    "Caregiver ID",
    "Caregiver Name",
    "Caregiver Role",
    "Service Code",
    "Service Type",
    "Program",
    "Visit ID",
    "Submitted At",
    "Submission Status",
    "Review Status",
    "Quality Status",
    "Correction Status",
    "Version",
    "Assigned Reviewer",
  ];

  const rows = notes.map((n) => [
    n.id,
    n.serviceDate,
    n.clientId,
    `"${n.clientName.replace(/"/g, '""')}"`,
    n.caregiverId,
    `"${n.caregiverName.replace(/"/g, '""')}"`,
    `"${n.caregiverClassification}"`,
    n.serviceCode,
    `"${n.serviceType}"`,
    `"${n.programName}"`,
    n.visitId,
    n.submittedAt || "Not Submitted",
    n.submissionStatus,
    n.reviewStatus,
    n.qualityStatus,
    n.correctionStatus,
    `v${n.currentVersion}`,
    n.assignedReviewerName || "Unassigned",
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `lilisare_care_notes_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function resetCareNotesToDefault(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CARE_NOTES_STORAGE_KEY, JSON.stringify(INITIAL_CARE_NOTES));
  localStorage.setItem(CARE_NOTES_RULES_KEY, JSON.stringify(INITIAL_CARE_NOTE_RULES));
  localStorage.setItem(CARE_NOTES_TEMPLATES_KEY, JSON.stringify(INITIAL_CARE_NOTE_TEMPLATES));
  localStorage.setItem(CARE_NOTES_AUDIT_KEY, JSON.stringify(INITIAL_CARE_NOTE_AUDIT_EVENTS));
  window.dispatchEvent(new Event(CARE_NOTES_SYNC_EVENT));
}
