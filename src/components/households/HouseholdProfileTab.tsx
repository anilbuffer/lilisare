"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Users,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Save,
  X,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Heart,
} from "lucide-react";
import { Household, getHouseholdsFromStorage, saveHouseholdsToStorage } from "@/lib/households/mockData";
import { LILISARE_SERVICES } from "@/lib/services";
import { toast } from "sonner";

interface HouseholdProfileTabProps {
  household: Household;
  portalPrefix: string;
  isEditing?: boolean;
  onToggleEdit?: (editing: boolean) => void;
  onUpdateHousehold: (updated: Household) => void;
  onOpenContactFamily: () => void;
  canApproveAuthorization?: boolean;
  onLogActivity?: (title: string, details: string) => void;
}

export function HouseholdProfileTab({
  household,
  portalPrefix,
  isEditing: externalIsEditing,
  onToggleEdit,
  onUpdateHousehold,
  onOpenContactFamily,
  canApproveAuthorization = false,
  onLogActivity,
}: HouseholdProfileTabProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
  const setIsEditing = (val: boolean) => {
    setInternalIsEditing(val);
    onToggleEdit?.(val);
  };

  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: household.name,
    address: household.address,
    city: household.city,
    state: household.state,
    zip: household.zip,
    phone: household.phone,
    program: household.program,
    clientName: household.client.name,
    clientRelationship: household.client.relationship,
    clientPhone: household.client.phone,
    clientEmail: household.client.email,
    caregiverName: household.primaryCaregiver.name,
    caregiverRelationship: household.primaryCaregiver.relationship,
    caregiverPhone: household.primaryCaregiver.phone,
    caregiverEmail: household.primaryCaregiver.email,
    authorizedHoursPerWeek: household.authorizedHoursPerWeek,
    scheduledHoursPerWeek: household.scheduledHoursPerWeek,
    authStatus: household.authStatus,
    authExpiry: household.authExpiry,
    caseManagerName: household.caseManager.name,
    caseManagerAgency: household.caseManager.agency,
    caseManagerPhone: household.caseManager.phone,
    caseManagerEmail: household.caseManager.email,
  });

  useEffect(() => {
    setFormData({
      name: household.name,
      address: household.address,
      city: household.city,
      state: household.state,
      zip: household.zip,
      phone: household.phone,
      program: household.program,
      clientName: household.client.name,
      clientRelationship: household.client.relationship,
      clientPhone: household.client.phone,
      clientEmail: household.client.email,
      caregiverName: household.primaryCaregiver.name,
      caregiverRelationship: household.primaryCaregiver.relationship,
      caregiverPhone: household.primaryCaregiver.phone,
      caregiverEmail: household.primaryCaregiver.email,
      authorizedHoursPerWeek: household.authorizedHoursPerWeek,
      scheduledHoursPerWeek: household.scheduledHoursPerWeek,
      authStatus: household.authStatus,
      authExpiry: household.authExpiry,
      caseManagerName: household.caseManager.name,
      caseManagerAgency: household.caseManager.agency,
      caseManagerPhone: household.caseManager.phone,
      caseManagerEmail: household.caseManager.email,
    });
  }, [household]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    toast.info("Household changes discarded.");
  };

  const handleSaveChanges = () => {
    if (!formData.name.trim()) {
      toast.error("Household name is required.");
      return;
    }
    setIsSaving(true);

    const safeAuthStatus = canApproveAuthorization
      ? formData.authStatus
      : household.authStatus;

    const updated: Household = {
      ...household,
      name: formData.name.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zip: formData.zip.trim(),
      phone: formData.phone.trim(),
      program: formData.program,
      authorizedHoursPerWeek: Number(formData.authorizedHoursPerWeek) || 0,
      scheduledHoursPerWeek: Number(formData.scheduledHoursPerWeek) || 0,
      authStatus: safeAuthStatus,
      authExpiry: formData.authExpiry,
      client: {
        ...household.client,
        name: formData.clientName.trim(),
        relationship: formData.clientRelationship.trim(),
        phone: formData.clientPhone.trim(),
        email: formData.clientEmail.trim(),
      },
      primaryCaregiver: {
        ...household.primaryCaregiver,
        name: formData.caregiverName.trim(),
        relationship: formData.caregiverRelationship.trim(),
        phone: formData.caregiverPhone.trim(),
        email: formData.caregiverEmail.trim(),
      },
      caseManager: {
        name: formData.caseManagerName.trim(),
        agency: formData.caseManagerAgency.trim(),
        phone: formData.caseManagerPhone.trim(),
        email: formData.caseManagerEmail.trim(),
      },
    };

    setTimeout(() => {
      const all = getHouseholdsFromStorage();
      const idx = all.findIndex(
        (h) => h.id.toLowerCase() === household.id.toLowerCase()
      );
      if (idx !== -1) {
        all[idx] = updated;
        saveHouseholdsToStorage(all);
      } else {
        saveHouseholdsToStorage([updated, ...all]);
      }

      onUpdateHousehold(updated);
      onLogActivity?.(
        "Master Household Record Updated",
        `Residence, pairing, and authorization details updated for ${updated.name}.`
      );
      setIsSaving(false);
      setIsEditing(false);
      toast.success("Household profile changes saved.");
    }, 300);
  };

  const clientHref = `${portalPrefix || "/admin"}/clients/${household.client.id}`;
  const caregiverHref = `${portalPrefix || "/admin"}/caregivers/${household.primaryCaregiver.id}`;
  const cardClass =
    "bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between";
  const inputClass =
    "w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner: View Details vs Edit Profile Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Master Household Record
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isEditing
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {isEditing ? "EDIT MODE" : "VIEW DETAILS"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Synchronized family residence, client-caregiver pairing, authorization, and case manager details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
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

      {/* 2x2 Grid of 4 Core Record Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Card 1: Household Residence & Primary Contact */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Residence & Primary Contact</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenContactFamily}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#3D6B22]" />
                  <span>Contact Family</span>
                </button>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-200/80"
                    title="Edit Residence & Contact"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Household Name</span>
                  <span className="text-sm font-bold text-slate-900">{household.name}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Household Code</span>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                    {household.code}
                  </span>
                </div>
                <div className="flex justify-between items-start py-1.5 gap-4">
                  <span className="text-[13px] font-medium text-slate-500 shrink-0">Street Address</span>
                  <span className="text-sm font-semibold text-slate-800 text-right">
                    {household.address}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">City / State / ZIP</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {household.city}, {household.state} {household.zip}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Primary Telephone</span>
                  <a
                    href={`tel:${household.phone}`}
                    className="text-sm font-bold text-[#3D6B22] hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{household.phone}</span>
                  </a>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Address Verification</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#3D6B22] border border-emerald-200/70">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>EVV Geofence Ready</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Household Name *
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Street Address
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    City / State / ZIP
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-6 gap-2">
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`${inputClass} col-span-3`}
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className={`${inputClass} col-span-1 text-center`}
                      placeholder="ST"
                    />
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      className={`${inputClass} col-span-2`}
                      placeholder="ZIP"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Primary Telephone
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Connected Client & Caregiver Pairing */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Client & Caregiver Pairing</span>
              </h3>
              <div className="flex items-center gap-2">
                <Link
                  href={clientHref}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/15 border border-[#3D6B22]/20 rounded-xl transition-colors"
                >
                  <Heart className="w-3 h-3" />
                  <span>Client Chart</span>
                </Link>
                <Link
                  href={caregiverHref}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl transition-colors"
                >
                  <Users className="w-3 h-3" />
                  <span>Caregiver File</span>
                </Link>
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Care Recipient (Client)</span>
                  <Link href={clientHref} className="text-sm font-bold text-[#3D6B22] hover:underline flex items-center gap-1">
                    <span>{household.client.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Client Status & Role</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {household.client.status} • {household.client.relationship}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Primary Caregiver</span>
                  <Link href={caregiverHref} className="text-sm font-bold text-[#3D6B22] hover:underline flex items-center gap-1">
                    <span>{household.primaryCaregiver.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Caregiver Relationship</span>
                  <span className="text-xs font-semibold text-slate-800 text-right max-w-[60%] truncate" title={household.primaryCaregiver.relationship}>
                    {household.primaryCaregiver.relationship}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Caregiver Contact</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {household.primaryCaregiver.phone}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Tri-Journey Sync</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#3D6B22] border border-emerald-200/70">
                    <Sparkles className="w-3 h-3" />
                    <span>{household.triJourneyStatus.clientStage} / {household.triJourneyStatus.caregiverStage}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Client Name
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Client Relationship
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.clientRelationship}
                      onChange={(e) => setFormData({ ...formData, clientRelationship: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Primary Caregiver
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.caregiverName}
                      onChange={(e) => setFormData({ ...formData, caregiverName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Caregiver Role
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.caregiverRelationship}
                      onChange={(e) => setFormData({ ...formData, caregiverRelationship: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Caregiver Phone
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="tel"
                      value={formData.caregiverPhone}
                      onChange={(e) => setFormData({ ...formData, caregiverPhone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Program & Service Authorization */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3D6B22]" />
                <span>Program & Service Authorization</span>
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-200/80"
                  title="Edit Program & Authorization"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Care Program</span>
                  <span className="text-sm font-bold text-slate-900 text-right max-w-[60%] truncate" title={household.program}>
                    {household.program}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Authorization Status</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      household.authStatus === "Approved"
                        ? "bg-emerald-50 text-[#3D6B22] border-emerald-200"
                        : household.authStatus === "Expiring Soon"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : household.authStatus === "Expired"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {household.authStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Weekly Hours Allocation</span>
                  <span className="text-sm font-bold text-slate-900">
                    {household.scheduledHoursPerWeek} / {household.authorizedHoursPerWeek} hrs/wk
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Authorization Expiry</span>
                  <span className="text-sm font-semibold text-slate-800">{household.authExpiry}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">EVV Compliance Rate</span>
                  <span className="text-sm font-bold text-emerald-700">{household.evvComplianceRate}%</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Last Recorded Visit</span>
                  <span className="text-xs font-semibold text-slate-700">{household.lastVisitDate}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Care Program
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      className={inputClass}
                    >
                      {!LILISARE_SERVICES.some((s) => s.name === formData.program) && (
                        <option value={formData.program}>{formData.program}</option>
                      )}
                      {LILISARE_SERVICES.map((svc) => (
                        <option key={svc.id} value={svc.name}>
                          {svc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Auth Status
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={formData.authStatus}
                      disabled={!canApproveAuthorization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          authStatus: e.target.value as Household["authStatus"],
                        })
                      }
                      className={`${inputClass} disabled:bg-slate-100 disabled:cursor-not-allowed`}
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Expiring Soon">Expiring Soon</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Authorized / Scheduled
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={0}
                      max={168}
                      value={formData.authorizedHoursPerWeek}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          authorizedHoursPerWeek: Number(e.target.value),
                        })
                      }
                      className={inputClass}
                      placeholder="Auth hrs"
                    />
                    <input
                      type="number"
                      min={0}
                      max={168}
                      value={formData.scheduledHoursPerWeek}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledHoursPerWeek: Number(e.target.value),
                        })
                      }
                      className={inputClass}
                      placeholder="Sched hrs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Auth Expiry Date
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="date"
                      value={formData.authExpiry}
                      onChange={(e) => setFormData({ ...formData, authExpiry: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Case Manager & Agency Coordination */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3D6B22]" />
                <span>Case Manager & Agency Coordination</span>
              </h3>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100/80 px-2.5 py-0.5 rounded-md">
                Oversight
              </span>
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Assigned Case Manager</span>
                  <span className="text-sm font-bold text-slate-900">{household.caseManager.name}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">State / Payer Agency</span>
                  <span className="text-sm font-semibold text-slate-800 text-right max-w-[60%] truncate">
                    {household.caseManager.agency}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Direct Telephone</span>
                  <a
                    href={`tel:${household.caseManager.phone}`}
                    className="text-sm font-semibold text-[#3D6B22] hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{household.caseManager.phone}</span>
                  </a>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Direct Email</span>
                  <a
                    href={`mailto:${household.caseManager.email}`}
                    className="text-sm font-semibold text-[#3D6B22] hover:underline flex items-center gap-1.5 truncate max-w-[220px]"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{household.caseManager.email}</span>
                  </a>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Agency Operations Stage</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    {household.triJourneyStatus.opsStage}
                  </span>
                </div>
                {household.triJourneyStatus.bottleneckMessage && (
                  <div className="pt-2">
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900">
                      Attention: {household.triJourneyStatus.bottleneckMessage}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Case Manager
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.caseManagerName}
                      onChange={(e) =>
                        setFormData({ ...formData, caseManagerName: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Agency / Payer
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.caseManagerAgency}
                      onChange={(e) =>
                        setFormData({ ...formData, caseManagerAgency: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    CM Phone
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="tel"
                      value={formData.caseManagerPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, caseManagerPhone: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    CM Email
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="email"
                      value={formData.caseManagerEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, caseManagerEmail: e.target.value })
                      }
                      className={inputClass}
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
