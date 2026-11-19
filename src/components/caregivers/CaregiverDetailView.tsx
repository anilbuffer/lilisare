"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  User,
  Heart,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Eye,
  EyeOff,
  Download,
  Lock,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Award,
  BadgeCheck,
  Building,
  Upload,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { CaregiverRecord } from "@/types/caregiver";
import { getCaregiversFromStorage, INITIAL_CAREGIVERS } from "@/lib/caregivers/mockData";
import { toast } from "sonner";

interface CaregiverDetailViewProps {
  caregiverId: string;
}

export function CaregiverDetailView({ caregiverId }: CaregiverDetailViewProps) {
  const router = useRouter();
  const [caregiver, setCaregiver] = useState<CaregiverRecord | null>(null);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [showMaskedSsn, setShowMaskedSsn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const all = getCaregiversFromStorage();
    let found = all.find((c) => c.id.toLowerCase() === caregiverId.toLowerCase());
    if (!found) {
      // Fallback matching
      found = INITIAL_CAREGIVERS.find((c) => c.id.toLowerCase() === caregiverId.toLowerCase()) || INITIAL_CAREGIVERS[0];
    }
    setCaregiver(found);
  }, [caregiverId]);

  if (!isMounted || !caregiver) {
    return (
      <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">Loading Caregiver Profile...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20";
      case "Onboarding":
        return "bg-[#FEF3C7] text-[#9A5B00] border-[#9A5B00]/20";
      case "Pending":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "On Hold":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const tabs = [
    { id: 1, number: "01", label: "Personal Information" },
    { id: 2, number: "02", label: "Caregiver Relationship" },
    { id: 3, number: "03", label: "Documents & Credentials" },
    { id: 4, number: "04", label: "Screening & Training" },
    { id: 5, number: "05", label: "Availability & Assignments" },
    { id: 6, number: "06", label: "EVV & Visit History" },
    { id: 7, number: "07", label: "Activity & History" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb & Return Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/caregivers"
            className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-[#3D6B22] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Caregivers Directory</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-mono font-bold text-slate-800">{caregiver.id}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 font-medium">Caregiver Profile</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => toast.success("Caregiver verification dossier exported as encrypted PDF")}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Dossier</span>
          </button>
          <Link
            href={`/caregivers/${caregiver.id}/edit`}
            className="px-4 py-2 rounded-xl bg-[#3D6B22] hover:bg-[#2d5019] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Main Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Key Metadata */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border-2 border-slate-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
              {caregiver.avatarUrl ? (
                <img
                  src={caregiver.avatarUrl}
                  alt={caregiver.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div>
              <div className="flex items-center flex-wrap gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {caregiver.name}
                </h1>
                <span
                  className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-full border tracking-wide ${getStatusBadge(
                    caregiver.status
                  )}`}
                >
                  ({caregiver.status})
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {caregiver.employmentClassification}
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-2 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#3D6B22]">{caregiver.id}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span>{caregiver.type}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{caregiver.branch} Branch</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hired {caregiver.hireDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Household & Client Summary Chip */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 max-w-sm shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Connected Household & Client
            </span>
            <div className="flex items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-slate-800">
                  {caregiver.relationship.linkedHousehold.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {caregiver.availabilityAssignments.assignedClient
                    ? `Assigned: ${caregiver.availabilityAssignments.assignedClient.name} (${caregiver.availabilityAssignments.assignedClient.id})`
                    : "No client assigned"}
                </p>
              </div>
              <Link
                href={`/households`}
                className="text-[11px] font-bold text-[#3D6B22] hover:underline flex items-center gap-0.5 shrink-0"
              >
                <span>View</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* 7 Tabs Navigation matching exact user specifications */}
        <div className="mt-6 pt-2 border-t border-slate-100 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "border-[#3D6B22] text-[#3D6B22] bg-[#F2F8EE]/30"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <span className={`text-[10px] font-bold ${isActive ? "text-[#3D6B22]" : "text-slate-400"}`}>
                  {tab.number}.
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 01: Personal Information */}
      {activeTab === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">01. Personal Information</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Caregiver identity, direct contact, residence address, and masked HIPAA identifiers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              {/* Basic Personal Details */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Basic Personal Details
                </h4>
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Legal Name</span>
                  <span className="font-semibold text-slate-800 text-sm">{caregiver.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Preferred Name</span>
                  <span className="font-semibold text-slate-800">
                    {caregiver.personalInfo.preferredName || "None"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Date of Birth / Gender</span>
                  <span className="font-semibold text-slate-800">
                    {caregiver.personalInfo.dob} ({caregiver.personalInfo.gender})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Languages Spoken</span>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {caregiver.personalInfo.languages.map((lang, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 font-medium text-slate-700"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information & Preferred Comm */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Contact & Communication
                </h4>
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Phone</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-[#3D6B22]" />
                    {caregiver.personalInfo.phone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-[#3D6B22]" />
                    {caregiver.personalInfo.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Preferred Communication</span>
                  <span className="inline-block px-2 py-0.5 rounded bg-[#E3F1D9] text-[#1E5622] font-semibold text-[11px] mt-0.5">
                    {caregiver.personalInfo.preferredCommunication}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {caregiver.personalInfo.emergencyContact.name} (
                    {caregiver.personalInfo.emergencyContact.relationship})
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {caregiver.personalInfo.emergencyContact.phone}
                  </span>
                </div>
              </div>

              {/* Address & Masked Identifiers */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Address & Protected Identifiers
                </h4>
                <div>
                  <span className="text-slate-400 block text-[11px]">Residential Address</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {caregiver.personalInfo.address.street}
                    <br />
                    {caregiver.personalInfo.address.city}, {caregiver.personalInfo.address.state}{" "}
                    {caregiver.personalInfo.address.zip}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Social Security No. (SSN)</span>
                    <button
                      type="button"
                      onClick={() => setShowMaskedSsn(!showMaskedSsn)}
                      className="text-[#3D6B22] hover:text-[#2d5019] flex items-center gap-1 cursor-pointer"
                    >
                      {showMaskedSsn ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span className="text-[10px] font-bold">{showMaskedSsn ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <p className="font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-200">
                    {showMaskedSsn ? "124-88-4819" : caregiver.personalInfo.maskedIdentifiers.ssnMasked}
                  </p>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Driver's License (State ID)</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {caregiver.personalInfo.maskedIdentifiers.driversLicenseMasked}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Tax Withholding TIN</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {caregiver.personalInfo.maskedIdentifiers.taxIdMasked}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 02: Caregiver Relationship */}
      {activeTab === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">02. Caregiver Relationship</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Caregiving relationship classification, client kinship, linked household, and relationship verification status
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Relationship & Care Category
                </h4>
                <div>
                  <span className="text-slate-400 block text-[11px]">Caregiver Classification</span>
                  <span className="inline-block mt-1 px-2.5 py-1 rounded-full bg-[#E3F1D9] text-[#1E5622] font-bold text-xs">
                    {caregiver.relationship.caregiverType}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Kinship / Relationship to Client</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                    {caregiver.relationship.relationshipToClient}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Relationship Verification</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#E3F1D9] text-[#1E5622] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      {caregiver.relationship.relationshipVerificationStatus}
                    </span>
                    {caregiver.relationship.relationshipVerifiedDate && (
                      <span className="text-slate-400 text-[11px]">
                        Verified on {caregiver.relationship.relationshipVerifiedDate}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Caregiving Boundaries & Protocol</span>
                  <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 mt-1 leading-relaxed">
                    {caregiver.relationship.caregivingBoundaries}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Linked Household Details
                </h4>
                <div>
                  <span className="text-slate-400 block text-[11px]">Household Code & Name</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {caregiver.relationship.linkedHousehold.code} — {caregiver.relationship.linkedHousehold.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Household Residence</span>
                  <p className="text-slate-700 font-medium">
                    {caregiver.relationship.linkedHousehold.address}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Household Permissions Granted</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {caregiver.relationship.householdPermissions.map((perm, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium text-[11px]"
                      >
                        ✓ {perm}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <Link
                    href={`/households`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline"
                  >
                    <span>View Connected Household Workspace</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 03: Documents & Credentials */}
      {activeTab === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">03. Documents & Credentials</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identity documents, CPR/First Aid, TB test, and expiring credential countdowns
                </p>
              </div>
              <button
                type="button"
                onClick={() => toast.success("Upload document modal triggered")}
                className="px-3 py-1.5 rounded-xl bg-[#3D6B22] text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Credential</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Credential Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Issuer</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {caregiver.documentsCredentials.items.map((cred) => (
                    <tr key={cred.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {cred.name}
                        {cred.verificationNotes && (
                          <span className="block text-[10px] text-rose-600 font-normal mt-0.5">
                            {cred.verificationNotes}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{cred.category}</td>
                      <td className="py-3 px-4 text-slate-600">{cred.issuer}</td>
                      <td className="py-3 px-4 text-slate-600">{cred.issueDate}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {cred.expiryDate || "Does Not Expire"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
                            cred.status === "Verified"
                              ? "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20"
                              : cred.status === "Expired"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {cred.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => toast.success(`Viewing document for ${cred.name}`)}
                          className="text-[#3D6B22] font-semibold hover:underline"
                        >
                          View File
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 04: Screening & Training */}
      {activeTab === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">04. Screening & Training</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Criminal background checks, federal OIG/SAM screenings, required training modules, and supervisory sign-offs
              </p>
            </div>

            {/* Background Screening Card */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  State & Federal Background Screening
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E3F1D9] text-[#1E5622] font-bold text-xs">
                  Status: {caregiver.screeningTraining.backgroundCheck.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">BCU Reference #</span>
                  <span className="font-mono font-bold text-slate-800">
                    {caregiver.screeningTraining.backgroundCheck.referenceNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Provider</span>
                  <span className="font-semibold text-slate-800">
                    {caregiver.screeningTraining.backgroundCheck.provider}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Renewal Date</span>
                  <span className="font-semibold text-slate-800">
                    {caregiver.screeningTraining.backgroundCheck.renewalDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Required Screenings Checklist */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Exclusion & Registry Checks
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {caregiver.screeningTraining.screenings.map((screen, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{screen.name}</p>
                      <p className="text-[10px] text-slate-400">Checked {screen.lastCheckedDate}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E3F1D9] text-[#1E5622]">
                      ✓ {screen.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Courses */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Required Training Courses ({caregiver.screeningTraining.trainingHoursCompleted} of {caregiver.screeningTraining.trainingHoursRequired} hrs complete)
                </h4>
                <span className="font-bold text-[#3D6B22]">
                  {caregiver.screeningTraining.overallTrainingStatus}
                </span>
              </div>

              <div className="space-y-2">
                {caregiver.screeningTraining.trainingCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900">{course.title}</h5>
                      <p className="text-[11px] text-slate-500">
                        {course.category} · {course.hours} hours
                        {course.score && ` · Score: ${course.score}%`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          course.status === "Complete"
                            ? "bg-[#E3F1D9] text-[#1E5622]"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 05: Availability & Assignments */}
      {activeTab === 5 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">05. Availability & Assignments</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Weekly shift availability, authorized patient assignments, capacity caps, and backup relief coverage
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Client Assignment */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Assigned Client Workload
                </h4>
                {caregiver.availabilityAssignments.assignedClient ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                        {caregiver.availabilityAssignments.assignedClient.avatarUrl ? (
                          <img
                            src={caregiver.availabilityAssignments.assignedClient.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/clients/${caregiver.availabilityAssignments.assignedClient.id}`}
                          className="font-bold text-slate-900 hover:text-[#3D6B22] flex items-center gap-1"
                        >
                          <span>{caregiver.availabilityAssignments.assignedClient.name}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {caregiver.availabilityAssignments.assignedClient.id} · {caregiver.availabilityAssignments.assignedClient.relationship}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-white rounded border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Weekly Authorized</span>
                        <span className="font-bold text-slate-800 text-sm">
                          {caregiver.availabilityAssignments.assignedClient.weeklyAuthorizedHours} hrs
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Scheduled Hours</span>
                        <span className="font-bold text-slate-800 text-sm">
                          {caregiver.availabilityAssignments.assignedClient.scheduledWeeklyHours} hrs
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic py-2">No active clients assigned.</p>
                )}

                {/* Backup Caregiver info */}
                {caregiver.availabilityAssignments.backupCaregiver && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Approved Backup Caregiver</span>
                    <span className="font-bold text-slate-800 block mt-0.5">
                      {caregiver.availabilityAssignments.backupCaregiver.name} (
                      {caregiver.availabilityAssignments.backupCaregiver.relationship})
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {caregiver.availabilityAssignments.backupCaregiver.phone}
                    </span>
                  </div>
                )}
              </div>

              {/* Weekly Availability Schedule */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Recurring Weekly Availability
                </h4>
                <div className="space-y-1.5">
                  {caregiver.availabilityAssignments.availabilitySchedule.map((day, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200"
                    >
                      <span className="font-semibold text-slate-800">{day.day}</span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          day.available ? "text-[#1E5622] bg-[#E3F1D9]" : "text-slate-400 bg-slate-100"
                        }`}
                      >
                        {day.timeSlots}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 06: EVV & Visit History */}
      {activeTab === 6 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Access Consideration Banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-amber-900">
                Authorized Operational Access Control (HIPAA & Sandata EVV)
              </h4>
              <p className="text-amber-800 mt-0.5">
                Electronic Visit Verification records, GPS geo-fence telemetry, and audit timestamps are restricted to authorized Agency Admins, HR Officers, and Clinical Supervisors. Caregivers cannot view cross-household records.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">06. EVV & Visit History</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Clock-in / clock-out records, Sandata geo-fence match verification, and exception management
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">EVV Compliance Rate</span>
                <span className="text-xl font-bold text-[#3D6B22]">
                  {caregiver.evvVisitHistory.overallComplianceRate}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Total Visits Completed</span>
                <span className="text-xl font-bold text-slate-900">
                  {caregiver.evvVisitHistory.totalVisitsCompleted}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">GPS Match Accuracy</span>
                <span className="text-xl font-bold text-slate-900">
                  {caregiver.evvVisitHistory.gpsVerificationRate}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Missed Clock-Out Exceptions</span>
                <span className="text-xl font-bold text-slate-900">
                  {caregiver.evvVisitHistory.missedClockOutCount}
                </span>
              </div>
            </div>

            {/* Visit History Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Visit Date</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Clock-In</th>
                    <th className="py-3 px-4">Clock-Out</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">GPS Verification</th>
                    <th className="py-3 px-4">Care Notes</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {caregiver.evvVisitHistory.recentVisits.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        No EVV shifts logged yet for this caregiver.
                      </td>
                    </tr>
                  ) : (
                    caregiver.evvVisitHistory.recentVisits.map((vst) => (
                      <tr key={vst.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-800">{vst.date}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{vst.clientName}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{vst.clockIn}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{vst.clockOut}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {Math.floor(vst.durationMinutes / 60)}h {vst.durationMinutes % 60}m
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E5622] bg-[#E3F1D9] px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            {vst.gpsStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] text-slate-700">
                            {vst.hasCareNotes ? "Submitted & Reviewed" : "Pending"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-[11px] font-bold text-emerald-700">
                            Approved
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 07: Activity & History */}
      {activeTab === 7 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">07. Activity & History</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Administrative audit trail, profile changes, credential uploads, and eligibility approvals
              </p>
            </div>

            <div className="space-y-3">
              {caregiver.activityHistory.recentUpdates.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No audit trail records found.</p>
              ) : (
                caregiver.activityHistory.recentUpdates.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{act.title}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded bg-slate-200 text-slate-700">
                          {act.type}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{act.description}</p>
                      <p className="text-[11px] text-slate-400 mt-1">Logged by: {act.actor}</p>
                    </div>
                    <span className="text-slate-400 text-[11px] shrink-0">{act.relativeTime}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
