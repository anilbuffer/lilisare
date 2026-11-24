"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  Shield,
  Star,
  Users,
  Award,
  Clock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HeartPulse,
  Hash,
  Sparkles,
  Edit3,
  Save,
  X,
  RefreshCw,
  ShieldCheck,
  Check,
} from "lucide-react";
import { AdminCaregiverProfile } from "@/lib/caregivers/adminCaregiversData";
import { getCaregiversFromStorage, saveCaregiversToStorage } from "@/lib/caregivers/mockData";
import { CaregiverRecord } from "@/types/caregiver";
import { toast } from "sonner";

interface CaregiverProfileTabProps {
  profile: AdminCaregiverProfile;
  isEditing?: boolean;
  onToggleEdit?: (editing: boolean) => void;
  onProfileUpdated?: (updated: AdminCaregiverProfile) => void;
}

export function CaregiverProfileTab({
  profile,
  isEditing: externalIsEditing,
  onToggleEdit,
  onProfileUpdated,
}: CaregiverProfileTabProps) {
  // Local edit mode state (controlled or uncontrolled)
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;

  const setIsEditing = (val: boolean) => {
    setInternalIsEditing(val);
    onToggleEdit?.(val);
  };

  const [editingCard, setEditingCard] = useState<"all" | "personal" | "agency" | "clinical" | "emergency" | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Parse name parts
  const nameParts = (profile.name || "").trim().split(/\s+/);
  const defaultFirstName = nameParts[0] || "";
  const defaultLastName = nameParts.slice(1).join(" ") || "";

  // Parse address parts
  const addrParts = (profile.location || profile.address || "").split(",");
  const defaultStreet = addrParts[0]?.trim() || "5525 Clovercrest Dr.";
  const defaultCity = addrParts[1]?.trim() || "Brentwood";
  const stateZip = (addrParts[2] || "").trim().split(/\s+/);
  const defaultState = stateZip[0] || "TN";
  const defaultZip = stateZip[1] || "37027";

  // Form state
  const [formData, setFormData] = useState({
    firstName: defaultFirstName,
    lastName: defaultLastName,
    preferredName: profile.sortName?.split(",")[1]?.trim() || defaultFirstName,
    gender: profile.gender && profile.gender !== "—" ? profile.gender : "Female",
    dob: "1988-06-15",
    age: profile.age || 38,
    mobilePhone: profile.mobilePhone || profile.phone || "(555) 555-5555",
    homePhone: profile.homePhone || "(555) 555-5556",
    email: profile.email || "caregiver@lilisare.health",
    street: defaultStreet,
    city: defaultCity,
    state: defaultState,
    zip: defaultZip,
    status: profile.status || "Active",
    extStatus: profile.extStatus || "Active",
    role: profile.role || "Certified Nurse Aide",
    administrator: profile.administrator || "Mackenzie Bertelsman",
    branch: profile.branch || "Brentwood Hub",
    employmentType: profile.employmentType || "W2",
    hireDate: profile.hireDate || "2024-03-15",
    tenure: profile.tenure || "2 years with agency",
    payRate: profile.payRate || "$28.50/hr",
    overtimeRate: profile.overtimeRate || "$42.75/hr",
    directDepositStatus: profile.directDepositStatus || "Active",
    licenseName: profile.licenseName || "Certified Nurse Aide (CNA)",
    licenseNumber: profile.licenseNumber || "CNA-TN-2024-9821",
    licenseExpires: profile.licenseExpires || "2028-12-31",
    cprStatus: profile.cprStatus || "Valid",
    cprExpires: profile.cprExpires || "Dec 2027",
    tbTestStatus: profile.tbTestStatus || "Clear",
    tbExpires: profile.tbExpires || "Nov 2027",
    backgroundCheckStatus: profile.backgroundCheckStatus || "Cleared",
    skills: profile.skills?.join(", ") || "ADL Support, Personal Care, Vital Signs Monitoring, Medication Assistance",
    emergencyName: profile.emergencyContact?.split("(")[0]?.trim() || "James Carter",
    emergencyRel: profile.emergencyContactRelationship || "Spouse",
    emergencyPhone: profile.emergencyContactPhone || "(555) 234-9988",
    secondaryName: profile.secondaryEmergencyContact?.split("(")[0]?.trim() || "Mary Carter",
    secondaryPhone: "(555) 234-1122",
  });

  // Re-sync form state when profile changes
  useEffect(() => {
    const parts = (profile.name || "").trim().split(/\s+/);
    const fName = parts[0] || "";
    const lName = parts.slice(1).join(" ") || "";
    const aParts = (profile.location || profile.address || "").split(",");
    const sStreet = aParts[0]?.trim() || "5525 Clovercrest Dr.";
    const sCity = aParts[1]?.trim() || "Brentwood";
    const sStateZip = (aParts[2] || "").trim().split(/\s+/);

    setFormData((prev) => ({
      ...prev,
      firstName: fName,
      lastName: lName,
      preferredName: profile.sortName?.split(",")[1]?.trim() || fName,
      gender: profile.gender && profile.gender !== "—" ? profile.gender : prev.gender,
      age: profile.age || prev.age,
      mobilePhone: profile.mobilePhone || profile.phone || prev.mobilePhone,
      homePhone: profile.homePhone || prev.homePhone,
      email: profile.email || prev.email,
      street: sStreet,
      city: sCity,
      state: sStateZip[0] || prev.state,
      zip: sStateZip[1] || prev.zip,
      status: profile.status || prev.status,
      extStatus: profile.extStatus || prev.extStatus,
      role: profile.role || prev.role,
      administrator: profile.administrator || prev.administrator,
      branch: profile.branch || prev.branch,
      employmentType: profile.employmentType || prev.employmentType,
      hireDate: profile.hireDate || prev.hireDate,
      payRate: profile.payRate || prev.payRate,
      overtimeRate: profile.overtimeRate || prev.overtimeRate,
      licenseName: profile.licenseName || prev.licenseName,
      licenseNumber: profile.licenseNumber || prev.licenseNumber,
      licenseExpires: profile.licenseExpires || prev.licenseExpires,
      cprStatus: profile.cprStatus || prev.cprStatus,
      cprExpires: profile.cprExpires || prev.cprExpires,
      tbTestStatus: profile.tbTestStatus || prev.tbTestStatus,
      backgroundCheckStatus: profile.backgroundCheckStatus || prev.backgroundCheckStatus,
      skills: profile.skills?.join(", ") || prev.skills,
      emergencyName: profile.emergencyContact?.split("(")[0]?.trim() || prev.emergencyName,
      emergencyRel: profile.emergencyContactRelationship || prev.emergencyRel,
      emergencyPhone: profile.emergencyContactPhone || prev.emergencyPhone,
    }));
  }, [profile]);

  const initials = `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase() || "CG";

  const handleStartEdit = (targetCard: "all" | "personal" | "agency" | "clinical" | "emergency" = "all") => {
    setEditingCard(targetCard);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingCard(null);
  };

  const handleSaveChanges = () => {
    setIsSaving(true);

    setTimeout(() => {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const formattedAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`;
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const updatedProfile: AdminCaregiverProfile = {
        ...profile,
        name: fullName,
        sortName: `${formData.lastName}, ${formData.firstName}`,
        gender: formData.gender,
        age: formData.age,
        phone: formData.mobilePhone,
        mobilePhone: formData.mobilePhone,
        homePhone: formData.homePhone,
        email: formData.email,
        address: formattedAddress,
        location: formattedAddress,
        status: formData.status as any,
        extStatus: formData.extStatus,
        role: formData.role,
        administrator: formData.administrator,
        branch: formData.branch,
        employmentType: formData.employmentType as any,
        hireDate: formData.hireDate,
        payRate: formData.payRate,
        overtimeRate: formData.overtimeRate,
        directDepositStatus: formData.directDepositStatus as any,
        licenseName: formData.licenseName,
        licenseNumber: formData.licenseNumber,
        licenseExpires: formData.licenseExpires,
        cprStatus: formData.cprStatus as any,
        cprExpires: formData.cprExpires,
        tbTestStatus: formData.tbTestStatus as any,
        backgroundCheckStatus: formData.backgroundCheckStatus as any,
        skills: skillsArray.length > 0 ? skillsArray : profile.skills,
        emergencyContact: `${formData.emergencyName} (${formData.emergencyRel}) - ${formData.emergencyPhone}`,
        emergencyContactPhone: formData.emergencyPhone,
        emergencyContactRelationship: formData.emergencyRel,
        secondaryEmergencyContact: formData.secondaryName
          ? `${formData.secondaryName} - ${formData.secondaryPhone}`
          : profile.secondaryEmergencyContact,
      };

      // Persist in localStorage caregivers storage
      try {
        const stored = getCaregiversFromStorage();
        const index = stored.findIndex(
          (c) =>
            c.id.toLowerCase() === profile.id.toLowerCase() ||
            (c.id.replace(/\D/g, "") && c.id.replace(/\D/g, "") === profile.id.replace(/\D/g, ""))
        );

        const updatedRecord: CaregiverRecord = {
          ...(index >= 0 ? stored[index] : ({} as any)),
          id: profile.id,
          name: fullName,
          type: (formData.role.includes("Family")
            ? "Family Caregiver"
            : formData.role.includes("Live-In")
              ? "Live-In Caregiver"
              : "Family Caregiver") as any,
          status: (formData.status === "Active"
            ? "Active"
            : formData.status === "Onboarding"
              ? "Onboarding"
              : formData.status === "On Hold"
                ? "On Hold"
                : "Inactive") as any,
          branch: formData.branch,
          hireDate: formData.hireDate,
          employmentClassification: (formData.employmentType === "1099"
            ? "1099"
            : formData.employmentType === "Family Paid Exempt"
              ? "Family Paid Exempt"
              : "W-2") as any,
          verificationChecklist: {
            identity: "Verified",
            screening: "Cleared",
            cprFirstAid: formData.cprStatus === "Valid" ? "Verified" : "Missing",
            training: "Complete",
          },
          assignmentStatus: profile.activePatients > 0 ? "Assigned" : "Unassigned",
          personalInfo: {
            preferredName: formData.preferredName,
            dob: formData.dob,
            gender: formData.gender,
            languages: profile.languages || ["English"],
            phone: formData.mobilePhone,
            secondaryPhone: formData.homePhone,
            email: formData.email,
            address: {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              zip: formData.zip,
            },
            emergencyContact: {
              name: formData.emergencyName,
              relationship: formData.emergencyRel,
              phone: formData.emergencyPhone,
            },
            preferredCommunication: "Phone",
            maskedIdentifiers: {
              ssnMasked: "***-**-4491",
              driversLicenseMasked: "DL-***-219",
              taxIdMasked: "TIN-***-712",
            },
          },
          relationship: {
            caregiverType: "Family Caregiver",
            relationshipToClient: "Primary Caregiver",
            linkedHousehold: {
              id: "HH-101",
              code: "HH-101",
              name: `${formData.lastName} Household`,
              address: formattedAddress,
              phone: formData.mobilePhone,
            },
            relationshipVerificationStatus: "Verified",
            householdPermissions: ["Full Access"],
            caregivingBoundaries: "Family in-home care delivery",
          },
          documentsCredentials: {
            overallStatus: "Verified",
            cprExpiryDate: formData.cprExpires,
            tbTestExpiryDate: formData.tbExpires,
            items: [],
          },
          screeningTraining: {
            backgroundCheck: {
              status: formData.backgroundCheckStatus === "Cleared" ? "Cleared" : "In Review",
              referenceNumber: "BGC-9821",
              provider: "Sterling Healthcare",
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
            weeklyCapacityHours: 40,
            scheduledWeeklyHours: 35,
            availabilitySchedule: [],
            assignmentHistory: [],
            assignedClient: profile.assignedPatientsList?.[0]
              ? {
                id: profile.assignedPatientsList[0].id,
                name: profile.assignedPatientsList[0].name,
                householdId: "HH-101",
                householdName: "Assigned Household",
                relationship: profile.assignedPatientsList[0].relationship || "Client",
                weeklyAuthorizedHours: 25,
                scheduledWeeklyHours: 25,
                startDate: "2026-01-01",
                status: "Active",
              }
              : undefined,
          },
          evvVisitHistory: {
            overallComplianceRate: profile.complianceRate || 98,
            totalVisitsCompleted: 42,
            gpsVerificationRate: 99,
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
                title: "Caregiver Profile Updated",
                description: "Administrative changes saved via Master Caregiver Record editor.",
                actor: "Agency Administrator",
                type: "profile",
              },
            ],
          },
        };

        if (index >= 0) {
          stored[index] = updatedRecord;
        } else {
          stored.push(updatedRecord);
        }
        saveCaregiversToStorage(stored);
      } catch (err) {
        console.error("Failed to save caregiver updates:", err);
      }

      setIsSaving(false);
      setIsEditing(false);
      setEditingCard(null);
      toast.success("Caregiver profile changes successfully saved.");
      onProfileUpdated?.(updatedProfile);
    }, 450);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* =========================================================================
          TOP BANNER: VIEW DETAILS VS. EDIT PROFILE SWITCHER (Mirrors ClientProfileTab)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Master Caregiver Record
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${isEditing
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
              >
                {isEditing ? "EDIT MODE" : "VIEW DETAILS"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Synchronized demographic, employment, clinical credentials, and compensation details
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => handleStartEdit("all")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl transition-all shadow-xs shadow-[#3D6B22]/20 active:scale-95 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          2x2 GRID OF THE 4 CORE RECORD CARDS (Exact Layout matching ClientProfileTab)
         ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* -------------------------------------------------------------------
            CARD 1: PERSONAL INFORMATION & IDENTIFICATION
           ------------------------------------------------------------------- */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Personal Information & Identification</span>
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => handleStartEdit("personal")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-200/80"
                  title="Edit Personal Information"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Avatar & Verification Row */}
            <div className="flex items-start gap-4 mb-5 pb-4 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-bold text-xl flex items-center justify-center shrink-0 shadow-inner">
                {initials}
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-slate-900">
                    {formData.firstName} {formData.lastName}
                  </h4>
                  <span className="text-xs  font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    #{profile.numericId || profile.id}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {formData.status}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-[#3D6B22] text-[11px] font-semibold border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3D6B22]" />
                  <span>Verified Identity & Background Registry</span>
                </div>
              </div>
            </div>

            {/* Content: View Mode vs Edit Mode */}
            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Full Legal Name</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formData.firstName} {formData.lastName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Preferred Name</span>
                  <span className="text-sm font-semibold text-slate-800">
                    &ldquo;{formData.preferredName}&rdquo;
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Gender & Demographics</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formData.gender} • {formData.age} yrs
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Mobile Phone</span>
                  <span className="text-sm  font-bold text-slate-900">
                    {formData.mobilePhone}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Home Phone</span>
                  <span className="text-sm  text-slate-700">
                    {formData.homePhone || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Email Address</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formData.email}
                  </span>
                </div>

                <div className="flex justify-between items-start py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Residential Address</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">
                      {formData.street}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formData.city}, {formData.state} {formData.zip}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Preferred Name
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.preferredName}
                      onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Gender
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Mobile Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="tel"
                      value={formData.mobilePhone}
                      onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]  text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Home Phone
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="tel"
                      value={formData.homePhone}
                      onChange={(e) => setFormData({ ...formData, homePhone: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]  text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Residential Address
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="ZIP"
                        value={formData.zip}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------------
            CARD 2: AGENCY & EMPLOYMENT SPECIFICATION
           ------------------------------------------------------------------- */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Agency & Employment Specification</span>
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => handleStartEdit("agency")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-200/80"
                  title="Edit Employment Specification"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Content: View Mode vs Edit Mode */}
            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Employment Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {formData.status}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">State Registry Status</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {formData.extStatus}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Service Classification</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formData.role}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Supervising Administrator</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formData.administrator}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Assigned Branch Hub</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formData.branch}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Employment Type</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {formData.employmentType} Employee
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Hire Date & Tenure</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formData.hireDate} ({formData.tenure})
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Base Hourly Pay Rate</span>
                  <span className="text-sm font-bold text-[#1E5622]">
                    {formData.payRate}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Overtime Rate (1.5x)</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formData.overtimeRate}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Status
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] font-semibold text-slate-900"
                    >
                      <option value="Active">Active</option>
                      <option value="Onboarding">Onboarding</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Registry Status
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.extStatus}
                      onChange={(e) => setFormData({ ...formData, extStatus: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Classification / Role
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Administrator
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.administrator}
                      onChange={(e) => setFormData({ ...formData, administrator: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Primary Branch
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    >
                      <option value="Brentwood Hub">Brentwood Hub</option>
                      <option value="North Metro">North Metro</option>
                      <option value="Mountain Lane">Mountain Lane</option>
                      <option value="Valley View">Valley View</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Employment Type
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    >
                      <option value="W2">W-2 Employee</option>
                      <option value="1099">1099 Independent Contractor</option>
                      <option value="Family Paid Exempt">Family Paid Exempt</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Hire Date
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Base Pay Rate
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.payRate}
                      onChange={(e) => setFormData({ ...formData, payRate: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Overtime Rate
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.overtimeRate}
                      onChange={(e) => setFormData({ ...formData, overtimeRate: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] font-semibold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------------
            CARD 3: SKILLS & CLINICAL COMPETENCIES
           ------------------------------------------------------------------- */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Skills & Clinical Competencies</span>
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => handleStartEdit("clinical")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-200/80"
                  title="Edit Clinical Information"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Content: View Mode vs Edit Mode */}
            {!isEditing ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Verified Competencies & Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills?.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 divide-y divide-slate-100">
                  <div className="flex justify-between items-start py-1.5">
                    <span className="text-[13px] font-medium text-slate-500">Primary License</span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{formData.licenseName}</p>
                      <p className="text-xs  text-slate-500">
                        #{formData.licenseNumber} • Exp: {formData.licenseExpires}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-[13px] font-medium text-slate-500">CPR / Basic Life Support</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      {formData.cprStatus} (Due: {formData.cprExpires})
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-[13px] font-medium text-slate-500">TB Screening (2-Step)</span>
                    <span className="text-sm font-bold text-emerald-700">
                      {formData.tbTestStatus} (Annual Due: {formData.tbExpires})
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-[13px] font-medium text-slate-500">Background Investigation</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {formData.backgroundCheckStatus} (Sterling Registry)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Primary License
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.licenseName}
                      onChange={(e) => setFormData({ ...formData, licenseName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    License Number
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]  text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    License Expiry
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.licenseExpires}
                      onChange={(e) => setFormData({ ...formData, licenseExpires: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    CPR Status
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={formData.cprStatus}
                      onChange={(e) => setFormData({ ...formData, cprStatus: e.target.value as any })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    >
                      <option value="Valid">Valid</option>
                      <option value="Expiring Soon">Expiring Soon</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    TB Test Status
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={formData.tbTestStatus}
                      onChange={(e) => setFormData({ ...formData, tbTestStatus: e.target.value as any })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    >
                      <option value="Clear">Clear (Negative)</option>
                      <option value="Needs Renewal">Needs Renewal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700 pt-2">
                    Skills (Comma separated)
                  </label>
                  <div className="sm:col-span-8">
                    <textarea
                      rows={3}
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------------
            CARD 4: EMERGENCY CONTACTS & HOUSEHOLD ASSIGNMENTS
           ------------------------------------------------------------------- */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Emergency Contacts & Household Linkage</span>
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => handleStartEdit("emergency")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-200/80"
                  title="Edit Emergency Information"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Content: View Mode vs Edit Mode */}
            {!isEditing ? (
              <div className="space-y-4 text-xs">
                {/* Emergency Contact Quick Card */}
                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-1">
                    <HeartPulse className="w-4 h-4" />
                    <span>Primary Emergency Contact</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    {formData.emergencyName} ({formData.emergencyRel})
                  </p>
                  <p className="text-xs  text-slate-700 mt-0.5">
                    {formData.emergencyPhone}
                  </p>
                  {formData.secondaryName && (
                    <div className="mt-2 pt-2 border-t border-rose-100/80 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">Secondary: </span>
                      {formData.secondaryName} - {formData.secondaryPhone}
                    </div>
                  )}
                </div>

                {/* Assigned Clients Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Assigned Clients & Schedules
                    </span>
                    <span className="text-[11px] font-bold text-[#1E5622]">
                      {profile.assignedPatientsList?.length || 0} Connected
                    </span>
                  </div>
                  <div className="space-y-2">
                    {profile.assignedPatientsList && profile.assignedPatientsList.length > 0 ? (
                      profile.assignedPatientsList.map((client) => (
                        <Link
                          key={client.id}
                          href={`/admin/clients/${client.id}`}
                          className="block p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 group-hover:text-[#1E5622] text-xs">
                              {client.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                              {client.schedule}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 truncate">
                            {client.address}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No clients currently linked.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Primary Contact Name
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.emergencyName}
                      onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Relationship
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.emergencyRel}
                      onChange={(e) => setFormData({ ...formData, emergencyRel: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Emergency Phone
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]  text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Secondary Contact (Optional)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Secondary Contact Name"
                      value={formData.secondaryName}
                      onChange={(e) => setFormData({ ...formData, secondaryName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                    />
                    <input
                      type="tel"
                      placeholder="Secondary Phone"
                      value={formData.secondaryPhone}
                      onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]  text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
