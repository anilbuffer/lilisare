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
import { toast } from "sonner";

export default function AddClientPage() {
  const router = useRouter();

  // Wizard Step: 1, 2, 3, 4, 5 (5 = Success)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [creationPath, setCreationPath] = useState<"direct" | "convert">("convert");
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>("INQ-1042");

  // Step 1: Personal & Contact Information
  const [clientName, setClientName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [primaryLanguage, setPrimaryLanguage] = useState("English");
  const [contactName, setContactName] = useState("");
  const [contactRelationship, setContactRelationship] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [preferredMethod, setPreferredMethod] = useState<"Phone" | "Email" | "SMS">("Phone");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("OR");
  const [zip, setZip] = useState("");
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
  const [program, setProgram] = useState("Pediatric In-Home Care (Medicaid EPSDT Waiver)");
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

  // Step 4: Documents & Review
  const [consentSigned, setConsentSigned] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [physicianOrderUploaded, setPhysicianOrderUploaded] = useState(true);
  const [authNumber, setAuthNumber] = useState("AUTH-2026-NEW");
  const [payerName, setPayerName] = useState("State Medicaid Waiver (DHS)");
  const [caseManagerName, setCaseManagerName] = useState("Dana Jenkins, MSW");

  // Submitted client output
  const [createdClient, setCreatedClient] = useState<ClientRecord | null>(null);

  // Auto-fill when selecting an inquiry
  const handleSelectInquiry = (inquiry: ConvertableInquiry) => {
    setSelectedInquiryId(inquiry.id);
    setClientName(inquiry.clientName);
    setPreferredName(inquiry.clientName.split(" ")[0]);
    setDob(inquiry.dob);
    setGender(inquiry.gender);
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
    if (inquiry.potentialCaregiver) {
      setCaregiverName(inquiry.potentialCaregiver.name);
      setCaregiverPhone(inquiry.potentialCaregiver.phone);
      setFamilyCaregiverRel(inquiry.potentialCaregiver.relationship);
    }
    toast.success(`Populated details from inquiry ${inquiry.id}`);
  };

  // Pre-fill default on mount if in convert mode
  React.useEffect(() => {
    if (creationPath === "convert" && CONVERTABLE_INQUIRIES.length > 0 && !clientName) {
      handleSelectInquiry(CONVERTABLE_INQUIRIES[0]);
    }
  }, [creationPath]);

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

    // Notice: Client status starts as "Onboarding", not Active!
    const newRecord: ClientRecord = {
      id: newId,
      name: clientName,
      preferredName: preferredName || clientName.split(" ")[0],
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + nextNum}?auto=format&fit=crop&q=80&w=200`,
      dob: dob || "2018-06-15",
      age: 8,
      gender: gender,
      primaryLanguage: primaryLanguage,
      status: "Onboarding", // As instructed: Client activation depends on readiness, do not mark every client Active
      careType: careType,
      household: householdInfo,
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
      assignedCareTeam: {
        primaryCaregiver: caregiverName
          ? {
              id: `CG-${nextNum}`,
              name: caregiverName,
              relationship: familyCaregiverRel,
              classification: "W-2",
              status: "Onboarding",
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
          name: "Dana Jenkins, MSW",
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
        overallScore: 65,
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
        frequency: schedulePreference,
        careNeeds: selectedCareNeeds,
        specialInstructions: specialInstructions,
        mobilityNotes: "Independent ambulation; standby support for routine transitions.",
        dietaryRestrictions: "Standard diet.",
        allergies: ["None reported"],
        adlSupportNeeds: selectedCareNeeds,
      },
      authorization: {
        authNumber: authNumber,
        payer: payerName,
        status: "Pending Renewal",
        startDate: new Date().toISOString().split("T")[0],
        expiryDate: "2027-11-19",
        daysUntilExpiry: 365,
        totalUnitsApproved: Number(authorizedHours) * 52,
        unitsUsed: 0,
        unitsRemaining: Number(authorizedHours) * 52,
        weeklyHourCap: Number(authorizedHours) || 30,
        caseManagerName: caseManagerName,
        caseManagerAgency: payerName,
      },
      documents: [
        {
          id: `DOC-${Date.now()}-1`,
          name: "Verifiable Parental Consent (COPPA/HIPAA)",
          category: "Consent",
          status: consentSigned ? "Review needed" : "Missing",
          uploadedDate: new Date().toISOString().split("T")[0],
          signedBy: contactName,
          fileSize: "1.2 MB",
        },
        {
          id: `DOC-${Date.now()}-2`,
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
          author: "Dana Jenkins",
          authorRole: "Onboarding Coordinator",
          title: `Client Record ${newId} Created (${creationPath === "convert" ? `Converted from ${selectedInquiryId}` : "Direct Admin Creation"})`,
          details: `Client onboarding record initialized. Connected to ${householdInfo.name}. Initial status: Onboarding.`,
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

    const updatedList = [newRecord, ...existingClients];
    saveClientsToStorage(updatedList);
    setCreatedClient(newRecord);
    setCurrentStep(5); // Success step
    toast.success(`Client ${newRecord.name} (${newRecord.id}) registered successfully!`);
  };

  const steps = [
    { num: 1, title: "Personal & Contact" },
    { num: 2, title: "Household & Family" },
    { num: 3, title: "Care & Services" },
    { num: 4, title: "Review & Submit" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#3D6B22] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Clients Workspace
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Add New Client
          </h1>
          <p className="text-xs text-slate-500">
            Guided 4-step onboarding wizard for registering clients and connecting family households.
          </p>
        </div>

        <span className="text-xs font-mono font-bold bg-[#E3F1D9] text-[#1E5622] px-3 py-1 rounded-full border border-[#1E5622]/20">
          Client Onboarding Wizard
        </span>
      </div>

      {/* Path Selector: Convert Inquiry vs Direct Registration */}
      {currentStep < 5 && (
        <Card className="p-4 border-[#D5DFDA] bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Choose Registration Pathway
              </span>
              <p className="text-xs text-slate-600">
                Prevent duplicate records by converting existing inquiries whenever possible.
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
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                creationPath === "convert"
                  ? "border-[#3D6B22] bg-[#F2F8EE] ring-2 ring-[#3D6B22]/20"
                  : "border-slate-200 bg-slate-50/50 hover:bg-white"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  creationPath === "convert"
                    ? "bg-[#3D6B22] text-white"
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
                setContactName("");
                setContactPhone("");
                setContactEmail("");
                setAddress("");
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                creationPath === "direct"
                  ? "border-[#3D6B22] bg-[#F2F8EE] ring-2 ring-[#3D6B22]/20"
                  : "border-slate-200 bg-slate-50/50 hover:bg-white"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  creationPath === "direct"
                    ? "bg-[#3D6B22] text-white"
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

          {/* If Convert mode: show eligible inquiries selector */}
          {creationPath === "convert" && (
            <div className="mt-3.5 pt-3 border-t border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Select Qualified Inquiry to Convert:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {CONVERTABLE_INQUIRIES.map((inq) => (
                  <button
                    key={inq.id}
                    type="button"
                    onClick={() => handleSelectInquiry(inq)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      selectedInquiryId === inq.id
                        ? "border-[#3D6B22] bg-white shadow-xs font-bold"
                        : "border-slate-200 bg-white/70 hover:bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500">{inq.id}</span>
                      <span className="text-[10px] font-bold text-[#1E5622] bg-[#E3F1D9] px-1.5 py-0.2 rounded">
                        Ready
                      </span>
                    </div>
                    <div className="text-slate-900 font-bold mt-1 truncate">{inq.clientName}</div>
                    <div className="text-slate-500 text-[10px] truncate">{inq.familyName}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Step Progress Bar Indicator */}
      {currentStep < 5 && (
        <div className="bg-white rounded-2xl border border-[#D5DFDA] p-4 shadow-xs">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((step) => {
              const isPast = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <div
                  key={step.num}
                  className={`text-left cursor-pointer transition-all ${
                    isCurrent
                      ? "text-[#3D6B22]"
                      : isPast
                      ? "text-slate-700"
                      : "text-slate-400 opacity-60"
                  }`}
                  onClick={() => {
                    if (isPast) setCurrentStep(step.num);
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCurrent
                          ? "bg-[#3D6B22] text-white"
                          : isPast
                          ? "bg-[#E3F1D9] text-[#1E5622]"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5" /> : step.num}
                    </span>
                    <span className="text-xs font-bold truncate hidden sm:inline">
                      {step.title}
                    </span>
                  </div>
                  <div
                    className={`h-1.5 rounded-full ${
                      isCurrent
                        ? "bg-[#3D6B22]"
                        : isPast
                        ? "bg-[#93C573]"
                        : "bg-slate-200"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Wizard Step 1: Personal & Contact Information */}
      {currentStep === 1 && (
        <Card className="p-6 border-slate-200 space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              1. Personal & Contact Information
            </h2>
            <p className="text-xs text-slate-500">
              Enter the client demographics and primary family contact info.
            </p>
          </div>

          {/* Client Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Client Details (Person Receiving Care)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Leo Miller"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Preferred / Nickname
                </label>
                <input
                  type="text"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  placeholder="e.g. Leo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other / Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Primary Language
                </label>
                <input
                  type="text"
                  value={primaryLanguage}
                  onChange={(e) => setPrimaryLanguage(e.target.value)}
                  placeholder="English"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>
            </div>
          </div>

          {/* Primary Contact Details */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Primary Contact & Guardian Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Responsible Contact Name *
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Sarah Miller"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Relationship to Client *
                </label>
                <input
                  type="text"
                  value={contactRelationship}
                  onChange={(e) => setContactRelationship(e.target.value)}
                  placeholder="e.g. Mother & Legal Guardian"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Preferred Contact Method
                </label>
                <select
                  value={preferredMethod}
                  onChange={(e) => setPreferredMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                >
                  <option value="Phone">Phone Call</option>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS / Text Message</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Primary Phone *
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Household Physical Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="742 Evergreen Terrace"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Springfield"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">State / Zip</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-16 px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 text-center"
                  />
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="97477"
                    className="flex-1 px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Emergency Contact (24/7 Response)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Emergency Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. David Miller"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Relationship</label>
                <input
                  type="text"
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  placeholder="e.g. Father"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (!clientName.trim()) {
                  toast.error("Please enter the client full legal name.");
                  return;
                }
                setCurrentStep(2);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <span>Continue to Household & Relationships</span>
              <ArrowRight className="w-4 h-4 text-[#93C573]" />
            </button>
          </div>
        </Card>
      )}

      {/* Wizard Step 2: Household & Relationships */}
      {currentStep === 2 && (
        <Card className="p-6 border-slate-200 space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              2. Household & Relationships
            </h2>
            <p className="text-xs text-slate-500">
              Connect this client to an existing household or establish a new family unit.
            </p>
          </div>

          {/* Household Assignment */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Household Unit Assignment
            </h3>

            <div className="flex gap-4 text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="householdChoice"
                  checked={householdChoice === "existing"}
                  onChange={() => setHouseholdChoice("existing")}
                  className="text-[#3D6B22] focus:ring-[#3D6B22]"
                />
                <span>Link to Existing Household</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="householdChoice"
                  checked={householdChoice === "new"}
                  onChange={() => setHouseholdChoice("new")}
                  className="text-[#3D6B22] focus:ring-[#3D6B22]"
                />
                <span>Create New Household Unit</span>
              </label>
            </div>

            {householdChoice === "existing" ? (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select Existing Family Household
                </label>
                <select
                  value={selectedHouseholdId}
                  onChange={(e) => setSelectedHouseholdId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                >
                  {MOCK_HOUSEHOLDS.map((hh) => (
                    <option key={hh.id} value={hh.id}>
                      {hh.name} ({hh.code}) – {hh.address}, {hh.city}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  New Household Name
                </label>
                <input
                  type="text"
                  value={newHouseholdName}
                  onChange={(e) => setNewHouseholdName(e.target.value)}
                  placeholder="e.g. Sullivan Household"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            )}
          </div>

          {/* Family Caregiver Information */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Family or Friend Caregiver Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Caregiver Candidate Name
                </label>
                <input
                  type="text"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  placeholder="e.g. Sarah Miller"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Caregiver Relationship
                </label>
                <input
                  type="text"
                  value={familyCaregiverRel}
                  onChange={(e) => setFamilyCaregiverRel(e.target.value)}
                  placeholder="e.g. Mother (Family Caregiver)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Caregiver Phone
                </label>
                <input
                  type="tel"
                  value={caregiverPhone}
                  onChange={(e) => setCaregiverPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Decision-Making Permissions Checklist */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Guardian Permissions & Decision-Making Authority
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                "Medical Decisions",
                "Sign Consents",
                "View Care Notes",
                "Manage Scheduling",
                "Authorized Pickup",
                "Financial Decisions",
              ].map((perm) => (
                <label
                  key={perm}
                  onClick={() => togglePermission(perm)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    permissions.includes(perm)
                      ? "border-[#3D6B22] bg-[#F2F8EE] text-[#1E5622] font-bold"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border ${
                      permissions.includes(perm)
                        ? "bg-[#3D6B22] text-white border-[#3D6B22]"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {permissions.includes(perm) && <Check className="w-3 h-3" />}
                  </span>
                  <span>{perm}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <span>Continue to Care & Services</span>
              <ArrowRight className="w-4 h-4 text-[#93C573]" />
            </button>
          </div>
        </Card>
      )}

      {/* Wizard Step 3: Care Requirements & Services */}
      {currentStep === 3 && (
        <Card className="p-6 border-slate-200 space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              3. Care Requirements & Services
            </h2>
            <p className="text-xs text-slate-500">
              Configure requested care arrangements, program waiver, and support schedules.
            </p>
          </div>

          {/* Requested Care Arrangement */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Requested Care Arrangement Type
            </h3>
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
                  className={`p-3 rounded-xl border text-center transition-all ${
                    careType === type
                      ? "border-[#3D6B22] bg-[#F2F8EE] text-[#1E5622] font-bold ring-2 ring-[#3D6B22]/20"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                  }`}
                >
                  <span className="text-xs block">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Program & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Approved Service Line / Program
              </label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              >
                <option value="Pediatric In-Home Care (Medicaid EPSDT Waiver)">
                  Pediatric In-Home Care (Medicaid EPSDT Waiver)
                </option>
                <option value="Medicaid K-Plan / DD In-Home Attendant Support">
                  Medicaid K-Plan / DD In-Home Attendant Support
                </option>
                <option value="Senior Community Care / OHP Waiver">
                  Senior Community Care / OHP Waiver
                </option>
                <option value="Medicaid Elderly Waiver (Live-In Personal Care)">
                  Medicaid Elderly Waiver (Live-In Personal Care)
                </option>
                <option value="Private Duty / Family Respite">
                  Private Duty / Family Respite
                </option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Authorized Weekly Hours
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={authorizedHours}
                  onChange={(e) => setAuthorizedHours(Number(e.target.value))}
                  className="w-24 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold"
                />
                <span className="text-xs text-slate-500 font-medium">hours / week requested</span>
              </div>
            </div>
          </div>

          {/* Care Needs Tags */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Daily Living & ADL Care Needs
            </h3>

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
              ].map((need) => (
                <button
                  key={need}
                  type="button"
                  onClick={() => toggleCareNeed(need)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedCareNeeds.includes(need)
                      ? "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/30 font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {selectedCareNeeds.includes(need) ? "✓ " : "+ "}
                  {need}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Preference & Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Preferred Schedule Window
              </label>
              <input
                type="text"
                value={schedulePreference}
                onChange={(e) => setSchedulePreference(e.target.value)}
                placeholder="e.g. Monday – Friday, 8:00 AM – 4:00 PM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Special Care Instructions
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Calm routine, asthma inhaler in kitchen"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <span>Continue to Documents & Review</span>
              <ArrowRight className="w-4 h-4 text-[#93C573]" />
            </button>
          </div>
        </Card>
      )}

      {/* Wizard Step 4: Documents & Review */}
      {currentStep === 4 && (
        <Card className="p-6 border-slate-200 space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">4. Documents & Final Review</h2>
            <p className="text-xs text-slate-500">
              Verify required consents, authorization info, and review complete record before submission.
            </p>
          </div>

          {/* Compliance & Consent Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Required Consent Documents & Compliance Checks
            </h3>

            <div className="space-y-2 text-xs">
              <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={consentSigned}
                    onChange={(e) => setConsentSigned(e.target.checked)}
                    className="text-[#3D6B22] rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-900">
                      Verifiable Parental Consent (COPPA/HIPAA Compliant)
                    </span>
                    <span className="text-slate-500 block text-[11px]">
                      Required for care recipients under legal guardianship.
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    consentSigned
                      ? "bg-[#E3F1D9] text-[#1E5622]"
                      : "bg-[#FEE2E2] text-[#B91C1C]"
                  }`}
                >
                  {consentSigned ? "Signed & Attached" : "Pending Sign-off"}
                </span>
              </label>

              <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={physicianOrderUploaded}
                    onChange={(e) => setPhysicianOrderUploaded(e.target.checked)}
                    className="text-[#3D6B22] rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-900">
                      Supporting Care Plan / Physician Assessment
                    </span>
                    <span className="text-slate-500 block text-[11px]">
                      Required before service authorization can be verified.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E3F1D9] text-[#1E5622]">
                  {physicianOrderUploaded ? "Attached" : "Missing"}
                </span>
              </label>
            </div>
          </div>

          {/* Payer Authorization Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Authorization # (If Available)
              </label>
              <input
                type="text"
                value={authNumber}
                onChange={(e) => setAuthNumber(e.target.value)}
                placeholder="AUTH-2026-9812"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Payer Organization</label>
              <input
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="State Medicaid Waiver"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Payer Case Manager</label>
              <input
                type="text"
                value={caseManagerName}
                onChange={(e) => setCaseManagerName(e.target.value)}
                placeholder="Dana Jenkins, MSW"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Final Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Registration Summary Review
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600">
              <div>
                <span className="text-slate-400 block">Client</span>
                <strong className="text-slate-900">{clientName || "—"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Care Type</span>
                <strong className="text-slate-900">{careType}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Caregiver</span>
                <strong className="text-slate-900">{caregiverName || "Unassigned"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Authorized Hours</span>
                <strong className="text-slate-900">{authorizedHours} hrs/wk</strong>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Readiness Policy: </strong>
                Client will be created with status <strong>Onboarding</strong>. Service activation
                will occur once all documents and caregiver screenings are verified.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleCreateClient}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-[#93C573]" />
              <span>Submit & Create Client Record</span>
            </button>
          </div>
        </Card>
      )}

      {/* Step 5: Success & Confirmation Screen */}
      {currentStep === 5 && createdClient && (
        <Card className="p-8 border-slate-200 text-center space-y-6 animate-in zoom-in-95 duration-200">
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
              <strong className="font-mono text-slate-900">{createdClient.id}</strong>. Linked to{" "}
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
              href={`/clients/${createdClient.id}`}
              className="px-5 py-2.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>View Full Client Profile</span>
              <ArrowRight className="w-4 h-4 text-[#93C573]" />
            </Link>

            <Link
              href="/clients"
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Return to Clients Workspace
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
