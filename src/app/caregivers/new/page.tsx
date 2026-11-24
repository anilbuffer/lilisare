"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  Building,
  GraduationCap,
  Award,
  Lock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  User,
  Building2,
  Globe,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  CONVERTABLE_APPLICATIONS,
  ConvertableApplication,
  getCaregiversFromStorage,
  saveCaregiversToStorage,
  INITIAL_CAREGIVERS,
} from "@/lib/caregivers/mockData";
import { INITIAL_CLIENTS } from "@/lib/clients/mockData";
import { CaregiverRecord, CaregiverType, CaregiverStatus } from "@/types/caregiver";
import { VoiceDictationBanner } from "@/components/ui/VoiceDictationBanner";
import { toast } from "sonner";

function AddCaregiverWizard({
  baseBackPath = "/caregivers",
}: {
  baseBackPath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathwayParam = searchParams.get("pathway");

  // Wizard Step: 1, 2, 3, 4, 5, 6 (6 = Complete)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [creationPath, setCreationPath] = useState<"direct" | "convert">(
    pathwayParam === "direct" ? "direct" : "convert"
  );
  const [selectedAppId, setSelectedAppId] = useState<string>(
    pathwayParam === "direct" ? "" : "APP-301"
  );

  // Step 1: Personal Information
  const isDirectInit = pathwayParam === "direct";
  const [fullName, setFullName] = useState(isDirectInit ? "" : "Brianna Jenkins");
  const [preferredName, setPreferredName] = useState(isDirectInit ? "" : "Brianna");
  const [dob, setDob] = useState(isDirectInit ? "" : "1992-04-18");
  const [gender, setGender] = useState("Female");
  const [languages, setLanguages] = useState("English");
  const [phone, setPhone] = useState(isDirectInit ? "" : "(541) 555-0812");
  const [email, setEmail] = useState(isDirectInit ? "" : "brianna.jenkins@example.com");
  const [street, setStreet] = useState(isDirectInit ? "" : "742 Evergreen Terrace");
  const [city, setCity] = useState(isDirectInit ? "" : "Springfield");
  const [state, setState] = useState("OR");
  const [zip, setZip] = useState(isDirectInit ? "" : "97477");
  const [emergencyName, setEmergencyName] = useState(isDirectInit ? "" : "David Miller");
  const [emergencyRel, setEmergencyRel] = useState(isDirectInit ? "" : "Brother-in-law");
  const [emergencyPhone, setEmergencyPhone] = useState(isDirectInit ? "" : "(541) 555-0211");

  // Step 2: Caregiver Type & Relationship
  const [caregiverType, setCaregiverType] = useState<CaregiverType>("Family Caregiver");
  const [relationshipToClient, setRelationshipToClient] = useState(
    isDirectInit ? "" : "Sister & Secondary Guardian"
  );
  const [selectedClientId, setSelectedClientId] = useState(isDirectInit ? "" : "CL-1001");
  const [branch, setBranch] = useState("Mountain Lane");
  const [classification, setClassification] = useState<"W-2" | "1099" | "Family Paid Exempt">("W-2");
  const [capacityHours, setCapacityHours] = useState(25);
  const [caregivingBoundaries, setCaregivingBoundaries] = useState(
    isDirectInit ? "" : "Relief respite and after-school personal care support for Leo Miller."
  );

  // Sync pathway when query parameter changes
  useEffect(() => {
    if (pathwayParam === "direct") {
      setCreationPath("direct");
      setSelectedAppId("");
      setFullName("");
      setPreferredName("");
      setDob("");
      setPhone("");
      setEmail("");
      setStreet("");
      setCity("");
      setZip("");
      setEmergencyName("");
      setEmergencyRel("");
      setEmergencyPhone("");
      setRelationshipToClient("");
      setSelectedClientId("");
      setCaregivingBoundaries("");
    } else if (pathwayParam === "convert") {
      setCreationPath("convert");
      const first = CONVERTABLE_APPLICATIONS[0];
      if (first) {
        handleSelectApplication(first);
      }
    }
  }, [pathwayParam]);

  // Step 3: Documents & Credentials
  const [idVerified, setIdVerified] = useState(true);
  const [idIssuer, setIdIssuer] = useState("Oregon DMV Driver's License");
  const [cprVerified, setCprVerified] = useState(true);
  const [cprExpiry, setCprExpiry] = useState("2028-04-15");
  const [tbTested, setTbTested] = useState(true);
  const [tbExpiry, setTbExpiry] = useState("2027-04-15");
  const [i9Signed, setI9Signed] = useState(true);

  // Step 4: Screening & Training
  const [initiateBcu, setInitiateBcu] = useState(true);
  const [oigSamCleared, setOigSamCleared] = useState(true);
  const [abuseRegistryInitiated, setAbuseRegistryInitiated] = useState(true);
  const [assignTrainingHours, setAssignTrainingHours] = useState(8);
  const [trainingCoursesSelected, setTrainingCoursesSelected] = useState<string[]>([
    "Mandatory Child Abuse Reporting",
    "HIPAA & Patient Privacy",
    "EVV Mobile Protocol",
  ]);

  // Step 5: Review & Onboarding Status Assignment
  const [initialStatus, setInitialStatus] = useState<CaregiverStatus>("Onboarding");
  const [onboardingCoordinator, setOnboardingCoordinator] = useState("Dana Jenkins, MSW");

  // Created Caregiver Result
  const [createdCaregiver, setCreatedCaregiver] = useState<CaregiverRecord | null>(null);

  // Handle application conversion pre-fill
  const handleSelectApplication = (app: ConvertableApplication) => {
    setSelectedAppId(app.id);
    setFullName(app.applicantName);
    setPreferredName(app.applicantName.split(" ")[0]);
    setPhone(app.phone);
    setEmail(app.email);
    setCity(app.city);
    setState(app.state);
    setCaregiverType(app.caregiverType);
    setRelationshipToClient(app.relationshipToClient);
    setSelectedClientId(app.intendedClientId);
    setCaregivingBoundaries(app.notes);
    toast.info(`Pre-filled from application ${app.id} (${app.applicantName})`);
  };

  const toggleCourse = (course: string) => {
    if (trainingCoursesSelected.includes(course)) {
      setTrainingCoursesSelected(trainingCoursesSelected.filter((c) => c !== course));
    } else {
      setTrainingCoursesSelected([...trainingCoursesSelected, course]);
    }
  };

  const handleVoiceDictate = () => {
    setFullName("Brianna Jenkins");
    setPreferredName("Brianna");
    setDob("1992-04-18");
    setGender("Female");
    setLanguages("English, Spanish");
    setPhone("(541) 555-0812");
    setEmail("brianna.jenkins@example.com");
    setStreet("742 Evergreen Terrace");
    setCity("Springfield");
    setState("OR");
    setZip("97477");
    setEmergencyName("David Miller");
    setEmergencyRel("Brother-in-law");
    setEmergencyPhone("(541) 555-0211");
    setCaregiverType("Family Caregiver");
    setRelationshipToClient("Sister & Secondary Guardian");
    setSelectedClientId("CL-1001");
    setClassification("W-2");
    setCapacityHours(25);
    setCaregivingBoundaries(
      "Relief respite and after-school personal care support for Leo Miller."
    );
    toast.success("AI Voice dictation transcribed and mapped to caregiver registration fields!");
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!fullName.trim() || !phone.trim() || !email.trim()) {
        toast.error("Please enter the required full name, phone, and email.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const existingCaregivers = getCaregiversFromStorage();
    const nextNum = 140 + Math.floor(Math.random() * 850);
    const newId = `CG-${nextNum}`;

    const linkedClient = INITIAL_CLIENTS.find((c) => c.id === selectedClientId);

    const newRecord: CaregiverRecord = {
      id: newId,
      name: fullName,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      type: caregiverType,
      status: initialStatus,
      branch,
      hireDate: new Date().toISOString().split("T")[0],
      employmentClassification: classification,
      assignmentStatus: "Assigned",
      verificationChecklist: {
        identity: idVerified ? "Verified" : "Pending",
        screening: initiateBcu ? "In Review" : "Pending",
        cprFirstAid: cprVerified ? "Verified" : "Missing",
        training: "In Progress",
      },
      personalInfo: {
        preferredName,
        dob,
        gender,
        languages: languages.split(",").map((l) => l.trim()),
        phone,
        email,
        address: {
          street,
          city,
          state,
          zip,
        },
        emergencyContact: {
          name: emergencyName,
          relationship: emergencyRel,
          phone: emergencyPhone,
        },
        preferredCommunication: "Phone",
        maskedIdentifiers: {
          ssnMasked: `***-**-${Math.floor(1000 + Math.random() * 9000)}`,
          driversLicenseMasked: `DL-***-${Math.floor(1000 + Math.random() * 9000)}`,
          taxIdMasked: `TIN-***-${Math.floor(1000 + Math.random() * 9000)}`,
        },
      },
      relationship: {
        caregiverType,
        relationshipToClient,
        linkedHousehold: {
          id: linkedClient?.household.id || "hh-1001",
          code: linkedClient?.household.code || "HH-1001",
          name: linkedClient?.household.name || "Associated Household",
          address: linkedClient?.household.address || street,
          phone: linkedClient?.household.phone || phone,
          city: linkedClient?.household.city || city,
          state: linkedClient?.household.state || state,
        },
        relationshipVerificationStatus: "Pending Review",
        householdPermissions: ["Care Routine", "ADL Supervision", "EVV Shifts"],
        caregivingBoundaries,
      },
      documentsCredentials: {
        overallStatus: cprVerified ? "Verified" : "Missing",
        cprExpiryDate: cprExpiry,
        tbTestExpiryDate: tbExpiry,
        items: [
          {
            id: `cred-${Date.now()}-1`,
            name: idIssuer,
            category: "Identity",
            issuer: "State Agency",
            issueDate: "2024-01-10",
            status: idVerified ? "Verified" : "Pending Review",
          },
          {
            id: `cred-${Date.now()}-2`,
            name: "CPR & First Aid BLS",
            category: "Certification",
            issuer: "AHA",
            issueDate: "2026-04-15",
            expiryDate: cprExpiry,
            status: cprVerified ? "Verified" : "Missing",
          },
        ],
      },
      screeningTraining: {
        backgroundCheck: {
          status: "Pending Review",
          referenceNumber: `BKG-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          provider: "Oregon DHS BCU",
          renewalDate: "2027-11-19",
        },
        screenings: [
          { name: "OIG / SAM Exclusion", status: oigSamCleared ? "Cleared" : "Pending", lastCheckedDate: "2026-11-19" },
          { name: "State Child Abuse Registry", status: "Pending", lastCheckedDate: "2026-11-19" },
        ],
        trainingCourses: trainingCoursesSelected.map((title, i) => ({
          id: `tr-new-${i}`,
          title,
          category: "Compliance & Safety",
          hours: 2,
          status: "In Progress",
          requiredForActivation: true,
        })),
        overallTrainingStatus: "In Progress",
        trainingHoursCompleted: 0,
        trainingHoursRequired: assignTrainingHours,
        screeningReviewDecisions: [],
      },
      availabilityAssignments: {
        assignedClient: linkedClient
          ? {
            id: linkedClient.id,
            name: linkedClient.name,
            avatarUrl: linkedClient.avatarUrl,
            householdId: linkedClient.household.id,
            householdName: linkedClient.household.name,
            relationship: relationshipToClient,
            weeklyAuthorizedHours: capacityHours,
            scheduledWeeklyHours: 0,
            startDate: "Pending Activation",
            status: "Pending Setup",
          }
          : undefined,
        weeklyCapacityHours: capacityHours,
        scheduledWeeklyHours: 0,
        availabilitySchedule: [
          { day: "Monday", available: true, timeSlots: "Available" },
          { day: "Tuesday", available: true, timeSlots: "Available" },
          { day: "Wednesday", available: true, timeSlots: "Available" },
          { day: "Thursday", available: true, timeSlots: "Available" },
          { day: "Friday", available: true, timeSlots: "Available" },
        ],
        assignmentHistory: [],
      },
      evvVisitHistory: {
        overallComplianceRate: 100,
        totalVisitsCompleted: 0,
        gpsVerificationRate: 100,
        missedClockOutCount: 0,
        isRestrictedEVV: true,
        recentVisits: [],
      },
      activityHistory: {
        recentUpdates: [
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            relativeTime: "Just now",
            title: "Caregiver registered",
            description:
              creationPath === "convert" && selectedAppId
                ? `${newId} converted from candidate application ${selectedAppId} (${caregiverType})`
                : `${newId} registered via Direct Administrative Entry (${caregiverType})`,
            actor: onboardingCoordinator,
            type: "profile",
          },
        ],
      },
    };

    const updatedList = [newRecord, ...existingCaregivers];
    saveCaregiversToStorage(updatedList);
    setCreatedCaregiver(newRecord);
    setCurrentStep(6);
    toast.success(`Caregiver registration complete: ${newId} created!`);
  };

  const stepLabels = [
    { num: 1, title: "Personal Details" },
    { num: 2, title: "Workforce & Family" },
    { num: 3, title: "Credentials" },
    { num: 4, title: "Screening & Training" },
    { num: 5, title: "Review & Submit" },
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
          <span>Back to Caregivers Directory</span>
        </Link>
      </div>

      {/* Header Banner - Matching /households/new/ Card Style */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-[0_6px_32px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200/80">
                Caregiver Registration
              </span>
              <span className="text-xs text-slate-400">
                Step {currentStep} of 5: {stepLabels.find((s) => s.num === currentStep)?.title}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Add New Caregiver
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Guided 5-step registration for Family Caregivers, Live-In Attendants, and Family Friends.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center shrink-0 self-start sm:self-center shadow-[0_4px_16px_rgba(61,107,34,0.12)]">
            <Sparkles className="w-6 h-6 text-[#3D6B22]" />
          </div>
        </div>

        {/* Step Progress Bar with Circular Indicators */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="grid grid-cols-5 gap-2">
            {stepLabels.map((s) => {
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

      {/* 02. Pathway Selector: Convert Applicant vs Direct Registration */}
      {currentStep < 6 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Registration Pathway
                <div className="h-px bg-slate-100 flex-1"></div>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Prevent duplicate caregiver profiles by importing existing recruitment applications or create directly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setCreationPath("convert");
                const first = CONVERTABLE_APPLICATIONS[0];
                if (first) handleSelectApplication(first);
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
                  Convert Applicant from Onboarding Pipeline
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Import application screening data and prevent duplicate profiles.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setCreationPath("direct");
                setFullName("");
                setPreferredName("");
                setPhone("");
                setEmail("");
                setCaregivingBoundaries("");
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
                  Register New Caregiver Directly
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Start fresh registration form for an administrative direct hire.
                </div>
              </div>
            </button>
          </div>

          {/* Qualified Applications List */}
          {creationPath === "convert" && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Select Qualified Application to Convert:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CONVERTABLE_APPLICATIONS.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleSelectApplication(app)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${selectedAppId === app.id
                      ? "border-[#3D6B22] bg-[#3D6B22]/5 shadow-xs font-semibold ring-1 ring-[#3D6B22]"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className=" text-[10px] text-slate-500 font-bold">{app.id}</span>
                      <span className="text-[10px] font-bold text-[#1E5622] bg-[#E3F1D9] px-2 py-0.5 rounded-full">
                        {app.caregiverType}
                      </span>
                    </div>
                    <div className="text-slate-900 font-bold mt-1.5 truncate">{app.applicantName}</div>
                    <div className="text-slate-500 text-[11px] truncate">
                      {app.relationshipToClient} · {app.city}, {app.state}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Voice Dictation Action Banner */}
      {currentStep < 6 && (
        <VoiceDictationBanner
          title="AI Voice Dictation"
          subtitle="Speak naturally to auto-populate caregiver credentials, contact, and workforce profile"
          buttonLabel="Dictate Caregiver"
          onDictate={handleVoiceDictate}
        />
      )}

      {/* 03. Main Guided Form Card */}
      {currentStep < 6 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-6 overflow-hidden">
          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  1. Personal & Contact Details
                  <div className="h-px bg-slate-100 flex-1"></div>
                </h4>
                <p className="text-xs text-slate-500">
                  Caregiver legal demographics, contact channels, and primary physical address.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 pt-1">
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
                      placeholder="e.g. Brianna Jenkins"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">
                    Preferred Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Brianna"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>
                </div>

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
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
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
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      placeholder="English"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(541) 555-0812"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="brianna.jenkins@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">Street Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
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
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="OR"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-center"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">ZIP Code</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="97477"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Workforce & Family Relationships */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  2. Workforce & Family Relationships
                  <div className="h-px bg-slate-100 flex-1"></div>
                </h4>
                <p className="text-xs text-slate-500">
                  Classify caregiver employment model and link them to family care recipient households.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Caregiver Workforce Classification
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(
                    [
                      "Family Caregiver",
                      "Live-In Caregiver",
                      "Family Friend Caregiver",
                      "Agency Direct Care",
                    ] as CaregiverType[]
                  ).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCaregiverType(type)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${caregiverType === type
                        ? "border-[#3D6B22] bg-[#3D6B22]/10 text-[#1E5622] font-bold ring-2 ring-[#3D6B22]/20 shadow-[0_2px_8px_rgba(61,107,34,0.12)]"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                        }`}
                    >
                      <span className="text-xs block font-semibold">{type}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Link to Client / Care Recipient
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none cursor-pointer"
                      >
                        {INITIAL_CLIENTS.map((cl) => (
                          <option key={cl.id} value={cl.id}>
                            {cl.name} ({cl.id}) – {cl.household.name}
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
                      Relationship to Client
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={relationshipToClient}
                        onChange={(e) => setRelationshipToClient(e.target.value)}
                        placeholder="e.g. Sister & Secondary Guardian"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700">
                      Weekly Capacity (Hours)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Clock className="h-4 w-4" />
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={capacityHours}
                        onChange={(e) => setCapacityHours(Number(e.target.value))}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Credentials & Certifications */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  3. Documents & Credentials
                  <div className="h-px bg-slate-100 flex-1"></div>
                </h4>
                <p className="text-xs text-slate-500">
                  Verify government identification, BLS CPR certificate, and health clearances.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div
                  onClick={() => setIdVerified(!idVerified)}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border transition-all ${idVerified ? "bg-[#3D6B22] text-white border-[#3D6B22]" : "border-slate-300 bg-white"
                        }`}
                    >
                      {idVerified && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block text-xs">
                        Government Photo ID Verified (DMV / Passport)
                      </span>
                      <span className="text-slate-500 text-[11px]">Identity matched to applicant SSN and record.</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${idVerified ? "bg-emerald-50 text-[#1E5622] border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                  >
                    {idVerified ? "Verified" : "Pending"}
                  </span>
                </div>

                <div
                  onClick={() => setCprVerified(!cprVerified)}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border transition-all ${cprVerified ? "bg-[#3D6B22] text-white border-[#3D6B22]" : "border-slate-300 bg-white"
                        }`}
                    >
                      {cprVerified && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block text-xs">
                        BLS CPR & First Aid Certification
                      </span>
                      <span className="text-slate-500 text-[11px]">Valid American Heart Association or Red Cross certificate.</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${cprVerified ? "bg-emerald-50 text-[#1E5622] border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                  >
                    {cprVerified ? `Valid until ${cprExpiry}` : "Pending Upload"}
                  </span>
                </div>

                <div
                  onClick={() => setTbTested(!tbTested)}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border transition-all ${tbTested ? "bg-[#3D6B22] text-white border-[#3D6B22]" : "border-slate-300 bg-white"
                        }`}
                    >
                      {tbTested && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block text-xs">
                        TB (Tuberculosis) Negative Health Clearance
                      </span>
                      <span className="text-slate-500 text-[11px]">Chest X-ray or skin screening within 12 months.</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200">
                    {tbTested ? `Clear until ${tbExpiry}` : "Missing"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Screening & Training */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  4. Screening & Training
                  <div className="h-px bg-slate-100 flex-1"></div>
                </h4>
                <p className="text-xs text-slate-500">
                  Background checks (BCU), OIG/SAM sanctions, and mandatory onboarding training courses.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Mandatory Compliance Training Modules
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    "Mandatory Child Abuse Reporting",
                    "HIPAA & Patient Privacy",
                    "EVV Mobile Protocol",
                    "Bloodborne Pathogens Safety",
                    "Crisis De-escalation & Safety",
                    "Client Rights & Ethics",
                  ].map((course) => {
                    const isChecked = trainingCoursesSelected.includes(course);
                    return (
                      <div
                        key={course}
                        onClick={() => toggleCourse(course)}
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
                        <span className="text-xs">{course}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  5. Review & Final Confirmation
                  <div className="h-px bg-slate-100 flex-1"></div>
                </h4>
                <p className="text-xs text-slate-500">
                  Verify registration details and confirm initial onboarding status assignment.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3 text-xs">
                <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Caregiver Registration Summary
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Caregiver Name</span>
                    <strong className="text-slate-900 text-xs font-bold">{fullName || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Caregiver Type</span>
                    <strong className="text-slate-900 text-xs font-bold">{caregiverType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Classification</span>
                    <strong className="text-slate-900 text-xs font-bold">{classification}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Capacity</span>
                    <strong className="text-slate-900 text-xs font-bold">{capacityHours} hrs/wk</strong>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Workforce Activation Rule: </strong>
                    Caregiver will be registered with status <strong>Onboarding</strong>. EVV shift dispatch
                    will unlock once background checks and mandatory courses are fully cleared.
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
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-[0_6px_32px_rgba(0,0,0,0.06)] cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            ) : (
              <Link
                href={baseBackPath}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-[0_6px_32px_rgba(0,0,0,0.06)] cursor-pointer"
              >
                Cancel
              </Link>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl transition-all shadow-[0_6px_24px_rgba(61,107,34,0.25)] cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-[0_6px_24px_rgba(61,107,34,0.25)] transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Complete Caregiver Registration</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 04. Step 6: Success Confirmation Screen */}
      {currentStep === 6 && createdCaregiver && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-[0_6px_32px_rgba(0,0,0,0.06)] text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-[#E3F1D9] text-[#1E5622] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-[#1E5622] uppercase tracking-wider bg-[#E3F1D9] px-3 py-1 rounded-full border border-[#1E5622]/20">
              Caregiver Profile Created
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              {createdCaregiver.name} Successfully Registered
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Generated unique Caregiver ID{" "}
              <strong className=" text-slate-900">{createdCaregiver.id}</strong> under{" "}
              <strong className="text-slate-900">{createdCaregiver.type}</strong> classification.
            </p>
          </div>

          {/* Workflow Status Checklist */}
          <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-4 border border-slate-200/90 text-left space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <span>Unique Caregiver ID Generated: {createdCaregiver.id}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <span>Classification: {createdCaregiver.employmentClassification}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">
                !
              </span>
              <span>Status: Onboarding (Awaiting background check clearance)</span>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={`${baseBackPath}/${createdCaregiver.id}`}
              className="px-5 py-2.5 bg-[#3D6B22] hover:bg-[#345C1D] text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_16px_rgba(61,107,34,0.25)] flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Full Caregiver Profile</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>

            <Link
              href={baseBackPath}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Return to Caregivers Directory
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddCaregiverPage({
  baseBackPath = "/caregivers",
}: {
  baseBackPath?: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-4xl mx-auto py-12 text-center text-slate-400">
          Loading Caregiver Registration Wizard...
        </div>
      }
    >
      <AddCaregiverWizard baseBackPath={baseBackPath} />
    </Suspense>
  );
}
