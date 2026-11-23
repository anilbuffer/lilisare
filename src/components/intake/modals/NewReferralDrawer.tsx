"use client";

import React, { useState } from "react";
import { InquiryRecord, ContactMethod, ReferralSourceType } from "@/types/intake";
import { LILISARE_SERVICES } from "@/lib/services";
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  Users,
  Building2,
  Heart,
  FileCheck,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface NewReferralDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newInquiry: InquiryRecord) => void;
}

export function NewReferralDrawer({
  isOpen,
  onClose,
  onSubmit,
}: NewReferralDrawerProps) {
  const [step, setStep] = useState<number>(1);

  // Form State - Step 1: Family & Contact Details
  const [primaryContact, setPrimaryContact] = useState("");
  const [contactRelationship, setContactRelationship] = useState("Daughter");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<ContactMethod>("Phone");
  const [bestTimeToCall, setBestTimeToCall] = useState("Mornings (9am - 12pm)");

  // Form State - Step 2: Client & Household Details
  const [clientName, setClientName] = useState("");
  const [clientAge, setClientAge] = useState<string>("75");
  const [clientGender, setClientGender] = useState("Female");
  const [householdAddress, setHouseholdAddress] = useState("");
  const [householdCity, setHouseholdCity] = useState("Atlanta");
  const [householdZip, setHouseholdZip] = useState("30305");
  const [branch, setBranch] = useState("North Metro Branch");
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverRelationship, setCaregiverRelationship] = useState("");

  // Form State - Step 3: Referral & Care Requirements
  const [referralSource, setReferralSource] = useState<ReferralSourceType>("Website");
  const [organization, setOrganization] = useState("");
  const [caseManagerName, setCaseManagerName] = useState("");
  const [caseManagerAgency, setCaseManagerAgency] = useState("");
  const [programInterest, setProgramInterest] = useState("IHSS (In-Home Support Services)");
  const [careTypes, setCareTypes] = useState<string[]>(["Family Caregiver", "IHSS (In-Home Support Services)"]);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(20);
  const [supportNotes, setSupportNotes] = useState("");

  // Form State - Step 4: Assignment & Submission
  const [assignedCoordinator, setAssignedCoordinator] = useState("Sarah Jenkins");
  const [urgency, setUrgency] = useState<"Normal" | "Urgent">("Normal");

  if (!isOpen) return null;

  const handleToggleCareType = (type: string) => {
    if (careTypes.includes(type)) {
      setCareTypes(careTypes.filter((t) => t !== type));
    } else {
      setCareTypes([...careTypes, type]);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!primaryContact.trim()) {
        toast.error("Please enter the primary contact name");
        return;
      }
      if (!phone.trim() && !email.trim()) {
        toast.error("Please enter a phone number or email");
        return;
      }
    } else if (step === 2) {
      if (!clientName.trim()) {
        toast.error("Please enter the person needing care (Client name)");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const randomId = `INQ-${Math.floor(1043 + Math.random() * 50)}`;
    const familyTitle = clientName ? `The ${clientName.split(" ").slice(-1)[0]} Family` : `The ${primaryContact.split(" ").slice(-1)[0]} Family`;

    const newRecord: InquiryRecord = {
      id: randomId,
      familyName: familyTitle,
      stage: "New Lead",
      dateReceived: "Just now",
      dateReceivedRaw: new Date().toISOString(),
      source: referralSource,
      branch: branch,
      urgency: urgency,
      familyInfo: {
        primaryContact: primaryContact || "Primary Contact",
        relationship: contactRelationship,
        phone: phone || "(404) 555-0100",
        email: email || "contact@family.com",
        preferredContactMethod: preferredContactMethod,
        bestTimeToCall: bestTimeToCall,
        householdLocation: {
          address: householdAddress || "Peachtree Rd NE",
          city: householdCity || "Atlanta",
          state: "GA",
          zip: householdZip || "30305",
          branch: branch,
        },
        clientInfo: {
          name: clientName || "Client Name",
          age: parseInt(clientAge, 10) || 75,
          relationship: contactRelationship === "Self" ? "Self" : "Family Member",
          gender: clientGender,
        },
        potentialCaregiver: caregiverName
          ? {
            name: caregiverName,
            relationship: caregiverRelationship || "Family Member",
            classificationInterest: "W-2",
          }
          : undefined,
      },
      referralInfo: {
        source: referralSource,
        organization: organization || "Direct Intake",
        caseManager: caseManagerName
          ? {
            name: caseManagerName,
            agency: caseManagerAgency || organization,
          }
          : undefined,
        dateReceived: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        assignedCoordinator: {
          name: assignedCoordinator,
          role: "Intake Coordinator",
          avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
          email: `${assignedCoordinator.toLowerCase().replace(" ", ".")}@lilisare.com`,
        },
      },
      careRequirements: {
        careType: careTypes.length > 0 ? careTypes : ["Personal Care"],
        supportRequirements: supportNotes || "Initial care inquiry received. Awaiting complete discovery and assessment.",
        preferredLocation: `${householdCity} Residence`,
        programInterest: programInterest,
        hoursPerWeek: hoursPerWeek,
        targetStartDate: "Within 2 weeks",
      },
      documents: [
        { id: "doc-new-1", name: "Intake Discovery Assessment", status: "Missing", required: true },
        { id: "doc-new-2", name: "Release of Information Consent", status: "Missing", required: true },
        { id: "doc-new-3", name: "Insurance / Medicaid Card", status: "Missing", required: true },
      ],
      missingInformation: [
        "First contact call required",
        "Clinical DMA-6 / physician order verification",
      ],
      assessmentStatus: "Not Scheduled",
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: "system",
          author: "Admin User",
          timestamp: "Just now",
          title: "New Referral Created",
          details: `Inquiry recorded and assigned to ${assignedCoordinator}. Stage initialized to New Lead.`,
        },
      ],
    };

    onSubmit(newRecord);
    toast.success(`Referral ${randomId} successfully created!`);
    onClose();
  };

  const steps = [
    { num: 1, title: "Family & Contact", icon: User },
    { num: 2, title: "Client & Household", icon: Users },
    { num: 3, title: "Care & Referral", icon: Heart },
    { num: 4, title: "Review & Submit", icon: FileCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FFFFFF] h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-[#D5DFDA] bg-[#F7F9F8] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E3F1D9] text-[#1E5622]">
                New Inquiry
              </span>
              <h2 className="text-lg font-bold text-[#111C16]">
                New Family Referral
              </h2>
            </div>
            <p className="text-xs text-[#4A5D52] mt-0.5">
              4-step guided intake: from family inquiry to qualified onboarding
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#D5DFDA] flex items-center justify-center text-[#74877C] hover:text-[#111C16] hover:bg-[#EEF2F0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 py-3 bg-[#FFFFFF] border-b border-[#D5DFDA]">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((s) => {
              const Icon = s.icon;
              const isDone = s.num < step;
              const isCurrent = s.num === step;

              return (
                <div key={s.num} className="flex flex-col items-center text-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isDone
                      ? "bg-[#3D6B22] text-white"
                      : isCurrent
                        ? "bg-[#3D6B22] text-white ring-4 ring-[#3D6B22]/15"
                        : "bg-[#F7F9F8] text-[#74877C] border border-[#D5DFDA]"
                      }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium truncate max-w-full ${isCurrent ? "text-[#3D6B22] font-bold" : "text-[#74877C]"
                      }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {/* STEP 1: Family & Contact Details */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-[#D5DFDA]/60 pb-2">
                <h3 className="text-sm font-bold text-[#111C16]">
                  1. Family & Contact Details
                </h3>
                <p className="text-xs text-[#4A5D52]">
                  Who is the primary person contacting LiliSare on behalf of the family?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Primary Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Miller-Jenkins"
                    value={primaryContact}
                    onChange={(e) => setPrimaryContact(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16] focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Relationship to Client
                  </label>
                  <select
                    value={contactRelationship}
                    onChange={(e) => setContactRelationship(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16] focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                  >
                    <option value="Daughter">Daughter</option>
                    <option value="Son">Son</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Legal Guardian / POA">Legal Guardian / POA</option>
                    <option value="Self">Self (Client)</option>
                    <option value="Case Manager">Case Manager</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(404) 555-0182"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16] focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="family.contact@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16] focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Preferred Contact Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Phone", "Email", "SMS"] as ContactMethod[]).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPreferredContactMethod(method)}
                        className={`py-2 text-xs font-medium rounded-xl border text-center transition-all ${preferredContactMethod === method
                          ? "bg-[#3D6B22] text-white border-[#3D6B22]"
                          : "bg-[#F7F9F8] text-[#4A5D52] border-[#D5DFDA] hover:bg-[#FFFFFF]"
                          }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Best Time to Reach
                  </label>
                  <select
                    value={bestTimeToCall}
                    onChange={(e) => setBestTimeToCall(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16] focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                  >
                    <option value="Mornings (9am - 12pm)">Mornings (9am - 12pm)</option>
                    <option value="Afternoons (1pm - 4pm)">Afternoons (1pm - 4pm)</option>
                    <option value="Evenings (5pm - 8pm)">Evenings (5pm - 8pm)</option>
                    <option value="Anytime">Anytime during business hours</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Client & Household Details */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-[#D5DFDA]/60 pb-2">
                <h3 className="text-sm font-bold text-[#111C16]">
                  2. Client & Household Details
                </h3>
                <p className="text-xs text-[#4A5D52]">
                  Who is the individual receiving care, and where is the home located?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Client Full Name (Care Recipient) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Miller"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16] focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="115"
                    value={clientAge}
                    onChange={(e) => setClientAge(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16] focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Household Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="1428 Peachtree Hills Cir NE"
                    value={householdAddress}
                    onChange={(e) => setHouseholdAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16] focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Atlanta"
                    value={householdCity}
                    onChange={(e) => setHouseholdCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16] focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    placeholder="30305"
                    value={householdZip}
                    onChange={(e) => setHouseholdZip(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16] focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Branch Assignment
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16] focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                  >
                    <option value="North Metro Branch">North Metro Branch</option>
                    <option value="South County Branch">South County Branch</option>
                  </select>
                </div>

                <div className="sm:col-span-3 pt-2 border-t border-[#D5DFDA]/60">
                  <span className="text-xs font-bold text-[#111C16] block">
                    Potential In-Home Caregiver (Optional)
                  </span>
                  <p className="text-[11px] text-[#4A5D52] mb-2">
                    Does a family member intend to provide care under Structured Family Caregiving (SFC)?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Caregiver Name (e.g. Clara Jenkins)"
                      value={caregiverName}
                      onChange={(e) => setCaregiverName(e.target.value)}
                      className="px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
                    />
                    <input
                      type="text"
                      placeholder="Relationship (e.g. Granddaughter)"
                      value={caregiverRelationship}
                      onChange={(e) => setCaregiverRelationship(e.target.value)}
                      className="px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Referral & Care Requirements */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-[#D5DFDA]/60 pb-2">
                <h3 className="text-sm font-bold text-[#111C16]">
                  3. Referral & Care Requirements
                </h3>
                <p className="text-xs text-[#4A5D52]">
                  How did they find LiliSare, and what support services are required?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Referral Source
                  </label>
                  <select
                    value={referralSource}
                    onChange={(e) => setReferralSource(e.target.value as ReferralSourceType)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
                  >
                    <option value="Website">Website / Online Form</option>
                    <option value="Phone">Phone Inquiry</option>
                    <option value="Referral">Community / Senior Center</option>
                    <option value="Case Manager">Case Manager / Area Agency</option>
                    <option value="Hospital Discharge">Hospital Discharge</option>
                    <option value="Physician">Physician / Clinic</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Referring Organization / Partner
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Emory Hospital, Fulton County Office of Aging"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Case Manager (if known)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Janice Campbell, LCSW"
                    value={caseManagerName}
                    onChange={(e) => setCaseManagerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Payer / Program Interest
                  </label>
                  <select
                    value={programInterest}
                    onChange={(e) => setProgramInterest(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
                  >
                    {LILISARE_SERVICES.map((svc) => (
                      <option key={svc.id} value={svc.name}>
                        {svc.order}. {svc.name} ({svc.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#111C16]">
                      Requested Care Services ({careTypes.length})
                    </label>
                    {careTypes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCareTypes([])}
                        className="text-[11px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                    {LILISARE_SERVICES.map((svc) => {
                      const isSelected = careTypes.includes(svc.name);
                      return (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => handleToggleCareType(svc.name)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${isSelected
                            ? "bg-[#3D6B22] text-white border-[#3D6B22]"
                            : "bg-[#F7F9F8] text-[#4A5D52] border-[#D5DFDA] hover:bg-[#FFFFFF]"
                            }`}
                        >
                          <span className="text-[10px] opacity-70 mr-1">{svc.order}.</span>
                          {svc.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Requested Hours / Week
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="80"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(parseInt(e.target.value, 10) || 20)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Care Requirements & Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe specific mobility issues, medical conditions, or family scheduling preferences..."
                    value={supportNotes}
                    onChange={(e) => setSupportNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-[#D5DFDA]/60 pb-2">
                <h3 className="text-sm font-bold text-[#111C16]">
                  4. Review & Assign Intake Coordinator
                </h3>
                <p className="text-xs text-[#4A5D52]">
                  Verify the information before creating the active inquiry record.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-xl border border-[#D5DFDA] bg-[#F7F9F8] space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#4A5D52] block text-[11px]">Primary Contact:</span>
                    <strong className="text-[#111C16]">{primaryContact || "N/A"}</strong> ({contactRelationship})
                    <span className="block text-[11px] text-[#74877C]">{phone} · {email}</span>
                  </div>

                  <div>
                    <span className="text-[#4A5D52] block text-[11px]">Client Needing Care:</span>
                    <strong className="text-[#111C16]">{clientName || "N/A"}</strong> (Age {clientAge})
                    <span className="block text-[11px] text-[#74877C]">{householdCity}, GA</span>
                  </div>

                  <div>
                    <span className="text-[#4A5D52] block text-[11px]">Referral Source:</span>
                    <strong className="text-[#111C16]">{referralSource}</strong>
                    {organization && <span className="block text-[11px] text-[#74877C]">{organization}</span>}
                  </div>

                  <div>
                    <span className="text-[#4A5D52] block text-[11px]">Program & Hours:</span>
                    <strong className="text-[#111C16]">{programInterest}</strong>
                    <span className="block text-[11px] text-[#74877C]">{hoursPerWeek} hrs / week</span>
                  </div>
                </div>

                {caregiverName && (
                  <div className="pt-2 border-t border-[#D5DFDA]/60 text-xs">
                    <span className="text-[#4A5D52] block text-[11px]">Potential Family Caregiver:</span>
                    <span className="font-semibold text-[#111C16]">{caregiverName} ({caregiverRelationship})</span>
                  </div>
                )}
              </div>

              {/* Assignment Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Assign Coordinator *
                  </label>
                  <select
                    value={assignedCoordinator}
                    onChange={(e) => setAssignedCoordinator(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
                  >
                    <option value="Sarah Jenkins">Sarah Jenkins (Senior Intake Lead)</option>
                    <option value="Elena Rostova">Elena Rostova (Intake Coordinator)</option>
                    <option value="Marcus Vance">Marcus Vance (Intake Specialist)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111C16] block mb-1">
                    Priority Level
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as "Normal" | "Urgent")}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D5DFDA] rounded-xl text-[#111C16]"
                  >
                    <option value="Normal">Normal Priority</option>
                    <option value="Urgent">Urgent Priority (Hospital discharge / immediate)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#D5DFDA] bg-[#F7F9F8] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#111C16] bg-[#FFFFFF] hover:bg-[#EEF2F0] border border-[#D5DFDA] rounded-xl transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-[#4A5D52] hover:text-[#111C16] transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#2C5217] rounded-xl transition-colors cursor-pointer"
            >
              <span>Continue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#2C5217] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Create Inquiry Record</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
