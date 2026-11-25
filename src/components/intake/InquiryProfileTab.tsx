"use client";

import React, { useState, useEffect } from "react";
import {
  InquiryRecord,
  ContactMethod,
  ReferralSourceType,
} from "@/types/intake";
import { LILISARE_SERVICES } from "@/lib/services";
import {
  Users,
  Heart,
  UserCheck,
  Building2,
  Phone,
  Mail,
  Edit3,
  Save,
  X,
  RefreshCw,
  CalendarPlus,
} from "lucide-react";
import { toast } from "sonner";

interface InquiryProfileTabProps {
  inquiry: InquiryRecord;
  isEditing?: boolean;
  onToggleEdit?: (editing: boolean) => void;
  onSaveInquiry: (updated: InquiryRecord) => void;
  onOpenContactFamily: () => void;
  onOpenScheduleAssessment: () => void;
  onOpenAssignCoordinator: () => void;
}

export function InquiryProfileTab({
  inquiry,
  isEditing: externalIsEditing,
  onToggleEdit,
  onSaveInquiry,
  onOpenContactFamily,
  onOpenScheduleAssessment,
  onOpenAssignCoordinator,
}: InquiryProfileTabProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
  const setIsEditing = (val: boolean) => {
    setInternalIsEditing(val);
    onToggleEdit?.(val);
  };
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    familyName: inquiry.familyName,
    primaryContact: inquiry.familyInfo.primaryContact,
    relationship: inquiry.familyInfo.relationship,
    phone: inquiry.familyInfo.phone,
    email: inquiry.familyInfo.email,
    preferredContactMethod: inquiry.familyInfo.preferredContactMethod,
    address: inquiry.familyInfo.householdLocation.address,
    city: inquiry.familyInfo.householdLocation.city,
    state: inquiry.familyInfo.householdLocation.state,
    zip: inquiry.familyInfo.householdLocation.zip,
    branch: inquiry.branch,
    clientName: inquiry.familyInfo.clientInfo.name,
    clientAge: inquiry.familyInfo.clientInfo.age,
    clientGender: inquiry.familyInfo.clientInfo.gender || "Female",
    clientLanguage: inquiry.familyInfo.clientInfo.primaryLanguage || "English",
    mobilityNotes: inquiry.familyInfo.clientInfo.mobilityNotes || "",
    caregiverName: inquiry.familyInfo.potentialCaregiver?.name || "",
    caregiverRelationship: inquiry.familyInfo.potentialCaregiver?.relationship || "",
    programInterest: inquiry.careRequirements.programInterest,
    hoursPerWeek: inquiry.careRequirements.hoursPerWeek,
    targetStartDate: inquiry.careRequirements.targetStartDate || "Immediate",
    source: inquiry.source,
    organization: inquiry.referralInfo.organization,
    coordinatorName: inquiry.referralInfo.assignedCoordinator.name,
    urgency: inquiry.urgency,
  });

  useEffect(() => {
    setFormData({
      familyName: inquiry.familyName,
      primaryContact: inquiry.familyInfo.primaryContact,
      relationship: inquiry.familyInfo.relationship,
      phone: inquiry.familyInfo.phone,
      email: inquiry.familyInfo.email,
      preferredContactMethod: inquiry.familyInfo.preferredContactMethod,
      address: inquiry.familyInfo.householdLocation.address,
      city: inquiry.familyInfo.householdLocation.city,
      state: inquiry.familyInfo.householdLocation.state,
      zip: inquiry.familyInfo.householdLocation.zip,
      branch: inquiry.branch,
      clientName: inquiry.familyInfo.clientInfo.name,
      clientAge: inquiry.familyInfo.clientInfo.age,
      clientGender: inquiry.familyInfo.clientInfo.gender || "Female",
      clientLanguage: inquiry.familyInfo.clientInfo.primaryLanguage || "English",
      mobilityNotes: inquiry.familyInfo.clientInfo.mobilityNotes || "",
      caregiverName: inquiry.familyInfo.potentialCaregiver?.name || "",
      caregiverRelationship: inquiry.familyInfo.potentialCaregiver?.relationship || "",
      programInterest: inquiry.careRequirements.programInterest,
      hoursPerWeek: inquiry.careRequirements.hoursPerWeek,
      targetStartDate: inquiry.careRequirements.targetStartDate || "Immediate",
      source: inquiry.source,
      organization: inquiry.referralInfo.organization,
      coordinatorName: inquiry.referralInfo.assignedCoordinator.name,
      urgency: inquiry.urgency,
    });
  }, [inquiry]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    toast.info("Inquiry changes discarded.");
  };

  const handleSaveChanges = () => {
    if (!formData.primaryContact.trim() || !formData.clientName.trim()) {
      toast.error("Primary contact and client name are required.");
      return;
    }
    setIsSaving(true);

    const updated: InquiryRecord = {
      ...inquiry,
      familyName: formData.familyName.trim(),
      branch: formData.branch.trim(),
      source: formData.source,
      urgency: formData.urgency,
      familyInfo: {
        ...inquiry.familyInfo,
        primaryContact: formData.primaryContact.trim(),
        relationship: formData.relationship.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        preferredContactMethod: formData.preferredContactMethod,
        householdLocation: {
          ...inquiry.familyInfo.householdLocation,
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zip: formData.zip.trim(),
          branch: formData.branch.trim(),
        },
        clientInfo: {
          ...inquiry.familyInfo.clientInfo,
          name: formData.clientName.trim(),
          age: Number(formData.clientAge) || inquiry.familyInfo.clientInfo.age,
          gender: formData.clientGender,
          primaryLanguage: formData.clientLanguage.trim(),
          mobilityNotes: formData.mobilityNotes.trim(),
        },
        potentialCaregiver: formData.caregiverName.trim()
          ? {
              ...inquiry.familyInfo.potentialCaregiver,
              name: formData.caregiverName.trim(),
              relationship: formData.caregiverRelationship.trim() || "Family Caregiver",
            }
          : undefined,
      },
      referralInfo: {
        ...inquiry.referralInfo,
        source: formData.source,
        organization: formData.organization.trim(),
        assignedCoordinator: {
          ...inquiry.referralInfo.assignedCoordinator,
          name: formData.coordinatorName.trim(),
        },
      },
      careRequirements: {
        ...inquiry.careRequirements,
        programInterest: formData.programInterest,
        hoursPerWeek: Number(formData.hoursPerWeek) || 0,
        targetStartDate: formData.targetStartDate.trim(),
      },
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: "note",
          author: formData.coordinatorName.trim() || "Intake Coordinator",
          timestamp: "Just now",
          title: "Master Inquiry Record Updated",
          details: `Updated contact, client demographics, and care requirements for ${formData.familyName.trim()}.`,
        },
        ...inquiry.timeline,
      ],
    };

    setTimeout(() => {
      onSaveInquiry(updated);
      setIsSaving(false);
      setIsEditing(false);
      toast.success("Inquiry profile changes saved.");
    }, 300);
  };

  const cardClass =
    "bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between";
  const inputClass =
    "w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Master Inquiry Record
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
              Synchronized family contact, care recipient, caregiver intent, and referral intake details
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
        {/* Card 1: Primary Family Contact & Residence */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Primary Family Contact & Residence</span>
              </h3>
              <button
                type="button"
                onClick={onOpenContactFamily}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#3D6B22]" />
                <span>Contact Family</span>
              </button>
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Family Unit</span>
                  <span className="text-sm font-bold text-slate-900">{inquiry.familyName}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Primary Contact</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {inquiry.familyInfo.primaryContact} ({inquiry.familyInfo.relationship})
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Telephone</span>
                  <a
                    href={`tel:${inquiry.familyInfo.phone}`}
                    className="text-sm font-bold text-[#3D6B22] hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{inquiry.familyInfo.phone}</span>
                  </a>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Email & Method</span>
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {inquiry.familyInfo.email} ({inquiry.familyInfo.preferredContactMethod})
                    </span>
                  </span>
                </div>
                <div className="flex justify-between items-start py-1.5 gap-4">
                  <span className="text-[13px] font-medium text-slate-500 shrink-0">Household Location</span>
                  <span className="text-xs font-semibold text-slate-800 text-right">
                    {inquiry.familyInfo.householdLocation.address},{" "}
                    {inquiry.familyInfo.householdLocation.city},{" "}
                    {inquiry.familyInfo.householdLocation.state}{" "}
                    {inquiry.familyInfo.householdLocation.zip}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Family Name
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={formData.familyName}
                      onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Contact & Relation
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.primaryContact}
                      onChange={(e) =>
                        setFormData({ ...formData, primaryContact: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={formData.relationship}
                      onChange={(e) =>
                        setFormData({ ...formData, relationship: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Phone & Email
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
                    Address / City / ST
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
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className={`${inputClass} col-span-1 text-center`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Loved One Demographics */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Loved One (Care Recipient)</span>
              </h3>
              <button
                type="button"
                onClick={onOpenScheduleAssessment}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-sky-700" />
                <span>Schedule RN</span>
              </button>
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Full Name</span>
                  <span className="text-sm font-bold text-slate-900">
                    {inquiry.familyInfo.clientInfo.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Age & Gender</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {inquiry.familyInfo.clientInfo.age} yrs •{" "}
                    {inquiry.familyInfo.clientInfo.gender || "Female"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Primary Language</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {inquiry.familyInfo.clientInfo.primaryLanguage || "English"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Assessment Status</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
                    {inquiry.assessmentStatus}
                  </span>
                </div>
                <div className="py-1.5">
                  <span className="text-[13px] font-medium text-slate-500 block mb-1">
                    Mobility & Daily Living Notes
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {inquiry.familyInfo.clientInfo.mobilityNotes || "No clinical mobility notes added yet."}
                  </p>
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
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Age / Gender / Lang
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={formData.clientAge}
                      onChange={(e) =>
                        setFormData({ ...formData, clientAge: Number(e.target.value) })
                      }
                      className={inputClass}
                    />
                    <select
                      value={formData.clientGender}
                      onChange={(e) => setFormData({ ...formData, clientGender: e.target.value })}
                      className={inputClass}
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="text"
                      value={formData.clientLanguage}
                      onChange={(e) =>
                        setFormData({ ...formData, clientLanguage: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1">
                    Mobility & Clinical Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.mobilityNotes}
                    onChange={(e) => setFormData({ ...formData, mobilityNotes: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Caregiver Pairing & Service Program */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Caregiver Intent & Program</span>
              </h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200/70">
                {inquiry.familyInfo.potentialCaregiver?.name ? "Family Caregiver" : "Agency Match"}
              </span>
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Proposed Caregiver</span>
                  <span className="text-sm font-bold text-slate-900">
                    {inquiry.familyInfo.potentialCaregiver?.name || "Agency Staff Assignment"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Relationship</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {inquiry.familyInfo.potentialCaregiver?.relationship || "LiliSare Care Team"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Benefit Program</span>
                  <span className="text-sm font-bold text-slate-900 text-right max-w-[60%] truncate">
                    {inquiry.careRequirements.programInterest}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Requested Volume</span>
                  <span className="text-sm font-bold text-[#3D6B22]">
                    {inquiry.careRequirements.hoursPerWeek} hrs/week
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Target Start Date</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {inquiry.careRequirements.targetStartDate || "Immediate"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Caregiver & Relation
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Caregiver name"
                      value={formData.caregiverName}
                      onChange={(e) =>
                        setFormData({ ...formData, caregiverName: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={formData.caregiverRelationship}
                      onChange={(e) =>
                        setFormData({ ...formData, caregiverRelationship: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Care Program
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={formData.programInterest}
                      onChange={(e) =>
                        setFormData({ ...formData, programInterest: e.target.value })
                      }
                      className={inputClass}
                    >
                      {!LILISARE_SERVICES.some((s) => s.name === formData.programInterest) && (
                        <option value={formData.programInterest}>{formData.programInterest}</option>
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
                    Hours & Start Date
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={0}
                      max={168}
                      value={formData.hoursPerWeek}
                      onChange={(e) =>
                        setFormData({ ...formData, hoursPerWeek: Number(e.target.value) })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={formData.targetStartDate}
                      onChange={(e) =>
                        setFormData({ ...formData, targetStartDate: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Referral Source & Coordinator Assignment */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3D6B22]" />
                <span>Referral Source & Coordinator</span>
              </h3>
              <button
                type="button"
                onClick={onOpenAssignCoordinator}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#3D6B22]" />
                <span>Assign Staff</span>
              </button>
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">Assigned Coordinator</span>
                  <span className="text-sm font-bold text-slate-900">
                    {inquiry.referralInfo.assignedCoordinator.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Service Branch</span>
                  <span className="text-sm font-semibold text-slate-800">{inquiry.branch}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Referral Source</span>
                  <span className="text-sm font-semibold text-slate-800">{inquiry.source}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Referring Org</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {inquiry.referralInfo.organization || "Direct Intake"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">Urgency Tier</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      inquiry.urgency === "Urgent" || inquiry.urgency === "Immediate"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {inquiry.urgency}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Coordinator & Branch
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.coordinatorName}
                      onChange={(e) =>
                        setFormData({ ...formData, coordinatorName: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Source & Org
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                    <select
                      value={formData.source}
                      onChange={(e) =>
                        setFormData({ ...formData, source: e.target.value as ReferralSourceType })
                      }
                      className={inputClass}
                    >
                      <option value="Website">Website</option>
                      <option value="Phone">Phone</option>
                      <option value="Referral">Referral</option>
                      <option value="Case Manager">Case Manager</option>
                      <option value="Hospital Discharge">Hospital Discharge</option>
                      <option value="Physician">Physician</option>
                      <option value="Community Partner">Community Partner</option>
                      <option value="Word of Mouth">Word of Mouth</option>
                    </select>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData({ ...formData, organization: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Urgency & Contact
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                    <select
                      value={formData.urgency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          urgency: e.target.value as InquiryRecord["urgency"],
                        })
                      }
                      className={inputClass}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Immediate">Immediate</option>
                    </select>
                    <select
                      value={formData.preferredContactMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferredContactMethod: e.target.value as ContactMethod,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="Phone">Phone</option>
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="In-Person">In-Person</option>
                    </select>
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
