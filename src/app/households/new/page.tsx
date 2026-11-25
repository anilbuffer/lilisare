"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  Users,
  Building2,
  Heart,
  FileCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Sparkles,
  Home,
  AlertCircle,
  Link2,
  RotateCcw,
  Zap,
  FolderInput,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Household,
  getHouseholdsFromStorage,
  saveHouseholdsToStorage,
} from "@/lib/households/mockData";
import {
  getClientsFromStorage,
  saveClientsToStorage,
} from "@/lib/clients/mockData";
import {
  getCaregiversFromStorage,
  saveCaregiversToStorage,
} from "@/lib/caregivers/mockData";
import {
  getIntakeInquiriesFromStorage,
  INTAKE_SYNC_EVENT,
} from "@/lib/intake/intakeSync";
import { enrichClientWith17Domains } from "@/lib/clients/enterpriseClientEnricher";
import { ClientRecord } from "@/types/client";
import { CaregiverRecord } from "@/types/caregiver";
import { InquiryRecord } from "@/types/intake";
import { VoiceDictationBanner } from "@/components/ui/VoiceDictationBanner";
import { LILISARE_SERVICES } from "@/lib/services";

interface NewHouseholdPageProps {
  baseBackPath?: string;
}

export default function NewHouseholdPage({
  baseBackPath = "/households",
}: NewHouseholdPageProps) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  // Creation Mode: Direct manual entry vs. Pre-populate & sync from intake inquiry
  const [creationMode, setCreationMode] = useState<"direct" | "sync">("direct");
  const [availableInquiries, setAvailableInquiries] = useState<InquiryRecord[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>("");

  // Auto-Sync Flags (Fields sync to each other)
  const [syncNames, setSyncNames] = useState(true);
  const [syncClientPhone, setSyncClientPhone] = useState(true);
  const [syncCaregiverPhone, setSyncCaregiverPhone] = useState(true);
  const [syncScheduledHours, setSyncScheduledHours] = useState(true);

  // Form State - Step 1: Residence & Household
  const [householdName, setHouseholdName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Springfield");
  const [state, setState] = useState("OR");
  const [zip, setZip] = useState("97477");
  const [phone, setPhone] = useState("");
  const [program, setProgram] = useState<string>("IHSS (In-Home Support Services)");

  // Form State - Step 2: Care Recipient (Client)
  const [clientName, setClientName] = useState("");
  const [clientRelationship, setClientRelationship] = useState("Care Recipient (Minor, Age 8)");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCareNeeds, setClientCareNeeds] = useState<string[]>([
    "Personal Care & Hygiene",
    "Mobility & Transfer Assistance",
    "Meal Preparation",
  ]);

  // Form State - Step 3: Designated Caregiver
  const [caregiverPathway, setCaregiverPathway] = useState<"family" | "friend" | "agency">("family");
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverRelationship, setCaregiverRelationship] = useState(
    "Mother & Legal Guardian (Paid W2 Caregiver)"
  );
  const [caregiverPhone, setCaregiverPhone] = useState("");
  const [caregiverEmail, setCaregiverEmail] = useState("");
  const [screeningVerified, setScreeningVerified] = useState(true);

  // Form State - Step 4: Service Authorization & Case Manager
  const [caseManagerName, setCaseManagerName] = useState("Dana Jenkins, MSW");
  const [caseManagerAgency, setCaseManagerAgency] = useState("State Dept of Human Services");
  const [caseManagerPhone, setCaseManagerPhone] = useState("(541) 555-4321");
  const [caseManagerEmail, setCaseManagerEmail] = useState("dana.jenkins@dhs.state.gov");
  const [authorizedHours, setAuthorizedHours] = useState<number>(40);
  const [scheduledHours, setScheduledHours] = useState<number>(40);
  const [authExpiry, setAuthExpiry] = useState("2027-03-31");
  const [authStatus, setAuthStatus] = useState<Household["authStatus"]>("Approved");

  // Form State - Step 5: Final Confirmation
  const [consentConfirmed, setConsentConfirmed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load inquiries from storage on mount
  useEffect(() => {
    try {
      const inquiries = getIntakeInquiriesFromStorage();
      if (Array.isArray(inquiries) && inquiries.length > 0) {
        setAvailableInquiries(inquiries);
      }
    } catch (e) {
      console.error("Failed to load intake inquiries", e);
    }
  }, []);

  // Sync: When primary household phone changes, sync client and/or caregiver phone if toggled
  const handlePhoneChange = (newPhone: string) => {
    setPhone(newPhone);
    if (syncClientPhone) {
      setClientPhone(newPhone);
    }
    if (syncCaregiverPhone && caregiverPathway === "family") {
      setCaregiverPhone(newPhone);
    }
  };

  // Sync: When client name changes, optionally sync household name and client email
  const handleClientNameChange = (name: string) => {
    setClientName(name);

    if (syncNames) {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      if (parts.length > 1) {
        const lastName = parts[parts.length - 1];
        setHouseholdName(`${lastName} Household`);
      } else if (parts.length === 1 && !householdName) {
        setHouseholdName(`${parts[0]} Household`);
      }
    }

    if (!clientEmail && name.trim()) {
      const clean = name.toLowerCase().replace(/[^a-z0-9]/g, ".");
      setClientEmail(`${clean}@example.com`);
    }
  };

  // Sync: When household name changes, optionally suggest client name if blank
  const handleHouseholdNameChange = (hhName: string) => {
    setHouseholdName(hhName);
  };

  // Sync: When caregiver pathway changes, sync standard relationship description
  const handlePathwayChange = (pathway: "family" | "friend" | "agency") => {
    setCaregiverPathway(pathway);
    if (pathway === "family") {
      setCaregiverRelationship("Mother & Legal Guardian (Paid W2 Caregiver)");
      if (syncCaregiverPhone && phone) {
        setCaregiverPhone(phone);
      }
    } else if (pathway === "friend") {
      setCaregiverRelationship("Trusted Family Friend (Paid Caregiver)");
    } else {
      setCaregiverRelationship("Agency Direct Care Aide (Staff Assigned)");
      setSyncCaregiverPhone(false);
    }
  };

  // Sync: When authorized hours change, keep scheduled hours in lock-step if enabled
  const handleAuthorizedHoursChange = (hours: number) => {
    setAuthorizedHours(hours);
    if (syncScheduledHours) {
      setScheduledHours(hours);
    }
  };

  // Sync: When program changes, sync default case manager agency & default hours
  const handleProgramChange = (prog: string) => {
    setProgram(prog);
    if (prog.includes("VA")) {
      setCaseManagerAgency("Veterans Health Administration");
      setCaseManagerName("Marcus Vance, LCSW");
    } else if (prog.includes("Private")) {
      setCaseManagerAgency("Family Managed / Private Care Network");
      setCaseManagerName("Private Client Representative");
    } else if (prog.includes("CES") || prog.includes("Pediatric")) {
      setCaseManagerAgency("State Dept of Human Services (Children's Services)");
      setCaseManagerName("Dana Jenkins, MSW");
    } else {
      setCaseManagerAgency("State Dept of Human Services");
    }
  };

  // Pre-fill & Sync all fields from selected Intake Inquiry
  const handleApplyInquirySync = (inquiryId: string) => {
    setSelectedInquiryId(inquiryId);
    const inq = availableInquiries.find((i) => i.id === inquiryId);
    if (!inq) return;

    // Sync Residence & Demographics
    const famName = inq.familyName.includes("Household")
      ? inq.familyName
      : `${inq.familyName} Household`;
    setHouseholdName(famName);
    setAddress(inq.familyInfo.householdLocation.address || "1428 Peachtree Hills Cir NE");
    setCity(inq.familyInfo.householdLocation.city || "Atlanta");
    setState(inq.familyInfo.householdLocation.state || "GA");
    setZip(inq.familyInfo.householdLocation.zip || "30305");
    const primPhone = inq.familyInfo.phone || "(404) 555-0182";
    setPhone(primPhone);

    // Sync Client (Care Recipient)
    const cName = inq.familyInfo.clientInfo.name || "Eleanor Miller";
    setClientName(cName);
    setClientRelationship(
      inq.familyInfo.clientInfo.relationship
        ? `Care Recipient (${inq.familyInfo.clientInfo.relationship})`
        : "Care Recipient"
    );
    setClientPhone(primPhone);
    setClientEmail(inq.familyInfo.email || "family@example.com");

    // Sync Caregiver
    if (inq.familyInfo.potentialCaregiver?.name) {
      setCaregiverName(inq.familyInfo.potentialCaregiver.name);
      setCaregiverRelationship(
        inq.familyInfo.potentialCaregiver.relationship ||
        "Family Caregiver (Paid W-2)"
      );
      setCaregiverPhone(
        inq.familyInfo.potentialCaregiver.phone || primPhone
      );
      setCaregiverEmail(inq.familyInfo.email || "caregiver@example.com");
      setCaregiverPathway("family");
    }

    // Sync Program & Auth
    if (inq.careRequirements?.programInterest) {
      setProgram(inq.careRequirements.programInterest);
    }
    const hrs = inq.careRequirements?.hoursPerWeek || 35;
    setAuthorizedHours(hrs);
    setScheduledHours(hrs);

    // Sync Case Manager
    if (inq.referralInfo?.caseManager?.name) {
      setCaseManagerName(inq.referralInfo.caseManager.name);
      setCaseManagerAgency(
        inq.referralInfo.caseManager.agency || "State Dept of Human Services"
      );
    }

    toast.success(`Synced all household fields from Intake Inquiry ${inq.id}!`);
  };

  const steps = [
    { num: 1, title: "Residence", icon: Home },
    { num: 2, title: "Care Recipient", icon: User },
    { num: 3, title: "Caregiver", icon: Heart },
    { num: 4, title: "Authorization", icon: ShieldCheck },
    { num: 5, title: "Confirm", icon: FileCheck },
  ];

  const toggleCareNeed = (need: string) => {
    if (clientCareNeeds.includes(need)) {
      setClientCareNeeds(clientCareNeeds.filter((n) => n !== need));
    } else {
      setClientCareNeeds([...clientCareNeeds, need]);
    }
  };

  const handleVoiceDictate = () => {
    setHouseholdName("Miller Household");
    setAddress("742 Evergreen Terrace");
    setCity("Springfield");
    setState("OR");
    setZip("97477");
    setPhone("(541) 555-0100");
    setProgram("Pediatric In-Home");

    setClientName("Leo Miller");
    setClientRelationship("Care Recipient (Minor, Age 8)");
    setClientPhone("(541) 555-0100");
    setClientEmail("miller.family@example.com");

    setCaregiverPathway("family");
    setCaregiverName("Sarah Miller");
    setCaregiverRelationship("Mother & Legal Guardian (Paid W2 Caregiver)");
    setCaregiverPhone("(541) 555-0102");
    setCaregiverEmail("sarah.miller@example.com");

    setCaseManagerName("Dana Jenkins, MSW");
    setCaseManagerAgency("State Dept of Human Services");
    setCaseManagerPhone("(541) 555-4321");
    setCaseManagerEmail("dana.jenkins@dhs.state.gov");
    setAuthorizedHours(40);
    setScheduledHours(40);
    setAuthStatus("Approved");

    toast.success("AI Voice dictation transcribed and synchronized across household fields!");
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!householdName.trim()) {
        toast.error("Please enter a household name (e.g. Miller Household)");
        return;
      }
      if (!address.trim()) {
        toast.error("Please enter physical residence address");
        return;
      }
      if (!phone.trim()) {
        toast.error("Please enter primary household telephone");
        return;
      }
    } else if (step === 2) {
      if (!clientName.trim()) {
        toast.error("Please enter the care recipient (client) name");
        return;
      }
    } else if (step === 3) {
      if (!caregiverName.trim()) {
        toast.error("Please enter the designated caregiver name");
        return;
      }
      if (!caregiverPhone.trim()) {
        toast.error("Please enter caregiver contact phone number");
        return;
      }
    } else if (step === 4) {
      if (!caseManagerName.trim()) {
        toast.error("Please enter assigned case manager name");
        return;
      }
      if (authorizedHours <= 0) {
        toast.error("Authorized weekly hours must be greater than 0");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit and Synchronize across Households, Clients, and Caregivers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentConfirmed) {
      toast.error("Please verify confirmation check to proceed");
      return;
    }

    setIsSubmitting(true);
    const existingHouseholds = getHouseholdsFromStorage();
    const existingClients = getClientsFromStorage();
    const existingCaregivers = getCaregiversFromStorage();

    const nextNum = 1000 + existingHouseholds.length + 1;
    const householdId = `hh-${nextNum}`;
    const householdCode = `HH-${nextNum}`;
    const clientId = `CL-${nextNum}`;
    const caregiverId = `CG-${nextNum}`;

    // 1. Create Household Entity
    const newHousehold: Household = {
      id: householdId,
      code: householdCode,
      name: householdName.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      phone: phone.trim(),
      program,
      caseManager: {
        name: caseManagerName.trim(),
        agency: caseManagerAgency.trim(),
        email: caseManagerEmail.trim(),
        phone: caseManagerPhone.trim(),
      },
      client: {
        id: clientId,
        name: clientName.trim(),
        role: "client",
        relationship: clientRelationship.trim(),
        status: "Active",
        phone: clientPhone.trim() || phone.trim(),
        email: clientEmail.trim() || "family@example.com",
      },
      primaryCaregiver: {
        id: caregiverId,
        name: caregiverName.trim(),
        role: "caregiver_and_guardian",
        relationship: caregiverRelationship.trim(),
        status: "Active",
        phone: caregiverPhone.trim() || phone.trim(),
        email: caregiverEmail.trim() || "caregiver@example.com",
      },
      authorizedHoursPerWeek: authorizedHours,
      scheduledHoursPerWeek: scheduledHours,
      authStatus,
      authExpiry,
      triJourneyStatus: {
        clientStage: "Care Active",
        caregiverStage: "Active",
        opsStage: "Billing",
      },
      evvComplianceRate: 98.5,
      lastVisitDate: "Pending First Shift",
    };

    // 2. Create Synced Client Record (with full 17 enterprise domains)
    const nameParts = clientName.trim().split(" ");
    const firstName = nameParts[0] || "Client";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Recipient";

    const rawClient: ClientRecord = {
      id: clientId,
      name: clientName.trim(),
      firstName,
      lastName,
      preferredName: firstName,
      title: "Mr.",
      dob: "1980-01-01",
      age: 45,
      gender: "Male",
      primaryLanguage: "English",
      status: "Active",
      careType: "Family Care",
      household: {
        id: householdId,
        code: householdCode,
        name: householdName.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        phone: phone.trim(),
        totalMembersCount: 2,
      },
      primaryContact: {
        name: caregiverName.trim() || clientName.trim(),
        relationship: caregiverRelationship.trim(),
        phone: caregiverPhone.trim() || phone.trim(),
        email: clientEmail.trim() || "family@example.com",
        preferredMethod: "Phone",
      },
      emergencyContact: {
        name: caregiverName.trim() || "Emergency Contact",
        relationship: caregiverRelationship.trim(),
        phone: caregiverPhone.trim() || phone.trim(),
      },
      residentialAddress: {
        name: clientName.trim(),
        address: address.trim(),
        address2: "",
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        verified: true,
      },
      billingAddress: {
        sameAsResidential: true,
        name: clientName.trim(),
        address: address.trim(),
        address2: "",
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
      },
      assignedCareTeam: {
        primaryCaregiver: {
          id: caregiverId,
          name: caregiverName.trim(),
          relationship: caregiverRelationship.trim(),
          classification: "W-2",
          status: "Active",
          phone: caregiverPhone.trim() || phone.trim(),
          email: caregiverEmail.trim() || "caregiver@example.com",
        },
        familyContact: {
          id: `fc-${clientId}`,
          name: caregiverName.trim() || clientName.trim(),
          relationship: caregiverRelationship.trim(),
          phone: caregiverPhone.trim() || phone.trim(),
          email: clientEmail.trim() || "family@example.com",
        },
        caseManager: {
          name: caseManagerName.trim(),
          agency: caseManagerAgency.trim(),
          email: caseManagerEmail.trim(),
          phone: caseManagerPhone.trim(),
        },
      },
      carePlan: {
        program,
        approvedServices: clientCareNeeds,
        authorizedWeeklyHours: authorizedHours,
        scheduledWeeklyHours: scheduledHours,
        hoursUsedThisWeek: 0,
        effectiveDate: new Date().toISOString().slice(0, 10),
        reviewDate: authExpiry,
        needsReview: false,
        frequency: "Monday - Friday",
        careNeeds: clientCareNeeds,
        specialInstructions: "Standard ADL support",
        mobilityNotes: "Needs standby assistance",
        dietaryRestrictions: "None reported",
        allergies: [],
        adlSupportNeeds: clientCareNeeds,
      },
      authorization: {
        authNumber: `AUTH-${nextNum}`,
        payer: program,
        status: "Verified",
        startDate: new Date().toISOString().slice(0, 10),
        expiryDate: authExpiry,
        daysUntilExpiry: 365,
        totalUnitsApproved: authorizedHours * 4 * 6,
        unitsUsed: 0,
        unitsRemaining: authorizedHours * 4 * 6,
        weeklyHourCap: authorizedHours,
        caseManagerName: caseManagerName.trim(),
        caseManagerAgency: caseManagerAgency.trim(),
      },
      readiness: {
        clientProfile: "Complete",
        careArrangement: "Complete",
        documents: "Verified",
        authorization: "Verified",
        overallScore: 95,
      },
      documents: [],
      activity: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "status_change",
          author: "System",
          authorRole: "Agency Coordinator",
          title: "Client Profile Created with Household",
          details: `Registered client profile in sync with household ${householdCode}.`,
        },
      ],
      attentionItems: [],
      householdMembers: [
        {
          id: `hm-${clientId}`,
          name: clientName.trim(),
          relationship: clientRelationship.trim(),
          role: "Care Recipient",
          phone: clientPhone.trim() || phone.trim(),
          email: clientEmail.trim() || "family@example.com",
          permissions: ["View Care Plan"],
          isPrimaryDecisionMaker: false,
        },
        {
          id: `hm-${caregiverId}`,
          name: caregiverName.trim(),
          relationship: caregiverRelationship.trim(),
          role: "Parent / Legal Guardian",
          phone: caregiverPhone.trim() || phone.trim(),
          email: caregiverEmail.trim() || "caregiver@example.com",
          permissions: ["Full Administrative Access", "Sign Consents"],
          isPrimaryDecisionMaker: true,
        },
      ],
      updatedAt: new Date().toISOString(),
      updatedAtRelative: "Just now",
    };

    const newEnrichedClient = enrichClientWith17Domains(rawClient);

    // 3. Create Synced Caregiver Record
    const newCaregiver: CaregiverRecord = {
      id: caregiverId,
      name: caregiverName.trim(),
      type: "Family Caregiver",
      status: "Active",
      pipelineStage: "Hired & Onboarding",
      branch: "North Metro Branch",
      hireDate: new Date().toISOString().slice(0, 10),
      employmentClassification: "W-2",
      verificationChecklist: {
        identity: "Verified",
        screening: screeningVerified ? "Cleared" : "Pending",
        cprFirstAid: "Verified",
        training: "Complete",
      },
      assignmentStatus: "Assigned",
      personalInfo: {
        dob: "1985-06-15",
        gender: "Female",
        languages: ["English"],
        phone: caregiverPhone.trim() || phone.trim(),
        email: caregiverEmail.trim() || "caregiver@example.com",
        address: {
          street: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zip: zip.trim(),
        },
        emergencyContact: {
          name: clientName.trim(),
          relationship: "Care Recipient",
          phone: clientPhone.trim() || phone.trim(),
        },
        preferredCommunication: "Phone",
        maskedIdentifiers: {
          ssnMasked: "***-**-5921",
          driversLicenseMasked: "DL-***-401",
          taxIdMasked: "TIN-***-882",
        },
      },
      relationship: {
        caregiverType: "Family Caregiver",
        relationshipToClient: caregiverRelationship.trim(),
        linkedHousehold: {
          id: householdId,
          code: householdCode,
          name: householdName.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          phone: phone.trim(),
        },
        relationshipVerificationStatus: "Verified",
        householdPermissions: ["Access Schedule", "Care Notes"],
        caregivingBoundaries: "Family in-home care delivery",
      },
      documentsCredentials: {
        overallStatus: "Verified",
        cprExpiryDate: "2027-01-01",
        tbTestExpiryDate: "2027-01-01",
        items: [],
      },
      screeningTraining: {
        backgroundCheck: {
          status: screeningVerified ? "Cleared" : "Pending Review",
          referenceNumber: `BGC-${nextNum}`,
          provider: "Sterling Healthcare Triage",
          renewalDate: "2027-11-20",
        },
        screenings: [],
        trainingCourses: [],
        overallTrainingStatus: "Complete",
        trainingHoursCompleted: 16,
        trainingHoursRequired: 16,
        screeningReviewDecisions: [],
      },
      availabilityAssignments: {
        weeklyCapacityHours: authorizedHours,
        scheduledWeeklyHours: scheduledHours,
        availabilitySchedule: [],
        assignmentHistory: [],
        assignedClient: {
          id: clientId,
          name: clientName.trim(),
          householdId,
          householdName: householdName.trim(),
          relationship: caregiverRelationship.trim(),
          weeklyAuthorizedHours: authorizedHours,
          scheduledWeeklyHours: scheduledHours,
          startDate: new Date().toISOString().slice(0, 10),
          status: "Active",
        },
      },
      evvVisitHistory: {
        overallComplianceRate: 98.5,
        totalVisitsCompleted: 0,
        gpsVerificationRate: 100,
        missedClockOutCount: 0,
        isRestrictedEVV: false,
        recentVisits: [],
      },
      activityHistory: {
        recentUpdates: [
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            relativeTime: "Just now",
            title: "Caregiver Activated for Household",
            description: `Caregiver registered and synced with household ${householdCode}.`,
            actor: "System",
            type: "profile",
          },
        ],
      },
    };

    setTimeout(() => {
      // Save all 3 entities to local storage
      saveHouseholdsToStorage([newHousehold, ...existingHouseholds]);
      saveClientsToStorage([newEnrichedClient, ...existingClients]);
      saveCaregiversToStorage([newCaregiver, ...existingCaregivers]);

      // Broadcast sync event to all portals & components
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(INTAKE_SYNC_EVENT, {
            detail: {
              type: "household_sync",
              householdId,
              clientId,
              caregiverId,
              timestamp: Date.now(),
            },
          })
        );
      }

      setIsSubmitting(false);
      toast.success(
        `Household ${householdCode} (${householdName}) registered & synchronized across all 3 journeys!`
      );
      router.push(`${baseBackPath}/${householdId}`);
    }, 600);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-16 animate-in fade-in duration-200">
      {/* Back Button */}
      <div>
        <Link
          href={baseBackPath}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_6px_32px_rgba(0,0,0,0.06)] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Households Hub</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-[0_6px_32px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200/80">
                New Household Unit
              </span>
              <span className="text-xs text-slate-400">Step {step} of 5</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Register Connected Household
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Establish a united family household connecting the care recipient, designated caregiver, and state authorization parameters.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center shrink-0 self-start sm:self-center shadow-[0_4px_16px_rgba(61,107,34,0.12)]">
            <Home className="w-6 h-6 text-[#3D6B22]" />
          </div>
        </div>

        {/* Circular 5-Step Stepper */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="grid grid-cols-5 gap-2">
            {steps.map((s) => {
              const isDone = s.num < step;
              const isCurrent = s.num === step;

              return (
                <div key={s.num} className="flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isDone
                      ? "bg-[#3D6B22] text-white shadow-sm"
                      : isCurrent
                        ? "bg-[#3D6B22] text-white ring-4 ring-[#3D6B22]/20 shadow-[0_4px_16px_rgba(61,107,34,0.25)]"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs mt-2 font-semibold truncate max-w-full ${isCurrent ? "text-[#3D6B22]" : "text-slate-500"
                      }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* AI Voice Dictation Action Banner */}
      <VoiceDictationBanner
        title="AI Voice Dictation"
        subtitle="Speak naturally to auto-populate family household, client recipient, and authorization parameters"
        buttonLabel="Dictate Household"
        onDictate={handleVoiceDictate}
      />

      {/* Main Guided Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-6">
        {/* STEP 1: Residence & Demographics */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                  1. Household Identity & Physical Residence
                  <div className="h-px bg-slate-100 flex-1"></div>
                </h4>
                <p className="text-xs text-slate-500">
                  Enter the primary household name, service location, and telephone contact.
                </p>
              </div>

              {/* Sync Name Toggle */}
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer self-start sm:self-auto">
                <input
                  type="checkbox"
                  checked={syncNames}
                  onChange={(e) => setSyncNames(e.target.checked)}
                  className="rounded text-[#3D6B22] focus:ring-[#3D6B22]"
                />
                <span>Sync Name with Client Surname</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-1">
              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-slate-700">
                    Household Family Name <span className="text-red-500">*</span>
                  </label>
                  {syncNames && (
                    <span className="text-[11px] text-[#3D6B22] font-semibold flex items-center gap-1">
                      <Link2 className="w-3 h-3" /> Auto-syncs with Client Name
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Home className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={householdName}
                    onChange={(e) => handleHouseholdNameChange(e.target.value)}
                    placeholder="e.g. Miller Household, Whitfield Residence"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Physical Residence Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Springfield"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="OR"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">ZIP</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="97477"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-slate-700">
                    Primary Household Telephone <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Syncs to client contact
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(541) 555-0199"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Service Program</label>
                <select
                  value={program}
                  onChange={(e) => handleProgramChange(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800 cursor-pointer"
                >
                  {LILISARE_SERVICES.map((svc) => (
                    <option key={svc.id} value={svc.name}>
                      {svc.order}. {svc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Care Recipient (Client) */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                2. Care Recipient (Client / Loved One)
                <div className="h-px bg-slate-100 flex-1"></div>
              </h4>
              <p className="text-xs text-slate-500">
                Identify the individual receiving in-home care services within this household.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Client Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => handleClientNameChange(e.target.value)}
                    placeholder="e.g. Leo Miller"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Relationship & Status</label>
                <input
                  type="text"
                  value={clientRelationship}
                  onChange={(e) => setClientRelationship(e.target.value)}
                  placeholder="e.g. Care Recipient (Minor, Age 8) or Care Recipient (Senior)"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-slate-700">Client Telephone</label>
                  <label className="inline-flex items-center gap-1.5 text-[11px] text-[#3D6B22] font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncClientPhone}
                      onChange={(e) => {
                        setSyncClientPhone(e.target.checked);
                        if (e.target.checked && phone) {
                          setClientPhone(phone);
                        }
                      }}
                      className="rounded text-[#3D6B22] focus:ring-[#3D6B22]"
                    />
                    <span>Same as Household</span>
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    value={clientPhone}
                    disabled={syncClientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder={phone || "(541) 555-0199"}
                    className={`w-full text-xs pl-10 pr-4 py-2.5 border rounded-xl transition-all text-slate-800 ${syncClientPhone
                      ? "bg-slate-100/70 border-slate-200 cursor-not-allowed opacity-90"
                      : "bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                      }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Client / Family Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="family.miller@example.com"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2 pt-2">
                <label className="text-[13px] font-medium text-slate-700">
                  Primary ADL & In-Home Support Needs
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    "Personal Care & Hygiene",
                    "Mobility & Transfer Assistance",
                    "Meal Preparation & Nutrition",
                    "Medication Standby & Reminders",
                    "Incontinence Care",
                    "Standby Supervision & Safety",
                  ].map((need) => {
                    const isChecked = clientCareNeeds.includes(need);
                    return (
                      <button
                        type="button"
                        key={need}
                        onClick={() => toggleCareNeed(need)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${isChecked
                          ? "border-[#3D6B22] bg-[#3D6B22]/5 text-[#3D6B22] font-semibold"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                          }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${isChecked
                            ? "bg-[#3D6B22] border-[#3D6B22] text-white"
                            : "border-slate-300 bg-white"
                            }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{need}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Designated Caregiver */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                3. Primary Caregiver & Household Circle
                <div className="h-px bg-slate-100 flex-1"></div>
              </h4>
              <p className="text-xs text-slate-500">
                Designate the paid caregiver assigned to deliver approved hours in this home.
              </p>
            </div>

            {/* Caregiver Pathway Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "family" as const,
                  title: "Paid Family Caregiver",
                  desc: "Parent, adult child, or relative delivering paid care under waiver.",
                },
                {
                  id: "friend" as const,
                  title: "Family Friend Caregiver",
                  desc: "Trusted community member chosen by household.",
                },
                {
                  id: "agency" as const,
                  title: "Agency Staff Aide",
                  desc: "Agency-recruited professional direct care worker.",
                },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handlePathwayChange(p.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${caregiverPathway === p.id
                    ? "border-[#3D6B22] bg-[#3D6B22]/5 shadow-sm ring-1 ring-[#3D6B22]"
                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-50"
                    }`}
                >
                  <span
                    className={`block text-xs font-bold ${caregiverPathway === p.id ? "text-[#3D6B22]" : "text-slate-800"
                      }`}
                  >
                    {p.title}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-1 leading-snug">
                    {p.desc}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Primary Caregiver Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Heart className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={caregiverName}
                    onChange={(e) => setCaregiverName(e.target.value)}
                    placeholder="e.g. Sarah Miller"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Role & Relationship (Auto-synced with Pathway)
                </label>
                <input
                  type="text"
                  value={caregiverRelationship}
                  onChange={(e) => setCaregiverRelationship(e.target.value)}
                  placeholder="Mother & Legal Guardian (Paid W2 Caregiver)"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-slate-700">
                    Caregiver Telephone <span className="text-red-500">*</span>
                  </label>
                  {caregiverPathway === "family" && (
                    <label className="inline-flex items-center gap-1.5 text-[11px] text-[#3D6B22] font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={syncCaregiverPhone}
                        onChange={(e) => {
                          setSyncCaregiverPhone(e.target.checked);
                          if (e.target.checked && phone) {
                            setCaregiverPhone(phone);
                          }
                        }}
                        className="rounded text-[#3D6B22] focus:ring-[#3D6B22]"
                      />
                      <span>Same as Household</span>
                    </label>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    value={caregiverPhone}
                    disabled={syncCaregiverPhone && caregiverPathway === "family"}
                    onChange={(e) => setCaregiverPhone(e.target.value)}
                    placeholder={phone || "(541) 555-0199"}
                    className={`w-full text-xs pl-10 pr-4 py-2.5 border rounded-xl transition-all text-slate-800 ${syncCaregiverPhone && caregiverPathway === "family"
                      ? "bg-slate-100/70 border-slate-200 cursor-not-allowed opacity-90"
                      : "bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                      }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Caregiver Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={caregiverEmail}
                    onChange={(e) => setCaregiverEmail(e.target.value)}
                    placeholder="sarah.miller@example.com"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={screeningVerified}
                    onChange={(e) => setScreeningVerified(e.target.checked)}
                    className="mt-0.5 rounded text-[#3D6B22] focus:ring-[#3D6B22]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Screening & Background Check Clearance Confirmed
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Caregiver has cleared State FBI fingerprinting, OIG registry exclusion screening, and CPR certification.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Service Authorization & Case Manager */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                  4. Service Authorization & Case Manager
                  <div className="h-px bg-slate-100 flex-1"></div>
                </h4>
                <p className="text-xs text-slate-500">
                  Record assigned case manager details, approved hours, and authorization expiration.
                </p>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer self-start sm:self-auto">
                <input
                  type="checkbox"
                  checked={syncScheduledHours}
                  onChange={(e) => {
                    setSyncScheduledHours(e.target.checked);
                    if (e.target.checked) {
                      setScheduledHours(authorizedHours);
                    }
                  }}
                  className="rounded text-[#3D6B22] focus:ring-[#3D6B22]"
                />
                <span>Sync Scheduled Hours to Auth</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Case Manager Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={caseManagerName}
                    onChange={(e) => setCaseManagerName(e.target.value)}
                    placeholder="Dana Jenkins, MSW"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Waiver Agency</label>
                <input
                  type="text"
                  value={caseManagerAgency}
                  onChange={(e) => setCaseManagerAgency(e.target.value)}
                  placeholder="State Dept of Human Services"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Case Manager Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    value={caseManagerPhone}
                    onChange={(e) => setCaseManagerPhone(e.target.value)}
                    placeholder="(541) 555-4321"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Case Manager Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={caseManagerEmail}
                    onChange={(e) => setCaseManagerEmail(e.target.value)}
                    placeholder="dana.jenkins@dhs.state.gov"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-slate-700">
                    Authorized Weekly Hours <span className="text-red-500">*</span>
                  </label>
                  {syncScheduledHours && (
                    <span className="text-[11px] text-[#3D6B22] font-semibold flex items-center gap-1">
                      <Link2 className="w-3 h-3" /> Scheduled hours synchronized
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={authorizedHours}
                    onChange={(e) => handleAuthorizedHoursChange(Number(e.target.value))}
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Scheduled Weekly Hours
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={scheduledHours}
                    disabled={syncScheduledHours}
                    onChange={(e) => setScheduledHours(Number(e.target.value))}
                    className={`w-full text-xs pl-10 pr-4 py-2.5 border rounded-xl transition-all text-slate-800 ${syncScheduledHours
                      ? "bg-slate-100/70 border-slate-200 cursor-not-allowed opacity-90"
                      : "bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                      }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Authorization Expiry Date</label>
                <input
                  type="date"
                  value={authExpiry}
                  onChange={(e) => setAuthExpiry(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Authorization Status</label>
                <select
                  value={authStatus}
                  onChange={(e) => setAuthStatus(e.target.value as Household["authStatus"])}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-800"
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Final Confirmation */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                5. Review & Finalize Household Registration
                <div className="h-px bg-slate-100 flex-1"></div>
              </h4>
              <p className="text-xs text-slate-500">
                Please verify all connected household entities before activating this record.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Household Residence Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-[#3D6B22]">
                  <Home className="w-3.5 h-3.5" /> Residence & Program
                </span>
                <p className="font-extrabold text-slate-900 text-sm">{householdName || "Unnamed Household"}</p>
                <p className="text-slate-600">
                  {address}, {city}, {state} {zip}
                </p>
                <p className="text-slate-500">Phone: {phone}</p>
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200 text-[10px] font-bold mt-1">
                  {program}
                </span>
              </div>

              {/* Care Recipient Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-blue-700">
                  <User className="w-3.5 h-3.5" /> Care Recipient (Client)
                </span>
                <p className="font-extrabold text-slate-900 text-sm">{clientName || "Unnamed Client"}</p>
                <p className="text-slate-600">{clientRelationship}</p>
                <p className="text-slate-500">Direct Contact: {clientPhone || phone}</p>
                <p className="text-slate-500 text-[11px]">{clientCareNeeds.join(", ")}</p>
              </div>

              {/* Primary Caregiver Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-rose-700">
                  <Heart className="w-3.5 h-3.5" /> Primary Designated Caregiver
                </span>
                <p className="font-extrabold text-slate-900 text-sm">{caregiverName || "Unnamed Caregiver"}</p>
                <p className="text-slate-600">{caregiverRelationship}</p>
                <p className="text-slate-500">Phone: {caregiverPhone || phone}</p>
                <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold mt-1">
                  Screening Cleared: {screeningVerified ? "Yes" : "Pending"}
                </span>
              </div>

              {/* Case Manager & Auth Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-[#3D6B22]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authorization & CM
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  {authorizedHours} hrs/wk ({scheduledHours} hrs scheduled)
                </p>
                <p className="text-slate-600">
                  Official: {caseManagerName} ({caseManagerAgency})
                </p>
                <p className="text-slate-500">Expiry: {authExpiry}</p>
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold mt-1">
                  Status: {authStatus}
                </span>
              </div>
            </div>

            {/* Three Connected Journeys Initialization Notice */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3 text-xs">
              <Sparkles className="w-5 h-5 text-[#3D6B22] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#1E5622] block">
                  Three Connected Journeys Live Synchronization
                </span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Upon completion, this household will immediately create and synchronize matching records across the Client Journey (care plan), Caregiver Workforce Journey (staff roster), and Agency Operations Journey (EVV scheduling & waiver authorization).
                </p>
              </div>
            </div>

            {/* Confirmation Toggle */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-[#3D6B22] focus:ring-[#3D6B22]"
              />
              <span className="text-xs text-slate-700 font-medium leading-relaxed">
                I verify that all information entered for this household, care recipient, caregiver, and authorization is accurate and ready for operational dispatch.
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-xl lg:rounded-2xl p-4 sm:p-5 shadow-[0_6px_32px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={handlePrevStep}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-[0_6px_32px_rgba(0,0,0,0.06)] cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>
        ) : (
          <Link
            href={baseBackPath}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-[0_6px_32px_rgba(0,0,0,0.06)] cursor-pointer"
          >
            Cancel
          </Link>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              toast.success("Draft household configuration saved");
              router.push(baseBackPath);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-[0_6px_32px_rgba(0,0,0,0.06)] cursor-pointer"
          >
            <span>Save Draft</span>
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-[0_4px_16px_rgba(61,107,34,0.25)] hover:shadow-[0_6px_20px_rgba(61,107,34,0.35)] transition-all cursor-pointer"
            >
              <span>Continue to Step {step + 1}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-[0_4px_16px_rgba(61,107,34,0.25)] hover:shadow-[0_6px_20px_rgba(61,107,34,0.35)] transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering & Syncing Household...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Complete & Activate Household</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
