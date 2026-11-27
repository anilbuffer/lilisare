"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Shield,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Info,
  ExternalLink,
  Plus,
  Save,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Building2,
  Clock,
  Sparkles,
  Edit3,
  X,
  Lock,
  Copy,
  Phone,
  Home,
  CalendarPlus,
} from "lucide-react";
import { ClientRecord } from "@/types/client";
import { PortalRole } from "../AdminClientDetailView";
import { toast } from "sonner";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientProfileTabProps {
  client: ClientRecord;
  onUpdateClient: (updated: ClientRecord) => void;
  userRole?: PortalRole;
  onOpenContactFamily?: () => void;
  onOpenScheduleVisit?: () => void;
}

export function ClientProfileTab({
  client,
  onUpdateClient,
  userRole = "admin",
  onOpenContactFamily,
  onOpenScheduleVisit,
}: ClientProfileTabProps) {
  // Toggle between View Details (default) and Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editingCard, setEditingCard] = useState<"all" | "personal" | "agency" | "residential" | "billing" | null>(null);

  // Dynamic names & dob parsing from client record
  const nameParts = (client.name || "Leo Miller").split(" ");
  const defaultFirstName = client.firstName || nameParts[0] || "Leo";
  const defaultLastName = client.lastName || nameParts.slice(1).join(" ") || "Miller";
  const defaultGoesBy = client.preferredName || defaultFirstName;
  const parsedDob = client.dob ? new Date(client.dob) : new Date("2018-05-14");
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const defaultDobMonth = !isNaN(parsedDob.getTime()) ? monthNames[parsedDob.getMonth()] : "May";
  const defaultDobDay = !isNaN(parsedDob.getTime()) ? String(parsedDob.getDate()) : "14";
  const defaultDobYear = !isNaN(parsedDob.getTime()) ? String(parsedDob.getFullYear()) : "2018";

  // Form State initialized from live client record
  const [formData, setFormData] = useState({
    title: client.title || (client.gender === "Female" ? "Ms." : "Mr."),
    firstName: defaultFirstName,
    lastName: defaultLastName,
    goesBy: defaultGoesBy,
    gender: client.gender || "Male",
    dobMonth: defaultDobMonth,
    dobDay: defaultDobDay,
    dobYear: defaultDobYear,
    age: client.age || 8,
    ssn: client.ssn || `***-**-${(client.id.replace(/\D/g, "") || "1001").padStart(4, "0")}`,
    // Agency Info
    status: client.agencyInfo?.status || client.status || "Active",
    leadCreatedDate: client.agencyInfo?.leadCreatedDate || "03/15/22",
    initialAssessmentDate: client.agencyInfo?.initialAssessmentDate || "04/02/22",
    conversionDate: client.agencyInfo?.conversionDate || "04/10/22",
    startDate: client.agencyInfo?.startDate || "04/15/22",
    effectiveEndDate: client.agencyInfo?.effectiveEndDate || "12/31/2026",
    administrator: client.agencyInfo?.administrator || client.assignedCareTeam?.onboardingCoordinator?.name || "Dana Jenkins, MSW",
    regionCode: client.agencyInfo?.regionCode || "Primary District",
    referredBy: client.agencyInfo?.referredBy || (client.assignedCareTeam?.caseManager?.name ? `${client.assignedCareTeam.caseManager.name} (${client.assignedCareTeam.caseManager.agency})` : "State Health Services"),
    medicaidNumber: client.agencyInfo?.medicaidNumber || client.authorization?.authNumber?.replace("AUTH-", "MED-") || "MED-2026-9812",
    preferredCaregiver: client.agencyInfo?.preferredCaregiver || client.assignedCareTeam?.primaryCaregiver?.name || "Sarah Miller",
    disableClockInAlert: client.agencyInfo?.adminAlerts?.disableClockInAlert || false,
    disableClockOutAlert: client.agencyInfo?.adminAlerts?.disableClockOutAlert || false,
    invoicingId: client.agencyInfo?.invoicingId || `INV-${client.id}`,
    // Residential Address
    resName: client.residentialAddress?.name || client.name,
    resAddress: client.residentialAddress?.address || client.household?.address || "742 Evergreen Terrace",
    resAddress2: client.residentialAddress?.address2 || "",
    resCity: client.residentialAddress?.city || client.household?.city || "Springfield",
    resState: client.residentialAddress?.state || client.household?.state || "OR",
    resZip: client.residentialAddress?.zip || client.household?.zip || "97477",
    isAddressVerified: client.residentialAddress?.verified ?? true,
    // Billing Address
    sameAsResidential: client.billingAddress?.sameAsResidential ?? true,
    billName: client.billingAddress?.name || client.name,
    billAddress: client.billingAddress?.address || client.household?.address || "742 Evergreen Terrace",
    billAddress2: client.billingAddress?.address2 || "",
    billCity: client.billingAddress?.city || client.household?.city || "Springfield",
    billState: client.billingAddress?.state || client.household?.state || "OR",
    billZip: client.billingAddress?.zip || client.household?.zip || "97477",
  });

  const [showSSN, setShowSSN] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [addressVerifying, setAddressVerifying] = useState(false);

  // Agency admin has full edit authority; other roles are view-only
  const canEdit = userRole === "admin" || userRole === "intake";

  const handleToggleSameAddress = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sameAsResidential: checked,
      billName: checked ? prev.resName : prev.billName,
      billAddress: checked ? prev.resAddress : prev.billAddress,
      billAddress2: checked ? prev.resAddress2 : prev.billAddress2,
      billCity: checked ? prev.resCity : prev.billCity,
      billState: checked ? prev.resState : prev.billState,
      billZip: checked ? prev.resZip : prev.billZip,
    }));
  };

  const handleVerifyAddress = () => {
    setAddressVerifying(true);
    setTimeout(() => {
      setAddressVerifying(false);
      setFormData((prev) => ({ ...prev, isAddressVerified: true }));
      toast.success("USPS Address Verified: Standardized format & carrier route valid.");
    }, 500);
  };

  const handleSetEffectiveEndDate = () => {
    const today = new Date();
    const formatted = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${String(today.getFullYear()).slice(-2)}`;
    setFormData((prev) => ({ ...prev, effectiveEndDate: formatted }));
    toast.info(`Effective end date set to today: ${formatted}`);
  };

  const handleStartEdit = (targetCard: "all" | "personal" | "agency" | "residential" | "billing" = "all") => {
    if (!canEdit) {
      toast.error("Profile modifications are restricted to Agency Administrator & Intake.");
      return;
    }
    setEditingCard(targetCard);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Revert form state back to live client record
    setFormData({
      title: client.title || (client.gender === "Female" ? "Ms." : "Mr."),
      firstName: defaultFirstName,
      lastName: defaultLastName,
      goesBy: defaultGoesBy,
      gender: client.gender || "Male",
      dobMonth: defaultDobMonth,
      dobDay: defaultDobDay,
      dobYear: defaultDobYear,
      age: client.age || 8,
      ssn: client.ssn || `***-**-${(client.id.replace(/\D/g, "") || "1001").padStart(4, "0")}`,
      status: client.agencyInfo?.status || client.status || "Active",
      leadCreatedDate: client.agencyInfo?.leadCreatedDate || "03/15/22",
      initialAssessmentDate: client.agencyInfo?.initialAssessmentDate || "04/02/22",
      conversionDate: client.agencyInfo?.conversionDate || "04/10/22",
      startDate: client.agencyInfo?.startDate || "04/15/22",
      effectiveEndDate: client.agencyInfo?.effectiveEndDate || "12/31/2026",
      administrator: client.agencyInfo?.administrator || client.assignedCareTeam?.onboardingCoordinator?.name || "Dana Jenkins, MSW",
      regionCode: client.agencyInfo?.regionCode || "Primary District",
      referredBy: client.agencyInfo?.referredBy || (client.assignedCareTeam?.caseManager?.name ? `${client.assignedCareTeam.caseManager.name} (${client.assignedCareTeam.caseManager.agency})` : "State Health Services"),
      medicaidNumber: client.agencyInfo?.medicaidNumber || client.authorization?.authNumber?.replace("AUTH-", "MED-") || "MED-2026-9812",
      preferredCaregiver: client.agencyInfo?.preferredCaregiver || client.assignedCareTeam?.primaryCaregiver?.name || "Sarah Miller",
      disableClockInAlert: client.agencyInfo?.adminAlerts?.disableClockInAlert || false,
      disableClockOutAlert: client.agencyInfo?.adminAlerts?.disableClockOutAlert || false,
      invoicingId: client.agencyInfo?.invoicingId || `INV-${client.id}`,
      resName: client.residentialAddress?.name || client.name,
      resAddress: client.residentialAddress?.address || client.household?.address || "742 Evergreen Terrace",
      resAddress2: client.residentialAddress?.address2 || "",
      resCity: client.residentialAddress?.city || client.household?.city || "Springfield",
      resState: client.residentialAddress?.state || client.household?.state || "OR",
      resZip: client.residentialAddress?.zip || client.household?.zip || "97477",
      isAddressVerified: client.residentialAddress?.verified ?? true,
      sameAsResidential: client.billingAddress?.sameAsResidential ?? true,
      billName: client.billingAddress?.name || client.name,
      billAddress: client.billingAddress?.address || client.household?.address || "742 Evergreen Terrace",
      billAddress2: client.billingAddress?.address2 || "",
      billCity: client.billingAddress?.city || client.household?.city || "Springfield",
      billState: client.billingAddress?.state || client.household?.state || "OR",
      billZip: client.billingAddress?.zip || client.household?.zip || "97477",
    });
    setIsEditing(false);
    setEditingCard(null);
    toast.info("Profile changes discarded.");
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    const updatedRecord: ClientRecord = {
      ...client,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      title: formData.title,
      firstName: formData.firstName,
      lastName: formData.lastName,
      preferredName: formData.goesBy,
      gender: formData.gender,
      dob: `${formData.dobYear}-08-06`,
      age: Number(formData.age) || client.age,
      ssn: formData.ssn,
      agencyInfo: {
        status: formData.status,
        leadCreatedDate: formData.leadCreatedDate,
        initialAssessmentDate: formData.initialAssessmentDate,
        conversionDate: formData.conversionDate,
        startDate: formData.startDate,
        effectiveEndDate: formData.effectiveEndDate,
        administrator: formData.administrator,
        regionCode: formData.regionCode,
        referredBy: formData.referredBy,
        medicaidNumber: formData.medicaidNumber,
        preferredCaregiver: formData.preferredCaregiver,
        adminAlerts: {
          disableClockInAlert: formData.disableClockInAlert,
          disableClockOutAlert: formData.disableClockOutAlert,
        },
        invoicingId: formData.invoicingId,
      },
      residentialAddress: {
        name: formData.resName,
        address: formData.resAddress,
        address2: formData.resAddress2,
        city: formData.resCity,
        state: formData.resState,
        zip: formData.resZip,
        verified: formData.isAddressVerified,
      },
      billingAddress: {
        sameAsResidential: formData.sameAsResidential,
        name: formData.billName,
        address: formData.billAddress,
        address2: formData.billAddress2,
        city: formData.billCity,
        state: formData.billState,
        zip: formData.billZip,
      },
      updatedAtRelative: "Just now",
      activity: [
        {
          id: `act-${Date.now()}`,
          timestamp: "Just now",
          type: "note",
          author: "Agency Admin",
          authorRole: "Operational Administrator",
          title: "Profile Demographics Updated",
          details: "Master client demographics and addresses were updated.",
        },
        ...client.activity,
      ],
    };

    setTimeout(() => {
      onUpdateClient(updatedRecord);
      const all = getClientsFromStorage();
      const idx = all.findIndex((c) => c.id === client.id);
      if (idx !== -1) {
        all[idx] = updatedRecord;
        saveClientsToStorage(all);
      }
      setIsSaving(false);
      setIsEditing(false);
      setEditingCard(null);
      toast.success("Client profile changes successfully saved.");
    }, 400);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* =========================================================================
          TOP BANNER: VIEW DETAILS VS. EDIT PROFILE SWITCHER
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Master Client Record
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {isEditing ? "EDIT MODE" : "VIEW DETAILS"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Synchronized demographic, administrative, residential, and billing details
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => handleStartEdit("all")}
              disabled={!canEdit}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer ${canEdit
                  ? "text-white bg-[#3D6B22] hover:bg-[#345C1D] shadow-[#3D6B22]/20 active:scale-95"
                  : "text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
                }`}
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
          2x2 GRID OF THE 4 CARDS (Exact Layout matching User Screenshot)
         ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* -------------------------------------------------------------------
            CARD 1: PERSONAL INFORMATION
           ------------------------------------------------------------------- */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Personal Information</span>
              </h3>
              <div className="flex items-center gap-2">
                {/* Contact Family Action (Moved from Hero) */}
                <button
                  type="button"
                  onClick={() => onOpenContactFamily ? onOpenContactFamily() : toast.info("Opening Contact Family dialog...")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
                  title="Contact Client Family"
                >
                  <Phone className="w-3.5 h-3.5 text-[#3D6B22]" />
                  <span>Contact Family</span>
                </button>

                {!isEditing && canEdit && (
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
            </div>

            {/* Photo Avatar Row */}
            <div className="flex items-start gap-4 mb-5 pb-4 border-b border-slate-100">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xs bg-slate-100 shrink-0">
                <Image
                  src={client.avatarUrl || "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&q=80&w=200"}
                  alt={formData.firstName}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-1 right-1">
                  <span className="border-2 border-white shadow-xs font-bold text-white whitespace-nowrap px-2 py-0.5 text-[10px] rounded-full tracking-wide bg-[#3D6B22]">
                    {client.status}
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-xs text-slate-500 font-medium leading-relaxed">
                  Verified government photo identification on record for care verification and emergency transport.
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#3D6B22] text-[11px] font-semibold border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3D6B22]" />
                  <span>Verified by Clinical Care Team</span>
                </div>
              </div>
            </div>

            {/* Content: View Mode vs Edit Mode */}
            {!isEditing ? (
              /* VIEW DETAILS: High-contrast typography, clean key-values, no input borders */
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Title</span>
                  <span className="text-sm font-semibold text-slate-900">{formData.title || "Mr."}</span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Full Name</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formData.firstName} {formData.lastName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Goes By (Preferred)</span>
                  <span className="text-sm font-semibold text-slate-800">
                    &ldquo;{formData.goesBy}&rdquo;
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Gender</span>
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                    <span>{formData.gender}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Date of Birth & Age</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formData.dobMonth} {formData.dobDay}, {formData.dobYear}
                    <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      Age {formData.age}
                    </span>
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Social Security Number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm  font-bold text-slate-900 tracking-wider">
                      {showSSN ? formData.ssn : `***-**-${formData.ssn.slice(-4)}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSSN(!showSSN)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={showSSN ? "Hide SSN" : "Reveal SSN"}
                    >
                      {showSSN ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <div className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                      <Shield className="w-3 h-3 text-[#3D6B22]" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* EDIT MODE: Globally standardized form inputs */
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Title
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                      placeholder="Mr. / Mrs. / Ms."
                    />
                  </div>
                </div>

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
                    Goes By
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.goesBy}
                      onChange={(e) => setFormData({ ...formData, goesBy: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800"
                      placeholder="Preferred name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Gender
                  </label>
                  <div className="sm:col-span-8 flex items-center gap-4">
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={formData.gender === "Female"}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="text-[#3D6B22] focus:ring-[#3D6B22]"
                      />
                      <span>Female</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === "Male"}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="text-[#3D6B22] focus:ring-[#3D6B22]"
                      />
                      <span>Male</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Date of Birth
                  </label>
                  <div className="sm:col-span-8 flex items-center gap-2">
                    <select
                      value={formData.dobMonth}
                      onChange={(e) => setFormData({ ...formData, dobMonth: e.target.value })}
                      className="px-2.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                    >
                      {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={formData.dobDay}
                      onChange={(e) => setFormData({ ...formData, dobDay: e.target.value })}
                      className="w-12 px-2 py-2 text-center bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                    />

                    <input
                      type="text"
                      value={formData.dobYear}
                      onChange={(e) => setFormData({ ...formData, dobYear: e.target.value })}
                      className="w-16 px-2 py-2 text-center bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                    />

                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap pl-1">
                      Age {formData.age}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Social Security Number
                  </label>
                  <div className="sm:col-span-8 flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.ssn}
                      onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm  text-slate-800 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------------
            CARD 2: AGENCY CARE INFORMATION
           ------------------------------------------------------------------- */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Agency Care Information</span>
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Household Hub Link (Moved from Hero) */}
                {client.household?.code && (
                  <Link
                    href={
                      userRole === "intake"
                        ? `/intake/households/${client.household.code.toLowerCase()}`
                        : `/admin/households/${client.household.code.toLowerCase()}`
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/15 border border-[#3D6B22]/20 rounded-xl transition-colors cursor-pointer"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Household ({client.household.code})</span>
                  </Link>
                )}

                {!isEditing && canEdit && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit("agency")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-200/80"
                    title="Edit Agency Information"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content: View Mode vs Edit Mode */}
            {!isEditing ? (
              /* VIEW DETAILS */
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Current Care Status</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#3D6B22] border border-emerald-200">
                      {formData.status}
                    </span>
                    {formData.effectiveEndDate && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        (Ends: {formData.effectiveEndDate})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Lead Created Date</span>
                  <span className="text-sm font-semibold text-slate-800">{formData.leadCreatedDate}</span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Initial Assessment Date</span>
                  <span className="text-sm font-semibold text-slate-800">{formData.initialAssessmentDate}</span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Conversion & Start Date</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formData.conversionDate} • Started {formData.startDate}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Administrator & Region</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formData.administrator} ({formData.regionCode})
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Referred By</span>
                  <span className="text-sm font-semibold text-slate-800">{formData.referredBy}</span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Medicaid Number</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm  font-bold text-slate-900">{formData.medicaidNumber}</span>
                    <Shield className="w-3.5 h-3.5 text-[#3D6B22]" />
                  </div>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Preferred Caregiver</span>
                  <span className="text-sm font-bold text-[#3D6B22]">{formData.preferredCaregiver}</span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Admin EVV Alerts</span>
                  <span className="text-xs font-semibold text-slate-700">
                    Clock-In: {formData.disableClockInAlert ? "Muted" : "Active"} • Clock-Out: {formData.disableClockOutAlert ? "Muted" : "Active"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Invoicing ID</span>
                  <span className="text-sm  font-bold text-slate-900">{formData.invoicingId}</span>
                </div>
              </div>
            ) : (
              /* EDIT MODE */
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Status</label>
                  <div className="sm:col-span-8 flex flex-wrap items-center gap-2">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Hospitalized">Hospitalized</option>
                      <option value="On Hold">On Hold (Start of Care Pending)</option>
                      <option value="Discharged">Discharged</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleSetEffectiveEndDate}
                      className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                    >
                      SET EFFECTIVE END DATE
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Lead Created Date</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.leadCreatedDate}
                      onChange={(e) => setFormData({ ...formData, leadCreatedDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Initial Assessment Date</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.initialAssessmentDate}
                      onChange={(e) => setFormData({ ...formData, initialAssessmentDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Conversion Date</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.conversionDate}
                      onChange={(e) => setFormData({ ...formData, conversionDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Start Date</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Effective End Date</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.effectiveEndDate}
                      onChange={(e) => setFormData({ ...formData, effectiveEndDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white placeholder:text-slate-400"
                      placeholder="mm/dd/yy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Administrator</label>
                  <div className="sm:col-span-8">
                    <select
                      value={formData.administrator}
                      onChange={(e) => setFormData({ ...formData, administrator: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                    >
                      <option value="Will Martin">Will Martin</option>
                      <option value="Dana Jenkins">Dana Jenkins</option>
                      <option value="Sarah Miller">Sarah Miller</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Region Code</label>
                  <div className="sm:col-span-8">
                    <select
                      value={formData.regionCode}
                      onChange={(e) => setFormData({ ...formData, regionCode: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                    >
                      <option value="Brentwood">Brentwood</option>
                      <option value="Nashville Metro">Nashville Metro</option>
                      <option value="Rutherford County">Rutherford County</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Referred by</label>
                  <div className="sm:col-span-8">
                    <select
                      value={formData.referredBy}
                      onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                    >
                      <option value="Walker (Baptist), Jennifer">Walker (Baptist), Jennifer</option>
                      <option value="Vanderbilt Medical Center">Vanderbilt Medical Center</option>
                      <option value="Self / Family Referral">Self / Family Referral</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Medicaid Number</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.medicaidNumber}
                      onChange={(e) => setFormData({ ...formData, medicaidNumber: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white "
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Preferred Caregiver</label>
                  <div className="sm:col-span-8">
                    <select
                      value={formData.preferredCaregiver}
                      onChange={(e) => setFormData({ ...formData, preferredCaregiver: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                    >
                      <option value="Martin, Wilson">Martin, Wilson</option>
                      <option value="Jenkins, Sarah">Jenkins, Sarah</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Invoicing ID</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.invoicingId}
                      onChange={(e) => setFormData({ ...formData, invoicingId: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white "
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------------
            CARD 3: RESIDENTIAL ADDRESS
           ------------------------------------------------------------------- */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#3D6B22]" />
                <span>Residential Address</span>
              </h3>
              <div className="flex items-center gap-2">
                {formData.isAddressVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#3D6B22] border border-emerald-200/60">
                    <CheckCircle2 className="w-3 h-3 text-[#3D6B22]" />
                    <span>USPS Verified</span>
                  </span>
                )}
                {!isEditing && canEdit && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit("residential")}
                    className="p-1 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Edit Residential Address"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content: View Mode vs Edit Mode */}
            {!isEditing ? (
              /* VIEW DETAILS */
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Resident Name</span>
                  <span className="text-sm font-bold text-slate-900">{formData.resName}</span>
                </div>

                <div className="flex justify-between items-start py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Physical Address</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-slate-900 block">{formData.resAddress}</span>
                    {formData.resAddress2 && (
                      <span className="text-xs text-slate-500 block">{formData.resAddress2}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">City & State</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formData.resCity}, {formData.resState}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Postal Zip Code</span>
                  <span className="text-sm  font-bold text-slate-900">{formData.resZip}</span>
                </div>

                <div className="pt-2 flex justify-end">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${formData.resAddress}, ${formData.resCity}, ${formData.resState} ${formData.resZip}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Maps</span>
                  </a>
                </div>
              </div>
            ) : (
              /* EDIT MODE */
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Name</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.resName}
                      onChange={(e) => setFormData({ ...formData, resName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Address Line 1</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.resAddress}
                      onChange={(e) => setFormData({ ...formData, resAddress: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white text-slate-800"
                      placeholder="Street address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Address Line 2</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.resAddress2}
                      onChange={(e) => setFormData({ ...formData, resAddress2: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white text-slate-800"
                      placeholder="Apartment, suite, unit (optional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">City</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.resCity}
                      onChange={(e) => setFormData({ ...formData, resCity: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">State</label>
                  <div className="sm:col-span-8">
                    <select
                      value={formData.resState}
                      onChange={(e) => setFormData({ ...formData, resState: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white text-slate-800"
                    >
                      <option value="Tennessee">Tennessee</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Oregon">Oregon</option>
                      <option value="Texas">Texas</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Zip Code</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.resZip}
                      onChange={(e) => setFormData({ ...formData, resZip: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white  text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleVerifyAddress}
                    disabled={addressVerifying}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/15 border border-[#3D6B22]/20 rounded-xl transition-all cursor-pointer"
                  >
                    {addressVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Verify USPS Address</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------------
            CARD 4: BILLING ADDRESS
           ------------------------------------------------------------------- */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3D6B22]" />
                <span>Billing Address</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Financial Statements
                </span>
                {!isEditing && canEdit && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit("billing")}
                    className="p-1 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Edit Billing Address"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content: View Mode vs Edit Mode */}
            {!isEditing ? (
              /* VIEW DETAILS */
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Billing Entity</span>
                  <span className="text-sm font-bold text-slate-900">{formData.billName}</span>
                </div>

                <div className="flex justify-between items-start py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Billing Street Address</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-slate-900 block">{formData.billAddress}</span>
                    {formData.billAddress2 && (
                      <span className="text-xs text-slate-500 block">{formData.billAddress2}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">City, State & Zip</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formData.billCity}, {formData.billState} {formData.billZip}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Address Matching</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {formData.sameAsResidential ? "Same As Residential" : "Dedicated Billing Location"}
                  </span>
                </div>
              </div>
            ) : (
              /* EDIT MODE */
              <div className="space-y-3.5">
                <div className="pb-2 border-b border-slate-100">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sameAsResidential}
                      onChange={(e) => handleToggleSameAddress(e.target.checked)}
                      className="rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]"
                    />
                    <span>Same As Residential Address</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Name</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      disabled={formData.sameAsResidential}
                      value={formData.billName}
                      onChange={(e) => setFormData({ ...formData, billName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-400 border border-slate-200 rounded-xl text-sm focus:bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Address Line 1</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      disabled={formData.sameAsResidential}
                      value={formData.billAddress}
                      onChange={(e) => setFormData({ ...formData, billAddress: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-400 border border-slate-200 rounded-xl text-sm focus:bg-white text-slate-800"
                      placeholder="Billing street address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Address Line 2</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      disabled={formData.sameAsResidential}
                      value={formData.billAddress2}
                      onChange={(e) => setFormData({ ...formData, billAddress2: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-400 border border-slate-200 rounded-xl text-sm focus:bg-white text-slate-800"
                      placeholder="Suite, unit (optional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">City</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      disabled={formData.sameAsResidential}
                      value={formData.billCity}
                      onChange={(e) => setFormData({ ...formData, billCity: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-400 border border-slate-200 rounded-xl text-sm focus:bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">State</label>
                  <div className="sm:col-span-8">
                    <select
                      disabled={formData.sameAsResidential}
                      value={formData.billState}
                      onChange={(e) => setFormData({ ...formData, billState: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-400 border border-slate-200 rounded-xl text-sm focus:bg-white text-slate-800"
                    >
                      <option value="Texas">Texas</option>
                      <option value="Tennessee">Tennessee</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Oregon">Oregon</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">Zip Code</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      disabled={formData.sameAsResidential}
                      value={formData.billZip}
                      onChange={(e) => setFormData({ ...formData, billZip: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-400 border border-slate-200 rounded-xl text-sm focus:bg-white  text-slate-800"
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
