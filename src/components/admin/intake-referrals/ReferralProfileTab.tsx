"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Building2,
  Stethoscope,
  ShieldCheck,
  Phone,
  Mail,
  Edit3,
  Save,
  X,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Home,
} from "lucide-react";
import {
  AdminIntakeReferralItem,
  ReferralPriority,
  ReferralStatus,
  getAdminReferralsFromStorage,
  saveAdminReferralsToStorage,
} from "@/lib/intake-referrals/adminIntakeReferralsData";
import { LILISARE_SERVICES } from "@/lib/services";
import { toast } from "sonner";

interface ReferralProfileTabProps {
  referral: AdminIntakeReferralItem;
  isEditing?: boolean;
  onToggleEdit?: (editing: boolean) => void;
  onUpdateReferral: (updated: AdminIntakeReferralItem) => void;
  onLogActivity?: (category: string, text: string) => void;
}

export function ReferralProfileTab({
  referral,
  isEditing: externalIsEditing,
  onToggleEdit,
  onUpdateReferral,
  onLogActivity,
}: ReferralProfileTabProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
  const setIsEditing = (val: boolean) => {
    setInternalIsEditing(val);
    onToggleEdit?.(val);
  };

  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    patientName: referral.patientName,
    age: referral.age,
    gender: referral.gender,
    phone: referral.phone,
    email: referral.email,
    address: referral.address,
    city: referral.city,
    zip: referral.zip,
    referralSource: referral.referralSource,
    referralSourceContact: referral.referralSourceContact || "",
    assignedCoordinator: referral.assignedCoordinator,
    priority: referral.priority,
    status: referral.status,
    program: referral.program,
    primaryDiagnosis: referral.primaryDiagnosis,
    triageNotes: referral.triageNotes,
    requestedServicesText: referral.requestedServices.join(", "),
    payerName: referral.payerName,
    insuranceVerified: referral.insuranceVerified,
    targetStartDate: referral.targetStartDate,
    estimatedHoursPerWeek: referral.estimatedHoursPerWeek,
  });

  useEffect(() => {
    setFormData({
      patientName: referral.patientName,
      age: referral.age,
      gender: referral.gender,
      phone: referral.phone,
      email: referral.email,
      address: referral.address,
      city: referral.city,
      zip: referral.zip,
      referralSource: referral.referralSource,
      referralSourceContact: referral.referralSourceContact || "",
      assignedCoordinator: referral.assignedCoordinator,
      priority: referral.priority,
      status: referral.status,
      program: referral.program,
      primaryDiagnosis: referral.primaryDiagnosis,
      triageNotes: referral.triageNotes,
      requestedServicesText: referral.requestedServices.join(", "),
      payerName: referral.payerName,
      insuranceVerified: referral.insuranceVerified,
      targetStartDate: referral.targetStartDate,
      estimatedHoursPerWeek: referral.estimatedHoursPerWeek,
    });
  }, [referral]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    toast.info("Referral changes discarded.");
  };

  const handleSaveChanges = () => {
    if (!formData.patientName.trim()) {
      toast.error("Patient name is required.");
      return;
    }
    setIsSaving(true);

    const services = formData.requestedServicesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const updated: AdminIntakeReferralItem = {
      ...referral,
      patientName: formData.patientName.trim(),
      age: Number(formData.age) || referral.age,
      gender: formData.gender,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      zip: formData.zip.trim(),
      referralSource: formData.referralSource.trim(),
      referralSourceContact: formData.referralSourceContact.trim() || undefined,
      assignedCoordinator: formData.assignedCoordinator.trim(),
      priority: formData.priority,
      status: formData.status,
      program: formData.program,
      primaryDiagnosis: formData.primaryDiagnosis.trim(),
      triageNotes: formData.triageNotes.trim(),
      requestedServices: services.length > 0 ? services : referral.requestedServices,
      payerName: formData.payerName.trim(),
      insuranceVerified: formData.insuranceVerified,
      targetStartDate: formData.targetStartDate.trim(),
      estimatedHoursPerWeek: Number(formData.estimatedHoursPerWeek) || 0,
    };

    setTimeout(() => {
      const all = getAdminReferralsFromStorage();
      const idx = all.findIndex(
        (r) => r.id.toLowerCase() === referral.id.toLowerCase()
      );
      if (idx !== -1) {
        all[idx] = updated;
        saveAdminReferralsToStorage(all);
      } else {
        saveAdminReferralsToStorage([updated, ...all]);
      }

      onUpdateReferral(updated);
      onLogActivity?.(
        "Coordination",
        `Master Referral Record updated for ${updated.patientName} (${updated.id}).`
      );
      setIsSaving(false);
      setIsEditing(false);
      toast.success("Referral profile changes saved.");
    }, 300);
  };

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
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Master Referral Record
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
              Synchronized client demographics, referral source, clinical triage, and payer readiness
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

      {/* 2x2 Grid of 4 Core Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Card 1: Patient Identity & Contact */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Client Identity & Residence</span>
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-200/80"
                  title="Edit Client Identity"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Client Legal Name</span>
                  <span className="text-sm font-bold text-slate-900">{referral.patientName}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Demographics</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {referral.age} yrs • {referral.gender}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Telephone</span>
                  <a
                    href={`tel:${referral.phone}`}
                    className="text-sm font-bold text-[#3D6B22] hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{referral.phone}</span>
                  </a>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Email Address</span>
                  <a
                    href={`mailto:${referral.email}`}
                    className="text-sm font-semibold text-[#3D6B22] hover:underline flex items-center gap-1.5 truncate max-w-[220px]"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{referral.email}</span>
                  </a>
                </div>
                <div className="flex justify-between items-start py-1.5 gap-4">
                  <span className="text-[13px] font-medium text-slate-500 shrink-0">Service Residence</span>
                  <span className="text-sm font-semibold text-slate-800 text-right">
                    {referral.address}, {referral.city} {referral.zip}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Client Name *
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Age & Gender
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className={inputClass}
                    />
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className={inputClass}
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Phone / Email
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Address / City / ZIP
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-6 gap-2">
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`${inputClass} col-span-3`}
                    />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`${inputClass} col-span-2`}
                    />
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      className={`${inputClass} col-span-1`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Intake Referral & Source Metadata */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3D6B22]" />
                <span>Referral Source & Pipeline Status</span>
              </h3>
              {referral.householdCode && (
                <Link
                  href={`/admin/households/${referral.householdCode.toLowerCase()}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/15 border border-[#3D6B22]/20 rounded-xl transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Household ({referral.householdCode})</span>
                </Link>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Pipeline Stage</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#3D6B22] border border-emerald-200">
                    {referral.status}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Priority Tier</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      referral.priority === "Urgent"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : referral.priority === "High"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {referral.priority}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Referral Source</span>
                  <span className="text-sm font-semibold text-slate-800 text-right max-w-[60%] truncate">
                    {referral.referralSource}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Source Contact</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {referral.referralSourceContact || "Direct Intake"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Assigned Coordinator</span>
                  <span className="text-sm font-bold text-slate-900">
                    {referral.assignedCoordinator}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Received / Elapsed</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {referral.receivedDate} ({referral.daysInPipeline} days in pipeline)
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Stage & Priority
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as ReferralStatus })
                      }
                      className={inputClass}
                    >
                      <option value="New Referral">New Referral</option>
                      <option value="Clinical Assessment">Clinical Assessment</option>
                      <option value="Documents & Auth">Documents & Auth</option>
                      <option value="Ready for Staffing">Ready for Staffing</option>
                      <option value="Enrolled">Enrolled</option>
                      <option value="Archived">Archived</option>
                    </select>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value as ReferralPriority })
                      }
                      className={inputClass}
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Standard">Standard</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Referral Source
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.referralSource}
                      onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Source Contact
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.referralSourceContact}
                      onChange={(e) =>
                        setFormData({ ...formData, referralSourceContact: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Coordinator
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.assignedCoordinator}
                      onChange={(e) =>
                        setFormData({ ...formData, assignedCoordinator: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Clinical Diagnosis & Requested Services */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#3D6B22]" />
                <span>Clinical Diagnosis & Requested Care</span>
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-200/80"
                  title="Edit Clinical Triage"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="py-1">
                  <span className="text-[13px] font-medium text-slate-500 block mb-1">
                    Primary Clinical Diagnosis
                  </span>
                  <p className="text-sm font-bold text-slate-900">{referral.primaryDiagnosis}</p>
                </div>
                <div className="py-2">
                  <span className="text-[13px] font-medium text-slate-500 block mb-1.5">
                    Requested Services
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {referral.requestedServices.map((svc) => (
                      <span
                        key={svc}
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#3D6B22] border border-emerald-200/80"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="py-2">
                  <span className="text-[13px] font-medium text-slate-500 block mb-1">
                    Triage Directives
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">{referral.triageNotes}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1">
                    Primary Diagnosis
                  </label>
                  <input
                    type="text"
                    value={formData.primaryDiagnosis}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryDiagnosis: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1">
                    Requested Services (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.requestedServicesText}
                    onChange={(e) =>
                      setFormData({ ...formData, requestedServicesText: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1">
                    Triage Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.triageNotes}
                    onChange={(e) => setFormData({ ...formData, triageNotes: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Payer, Benefit Program & Linked Client */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3D6B22]" />
                <span>Payer, Program & Target Capacity</span>
              </h3>
              {referral.clientId && (
                <Link
                  href={`/admin/clients/${referral.clientId}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3D6B22] hover:underline"
                >
                  <span>Client ({referral.clientId})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Benefit Program</span>
                  <span className="text-sm font-bold text-slate-900 text-right max-w-[60%] truncate">
                    {referral.program}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Primary Payer</span>
                  <span className="text-sm font-semibold text-slate-800">{referral.payerName}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Eligibility Status</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#3D6B22] border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{referral.insuranceVerified ? "Verified" : "Pending Verification"}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Target Start Date</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {referral.targetStartDate}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Estimated Hours</span>
                  <span className="text-sm font-bold text-slate-900">
                    {referral.estimatedHoursPerWeek} hrs/week
                  </span>
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
                    Payer Name
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.payerName}
                      onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Start Date & Hours
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.targetStartDate}
                      onChange={(e) =>
                        setFormData({ ...formData, targetStartDate: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      type="number"
                      min={0}
                      max={168}
                      value={formData.estimatedHoursPerWeek}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedHoursPerWeek: Number(e.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Payer Verified
                  </label>
                  <div className="sm:col-span-8">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.insuranceVerified}
                        onChange={(e) =>
                          setFormData({ ...formData, insuranceVerified: e.target.checked })
                        }
                        className="rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]"
                      />
                      <span>Insurance / Medicaid Waiver Eligibility Verified</span>
                    </label>
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
