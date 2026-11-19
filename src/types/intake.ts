export type InquiryStage =
  | "New Lead"
  | "Contacted"
  | "In Assessment"
  | "CM Coordination"
  | "Converted";

export type ReferralSourceType =
  | "Website"
  | "Phone"
  | "Referral"
  | "Case Manager"
  | "Hospital Discharge"
  | "Physician"
  | "Community Partner"
  | "Word of Mouth";

export type ContactMethod = "Phone" | "Email" | "SMS" | "In-Person";

export interface DocumentItem {
  id: string;
  name: string;
  status: "Received" | "Missing" | "Pending Review";
  uploadedDate?: string;
  required: boolean;
  category?: "Clinical" | "Legal" | "Financial" | "Identification";
}

export interface TimelineEntry {
  id: string;
  type: "call" | "email" | "note" | "status_change" | "assessment" | "assignment" | "system";
  author: string;
  authorRole?: string;
  timestamp: string;
  title: string;
  details?: string;
}

export interface InquiryRecord {
  id: string; // e.g. INQ-1042
  familyName: string; // e.g. The Miller Family
  stage: InquiryStage;
  dateReceived: string; // e.g. "Today", "Yesterday", "2 days ago"
  dateReceivedRaw: string;
  source: ReferralSourceType;
  sourceDetail?: string;
  branch: string;
  urgency: "Normal" | "Urgent" | "Immediate";

  familyInfo: {
    primaryContact: string;
    relationship: string;
    phone: string;
    email: string;
    preferredContactMethod: ContactMethod;
    bestTimeToCall?: string;
    householdLocation: {
      address: string;
      city: string;
      state: string;
      zip: string;
      branch: string;
    };
    clientInfo: {
      name: string;
      age: number;
      relationship: string;
      dob?: string;
      gender?: string;
      primaryLanguage?: string;
      mobilityNotes?: string;
    };
    potentialCaregiver?: {
      name: string;
      relationship: string;
      classificationInterest?: "W-2" | "1099";
      phone?: string;
    };
  };

  referralInfo: {
    source: ReferralSourceType;
    organization: string;
    caseManager?: {
      name: string;
      phone?: string;
      email?: string;
      agency?: string;
    };
    dateReceived: string;
    assignedCoordinator: {
      name: string;
      role: string;
      avatarUrl?: string;
      email?: string;
    };
  };

  careRequirements: {
    careType: string[];
    supportRequirements: string;
    preferredLocation: string;
    programInterest: string;
    hoursPerWeek: number;
    schedulePreference?: string;
    targetStartDate?: string;
  };

  documents: DocumentItem[];
  missingInformation: string[];
  assessmentStatus: "Not Scheduled" | "Scheduled" | "In Progress" | "Completed";
  assessmentDetails?: {
    scheduledDate?: string;
    scheduledTime?: string;
    assessor?: string;
    type?: string;
    notes?: string;
  };

  timeline: TimelineEntry[];

  onboardingStatus?: {
    converted: boolean;
    convertedAt?: string;
    clientProfileId?: string;
    caregiverProfileId?: string;
  };
}

export interface FollowUpTask {
  id: string;
  type: "first_contact" | "family_response" | "missing_docs" | "assessment_scheduling" | "cm_followup";
  title: string;
  inquiryId: string;
  familyName: string;
  dueDate: string;
  isOverdue: boolean;
  assignedCoordinator: string;
  actionLabel: string;
  category: "First Contact" | "Awaiting Response" | "Missing Docs" | "Scheduling" | "Case Manager";
}

export interface RecentActivityItem {
  id: string;
  type: "referral_received" | "inquiry_assigned" | "family_contacted" | "assessment_scheduled" | "referral_converted";
  inquiryId: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  actorAvatar?: string;
}

export interface PipelineStageCount {
  stage: InquiryStage;
  count: number;
  percentageOfMax: number;
  description: string;
}
