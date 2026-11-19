"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
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
import { toast } from "sonner";

export default function AddCaregiverPage() {
  const router = useRouter();

  // Wizard Step: 1, 2, 3, 4, 5, 6 (6 = Complete)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [creationPath, setCreationPath] = useState<"direct" | "convert">("convert");
  const [selectedAppId, setSelectedAppId] = useState<string>("APP-301");

  // Step 1: Personal Information
  const [fullName, setFullName] = useState("Brianna Jenkins");
  const [preferredName, setPreferredName] = useState("Brianna");
  const [dob, setDob] = useState("1992-04-18");
  const [gender, setGender] = useState("Female");
  const [languages, setLanguages] = useState("English");
  const [phone, setPhone] = useState("(541) 555-0812");
  const [email, setEmail] = useState("brianna.jenkins@example.com");
  const [street, setStreet] = useState("742 Evergreen Terrace");
  const [city, setCity] = useState("Springfield");
  const [state, setState] = useState("OR");
  const [zip, setZip] = useState("97477");
  const [emergencyName, setEmergencyName] = useState("David Miller");
  const [emergencyRel, setEmergencyRel] = useState("Brother-in-law");
  const [emergencyPhone, setEmergencyPhone] = useState("(541) 555-0211");

  // Step 2: Caregiver Type & Relationship
  const [caregiverType, setCaregiverType] = useState<CaregiverType>("Family Caregiver");
  const [relationshipToClient, setRelationshipToClient] = useState("Sister & Secondary Guardian");
  const [selectedClientId, setSelectedClientId] = useState("CL-1001");
  const [branch, setBranch] = useState("Mountain Lane");
  const [classification, setClassification] = useState<"W-2" | "1099" | "Family Paid Exempt">("W-2");
  const [capacityHours, setCapacityHours] = useState(25);
  const [caregivingBoundaries, setCaregivingBoundaries] = useState(
    "Relief respite and after-school personal care support for Leo Miller."
  );

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
    // Generate unique sequential Caregiver ID e.g. CG-140
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
            description: `${newId} registered under ${caregiverType} classification`,
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
    { num: 1, title: "Personal Information" },
    { num: 2, title: "Caregiver Type & Relationship" },
    { num: 3, title: "Documents & Credentials" },
    { num: 4, title: "Screening & Training" },
    { num: 5, title: "Review & Submit" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/caregivers"
            className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-[#3D6B22] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Caregiver Directory</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 font-medium">Add New Caregiver</span>
        </div>
      </div>

      {currentStep !== 6 && (
        <>
          {/* Header Title */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Caregiver</h1>
            <p className="text-xs text-slate-500 mt-1">
              Guided 5-step registration for Family Caregivers, Live-In Attendants, and Family Friends
            </p>
          </div>

          {/* Path Selection: Direct vs Convert Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setCreationPath("convert");
                const first = CONVERTABLE_APPLICATIONS[0];
                if (first) handleSelectApplication(first);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                creationPath === "convert"
                  ? "border-[#3D6B22] bg-[#F2F8EE]/70 ring-1 ring-[#3D6B22]/30 shadow-sm"
                  : "border-slate-100 hover:bg-slate-50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  creationPath === "convert"
                    ? "bg-[#3D6B22] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <FolderInput className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Convert Applicant from Onboarding Pipeline
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Recommended: Select an existing application to prevent duplicate profiles
                </span>
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
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                creationPath === "direct"
                  ? "border-[#3D6B22] bg-[#F2F8EE]/70 ring-1 ring-[#3D6B22]/30 shadow-sm"
                  : "border-slate-100 hover:bg-slate-50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  creationPath === "direct"
                    ? "bg-[#3D6B22] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Register New Caregiver Directly
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Start fresh registration form for a new workforce applicant
                </span>
              </div>
            </button>
          </div>

          {/* Stepper Strip */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
            <div className="grid grid-cols-5 gap-2">
              {stepLabels.map((st) => {
                const isPast = currentStep > st.num;
                const isCurr = currentStep === st.num;
                return (
                  <button
                    key={st.num}
                    type="button"
                    disabled={currentStep < st.num}
                    onClick={() => setCurrentStep(st.num)}
                    className={`text-left group transition-all ${
                      currentStep < st.num ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          isPast
                            ? "bg-[#3D6B22] text-white"
                            : isCurr
                            ? "bg-[#3D6B22]/10 text-[#3D6B22] ring-2 ring-[#3D6B22]"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isPast ? "✓" : st.num}
                      </span>
                      <span
                        className={`text-[11px] font-bold truncate ${
                          isCurr ? "text-[#3D6B22]" : "text-slate-600"
                        }`}
                      >
                        Step {st.num}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate hidden sm:block">
                      {st.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* STEP 1: Personal Information */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-6 space-y-6 animate-fadeIn">
          {creationPath === "convert" && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Select Applicant from Onboarding Pipeline
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {CONVERTABLE_APPLICATIONS.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleSelectApplication(app)}
                    className={`p-3 rounded-lg border text-left transition-all text-xs cursor-pointer ${
                      selectedAppId === app.id
                        ? "bg-[#E3F1D9]/40 border-[#3D6B22] ring-1 ring-[#3D6B22]"
                        : "bg-white border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{app.applicantName}</span>
                      <span className="text-[10px] font-mono text-[#3D6B22] font-semibold">{app.id}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{app.caregiverType}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Stage: {app.currentPipelineStage}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">1. Personal Information</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Legal name, direct contact details, residential address, and emergency contact
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Brianna Jenkins"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Preferred Name</label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                placeholder="e.g. Bri"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(541) 555-0812"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="caregiver@example.com"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-medium mb-1">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="742 Evergreen Terrace"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">ZIP</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Relationship</label>
                <input
                  type="text"
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-[#3D6B22] hover:bg-[#2d5019] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Next: Type & Relationship</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Caregiver Type & Relationship */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-6 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">2. Caregiver Type & Relationship</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select relationship category, link to client and household, and set care boundaries
            </p>
          </div>

          {/* 3 Categories Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "Family Caregiver",
                title: "Family Caregiver",
                desc: "Parent, adult child, or relative providing state-approved family care.",
              },
              {
                id: "Live-In Caregiver",
                title: "Live-In Caregiver",
                desc: "Resides on premises with defined sleep & rest boundaries.",
              },
              {
                id: "Family Friend",
                title: "Family Friend",
                desc: "Trusted community friend or neighbor providing respite or transport.",
              },
            ].map((cat) => (
              <div
                key={cat.id}
                onClick={() => setCaregiverType(cat.id as CaregiverType)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  caregiverType === cat.id
                    ? "border-[#3D6B22] bg-[#F2F8EE] ring-1 ring-[#3D6B22]"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">{cat.title}</h4>
                  {caregiverType === cat.id && <Check className="w-4 h-4 text-[#3D6B22]" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{cat.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Relationship to Client *</label>
              <input
                type="text"
                required
                value={relationshipToClient}
                onChange={(e) => setRelationshipToClient(e.target.value)}
                placeholder="e.g. Sister, Mother, Dedicated Live-In Aide"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Link to Client / Household</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              >
                {INITIAL_CLIENTS.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.id} — {cl.name} ({cl.household.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              >
                <option value="Mountain Lane">Mountain Lane</option>
                <option value="North Metro">North Metro</option>
                <option value="Valley View">Valley View</option>
                <option value="Westside">Westside</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Classification</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              >
                <option value="W-2">W-2 Employed</option>
                <option value="1099">1099 Contractor</option>
                <option value="Family Paid Exempt">Family Paid Exempt</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Target Hours / Week</label>
              <input
                type="number"
                value={capacityHours}
                onChange={(e) => setCapacityHours(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-600 font-medium mb-1">Caregiving Boundaries</label>
            <textarea
              rows={3}
              value={caregivingBoundaries}
              onChange={(e) => setCaregivingBoundaries(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
            />
          </div>

          <div className="flex justify-between pt-3">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-[#3D6B22] hover:bg-[#2d5019] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Next: Documents & Credentials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Documents & Credentials */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-6 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">3. Documents & Credentials</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify identity documents, CPR / First Aid, TB risk test, and expiration dates
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Identity Doc */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Government Identity Verification (State ID / Passport)</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">Form I-9 compliant document</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1E5622]">
                <input
                  type="checkbox"
                  checked={idVerified}
                  onChange={(e) => setIdVerified(e.target.checked)}
                  className="rounded text-[#3D6B22] focus:ring-[#3D6B22] w-4 h-4"
                />
                <span>Verified</span>
              </label>
            </div>

            {/* CPR / First Aid */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900">CPR & First Aid BLS Certification</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">AHA or Red Cross pediatric/adult certificate</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={cprExpiry}
                  onChange={(e) => setCprExpiry(e.target.value)}
                  className="p-1.5 border border-slate-200 rounded text-xs"
                />
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1E5622]">
                  <input
                    type="checkbox"
                    checked={cprVerified}
                    onChange={(e) => setCprVerified(e.target.checked)}
                    className="rounded text-[#3D6B22] focus:ring-[#3D6B22] w-4 h-4"
                  />
                  <span>Verified</span>
                </label>
              </div>
            </div>

            {/* TB Test */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900">TB Screening / Risk Assessment</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">Annual negative symptom screen on file</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={tbExpiry}
                  onChange={(e) => setTbExpiry(e.target.value)}
                  className="p-1.5 border border-slate-200 rounded text-xs"
                />
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1E5622]">
                  <input
                    type="checkbox"
                    checked={tbTested}
                    onChange={(e) => setTbTested(e.target.checked)}
                    className="rounded text-[#3D6B22] focus:ring-[#3D6B22] w-4 h-4"
                  />
                  <span>Verified</span>
                </label>
              </div>
            </div>

            {/* I-9 & Tax Withholding */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Form I-9 & W-4 / W-9 Tax Forms</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">Payroll compliance setup</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1E5622]">
                <input
                  type="checkbox"
                  checked={i9Signed}
                  onChange={(e) => setI9Signed(e.target.checked)}
                  className="rounded text-[#3D6B22] focus:ring-[#3D6B22] w-4 h-4"
                />
                <span>Signed</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-[#3D6B22] hover:bg-[#2d5019] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Next: Screening & Training</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Screening & Training */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-6 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">4. Screening & Training</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Initiate background screening, check exclusion registries, and assign mandatory training courses
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">State & Federal Background Screening</h4>
              <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={initiateBcu}
                  onChange={(e) => setInitiateBcu(e.target.checked)}
                  className="rounded text-[#3D6B22] focus:ring-[#3D6B22] w-4 h-4"
                />
                <span>Initiate Oregon BCU Live-Scan Fingerprint Screening</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={oigSamCleared}
                  onChange={(e) => setOigSamCleared(e.target.checked)}
                  className="rounded text-[#3D6B22] focus:ring-[#3D6B22] w-4 h-4"
                />
                <span>OIG / SAM Federal Exclusion Check Cleared</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={abuseRegistryInitiated}
                  onChange={(e) => setAbuseRegistryInitiated(e.target.checked)}
                  className="rounded text-[#3D6B22] focus:ring-[#3D6B22] w-4 h-4"
                />
                <span>State Child Abuse Registry (CAN) & Sex Offender Registry Search</span>
              </label>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs">Mandatory Training Modules (8 Hours)</h4>
                <span className="text-slate-400 text-[11px]">Required prior to active care</span>
              </div>
              <div className="space-y-1.5">
                {[
                  "Mandatory Child Abuse Reporting & Safeguarding",
                  "HIPAA & Patient Privacy Fundamentals",
                  "Person-Centered Pediatric In-Home Care",
                  "EVV Mobile Clock-In & Location Protocol",
                ].map((course) => (
                  <div key={course} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                    <span>{course}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-[#3D6B22] hover:bg-[#2d5019] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Next: Review & Submit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Review & Submit */}
      {currentStep === 5 && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-6 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">5. Review & Submit Registration</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review information, assign onboarding status, and complete intake registration
            </p>
          </div>

          {/* Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Caregiver Profile Summary
              </h4>
              <p><span className="text-slate-400">Name:</span> <strong className="text-slate-800">{fullName}</strong></p>
              <p><span className="text-slate-400">Type:</span> <strong className="text-slate-800">{caregiverType}</strong></p>
              <p><span className="text-slate-400">Relationship:</span> <strong className="text-slate-800">{relationshipToClient}</strong></p>
              <p><span className="text-slate-400">Phone:</span> <strong className="text-slate-800">{phone}</strong></p>
              <p><span className="text-slate-400">Email:</span> <strong className="text-slate-800">{email}</strong></p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Onboarding & Assignments
              </h4>
              <p><span className="text-slate-400">Assigned Client:</span> <strong className="text-slate-800">{selectedClientId}</strong></p>
              <p><span className="text-slate-400">Branch:</span> <strong className="text-slate-800">{branch}</strong></p>
              <p><span className="text-slate-400">Classification:</span> <strong className="text-slate-800">{classification}</strong></p>
              <p><span className="text-slate-400">Assigned Coordinator:</span> <strong className="text-slate-800">{onboardingCoordinator}</strong></p>
              <p><span className="text-slate-400">Initial Status:</span> <strong className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded">({initialStatus})</strong></p>
            </div>
          </div>

          {/* Regulatory Warning Callout */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-amber-900">
                Important: Registration does not equal approval
              </h4>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                A caregiver should only become eligible for work after the applicable agency and regulatory requirements are satisfied (cleared state background check, verified CPR credentials, completed training modules, and authorized payer service setup).
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#3D6B22] hover:bg-[#2d5019] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Caregiver Registration</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 6: Caregiver Registration Complete (Outcomes Screen) */}
      {currentStep === 6 && createdCaregiver && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-8 space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-[#E3F1D9] text-[#1E5622] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Caregiver Registration Complete
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              The caregiver has been successfully registered in the LiliSare workforce database.
            </p>
          </div>

          <div className="inline-block px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-base font-bold text-[#3D6B22]">
            Caregiver ID: {createdCaregiver.id}
          </div>

          {/* 7 Outcomes Checklist matching prompt */}
          <div className="max-w-md mx-auto text-left p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Registration Lifecycle Actions Completed:
            </h4>
            {[
              "1. Generated unique Caregiver ID (" + createdCaregiver.id + ")",
              "2. Created caregiver profile record",
              "3. Connected relevant household and client",
              "4. Assigned onboarding coordinator (" + onboardingCoordinator + ")",
              "5. Tracking outstanding documents and screening",
              "6. Queueing approval and eligibility checks",
              "7. Ready to unlock assignments upon final regulatory approval",
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-700">
                <Check className="w-3.5 h-3.5 text-[#3D6B22] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Important Callout */}
          <div className="max-w-md mx-auto p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900">
            <strong>Important:</strong> Registration does not equal approval. A caregiver should only become eligible for work after the applicable agency and regulatory requirements are satisfied.
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href={`/caregivers/${createdCaregiver.id}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#3D6B22] text-white text-xs font-bold hover:bg-[#2d5019] transition-all shadow-sm"
            >
              View Caregiver Profile
            </Link>
            <Link
              href="/caregivers"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              Return to Caregiver Directory
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
