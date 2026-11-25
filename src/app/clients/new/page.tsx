"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Home,
  HeartHandshake,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  UserPlus,
  FolderInput,
  Check,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  User,
  Building2,
  Globe,
  Lock,
  CreditCard,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  CONVERTABLE_INQUIRIES,
  ConvertableInquiry,
  getClientsFromStorage,
  saveClientsToStorage,
} from "@/lib/clients/mockData";
import { MOCK_HOUSEHOLDS } from "@/lib/households/mockData";
import { ClientRecord, CareArrangementType, ClientStatus } from "@/types/client";
import { VoiceDictationBanner } from "@/components/ui/VoiceDictationBanner";
import { LILISARE_SERVICES } from "@/lib/services";
import { toast } from "sonner";
import { getIntakeInquiriesFromStorage } from "@/lib/intake/intakeSync";
import { enrichClientWith17Domains } from "@/lib/clients/enterpriseClientEnricher";
import { InquiryRecord } from "@/types/intake";

interface AddClientPageProps {
  baseBackPath?: string;
}

export default function AddClientPage({ baseBackPath = "/clients" }: AddClientPageProps = {}) {
  const router = useRouter();

  // Wizard Step: 1, 2, 3, 4, 5 (5 = Success)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [creationPath, setCreationPath] = useState<"direct" | "convert">("convert");
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>("INQ-1042");

  // Step 1: Personal & Contact Information (Synchronized with Card 1: Personal Information)
  const [title, setTitle] = useState("Mr.");
  const [clientName, setClientName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [primaryLanguage, setPrimaryLanguage] = useState("English");
  const [ssn, setSsn] = useState("964-72-9331");

  // Primary Contact
  const [contactName, setContactName] = useState("");
  const [contactRelationship, setContactRelationship] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [preferredMethod, setPreferredMethod] = useState<"Phone" | "Email" | "SMS">("Phone");

  // Residential Address (Card 3: Residential Address)
  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("OR");
  const [zip, setZip] = useState("");

  // Billing Address (Card 4: Billing Address)
  const [billingSameAsResidential, setBillingSameAsResidential] = useState(true);
  const [billingName, setBillingName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingAddress2, setBillingAddress2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("OR");
  const [billingZip, setBillingZip] = useState("");

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRel, setEmergencyRel] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Step 2: Household & Relationships
  const [householdChoice, setHouseholdChoice] = useState<"existing" | "new">("existing");
  const [selectedHouseholdId, setSelectedHouseholdId] = useState("hh-1001");
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [familyCaregiverRel, setFamilyCaregiverRel] = useState("Mother (Family Caregiver)");
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverPhone, setCaregiverPhone] = useState("");
  const [permissions, setPermissions] = useState<string[]>([
    "Medical Decisions",
    "Sign Consents",
    "View Care Notes",
    "Manage Scheduling",
  ]);

  // Step 3: Care Requirements & Services
  const [careType, setCareType] = useState<CareArrangementType>("Family Care");
  const [program, setProgram] = useState("IHSS (In-Home Support Services)");
  const [authorizedHours, setAuthorizedHours] = useState(40);
  const [schedulePreference, setSchedulePreference] = useState("Monday – Friday, 8:00 AM – 4:00 PM");
  const [specialInstructions, setSpecialInstructions] = useState(
    "Client requires standby supervision with transitions and calm routine."
  );
  const [selectedCareNeeds, setSelectedCareNeeds] = useState<string[]>([
    "ADL Bathing Supervision",
    "Nutritional Meal Preparation",
    "Sensory Regulation Support",
  ]);

  // Step 4: Documents, Authorizations & Agency Care Info (Card 2: Agency Care Information)
  const [consentSigned, setConsentSigned] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [physicianOrderUploaded, setPhysicianOrderUploaded] = useState(true);
  const [authNumber, setAuthNumber] = useState("AUTH-2026-NEW");
  const [payerName, setPayerName] = useState("State Medicaid Waiver (DHS)");
  const [caseManagerName, setCaseManagerName] = useState("Dana Jenkins, MSW");
  const [administrator, setAdministrator] = useState("Dana Jenkins, MSW");
  const [regionCode, setRegionCode] = useState("Brentwood");
  const [referredBy, setReferredBy] = useState("Walker (Baptist), Jennifer");
  const [medicaidNumber, setMedicaidNumber] = useState("MED-9647293");

  // Available convertable inquiries (dynamic from intake + fallback)
  const [availableInquiries, setAvailableInquiries] = useState<ConvertableInquiry[]>(CONVERTABLE_INQUIRIES);

  // Submitted client output
  const [createdClient, setCreatedClient] = useState<ClientRecord | null>(null);

  // Load inquiries from storage on mount
  React.useEffect(() => {
    try {
      const stored = getIntakeInquiriesFromStorage();
      if (Array.isArray(stored) && stored.length > 0) {
        const dynamicMapped: ConvertableInquiry[] = stored.map((inq: InquiryRecord) => ({
          id: inq.id,
          familyName: inq.familyName,
          clientName: inq.familyInfo?.clientInfo?.name || "Client Name",
          age: inq.familyInfo?.clientInfo?.age || 75,
          dob: inq.familyInfo?.clientInfo?.dob || "1951-05-14",
          gender: inq.familyInfo?.clientInfo?.gender || "Female",
          careType: (inq.careRequirements?.careType?.[0] as CareArrangementType) || "Family Care",
          primaryContact: inq.familyInfo?.primaryContact || "Primary Contact",
          relationship: inq.familyInfo?.relationship || "Family Member",
          phone: inq.familyInfo?.phone || "(555) 000-0000",
          email: inq.familyInfo?.email || "contact@family.com",
          address: inq.familyInfo?.householdLocation?.address || "100 Main St",
          city: inq.familyInfo?.householdLocation?.city || "Atlanta",
          state: inq.familyInfo?.householdLocation?.state || "GA",
          zip: inq.familyInfo?.householdLocation?.zip || "30305",
          programRequested: inq.careRequirements?.programInterest || "IHSS (In-Home Support Services)",
          careNeeds: inq.careRequirements?.careType || ["ADL Support"],
          potentialCaregiver: inq.familyInfo?.potentialCaregiver
            ? {
              name: inq.familyInfo.potentialCaregiver.name,
              relationship: inq.familyInfo.potentialCaregiver.relationship,
              phone: inq.familyInfo.potentialCaregiver.phone || inq.familyInfo.phone,
            }
            : undefined,
        }));

        const combined = [...dynamicMapped];
        CONVERTABLE_INQUIRIES.forEach((c) => {
          if (!combined.some((item) => item.id.toLowerCase() === c.id.toLowerCase())) {
            combined.push(c);
          }
        });
        setAvailableInquiries(combined);
      }
    } catch (e) {
      console.warn("Could not load dynamic intake inquiries", e);
    }
  }, []);

  // Auto-fill when selecting an inquiry
  const handleSelectInquiry = (inquiry: ConvertableInquiry) => {
    setSelectedInquiryId(inquiry.id);
    setClientName(inquiry.clientName);
    setPreferredName(inquiry.clientName.split(" ")[0]);
    setDob(inquiry.dob);
    setGender(inquiry.gender);
    setTitle(inquiry.gender === "Female" ? "Ms." : "Mr.");
    setContactName(inquiry.primaryContact);
    setContactRelationship(inquiry.relationship);
    setContactPhone(inquiry.phone);
    setContactEmail(inquiry.email);
    setAddress(inquiry.address);
    setCity(inquiry.city);
    setState(inquiry.state);
    setZip(inquiry.zip);
    setCareType(inquiry.careType);
    setProgram(inquiry.programRequested);
    if (inquiry.careNeeds && inquiry.careNeeds.length > 0) {
      setSelectedCareNeeds(inquiry.careNeeds);
    }
    if (inquiry.potentialCaregiver) {
      setCaregiverName(inquiry.potentialCaregiver.name);
      setCaregiverPhone(inquiry.potentialCaregiver.phone);
      setFamilyCaregiverRel(inquiry.potentialCaregiver.relationship);
    }
    // Auto-populate 17-Domain extended fields
    const randomSuffix = inquiry.id.replace(/\D/g, "") || "1042";
    setSsn(`964-72-${randomSuffix.padStart(4, "0").slice(0, 4)}`);
    setMedicaidNumber(`MED-${randomSuffix}93`);
    setRegionCode(inquiry.state === "GA" ? "North Metro" : "Brentwood");
    setReferredBy("Intake Referral Pipeline");
    setBillingName(inquiry.primaryContact || inquiry.clientName);
    setBillingAddress(inquiry.address);
    setBillingCity(inquiry.city);
    setBillingState(inquiry.state);
    setBillingZip(inquiry.zip);
    setBillingSameAsResidential(true);
    toast.success(`Populated all Client Details fields from intake inquiry ${inquiry.id}`);
  };

  // Pre-fill default on mount if in convert mode
  React.useEffect(() => {
    if (creationPath === "convert" && availableInquiries.length > 0 && !clientName) {
      handleSelectInquiry(availableInquiries[0]);
    }
  }, [creationPath, availableInquiries]);

  const togglePermission = (perm: string) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter((p) => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const toggleCareNeed = (need: string) => {
    if (selectedCareNeeds.includes(need)) {
      setSelectedCareNeeds(selectedCareNeeds.filter((n) => n !== need));
    } else {
      setSelectedCareNeeds([...selectedCareNeeds, need]);
    }
  };

  const handleVoiceDictate = () => {
    setTitle("Mr.");
    setClientName("Arthur Reynolds");
    setPreferredName("Artie");
    setDob("1948-06-15");
    setGender("Male");
    setPrimaryLanguage("English");
    setSsn("964-72-9331");
    setContactName("Mary Reynolds");
    setContactRelationship("Daughter & Legal Guardian");
    setContactPhone("(541) 555-1234");
    setContactEmail("mary.reynolds@example.com");
    setAddress("742 Evergreen Terrace");
    setAddress2("Suite 2B");
    setCity("Springfield");
    setState("OR");
    setZip("97477");
    setBillingSameAsResidential(true);
    setEmergencyName("David Miller");
    setEmergencyRel("Son-in-law");
    setEmergencyPhone("(541) 555-0211");
    setHouseholdChoice("new");
    setNewHouseholdName("Reynolds Household");
    setCaregiverName("Mary Reynolds");
    setCaregiverPhone("(541) 555-1234");
    setFamilyCaregiverRel("Daughter (Family Paid Caregiver)");
    setPayerName("Oregon Health Plan (OHP Medicaid)");
    setCaseManagerName("Dana Jenkins, MSW");
    setAdministrator("Dana Jenkins, MSW");
    setRegionCode("Brentwood");
    setReferredBy("Springfield Regional Medical Center");
    setMedicaidNumber("MED-9647293");
    setAuthorizedHours(30);
    setSpecialInstructions(
      "Client requires standby assistance with ambulation and reminders for medication schedule."
    );
    toast.success("AI Voice dictation transcribed and mapped to client registration fields!");
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!clientName.trim()) {
        toast.error("Please enter the client full legal name.");
        return;
      }
      if (!contactName.trim()) {
        toast.error("Please enter the primary contact name.");
        return;
      }
      if (!contactPhone.trim() && !contactEmail.trim()) {
        toast.error("Please enter a phone number or email for the primary contact.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      toast.error("Please enter client name");
      setCurrentStep(1);
      return;
    }

    const existingClients = getClientsFromStorage();
    const nextNum = 1000 + existingClients.length + 1;
    const newId = `CL-${nextNum}`;

    // Determine household info
    let householdInfo = {
      id: "hh-1001",
      code: "HH-1001",
      name: "Miller Household",
      address: address || "742 Evergreen Terrace",
      city: city || "Springfield",
      state: state || "OR",
      zip: zip || "97477",
      phone: contactPhone || "(541) 555-0199",
      totalMembersCount: 3,
    };

    if (householdChoice === "new" && newHouseholdName.trim()) {
      householdInfo = {
        id: `hh-${nextNum}`,
        code: `HH-${nextNum}`,
        name: newHouseholdName.trim(),
        address: address,
        city: city,
        state: state,
        zip: zip,
        phone: contactPhone,
        totalMembersCount: 2,
      };
    } else {
      const foundHh = MOCK_HOUSEHOLDS.find((h) => h.id === selectedHouseholdId);
      if (foundHh) {
        householdInfo = {
          id: foundHh.id,
          code: foundHh.code,
          name: foundHh.name,
          address: foundHh.address,
          city: foundHh.city,
          state: foundHh.state,
          zip: foundHh.zip,
          phone: foundHh.phone,
          totalMembersCount: 3,
        };
      }
    }

    // Client status starts as "Active" or "Onboarding" with complete 17 domains
    const nameParts = clientName.trim().split(" ");
    const firstName = nameParts[0] || "Client";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Recipient";

    const baseRecord: ClientRecord = {
      id: newId,
      title: title || (gender === "Female" ? "Ms." : "Mr."),
      firstName: firstName,
      lastName: lastName,
      name: clientName,
      preferredName: preferredName || firstName,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + nextNum}?auto=format&fit=crop&q=80&w=200`,
      dob: dob || "2018-06-15",
      age: 8,
      gender: gender,
      primaryLanguage: primaryLanguage,
      ssn: ssn || `964-72-${String(nextNum).slice(0, 4)}`,
      status: "Active",
      careType: careType,
      household: householdInfo,
      agencyInfo: {
        status: "Active",
        leadCreatedDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
        initialAssessmentDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
        conversionDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
        startDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
        effectiveEndDate: "12/31/2026",
        administrator: administrator || "Dana Jenkins, MSW",
        regionCode: regionCode || "Brentwood",
        referredBy: referredBy || (creationPath === "convert" ? "Intake Referral Conversion" : "Direct Intake Registration"),
        medicaidNumber: medicaidNumber || `MED-${nextNum}93`,
        preferredCaregiver: caregiverName || "Wilson Martin",
        adminAlerts: {
          disableClockInAlert: false,
          disableClockOutAlert: false,
        },
        invoicingId: `INV-${newId}`,
      },
      residentialAddress: {
        name: clientName,
        address: address,
        address2: address2 || "",
        city: city,
        state: state,
        zip: zip,
        verified: true,
      },
      billingAddress: {
        sameAsResidential: billingSameAsResidential,
        name: billingSameAsResidential ? clientName : (billingName || clientName),
        address: billingSameAsResidential ? address : (billingAddress || address),
        address2: billingSameAsResidential ? (address2 || "") : (billingAddress2 || ""),
        city: billingSameAsResidential ? city : (billingCity || city),
        state: billingSameAsResidential ? state : (billingState || state),
        zip: billingSameAsResidential ? zip : (billingZip || zip),
      },
      primaryContact: {
        name: contactName || "Parent / Guardian",
        relationship: contactRelationship || "Mother & Legal Guardian",
        phone: contactPhone || "(555) 000-0000",
        email: contactEmail || "contact@example.com",
        preferredMethod: preferredMethod,
      },
      emergencyContact: {
        name: emergencyName || contactName || "Emergency Contact",
        relationship: emergencyRel || "Family",
        phone: emergencyPhone || contactPhone || "(555) 000-0000",
      },
      responsibleParties: [
        {
          id: `RP-${newId}-1`,
          name: contactName || "Parent / Guardian",
          relationship: contactRelationship || "Primary POA & Guardian",
          phone: contactPhone || "(555) 000-0000",
          email: contactEmail || "contact@example.com",
          address: `${address}, ${city}, ${state} ${zip}`,
          isPrimaryDecisionMaker: true,
          isBillingContact: true,
          isEmergencyContact: true,
          hipaaAuthorized: true,
          notes: "Primary authorized contact synchronized from intake registration.",
        },
        ...(emergencyName && emergencyName !== contactName
          ? [
            {
              id: `RP-${newId}-2`,
              name: emergencyName,
              relationship: emergencyRel || "Family Contact",
              phone: emergencyPhone || contactPhone || "(555) 000-0000",
              email: "emergency@example.com",
              address: `${address}, ${city}, ${state} ${zip}`,
              isPrimaryDecisionMaker: false,
              isBillingContact: false,
              isEmergencyContact: true,
              hipaaAuthorized: true,
              notes: "Designated 24/7 backup contact.",
            },
          ]
          : []),
      ],
      assignedCareTeam: {
        primaryCaregiver: caregiverName
          ? {
            id: `CG-${nextNum}`,
            name: caregiverName,
            relationship: familyCaregiverRel,
            classification: "W-2",
            status: "Active",
            phone: caregiverPhone || contactPhone,
            email: contactEmail || "caregiver@example.com",
          }
          : null,
        backupCaregiver: null,
        familyContact: {
          id: `FC-${nextNum}`,
          name: contactName,
          relationship: contactRelationship,
          phone: contactPhone,
          email: contactEmail,
        },
        onboardingCoordinator: {
          id: "OC-12",
          name: administrator || "Dana Jenkins, MSW",
          email: "dana.jenkins@lilisare.com",
          phone: "(541) 555-4321",
        },
        caseManager: {
          name: caseManagerName,
          agency: payerName,
          email: "case.manager@agency.gov",
          phone: "(555) 555-0100",
        },
      },
      readiness: {
        clientProfile: "Complete",
        careArrangement: caregiverName ? "Complete" : "Pending",
        documents: consentSigned ? "Review needed" : "Missing",
        authorization: "Pending",
        overallScore: 85,
      },
      carePlan: {
        program: program,
        approvedServices: selectedCareNeeds,
        authorizedWeeklyHours: Number(authorizedHours) || 30,
        scheduledWeeklyHours: 0,
        hoursUsedThisWeek: 0,
        effectiveDate: new Date().toISOString().split("T")[0],
        reviewDate: "2027-11-19",
        needsReview: false,
        frequency: schedulePreference || "Monday – Friday, daytime",
        adlSupportNeeds: selectedCareNeeds,
        careNeeds: selectedCareNeeds,
        specialInstructions: specialInstructions || "Client requires standby supervision with transitions and calm routine.",
        mobilityNotes: "Standby assist with ambulatory transfers.",
        dietaryRestrictions: "None reported.",
        allergies: ["No known drug allergies (NKDA)"],
      },
      authorization: {
        authNumber: authNumber || `AUTH-2026-${nextNum}`,
        payer: payerName,
        status: "Pending Renewal",
        totalUnitsApproved: (Number(authorizedHours) || 30) * 4 * 12,
        unitsUsed: 0,
        unitsRemaining: (Number(authorizedHours) || 30) * 4 * 12,
        weeklyHourCap: Number(authorizedHours) || 30,
        daysUntilExpiry: 365,
        startDate: new Date().toISOString().split("T")[0],
        expiryDate: "2027-11-19",
        caseManagerName: caseManagerName,
        caseManagerAgency: payerName,
      },
      documents: [
        {
          id: `DOC-${Date.now()}-1`,
          name: "Signed Patient Bill of Rights & Consent",
          category: "Consent",
          status: consentSigned ? "Verified" : "Missing",
          uploadedDate: new Date().toISOString().split("T")[0],
          fileSize: "1.2 MB",
        },
        {
          id: `DOC-${Date.now()}-2`,
          name: "State Medicaid Service Authorization Packet",
          category: "Authorization",
          status: "Review needed",
          uploadedDate: new Date().toISOString().split("T")[0],
          fileSize: "3.8 MB",
        },
        {
          id: `DOC-${Date.now()}-3`,
          name: "Initial Care Plan & Services Request",
          category: "Assessment",
          status: "Verified",
          uploadedDate: new Date().toISOString().split("T")[0],
          signedBy: "Agency Onboarding Team",
          fileSize: "2.4 MB",
        },
      ],
      householdMembers: [
        {
          id: `HM-${Date.now()}-1`,
          name: contactName,
          relationship: contactRelationship,
          role: "Parent / Legal Guardian",
          phone: contactPhone,
          email: contactEmail,
          permissions: permissions,
          isPrimaryDecisionMaker: true,
        },
      ],
      activity: [
        {
          id: `ACT-${Date.now()}`,
          timestamp: "Just now",
          type: "status_change",
          author: administrator || "Dana Jenkins",
          authorRole: "Onboarding Coordinator",
          title: `Client Record ${newId} Created (${creationPath === "convert" ? `Converted from ${selectedInquiryId}` : "Direct Admin Creation"})`,
          details: `Client onboarding record initialized. Connected to ${householdInfo.name}. Initial status: Active.`,
        },
      ],
      attentionItems: [
        {
          id: `ATT-${newId}-1`,
          type: "missing_consent",
          severity: "action_required",
          title: "Registration Documents Pending Agency Review",
          description: "New registration packet uploaded; supervisor sign-off needed.",
          actionLabel: "Review Documents",
          linkTab: "documents",
        },
      ],
      updatedAt: new Date().toISOString(),
      updatedAtRelative: "Just now",
      convertedFromInquiryId: creationPath === "convert" ? selectedInquiryId : undefined,
    };

    const newRecord = enrichClientWith17Domains(baseRecord);
    const updatedList = [newRecord, ...existingClients];
    saveClientsToStorage(updatedList);
    setCreatedClient(newRecord);
    setCurrentStep(5); // Success step
    toast.success(`Client ${newRecord.name} (${newRecord.id}) registered and synchronized across all 17 domains!`);
  };

  const steps = [
    { num: 1, title: "Personal & Contact" },
    { num: 2, title: "Household & Family" },
    { num: 3, title: "Care & Services" },
    { num: 4, title: "Review & Submit" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Back Button with subtle shadow */}
      <div>
        <Link
          href={baseBackPath}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_6px_32px_rgba(0,0,0,0.06)] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Clients Workspace</span>
        </Link>
      </div>

      {/* 01. Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-[0_6px_32px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200/80">
                New Client Registration
              </span>
              <span className="text-xs text-slate-400">
                Step {currentStep} of 4: {steps.find((s) => s.num === currentStep)?.title}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Add New Client
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Guided 4-step onboarding wizard for registering clients and connecting family households.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center shrink-0 self-start sm:self-center shadow-[0_4px_16px_rgba(61,107,34,0.12)]">
            <Sparkles className="w-6 h-6 text-[#3D6B22]" />
          </div>
        </div>

        {/* Step Progress Bar with Circular Indicators */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((s) => {
              const isDone = s.num < currentStep;
              const isCurrent = s.num === currentStep;

              return (
                <div
                  key={s.num}
                  className="flex flex-col items-center text-center cursor-pointer"
                  onClick={() => {
                    if (isDone) setCurrentStep(s.num);
                  }}
                >
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

      {/* 02. Pathway Selector: Convert Inquiry vs Direct Registration */}
      {currentStep < 5 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Registration Pathway
                <div className="h-px bg-slate-100 flex-1"></div>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Prevent duplicate client records by converting existing pipeline inquiries or create directly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setCreationPath("convert");
                if (CONVERTABLE_INQUIRIES.length > 0) {
                  handleSelectInquiry(CONVERTABLE_INQUIRIES[0]);
                }
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${creationPath === "convert"
                ? "border-[#3D6B22] bg-[#3D6B22]/5 ring-2 ring-[#3D6B22]/20 shadow-[0_2px_8px_rgba(61,107,34,0.1)]"
                : "border-slate-200 bg-slate-50/50 hover:bg-white"
                }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${creationPath === "convert"
                  ? "bg-[#3D6B22] text-white shadow-xs"
                  : "bg-slate-200 text-slate-600"
                  }`}
              >
                <FolderInput className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Convert Existing Referral / Inquiry
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Import inquiry data and prevent duplicate client profiles.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setCreationPath("direct");
                setClientName("");
                setPreferredName("");
                setContactName("");
                setContactPhone("");
                setContactEmail("");
                setAddress("");
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${creationPath === "direct"
                ? "border-[#3D6B22] bg-[#3D6B22]/5 ring-2 ring-[#3D6B22]/20 shadow-[0_2px_8px_rgba(61,107,34,0.1)]"
                : "border-slate-200 bg-slate-50/50 hover:bg-white"
                }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${creationPath === "direct"
                  ? "bg-[#3D6B22] text-white shadow-xs"
                  : "bg-slate-200 text-slate-600"
                  }`}
              >
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Direct Administrative Creation
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Authorized direct cases without prior web inquiry.
                </div>
              </div>
            </button>
          </div>

          {/* Qualified Inquiry Selector */}
          {creationPath === "convert" && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Select Qualified Inquiry to Convert:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {availableInquiries.map((inq) => (
                  <button
                    key={inq.id}
                    type="button"
                    onClick={() => handleSelectInquiry(inq)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${selectedInquiryId === inq.id
                      ? "border-[#3D6B22] bg-[#3D6B22]/5 shadow-xs font-semibold ring-1 ring-[#3D6B22]"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className=" text-[10px] text-slate-500 font-bold">{inq.id}</span>
                      <span className="text-[10px] font-bold text-[#1E5622] bg-[#E3F1D9] px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    </div>
                    <div className="text-slate-900 font-bold mt-1.5 truncate">{inq.clientName}</div>
                    <div className="text-slate-500 text-[11px] truncate">{inq.familyName}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Voice Dictation Action Banner */}
      {currentStep < 5 && (
        <VoiceDictationBanner
          title="AI Voice Dictation"
          subtitle="Speak naturally to auto-fill client demographics, family contact, and care plan details"
          buttonLabel="Dictate Client"
          onDictate={handleVoiceDictate}
        />
      )}

      {/* 03. Main Guided Form Card */}
      {currentStep < 5 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-6">
          {/* STEP 1: Personal & Contact Information */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  1. Personal & Contact Information
                  <div className="h-px bg-slate-100 flex-1"></div>
                </h4>
                <p className="text-xs text-slate-500">
                  Enter client legal demographics and primary responsible family contact info.
                </p>
              </div>

              {/* Client Demographics (Card 1: Personal Information) */}
              <div className="space-y-4 pt-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Client Details (Person Receiving Care)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4.5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Title</label>
                    <select
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Master">Master</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Leo Miller"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Goes By (Nickname)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Leo"
                        value={preferredName}
                        onChange={(e) => setPreferredName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4.5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Gender
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Other">Other / Prefer not to say</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Primary Language
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Globe className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={primaryLanguage}
                        onChange={(e) => setPrimaryLanguage(e.target.value)}
                        placeholder="English"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Social Security Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={ssn}
                        onChange={(e) => setSsn(e.target.value)}
                        placeholder="964-72-9331"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all  placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Contact Details */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Primary Contact & Guardian Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Responsible Contact Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Sarah Miller"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Relationship to Client <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={contactRelationship}
                        onChange={(e) => setContactRelationship(e.target.value)}
                        placeholder="e.g. Mother & Legal Guardian"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Primary Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="(541) 555-0199"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="contact@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Preferred Contact Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Phone", "Email", "SMS"] as ("Phone" | "Email" | "SMS")[]).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPreferredMethod(method)}
                          className={`py-2.5 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${preferredMethod === method
                            ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-[0_2px_8px_rgba(61,107,34,0.25)]"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Household Physical Address (Card 3: Residential Address) */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Household Physical Address (Residential)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4.5">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Street Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="742 Evergreen Terrace"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Address Line 2 (Apt, Suite, Bldg)</label>
                    <input
                      type="text"
                      value={address2}
                      onChange={(e) => setAddress2(e.target.value)}
                      placeholder="e.g. Apt 4B (Optional)"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">City</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Springfield"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">State / Zip</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-20 px-2.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-center font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                      />
                      <input
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="97477"
                        className="flex-1 px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Address (Card 4: Billing Address) */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Billing Address & Payee Information
                  </span>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={billingSameAsResidential}
                      onChange={(e) => setBillingSameAsResidential(e.target.checked)}
                      className="w-4 h-4 rounded text-[#3D6B22] focus:ring-[#3D6B22]/20 border-slate-300"
                    />
                    <span>Same as Residential Address</span>
                  </label>
                </div>

                {!billingSameAsResidential && (
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-slate-700">Billing Name / Payee</label>
                        <input
                          type="text"
                          value={billingName}
                          onChange={(e) => setBillingName(e.target.value)}
                          placeholder="e.g. Responsible Contact or Trust"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-slate-700">Billing Street Address</label>
                        <input
                          type="text"
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          placeholder="105 WOODED CREST DR"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-slate-700">City</label>
                        <input
                          type="text"
                          value={billingCity}
                          onChange={(e) => setBillingCity(e.target.value)}
                          placeholder="Waco"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-slate-700">State</label>
                        <input
                          type="text"
                          value={billingState}
                          onChange={(e) => setBillingState(e.target.value)}
                          placeholder="TX"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-slate-700">Zip Code</label>
                        <input
                          type="text"
                          value={billingZip}
                          onChange={(e) => setBillingZip(e.target.value)}
                          placeholder="76712-3260"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Emergency Contact (24/7 Response)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Emergency Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="e.g. David Miller"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Relationship</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={emergencyRel}
                        onChange={(e) => setEmergencyRel(e.target.value)}
                        placeholder="e.g. Father"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Phone</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="(555) 000-0000"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Household & Family Relationships */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  2. Household & Relationships
                  <div className="h-px bg-slate-100 flex-1"></div>
                </h4>
                <p className="text-xs text-slate-500">
                  Connect this client to an existing household or establish a new family care unit.
                </p>
              </div>

              {/* Household Assignment */}
              <div className="space-y-3 pt-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Household Unit Assignment
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setHouseholdChoice("existing")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${householdChoice === "existing"
                      ? "border-[#3D6B22] bg-[#3D6B22]/5 ring-2 ring-[#3D6B22]/20 shadow-[0_2px_8px_rgba(61,107,34,0.1)]"
                      : "border-slate-200 bg-slate-50/50 hover:bg-white"
                      }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${householdChoice === "existing"
                        ? "border-[#3D6B22] bg-[#3D6B22] text-white"
                        : "border-slate-300 bg-white"
                        }`}
                    >
                      {householdChoice === "existing" && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Link to Existing Household</div>
                      <div className="text-[11px] text-slate-500">Connect to existing family address and records</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setHouseholdChoice("new")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${householdChoice === "new"
                      ? "border-[#3D6B22] bg-[#3D6B22]/5 ring-2 ring-[#3D6B22]/20 shadow-[0_2px_8px_rgba(61,107,34,0.1)]"
                      : "border-slate-200 bg-slate-50/50 hover:bg-white"
                      }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${householdChoice === "new"
                        ? "border-[#3D6B22] bg-[#3D6B22] text-white"
                        : "border-slate-300 bg-white"
                        }`}
                    >
                      {householdChoice === "new" && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Create New Household Unit</div>
                      <div className="text-[11px] text-slate-500">Establish a new independent residential record</div>
                    </div>
                  </div>
                </div>

                {householdChoice === "existing" ? (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[13px] font-medium text-slate-700">
                      Select Existing Family Household
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Home className="h-4 w-4" />
                      </div>
                      <select
                        value={selectedHouseholdId}
                        onChange={(e) => setSelectedHouseholdId(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none cursor-pointer"
                      >
                        {MOCK_HOUSEHOLDS.map((hh) => (
                          <option key={hh.id} value={hh.id}>
                            {hh.name} ({hh.code}) – {hh.address}, {hh.city}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[13px] font-medium text-slate-700">
                      New Household Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Home className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={newHouseholdName}
                        onChange={(e) => setNewHouseholdName(e.target.value)}
                        placeholder="e.g. Sullivan Household"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Family Caregiver Information */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Family or Friend Caregiver Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Caregiver Candidate Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <HeartHandshake className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={caregiverName}
                        onChange={(e) => setCaregiverName(e.target.value)}
                        placeholder="e.g. Sarah Miller"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Caregiver Relationship
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={familyCaregiverRel}
                        onChange={(e) => setFamilyCaregiverRel(e.target.value)}
                        placeholder="e.g. Mother (Family Caregiver)"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Caregiver Phone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        value={caregiverPhone}
                        onChange={(e) => setCaregiverPhone(e.target.value)}
                        placeholder="(555) 000-0000"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decision-Making Permissions Checklist */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Guardian Permissions & Decision-Making Authority
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    "Medical Decisions",
                    "Sign Consents",
                    "View Care Notes",
                    "Manage Scheduling",
                    "Authorized Pickup",
                    "Financial Decisions",
                  ].map((perm) => {
                    const isChecked = permissions.includes(perm);
                    return (
                      <div
                        key={perm}
                        onClick={() => togglePermission(perm)}
                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${isChecked
                          ? "border-[#3D6B22] bg-[#3D6B22]/5 text-[#1E5622] font-semibold ring-1 ring-[#3D6B22]/30 shadow-xs"
                          : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-50"
                          }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border transition-all ${isChecked
                            ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-xs"
                            : "border-slate-300 bg-white"
                            }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </span>
                        <span className="text-xs">{perm}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Care Requirements & Services */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  3. Care Requirements & Services
                  <div className="h-px bg-slate-100 flex-1"></div>
                </h4>
                <p className="text-xs text-slate-500">
                  Configure requested care arrangements, program waiver, and support schedules.
                </p>
              </div>

              {/* Requested Care Arrangement */}
              <div className="space-y-3 pt-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Requested Care Arrangement Type
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(
                    [
                      "Family Care",
                      "Live-In Care",
                      "Family Friend Care",
                      "Attendant Care",
                    ] as CareArrangementType[]
                  ).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCareType(type)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${careType === type
                        ? "border-[#3D6B22] bg-[#3D6B22]/10 text-[#1E5622] font-bold ring-2 ring-[#3D6B22]/20 shadow-[0_2px_8px_rgba(61,107,34,0.12)]"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                        }`}
                    >
                      <span className="text-xs block font-semibold">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Program & Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-3 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">
                    Approved Service Line / Program
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <select
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none cursor-pointer"
                    >
                      {LILISARE_SERVICES.map((svc) => (
                        <option key={svc.id} value={svc.name}>
                          {svc.order}. {svc.name} ({svc.code})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">
                    Authorized Weekly Hours
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Clock className="h-4 w-4" />
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={80}
                      value={authorizedHours}
                      onChange={(e) => setAuthorizedHours(Number(e.target.value))}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Care Needs Tags */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Daily Living & ADL Care Needs
                </span>

                <div className="flex flex-wrap gap-2">
                  {[
                    "ADL Bathing Supervision",
                    "Nutritional Meal Preparation",
                    "Sensory Regulation Support",
                    "Standby Transfer Assist",
                    "Community Inclusion & Walking",
                    "Medication Prompting",
                    "Communication Board Support",
                    "Toileting Assistance",
                  ].map((need) => {
                    const isSelected = selectedCareNeeds.includes(need);
                    return (
                      <button
                        key={need}
                        type="button"
                        onClick={() => toggleCareNeed(need)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${isSelected
                          ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-[0_2px_8px_rgba(61,107,34,0.25)]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {need}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Preference & Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-3 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">
                    Preferred Schedule Window
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={schedulePreference}
                      onChange={(e) => setSchedulePreference(e.target.value)}
                      placeholder="e.g. Monday – Friday, 8:00 AM – 4:00 PM"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">
                    Special Care Instructions
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g. Calm routine, standby supervision"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Documents & Final Review */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  4. Documents & Final Review
                  <div className="h-px bg-slate-100 flex-1"></div>
                </h4>
                <p className="text-xs text-slate-500">
                  Verify required consents, authorization info, and review complete record before submission.
                </p>
              </div>

              {/* Compliance & Consent Checklist */}
              <div className="space-y-3 pt-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Required Consent Documents & Compliance Checks
                </span>

                <div className="space-y-2 text-xs">
                  <div
                    onClick={() => setConsentSigned(!consentSigned)}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border transition-all ${consentSigned
                          ? "bg-[#3D6B22] text-white border-[#3D6B22]"
                          : "border-slate-300 bg-white"
                          }`}
                      >
                        {consentSigned && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block text-xs">
                          Verifiable Parental Consent (COPPA / HIPAA Compliant)
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Required for care recipients under legal guardianship.
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${consentSigned
                        ? "bg-emerald-50 text-[#1E5622] border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                    >
                      {consentSigned ? "Signed & Attached" : "Pending Sign-off"}
                    </span>
                  </div>

                  <div
                    onClick={() => setPhysicianOrderUploaded(!physicianOrderUploaded)}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border transition-all ${physicianOrderUploaded
                          ? "bg-[#3D6B22] text-white border-[#3D6B22]"
                          : "border-slate-300 bg-white"
                          }`}
                      >
                        {physicianOrderUploaded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block text-xs">
                          Supporting Care Plan / Physician Assessment
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Required before service authorization can be verified.
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200">
                      {physicianOrderUploaded ? "Attached" : "Missing"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agency Care & Administrator Metadata (Card 2: Agency Care Information) */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Agency Care & Administrative Assignment
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4.5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Administrator</label>
                    <input
                      type="text"
                      value={administrator}
                      onChange={(e) => setAdministrator(e.target.value)}
                      placeholder="Dana Jenkins, MSW"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Region Code / Branch</label>
                    <input
                      type="text"
                      value={regionCode}
                      onChange={(e) => setRegionCode(e.target.value)}
                      placeholder="Brentwood"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Referred By</label>
                    <input
                      type="text"
                      value={referredBy}
                      onChange={(e) => setReferredBy(e.target.value)}
                      placeholder="Walker (Baptist), Jennifer"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Medicaid Number</label>
                    <input
                      type="text"
                      value={medicaidNumber}
                      onChange={(e) => setMedicaidNumber(e.target.value)}
                      placeholder="MED-9647293"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all  text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Payer Authorization Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 pt-3 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">
                    Authorization #
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={authNumber}
                      onChange={(e) => setAuthNumber(e.target.value)}
                      placeholder="AUTH-2026-9812"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">Payer Organization</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      placeholder="State Medicaid Waiver"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">Payer Case Manager</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={caseManagerName}
                      onChange={(e) => setCaseManagerName(e.target.value)}
                      placeholder="Dana Jenkins, MSW"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Final Summary Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3 text-xs">
                <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Registration Summary Review
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Client</span>
                    <strong className="text-slate-900 text-xs font-bold">{clientName || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Care Type</span>
                    <strong className="text-slate-900 text-xs font-bold">{careType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Caregiver</span>
                    <strong className="text-slate-900 text-xs font-bold">{caregiverName || "Unassigned"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Authorized Hours</span>
                    <strong className="text-slate-900 text-xs font-bold">{authorizedHours} hrs/wk</strong>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Readiness Policy: </strong>
                    Client will be created with status <strong>Onboarding</strong>. Service activation
                    will occur once all documents and caregiver screenings are verified.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions: Aligned completely with /intake/pipeline/new/ */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
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

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl transition-all shadow-[0_6px_24px_rgba(61,107,34,0.25)] cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateClient}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-[0_6px_24px_rgba(61,107,34,0.25)] transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Complete Client Registration</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 04. Step 5: Success & Confirmation Screen */}
      {currentStep === 5 && createdClient && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-[0_6px_32px_rgba(0,0,0,0.06)] text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-[#E3F1D9] text-[#1E5622] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-[#1E5622] uppercase tracking-wider bg-[#E3F1D9] px-3 py-1 rounded-full border border-[#1E5622]/20">
              Client Record Created
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              {createdClient.name} Successfully Registered
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Generated unique Client ID{" "}
              <strong className=" text-slate-900">{createdClient.id}</strong>. Linked to{" "}
              <strong className="text-slate-900">{createdClient.household.name}</strong>.
            </p>
          </div>

          {/* Workflow Status Checklist */}
          <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-4 border border-slate-200/90 text-left space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <span>Unique Client ID Generated: {createdClient.id}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <span>Connected Household: {createdClient.household.name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <span>Onboarding Coordinator Assigned: Dana Jenkins, MSW</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">
                !
              </span>
              <span>Status: Onboarding (Awaiting final document verification)</span>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={`${baseBackPath}/${createdClient.id}`}
              className="px-5 py-2.5 bg-[#3D6B22] hover:bg-[#345C1D] text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_16px_rgba(61,107,34,0.25)] flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Full Client Profile</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>

            <Link
              href={baseBackPath}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Return to Clients Workspace
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
